const getSession = vi.hoisted(() => vi.fn());

vi.mock("../src/services/supabase", () => ({
  default: { auth: { getSession } },
}));

import {
  askOperationsCopilot,
  decideOperationsApproval,
  parseOperationsResponse,
} from "../src/services/apiOperationsCopilot";

function bookingSummary() {
  return {
    bookingId: 12,
    cabinId: 1,
    cabinName: "Cabin 001",
    arrivalDate: "2026-08-27",
    departureDate: "2026-08-29",
    status: "unconfirmed",
    isPaid: false,
    numGuests: 2,
    totalPrice: 400,
    riskTags: ["late-arrival"],
    sourceIds: ["booking:12", "cabin:1"],
  };
}

function validResponse() {
  return {
    text: "One arrival needs attention.",
    steps: [{
      stepNumber: 0,
      text: "",
      status: "completed",
      toolCalls: [{ toolName: "getArrivals", input: { from: "2026-08-27", to: "2026-08-27" } }],
      toolResults: [{
        toolName: "getArrivals",
        output: {
          kind: "arrivals",
          arrivals: [bookingSummary()],
          facts: ["One arrival."],
          sourceIds: ["booking:12", "cabin:1"],
          truncated: false,
        },
      }],
    }],
  };
}

function responseWithOutput(output: unknown) {
  const response = validResponse();
  (response.steps[0].toolResults[0] as { output: unknown }).output = output;
  return response;
}

function outputBase() {
  return { facts: [], sourceIds: [], truncated: false };
}

function metricsOutput(overrides: Record<string, unknown> = {}) {
  return {
    ...outputBase(),
    kind: "booking-metrics",
    metrics: {
      totalBookings: 2,
      totalRevenue: 400,
      extrasRevenue: 50,
      paidBookings: 1,
      unpaidBookings: 1,
      byStatus: { unconfirmed: 2 },
      currency: "USD",
      dateBasis: "created_at",
      revenueBasis: "totalPrice",
      includesCancelled: true,
      ...overrides,
    },
  };
}

function cabinOutput(overrides: Record<string, unknown> = {}) {
  return {
    ...outputBase(),
    kind: "cabin-performance",
    cabins: [{
      cabinId: 1,
      cabinName: "Cabin 001",
      bookings: 2,
      nights: 4,
      revenue: 400,
      sourceIds: ["booking:12", "cabin:1"],
      ...overrides,
    }],
  };
}

