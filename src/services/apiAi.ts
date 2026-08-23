import supabase from "./supabase";

export type BookingRiskTag =
  | "food-allergy"
  | "late-arrival"
  | "pet"
  | "celebration"
  | "extra-bed"
  | "other";

export type BookingInsightResult = {
  summary: string;
  riskTags: BookingRiskTag[];
  severity: "low" | "medium" | "high";
  actionItems: string[];
  confidence: number;
};

export type BookingInsightFeedback = {
  verdict: "correct" | "partially-correct" | "incorrect";
  correctedTags?: BookingRiskTag[];
  note?: string;
};

export type BookingInsightPayload = {
  state:
    | "missing"
    | "empty"
    | "manual-review"
    | "stale"
    | "stale-pending"
    | "pending"
    | "cached"
    | "failed"
    | "reviewed";
  insight: null | {
    result: BookingInsightResult | null;
    model: string;
    promptVersion: string;
    sourceHash: string;
    status: "pending" | "succeeded" | "failed";
    attemptCount: number;
    failureCode: string | null;
    createdAt: string;
    updatedAt: string;
    reviewedAt: string | null;
    reviewerFeedback: BookingInsightFeedback | null;
  };
};

function bookingInsightEndpoint(bookingId: number) {
  const configured = import.meta.env.VITE_AI_BFF_URL?.trim();
  const base = configured || (import.meta.env.DEV ? "http://127.0.0.1:3000" : "");
  if (!base) throw new Error("AI Briefing service URL is not configured.");
  return `${base.replace(/\/$/, "")}/api/ai/booking-insight/${bookingId}`;
}

async function accessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Your session expired. Sign in again.");
  }
  return data.session.access_token;
}

async function bookingInsightRequest(
  bookingId: number,
  init: RequestInit = {}
): Promise<BookingInsightPayload> {
  const token = await accessToken();
  const response = await fetch(bookingInsightEndpoint(bookingId), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | BookingInsightPayload
    | { error?: string }
    | null;

  // A provider failure intentionally returns its persisted failed state with
  // HTTP 503 so employees can retry without losing the operational context.
  if (payload && "state" in payload) return payload;
  if (!response.ok) {
    throw new Error(
      payload && "error" in payload && payload.error
        ? payload.error
        : "AI Briefing is temporarily unavailable."
    );
  }
  throw new Error("AI Briefing returned an invalid response.");
}

export function getBookingInsight(bookingId: number) {
  return bookingInsightRequest(bookingId);
}

export function analyzeBookingInsight(bookingId: number, force = false) {
  return bookingInsightRequest(bookingId, {
    method: "POST",
    body: JSON.stringify({ force }),
  });
}

export function reviewBookingInsight(
  bookingId: number,
  feedback: BookingInsightFeedback
) {
  return bookingInsightRequest(bookingId, {
    method: "PATCH",
    body: JSON.stringify(feedback),
  });
}
