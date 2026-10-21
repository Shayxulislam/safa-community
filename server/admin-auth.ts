import { createHash, randomBytes } from 'node:crypto';
import postgres from 'postgres';
import type { Request } from 'express';
import { hashPassword, verifyPassword } from './passwords';

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'disabled';
  customPermissions?: Record<string, boolean>;
  createdAt: string;
  lastLoginAt?: string;
}

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? postgres(DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 10 }) : null;
const SESSION_COOKIE = 'safa_admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
let initialized: Promise<void> | null = null;

function db() {
  if (!sql) throw new Error('DATABASE_URL is required for administrator authentication.');
  return sql;
}

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function asAccount(row: Record<string, any>): AdminAccount {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    customPermissions: row.custom_permissions || undefined,
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : undefined
  };
}

export async function ensureAdminAuthSchema(): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      const database = db();
      await database`
        CREATE TABLE IF NOT EXISTS safa_admin_accounts (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
          custom_permissions JSONB,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        )
      `;
      await database`
        CREATE TABLE IF NOT EXISTS safa_admin_sessions (
          token_hash TEXT PRIMARY KEY,
          account_id TEXT NOT NULL REFERENCES safa_admin_accounts(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await database`
        CREATE TABLE IF NOT EXISTS safa_admin_invitations (
          id TEXT PRIMARY KEY,
          token_hash TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          custom_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
          invited_by TEXT NOT NULL,
          invited_by_name TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await database`CREATE INDEX IF NOT EXISTS safa_admin_sessions_account_idx ON safa_admin_sessions(account_id)`;

      const bootstrapEmail = process.env.SAFA_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
      const bootstrapPassword = process.env.SAFA_ADMIN_BOOTSTRAP_PASSWORD;
      if (bootstrapEmail && bootstrapPassword) {
        if (bootstrapPassword.length < 8 || bootstrapPassword.length > 256) {
          throw new Error('SAFA_ADMIN_BOOTSTRAP_PASSWORD must be between 8 and 256 characters.');
        }
        await database.begin(async transaction => {
          const [{ account_count: accountCount }] = await transaction`SELECT COUNT(*)::int AS account_count FROM safa_admin_accounts`;
          if (accountCount === 0) {
            await transaction`
              INSERT INTO safa_admin_accounts (id, email, name, role, password_hash)
              VALUES ('usr-owner', ${bootstrapEmail}, 'SAFA Administrator', 'super_admin', ${await hashPassword(bootstrapPassword)})
              ON CONFLICT DO NOTHING
            `;
          }
        });
      }
    })();
  }
  try {
    await initialized;
  } catch (error) {
    initialized = null;
    throw error;
  }
}

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.cookie || '';
  const cookie = cookieHeader.split(';').map(value => value.trim()).find(value => value.startsWith(`${SESSION_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1)) : null;
}

export function setSessionCookie(token: string, secure: boolean): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/api/v1/admin; SameSite=Strict; Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/api/v1/admin; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

export async function createAdminSession(email: string, password: string): Promise<{ account: AdminAccount; token: string } | null> {
  if (password.length > 256) return null;
  await ensureAdminAuthSchema();
  const database = db();
  const [row] = await database`SELECT * FROM safa_admin_accounts WHERE email = ${email.trim().toLowerCase()} LIMIT 1`;
  if (!row || row.status !== 'active' || !(await verifyPassword(password, row.password_hash))) return null;

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await database.begin(async transaction => {
    await transaction`UPDATE safa_admin_accounts SET last_login_at = NOW() WHERE id = ${row.id}`;
    await transaction`
      INSERT INTO safa_admin_sessions (token_hash, account_id, expires_at)
      VALUES (${hashSessionToken(token)}, ${row.id}, ${expiresAt})
    `;
  });
  return { account: asAccount({ ...row, last_login_at: new Date() }), token };
}

export async function getAdminFromRequest(request: Request): Promise<AdminAccount | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  await ensureAdminAuthSchema();
  const [row] = await db()`
    SELECT account.*
    FROM safa_admin_sessions session
    JOIN safa_admin_accounts account ON account.id = session.account_id
    WHERE session.token_hash = ${hashSessionToken(token)}
      AND session.expires_at > NOW()
      AND account.status = 'active'
    LIMIT 1
  `;
  return row ? asAccount(row) : null;
}

export async function revokeAdminSession(request: Request): Promise<void> {
  const token = getSessionToken(request);
  if (!token) return;
  await ensureAdminAuthSchema();
  await db()`DELETE FROM safa_admin_sessions WHERE token_hash = ${hashSessionToken(token)}`;
}

export async function saveAccountPasswordAndRevokeSessions(accountId: string, passwordHash: string): Promise<void> {
  await ensureAdminAuthSchema();
  await db().begin(async transaction => {
    await transaction`UPDATE safa_admin_accounts SET password_hash = ${passwordHash} WHERE id = ${accountId}`;
    await transaction`DELETE FROM safa_admin_sessions WHERE account_id = ${accountId}`;
  });
}

export async function getAccountPasswordHash(accountId: string): Promise<string | null> {
  await ensureAdminAuthSchema();
  const [row] = await db()`SELECT password_hash FROM safa_admin_accounts WHERE id = ${accountId} LIMIT 1`;
  return row?.password_hash || null;
}

export async function createAdminInvitation(input: {
  name: string;
  email: string;
  role: string;
  customPermissions?: Record<string, boolean>;
  invitedBy: string;
  invitedByName: string;
}): Promise<{ token: string; id: string; expiresAt: string }> {
  await ensureAdminAuthSchema();
  const token = randomBytes(32).toString('base64url');
  const id = `inv-${randomBytes(12).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await db()`
    INSERT INTO safa_admin_invitations (id, token_hash, email, name, role, custom_permissions, invited_by, invited_by_name, expires_at)
    VALUES (${id}, ${hashSessionToken(token)}, ${input.email.trim().toLowerCase()}, ${input.name.trim()}, ${input.role}, ${db().json(input.customPermissions || {})}, ${input.invitedBy}, ${input.invitedByName}, ${expiresAt})
  `;
  return { id, token, expiresAt: expiresAt.toISOString() };
}

export async function getAdminInvitation(token: string): Promise<Record<string, unknown> | null> {
  await ensureAdminAuthSchema();
  const [row] = await db()`
    SELECT id, email, name, role, custom_permissions, invited_by, invited_by_name, created_at, expires_at, status
    FROM safa_admin_invitations WHERE token_hash = ${hashSessionToken(token)} LIMIT 1
  `;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    customPermissions: row.custom_permissions,
    invitedBy: row.invited_by,
    invitedByName: row.invited_by_name,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    status: row.status
  };
}

export async function listAdminInvitations(): Promise<Record<string, unknown>[]> {
  await ensureAdminAuthSchema();
  const rows = await db()`
    SELECT id, email, name, role, custom_permissions, invited_by, invited_by_name, created_at, expires_at, status
    FROM safa_admin_invitations ORDER BY created_at DESC
  `;
  return rows.map(row => ({
    id: row.id,
    token: '',
    email: row.email,
    name: row.name,
    role: row.role,
    customPermissions: row.custom_permissions,
    invitedBy: row.invited_by,
    invitedByName: row.invited_by_name,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: new Date(row.expires_at).toISOString(),
    status: row.status === 'pending' && new Date(row.expires_at) < new Date() ? 'expired' : row.status
  }));
}

export async function revokeAdminInvitation(id: string): Promise<void> {
  await ensureAdminAuthSchema();
  await db()`UPDATE safa_admin_invitations SET status = 'revoked' WHERE id = ${id} AND status = 'pending'`;
}

export async function activateAdminInvitation(token: string, password: string): Promise<{ account: AdminAccount; sessionToken: string } | null> {
  if (password.length < 8 || password.length > 256) return null;
  await ensureAdminAuthSchema();
  const database = db();
  const accountId = `usr-${randomBytes(12).toString('hex')}`;
  const sessionToken = randomBytes(32).toString('base64url');
  const passwordHash = await hashPassword(password);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const account = await database.begin(async transaction => {
    const [invitation] = await transaction`
      SELECT * FROM safa_admin_invitations
      WHERE token_hash = ${hashSessionToken(token)} AND status = 'pending' AND expires_at > NOW()
      FOR UPDATE
    `;
    if (!invitation) return null;
    const [newAccount] = await transaction`
      INSERT INTO safa_admin_accounts (id, email, name, role, custom_permissions, password_hash)
      VALUES (${accountId}, ${invitation.email}, ${invitation.name}, ${invitation.role}, ${transaction.json(invitation.custom_permissions || {})}, ${passwordHash})
      RETURNING *
    `;
    await transaction`UPDATE safa_admin_invitations SET status = 'accepted' WHERE id = ${invitation.id}`;
    await transaction`
      INSERT INTO safa_admin_sessions (token_hash, account_id, expires_at)
      VALUES (${hashSessionToken(sessionToken)}, ${accountId}, ${expiresAt})
    `;
    return newAccount;
  });
  if (!account) return null;
  return { account: asAccount(account), sessionToken };
}

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  await ensureAdminAuthSchema();
  const rows = await db()`SELECT * FROM safa_admin_accounts ORDER BY created_at`;
  return rows.map(asAccount);
}

