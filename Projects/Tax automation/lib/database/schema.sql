-- Phase 1 §5 "Calculation History" — production schema (Supabase/PostgreSQL).
--
-- The app ships with a JSON-file adapter for local dev (lib/database/json-adapter.ts)
-- that needs no cloud infra. Swap to this table through the PersistenceAdapter
-- interface once Supabase/PostgreSQL credentials are configured. It records the
-- exact applied rule version (ruleset_id) so no figure is ever attributed to an
-- unverified rule, and JSONB input/result payloads preserve a full auditable
-- snapshot for reopening.
create table if not exists public.calculations (
  id uuid primary key default gen_random_uuid(),
  type text not null,               -- INDIVIDUAL_INCOME | BUSINESS | VAT | WITHHOLDING
  tax_year text not null,
  at_date date not null,            -- assessment / transaction date
  ruleset_id text not null,         -- applied rule version
  input jsonb not null,             -- calculator input payload
  result jsonb not null,            -- calculator result payload (incl. audit trail)
  user_id text,                     -- stable user label (auth is a later phase)
  created_at timestamptz not null default now()
);

create index if not exists calculations_type_created_idx
  on public.calculations (type, created_at desc);

alter table public.calculations enable row level security;
