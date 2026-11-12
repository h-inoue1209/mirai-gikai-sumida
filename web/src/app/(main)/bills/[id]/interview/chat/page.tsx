import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { LoginRequiredBody } from "@/components/member/login-required";
import { getBillById } from "@/features/bills/server/loaders/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/server/loaders/get-interview-questions";
import { InterviewChatClient } from "@/features/interview-session/client/components/interview-chat-client";
import { InterviewSessionErrorView } from "@/features/interview-session/client/components/interview-session-error-view";
import { initializeInterviewChat } from "@/features/interview-session/server/loaders/initialize-interview-chat";
import { getMemberState } from "@/lib/member/server";

interface InterviewChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewChatPage({
  params,
}: InterviewChatPageProps) {
  const { id: billId } = await params;

  // 法案とインタビュー設定を取得
  const [bill, interviewConfig] = await Promise.all([
    getBillById(billId),
    getInterviewConfig(billId),
  ]);

  if (!bill || !interviewConfig) {
    notFound();
  }

  // AIインタビューは LINE公式の友だち（会員）だけ（2026-11-13 本人指示）。会員でなければセッションを作らずに案内だけ出す
  const memberState = await getMemberState();
  if (memberState !== "member") {
    return (
      <div className="mx-auto max-w-[560px] px-6 py-12">
        <div className="rounded-2xl border-2 border-[#06c755] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,.14)]">
          <LoginRequiredBody state={memberState} what="AIインタビュー" />
        </div>
      </div>
    );
  }

  // ループモードの場合のみ質問数を取得（プログレスバー用）
  const questions =
    interviewConfig.mode === "loop"
      ? await getInterviewQuestions(interviewConfig.id)
      : [];

  // インタビューチャットの初期化処理
  try {
    const { session, messages } = await initializeInterviewChat(
      billId,
      interviewConfig.id
    );

    return (
      <InterviewChatClient
        billId={billId}
        billTitle={bill.bill_content?.title ?? bill.name}
        sessionId={session.id}
        initialMessages={messages}
        mode={interviewConfig.mode}
        totalQuestions={questions.length}
        estimatedDuration={interviewConfig.estimated_duration}
        sessionStartedAt={session.started_at}
        hasRated={session.rating != null}
      />
    );
  } catch (error) {
    console.error("Failed to initialize interview session:", error);
    return <InterviewSessionErrorView billId={billId} />;
  }
}
