// 共通の帯（すみだポータルのサイト群。2026-11-20 本人「進めて」。設計：Claude_job/資料/すみだサイト群_全体設計.md 3.）
// 画面の最上部に固定（ヘッダーが浮いた形なので、帯の高さ 28px 分だけヘッダーを下げている：header-client.tsx の top-11）
// 並びは親の https://sumida.gorisan.info/sites.json を1日1回読む。読めないときは下の控え
type BandSite = { id: string; short: string; url: string };

const PARENT_URL = "https://sumida.gorisan.info";
const FALLBACK: BandSite[] = [
  { id: "event", short: "イベント", url: "https://sumida-event.gorisan.info" },
  { id: "kodomo", short: "子育て", url: "https://sumida-kodomo.gorisan.info" },
  { id: "yosan", short: "区のお金", url: "https://sumida-yosan.gorisan.info" },
  {
    id: "gikai",
    short: "区議会",
    url: "https://mirai-gikai-sumida.gorisan.info",
  },
  {
    id: "chokai",
    short: "町会・自治会",
    url: "https://sumida-chokai.gorisan.info",
  },
];

async function getSites(): Promise<BandSite[]> {
  try {
    const res = await fetch(`${PARENT_URL}/sites.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as { sites?: BandSite[] };
    if (j.sites?.length) return j.sites;
  } catch {
    // 控えを使う
  }
  return FALLBACK;
}

export async function SiteBand() {
  const sites = await getSites();
  return (
    <>
      <nav
        aria-label="すみだポータルのサイト"
        className="fixed top-0 left-0 right-0 z-50 h-7 bg-[#23364a] text-white text-[13px]"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 overflow-x-auto whitespace-nowrap px-4 [scrollbar-width:none]">
          <a
            href={PARENT_URL}
            className="rounded-full px-2 py-0.5 font-bold opacity-85 hover:opacity-100"
          >
            すみだポータル
          </a>
          <div className="flex gap-0.5">
            {sites.map((s) =>
              s.id === "gikai" ? (
                <a
                  key={s.id}
                  href={s.url}
                  aria-current="page"
                  className="rounded-full bg-white px-2 py-0.5 font-bold text-[#23364a]"
                >
                  {s.short}
                </a>
              ) : (
                <a
                  key={s.id}
                  href={s.url}
                  className="rounded-full px-2 py-0.5 opacity-85 hover:bg-white/10 hover:opacity-100"
                >
                  {s.short}
                </a>
              )
            )}
          </div>
        </div>
      </nav>
      <div aria-hidden className="h-7" />
    </>
  );
}
