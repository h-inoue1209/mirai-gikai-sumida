import type { BillStatusEnum } from "../types";

/** カード用の簡略化されたステータスラベルを取得 */
export function getCardStatusLabel(status: BillStatusEnum): string {
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "区議会審議中";
    case "enacted":
      return "可決";
    case "rejected":
      return "否決";
    case "reported":
      return "委員会報告";
    case "plan":
      return "行政計画";
    case "special_committee":
      return "特別委員会";
    default:
      return "議案提出前";
  }
}

/** ステータスに対応するBadgeのvariantを取得 */
export function getStatusVariant(
  status: BillStatusEnum
): "light" | "default" | "dark" | "muted" {
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "light";
    case "enacted":
      return "default";
    case "rejected":
      return "dark";
    default:
      return "muted";
  }
}

/** 日付の後ろに付ける言葉。議案は「提出」、委員会報告は「報告」、特別委員会は「開催」。 */
export function getDateLabel(status: BillStatusEnum): string {
  switch (status) {
    case "reported":
      return "報告";
    case "special_committee":
      return "開催";
    case "plan":
      return "掲載";
    default:
      return "提出";
  }
}
