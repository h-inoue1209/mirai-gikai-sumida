import { ExternalLink, FileText } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  getAdvisoryCouncils,
  getUpcomingAdvisoryMeetings,
} from "@/features/advisory-councils/server/loaders/get-advisory-councils";
import {
  type AdvisoryCouncil,
  type AdvisoryMeeting,
  COUNCIL_FIELDS,
  formatJpDate,
} from "@/features/advisory-councils/shared/types";
import { routes } from "@/lib/routes";
import { getJapanTime } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "区の審議会 | みらい議会@墨田区",
  description:
    "墨田区の審議会・協議会などの開催予定と、最新の議事録の一覧です。区のウェブサイトの公開情報から取り込んでいます。",
};

const KAISAI_URL =
  "https://www.city.sumida.lg.jp/kuseijoho/joho_kojin_kaigi/kaigi_koukai/kaigi_kaisai.html";
const LIST_URL =
  "https://www.city.sumida.lg.jp/kuseijoho/joho_kojin_kaigi/kakusyu_giziroku/index.html";

function todayJst(): string {
  const d = getJapanTime();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function CouncilsPage() {
  const [councils, meetings] = await Promise.all([
    getAdvisoryCouncils(),
    getUpcomingAdvisoryMeetings(todayJst()),
  ]);
  const byField = COUNCIL_FIELDS.map((f) => ({
    field: f,
    items: councils.filter((c) => c.field === f),
  })).filter((g) => g.items.length > 0);

  return (
    <Container className="pt-24 pb-12 md:pt-8">
      <div className="mb-3">
        <Breadcrumb
          items={[
            { label: "トップ", href: routes.home() },
            { label: "区の審議会" },
          ]}
        />
      </div>

      <h1 className="mb-3 text-3xl font-bold">区の審議会</h1>
      <p className="mb-8 text-sm leading-6 text-mirai-text-secondary">
        区は、計画づくりや制度の見直しのときに、学識経験者や区民などが加わる審議会・協議会を開いています。議会に議案や報告が出る前の議論が分かります。開催予定と議事録は区のウェブサイトの公開情報から取り込んでいます。
      </p>

      <section className="mb-12 flex flex-col gap-4">
        <h2 className="text-[22px] font-bold">今後の開催</h2>
        {meetings.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {meetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-white px-5 py-8 text-center text-sm text-mirai-text-secondary">
            区のページに掲載されている開催予定はありません
          </p>
        )}
        <p className="text-xs text-mirai-text-secondary">
          出典：
          <a
            href={KAISAI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            墨田区「会議の開催のご案内」
          </a>
          {meetings[0]?.as_of &&
            `（${formatJpDate(meetings[0].as_of)}現在の情報）`}
          。傍聴の申込みは区の担当へ。日時・場所は変わることがあるので、区のページで確かめてください。
        </p>
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-[22px] font-bold">
            審議会の一覧（{councils.length}）
          </h2>
          <p className="text-xs leading-5 text-mirai-text-secondary">
            最新の議事録は令和5年度以降に区のページに載ったものです。議事録の多くは区が作った要旨で、発言の全文とは限りません。分野は会議名から機械的に分けています。
          </p>
        </div>
        {byField.map((g) => (
          <div key={g.field} className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">{g.field}</h3>
            <ul className="flex flex-col gap-2">
              {g.items.map((c) => (
                <CouncilRow key={c.id} council={c} />
              ))}
            </ul>
          </div>
        ))}
        <p className="text-xs text-mirai-text-secondary">
          出典：
          <a
            href={LIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            墨田区「議事録等の公開（審議会等の会議）」
          </a>
        </p>
      </section>
    </Container>
  );
}

function MeetingCard({ meeting: m }: { meeting: AdvisoryMeeting }) {
  return (
    <li className="flex flex-col gap-2 rounded-2xl bg-white px-5 py-4">
      <div className="text-[15px] font-bold text-mirai-brand-teal-deep">
        {formatJpDate(m.meeting_date)}
        {m.time_text && <span className="ml-2 font-normal">{m.time_text}</span>}
      </div>
      <div className="text-base font-bold">{m.name}</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-mirai-text-secondary">
        {m.place && <span>{m.place}</span>}
        {m.is_public !== null && (
          <span
            className={
              m.is_public ? "font-bold text-mirai-brand-teal-deep" : "font-bold"
            }
          >
            {m.is_public ? "傍聴できます" : "非公開"}
          </span>
        )}
        {m.capacity && <span>定員 {m.capacity}</span>}
      </div>
      {m.agenda && (
        <div className="whitespace-pre-line text-sm leading-6">
          <span className="font-bold">議題：</span>
          {m.agenda}
        </div>
      )}
      {m.procedure && (
        <div className="text-xs leading-5 text-mirai-text-secondary">
          {m.procedure}
        </div>
      )}
      {m.contact_section && (
        <div className="text-xs text-mirai-text-secondary">
          問い合わせ：{m.contact_section}（電話番号などは区のページで）
        </div>
      )}
    </li>
  );
}

function CouncilRow({ council: c }: { council: AdvisoryCouncil }) {
  return (
    <li className="flex flex-col gap-1 rounded-2xl bg-white px-5 py-3 md:flex-row md:items-center md:gap-6">
      <a
        href={c.page_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-bold underline-offset-2 hover:underline md:w-80 md:shrink-0"
      >
        {c.name}
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
      </a>
      <div className="flex-1 text-sm">
        {c.latest_minutes_url ? (
          <a
            href={c.latest_minutes_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1 text-primary underline underline-offset-2"
          >
            <FileText className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              最新の議事録：{c.latest_minutes_title}
              {c.latest_minutes_date &&
                `（${formatJpDate(c.latest_minutes_date)}）`}
            </span>
          </a>
        ) : (
          <span className="text-mirai-text-secondary">
            令和5年度以降の議事録の掲載はありません
          </span>
        )}
      </div>
    </li>
  );
}
