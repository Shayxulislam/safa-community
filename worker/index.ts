import { createClient } from '@supabase/supabase-js';
import { Hono, type Context } from 'hono';

type WorkerBindings = CloudflareBindings & {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_ID?: string;
  TELEGRAM_CHAT_ID?: string;
};

type AppEnvironment = { Bindings: WorkerBindings };
type StaffUser = {
  id: string;
  role: 'super_admin' | 'admin';
  adminType: 'owner' | 'admin';
  status: 'active';
};
type Tokens = { access_token: string; refresh_token: string; expires_in: number };
type StaffSession = { user: StaffUser; accessToken: string; rotated?: Tokens };
type JsonRecord = Record<string, unknown>;

class ApiFailure extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

const app = new Hono<AppEnvironment>();
const MAX_BODY_BYTES = 16_384;
const MAX_RECORD_BYTES = 128_000;

const BACKUP_COLLECTIONS: Record<string, string> = {
  safa_articles: 'articles',
  safa_videos: 'videos',
  safa_photo_albums: 'photo_albums',
  safa_media_assets: 'media_assets',
  safa_announcements: 'announcements',
  safa_impact_stats: 'impact_statistics',
  safa_programs: 'programs',
  safa_work_items: 'work_items',
  safa_stories: 'stories',
  safa_history: 'history_entries',
  safa_contributions: 'contributions',
  safa_reports: 'transparency_reports',
  safa_events: 'events',
  safa_donation_campaigns: 'donation_campaigns',
  safa_social_links: 'social_links',
  safa_founder_profile: 'founder_profile',
  safa_bank_config: 'bank_config',
  safa_audit_logs: 'audit_logs',
  safa_story_editor_draft: 'story_drafts'
};

const PUBLIC_CONTENT_COLLECTIONS: Record<string, (record: JsonRecord, status: unknown) => boolean> = {
  articles: (record, status) => status === 'published' && (record.status === 'published' || record.workflowStatus === 'published'),
  announcements: (record, status) => status === null && record.active === true,
  impact_statistics: (_record, status) => status === null,
  programs: (record, status) => status === record.status && ['active', 'upcoming', 'completed'].includes(String(status)),
  work_items: (record, status) => (status === 'published' || status === 'verified') &&
    (record.workflowStatus === 'published' || record.status === 'published') && record.verificationStatus === 'verified',
  stories: (record, status) => status === 'published' && (record.workflowStatus === 'published' || record.status === 'published'),
  history_entries: (_record, status) => status === null,
  transparency_reports: (_record, status) => status === null,
  events: (record, status) => status === record.status && ['upcoming', 'ongoing', 'completed'].includes(String(status)),
  donation_campaigns: (record, status) => status === 'active' && record.status === 'active',
  social_links: (record, status) => status === null && record.enabled === true,
  founder_profile: (_record, status) => status === null,
  bank_config: (_record, status) => status === null
};

const PUBLIC_CONTENT_FIELDS: Record<string, string[]> = {
  articles: ['id', 'slug', 'title', 'excerpt', 'content', 'coverImage', 'galleryImages', 'videoUrl', 'author', 'authorRole', 'category', 'tags', 'location', 'date', 'publishedAt', 'seoTitle', 'seoDescription', 'status'],
  announcements: ['id', 'title', 'message', 'type', 'active', 'linkText', 'linkUrl', 'startDate', 'endDate', 'createdAt'],
  impact_statistics: ['id', 'metric', 'value', 'label', 'description', 'period', 'verifiedAt', 'isReal'],
  programs: ['id', 'title', 'category', 'description', 'longDescription', 'status', 'location', 'peopleHelped', 'image', 'ctaText', 'ctaLink'],
  work_items: ['id', 'slug', 'title', 'summary', 'description', 'coverImage', 'category', 'location', 'eventDate', 'supportedCommunity', 'status', 'verificationStatus', 'contributionAmount', 'currency', 'reportUrl', 'videoUrl', 'impactSummary', 'resourcesUsed', 'gallery', 'publishedAt', 'verifiedAt'],
  stories: ['id', 'title', 'summary', 'body', 'coverImage', 'category', 'author', 'date', 'consentStatus', 'publishedAt', 'status'],
  history_entries: ['id', 'year', 'date', 'title', 'description', 'image', 'verifiedImpact', 'impactStat'],
  transparency_reports: ['id', 'title', 'category', 'year', 'fileUrl', 'fileSize', 'publishedAt', 'summary'],
  events: ['id', 'slug', 'title', 'description', 'date', 'time', 'location', 'coverImage', 'gallery', 'registrationUrl', 'registrationInfo', 'category', 'status', 'createdAt'],
  donation_campaigns: ['id', 'title', 'description', 'targetAmount', 'goalAmount', 'raisedAmount', 'currency', 'coverImage', 'category', 'status', 'bankInstructions', 'qrCodeUrl', 'cardPaymentNote', 'createdAt'],
  social_links: ['id', 'platform', 'title', 'url', 'description', 'handle', 'enabled', 'displayOrder', 'icon'],
  founder_profile: ['id', 'name', 'title', 'organization', 'quote', 'biography', 'imageUrl', 'linkedinUrl', 'telegramUrl', 'email', 'mission', 'vision', 'aboutText', 'role', 'image', 'bio'],
  bank_config: ['bankName', 'accountName', 'accountNumber', 'mfo', 'inn', 'currency', 'note']
};

