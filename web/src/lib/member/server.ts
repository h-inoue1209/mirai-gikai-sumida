// AIチャット・AIインタビューを動かす前に、LINE公式の友だち（会員）かをサーバー側で確かめる（2026-11-13 本人指示）
// クッキー gorisan_member は、すみだ子ども・子育てポータルが Domain=.gorisan.info で置いた署名つきのもの。
// ここでは署名と期限を確かめるだけで、何も書き込まない・何も保存しない。
// 環境変数 MEMBER_SESSION_SECRET は子育てポータルと同じ値（Vercel に入れる。チャットに貼らない）

import { cookies } from "next/headers";

export const MEMBER_COOKIE = "gorisan_member";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 3; // 3日（2026-11-13 本人指示。子育てポータルと同じ）

type Session = { u: string; f: boolean; c: number };

const enc = new TextEncoder();

function b64urlToBytes(s: string) {
  return Uint8Array.from(Buffer.from(s, "base64url"));
}

async function verify(raw: string | undefined): Promise<Session | null> {
  const secret = process.env.MEMBER_SESSION_SECRET;
  if (!raw || !secret || secret.length < 32) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(sig),
      enc.encode(body)
    );
    if (!ok) return null;
    const s = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Session;
    if (typeof s.u !== "string" || !/^U[0-9a-f]{32}$/.test(s.u)) return null;
    if (typeof s.c !== "number" || Date.now() - s.c > MAX_AGE_MS) return null;
    return s;
  } catch {
    return null;
  }
}

function cookieFromHeader(header: string | null, name: string) {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) {
      return decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  return undefined;
}

/** API（Request）から：友だちなら true */
export async function isMemberRequest(req: Request) {
  const s = await verify(
    cookieFromHeader(req.headers.get("cookie"), MEMBER_COOKIE)
  );
  return !!s?.f;
}

/** ページ（サーバー部品）から：member／notfriend／none */
export async function getMemberState(): Promise<
  "member" | "notfriend" | "none"
> {
  const s = await verify((await cookies()).get(MEMBER_COOKIE)?.value);
  if (!s) return "none";
  return s.f ? "member" : "notfriend";
}

/** 会員でないときの API の返事 */
export function memberRequiredResponse() {
  return new Response(
    JSON.stringify({
      error:
        "AIのご利用には、井上ひろきLINE公式でのログイン（友だち追加）が必要です。",
      code: "member_required",
    }),
    {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    }
  );
}
