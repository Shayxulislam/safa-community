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
  - Owner/Admin selector and passwords verified by Supabase Auth.
  - Content Management: Events, Work Stories, Social Links, Founder & Organization settings.
  - Transparency & Donation Ledger management.
  - Security: Owner changes either password; Admin changes its own password.
  - Telegram webhook/bot dispatch integration for automated volunteer & donation notifications.

## Getting Started

### Prerequisites

- Node.js 24 LTS
- npm, pnpm, yarn, or bun

### Installation

```bash
# 1. Clone or extract the repository
unzip SAFA_Supabase_Auth.zip
cd SAFA-Supabase-Auth

# 2. Install dependencies
npm install

# 3. Optional public Supabase and Telegram configuration
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

## Supabase Auth and protected routes

Staff enter **Owner or Admin + password** at `/admin/login`. No email or ID field is shown. Supabase uses two internal Auth identities; no shared credentials are shipped in source or browser storage.

Implemented boundaries:

- `/admin` and `/admin/dashboard` wait for server session validation; outages show Retry, and unsigned users go to login.
- Express proxies the deployed `safa-staff-auth` Edge Function. Access and rotating refresh tokens stay in HttpOnly, SameSite=Strict cookies, with Secure on HTTPS/Vercel. API responses never return tokens to browser JavaScript.
- Each protected API validates Supabase identity and the current `auth.sessions` row. Database role membership comes from a private allowlist, never from user-editable metadata.
- Owner can reset either password using the **current Owner password**. Admin can change only Admin. Password changes revoke every session belonging to the selected type, with a final global Auth sign-out after the password update; an Owner resetting Admin stays signed in.
- Passwords must differ and contain 10–128 characters. Durable database throttling protects login and password changes.
- Private tables use RLS and explicit grants. Retired custom password/session tables deny all browser roles. RLS-without-policy advisor INFO findings are intentional for these private/retired tables.
- The Vercel entry `api/index.ts` imports the side-effect-free `server/app.ts`; native ESM import paths are tested without tsx. The server bundle is built into `build/`, outside publicly served `dist/`. The old public source archive is removed.

### Current project status

This source package includes the API/runtime split, Vercel rewrites and Owner/Admin updates from your latest uploaded `SAFA - community(1).zip`, on top of GitHub `main` commit `7a75562`. Production shows the same Owner/Admin selector; its exact deployed commit could not be verified because Vercel team access returns 403. If your local project has additional commits or uncommitted changes, merge the Auth update on a separate branch; do not overwrite your working folder.

The two SQL migrations and `safa-staff-auth` Edge Function have been applied to Supabase project `esekwdgunftouzkcrqlx`. **The initial Auth users are not created yet.** Until provisioning finishes, correct-looking credentials still fail login. GitHub push is blocked because this workspace has no GitHub credentials. No production Vercel deployment was performed; the connected Vercel account returns 403 for the existing team.

### Create the two initial Auth users once

Use the official Supabase Admin client locally; there is no public provisioning endpoint.

```bash
npm ci
cp scripts/setup-staff.env.example .env.setup.local
# Edit .env.setup.local in VS Code, then:
npm run setup:staff
```

In the ignored `.env.setup.local`, enter a Supabase **secret/service-role key** from Project Settings → API Keys and two different initial passwords. Keep this file local. Do not paste its contents into chat, GitHub, Vercel frontend variables, or terminal command arguments. The script creates confirmed internal identities and registers them through a service-role-only RPC. Reruns preserve existing users and passwords. Remove the local setup file after verifying sign-in. The Vercel app itself needs only the public URL/key shown in `.env.example`; privileged keys stay inside Supabase's runtime.

Alternatively, create confirmed users in Supabase Authentication → Users using `owner@staff.safa-community.invalid` and `admin@staff.safa-community.invalid`, then register those existing users in the private allowlist. These internal addresses are never entered by staff at login and cannot receive recovery emails; an Owner changes passwords in Security, and a project administrator can recover Owner access through Supabase.

For another Supabase project, apply the migrations and deploy the function using the Supabase CLI, then set the new public URL/key in server environment variables. Use a separate project for previews if they must not share production staff sessions.

### Verification

```bash
npm test
npm run lint
npm run build
# Optional browser smoke checks, with mocked authentication responses:
npx playwright install chromium
npm run test:browser
```

Verified for this update: 22/22 automated checks, TypeScript checking, production build and browser smoke checks passed. `npm audit fix` applied compatible dependency patches; the audit reports zero known vulnerabilities. The build still reports a bundle-size warning.

The tests cover authorization, cookie/token handling, refresh, outages and password-change rules using a mocked SDK boundary. Live anonymous denial checks passed. A successful live Owner/Admin login and live password-change test remain blocked until initial users exist. Existing CMS content storage is unchanged: it still uses this repository's browser storage and is not migrated into Supabase by the Auth work.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (framer-motion), Lucide Icons, React Router v7.
- **Backend / Server**: Express, TypeScript, Vite SSR middleware for dev, esbuild bundling for production.
- **Brand Assets**: Custom SVG vector logo (`/public/safa-logo.svg`), high-resolution official portrait (`/public/nargiza_ceo.jpg`).

---
&copy; 2026 SAFA Community Initiative. All rights reserved.