export async function getAdminSummary(): Promise<{ activeAccounts: number; pendingInvitations: number }> {
  await ensureAdminAuthSchema();
  const [accounts] = await db()`SELECT COUNT(*)::int AS count FROM safa_admin_accounts WHERE status = 'active'`;
  const [invitations] = await db()`SELECT COUNT(*)::int AS count FROM safa_admin_invitations WHERE status = 'pending' AND expires_at > NOW()`;
  return { activeAccounts: accounts.count, pendingInvitations: invitations.count };
}

export async function updateAdminAccount(id: string, updates: { role?: string; status?: 'active' | 'disabled'; customPermissions?: Record<string, boolean> }): Promise<void> {
  await ensureAdminAuthSchema();
  await db()`
    UPDATE safa_admin_accounts
    SET role = COALESCE(${updates.role ?? null}, role),
        status = COALESCE(${updates.status ?? null}, status),
        custom_permissions = COALESCE(${updates.customPermissions ? db().json(updates.customPermissions) : null}, custom_permissions)
    WHERE id = ${id}
  `;
  if (updates.status === 'disabled') await db()`DELETE FROM safa_admin_sessions WHERE account_id = ${id}`;
}

export async function deleteAdminAccount(id: string): Promise<void> {
  await ensureAdminAuthSchema();
  await db()`DELETE FROM safa_admin_accounts WHERE id = ${id}`;
}