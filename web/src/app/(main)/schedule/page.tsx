import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MeetingList } from "@/features/council-meetings/server/components/meeting-list";
import { ScheduleSourceNote } from "@/features/council-meetings/server/components/schedule-source-note";
import { loadCouncilSchedule } from "@/features/council-meetings/server/loaders/load-council-schedule";
import type { CouncilMeeting } from "@/features/council-meetings/shared/types";
import { formatCouncilYear } from "@/features/council-meetings/shared/utils/council-period";
import { routes } from "@/lib/routes";
import { getJapanTime } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "会議の予定 | みらい議会@墨田区",
  description:
    "墨田区議会の本会議・常任委員会・特別委員会・議会運営委員会の予定です。",
};

/** 会議を開始日の月ごとに分ける。 */
function groupByMonth(meetings: CouncilMeeting[]) {
  const groups: { month: string; items: CouncilMeeting[] }[] = [];
  for (const m of meetings) {
    const [y, mo] = m.meeting_date.split("-").map(Number);
    const month = `${y}年${mo}月`;
    const last = groups.at(-1);
    if (last?.month === month) last.items.push(m);
    else groups.push({ month, items: [m] });
  }
  return groups;
}

export default async function SchedulePage() {
  const { status, meetings, upcoming } = await loadCouncilSchedule(
    getJapanTime()
  );
  const upcomingIds = new Set(upcoming.map((m) => m.id));
  // 終わった会議は新しい順に。直近の結果を探す人の方が多い。
  const past = meetings.filter((m) => !upcomingIds.has(m.id)).reverse();

  return (
    <Container className="pt-24 pb-12 md:pt-8">
      <div className="mb-3">
        <Breadcrumb
          items={[
            { label: "トップ", href: routes.home() },
            { label: "会議の予定" },
          ]}
        />
      </div>

      <h1 className="mb-3 text-3xl font-bold">会議の予定</h1>
      <p className="mb-8 text-sm leading-6 text-mirai-text-secondary">
        {formatCouncilYear(status.councilYear)}
        の墨田区議会の会議予定です。墨田区議会は通年議会のため、会期は5月1日から翌年4月30日までです。本会議は6月・9月・11月・2月の議会期間に開かれます。
      </p>

      {upcoming.length > 0 ? (
        <div className="flex flex-col gap-10">
          {groupByMonth(upcoming).map((g) => (
            <section key={g.month} className="flex flex-col gap-4">
              <h2 className="text-[22px] font-bold">{g.month}</h2>
              <MeetingList meetings={g.items} />
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-mirai-text-secondary">
          現在、予定されている会議はありません
        </p>
      )}

      {meetings.length > 0 && (
        <div className="mt-8">
          <ScheduleSourceNote sourceUrl={meetings[0].source_url} />
        </div>
      )}

      {past.length > 0 && (
        <details className="mt-12">
          <summary className="cursor-pointer text-[18px] font-bold">
            これまでの会議（{past.length}件）
          </summary>
          <div className="mt-6 flex flex-col gap-10">
            {groupByMonth(past).map((g) => (
              <section key={g.month} className="flex flex-col gap-4">
                <h3 className="text-lg font-bold">{g.month}</h3>
                <MeetingList meetings={g.items} />
              </section>
            ))}
          </div>
        </details>
      )}
    </Container>
  );
}