function publicContentRecord(collection: string, record: JsonRecord, recordId: string): JsonRecord {
  const fields = PUBLIC_CONTENT_FIELDS[collection] || [];
  const visible = Object.fromEntries(fields.filter(field => record[field] !== undefined).map(field => [field, record[field]]));
  if (collection !== 'bank_config') visible.id = record.id || recordId;
  return visible;
}

const VOLUNTEER_STATUSES = ['new', 'reviewed', 'contacted', 'accepted', 'rejected', 'archived'] as const;
const MESSAGE_STATUSES = ['new', 'in_progress', 'resolved', 'archived'] as const;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, maximum: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maximum ? text : null;
}

function stringList(value: unknown, maximumItems = 20): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maximumItems) return null;
  const values = value.map(item => boundedText(item, 80));
  return values.every((item): item is string => item !== null) ? values : null;
}

async function readJsonBody(
  c: Context<AppEnvironment>,
  maximumBytes = MAX_BODY_BYTES
): Promise<{ ok: true; body: JsonRecord } | { ok: false; status: 400 | 413; error: string }> {
  if (!c.req.header('content-type')?.toLowerCase().includes('application/json')) {
    return { ok: false, status: 400, error: 'A JSON request body is required.' };
  }
  const length = Number(c.req.header('content-length') || 0);
  if (Number.isFinite(length) && length > maximumBytes) {
    return { ok: false, status: 413, error: 'Request too large.' };
  }

  const reader = c.req.raw.body?.getReader();
  if (!reader) return { ok: false, status: 400, error: 'Invalid request body.' };
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      totalBytes += chunk.value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: 'Request too large.' };
      }
      chunks.push(chunk.value);
    }
  } catch {
    return { ok: false, status: 400, error: 'Invalid request body.' };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, status: 400, error: 'Invalid request body.' };
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, status: 400, error: 'Invalid request body.' };
  }
  return isRecord(value)
    ? { ok: true, body: value }
    : { ok: false, status: 400, error: 'Invalid request body.' };
}

function supabase(env: WorkerBindings) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new ApiFailure(503, 'Supabase is not configured for this environment.');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

function privateJson(
  body: unknown,
  status = 200,
  tokens?: Tokens,
  clearCookies = false
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  if (tokens) appendAuthCookies(headers, tokens);
  else if (clearCookies) appendAuthCookies(headers);
  return new Response(JSON.stringify(body), { status, headers });
}