describe("operations BFF response validation", () => {
  beforeEach(() => {
    getSession.mockReset();
    getSession.mockResolvedValue({
      data: { session: { access_token: "staff-access-token" } },
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts a structurally valid discriminated tool result", () => {
    expect(parseOperationsResponse(validResponse())).toEqual(validResponse());
  });

  it.each([
    ["missing steps", { text: "unsafe" }],
    ["unknown step status", { ...validResponse(), steps: [{ ...validResponse().steps[0], status: "unknown" }] }],
    ["unknown output kind", { ...validResponse(), steps: [{ ...validResponse().steps[0], toolResults: [{ toolName: "getArrivals", output: { kind: "surprise", facts: [], sourceIds: [], truncated: false } }] }] }],
    ["malformed booking summary", { ...validResponse(), steps: [{ ...validResponse().steps[0], toolResults: [{ toolName: "getArrivals", output: { kind: "arrivals", arrivals: [{ ...bookingSummary(), riskTags: null }], facts: [], sourceIds: [], truncated: false } }] }] }],
  ])("rejects %s", (_label, payload) => {
    expect(parseOperationsResponse(payload)).toBeNull();
  });

  it.each([
    ["NaN booking ID", { ...bookingSummary(), bookingId: Number.NaN }],
    ["infinite cabin ID", { ...bookingSummary(), cabinId: Number.POSITIVE_INFINITY }],
    ["negative booking ID", { ...bookingSummary(), bookingId: -1 }],
    ["fractional booking ID", { ...bookingSummary(), bookingId: 1.5 }],
    ["negative guest count", { ...bookingSummary(), numGuests: -1 }],
    ["fractional guest count", { ...bookingSummary(), numGuests: 1.5 }],
    ["infinite booking amount", { ...bookingSummary(), totalPrice: Number.POSITIVE_INFINITY }],
  ])("rejects a booking summary with %s", (_label, summary) => {
    expect(parseOperationsResponse(responseWithOutput({
      ...outputBase(),
      kind: "arrivals",
      arrivals: [summary],
    }))).toBeNull();
  });

  it.each([
    ["negative total count", metricsOutput({ totalBookings: -1 })],
    ["fractional paid count", metricsOutput({ paidBookings: 1.5 })],
    ["NaN revenue", metricsOutput({ totalRevenue: Number.NaN })],
    ["infinite extras amount", metricsOutput({ extrasRevenue: Number.POSITIVE_INFINITY })],
    ["invalid status count", metricsOutput({ byStatus: { unconfirmed: -1 } })],
    ["fractional cabin ID", cabinOutput({ cabinId: 1.5 })],
    ["negative cabin booking count", cabinOutput({ bookings: -1 })],
    ["infinite nights", cabinOutput({ nights: Number.POSITIVE_INFINITY })],
    ["NaN cabin revenue", cabinOutput({ revenue: Number.NaN })],
  ])("rejects structured numeric payload with %s", (_label, output) => {
    expect(parseOperationsResponse(responseWithOutput(output))).toBeNull();
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
    1.5,
  ])("rejects invalid numeric step number %s", (stepNumber) => {
    const response = validResponse();
    response.steps[0].stepNumber = stepNumber;
    expect(parseOperationsResponse(response)).toBeNull();
  });

  it("turns a malformed successful BFF payload into a controlled error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      text: "Malformed",
      steps: [{ stepNumber: 0, text: "", status: "completed", toolCalls: [], toolResults: [{ toolName: "getArrivals", output: null }] }],
    }), { status: 200, headers: { "content-type": "application/json" } })));

    await expect(askOperationsCopilot("Show arrivals")).rejects.toThrow(
      "The operations copilot returned an invalid response."
    );
  });

  it.each([
    ["approve" as const, "executed" as const],
    ["reject" as const, "rejected" as const],
  ])("accepts a valid %s approval decision contract", async (action, status) => {
    const approvalId = "00000000-0000-0000-0000-000000000001";
    const approval = { id: approvalId, bookingId: 12, status, repeated: false };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ approval }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })));

    await expect(decideOperationsApproval(approvalId, action)).resolves.toEqual(approval);
  });

  it.each([
    ["empty approval", {}],
    ["wrong approval id", { id: "00000000-0000-0000-0000-000000000002", bookingId: 12, status: "executed", repeated: false }],
    ["invalid booking id", { id: "00000000-0000-0000-0000-000000000001", bookingId: 0, status: "executed", repeated: false }],
    ["negative booking id", { id: "00000000-0000-0000-0000-000000000001", bookingId: -1, status: "executed", repeated: false }],
    ["fractional booking id", { id: "00000000-0000-0000-0000-000000000001", bookingId: 1.5, status: "executed", repeated: false }],
    ["NaN booking id", { id: "00000000-0000-0000-0000-000000000001", bookingId: Number.NaN, status: "executed", repeated: false }],
    ["infinite booking id", { id: "00000000-0000-0000-0000-000000000001", bookingId: Number.POSITIVE_INFINITY, status: "executed", repeated: false }],
    ["wrong action status", { id: "00000000-0000-0000-0000-000000000001", bookingId: 12, status: "rejected", repeated: false }],
    ["missing repeated flag", { id: "00000000-0000-0000-0000-000000000001", bookingId: 12, status: "executed" }],
  ])("rejects a successful HTTP response with %s", async (_label, approval) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ approval }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })));

    await expect(decideOperationsApproval(
      "00000000-0000-0000-0000-000000000001",
      "approve"
    )).rejects.toThrow("The approval service returned an invalid response.");
  });
});
