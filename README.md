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
- npm (the committed `package-lock.json` is the supported lockfile)

### Installation

```bash
# Clone or extract the repository, then enter its root directory.
npm ci
cp .dev.vars.example .dev.vars
# Fill in the development Supabase values in .dev.vars.
npm run cf:dev
```

Open [http://localhost:8787](http://localhost:8787) in your browser.

### Building for Production

```bash
# Compile client and server
npm run build

# Start production server
npm start
```

## Cloudflare Worker + Supabase

Cloudflare Workers serves the Vite-built React SPA and the Hono `/api/*` routes. Supabase remains the only application backend: Supabase Auth and its existing `safa-staff-auth` Edge Function handle Owner/Admin login; PostgreSQL stores volunteer applications, contact messages, rate-limit buckets, and CMS records. D1, Drizzle, and Better Auth are not part of this architecture. Vercel configuration and the legacy Express/Supabase adapter remain available as a rollback path.

The Worker uses the Supabase secret key only on the server. Its staff-auth calls use the publishable key, while staff authorization is validated through the existing Supabase Edge Function and live Supabase sessions. Admin APIs validate same-origin writes, body size, input fields, status values, pagination, and rate limits before accessing data. The `safa_content_records` table is RLS-enabled and unavailable to `anon` and `authenticated`; the Worker accesses it with its server-only secret key after checking the staff session.

### Local development

Use a separate Supabase development project. Copy `.dev.vars.example` to `.dev.vars` and fill in that project's URL, publishable key, and secret key. Keep `.dev.vars` local and never use a production secret for local development.

```bash
npm install
cp .dev.vars.example .dev.vars
# Fill the local Supabase values in .dev.vars
npm run cf:dev
```

The project requires Node.js 22.12 or newer for the installed Wrangler and Supabase SDK versions. `npm run build:worker` builds the SPA and performs a Wrangler dry run against both development and production Worker environments; it does not deploy.

### Supabase schema prerequisite

The migration `supabase/migrations/20261115000000_safa_content_records.sql` adds the CMS record table and indexes. It does not drop or recreate existing tables or accounts. The migration has been applied to the connected production project. Verification confirmed `safa_content_records` exists with RLS enabled, no access for `anon` or `authenticated`, and access for `service_role`. The table currently has zero rows. Existing staff-auth functions, rate-limit RPC, and volunteer/contact tables remain in place.

Before release, review the remote migration history against the local migration files: the hosted project has existing migration versions that do not exactly match the two legacy local staff migration filenames. Do not replay or reset those migrations to resolve the history difference.

### Cloudflare configuration and release

`wrangler.jsonc` defines a development Worker (`safa-community-dev`) and a separate production Worker (`safa-community`). SPA navigation falls back to `index.html`; `/api/*` runs through the Worker first. Production repeats its own asset binding and environment variables because Wrangler environments do not inherit bindings or vars.

1. Release checks passed: lint, all 25 Node tests, production build, browser smoke test, and Wrangler production dry-run using Node.js 24.
2. The production `SUPABASE_SECRET_KEY` is configured as a Cloudflare Worker secret. Never place it in `wrangler.jsonc`, `.env.example`, frontend variables, or GitHub source.
3. The production publishable key and project URL are configured in `wrangler.jsonc`; production repeats its own bindings because Wrangler environments do not inherit bindings or vars.
4. The additive Supabase migration is applied; `safa_content_records` exists with RLS enabled and no `anon`/`authenticated` grants.
5. The production Worker is deployed at [https://safa-community.yunusaliyevislomjon08.workers.dev](https://safa-community.yunusaliyevislomjon08.workers.dev). Cloudflare deployment version: `7eaacd27-3244-47d8-8d6f-1866f99b9b3a`.
6. No custom domain or DNS change has been made. Add the custom domain under the Worker’s Cloudflare domain settings when the domain is chosen. Enable appropriate Cloudflare WAF managed rules for the zone. Public forms currently use server-side validation, honeypot fields, and Supabase-backed rate limits; Turnstile is not enabled because no site/secret keys have been configured.
7. The repository CI workflow at `.github/workflows/ci.yml` runs tests, TypeScript checking, and the production build on pull requests and pushes to `main`. Connect the GitHub repository through Cloudflare Workers Builds after deciding which branch should publish. Keep production deployment approval in the release process; do not configure an unreviewed automatic production cutover.

### Rollback

Keep the existing Vercel deployment and Supabase Auth project active during the Cloudflare rollout. If a Cloudflare release fails, use Cloudflare deployment history to roll back the Worker and route traffic to the existing Vercel deployment. Do not delete Supabase users, tables, storage objects, or the Vercel project as part of rollback.

### Verification status

Verification: all 25 Node tests pass, lint/TypeScript checks pass, the production build passes, and the Playwright auth/mobile smoke test passes. The browser test mocks authentication and does not verify live Supabase sessions or CRUD. Wrangler production dry-run and deployment passed using Node.js 24. A direct live HTTP probe returned Cloudflare error 1010 from this environment, so public route behavior still needs confirmation from a normal browser/network. `npm audit` could not reach the npm registry (`EAI_AGAIN`), so no current vulnerability result is available.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (framer-motion), Lucide Icons, React Router v7.
- **Backend / Server**: Cloudflare Workers with Hono APIs and Supabase Auth, PostgreSQL, and the Supabase JavaScript SDK. Legacy Express/Supabase API deployment is retained for rollback.
- **Brand Assets**: Custom SVG vector logo (`/public/safa-logo.svg`), high-resolution official portrait (`/public/nargiza_ceo.jpg`).

---
&copy; 2026 SAFA Community Initiative. All rights reserved.
