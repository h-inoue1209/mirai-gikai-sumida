import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "../shared/helper";

/**
 * 入札結果・随意契約と、募集中のプロポーザル・年間発注予定工事を取り込む（2026-11-20）。
 *
 * 元データは Claude_job の tools/export_mirai.py が書き出す JSON（区サイトの公開情報。IT の印は含まない）。
 * どちらの表も、元データから毎回作り直す（全件消して入れ直す）。
 * 読めた件数が今の半分未満なら、区サイトの作りが変わった恐れがあるので止める。
 *
 * 既定は確認だけ。`--apply` を付けたときだけ書き込む。
 *   dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed import:contracts [JSONのフォルダ] [--apply]
 */

const DEFAULT_DIR = "/Users/hiroki.inoue/ClaudeCode/Claude_job/資料/_mirai";
const BATCH = 500;

type Table = "contracts" | "contract_openings";

async function replaceAll(
  supabase: ReturnType<typeof createAdminClient>,
  table: Table,
  rows: Record<string, unknown>[],
  apply: boolean
) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  const old = count ?? 0;
  console.log(`${table}: ${rows.length}件（今 ${old}件）`);
  if (old > 0 && rows.length < old * 0.5) {
    throw new Error(
      `${table} の読めた件数が${rows.length}件で、今の${old}件の半分未満です。区サイトの作りが変わっていないか確認してください`
    );
  }
  if (!apply) return;
  // uuid の列なので「すべて」は id の not null で指定する
  const { error: delError } = await supabase
    .from(table)
    .delete()
    .not("id", "is", null);
  if (delError) throw new Error(`${table}: ${delError.message}`);
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error: insError } = await supabase
      .from(table)
      .insert(rows.slice(i, i + BATCH) as never);
    if (insError) throw new Error(`${table}: ${insError.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const dir = args.find((a) => !a.startsWith("--")) ?? DEFAULT_DIR;
  const read = (name: string) =>
    JSON.parse(readFileSync(join(dir, name), "utf-8")) as Record<
      string,
      unknown
    >[];

  const supabase = createAdminClient();
  await replaceAll(supabase, "contracts", read("contracts.json"), apply);
  await replaceAll(
    supabase,
    "contract_openings",
    read("contract_openings.json"),
    apply
  );
  console.log(
    apply ? "✅ 書き込みました" : "確認だけ（書き込んでいません）。書き込むときは --apply"
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
