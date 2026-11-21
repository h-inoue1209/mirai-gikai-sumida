// トップの「すみだポータルのテーマ別のサイト」（自分以外のサイトのカード。2026-11-21 本人「イベントのTOPのように、他のサイトにも」）
// 一覧は親の sites.json（site-band.tsx の getSites）。名前は「すみだ」を付けない短い名前
import { getSites, Mark } from "@/components/layouts/site-band";

const PARENT_URL = "https://sumida.gorisan.info";

export async function OtherSites() {
  const sites = (await getSites()).filter((s) => s.id !== "gikai");
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
              className="flex flex-col gap-1.5 rounded-2xl bg-white p-4 text-[#23364a] hover:shadow-md"
            >
              <Mark id={s.mark ?? s.id} color={s.color} />
              <b className="text-lg leading-snug">{s.short}</b>
              <span className="text-sm text-gray-600">{s.text}</span>
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
