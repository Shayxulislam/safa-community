-- ============================================================
-- SAFA PLATFORM RELATIONAL DATABASE SCHEMA (D1 / SQLite / PostgreSQL)
-- Connecting Hands, Changing Lives
-- ============================================================

-- Users and Administrators
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'editor', 'finance', 'volunteer_manager')),
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization & Founder Profile
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs (Core humanitarian program lines)
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'upcoming', 'completed')),
  location TEXT,
  people_helped TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- "Piece of Our Work" Verified Projects & Activities
CREATE TABLE IF NOT EXISTS work_items (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  supported_community TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'verified', 'published', 'archived')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('verified', 'pending', 'unverified')),
  contribution_amount NUMERIC(12, 2),
  currency TEXT DEFAULT 'UZS',
  report_url TEXT,
  video_url TEXT,
  published_at TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Assets for Work Items Gallery
CREATE TABLE IF NOT EXISTS work_media (
  id TEXT PRIMARY KEY,
  work_item_id TEXT NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Respectful Stories & Outreaches
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  date DATE NOT NULL,
  consent_status TEXT NOT NULL DEFAULT 'verified_consent' CHECK(consent_status IN ('verified_consent', 'anonymized')),
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verified Timeline History
CREATE TABLE IF NOT EXISTS history_entries (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  verified_impact TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verified Impact Statistics
CREATE TABLE IF NOT EXISTS impact_statistics (
  id TEXT PRIMARY KEY,
  metric TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  period TEXT NOT NULL,
  verified_at DATE NOT NULL,
  is_real BOOLEAN DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contributions & Ledger (STRICT PRIVACY: NO raw card numbers stored)
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  contribution_number TEXT UNIQUE NOT NULL, -- e.g. SAFA-2026-000001
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS' CHECK(currency IN ('UZS', 'USD')),
  purpose TEXT NOT NULL,
  project_id TEXT REFERENCES work_items(id) ON DELETE SET NULL,
  project_name TEXT,
  donor_name TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT 0,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('bank_transfer', 'card_checkout', 'cash_office')),
  payment_provider TEXT DEFAULT 'payme_click_stripe',
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed', 'verified', 'pending', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Official Social Channels
CREATE TABLE IF NOT EXISTS social_links (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  handle TEXT,
  enabled BOOLEAN DEFAULT 1,
  display_order INTEGER DEFAULT 0
);

-- Volunteer Applications
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_legal_age_confirmed BOOLEAN DEFAULT 1,
  interests TEXT, -- JSON array of strings
  availability TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'contacted', 'accepted', 'rejected', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Inquiries
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transparency & Audit Reports
CREATE TABLE IF NOT EXISTS transparency_reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('financial', 'project', 'annual', 'audit')),
  year TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  summary TEXT NOT NULL,
  published_at DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Audit Logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT
);
