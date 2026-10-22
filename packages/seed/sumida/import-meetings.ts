import { createAdminClient } from "../shared/helper";

/**
 * 区議会サイトの「会議日程」ページを council_meetings に取り込む。
 *
 * 使い方：pnpm --filter @mirai-gikai/seed import:meetings [URL]
 * URL を省くと令和8年度のページを読む。同じ議会年度の行は消してから入れ直す。
 * 区サイトの表は日付の列が rowspan で複数行にまたがるので、それを展開して読む。
 */

const DEFAULT_URL =
  "https://www.city.sumida.lg.jp/kugikai/kaigi_info/nittei/r8nittei.html";

type Category = "plenary" | "standing" | "special" | "steering" | "other";

type Meeting = {
  meeting_date: string;
  end_date: string | null;
  name: string;
  category: Category;
  start_time: string | null;
  place: string | null;
  gallery: string | null;
  topic: string | null;
  document_url: string | null;
  council_year: number;
  source_url: string;
};

type Cell = { text: string; href: string | null };

const STANDING_COMMITTEES = [
  "企画総務委員会",
  "区民福祉委員会",
  "地域産業都市委員会",
  "子ども文教委員会",
];

function decode(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "・")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** 表を行×列の配列にする。rowspan のセルは下の行にも同じ値を置く。 */
function parseTable(
  tableHtml: string,
  baseUrl: string
): { headers: string[]; rows: Cell[][] } {
  const trs = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (m) => m[1]
  );
  const headers: string[] = [];
  const rows: Cell[][] = [];
  // 列番号 → 残り行数と値
  const carry = new Map<number, { left: number; cell: Cell }>();

  for (const tr of trs) {
    if (/<th/i.test(tr)) {
      for (const m of tr.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)) {
        headers.push(decode(m[1]));
      }
      continue;
    }
    const tds = [...tr.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)];
    const row: Cell[] = [];
    let col = 0;
    let i = 0;
    while (i < tds.length || carry.has(col)) {
      const held = carry.get(col);
      if (held) {
        row.push(held.cell);
        held.left -= 1;
        if (held.left === 0) carry.delete(col);
        col++;
        continue;
      }
      const [, attrs, inner] = tds[i++];
      const href = inner.match(/href="([^"]+\.pdf)"/i)?.[1] ?? null;
      const cell: Cell = {
        text: decode(inner),
        href: href ? new URL(href, baseUrl).toString() : null,
      };
      const span = Number(attrs.match(/rowspan="(\d+)"/i)?.[1] ?? 1);
      if (span > 1) carry.set(col, { left: span - 1, cell });
      row.push(cell);
      col++;
    }
    rows.push(row);
  }
  return { headers, rows };
}

function categorize(name: string): Category {
  if (name.startsWith("本会議")) return "plenary";
  if (name.startsWith("議会運営委員会")) return "steering";
  if (STANDING_COMMITTEES.some((c) => name.startsWith(c))) return "standing";
  if (name.includes("特別委員会")) return "special";
  return "other";
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 「10月28日水曜日から30日金曜日まで」「7月16日木曜日・17日金曜日」も読む。 */
function parseDates(
  text: string,
  year: number
): { start: string; end: string | null } | null {
  const m = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (!m) return null;
  const month = Number(m[1]);
  const start = `${year}-${pad(month)}-${pad(Number(m[2]))}`;
  const tail = text.slice((m.index ?? 0) + m[0].length);
  const e = tail.match(/(?:から|・)(?:(\d{1,2})月)?(\d{1,2})日/);
  if (!e) return { start, end: null };
  const endMonth = e[1] ? Number(e[1]) : month;
  const endYear = endMonth < month ? year + 1 : year;
  return { start, end: `${endYear}-${pad(endMonth)}-${pad(Number(e[2]))}` };
}

const blankToNull = (s: string | undefined) =>
  !s || s === "ー" || s === "-" ? null : s;

function parseSchedulePage(html: string, sourceUrl: string): Meeting[] {
  const meetings: Meeting[] = [];
  const sections = html.split(/<h3[^>]*>/i).slice(1);
  let councilYear: number | null = null;

  for (const section of sections) {
    const title = decode(section.split(/<\/h3>/i)[0]);
    const ym = title.match(/令和(\d+)年(\d{1,2})月の(?:開会状況|会議日程)/);
    if (!ym) continue;
    const year = 2018 + Number(ym[1]);
    const month = Number(ym[2]);
    // 議会年度は5月始まり。最初に出てくる月から年度を決める。
    councilYear ??= month >= 5 ? year : year - 1;

    const table = section.match(/<table[\s\S]*?<\/table>/i)?.[0];
    if (!table) continue;
    const { headers, rows } = parseTable(table, sourceUrl);
    const idx = (label: string) => headers.findIndex((h) => h === label);
    const iName = idx("会議名");
    const iTopic = idx("内容");
    const iTime = idx("開会予定時刻");
    const iPlace = idx("場所");
    const iGallery = idx("傍聴");

    for (const row of rows) {
      const dates = parseDates(row[0]?.text ?? "", year);
      const nameCell = row[iName];
      if (!dates || !nameCell?.text) continue;
      const name = nameCell.text.replace(/（PDF：[^）]*）/g, "").trim();
      let place = iPlace >= 0 ? blankToNull(row[iPlace]?.text) : null;
      let topic = iTopic >= 0 ? blankToNull(row[iTopic]?.text) : null;
      // 行政調査の「場所」は調査先の自治体名なので、内容として持つ。
      if (name.includes("行政調査") && place) {
        topic = `調査先：${place}`;
        place = null;
      }
      meetings.push({
        meeting_date: dates.start,
        end_date: dates.end,
        name,
        category: categorize(name),
        start_time: iTime >= 0 ? blankToNull(row[iTime]?.text) : null,
        place,
        gallery: iGallery >= 0 ? blankToNull(row[iGallery]?.text) : null,
        topic,
        document_url: nameCell.href,
        council_year: councilYear,
        source_url: sourceUrl,
      });
    }
  }
  return meetings;
}

async function main() {
  const url = process.argv[2] ?? DEFAULT_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`取得に失敗しました: ${res.status} ${url}`);
  const meetings = parseSchedulePage(await res.text(), url);
  if (meetings.length === 0) throw new Error("会議が1件も読めませんでした");

  const years = [...new Set(meetings.map((m) => m.council_year))];
  const supabase = createAdminClient();
  const { error: delError } = await supabase
    .from("council_meetings")
    .delete()
    .in("council_year", years);
  if (delError) throw new Error(`削除: ${delError.message}`);
  const { error } = await supabase.from("council_meetings").insert(meetings);
  if (error) throw new Error(`登録: ${error.message}`);

  const byCategory = meetings.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`✅ ${meetings.length}件を取り込みました（議会年度 ${years}）`);
  console.log(byCategory);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
