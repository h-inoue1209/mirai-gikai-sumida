/** 区の審議会（区サイト「議事録等の公開（審議会等の会議）」から取り込み） */
export type AdvisoryCouncil = {
  id: string;
  name: string;
  field: string;
  page_url: string;
  minutes_count: number;
  latest_minutes_title: string | null;
  latest_minutes_date: string | null;
  latest_minutes_url: string | null;
};

/** 審議会の開催予定（区サイト「会議の開催のご案内」から取り込み） */
export type AdvisoryMeeting = {
  id: string;
  name: string;
  meeting_date: string;
  time_text: string | null;
  place: string | null;
  is_public: boolean | null;
  public_text: string | null;
  agenda: string | null;
  capacity: string | null;
  procedure: string | null;
  contact_section: string | null;
  as_of: string | null;
  source_url: string;
};

/** 分野の並び順（会議名の言葉で機械的に振り分けたもの） */
export const COUNCIL_FIELDS = [
  "子育て・教育",
  "健康・福祉",
  "まちづくり・環境",
  "防災・安全",
  "産業・文化",
  "区政運営",
] as const;

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-11-20" → "2026年11月20日（金）" */
export function formatJpDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const w = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日（${w}）`;
}
