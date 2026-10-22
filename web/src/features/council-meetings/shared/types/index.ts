export type CouncilMeetingCategory =
  | "plenary"
  | "standing"
  | "special"
  | "steering"
  | "other";

/** 区議会の会議予定。区議会サイトの「会議日程」から取り込んだもの。 */
export type CouncilMeeting = {
  id: string;
  meeting_date: string;
  /** 複数日にわたる会議（管外行政調査など）の最終日。1日だけなら null。 */
  end_date: string | null;
  name: string;
  category: CouncilMeetingCategory;
  start_time: string | null;
  place: string | null;
  /** 傍聴席の階（例：17階）。 */
  gallery: string | null;
  topic: string | null;
  document_url: string | null;
  council_year: number;
  source_url: string;
};

/** 議会期間（6月議会など）。本会議の初日から最終日まで。 */
export type CouncilPeriod = {
  /** 例：11月議会 */
  name: string;
  start_date: string;
  end_date: string;
};