function appendAuthCookies(headers: Headers, tokens?: Tokens): void {
  const secure = true;
  const flags = `Path=/api/v1/admin; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
  if (!tokens) {
    headers.append('Set-Cookie', `safa_access=; Max-Age=0; ${flags}`);
    headers.append('Set-Cookie', `safa_refresh=; Max-Age=0; ${flags}`);
    return;
  }
  headers.append('Set-Cookie', `safa_access=${encodeURIComponent(tokens.access_token)}; Max-Age=${tokens.expires_in}; ${flags}`);
  headers.append('Set-Cookie', `safa_refresh=${encodeURIComponent(tokens.refresh_token)}; Max-Age=604800; ${flags}`);
}

function readCookies(header = ''): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    try {
      cookies[part.slice(0, separator).trim()] = decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      // Ignore malformed cookie values; authentication will fail closed.
    }
  }
  return cookies;
}

function isSameOrigin(c: Context<AppEnvironment>): boolean {
  if (c.req.header('sec-fetch-site') === 'cross-site') return false;
  const origin = c.req.header('origin');
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(c.req.url).origin;
  } catch {
    return false;
  }
}

async function staffAction(
  env: WorkerBindings,
  action: 'login' | 'refresh' | 'session' | 'logout' | 'accounts' | 'password',
  body: JsonRecord,
  token?: string
): Promise<JsonRecord> {
  if (!env.SUPABASE_PUBLISHABLE_KEY) {
    throw new ApiFailure(503, 'Supabase authentication is not configured for this environment.');
  }
  const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/functions/v1/safa-staff-auth/${action}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000)
    });
  } catch {
    throw new ApiFailure(503, 'Authentication is temporarily unavailable. Please retry.');
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new ApiFailure(503, 'Authentication returned an invalid response.');
  }
  if (!response.ok) {
    const error = isRecord(result) && typeof result.error === 'string'
      ? result.error
      : 'Authentication request failed.';
    throw new ApiFailure(response.status >= 500 ? 503 : response.status, error);
  }
  if (!isRecord(result)) throw new ApiFailure(503, 'Authentication returned an invalid response.');
  return result;
}

function validStaffUser(value: unknown): value is StaffUser {
  return isRecord(value) &&
    typeof value.id === 'string' &&
    (value.adminType === 'owner' || value.adminType === 'admin') &&
    (value.role === 'super_admin' || value.role === 'admin') &&
    value.status === 'active';
}

async function authenticatedStaff(c: Context<AppEnvironment>): Promise<StaffSession> {
  const cookies = readCookies(c.req.header('cookie'));
  if (!cookies.safa_access && !cookies.safa_refresh) {
    throw new ApiFailure(401, 'Please sign in again.');
  }

  if (cookies.safa_access) {
    try {
      const result = await staffAction(c.env, 'session', {}, cookies.safa_access);
      if (!validStaffUser(result.user)) throw new ApiFailure(403, 'Staff access required.');
      return { user: result.user, accessToken: cookies.safa_access };
    } catch (error) {
      if (!(error instanceof ApiFailure) || error.status !== 401) throw error;
    }
  }

  if (!cookies.safa_refresh) throw new ApiFailure(401, 'Please sign in again.');
  const refreshed = await staffAction(c.env, 'refresh', { refreshToken: cookies.safa_refresh });
  if (!validStaffUser(refreshed.user) || !isRecord(refreshed.session)) {
    throw new ApiFailure(503, 'Authentication returned an invalid session.');
  }
  const session = refreshed.session as unknown as Tokens;
  if (typeof session.access_token !== 'string' || typeof session.refresh_token !== 'string' ||
      typeof session.expires_in !== 'number') {
    throw new ApiFailure(503, 'Authentication returned an invalid session.');
  }
  return { user: refreshed.user, accessToken: session.access_token, rotated: session };
}

async function checkRateLimit(c: Context<AppEnvironment>, route: string, limit: number): Promise<boolean> {
  const address = c.req.header('cf-connecting-ip') || 'local';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${route}:${address}`));
  const bucket = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const { data, error } = await supabase(c.env)
    .rpc('safa_auth_attempt', { bucket_key: `worker:${bucket}`, maximum: limit, seconds: 60 });
  if (error) throw new ApiFailure(503, 'Request protection is temporarily unavailable.');
  return data === true;
}

function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function pageParameters(c: Context<AppEnvironment>, defaultPageSize: number) {
  const parse = (value: string | undefined, fallback: number): number | null => {
    if (value === undefined) return fallback;
    if (!/^\d+$/.test(value)) return null;
    const number = Number(value);
    return Number.isSafeInteger(number) ? number : null;
  };
  const page = parse(c.req.query('page'), 1);
  const pageSize = parse(c.req.query('pageSize'), defaultPageSize);
  if (page === null || page < 1 || pageSize === null || pageSize < 1 || pageSize > 100) {
    throw new ApiFailure(400, 'Invalid page or page size.');
  }
  return { page, pageSize, start: (page - 1) * pageSize, end: page * pageSize - 1 };
}

function searchLiteral(value: string): string {
  const pattern = `%${value.slice(0, 100).replace(/[\\%_]/g, character => `\\${character}`)}%`;
  return `"${pattern.replace(/[\\"]/g, character => `\\${character}`)}"`;
}

function safeMessage(error: unknown, message: string): never {
  const code = isRecord(error) && typeof error.code === 'string' ? error.code : 'unknown';
  console.error('Supabase operation failed', { code });
  throw new ApiFailure(503, message);
}

async function sendTelegramNotification(c: Context<AppEnvironment>, text: string): Promise<boolean> {
  const token = c.env.TELEGRAM_BOT_TOKEN;
  const chatId = c.env.TELEGRAM_ADMIN_CHAT_ID || c.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

app.use('/api/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Cache-Control', 'no-store');
});

