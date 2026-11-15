-- Additive storage for existing browser-managed CMS records.
create table if not exists public.safa_content_records (
  collection text not null check (collection in (
    'articles', 'videos', 'photo_albums', 'media_assets', 'announcements', 'impact_statistics',
    'programs', 'work_items', 'stories', 'history_entries', 'contributions', 'transparency_reports',
    'events', 'donation_campaigns', 'social_links', 'founder_profile', 'bank_config', 'audit_logs',
    'story_drafts'
  )),
  record_id text not null,
  slug text,
  title text,
  status text,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (collection, record_id)
);

create index if not exists safa_content_records_collection_updated_idx
  on public.safa_content_records (collection, updated_at desc);
create index if not exists safa_content_records_collection_title_idx
  on public.safa_content_records (collection, title);

alter table public.safa_content_records enable row level security;
revoke all on public.safa_content_records from public, anon, authenticated;
grant select, insert, update, delete on public.safa_content_records to service_role;
