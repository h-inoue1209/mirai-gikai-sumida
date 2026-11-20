import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import {
  type Contract,
  type ContractFilter,
  type ContractOpening,
  normalizeTitle,
  PAGE_SIZE,
} from "../../shared/types";

const COLUMNS =
  "id, contract_date, kind, category, title, vendor, amount_text, planned_price_text, industry, department, reason, remarks, fiscal_year, source_url";

/** 絞り込みに合う契約（新しい順）と総件数。 */
export async function findContracts(
  filter: ContractFilter
): Promise<{ rows: Contract[]; total: number }> {
  const supabase = createAdminClient();
  let query = supabase.from("contracts").select(COLUMNS, { count: "exact" });
  if (filter.year) query = query.eq("fiscal_year", filter.year);
  if (filter.kind) query = query.eq("kind", filter.kind);
  if (filter.category) query = query.eq("category", filter.category);
  if (filter.q) {
    // PostgREST の or 句で区切りになる文字は落とす
    const q = filter.q.replace(/[,()%*\\]/g, " ").trim();
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,vendor.ilike.%${q}%,department.ilike.%${q}%`
      );
    }
  }
  const from = (filter.page - 1) * PAGE_SIZE;
  const { data, error, count } = await query
    .order("contract_date", { ascending: false, nullsFirst: false })
    .order("title")
    .range(from, from + PAGE_SIZE - 1);
  if (error) {
    console.error("Failed to fetch contracts:", error);
    return { rows: [], total: 0 };
  }
  return { rows: data as Contract[], total: count ?? 0 };
}

/** 契約の年度の一覧（新しい順）。 */
export async function findContractYears(): Promise<number[]> {
  const supabase = createAdminClient();
  const years = new Set<number>();
  // 年度は数年分しかないので、年度ごとの件数を問い合わせずに先頭から探す
  for (let y = new Date().getFullYear() + 1; y >= 2023; y--) {
    const { count } = await supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("fiscal_year", y);
    if (count) years.add(y);
  }
  return [...years];
}

/** 募集中のプロポーザルと年間発注予定。 */
export async function findContractOpenings(): Promise<ContractOpening[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contract_openings")
    .select(
      "id, kind, title, deadline, status, department, bid_method, work_type, place, summary, schedule_text, source_url"
    )
    .order("deadline", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("Failed to fetch contract openings:", error);
    return [];
  }
  return data as ContractOpening[];
}

/**
 * 議決が要る契約（工事請負契約）の議案を、件名で探す。
 * 戻り値は「正規化した件名 → 議案ID」。
 */
export async function findContractBillIds(): Promise<Map<string, string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select("id, name")
    .eq("publish_status", "published")
    .like("name", "%請負契約%");
  if (error || !data) return new Map();
  const map = new Map<string, string>();
  for (const b of data) {
    const title = b.name.replace(/^(議案|議員提出議案)第\d+号\s*/, "");
    map.set(normalizeTitle(title).replace(/請負契約$/, ""), b.id);
  }
  return map;
}
