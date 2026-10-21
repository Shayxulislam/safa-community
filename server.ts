import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import {
  activateAdminInvitation,
  clearSessionCookie,
  createAdminInvitation,
  createAdminSession,
  deleteAdminAccount,
  ensureAdminAuthSchema,
  getAccountPasswordHash,
  getAdminSummary,
  getAdminFromRequest,
  getAdminInvitation,
  listAdminAccounts,
  listAdminInvitations,
  revokeAdminSession,
  revokeAdminInvitation,
  saveAccountPasswordAndRevokeSessions,
  setSessionCookie,
  updateAdminAccount
} from './server/admin-auth';
import { changeAccountPassword } from './server/passwords';

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_ROLES = new Set(['super_admin', 'admin', 'content_manager', 'media_manager', 'editor', 'finance', 'volunteer_manager', 'viewer']);

if (process.env.VERCEL === '1') {
  app.set('trust proxy', 1);
}

// Basic security middleware & JSON parsing
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb', parameterLimit: 30 }));

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple in-memory rate limiting map for anti-spam
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_RATE_LIMIT_ENTRIES = 10_000;

function rateLimit(limit = 60, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipRequestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
      if (!entry && ipRequestCounts.size >= MAX_RATE_LIMIT_ENTRIES) {
        for (const [trackedIp, trackedEntry] of ipRequestCounts) {
          if (now > trackedEntry.resetTime) ipRequestCounts.delete(trackedIp);
        }
      }

      if (!entry && ipRequestCounts.size >= MAX_RATE_LIMIT_ENTRIES) {
        return res.status(429).json({
          error: 'Too many requests. Please wait a moment before trying again.'
        });
      }

      ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > limit) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.'
      });
    }
    next();
  };
}

// In-memory counter for server-generated reference numbers
let contributionCounter = 6;