app.post('/api/v1/admin/auth/login', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const parsed = await readJsonBody(c);
  if (parsed.ok === false) return privateJson({ error: parsed.error }, parsed.status);
  const { adminType, password } = parsed.body;
  if ((adminType !== 'owner' && adminType !== 'admin') ||
      typeof password !== 'string' || password.length < 1 || password.length > 128) {
    return privateJson({ error: 'Select Owner or Admin and enter its password.' }, 400);
  }
  if (!await checkRateLimit(c, `login:${adminType}`, 10)) {
    return privateJson({ error: 'Too many attempts. Please try again later.' }, 429);
  }
  const result = await staffAction(c.env, 'login', { adminType, password });
  if (!validStaffUser(result.user) || !isRecord(result.session)) {
    throw new ApiFailure(503, 'Authentication returned an invalid session.');
  }
  const tokens = result.session as unknown as Tokens;
  if (typeof tokens.access_token !== 'string' || typeof tokens.refresh_token !== 'string' ||
      typeof tokens.expires_in !== 'number') {
    throw new ApiFailure(503, 'Authentication returned an invalid session.');
  }
  return privateJson({ user: result.user }, 200, tokens);
});

app.get('/api/v1/admin/auth/session', async c => {
  try {
    const session = await authenticatedStaff(c);
    return privateJson({ user: session.user }, 200, session.rotated);
  } catch (error) {
    if (error instanceof ApiFailure && error.status === 401) {
      return privateJson({ error: error.message }, 401, undefined, true);
    }
    throw error;
  }
});

app.post('/api/v1/admin/auth/logout', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const cookies = readCookies(c.req.header('cookie'));
  if (cookies.safa_access) {
    try {
      await staffAction(c.env, 'logout', {}, cookies.safa_access);
    } catch (error) {
      if (!(error instanceof ApiFailure) || error.status !== 401) throw error;
    }
  }
  return privateJson({ success: true }, 200, undefined, true);
});

app.post('/api/v1/admin/auth/change-password', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const parsed = await readJsonBody(c);
  if (parsed.ok === false) return privateJson({ error: parsed.error }, parsed.status);
  const session = await authenticatedStaff(c);
  const result = await staffAction(c.env, 'password', parsed.body, session.accessToken);
  if (result.signedOut === true) return privateJson({ success: true, signedOut: true }, 200, undefined, true);
  return privateJson({ success: true, signedOut: false }, 200, session.rotated);
});

app.get('/api/v1/admin/summary', async c => {
  const session = await authenticatedStaff(c);
  return privateJson({ activeAccounts: 2, pendingInvitations: 0 }, 200, session.rotated);
});

app.get('/api/v1/admin/accounts', async c => {
  const session = await authenticatedStaff(c);
  if (session.user.adminType !== 'owner') return privateJson({ error: 'Owner access required.' }, 403);
  const result = await staffAction(c.env, 'accounts', {}, session.accessToken);
  return privateJson({ users: Array.isArray(result.users) ? result.users : [] }, 200, session.rotated);
});

app.get('/api/v1/admin/volunteers', async c => {
  const session = await authenticatedStaff(c);
  const status = c.req.query('status');
  if (status && status !== 'all' && !VOLUNTEER_STATUSES.includes(status as typeof VOLUNTEER_STATUSES[number])) {
    return privateJson({ error: 'Invalid volunteer status filter.' }, 400);
  }
  const { page, pageSize, start, end } = pageParameters(c, 25);
  const query = supabase(c.env).from('safa_volunteer_applications').select('*', { count: 'exact' });
  if (status && status !== 'all') query.eq('status', status);
  const search = c.req.query('q')?.trim();
  if (search) {
    const literal = searchLiteral(search);
    query.or(`full_name.ilike.${literal},email.ilike.${literal},phone.ilike.${literal}`);
  }
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
  if (error) safeMessage(error, 'Could not load volunteer applications.');
  const items = (data || []).map(row => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    isLegalAgeConfirmed: row.is_legal_age_confirmed,
    interests: Array.isArray(row.interests) ? row.interests : [],
    availability: row.availability,
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at
  }));
  return privateJson({ items, page, pageSize, total: count || 0 }, 200, session.rotated);
});

