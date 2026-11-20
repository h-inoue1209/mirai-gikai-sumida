-- 区の審議会と、入札・契約の公開情報（2026-11-20）。
-- データは Claude_job の取得物（区サイトの公開情報）から seed の import:councils・import:contracts が入れる。
-- 読み出しはサーバー側の admin クライアントだけなので、RLS を有効にしてポリシーは作らない（council_meetings と同じ）。

-- 審議会の一覧（区サイト「議事録等の公開（審議会等の会議）」）
create table advisory_councils (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  page_title text,
  -- 会議名の言葉で機械的に振り分けた分野
  field text not null,
  page_url text not null,
  minutes_count integer not null default 0,
  latest_minutes_title text,
  latest_minutes_date date,
  latest_minutes_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 審議会の開催予定（区サイト「会議の開催のご案内」）。過去の回も消さずに残す
create table advisory_meetings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  meeting_date date not null,
  time_text text,
  place text,
  -- 傍聴できるか（区の表記が無ければ null）
  is_public boolean,
  public_text text,
  agenda text,
  capacity text,
  procedure text,
  contact_section text,
  -- 区のページの「○月○日現在の情報」
  as_of date,
  source_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, meeting_date)
);
create index advisory_meetings_meeting_date_idx on advisory_meetings (meeting_date);

-- 入札結果・随意契約（区サイト「契約・入札」。令和5年度〜）
create table contracts (
  id uuid primary key default gen_random_uuid(),
  contract_date date,
  kind text not null check (kind in ('入札', '随契')),
  category text not null,
  title text not null,
  vendor text,
  -- 区の表記のまま（単価契約・不調などは数値にならない）
  amount_text text,
  amount_yen bigint,
  planned_price_text text,
  planned_price_yen bigint,
  industry text,
  department text,
  -- 随意契約の指定理由（区の説明）
  reason text,
  legal_basis text,
  remarks text,
  fiscal_year integer,
  source_url text not null,
  created_at timestamptz not null default now()
);
create index contracts_contract_date_idx on contracts (contract_date);
create index contracts_fiscal_year_idx on contracts (fiscal_year);

-- 募集中のプロポーザルと年間発注予定工事
create table contract_openings (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('proposal', 'planned_work')),
  title text not null,
  deadline date,
  -- proposal: open / closed / unknown、planned_work: planned
  status text not null,
  department text,
  bid_method text,
  work_type text,
  place text,
  summary text,
  schedule_text text,
  source_url text not null,
  created_at timestamptz not null default now()
);

alter table advisory_councils enable row level security;
alter table advisory_meetings enable row level security;
alter table contracts enable row level security;
alter table contract_openings enable row level security;
