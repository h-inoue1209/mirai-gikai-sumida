import { ExternalLink } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatJpDate } from "@/features/advisory-councils/shared/types";
import {
  getContractBillIds,
  getContractOpenings,
  getContracts,
  getContractYears,
} from "@/features/contracts/server/loaders/get-contracts";
import {
  type Contract,
  type ContractFilter,
  type ContractOpening,
  normalizeTitle,
  PAGE_SIZE,
  parseContractFilter,
  reiwaLabel,
} from "@/features/contracts/shared/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "入札・契約 | みらい議会@墨田区",
  description:
    "墨田区の入札結果・随意契約と、募集中のプロポーザル・発注予定の工事です。区のウェブサイトの公開情報から取り込んでいます。",
};

const KEIYAKU_URL =
  "https://www.city.sumida.lg.jp/sangyo_jigyosya/keiyaku_nyuusatu/index.html";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function query(f: ContractFilter, page: number): string {
  const p = new URLSearchParams();
  if (f.year) p.set("year", String(f.year));
  if (f.kind) p.set("kind", f.kind);
  if (f.category) p.set("category", f.category);
  if (f.q) p.set("q", f.q);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default async function ContractsPage({ searchParams }: Props) {
  const filter = parseContractFilter(await searchParams);
  const [{ rows, total }, years, openings, billIdPairs] = await Promise.all([
    getContracts(filter),
    getContractYears(),
    getContractOpenings(),
    getContractBillIds(),
  ]);
  const billIds = new Map(billIdPairs);
  const proposals = openings.filter((o) => o.kind === "proposal");
  const openProposals = proposals.filter((o) => o.status !== "closed");
  const closedProposals = proposals.filter((o) => o.status === "closed");
  const planned = openings.filter((o) => o.kind === "planned_work");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = routes.contracts();

  return (
    <Container className="pt-24 pb-12 md:pt-8">
      <div className="mb-3">
        <Breadcrumb
          items={[
            { label: "トップ", href: routes.home() },
            { label: "入札・契約" },
          ]}
        />
      </div>

      <h1 className="mb-3 text-3xl font-bold">入札・契約</h1>
      <p className="mb-8 text-sm leading-6 text-mirai-text-secondary">
        区が公開している入札結果・随意契約一覧と、募集中のプロポーザル・発注予定の工事をまとめました。区のお金がどこにどう使われるかを確かめる手がかりです。金額などを引用するときは、各行の「区の原本」で確かめてください。
      </p>

      {/* 募集中・これから */}
      <section className="mb-12 flex flex-col gap-4">
        <h2 className="text-[22px] font-bold">募集中・これから</h2>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">募集中のプロポーザル</h3>
          {openProposals.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {openProposals.map((o) => (
                <OpeningRow key={o.id} opening={o} />
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-white px-5 py-6 text-center text-sm text-mirai-text-secondary">
              受付中のプロポーザルはありません
            </p>
          )}
          {closedProposals.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-mirai-text-secondary">
                受付が終わったもの（区のページに掲載中 {closedProposals.length}
                件）
              </summary>
              <ul className="mt-2 flex flex-col gap-2">
                {closedProposals.map((o) => (
                  <OpeningRow key={o.id} opening={o} />
                ))}
              </ul>
            </details>
          )}
        </div>
        {planned.length > 0 && (
          <details className="rounded-2xl bg-white px-5 py-4">
            <summary className="cursor-pointer text-lg font-bold">
              今年度の発注予定の工事（{planned.length}件）
            </summary>
            <ul className="mt-4 flex flex-col divide-y divide-mirai-surface-muted text-sm">
              {planned.map((o) => (
                <li key={o.id} className="flex flex-col gap-1 py-3">
                  <div className="font-bold">{o.title}</div>
                  <div className="text-mirai-text-secondary">
                    {[o.work_type, o.bid_method, o.schedule_text, o.department]
                      .filter(Boolean)
                      .join("／")}
                  </div>
                  {o.summary && <div>{o.summary}</div>}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-mirai-text-secondary">
              「予定時期」は入札の執行予定月（随意契約は契約予定月）。予定は変わることがあります。
              <a
                href={planned[0].source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline underline-offset-2"
              >
                区の原本（PDF）
              </a>
            </p>
          </details>
        )}
        <p className="text-xs leading-5 text-mirai-text-secondary">
          個別の入札公告（件名・締切）は、東京都と区市町村の「電子調達サービス」に載っています。区のページから照会できます。
        </p>
      </section>

      {/* 結果 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[22px] font-bold">入札結果・随意契約</h2>
        <form
          action={base}
          className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 md:flex-row md:flex-wrap md:items-end"
        >
          <Select
            label="年度"
            name="year"
            value={filter.year ? String(filter.year) : ""}
          >
            <option value="">すべて</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {reiwaLabel(y)}
              </option>
            ))}
          </Select>
          <Select label="種類" name="kind" value={filter.kind ?? ""}>
            <option value="">すべて</option>
            <option value="入札">入札</option>
            <option value="随契">随意契約</option>
          </Select>
          <Select label="区分" name="category" value={filter.category ?? ""}>
            <option value="">すべて</option>
            <option value="工事">工事</option>
            <option value="物品・委託">物品・委託</option>
          </Select>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-bold">言葉（件名・相手方・担当課）</span>
            <input
              type="search"
              name="q"
              defaultValue={filter.q ?? ""}
              placeholder="例：システム、学校、公園"
              className="rounded-lg border border-mirai-surface-muted px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white"
          >
            絞り込む
          </button>
        </form>

        <p className="text-sm text-mirai-text-secondary">
          {total.toLocaleString()}件
          {pages > 1 && `（${filter.page} / ${pages}ページ）`}
        </p>

        {rows.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {rows.map((c) => (
              <ContractRow key={c.id} contract={c} billIds={billIds} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-white px-5 py-8 text-center text-sm text-mirai-text-secondary">
            条件に合う契約はありません
          </p>
        )}

        {pages > 1 && (
          <nav className="flex justify-between text-sm font-bold">
            {filter.page > 1 ? (
              <Link
                href={`${base}${query(filter, filter.page - 1)}` as Route}
                className="text-primary underline underline-offset-2"
              >
                ← 前の{PAGE_SIZE}件
              </Link>
            ) : (
              <span />
            )}
            {filter.page < pages && (
              <Link
                href={`${base}${query(filter, filter.page + 1)}` as Route}
                className="text-primary underline underline-offset-2"
              >
                次の{PAGE_SIZE}件 →
              </Link>
            )}
          </nav>
        )}

        <p className="text-xs leading-5 text-mirai-text-secondary">
          出典：
          <a
            href={KEIYAKU_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            墨田区「契約・入札」
          </a>
          の入札結果（工事・物品委託）と随意契約一覧（令和5年度以降）。物品・委託の落札金額は、単価契約は税抜、それ以外は税込（区の表示どおり）。随意契約の理由は区の説明です。
        </p>
      </section>
    </Container>
  );
}

function Select({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-bold">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="rounded-lg border border-mirai-surface-muted px-3 py-2"
      >
        {children}
      </select>
    </label>
  );
}

function OpeningRow({ opening: o }: { opening: ContractOpening }) {
  return (
    <li className="flex flex-col gap-1 rounded-2xl bg-white px-5 py-3 md:flex-row md:items-center md:gap-6">
      <a
        href={o.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-start gap-1 font-bold underline-offset-2 hover:underline"
      >
        {o.title}
        <ExternalLink className="mt-1 size-3.5 shrink-0" aria-hidden />
      </a>
      <div className="shrink-0 text-sm text-mirai-text-secondary">
        {o.deadline
          ? `${o.status === "closed" ? "締切済み" : "提出期限"} ${formatJpDate(o.deadline)}`
          : "期限は区のページで確認"}
      </div>
    </li>
  );
}

function ContractRow({
  contract: c,
  billIds,
}: {
  contract: Contract;
  billIds: Map<string, string>;
}) {
  // 議決が要る契約（仮契約）は、件名で議案を探してつなぐ
  const key = normalizeTitle(c.title).replace(/工事$/, "");
  const billId = c.remarks?.includes("仮契約")
    ? (billIds.get(key) ?? billIds.get(`${key}工事`))
    : undefined;
  return (
    <li className="flex flex-col gap-1.5 rounded-2xl bg-white px-5 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-mirai-brand-teal-deep">
          {c.contract_date ? formatJpDate(c.contract_date) : "日付なし"}
        </span>
        <span className="rounded-full bg-mirai-surface-muted px-2 py-0.5">
          {c.kind === "随契" ? "随意契約" : "入札"}・{c.category}
        </span>
        {c.industry && (
          <span className="text-mirai-text-secondary">{c.industry}</span>
        )}
      </div>
      <div className="font-bold">{c.title}</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>{c.vendor ?? "（落札者なし）"}</span>
        <span className="font-bold">
          {c.amount_text
            ? `${c.amount_text}${/^[¥￥\d,]+$/.test(c.amount_text) ? "円" : ""}`
            : ""}
        </span>
        {c.planned_price_text && (
          <span className="text-mirai-text-secondary">
            予定価格 {c.planned_price_text}円
          </span>
        )}
        {c.department && (
          <span className="text-mirai-text-secondary">{c.department}</span>
        )}
      </div>
      {c.remarks && (
        <div className="text-xs text-mirai-text-secondary">{c.remarks}</div>
      )}
      {c.reason && (
        <details className="text-xs leading-5">
          <summary className="cursor-pointer text-mirai-text-secondary">
            随意契約にした理由（区の説明）
          </summary>
          <p className="mt-1">{c.reason}</p>
        </details>
      )}
      <div className="flex flex-wrap gap-4 text-xs">
        <a
          href={c.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          区の原本
        </a>
        {billId && (
          <Link
            href={routes.billDetail(billId)}
            className="font-bold text-primary underline underline-offset-2"
          >
            この契約の議案（議会の議決）
          </Link>
        )}
      </div>
    </li>
  );
}