app.patch('/api/v1/admin/volunteers/:id', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const session = await authenticatedStaff(c);
  const parsed = await readJsonBody(c);
  if (parsed.ok === false) return privateJson({ error: parsed.error }, parsed.status);
  const status = parsed.body.status;
  const id = boundedText(c.req.param('id'), 80);
  if (!id || typeof status !== 'string' ||
      !VOLUNTEER_STATUSES.includes(status as typeof VOLUNTEER_STATUSES[number])) {
    return privateJson({ error: 'Invalid volunteer status or ID.' }, 400);
  }
  const { data, error } = await supabase(c.env).from('safa_volunteer_applications')
    .update({ status }).eq('id', id).select('id').maybeSingle();
  if (error) safeMessage(error, 'Could not update volunteer status.');
  if (!data) return privateJson({ error: 'Volunteer application not found.' }, 404);
  return privateJson({ success: true }, 200, session.rotated);
});

app.get('/api/v1/admin/messages', async c => {
  const session = await authenticatedStaff(c);
  const status = c.req.query('status');
  if (status && status !== 'all' && !MESSAGE_STATUSES.includes(status as typeof MESSAGE_STATUSES[number])) {
    return privateJson({ error: 'Invalid message status filter.' }, 400);
  }
  const { page, pageSize, start, end } = pageParameters(c, 25);
  const database = supabase(c.env);
  const query = database.from('safa_contact_messages').select('*', { count: 'exact' });
  if (status && status !== 'all') query.eq('status', status);
  const search = c.req.query('q')?.trim();
  if (search) {
    const literal = searchLiteral(search);
    query.or(`name.ilike.${literal},email.ilike.${literal},subject.ilike.${literal},message.ilike.${literal}`);
  }
  const [{ data, error, count }, newMessages] = await Promise.all([
    query.order('created_at', { ascending: false }).range(start, end),
    database.from('safa_contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new')
  ]);
  if (error) safeMessage(error, 'Could not load contact messages.');
  if (newMessages.error) safeMessage(newMessages.error, 'Could not load contact message summary.');
  const items = (data || []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  }));
  return privateJson({ items, page, pageSize, total: count || 0, newCount: newMessages.count || 0 }, 200, session.rotated);
});

app.patch('/api/v1/admin/messages/:id', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const session = await authenticatedStaff(c);
  const parsed = await readJsonBody(c);
  if (parsed.ok === false) return privateJson({ error: parsed.error }, parsed.status);
  const status = parsed.body.status;
  const id = boundedText(c.req.param('id'), 80);
  if (!id || typeof status !== 'string' ||
      !MESSAGE_STATUSES.includes(status as typeof MESSAGE_STATUSES[number])) {
    return privateJson({ error: 'Invalid message status or ID.' }, 400);
  }
  const { data, error } = await supabase(c.env).from('safa_contact_messages')
    .update({ status }).eq('id', id).select('id').maybeSingle();
  if (error) safeMessage(error, 'Could not update contact message status.');
  if (!data) return privateJson({ error: 'Contact message not found.' }, 404);
  return privateJson({ success: true }, 200, session.rotated);
});

app.delete('/api/v1/admin/messages/:id', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const session = await authenticatedStaff(c);
  const id = boundedText(c.req.param('id'), 80);
  if (!id) return privateJson({ error: 'Invalid message ID.' }, 400);
  const { data, error } = await supabase(c.env).from('safa_contact_messages')
    .delete().eq('id', id).select('id').maybeSingle();
  if (error) safeMessage(error, 'Could not delete contact message.');
  if (!data) return privateJson({ error: 'Contact message not found.' }, 404);
  return privateJson({ success: true }, 200, session.rotated);
});

app.get('/api/v1/admin/data/:collection', async c => {
  const session = await authenticatedStaff(c);
  const collection = c.req.param('collection');
  if (!Object.values(BACKUP_COLLECTIONS).includes(collection)) {
    return privateJson({ error: 'Unknown CMS collection.' }, 404);
  }
  const { page, pageSize, start, end } = pageParameters(c, 50);
  const query = supabase(c.env).from('safa_content_records')
    .select('record_id,payload,updated_at', { count: 'exact' }).eq('collection', collection);
  const search = c.req.query('q')?.trim();
  if (search) {
    const literal = searchLiteral(search);
    query.or(`title.ilike.${literal},slug.ilike.${literal}`);
  }
  const { data, error, count } = await query.order('updated_at', { ascending: false }).range(start, end);
  if (error) safeMessage(error, 'Could not load CMS records.');
  const items = (data || []).map(row => ({ id: row.record_id, payload: row.payload, updatedAt: row.updated_at }));
  return privateJson({ items, page, pageSize, total: count || 0 }, 200, session.rotated);
});

