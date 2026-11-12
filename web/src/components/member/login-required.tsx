"use client";

// AIチャット・AIインタビューを使う前の、LINEでログインの案内（2026-11-13 本人指示）
// 文言は子育てポータルの壁と同じ。「限定」「🔒」の言葉と LINE のアイコンは使わない
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  KODOMO_ORIGIN,
  loginUrl,
  type MemberState,
  recheckUrl,
} from "@/lib/member/client";

const LINE_ADD = "https://line.gorisan.tech/gikai-web/";

function useLoginNotice() {
  // LINEログインから戻ったときの ?login=cancel|error|notfriend と、ログイン後に戻る今のページ
  // （サーバーで作る画面では今のURLがわからないので、画面が開いてから入れる）
  const [q, setQ] = useState<string | null>(null);
  const [here, setHere] = useState("");
  useEffect(() => {
    const u = new URL(window.location.href);
    setQ(u.searchParams.get("login"));
    u.searchParams.delete("login");
    setHere(u.toString());
  }, []);
  return { notice: q, here };
}

export function LoginRequiredBody({
  state,
  what = "AIへの質問",
}: {
  state: MemberState;
  what?: string;
}) {
  const { notice, here } = useLoginNotice();
  const greenBtn =
    "inline-flex items-center justify-center rounded-full bg-[#06c755] px-6 py-3 font-bold text-white shadow-[0_4px_12px_rgba(6,199,85,.3)] hover:brightness-105";
  const badge =
    "rounded-full bg-[#e6f9ee] px-3 py-0.5 text-xs font-bold text-[#04913f]";

  if (state === "notfriend") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className={badge}>LINEでご利用いただけます</p>
        <p className="text-lg font-bold">
          あと一歩です。友だち追加をお願いします
        </p>
        <p className="text-sm">
          LINEでのログインはできています。「井上ひろきLINE公式」を友だち追加すると、
          {what}をご利用いただけます。
        </p>
        <a className={greenBtn} href={LINE_ADD} target="_blank" rel="noopener">
          友だち追加する
        </a>
        <a
          className="text-sm font-bold text-primary-accent"
          href={recheckUrl(here)}
        >
          友だち追加したので、続ける →
        </a>
      </div>
    );
  }
  const note =
    notice === "cancel"
      ? "LINEでのログインが取り消されました。もう一度お試しください。"
      : notice === "error"
        ? "LINEでのログインがうまくいきませんでした。時間をおいてもう一度お試しください。"
        : null;
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className={badge}>LINEでご利用いただけます</p>
      {note && (
        <p className="w-full rounded-lg bg-[#fff4e5] px-3 py-2 text-left text-sm font-bold text-[#8a4b00]">
          {note}
        </p>
      )}
      <p className="text-lg font-bold">
        あと少しで、{what}をご利用いただけます
      </p>
      <p className="text-sm">
        「井上ひろきLINE公式」よりログインしていただくと、{what}
        をご利用いただけます。
      </p>
      <a className={greenBtn} href={loginUrl(here)}>
        LINEでログイン
      </a>
      <p className="text-xs text-gray-500">
        区役所ではなく、墨田区議会議員の「井上ひろきLINE公式」です。ログインで受け取るのはLINEの利用者IDと友だち登録の有無だけで、お名前は受け取りません（
        <a
          className="underline"
          href={`${KODOMO_ORIGIN}/about#privacy`}
          target="_blank"
          rel="noopener"
        >
          プライバシーポリシー
        </a>
        ）。
      </p>
    </div>
  );
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  state,
  what,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: MemberState;
  what?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>LINEでログインのご案内</DialogTitle>
          <DialogDescription>
            AIのご利用には、井上ひろきLINE公式でのログインが必要です
          </DialogDescription>
        </DialogHeader>
        <LoginRequiredBody state={state} what={what} />
      </DialogContent>
    </Dialog>
  );
}
