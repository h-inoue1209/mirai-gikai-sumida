-- 区議会の会議予定（本会議・常任委員会・特別委員会・議会運営委員会など）。
-- 区議会サイトの「会議日程」ページを packages/seed/sumida/import-meetings.ts で取り込む。
-- 墨田区議会は通年議会のため、議会期間（○月議会）は本会議の「初日」「最終日」から求める。
create table council_meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  -- 管外行政調査など複数日にわたる会議の最終日。1日だけなら null。
  end_date date,
  name text not null,
  category text not null check (category in ('plenary', 'standing', 'special', 'steering', 'other')),
  -- 区サイトの表記のまま持つ（例：午後1時）
  start_time text,
  place text,
  -- 傍聴席の階（例：17階）
  gallery text,
  -- 内容（過去分）や視察先
  topic text,
  -- 委員会の資料PDF（区サイト）
  document_url text,
  -- 議会年度（5月1日〜翌年4月30日）の開始年。令和8年度なら 2026。
  council_year integer not null,
  source_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index council_meetings_meeting_date_idx on council_meetings (meeting_date);
create index council_meetings_council_year_idx on council_meetings (council_year);

alter table council_meetings enable row level security;
