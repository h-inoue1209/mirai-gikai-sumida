/**
 * 行政計画（status = "plan"）の段階。
 *
 * 区のパブリックコメント期間から決める。期間が未定のうちは「意見募集中」で、
 * AIインタビューで意見を集める。期間に入ったら区の募集ページへ案内し、
 * AIでの受付は止める（区の正式な手続きと並べて受け付けないため）。
 */
export type PlanPhase = "opinion" | "public_comment" | "after_public_comment";

interface PlanPhaseInput {
  public_comment_start?: string | null;
  public_comment_end?: string | null;
}

/** "YYYY-MM-DD" を日本時刻の日付として比べるため、日付文字列どうしで比較する。 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getPlanPhase(bill: PlanPhaseInput, now: Date): PlanPhase {
  const today = toDateKey(now);
  const start = bill.public_comment_start;
  const end = bill.public_comment_end;

  if (!start || today < start) return "opinion";
  if (!end || today <= end) return "public_comment";
  return "after_public_comment";
}

export const PLAN_PHASE_LABELS: Record<PlanPhase, string> = {
  opinion: "意見募集中",
  public_comment: "区のパブコメ中",
  after_public_comment: "パブコメ終了",
};

/** "2026-12-01" → "12月1日" */
export function formatMonthDay(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}月${Number(d)}日`;
}
