import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Basic security middleware & JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
function rateLimit(limit = 60, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipRequestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
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
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.log(`[Telegram Notification] (Set TELEGRAM_BOT_TOKEN & TELEGRAM_ADMIN_CHAT_ID to send live):\n${text}`);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
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
app.post(['/api/v1/contact', '/api/contact'], rateLimit(10), (req: Request, res: Response) => {
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

  // Telegram alert
  sendTelegramNotification(
    `📩 <b>New Contact Message Received</b>\n\n` +
    `• <b>From:</b> ${contact.name}\n` +
    `• <b>Email:</b> ${contact.email}\n` +
    (contact.phone ? `• <b>Phone:</b> ${contact.phone}\n` : '') +
    `• <b>Subject:</b> ${contact.subject}\n\n` +
    `<b>Message:</b>\n${contact.message}`
  ).catch(() => {});

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

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
