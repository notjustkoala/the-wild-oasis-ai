import supabase from "./supabase";

type OperationsToolOutputBase = {
  facts: string[];
  sourceIds: string[];
  truncated: boolean;
};

export type OperationsBookingSummary = {
  bookingId: number;
  cabinId: number;
  cabinName: string;
  arrivalDate: string;
  departureDate: string;
  status: string;
  isPaid: boolean;
  numGuests: number;
  totalPrice: number;
  riskTags: string[];
  sourceIds: string[];
};

export type PolicyCitation = {
  documentId: string;
  title: string;
  section: string;
  version: number;
  effectiveDate: string;
  excerpt: string;
  scope: "public" | "staff";
};

export type OperationsPolicySearchOutput =
  | {
      kind: "policy-search";
      status: "grounded";
      answerContext: string;
      citations: [PolicyCitation, ...PolicyCitation[]];
      truncated: boolean;
    }
  | {
      kind: "policy-search";
      status: "insufficient-evidence";
      answerContext: "";
      citations: [];
      truncated: false;
    };

export type OperationsToolOutput =
  | (OperationsToolOutputBase & { kind: "arrivals"; arrivals: OperationsBookingSummary[] })
  | (OperationsToolOutputBase & {
      kind: "booking-metrics";
      metrics: {
        totalBookings: number;
        totalRevenue: number;
        extrasRevenue: number;
        paidBookings: number;
        unpaidBookings: number;
        byStatus: Record<string, number>;
        currency: "USD";
        dateBasis: "created_at";
        revenueBasis: "totalPrice";
        includesCancelled: true;
      };
    })
  | (OperationsToolOutputBase & {
      kind: "cabin-performance";
      cabins: Array<{
        cabinId: number;
        cabinName: string;
        bookings: number;
        nights: number;
        revenue: number;
        sourceIds: string[];
      }>;
    })
  | (OperationsToolOutputBase & { kind: "booking-risks"; risks: OperationsBookingSummary[] })
  | (OperationsToolOutputBase & { kind: "booking-details"; bookings: OperationsBookingSummary[] })
  | (OperationsToolOutputBase & {
      kind: "internal-note-approval";
      approvalId: string;
      bookingId: number;
      note: string;
      status: "pending";
      truncated: false;
    })
  | OperationsPolicySearchOutput;

export type OperationsStep = {
  stepNumber: number;
  text: string;
  status: "completed" | "failed" | "interrupted";
  toolCalls: Array<{ toolName: string; input: unknown }>;
  toolResults: Array<{ toolName: string; output?: OperationsToolOutput; error?: string }>;
};

