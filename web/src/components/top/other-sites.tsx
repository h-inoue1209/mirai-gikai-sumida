// トップの「すみだポータルのテーマ別のサイト」（全サイトのカード。自分も含め同じ並び＝本人 11/21「自分は除かなくてよい。揃えて」。2026-11-21 本人「イベントのTOPのように、他のサイトにも」）
// 一覧は親の sites.json（site-band.tsx の getSites）。名前は「すみだ」を付けない短い名前
import { getSites, Mark } from "@/components/layouts/site-band";

const PARENT_URL = "https://sumida.gorisan.info";

export async function OtherSites() {
  const sites = await getSites();
  return (
    <section aria-labelledby="other-sites-title" className="py-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="other-sites-title" className="text-2xl font-bold">
            すみだポータルのテーマ別のサイト
          </h2>
          <p className="text-sm text-gray-600">
            墨田区のくらしを、テーマごとに詳しく調べられるサイトです。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sites.map((s) => (
            <a
              key={s.id}
              href={s.url}
              aria-current={s.id === "gikai" ? "page" : undefined}
              className="relative flex flex-col gap-1.5 rounded-2xl bg-white p-4 text-[#23364a] hover:shadow-md aria-[current=page]:ring-2 aria-[current=page]:ring-[#2aa693]"
            >
              <Mark id={s.mark ?? s.id} color={s.color} />
              <b className="text-lg leading-snug">{s.short}</b>
              <span className="text-sm text-gray-600">{s.text}</span>
              {s.id === "gikai" && (
                <em className="absolute right-3 top-3 rounded-full bg-[#23364a] px-2 py-0.5 text-[11px] font-bold not-italic text-white">
                  このサイト
                </em>
              )}
            </a>
          ))}
        </div>
        <a
          href={PARENT_URL}
          className="self-start text-sm font-bold text-primary-accent"
        >
          すみだポータルのトップへ →
        </a>
      </div>
    </section>
  );
}