app.put('/api/v1/admin/data/:collection/:id', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const session = await authenticatedStaff(c);
  const collection = c.req.param('collection');
  const id = boundedText(c.req.param('id'), 160);
  if (!Object.values(BACKUP_COLLECTIONS).includes(collection)) {
    return privateJson({ error: 'Unknown CMS collection.' }, 404);
  }
  if (!id) return privateJson({ error: 'Invalid CMS record ID.' }, 400);
  const parsed = await readJsonBody(c, 256_000);
  if (parsed.ok === false) return privateJson({ error: parsed.error }, parsed.status);
  const record = parsed.body.record;
  if (!isRecord(record) || (record.id !== undefined && String(record.id) !== id)) {
    return privateJson({ error: 'Record ID mismatch.' }, 400);
  }
  if (new TextEncoder().encode(JSON.stringify(record)).byteLength > MAX_RECORD_BYTES) {
    return privateJson({ error: 'CMS record is too large.' }, 413);
  }
  const now = new Date().toISOString();
  const { error } = await supabase(c.env).from('safa_content_records').upsert({
    collection,
    record_id: id,
    slug: boundedText(record.slug, 200),
    title: boundedText(record.title, 200) || boundedText(record.name, 200),
    status: boundedText(record.status, 40),
    payload: record,
    updated_at: now,
    updated_by: session.user.id
  }, { onConflict: 'collection,record_id' });
  if (error) safeMessage(error, 'Could not save CMS record.');
  return privateJson({ success: true }, 200, session.rotated);
});

app.delete('/api/v1/admin/data/:collection/:id', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const session = await authenticatedStaff(c);
  const collection = c.req.param('collection');
  const id = boundedText(c.req.param('id'), 160);
  if (!Object.values(BACKUP_COLLECTIONS).includes(collection)) {
    return privateJson({ error: 'Unknown CMS collection.' }, 404);
  }
  if (!id) return privateJson({ error: 'Invalid CMS record ID.' }, 400);
  const { data, error } = await supabase(c.env).from('safa_content_records')
    .delete().eq('collection', collection).eq('record_id', id).select('record_id').maybeSingle();
  if (error) safeMessage(error, 'Could not delete CMS record.');
  if (!data) return privateJson({ error: 'CMS record not found.' }, 404);
  return privateJson({ success: true }, 200, session.rotated);
});

