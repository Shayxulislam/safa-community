import { Router, type Request, type Response } from 'express';

// These are public project identifiers. Privileged keys stay inside Supabase Edge Functions.
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://esekwdgunftouzkcrqlx.supabase.co';
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n_Um54u3J2Zp7d-KBIWchQ_iYv_qRKy';
type Session = { access_token: string; refresh_token: string; expires_in: number };
type StaffUser = { id: string; role: 'super_admin' | 'admin'; adminType: 'owner' | 'admin'; status: 'active' };
type AuthResult = { user: StaffUser; session?: Session; users?: StaffUser[]; signedOut?: boolean };
export class AuthError extends Error { constructor(public status: number, message: string) { super(message); } }

export function readCookies(header = ''): Record<string, string> {
  const values: Record<string, string> = {};
  for (const part of header.split(';')) {
    const at = part.indexOf('=');
    if (at < 0) continue;
    try { values[part.slice(0, at).trim()] = decodeURIComponent(part.slice(at + 1).trim()); } catch { /* Ignore malformed cookies. */ }
  }
  return values;
}
function setCookies(res: Response, session?: Session, secure = false) {
  const flags = `Path=/api/v1/admin; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', [
    `safa_access=${session ? encodeURIComponent(session.access_token) : ''}; Max-Age=${session ? session.expires_in : 0}; ${flags}`,
    `safa_refresh=${session ? encodeURIComponent(session.refresh_token) : ''}; Max-Age=${session ? 86400 * 7 : 0}; ${flags}`
  ]);
}
export function sameOrigin(req: Pick<Request, 'get' | 'protocol'>): boolean {
  const origin = req.get('origin');
  const site = req.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  if (!origin) return true; // Non-browser clients must still possess a valid session.
  try { return new URL(origin).origin === `${req.protocol}://${req.get('host')}`; } catch { return false; }
}
export function createSupabaseStaffRouter(fetcher: typeof fetch = fetch) {
  const router = Router();
  const secure = (req: Request) => req.secure || process.env.VERCEL === '1';
  const call = async (action: string, body: unknown, token?: string): Promise<AuthResult> => {
    let response: globalThis.Response;
    try {
      response = await fetcher(`${SUPABASE_URL}/functions/v1/safa-staff-auth/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: publicKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body), signal: AbortSignal.timeout(20000)
      });
    } catch { throw new AuthError(503, 'Authentication is temporarily unavailable. Please retry.'); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new AuthError(response.status, data.error || 'Authentication request failed.');
    return data;
  };
  // Every request validates a live Supabase session; role fields from the browser are ignored.
  const signedIn = async (req: Request, res: Response) => {
    const cookies = readCookies(req.headers.cookie);
    if (cookies.safa_access) {
      try { return { ...(await call('session', {}, cookies.safa_access)), token: cookies.safa_access }; }
      catch (error) { if (!(error instanceof AuthError) || error.status !== 401) throw error; }
    }
    if (!cookies.safa_refresh) throw new AuthError(401, 'Please sign in again.');
    const result = await call('refresh', { refreshToken: cookies.safa_refresh });
    if (!result.session) throw new AuthError(503, 'Invalid authentication response.');
    setCookies(res, result.session, secure(req));
    return { ...result, token: result.session.access_token };
  };
  router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Cookie');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !sameOrigin(req)) return res.status(403).json({ error: 'Same-origin request required.' });
    next();
  });
  const route = (fn: (req: Request, res: Response) => Promise<unknown>) => async (req: Request, res: Response) => {
    try { await fn(req, res); }
    catch (error) {
      const status = error instanceof AuthError ? error.status : 503;
      if (status === 401) setCookies(res, undefined, secure(req));
      res.status(status).json({ error: error instanceof AuthError ? error.message : 'Authentication is temporarily unavailable.' });
    }
  };
  router.post('/auth/login', route(async (req, res) => {
    const { adminType, password } = req.body || {};
    if (!['owner', 'admin'].includes(adminType) || typeof password !== 'string' || !password || password.length > 128) throw new AuthError(400, 'Select Owner or Admin and enter its password.');
    const result = await call('login', { adminType, password });
    if (!result.session) throw new AuthError(503, 'Invalid authentication response.');
    // Switching types ends this browser's previous session, too.
    const previous = readCookies(req.headers.cookie).safa_access;
    if (previous) { try { await call('logout', {}, previous); } catch { /* Old session may already have expired. */ } }
    setCookies(res, result.session, secure(req));
    res.json({ user: result.user });
  }));
  router.get('/auth/session', route(async (req, res) => { const { user } = await signedIn(req, res); res.json({ user }); }));
  router.post('/auth/change-password', route(async (req, res) => {
    const { token } = await signedIn(req, res);
    const result = await call('password', req.body, token);
    if (result.signedOut) setCookies(res, undefined, secure(req));
    res.json({ success: true, signedOut: result.signedOut });
  }));
  router.post('/auth/logout', route(async (req, res) => {
    try { const { token } = await signedIn(req, res); await call('logout', {}, token); }
    catch (error) { if (!(error instanceof AuthError) || error.status !== 401) throw error; }
    setCookies(res, undefined, secure(req)); res.json({ success: true });
  }));
  router.get('/accounts', route(async (req, res) => {
    const { user, token } = await signedIn(req, res);
    if (user.adminType !== 'owner') throw new AuthError(403, 'Owner access required.');
    const result = await call('accounts', {}, token); res.json({ users: result.users });
  }));
  router.get('/summary', route(async (req, res) => { await signedIn(req, res); res.json({ activeAccounts: 2, pendingInvitations: 0 }); }));
  router.use(route(async (req, res) => {
    await signedIn(req, res);
    res.status(410).json({ error: 'Individual accounts and invitations were replaced by Owner/Admin access. Use Security to change passwords.' });
  }));
  return router;
}
