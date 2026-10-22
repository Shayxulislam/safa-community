import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_ANON_KEY')!;
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, options);
const emailFor = (type: string) => `${type}@staff.safa-community.invalid`;
const client = (token?: string) => createClient(url, key, {
  ...options, ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {})
});
class Failure extends Error { constructor(public status: number, message: string) { super(message); } }
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
const isType = (value: unknown): value is 'owner' | 'admin' => value === 'owner' || value === 'admin';
const passwordValid = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 128;

async function sessionFor(token: string) {
  const caller = client(token);
  const { data: identity, error: authError } = await caller.auth.getUser(token);
  if (authError && (!authError.status || authError.status >= 500)) throw new Failure(503, 'Authentication is temporarily unavailable.');
  if (authError || !identity.user) throw new Failure(401, 'Please sign in again.');
  const { data: user, error } = await caller.rpc('safa_staff_session');
  if (error && !['28000', 'PGRST301'].includes(error.code)) throw new Failure(503, 'Session verification is temporarily unavailable.');
  if (error || !user) throw new Failure(401, 'Please sign in again.');
  return { caller, user };
}
async function allowance(bucket: string, maximum: number, seconds = 900) {
  const { data, error } = await admin.rpc('safa_auth_attempt', { bucket_key: bucket, maximum, seconds });
  if (error) throw new Failure(503, 'Authentication is temporarily unavailable.');
  if (!data) throw new Failure(429, 'Too many attempts. Please try again in 15 minutes.');
}
async function signIn(type: string, password: string) {
  return client().auth.signInWithPassword({ email: emailFor(type), password });
}
async function discard(token?: string) {
  if (token) await admin.auth.admin.signOut(token, 'local');
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);
    if (Number(req.headers.get('content-length') || 0) > 8192) return reply({ error: 'Request too large.' }, 413);
    const text = await req.text();
    if (text.length > 8192) return reply({ error: 'Request too large.' }, 413);
    let body;
    try { body = JSON.parse(text || '{}'); } catch { throw new Failure(400, 'Invalid request.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Failure(400, 'Invalid request.');
    const action = new URL(req.url).pathname.split('/').pop();

    if (action === 'login') {
      if (!isType(body.adminType) || !passwordValid(body.password)) throw new Failure(400, 'Select Owner or Admin and enter its password.');
      // The account bucket cannot be bypassed by spoofing an IP header.
      await allowance(`login:${body.adminType}`, 100);
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip)));
      await allowance(`login-ip:${Array.from(hash).map(v => v.toString(16).padStart(2, '0')).join('')}`, 30);
      const { data, error } = await signIn(body.adminType, body.password);
      if (error || !data.session) {
        if (error?.status === 429) throw new Failure(429, 'Too many attempts. Try again later.');
        if (error && error.status && error.status >= 500) throw new Failure(503, 'Authentication is temporarily unavailable.');
        throw new Failure(401, 'Incorrect admin type or password.');
      }
      try {
        const { user } = await sessionFor(data.session.access_token);
        if (user.adminType !== body.adminType) throw new Failure(403, 'Staff access required.');
        return reply({ user, session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token, expires_in: data.session.expires_in } });
      } catch (error) { await discard(data.session.access_token); throw error; }
    }

    if (action === 'refresh') {
      if (typeof body.refreshToken !== 'string' || body.refreshToken.length > 2048) throw new Failure(401, 'Please sign in again.');
      const { data, error } = await client().auth.refreshSession({ refresh_token: body.refreshToken });
      if (error || !data.session) throw new Failure(error?.status && error.status >= 500 ? 503 : 401, 'Please sign in again.');
      const { user } = await sessionFor(data.session.access_token);
      return reply({ user, session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token, expires_in: data.session.expires_in } });
    }

    const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) throw new Failure(401, 'Please sign in again.');
    const { caller, user } = await sessionFor(token);
    if (action === 'session') return reply({ user });
    if (action === 'logout') {
      const { error } = await admin.auth.admin.signOut(token, 'local');
      if (error) throw new Failure(503, 'Sign-out failed. Please retry.');
      return reply({ success: true });
    }
    if (action === 'accounts') {
      if (user.adminType !== 'owner') throw new Failure(403, 'Owner access required.');
      const { data, error } = await caller.rpc('safa_staff_directory');
      if (error) throw new Failure(503, 'Could not load staff accounts.');
      return reply({ users: data });
    }
    if (action === 'password') {
      const targetType = body.targetType ?? user.adminType;
      if (!isType(targetType)) throw new Failure(400, 'Select Owner or Admin.');
      if (user.adminType !== 'owner' && targetType !== user.adminType) throw new Failure(403, 'Only Owner can change the Owner password.');
      await allowance(`password:${user.id}`, 10);
      if (!passwordValid(body.currentPassword) || !passwordValid(body.newPassword) || body.newPassword.length < 10) {
        throw new Failure(400, 'Use a new password between 10 and 128 characters.');
      }
      if (body.newPassword !== body.confirmPassword) throw new Failure(400, 'New passwords do not match.');
      const proof = await signIn(user.adminType, body.currentPassword);
      if (proof.error || !proof.data.session) throw new Failure(proof.error?.status && proof.error.status >= 500 ? 503 : 400, 'Current password is incorrect.');
      await discard(proof.data.session.access_token);
      const targetCheck = await signIn(targetType, body.newPassword);
      if (targetCheck.data.session) { await discard(targetCheck.data.session.access_token); throw new Failure(400, 'Choose a different new password.'); }
      if (targetCheck.error?.code !== 'invalid_credentials') throw new Failure(503, 'Could not validate the new password. Try again later.');
      const otherCheck = await signIn(targetType === 'owner' ? 'admin' : 'owner', body.newPassword);
      if (otherCheck.data.session) { await discard(otherCheck.data.session.access_token); throw new Failure(400, 'Owner and Admin must have different passwords.'); }
      if (otherCheck.error?.code !== 'invalid_credentials') throw new Failure(503, 'Could not validate the new password. Try again later.');
      let targetId = user.id;
      if (targetType !== user.adminType) {
        const { data, error } = await caller.rpc('safa_staff_directory');
        const target = data?.find((account: { adminType: string }) => account.adminType === targetType);
        if (error || !target) throw new Failure(503, 'Staff account unavailable.');
        targetId = target.id;
      }
      const { error: revokeError } = await caller.rpc('safa_revoke_staff_sessions', { target_type: targetType });
      if (revokeError) throw new Failure(503, 'Could not revoke sessions. Password was not changed.');
      const { error: updateError } = await admin.auth.admin.updateUserById(targetId, { password: body.newPassword });
      if (updateError) throw new Failure(503, 'Sessions ended, but the password could not be changed. Sign in and retry.');
      // Also end any session created concurrently between the initial revocation
      // and the native Auth password update. Use the supported Auth Admin API.
      const fresh = await signIn(targetType, body.newPassword);
      if (fresh.error || !fresh.data.session) throw new Failure(503, 'Password changed, but final session revocation could not finish. Contact the project administrator.');
      const { error: signOutError } = await admin.auth.admin.signOut(fresh.data.session.access_token, 'global');
      if (signOutError) throw new Failure(503, 'Password changed, but final session revocation could not finish. Contact the project administrator.');
      return reply({ success: true, signedOut: targetType === user.adminType });
    }
    throw new Failure(404, 'Unknown authentication action.');
  } catch (error) {
    if (error instanceof Failure) return reply({ error: error.message }, error.status);
    console.error('Staff auth operation failed'); // Never log credentials or tokens.
    return reply({ error: 'Authentication is temporarily unavailable.' }, 503);
  }
});
