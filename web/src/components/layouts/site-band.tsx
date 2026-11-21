// 共通の帯（すみだポータルのサイト群。設計：Claude_job/資料/すみだサイト群_全体設計.md 3.・11.）
// 2026-11-21 再編：ほかのサイトは「テーマ別のサイト▾」にたたむ（本人決定）。マークは線の絵、色はサイトごと
// 画面の最上部に固定（ヘッダーが浮いた形なので、帯の高さ 28px 分だけヘッダーを下げている：header-client.tsx の top-11）
// 並びは親の https://sumida.gorisan.info/sites.json を1日1回読む。読めないときは下の控え
export type BandSite = {
  id: string;
  short: string;
  url: string;
  text: string;
  mark?: string;
  color?: string;
};

const PARENT_URL = "https://sumida.gorisan.info";
export const FALLBACK: BandSite[] = [
  {
    id: "event",
    short: "イベント",
    url: "https://sumida-event.gorisan.info",
    mark: "event",
    color: "#D85A30",
    text: "区内の催しを、元の情報までたどって日付順に",
  },
  {
    id: "kodomo",
    short: "子ども・子育て",
    url: "https://sumida-kodomo.gorisan.info",
    mark: "kodomo",
    color: "#1680d6",
    text: "保育園・学童の空きと、指数の目安",
  },
  {
    id: "chokai",
    short: "町会・自治会",
    url: "https://sumida-chokai.gorisan.info",
    mark: "chokai",
    color: "#3B6D11",
    text: "住所や地図から、町会・自治会をさがす",
  },
  {
    id: "yosan",
    short: "区のお金",
    url: "https://sumida-yosan.gorisan.info",
    mark: "yosan",
    color: "#BA7517",
    text: "区の予算と決算を、図でたどる",
  },
  {
    id: "gikai",
    short: "区議会",
    url: "https://mirai-gikai-sumida.gorisan.info",
    mark: "gikai",
    color: "#2aa693",
    text: "区議会の議案や議論を、わかりやすく",
  },
];

const PATHS: Record<string, string[]> = {
  event: [
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
    "M16 3v4",
    "M8 3v4",
    "M3 11h18",
    "M8 15h2v2H8z",
  ],
  kodomo: [
    "M5 18v-6a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z",
    "M10 6V5a2 2 0 1 1 4 0v1",
    "M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4",
    "M11 10h2",
  ],
  yosan: [
    "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z",
    "M9 7l3 4l3-4",
    "M12 11v6",
    "M9 12.5h6",
    "M9 15h6",
  ],
  gikai: [
    "M3 21h18",
    "M3 10l9-6l9 6",
    "M4 10h16",
    "M6 10v11",
    "M10 10v11",
    "M14 10v11",
    "M18 10v11",
  ],
  chokai: [
    "M5 12H3l9-9l9 9h-2",
    "M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7",
    "M10 21v-5h4v5",
  ],
};

export async function getSites(): Promise<BandSite[]> {
  try {
    const res = await fetch(`${PARENT_URL}/sites.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as { sites?: BandSite[] };
    if (j.sites?.length) {
      return j.sites.map((s) => {
        const f = FALLBACK.find((x) => x.id === s.id);
        return { ...f, ...s, mark: s.mark ?? s.id, color: s.color ?? f?.color };
      });
    }
  } catch {
    // 控えを使う
  }
  return FALLBACK;
}

export function Mark({ id, color }: { id: string; color?: string }) {
  return (
    <span
      aria-hidden
      className="inline-grid size-[30px] shrink-0 place-items-center rounded-full text-white"
      style={{ background: color ?? "#23364a" }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {(PATHS[id] ?? []).map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}

/** 「他のテーマのサイト▾」（帯＝PC と、ヘッダー＝スマホの両方で使う。本人 11/21「テーマ別のサイト→他のテーマのサイト」） */
export function ThemeDetails({
  sites,
  variant,
}: {
  sites: BandSite[];
  variant: "band" | "head";
}) {
  const summary =
    variant === "band"
      ? "cursor-pointer list-none rounded-full border border-white/35 px-4 py-1.5 text-sm hover:bg-white/10 group-open:bg-white/10 [&::-webkit-details-marker]:hidden"
      : "cursor-pointer list-none rounded-full border-[1.5px] border-[#d6e5f1] bg-white px-3 py-1.5 text-[13px] font-bold leading-tight text-[#23364a] group-open:bg-[#eaf4fc] [&::-webkit-details-marker]:hidden";
  return (
    <details
      className={`group relative ${variant === "band" ? "ml-auto" : ""}`}
    >
      {variant === "band" ? (
        <summary className={summary}>他のテーマのサイト ▾</summary>
      ) : (
        // スマホ：ハンバーガーと同じ「絵＋小さな字」の形（本人 11/21）
        <summary
          aria-label="他のテーマのサイト"
          className="grid cursor-pointer list-none justify-items-center gap-0.5 rounded-lg px-1.5 py-1 text-[#23364a] group-open:bg-[#eaf4fc] [&::-webkit-details-marker]:hidden"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="6" height="6" rx="1" />
            <rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" />
            <rect x="14" y="14" width="6" height="6" rx="1" />
          </svg>
          {/* 絵の下に小さな字（他のサイトと同じ。本人 11/21） */}
          <small className="whitespace-nowrap font-bold text-[10px] leading-tight">
            他のテーマ
          </small>
        </summary>
      )}
      <div
        className={`z-[70] rounded-2xl bg-white p-2 text-[#23364a] shadow-xl ${variant === "band" ? "absolute right-0 top-[calc(100%+8px)] w-[min(340px,calc(100vw-32px))]" : "fixed right-3 top-[84px] w-[min(360px,calc(100vw-24px))]"}`}
      >
        <ul className="grid gap-0.5">
          {sites.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                aria-current={s.id === "gikai" ? "page" : undefined}
                className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#eaf4fc] aria-[current=page]:bg-[#eaf4fc]"
              >
                <Mark id={s.mark ?? s.id} color={s.color} />
                <span>
                  <b className="block text-[15px] leading-tight">{s.short}</b>
                  <small className="block text-xs leading-snug text-[#5d7186]">
                    {s.text}
                  </small>
                </span>
              </a>
            </li>
          ))}
          <li className="mt-1 border-t border-[#d6e5f1] pt-1 text-right">
            <a
              href={PARENT_URL}
              className="inline-block px-2.5 py-2 text-[13px] font-bold text-[#1680d6]"
            >
              すみだポータルのトップへ →
            </a>
          </li>
        </ul>
      </div>
    </details>
  );
}

// 帯は PC（幅641px以上）だけ。太さ 44px（本人 11/21「狭くて押しづらい」）。スマホは header-client.tsx のハンバーガーの左横に ThemeDetails
export async function SiteBand() {
  const sites = await getSites();
  return (
    <>
      <nav
        aria-label="すみだポータル"
        className="fixed top-0 left-0 right-0 z-[60] h-11 bg-[#23364a] text-sm text-white max-[640px]:hidden"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4">
          <a href={PARENT_URL} className="font-bold tracking-wide">
            すみだポータル
          </a>
          <ThemeDetails sites={sites} variant="band" />
        </div>
      </nav>
      <div aria-hidden className="h-11 max-[640px]:hidden" />
    </>
  );
}
