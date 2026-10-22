import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CouncilMeeting } from "../../shared/types";
import { findCouncilMeetingsByYear } from "../repositories/council-meeting-repository";

/** 議会年度の会議予定を取得する。 */
export async function getCouncilMeetings(
  councilYear: number
): Promise<CouncilMeeting[]> {
  return _getCachedCouncilMeetings(councilYear);
}

const _getCachedCouncilMeetings = unstable_cache(
  async (councilYear: number): Promise<CouncilMeeting[]> =>
    findCouncilMeetingsByYear(councilYear),
  ["council-meetings"],
  {
    revalidate: 3600, // 1時間（3600秒）
    tags: [CACHE_TAGS.COUNCIL_MEETINGS],
  }
);
