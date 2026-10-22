import { readFileSync } from "node:fs";
import { createAdminClient } from "../shared/helper";

/**
 * 過去の議会年度の会議を、会議録の索引から council_meetings に取り込む。
 *
 * 使い方：pnpm --filter @mirai-gikai/seed import:past-meetings <会議録の_index.json> [開始年度] [終了年度]
 * 年度は議会年度の開始年（令和7年度なら 2025）。省略時は 2023〜2025（令和5〜7年度）。
 *
 * 区サイトの「会議日程」ページは今年度の分しか残っていないため、過去の年度は
 * 実際に開かれた会議（会議録のある会議）から作る。開会時刻・場所は会議録に無いので入れない。
 * 本会議は「○月議会」ごとに最初の号を「初日」、最後の号を「最終日」とし、議会期間を求められるようにする。
 */

const KAIGIROKU_URL = "https://ssp.kaigiroku.net/tenant/sumida/SpTop.html";

type IndexEntry = {
  date: string;
  taikei: string;
  title: string;
  gian?: string[];
};

type Category = "plenary" | "standing" | "special" | "steering" | "other";

const councilYearOf = (date: string) => {
  const [y, m] = date.split("-").map(Number);
  return m >= 5 ? y : y - 1;
};

const toHalfWidth = (s: string) =>
  s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

function categorize(taikei: string, name: string): Category {
  if (taikei === "本会議") return "plenary";
  if (name.startsWith("議会運営委員会")) return "steering";
  if (taikei === "常任委員会") return "standing";
  if (taikei.includes("特別委員会")) return "special";
  return "other";
}

/** 「令和５年度定例会６月議会墨田区議会会議録第1号」→ { period: "6月議会", no: 1 } */
function parsePlenaryTitle(title: string): { period: string; no: number } {
  const t = toHalfWidth(title).replace(/[\s　]+/g, "");
  const period =
    /定例会(.+?)墨田区議会会議録/.exec(t)?.[1] ??
    /年度(.+?臨時会)/.exec(t)?.[1] ??
    "本会議";
  const no = Number(/第(\d+)号/.exec(t)?.[1] ?? 1);
  return { period, no };
}

function main() {
  const [indexPath, fromArg, toArg] = process.argv.slice(2);
  if (!indexPath) {
    throw new Error("会議録の _index.json のパスを指定してください");
  }
  const from = Number(fromArg ?? 2023);
  const to = Number(toArg ?? 2025);

  const entries = (
    JSON.parse(readFileSync(indexPath, "utf-8")) as IndexEntry[]
  ).filter((e) => {
    const y = councilYearOf(e.date);
    return y >= from && y <= to;
  });

  // 本会議の各議会期間で、最初と最後の号を調べる
  const plenaryRange = new Map<string, { min: number; max: number }>();
  for (const e of entries.filter((e) => e.taikei === "本会議")) {
    const { period, no } = parsePlenaryTitle(e.title);
    const key = `${councilYearOf(e.date)}_${period}`;
    const r = plenaryRange.get(key) ?? { min: no, max: no };
    plenaryRange.set(key, { min: Math.min(r.min, no), max: Math.max(r.max, no) });
  }

  const meetings = entries.map((e) => {
    let name = e.title.replace(/記録(_\d+)?$/, "");
    if (e.taikei === "本会議") {
      const { period, no } = parsePlenaryTitle(e.title);
      const r = plenaryRange.get(`${councilYearOf(e.date)}_${period}`);
      // 1日だけの議会（招集議会・緊急議会・臨時会）は初日・最終日を付けない
      const label =
        r && r.min !== r.max && /^\d+月議会$/.test(period)
          ? no === r.min
            ? `${period}初日`
            : no === r.max
              ? `${period}最終日`
              : null
          : period;
      name = label ? `本会議（${label}）` : "本会議";
    }
    return {
      meeting_date: e.date,
      end_date: null,
      name,
      category: categorize(e.taikei, name),
      start_time: null,
      place: null,
      gallery: null,
      topic: null,
      document_url: null,
      council_year: councilYearOf(e.date),
      source_url: KAIGIROKU_URL,
    };
  });
  return { meetings, years: [...new Set(meetings.map((m) => m.council_year))] };
}

async function run() {
  const { meetings, years } = main();
  if (meetings.length === 0) throw new Error("会議が1件も読めませんでした");

  const supabase = createAdminClient();
  const { error: delError } = await supabase
    .from("council_meetings")
    .delete()
    .in("council_year", years);
  if (delError) throw new Error(`削除: ${delError.message}`);
  const { error } = await supabase.from("council_meetings").insert(meetings);
  if (error) throw new Error(`登録: ${error.message}`);

  const byYear = meetings.reduce<Record<number, number>>((acc, m) => {
    acc[m.council_year] = (acc[m.council_year] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`✅ ${meetings.length}件を取り込みました`, byYear);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
