import { loadCouncilSchedule } from "@/features/council-meetings/server/loaders/load-council-schedule";
import type { CouncilMeeting } from "@/features/council-meetings/shared/types";
import { getJapanTime } from "@/lib/utils/date";

/**
 * 区議会の今日の会議と次の会議日の予定（公開API）。
 *
 * - 2026-11-21 本人「すみだポータルに議会の本日の予定、次の日程を載せてほしい」で追加。
 *   すみだポータル（sumida.gorisan.info）のトップが読む
 * - 中身は区議会サイトの「会議日程」から取り込んだ公開情報だけ（会議名・日付・時刻・場所）
 * - どのサイトからも読めるよう CORS を開け、CDN で10分ためる
 */
export const revalidate = 600;

const pick = (m: CouncilMeeting) => ({
  date: m.meeting_date,
  end_date: m.end_date,
  name: m.name,
  start_time: m.start_time,
  place: m.place,
});

export async function GET() {
  try {
    const s = await loadCouncilSchedule(getJapanTime());
    return Response.json(
      {
        today: s.today,
        period: s.status.currentPeriod?.name ?? null,
        nextPeriod: s.status.nextPeriod
          ? {
              name: s.status.nextPeriod.name,
              start_date: s.status.nextPeriod.start_date,
            }
          : null,
        todayMeetings: s.todayMeetings.map(pick),
        nextMeetings: s.nextMeetings.map(pick),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[OpenData] council schedule read failed:", error);
    return Response.json(
      { error: "サーバー内部でエラーが発生しました" },
      { status: 500 }
    );
  }
}
