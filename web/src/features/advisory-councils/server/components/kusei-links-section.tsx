import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";

/** トップの「区の動きを見る」。審議会と入札・契約のページへの入口。 */
export function KuseiLinksSection() {
  const items = [
    {
      href: routes.councils(),
      title: "区の審議会",
      text: "計画づくりなどを話し合う審議会の開催予定と、最新の議事録",
    },
    {
      href: routes.contracts(),
      title: "入札・契約",
      text: "募集中のプロポーザル、発注予定の工事、入札結果と随意契約",
    },
  ] as const;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-bold leading-[1.48] text-black">
          区の動きを見る
        </h2>
        <p className="text-xs text-mirai-text-secondary">
          区のウェブサイトの公開情報から取り込んでいます
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href as Route}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 hover:opacity-80"
          >
            <span className="flex flex-col gap-1">
              <span className="font-bold">{i.title}</span>
              <span className="text-sm text-mirai-text-secondary">
                {i.text}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