app.post('/api/v1/admin/data/import', async c => {
  if (!isSameOrigin(c)) return privateJson({ error: 'Same-origin request required.' }, 403);
  const session = await authenticatedStaff(c);
  const parsed = await readJsonBody(c, 4 * 1024 * 1024);
  if (parsed.ok === false) return privateJson({ error: parsed.error }, parsed.status);
  const backup = parsed.body;
  if (backup.format !== 'safa-browser-backup' || backup.version !== 1 || !isRecord(backup.collections)) {
    return privateJson({ error: 'Unsupported SAFA browser backup format.' }, 400);
  }
  const entries = Object.entries(backup.collections);
  if (!entries.length || entries.length > 32) {
    return privateJson({ error: 'The backup must contain between 1 and 32 collections.' }, 400);
  }

  const db = supabase(c.env);
  const now = new Date().toISOString();
  const cmsRows: JsonRecord[] = [];
  const volunteerRows: JsonRecord[] = [];
  const contactRows: JsonRecord[] = [];
  const importedByCollection: Record<string, number> = {};
  let totalRecords = 0;

  for (const [key, value] of entries) {
    const records = Array.isArray(value) ? value : isRecord(value) ? [value] : null;
    if (!records || !records.every(isRecord)) {
      return privateJson({ error: `Invalid records in ${key}.` }, 400);
    }
    if (totalRecords + records.length > 5000) {
      return privateJson({ error: 'The backup exceeds the 5,000-record import limit.' }, 413);
    }

    if (key === 'safa_volunteers' || key === 'safa_contacts') {
      for (const record of records) {
        const id = boundedText(record.id, 80);
        const email = boundedText(record.email, 254)?.toLowerCase();
        const createdAt = boundedText(record.createdAt, 50) || now;
        if (!id || !email || !validEmail(email)) {
          return privateJson({ error: `Invalid identifier or email in ${key}.` }, 400);
        }
        if (key === 'safa_volunteers') {
          const fullName = boundedText(record.fullName, 120);
          const phone = boundedText(record.phone ?? record.phoneOrTelegram, 40);
          const availability = boundedText(record.availability, 120) || 'Flexible';
          const interests = stringList(record.interests);
          const rawStatus = typeof record.status === 'string' ? record.status : 'new';
          const status = rawStatus === 'pending' ? 'new' : rawStatus === 'approved' ? 'accepted' : rawStatus;
          if (!fullName || !phone || !interests ||
              !VOLUNTEER_STATUSES.includes(status as typeof VOLUNTEER_STATUSES[number])) {
            return privateJson({ error: `Invalid volunteer record ${id}.` }, 400);
          }
          volunteerRows.push({
            id, full_name: fullName, email, phone,
            is_legal_age_confirmed: record.isLegalAgeConfirmed === true,
            interests, availability, message: boundedText(record.message, 1000), status, created_at: createdAt
          });
        } else {
          const name = boundedText(record.name, 120);
          const message = boundedText(record.message, 4000);
          const subject = boundedText(record.subject, 140) || 'General Inquiry';
          const status = typeof record.status === 'string' ? record.status : 'new';
          if (!name || !message || !MESSAGE_STATUSES.includes(status as typeof MESSAGE_STATUSES[number])) {
            return privateJson({ error: `Invalid contact record ${id}.` }, 400);
          }
          contactRows.push({
            id, name, email, phone: boundedText(record.phone, 40), subject, message,
            status, created_at: createdAt
          });
        }
      }
    } else {
      const collection = BACKUP_COLLECTIONS[key];
      if (!collection) {
        return privateJson({ error: `Unsupported backup collection: ${key}. Nothing was imported.` }, 400);
      }
      for (const record of records) {
        const id = boundedText(record.id, 160) || (!Array.isArray(value) ? 'singleton' : null);
        if (!id) return privateJson({ error: `A record in ${key} is missing its original ID.` }, 400);
        if (new TextEncoder().encode(JSON.stringify(record)).byteLength > MAX_RECORD_BYTES) {
          return privateJson({ error: `Record ${id} in ${key} is too large.` }, 413);
        }
        cmsRows.push({
          collection,
          record_id: id,
          slug: boundedText(record.slug, 200),
          title: boundedText(record.title, 200) || boundedText(record.name, 200),
          status: boundedText(record.status, 40),
          payload: record,
          created_at: boundedText(record.createdAt, 50) || now,
          updated_at: now,
          updated_by: session.user.id
        });
      }
    }
    importedByCollection[key] = (importedByCollection[key] || 0) + records.length;
    totalRecords += records.length;
  }

  for (let offset = 0; offset < cmsRows.length; offset += 100) {
    const { error } = await db.from('safa_content_records')
      .upsert(cmsRows.slice(offset, offset + 100), { onConflict: 'collection,record_id', ignoreDuplicates: true });
    if (error) safeMessage(error, 'Could not import CMS records.');
  }
  for (let offset = 0; offset < volunteerRows.length; offset += 100) {
    const { error } = await db.from('safa_volunteer_applications')
      .upsert(volunteerRows.slice(offset, offset + 100), { onConflict: 'id', ignoreDuplicates: true });
    if (error) safeMessage(error, 'Could not import volunteer applications.');
  }
  for (let offset = 0; offset < contactRows.length; offset += 100) {
    const { error } = await db.from('safa_contact_messages')
      .upsert(contactRows.slice(offset, offset + 100), { onConflict: 'id', ignoreDuplicates: true });
    if (error) safeMessage(error, 'Could not import contact messages.');
  }
  return privateJson({ success: true, importedByCollection, totalRecords, existingIdsSkipped: true }, 201, session.rotated);
});

app.get('/api/health', c => c.json({
  status: 'ok',
  app: 'SAFA Platform',
  timestamp: new Date().toISOString()
}));

