import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { AdvisoryCouncil, AdvisoryMeeting } from "../../shared/types";
import {
  findAdvisoryCouncils,
  findUpcomingAdvisoryMeetings,
} from "../repositories/advisory-council-repository";

export const getAdvisoryCouncils = unstable_cache(
  async (): Promise<AdvisoryCouncil[]> => findAdvisoryCouncils(),
  ["advisory-councils"],
  { revalidate: 3600, tags: [CACHE_TAGS.ADVISORY_COUNCILS] }
);

/** fromDate は日本時間の今日（YYYY-MM-DD）。 */
export const getUpcomingAdvisoryMeetings = unstable_cache(
  async (fromDate: string): Promise<AdvisoryMeeting[]> =>
    findUpcomingAdvisoryMeetings(fromDate),
  ["advisory-meetings"],
  { revalidate: 3600, tags: [CACHE_TAGS.ADVISORY_COUNCILS] }
);
