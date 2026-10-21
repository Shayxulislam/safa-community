# SAFA Community Platform — Connecting Hands, Changing Lives

A youth-led community support and charity platform for Uzbekistan, founded by Nargiza to connect hands and change lives through verified grassroots action, transparent accounting, community programs, and administrative management.

## Features

- **Public Experience**:
  - **Homepage**: Hero banner, impact statistics, verified initiatives, founder profile, mission/philosophy, and community voice.
  - **About Page**: Origin narrative, founder biography, guiding principles, and the story behind the official emblem (Heart, Reaching Hands & Dove).
  - **Our Work & Direct Impact**: Real field actions, categorized by emergency aid, youth education, home renovations, and health drives.
  - **Support & Transparency**: Transparent ledger, campaign milestones, receipt verification, and direct donation channels.
  - **Verified Directory (`/links`)**: Central hub of all verified social media channels, Telegram groups, and contact points.
  - **Volunteer Portal**: Online application with role selection and Telegram bot notification integration.
  - **Events & Visits Calendar**: Community visits, hospital checkups, and aid distribution dates.

- **Admin CMS Portal (`/admin/login`)**:
  - Individual administrator accounts with server-verified passwords and role-based access control.
  - Content Management: Events, Work Stories, Social Links, Founder & Organization settings.
  - Transparency & Donation Ledger management.
  - Team & Role delegation.
  - Telegram webhook/bot dispatch integration for automated volunteer & donation notifications.

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, yarn, or bun

### Installation

```bash
# 1. Clone or extract the repository
unzip safa-community-platform.zip
cd safa-community-platform

# 2. Install dependencies
npm install

# 3. Create .env file (admin access requires a PostgreSQL database)
cp .env.example .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Compile client and server
npm run build

# Start production server
npm start
```

## Security & Admin Credentials

- **Admin Gate**: `/admin/login`
- Administrator accounts, salted password hashes, and revocable sessions are stored in PostgreSQL.
- Set `DATABASE_URL`, `SAFA_ADMIN_BOOTSTRAP_EMAIL`, and `SAFA_ADMIN_BOOTSTRAP_PASSWORD` as server-side environment variables before the first admin API request. The bootstrap password is read only when the admin account table is empty; it is never sent to the browser.
- Set the requested owner password in the hosting provider's encrypted `SAFA_ADMIN_BOOTSTRAP_PASSWORD` field. Do not place credentials in source files, `VITE_` variables, or committed environment files.
- Configure those variables in Vercel Project Settings → Environment Variables for the relevant deployment environments, then redeploy. Choose the owner's sign-in email for `SAFA_ADMIN_BOOTSTRAP_EMAIL`.
- Admin passwords must be at least 8 characters. After a password change, all sessions for that account are revoked and the administrator must sign in again.
- Existing browser-only demo users and invitations are not migrated to PostgreSQL. Recreate staff access through the owner invitation workflow after bootstrap.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (framer-motion), Lucide Icons, React Router v7.
- **Backend / Server**: Express, TypeScript, Vite SSR middleware for dev, esbuild bundling for production.
- **Brand Assets**: Custom SVG vector logo (`/public/safa-logo.svg`), high-resolution official portrait (`/public/nargiza_ceo.jpg`).

---
&copy; 2026 SAFA Community Initiative. All rights reserved.