app.get('/api/v1/info', c => c.json({
  organization: 'SAFA',
  tagline: 'Connecting Hands, Changing Lives',
  founder: 'Nargiza (Founder & CEO)',
  mission: 'Connecting hands, changing lives — connecting people who want to help with communities and individuals in need of genuine care across Uzbekistan.',
  officialEmail: 'safaauzb@gmail.com',
  socials: [
    { platform: 'telegram', url: 'https://t.me/SafaUzbekistan', title: 'Telegram Channel', handle: '@SafaUzbekistan' },
    { platform: 'instagram', url: 'https://www.instagram.com/safa_uzb_?igsi=MXd0cm5xdWF5ZnZqcA%3D%3D&utm_source=qr', title: 'Instagram', handle: '@safa_uzb_' },
    { platform: 'youtube', url: 'https://www.youtube.com/@SafaUzbekistan', title: 'YouTube Channel', handle: '@SafaUzbekistan' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/safa-uzbekistan-63080b432?utm_source=share_via&utm_content=profile&utm_medium=member_ios', title: 'LinkedIn', handle: 'safa-uzbekistan' },
    { platform: 'email', url: 'mailto:safaauzb@gmail.com', title: 'Official Email', handle: 'safaauzb@gmail.com' }
  ]
}));

app.get('/api/v1/content/:collection', async c => {
  const collection = c.req.param('collection');
  const isPublicRecord = PUBLIC_CONTENT_COLLECTIONS[collection];
  if (!isPublicRecord) return c.json({ error: 'Unknown public content collection.' }, 404);

  const { data, error } = await supabase(c.env).from('safa_content_records')
    .select('record_id,payload,status,updated_at')
    .eq('collection', collection)
    .order('updated_at', { ascending: false })
    .limit(500);
  if (error) safeMessage(error, 'Public content is temporarily unavailable.');

  const items = (data || []).filter(row => isRecord(row.payload) && isPublicRecord(row.payload, row.status))
    .map(row => publicContentRecord(collection, isRecord(row.payload) ? row.payload : {}, row.record_id));
  return c.json({ items, truncated: (data || []).length === 500 });
});

app.post('/api/v1/volunteers', async c => {
  const parsed = await readJsonBody(c);
  if (parsed.ok === false) return c.json({ error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (body.honeypot) return c.json({ error: 'Spam detected.' }, 400);

  const fullName = boundedText(body.fullName, 120);
  const email = boundedText(body.email, 254)?.toLowerCase();
  const phone = boundedText(body.phone, 40);
  const availability = body.availability === undefined ? 'Flexible' : boundedText(body.availability, 120);
  const message = body.message === undefined || body.message === '' ? null : boundedText(body.message, 1000);
  const interests = stringList(body.interests);
  if (!fullName || !email || !validEmail(email) || !phone || !availability || !interests ||
      (body.message !== undefined && body.message !== '' && !message) || body.isLegalAgeConfirmed !== true) {
    return c.json({ error: 'Please provide valid volunteer details and confirm the age requirement.' }, 400);
  }
  if (!await checkRateLimit(c, 'volunteers', 8)) {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  const { data, error } = await supabase(c.env).from('safa_volunteer_applications').insert({
    full_name: fullName,
    email,
    phone,
    is_legal_age_confirmed: true,
    interests,
    availability,
    message
  }).select('id,status,created_at').single();
  if (error) safeMessage(error, 'Could not save the volunteer application.');

  const notificationDelivered = await sendTelegramNotification(c,
    `New volunteer application\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nAvailability: ${availability}`);
  return c.json({
    success: true,
    message: 'Volunteer application received. Thank you for your commitment to SAFA!',
    volunteer: {
      id: data.id, fullName, email, phone, isLegalAgeConfirmed: true, interests,
      availability, message: message || '', status: data.status, createdAt: data.created_at
    },
    notificationDelivered
  }, 201);
});

app.post('/api/v1/contact', async c => {
  const parsed = await readJsonBody(c);
  if (parsed.ok === false) return c.json({ error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (body.honeypot) return c.json({ error: 'Spam detected.' }, 400);

  const name = boundedText(body.name, 120);
  const email = boundedText(body.email, 254)?.toLowerCase();
  const phone = body.phone === undefined || body.phone === '' ? null : boundedText(body.phone, 40);
  const subject = body.subject === undefined || body.subject === '' ? 'General Inquiry' : boundedText(body.subject, 140);
  const message = boundedText(body.message, 4000);
  if (!name || !email || !validEmail(email) || !subject || !message ||
      (body.phone !== undefined && body.phone !== '' && !phone)) {
    return c.json({ error: 'Please provide a valid name, email, subject and message.' }, 400);
  }
  if (!await checkRateLimit(c, 'contact', 8)) {
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  const { data, error } = await supabase(c.env).from('safa_contact_messages').insert({
    name, email, phone, subject, message
  }).select('id,status,created_at').single();
  if (error) safeMessage(error, 'Could not save the contact message.');

  const notificationDelivered = await sendTelegramNotification(c,
    `New contact message\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`);
  return c.json({
    success: true,
    message: 'Your message has been received by the SAFA coordination team.',
    contact: { id: data.id, name, email, phone, subject, message, status: data.status, createdAt: data.created_at },
    notificationDelivered
  }, 201);
});

app.notFound(c => c.json({ error: 'API route not found' }, 404));
app.onError((error, c) => {
  if (error instanceof ApiFailure) {
    return privateJson({ error: error.message }, error.status, undefined, error.status === 401);
  }
  console.error('Unhandled API error', { method: c.req.method, path: c.req.path, name: error.name });
  return privateJson({ error: 'The request could not be completed. Please retry.' }, 500);
});

export default app;
export { app };
