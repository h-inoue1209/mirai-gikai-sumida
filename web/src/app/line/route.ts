// LINE公式アカウント（リッチメニュー・メッセージ）から開く入口（2026-11-13 本人指示）
// https://mirai-gikai-sumida.gorisan.info/line を開くと、そのまま LINE ログインに進み、終わるとこのサイトの TOP に戻る。
// ログインは子育てポータル（sumida-kodomo.gorisan.info）がまとめて受け持つので、そちらの /line に戻り先つきで送る。
// ?next=/bills/xxx のように、このサイトの中の戻り先も指定できる
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KODOMO =
  process.env.NEXT_PUBLIC_KODOMO_ORIGIN ??
  (process.env.NODE_ENV === "production"
    ? "https://sumida-kodomo.gorisan.info"
    : "http://localhost:3010");

export function GET(req: NextRequest) {
  let next = req.nextUrl.searchParams.get("next") ?? "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\"))
    next = "/";
  const back = new URL(next, req.nextUrl.origin).toString();
  return NextResponse.redirect(
    `${KODOMO}/line?next=${encodeURIComponent(back)}`
  );
}
