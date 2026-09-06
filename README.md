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
  - Role-Based Access Control (Super Admin, Editor, Moderator, Analyst, Financial Lead).
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

# 3. Create .env file (optional, for Gemini or Telegram Bot integration)
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
- **Default Super Admin Password**: `NargizaSAFA1org`
- Role switcher allows simulating Super Admin, Editor, Moderator, Analyst, and Financial Lead roles in development mode.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (framer-motion), Lucide Icons, React Router v7.
- **Backend / Server**: Express, TypeScript, Vite SSR middleware for dev, esbuild bundling for production.
- **Brand Assets**: Custom SVG vector logo (`/public/safa-logo.svg`), high-resolution official portrait (`/public/nargiza_ceo.jpg`).

---
&copy; 2026 SAFA Community Initiative. All rights reserved.
