import { ExternalLink } from "lucide-react";
import {
  formatMonthDay,
  type PlanPhase,
} from "../../../shared/utils/plan-phase";

interface PlanPhaseProgressProps {
  phase: PlanPhase;
  statusNote?: string | null;
  publicCommentStart?: string | null;
  publicCommentEnd?: string | null;
  publicCommentUrl?: string | null;
}

const STEPS: { phase: PlanPhase; label: string }[] = [
  { phase: "opinion", label: "AIで\n意見募集" },
  { phase: "public_comment", label: "区の\nパブコメ" },
  { phase: "after_public_comment", label: "計画の\n見直し" },
];

function badgeMessage({
  phase,
  statusNote,
  publicCommentStart,
  publicCommentEnd,
}: PlanPhaseProgressProps): string {
  switch (phase) {
    case "opinion":
      return statusNote || "AIインタビューで意見を募集しています";
    case "public_comment":
      return publicCommentEnd
        ? `区がパブリックコメントを募集中（${formatMonthDay(publicCommentEnd)}まで）`
        : "区がパブリックコメントを募集中";
    case "after_public_comment":
      return publicCommentStart && publicCommentEnd
        ? `区のパブリックコメントは終了しました（${formatMonthDay(publicCommentStart)}〜${formatMonthDay(publicCommentEnd)}）`
        : "区のパブリックコメントは終了しました";
  }
}

/**
 * 行政計画の段階表示。
 *
 * 議案の「提出→審査→採決」の代わりに、「AIで意見募集→区のパブコメ→計画の見直し」を出す。
 * パブコメ中は区の募集ページへのボタンを一番目立たせる。
 */
export function PlanPhaseProgress(props: PlanPhaseProgressProps) {
  const { phase, publicCommentUrl } = props;
  const currentIndex = STEPS.findIndex((s) => s.phase === phase);

  return (
    <>
      <h2 className="text-[22px] font-bold mb-4">👉 計画の見直しの段階</h2>
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col items-center gap-7">
          <div className="w-full max-w-md text-center bg-mirai-gradient rounded-lg px-4 py-3.5">
            <span className="text-base font-medium text-black">
              {badgeMessage(props)}
            </span>
          </div>

          <div className="relative w-full max-w-md">
            <div className="absolute top-[5.5px] left-[16%] right-[16%] h-[1px] bg-gray-300" />
            <div className="relative flex justify-around">
              {STEPS.map((step, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.phase} className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border ${
                        isActive
                          ? "bg-primary border-primary"
                          : "bg-gray-300 border-gray-300"
                      }`}
                    >
                      {isCurrent && (
                        <div className="w-5 h-5 bg-primary rounded-full -mt-[5px] -ml-[5px]" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm leading-6 whitespace-pre-line text-center ${
                        isActive ? "text-black" : "text-gray-300"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {phase === "opinion" && (
            <p className="w-full max-w-md text-sm leading-6 text-black">
              ここでお聞きした意見は、
              <strong>区の正式なパブリックコメントではありません</strong>
              。井上ひろきが、区議会での質問などの参考にします。区がパブリックコメントを始めたら、このページで区の募集ページをご案内します。
            </p>
          )}

          {phase === "public_comment" && publicCommentUrl && (
            <a
              href={publicCommentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[15px] font-bold text-white hover:opacity-90"
            >
              区の募集ページで意見を出す
              <ExternalLink className="size-4" />
            </a>
          )}
          {phase === "public_comment" && (
            <p className="w-full max-w-md text-sm leading-6 text-black">
              区のパブリックコメントの期間中は、このサイトでのAIインタビューは受け付けていません。ご意見は区の募集ページから直接お寄せください。
            </p>
          )}
        </div>
      </div>
    </>
  );
}
