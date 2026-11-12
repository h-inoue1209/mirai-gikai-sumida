"use client";

import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LoginRequiredDialog } from "@/components/member/login-required";
import { Button } from "@/components/ui/button";
import { getInterviewChatLink } from "@/features/interview-config/shared/utils/interview-links";
import { NewInterviewButton } from "@/features/interview-session/client/components/new-interview-button";
import { RestartInterviewButton } from "@/features/interview-session/client/components/restart-interview-button";
import type { LatestInterviewSession } from "@/features/interview-session/server/loaders/get-latest-interview-session";
import { useMember } from "@/lib/member/client";
import { InterviewConsentModal } from "./interview-consent-modal";

interface InterviewActionButtonsProps {
  billId: string;
  sessionInfo: LatestInterviewSession | null;
  previewToken?: string;
}

// AIインタビューは LINE公式の友だち（会員）だけ（2026-11-13 本人指示）。
// 会員でない方がボタンを押すと、遷移の前に LINE でログインの案内を出す
export function InterviewActionButtons(props: InterviewActionButtonsProps) {
  const member = useMember();
  const [loginOpen, setLoginOpen] = useState(false);
  return (
    <>
      <div
        className="contents"
        onClickCapture={(e) => {
          if (member === "member") return;
          const el = (e.target as HTMLElement).closest("a,button");
          if (!el) return;
          e.preventDefault();
          e.stopPropagation();
          setLoginOpen(true);
        }}
      >
        <InterviewActionButtonsInner {...props} />
      </div>
      <LoginRequiredDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        state={member}
        what="AIインタビュー"
      />
    </>
  );
}

function InterviewActionButtonsInner({
  billId,
  sessionInfo,
  previewToken,
}: InterviewActionButtonsProps) {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const isActive = sessionInfo?.status === "active";
  const isCompleted = sessionInfo?.status === "completed";

  // 完了済みの場合：「もう一度新たに回答する」ボタン（確認ダイアログなし）
  if (isCompleted && sessionInfo?.reportId) {
    return <NewInterviewButton billId={billId} previewToken={previewToken} />;
  }

  // 進行中の場合は直接遷移
  if (isActive) {
    const chatLink = getInterviewChatLink(billId, previewToken);

    return (
      <>
        <Button
          asChild
          className="w-full bg-mirai-gradient text-black border border-black rounded-[100px] h-[48px] px-6 font-bold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-4"
        >
          <Link href={chatLink as Route}>
            <Image
              src="/icons/messages-square-icon.svg"
              alt=""
              width={24}
              height={24}
              className="object-contain"
            />
            <span>AIインタビューを再開する</span>
            <ArrowRight className="size-5" />
          </Link>
        </Button>
        <RestartInterviewButton
          sessionId={sessionInfo.id}
          billId={billId}
          previewToken={previewToken}
        />
      </>
    );
  }

  // 新規の場合はモーダルを表示
  return (
    <>
      <Button
        onClick={() => setShowConsentModal(true)}
        className="w-full bg-mirai-gradient text-black border border-black rounded-[100px] h-[48px] px-6 font-bold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-4"
      >
        <Image
          src="/icons/messages-square-icon.svg"
          alt=""
          width={24}
          height={24}
          className="object-contain"
        />
        <span>AIインタビューをはじめる</span>
        <ArrowRight className="size-5" />
      </Button>

      <InterviewConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        billId={billId}
        previewToken={previewToken}
      />
    </>
  );
}
