/** 入札結果・随意契約（区サイト「契約・入札」から取り込み） */
export type Contract = {
  id: string;
  contract_date: string | null;
  kind: "入札" | "随契";
  category: string;
  title: string;
  vendor: string | null;
  amount_text: string | null;
  planned_price_text: string | null;
  industry: string | null;
  department: string | null;
  reason: string | null;
  remarks: string | null;
  fiscal_year: number | null;
  source_url: string;
};

/** 募集中のプロポーザルと年間発注予定工事 */
export type ContractOpening = {
  id: string;
  kind: "proposal" | "planned_work";
  title: string;
  deadline: string | null;
  status: "open" | "closed" | "unknown" | "planned";
  department: string | null;
  bid_method: string | null;
  work_type: string | null;
  place: string | null;
  summary: string | null;
  schedule_text: string | null;
  source_url: string;
};

export type ContractFilter = {
  year?: number;
  kind?: "入札" | "随契";
  category?: "工事" | "物品・委託";
  q?: string;
  page: number;
};

export const PAGE_SIZE = 50;

/** 令和の年度ラベル（2026 → 令和8年度） */
export function reiwaLabel(fiscalYear: number): string {
  return `令和${fiscalYear - 2018}年度`;
}

/** 検索のクエリ文字列から絞り込みを読む（不正な値は無視） */
export function parseContractFilter(
  sp: Record<string, string | string[] | undefined>
): ContractFilter {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const year = Number(one("year"));
  const kind = one("kind");
  const category = one("category");
  const q = (one("q") ?? "").trim().slice(0, 50);
  const page = Math.max(1, Number(one("page")) || 1);
  return {
    year: year >= 2023 && year <= 2100 ? year : undefined,
    kind: kind === "入札" || kind === "随契" ? kind : undefined,
    category:
      category === "工事" || category === "物品・委託" ? category : undefined,
    q: q || undefined,
    page,
  };
}

/** 件名の突き合わせ用に、空白と全角半角の違いを消す */
export function normalizeTitle(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/（令和\d+年度[^）]*）$/, "");
}