// ==========================================
// TELEGRAM NOTIFICATION HELPER
// ==========================================
async function sendTelegramNotification(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram Notification] Missing TELEGRAM_BOT_TOKEN and/or TELEGRAM_ADMIN_CHAT_ID. Message was not sent.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        chat_id: String(chatId).trim(),
        text,
        parse_mode: 'HTML'
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Telegram API Error ${res.status}]:`, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Telegram Dispatch Error]:', err);
    return false;
  }
}

// ==========================================
// PUBLIC API ENDPOINTS (/api/v1)
// ==========================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'SAFA Platform',
    tagline: 'Connecting Hands, Changing Lives',
    timestamp: new Date().toISOString()
  });
});

function usesSecureCookies(req: Request): boolean {
  return process.env.VERCEL === '1' || req.secure || req.headers['x-forwarded-proto'] === 'https';
}

async function requireAdmin(req: Request, res: Response) {
  const account = await getAdminFromRequest(req);
  if (!account) {
    res.status(401).json({ error: 'Please sign in to continue.' });
    return null;
  }
  return account;
}

app.post('/api/v1/admin/auth/login', rateLimit(8, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    await ensureAdminAuthSchema();
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const session = await createAdminSession(email, password);
    if (!session) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.setHeader('Set-Cookie', setSessionCookie(session.token, usesSecureCookies(req)));
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ user: session.account });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return res.status(503).json({ error: 'Administrator sign-in is unavailable. Check server authentication configuration.' });
  }
});

app.get('/api/v1/admin/auth/session', async (req: Request, res: Response) => {
  try {
    const account = await getAdminFromRequest(req);
    res.setHeader('Cache-Control', 'no-store');
    return account ? res.json({ user: account }) : res.status(401).json({ error: 'Please sign in to continue.' });
  } catch (error) {
    console.error('[Admin Session Error]', error);
    return res.status(503).json({ error: 'Administrator sign-in is unavailable. Check server authentication configuration.' });
  }
});

app.post('/api/v1/admin/auth/change-password', rateLimit(10, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const account = await requireAdmin(req, res);
    if (!account) return;
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
      return res.status(400).json({ error: 'All password fields are required.' });
    }
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'New passwords do not match.' });
    const result = await changeAccountPassword({
      getPasswordHash: getAccountPasswordHash,
      updatePasswordAndRevokeSessions: saveAccountPasswordAndRevokeSessions
    }, account.id, currentPassword, newPassword);
    if (result === 'invalid-current') return res.status(400).json({ error: 'Current password is incorrect.' });
    if (result === 'invalid-new') return res.status(400).json({ error: 'New password must be between 8 and 256 characters.' });
    res.setHeader('Set-Cookie', clearSessionCookie(usesSecureCookies(req)));
    return res.json({ success: true, message: 'Password updated. Please sign in again.' });
  } catch (error) {
    console.error('[Admin Password Change Error]', error);
    return res.status(503).json({ error: 'Password could not be changed. Try again later.' });
  }
});

app.post('/api/v1/admin/auth/logout', async (req: Request, res: Response) => {
  try {
    await revokeAdminSession(req);
    res.setHeader('Set-Cookie', clearSessionCookie(usesSecureCookies(req)));
    return res.json({ success: true });
  } catch (error) {
    console.error('[Admin Logout Error]', error);
    return res.status(503).json({ error: 'Sign out could not be completed.' });
  }
});

app.get('/api/v1/admin/accounts', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    if (actor.role !== 'super_admin') return res.status(403).json({ error: 'Owner access is required.' });
    return res.json({ users: await listAdminAccounts() });
  } catch (error) {
    console.error('[Admin Accounts Error]', error);
    return res.status(503).json({ error: 'Administrator accounts are unavailable.' });
  }
});

app.get('/api/v1/admin/summary', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    return res.json(await getAdminSummary());
  } catch (error) {
    console.error('[Admin Summary Error]', error);
    return res.status(503).json({ error: 'Administrator summary is unavailable.' });
  }
});

app.patch('/api/v1/admin/accounts/:id', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    if (actor.role !== 'super_admin') return res.status(403).json({ error: 'Owner access is required.' });
    const { role, status, customPermissions } = req.body || {};
    if (role !== undefined && (typeof role !== 'string' || !ADMIN_ROLES.has(role))) return res.status(400).json({ error: 'Invalid administrator role.' });
    if (status !== undefined && !['active', 'disabled'].includes(status)) return res.status(400).json({ error: 'Invalid account status.' });
    await updateAdminAccount(req.params.id, { role, status, customPermissions });
    return res.json({ success: true });
  } catch (error) {
    console.error('[Admin Account Update Error]', error);
    return res.status(503).json({ error: 'Administrator account could not be updated.' });
  }
});

app.delete('/api/v1/admin/accounts/:id', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    if (actor.role !== 'super_admin') return res.status(403).json({ error: 'Owner access is required.' });
    if (actor.id === req.params.id) return res.status(400).json({ error: 'You cannot remove your own account.' });
    await deleteAdminAccount(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('[Admin Account Delete Error]', error);
    return res.status(503).json({ error: 'Administrator account could not be removed.' });
  }
});

app.post('/api/v1/admin/invitations', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    if (actor.role !== 'super_admin') return res.status(403).json({ error: 'Owner access is required.' });
    const { name, email, role, customPermissions } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.includes('@') || typeof role !== 'string' || !ADMIN_ROLES.has(role)) {
      return res.status(400).json({ error: 'Name, valid email, and role are required.' });
    }
    const invitation = await createAdminInvitation({
      name,
      email,
      role,
      customPermissions,
      invitedBy: actor.id,
      invitedByName: actor.name
    });
    return res.status(201).json({ invitation });
  } catch (error) {
    console.error('[Admin Invitation Error]', error);
    return res.status(503).json({ error: 'Invitation could not be created.' });
  }
});

app.get('/api/v1/admin/invitations/:token', async (req: Request, res: Response) => {
  try {
    const invitation = await getAdminInvitation(req.params.token);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
    return res.json({ invitation });
  } catch (error) {
    console.error('[Admin Invitation Lookup Error]', error);
    return res.status(503).json({ error: 'Invitation could not be loaded.' });
  }
});

app.get('/api/v1/admin/invitations', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    if (actor.role !== 'super_admin') return res.status(403).json({ error: 'Owner access is required.' });
    return res.json({ invitations: await listAdminInvitations() });
  } catch (error) {
    console.error('[Admin Invitation List Error]', error);
    return res.status(503).json({ error: 'Invitations are unavailable.' });
  }
});

app.delete('/api/v1/admin/invitations/:id', async (req: Request, res: Response) => {
  try {
    const actor = await requireAdmin(req, res);
    if (!actor) return;
    if (actor.role !== 'super_admin') return res.status(403).json({ error: 'Owner access is required.' });
    await revokeAdminInvitation(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('[Admin Invitation Revoke Error]', error);
    return res.status(503).json({ error: 'Invitation could not be revoked.' });
  }
});

app.post('/api/v1/admin/invitations/:token/accept', rateLimit(8, 15 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const password = req.body?.password;
    if (typeof password !== 'string') return res.status(400).json({ error: 'A password is required.' });
    const activation = await activateAdminInvitation(req.params.token, password);
    if (!activation) return res.status(400).json({ error: 'Invitation is invalid, expired, or already used.' });
    res.setHeader('Set-Cookie', setSessionCookie(activation.sessionToken, usesSecureCookies(req)));
    return res.status(201).json({ user: activation.account });
  } catch (error) {
    console.error('[Admin Invitation Activation Error]', error);
    return res.status(503).json({ error: 'Invitation could not be activated.' });
  }
});

app.get('/api/v1/info', (_req: Request, res: Response) => {
  res.json({
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
  });
});

// Server-side reference generator
app.post(['/api/v1/contributions', '/api/contributions'], rateLimit(15), (req: Request, res: Response) => {
  const { amount, currency, purpose, donorName, isAnonymous, paymentMethod } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Valid contribution amount is required' });
  }

  // Security guard: Ensure no sensitive raw card credentials are processed or stored
  if (req.body.cardNumber || req.body.cvv || req.body.cardExpiry) {
    return res.status(400).json({
      error: 'Direct card credential submission prohibited. Payments must proceed through secure tokenized gateway.'
    });
  }

  contributionCounter += 1;
  const year = new Date().getFullYear();
  const reference = `SAFA-${year}-${String(contributionCounter).padStart(6, '0')}`;

  const contribution = {
    id: `c-${Date.now()}`,
    contributionNumber: reference,
    amount,
    currency: currency || 'UZS',
    purpose: purpose || 'General Community Support',
    donorName: isAnonymous ? 'Anonymous Supporter' : (donorName || 'Supporter'),
    isAnonymous: Boolean(isAnonymous),
    paymentMethod: paymentMethod || 'card_checkout',
    status: 'completed',
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString()
  };

  // Telegram alert
  sendTelegramNotification(
    `🤝 <b>New Contribution Registered</b>\n\n` +
    `• <b>Reference:</b> <code>${reference}</code>\n` +
    `• <b>Amount:</b> ${Number(amount).toLocaleString()} ${currency || 'UZS'}\n` +
    `• <b>Supporter:</b> ${contribution.donorName}\n` +
    `• <b>Purpose:</b> ${contribution.purpose}\n` +
    `• <b>Method:</b> ${contribution.paymentMethod}`
  ).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Contribution registered successfully with server-verified reference.',
    contribution
  });
});

// Volunteer application endpoint
app.post(['/api/v1/volunteers', '/api/volunteers'], rateLimit(10), (req: Request, res: Response) => {
  const { fullName, email, phone, isLegalAgeConfirmed, interests, availability, message, honeypot } = req.body;

  // Anti-spam honeypot
  if (honeypot) {
    return res.status(400).json({ error: 'Spam detected' });
  }

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: 'Full name, email, and phone number are required.' });
  }

  const volunteer = {
    id: `vol-${Date.now()}`,
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    isLegalAgeConfirmed: Boolean(isLegalAgeConfirmed),
    interests: Array.isArray(interests) ? interests : [],
    availability: availability || 'Flexible',
    message: message || '',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  // Telegram alert
  sendTelegramNotification(
    `🙋 <b>New Volunteer Application</b>\n\n` +
    `• <b>Name:</b> ${volunteer.fullName}\n` +
    `• <b>Phone:</b> ${volunteer.phone}\n` +
    `• <b>Email:</b> ${volunteer.email}\n` +
    `• <b>Availability:</b> ${volunteer.availability}\n` +
    `• <b>Interests:</b> ${volunteer.interests.join(', ') || 'General'}\n` +
    (volunteer.message ? `• <b>Note:</b> ${volunteer.message}` : '')
  ).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Volunteer application received. Thank you for your commitment to SAFA!',
    volunteer
  });
});

// Contact message endpoint
app.post(['/api/v1/contact', '/api/contact'], rateLimit(10), async (req: Request, res: Response) => {
  const { name, email, phone, subject, message, honeypot } = req.body;

  if (honeypot) {
    return res.status(400).json({ error: 'Spam detected' });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const contact = {
    id: `msg-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : undefined,
    subject: subject || 'General Inquiry',
    message: String(message).trim(),
    status: 'new',
    createdAt: new Date().toISOString()
  };

  const telegramDelivered = await sendTelegramNotification(
    `📩 <b>New Contact Message Received</b>\n\n` +
    `• <b>From:</b> ${contact.name}\n` +
    `• <b>Email:</b> ${contact.email}\n` +
    (contact.phone ? `• <b>Phone:</b> ${contact.phone}\n` : '') +
    `• <b>Subject:</b> ${contact.subject}\n\n` +
    `<b>Message:</b>\n${contact.message}`
  );

  if (!telegramDelivered) {
    return res.status(502).json({
      error: 'Message could not be delivered to the SAFA Telegram account. Please try again later.'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Your message has been delivered to the SAFA coordination team.',
    contact
  });
});

// ==========================================
// VITE DEV & PRODUCTION STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.VERCEL === '1') {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAFA Server] Running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exitCode = 1;
  });
}
