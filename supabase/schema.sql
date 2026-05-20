-- LocumLex candidate schema
-- Run this in the Supabase SQL editor to set up the database.

-- Candidate status enum
create type candidate_status as enum ('pending_review', 'approved', 'rejected');

-- Candidates table
create table if not exists candidates (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Personal details
  first_name          text not null,
  last_name           text not null,
  email               text not null unique,
  mobile              text not null,

  -- Professional profile
  practice_area       text not null,
  pqe_years           integer not null check (pqe_years >= 0),
  availability        text not null,
  hourly_rate_gbp     numeric(8, 2) not null check (hourly_rate_gbp > 0),
  case_mgmt_systems   text[] not null default '{}',
  matter_experience   text not null,

  -- CV
  cv_storage_path     text,
  cv_filename         text,

  -- AI-generated fields
  ai_summary          text,
  ai_extracted_skills text[],
  ai_processed_at     timestamptz,

  -- Admin
  status              candidate_status not null default 'pending_review',
  internal_notes      text
);

-- Auto-update updated_at on row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger candidates_updated_at
  before update on candidates
  for each row execute function set_updated_at();

-- Index for common lookups
create index if not exists candidates_status_idx on candidates (status);
create index if not exists candidates_email_idx on candidates (email);

-- Storage bucket for CVs (run separately in Supabase dashboard or via API)
-- Bucket name: candidate-cvs
-- Public: false
-- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword
-- Max file size: 5242880 (5 MB)
