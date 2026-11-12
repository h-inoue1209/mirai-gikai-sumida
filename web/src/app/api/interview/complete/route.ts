import { NextResponse } from "next/server";
import { completeInterviewSession } from "@/features/interview-session/server/services/complete-interview-session";
import { verifySessionOwnership } from "@/features/interview-session/server/utils/verify-session-ownership";
import {
  isInvalidOptionalBooleanInput,
  parseOptionalBoolean,
} from "@/features/interview-session/shared/utils/optional-boolean";
import { isMemberRequest, memberRequiredResponse } from "@/lib/member/server";

export async function POST(req: Request) {
  // LINE公式の友だち（会員）だけが使える（2026-11-13 本人指示。会員の情報は子育てポータルが持つ）
  if (!(await isMemberRequest(req))) return memberRequiredResponse();

  const { sessionId, isPublic, isDataReuseConsented } = await req.json();
  const isPublicByUser = parseOptionalBoolean(isPublic);
  const dataReuseConsented = parseOptionalBoolean(isDataReuseConsented);

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  if (isInvalidOptionalBooleanInput(isPublic)) {
    return NextResponse.json(
      { error: "Invalid isPublic value" },
      { status: 400 }
    );
  }

  if (isInvalidOptionalBooleanInput(isDataReuseConsented)) {
    return NextResponse.json(
      { error: "Invalid isDataReuseConsented value" },
      { status: 400 }
    );
  }

  const ownershipResult = await verifySessionOwnership(sessionId);
  if (!ownershipResult.authorized) {
    return NextResponse.json({ error: ownershipResult.error }, { status: 403 });
  }

  try {
    const report = await completeInterviewSession({
      sessionId,
      isPublicByUser,
      isDataReuseConsented: dataReuseConsented,
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Complete interview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete interview",
      },
      { status: 500 }
    );
  }
}
