import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminClient } from "../shared/helper";

/**
 * 区の審議会の一覧と開催予定を取り込む（2026-11-20）。
 *
 * 元データは Claude_job の tools/export_mirai.py が書き出す JSON（区サイトの公開情報）。
 * - advisory_councils … 会議名で突き合わせて足す・直す（消さない）
 * - advisory_meetings … （会議名, 開催日）で突き合わせて足す・直す。終わった回も消さない
 *
 * 既定は確認だけ。`--apply` を付けたときだけ書き込む。
 *   dotenv -e .env.production -- pnpm --filter @mirai-gikai/seed import:councils [JSONのフォルダ] [--apply]
 */

const DEFAULT_DIR = "/Users/hiroki.inoue/ClaudeCode/Claude_job/資料/_mirai";

type Council = {
  name: string;
  page_title: string | null;
  field: string;
  page_url: string;
  minutes_count: number;
  latest_minutes_title: string | null;
  latest_minutes_date: string | null;
  latest_minutes_url: string | null;
};

type Meeting = {
  name: string;
  meeting_date: string;
  time_text: string | null;
  place: string | null;
  is_public: boolean | null;
  public_text: string | null;
  agenda: string | null;
  capacity: string | null;
  procedure: string | null;
  contact_section: string | null;
  as_of: string | null;
  source_url: string;
};

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const dir = args.find((a) => !a.startsWith("--")) ?? DEFAULT_DIR;
  const councils = JSON.parse(
    readFileSync(join(dir, "councils.json"), "utf-8")
  ) as Council[];
  const meetings = JSON.parse(
    readFileSync(join(dir, "council_meetings.json"), "utf-8")
  ) as Meeting[];

  const supabase = createAdminClient();
  const { count: oldCount, error: countError } = await supabase
    .from("advisory_councils")
    .select("id", { count: "exact", head: true });
  if (countError) throw new Error(`advisory_councils: ${countError.message}`);
  if (oldCount && councils.length < oldCount * 0.5) {
    throw new Error(
      `読めた審議会が${councils.length}件で、今の${oldCount}件の半分未満です。区サイトの作りが変わっていないか確認してください`
    );
  }

  console.log(
    `審議会 ${councils.length}件（今 ${oldCount ?? 0}件）、開催予定 ${meetings.length}件`
  );
  if (!apply) {
    console.log("確認だけ（書き込んでいません）。書き込むときは --apply");
    return;
  }

  const now = new Date().toISOString();
  const { error: e1 } = await supabase
    .from("advisory_councils")
    .upsert(
      councils.map((c) => ({ ...c, updated_at: now })),
      { onConflict: "name" }
    );
  if (e1) throw new Error(`advisory_councils: ${e1.message}`);

  if (meetings.length > 0) {
    const { error: e2 } = await supabase
      .from("advisory_meetings")
      .upsert(
        meetings.map((m) => ({ ...m, updated_at: now })),
        { onConflict: "name,meeting_date" }
      );
    if (e2) throw new Error(`advisory_meetings: ${e2.message}`);
  }
  console.log("✅ 書き込みました");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