export type OperationsReceipt = { traceId: string; token: string | null };
export type OperationsResponse = { text: string; steps: OperationsStep[]; receipt?: OperationsReceipt };
export class OperationsRequestError extends Error { constructor(message: string, readonly receipt?: OperationsReceipt) { super(message); } }
export type OperationsApprovalDecision = {
  id: string;
  bookingId: number;
  status: "executed" | "rejected";
  repeated: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonnegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isBookingSummary(value: unknown): value is OperationsBookingSummary {
  return isRecord(value)
    && isPositiveSafeInteger(value.bookingId)
    && isPositiveSafeInteger(value.cabinId)
    && typeof value.cabinName === "string"
    && typeof value.arrivalDate === "string"
    && typeof value.departureDate === "string"
    && typeof value.status === "string"
    && typeof value.isPaid === "boolean"
    && isNonnegativeSafeInteger(value.numGuests)
    && isFiniteNumber(value.totalPrice)
    && isStringArray(value.riskTags)
    && isStringArray(value.sourceIds);
}

function isPolicyCitation(value: unknown): value is PolicyCitation {
  return isRecord(value)
    && hasOnlyKeys(value, ["documentId", "title", "section", "version", "effectiveDate", "excerpt", "scope"])
    && typeof value.documentId === "string"
    && value.documentId.length > 0
    && value.documentId.length <= 120
    && typeof value.title === "string"
    && value.title.length > 0
    && value.title.length <= 160
    && typeof value.section === "string"
    && value.section.length > 0
    && value.section.length <= 200
    && isPositiveSafeInteger(value.version)
    && typeof value.effectiveDate === "string"
    && isIsoDate(value.effectiveDate)
    && typeof value.excerpt === "string"
    && value.excerpt.length > 0
    && value.excerpt.length <= 420
    && (value.scope === "public" || value.scope === "staff");
}

function isPolicySearchOutput(value: Record<string, unknown>): value is OperationsPolicySearchOutput {
  if (
    !hasOnlyKeys(value, ["kind", "status", "answerContext", "citations", "truncated"])
    ||
    value.kind !== "policy-search"
    || typeof value.status !== "string"
    || typeof value.answerContext !== "string"
    || !Array.isArray(value.citations)
    || typeof value.truncated !== "boolean"
  ) return false;
  if (value.status === "insufficient-evidence") {
    return value.answerContext === "" && value.citations.length === 0 && value.truncated === false;
  }
  return value.status === "grounded"
    && value.answerContext.length > 0
    && value.answerContext.length <= 2_400
    && value.citations.length > 0
    && value.citations.length <= 5
    && value.citations.every(isPolicyCitation);
}

function hasToolOutputBase(value: Record<string, unknown>) {
  return isStringArray(value.facts)
    && isStringArray(value.sourceIds)
    && typeof value.truncated === "boolean";
}

function isOperationsToolOutput(value: unknown): value is OperationsToolOutput {
  if (!isRecord(value) || typeof value.kind !== "string") return false;
  if (value.kind === "policy-search") return isPolicySearchOutput(value);
  if (!hasToolOutputBase(value)) return false;

  if (value.kind === "arrivals") return Array.isArray(value.arrivals) && value.arrivals.every(isBookingSummary);
  if (value.kind === "booking-risks") return Array.isArray(value.risks) && value.risks.every(isBookingSummary);
  if (value.kind === "booking-details") return Array.isArray(value.bookings) && value.bookings.every(isBookingSummary);
  if (value.kind === "cabin-performance") {
    return Array.isArray(value.cabins) && value.cabins.every((cabin) =>
      isRecord(cabin)
      && isPositiveSafeInteger(cabin.cabinId)
      && typeof cabin.cabinName === "string"
      && isNonnegativeSafeInteger(cabin.bookings)
      && isFiniteNumber(cabin.nights)
      && isFiniteNumber(cabin.revenue)
      && isStringArray(cabin.sourceIds)
    );
  }
  if (value.kind === "booking-metrics") {
    const metrics = value.metrics;
    return isRecord(metrics)
      && isNonnegativeSafeInteger(metrics.totalBookings)
      && isFiniteNumber(metrics.totalRevenue)
      && isFiniteNumber(metrics.extrasRevenue)
      && isNonnegativeSafeInteger(metrics.paidBookings)
      && isNonnegativeSafeInteger(metrics.unpaidBookings)
      && isRecord(metrics.byStatus)
      && Object.values(metrics.byStatus).every(isNonnegativeSafeInteger)
      && metrics.currency === "USD"
      && metrics.dateBasis === "created_at"
      && metrics.revenueBasis === "totalPrice"
      && metrics.includesCancelled === true;
  }
  if (value.kind === "internal-note-approval") {
    return typeof value.approvalId === "string"
      && isPositiveSafeInteger(value.bookingId)
      && typeof value.note === "string"
      && value.status === "pending"
      && value.truncated === false;
  }
  return false;
}

function isOperationsStep(value: unknown): value is OperationsStep {
  if (!isRecord(value)
    || !isNonnegativeSafeInteger(value.stepNumber)
    || typeof value.text !== "string"
    || !["completed", "failed", "interrupted"].includes(String(value.status))
    || !Array.isArray(value.toolCalls)
    || !Array.isArray(value.toolResults)) return false;

  const callsAreValid = value.toolCalls.every((call) =>
    isRecord(call) && typeof call.toolName === "string" && "input" in call
  );
  const resultsAreValid = value.toolResults.every((result) =>
    isRecord(result)
    && typeof result.toolName === "string"
    && (!("output" in result) || result.output === undefined || isOperationsToolOutput(result.output))
    && (!("error" in result) || result.error === undefined || typeof result.error === "string")
  );
  return callsAreValid && resultsAreValid;
}

function parseOperationsApprovalDecision(
  value: unknown,
  approvalId: string,
  action: "approve" | "reject",
): OperationsApprovalDecision | null {
  if (!isRecord(value)
    || value.id !== approvalId
    || typeof value.bookingId !== "number"
    || !Number.isSafeInteger(value.bookingId)
    || value.bookingId <= 0
    || typeof value.repeated !== "boolean") return null;

  const expectedStatus = action === "approve" ? "executed" : "rejected";
  if (value.status !== expectedStatus) return null;
  return {
    id: value.id,
    bookingId: value.bookingId,
    status: expectedStatus,
    repeated: value.repeated,
  };
}

export function parseOperationsResponse(value: unknown): OperationsResponse | null {
  if (!isRecord(value) || typeof value.text !== "string" || !Array.isArray(value.steps)) return null;
  return value.steps.every(isOperationsStep) ? { text: value.text, steps: value.steps } : null;
}

function endpoint(path: string) {
  const configured = import.meta.env.VITE_AI_BFF_URL?.trim();
  const base = configured || (import.meta.env.DEV ? "http://127.0.0.1:3000" : "");
  if (!base) throw new Error("AI operations service URL is not configured.");
  return `${base.replace(/\/$/, "")}${path}`;
}

async function token() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Your session expired. Sign in again.");
  return data.session.access_token;
}

function idempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `copilot-${Date.now()}-${Math.random().toString(36).slice(2)}-key`;
}

export async function askOperationsCopilot(text: string, signal?: AbortSignal): Promise<OperationsResponse> {
  const accessToken = await token();
  const response = await fetch(endpoint("/api/ai/admin"), {
    method: "POST",
    signal,
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ id: "wild-oasis-admin-copilot", trigger: "submit-message", messages: [{ id: `operations-user-${Date.now()}`, role: "user", parts: [{ type: "text", text: text.trim() }] }] }),
  });
  const rawPayload: unknown = await response.json().catch(() => null);
  const traceId = response.headers?.get("X-AI-Trace-Id");
  const receipt = traceId && /^[0-9a-f-]{36}$/i.test(traceId) ? { traceId, token: response.headers.get("X-AI-Feedback-Token") } : undefined;
  if (!response.ok) {
    const message = isRecord(rawPayload) && typeof rawPayload.error === "string"
      ? rawPayload.error
      : "The operations copilot is unavailable.";
    throw new OperationsRequestError(message, receipt);
  }
  const payload = parseOperationsResponse(rawPayload);
  if (!payload) throw new Error("The operations copilot returned an invalid response.");
  return receipt ? { ...payload, receipt } : payload;
}

export async function sendOperationsFeedback(receipt: OperationsReceipt, rating: "helpful" | "not-helpful") {
  const response = await fetch(endpoint("/api/ai/feedback"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ traceId: receipt.traceId, token: receipt.token, rating }) });
  if (!response.ok) throw new Error("Feedback could not be saved. Please try again.");
}

export async function decideOperationsApproval(
  approvalId: string,
  action: "approve" | "reject",
): Promise<OperationsApprovalDecision> {
  const accessToken = await token();
  const key = idempotencyKey();
  const response = await fetch(endpoint("/api/ai/admin/approval"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json", "X-Idempotency-Key": key },
    body: JSON.stringify({ approvalId, action, idempotencyKey: key }),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error === "string"
      ? payload.error
      : "Approval decision could not be recorded.";
    throw new Error(message);
  }
  const approval = isRecord(payload)
    ? parseOperationsApprovalDecision(payload.approval, approvalId, action)
    : null;
  if (!approval) throw new Error("The approval service returned an invalid response.");
  return approval;
}
