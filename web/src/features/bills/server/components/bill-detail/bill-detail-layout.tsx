import { Container } from "@/components/layouts/container";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewLandingSection } from "@/features/interview-config/client/components/interview-landing-section";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import { getPublicReportsByBillId } from "@/features/interview-report/server/loaders/get-public-reports-by-bill-id";
import { BillTopicsPreviewSection } from "@/features/user-topic-analysis/server/components/bill-topics-preview-section";
import { getPublicTopicAnalysis } from "@/features/user-topic-analysis/server/loaders/get-public-topic-analysis";
import { getJapanTime } from "@/lib/utils/date";
import { BillDetailClient } from "../../../client/components/bill-detail/bill-detail-client";
import { BillDisclaimer } from "../../../client/components/bill-detail/bill-disclaimer";
import { BillStatusProgress } from "../../../client/components/bill-detail/bill-status-progress";
import { MiraiStanceCard } from "../../../client/components/bill-detail/mirai-stance-card";
import { PlanPhaseProgress } from "../../../client/components/bill-detail/plan-phase-progress";
import type { BillWithContent } from "../../../shared/types";
import { getPlanPhase } from "../../../shared/utils/plan-phase";
import { BillShareButtons } from "../share/bill-share-buttons";
import { BillContent } from "./bill-content";
import { BillDetailHeader } from "./bill-detail-header";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export async function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  const [interviewConfig, publicReportsResult, topicAnalysis] =
    await Promise.all([
      getInterviewConfig(bill.id),
      getPublicReportsByBillId(bill.id),
      getPublicTopicAnalysis(bill.id),
    ]);

  // 行政計画は区のパブコメ期間で段階が変わる。AIインタビューは「意見募集中」の間だけ出す
  const isPlan = bill.status === "plan";
  const planPhase = isPlan ? getPlanPhase(bill, getJapanTime()) : null;
  const showInterview =
    interviewConfig != null && (!isPlan || planPhase === "opinion");

  return (
    <div className="container mx-auto pb-8 max-w-4xl">
      {/*
        テキスト選択機能とチャット連携の実装パターン:
        - BillContentはServer Componentのまま保持（SSRによる高速な初期レンダリング）
        - BillDetailClientでクライアントサイド機能（テキスト選択、チャット連携）を提供
        - このパターンによりSSRを保持しつつインタラクティブ機能を実装
      */}
      <BillDetailClient
        bill={bill}
        currentDifficulty={currentDifficulty}
        hasInterviewConfig={showInterview}
      >
        <BillDetailHeader
          bill={bill}
          hasInterviewConfig={showInterview}
          opinionCount={topicAnalysis?.total_opinions ?? 0}
          topicCount={topicAnalysis?.topics.length ?? 0}
        />
        <Container>
          {/* 議案ステータス進捗 */}
          <div className="my-8">
            {planPhase ? (
              <PlanPhaseProgress
                phase={planPhase}
                statusNote={bill.status_note}
                publicCommentStart={bill.public_comment_start}
                publicCommentEnd={bill.public_comment_end}
                publicCommentUrl={bill.public_comment_url}
              />
            ) : (
              <BillStatusProgress
                status={bill.status}
                originatingHouse={bill.originating_house}
                statusNote={bill.status_note}
              />
            )}
          </div>

          <BillContent bill={bill} />
        </Container>
      </BillDetailClient>

      <Container>
        {/* 法案のトピック一覧（AIインタビュー意見の整理） */}
        <div className="my-8">
          <BillTopicsPreviewSection
            billId={bill.id}
            topics={topicAnalysis?.topics ?? []}
            publicReportCount={publicReportsResult.totalCount}
          />
        </div>

        {showInterview && (
          <div className="my-8">
            <InterviewLandingSection billId={bill.id} />
          </div>
        )}
        {/*
          賛否が未設定・非公開（公開日時前を含む）なら出さない。法案提出前でも、
          賛否を登録していない段階で「法案提出前」のカードだけを出すことはしない。
        */}
        {bill.mirai_stance && (
          <div className="my-8">
            <MiraiStanceCard
              stance={bill.mirai_stance}
              billStatus={bill.status}
            />
          </div>
        )}
        {/* シェアボタン */}
        <div className="my-8">
          <BillShareButtons bill={bill} />
        </div>

        {/* データの出典と免責事項 */}
        <div className="my-8">
          <BillDisclaimer />
        </div>
      </Container>
    </div>
  );
}
