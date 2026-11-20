import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { AdvisoryCouncil, AdvisoryMeeting } from "../../shared/types";

/** 審議会の一覧（分野・名前順）。 */
export async function findAdvisoryCouncils(): Promise<AdvisoryCouncil[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("advisory_councils")
    .select(
      "id, name, field, page_url, minutes_count, latest_minutes_title, latest_minutes_date, latest_minutes_url"
    )
    .order("field")
    .order("name");
  if (error) {
    console.error("Failed to fetch advisory councils:", error);
    return [];
  }
  return data as AdvisoryCouncil[];
}

/** 指定の日以降の審議会の開催予定（日付順）。 */
export async function findUpcomingAdvisoryMeetings(
  fromDate: string
): Promise<AdvisoryMeeting[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("advisory_meetings")
    .select(
      "id, name, meeting_date, time_text, place, is_public, public_text, agenda, capacity, procedure, contact_section, as_of, source_url"
    )
    .gte("meeting_date", fromDate)
    .order("meeting_date");
  if (error) {
    console.error("Failed to fetch advisory meetings:", error);
    return [];
  }
  return data as AdvisoryMeeting[];
}
