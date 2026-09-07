-- Create table for session upload tokens (Supabase / Postgres)
create extension if not exists pgcrypto;

create table if not exists session_upload_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  teacher_id uuid,
  subject_ids jsonb,
  class_ids jsonb,
  created_at timestamptz default now(),
  expires_at timestamptz,
  revoked boolean default false
);
create index if not exists idx_session_upload_tokens_token on session_upload_tokens (token);

-- Optional: audit table
create table if not exists session_upload_token_audit (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references session_upload_tokens(id),
  action text,
  actor_id uuid,
  payload jsonb,
  created_at timestamptz default now()
);
