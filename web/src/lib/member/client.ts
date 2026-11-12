"use client";

// 会員（LINE公式の友だち）かどうかを、画面側で知るための部品（2026-11-13 本人指示）
// みらい議会は会員の情報を何も持たない。ログイン・会員の表・記録は、すみだ子ども・子育てポータルがまとめて持つ
//   ・「友だちか」は子育てポータルの /api/me に聞く（gorisan.info 共通のクッキーで答えが返る）
//   ・記録（AIチャットを使った・インタビューを始めた／終えた）は子育てポータルの /api/track に送る。会話の中身は送らない
// AIを動かすサーバー側でも別に確かめる（lib/member/server.ts）。ここは見た目の案内のため

import { useEffect, useState } from "react";

export const KODOMO_ORIGIN =
  process.env.NEXT_PUBLIC_KODOMO_ORIGIN ??
  (process.env.NODE_ENV === "production"
    ? "https://sumida-kodomo.gorisan.info"
    : "http://localhost:3010");

export type MemberState = "loading" | "member" | "notfriend" | "none";

let cached: MemberState = "loading";
let pending: Promise<MemberState> | null = null;
const listeners = new Set<(s: MemberState) => void>();

function fetchState(): Promise<MemberState> {
  if (!pending) {
    pending = fetch(`${KODOMO_ORIGIN}/api/me`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { member?: boolean; state?: MemberState } | null) => {
        const s: MemberState = j?.state ?? (j?.member ? "member" : "none");
        cached = s;
        for (const l of listeners) l(s);
        return s;
      })
      .catch(() => {
        cached = "none";
        for (const l of listeners) l("none");
        return "none" as MemberState;
      });
  }
  return pending;
}

/** 会員の状態（最初は loading） */
export function useMember(): MemberState {
  const [s, setS] = useState<MemberState>(cached);
  useEffect(() => {
    listeners.add(setS);
    fetchState();
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}

/** 今わかっている状態をすぐ知る（まだなら問い合わせを待つ） */
export async function currentMember(): Promise<MemberState> {
  if (cached !== "loading") return cached;
  return fetchState();
}

/** LINEでログインする入口（終わると今のページに戻る） */
export function loginUrl(next?: string) {
  const back =
    next ?? (typeof window !== "undefined" ? window.location.href : "");
  return `${KODOMO_ORIGIN}/line?next=${encodeURIComponent(back)}`;
}

/** 友だち追加したあとに確かめ直す入口 */
export function recheckUrl(next?: string) {
  const back =
    next ?? (typeof window !== "undefined" ? window.location.href : "");
  return `${KODOMO_ORIGIN}/api/auth/recheck?next=${encodeURIComponent(back)}`;
}

type MemberEvent =
  | "view"
  | "chat_used"
  | "interview_start"
  | "interview_complete";

/** 子育てポータルに記録を送る（ログインしていない人の分は送らない。送れなくても画面は止めない） */
export function trackMember(ev: MemberEvent, target?: string) {
  if (cached === "none" || cached === "loading") return;
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  fetch(`${KODOMO_ORIGIN}/api/track`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ev, path, target }),
    keepalive: true,
  }).catch(() => {});
}
