import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { OperationsResponse } from "../src/services/apiOperationsCopilot";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import CopilotDrawer from "../src/features/operations-copilot/CopilotDrawer";
import CopilotAnswer from "../src/features/operations-copilot/CopilotAnswer";
import BookingResult from "../src/features/operations-copilot/BookingResult";
import ChartResult from "../src/features/operations-copilot/ChartResult";
import KpiResult from "../src/features/operations-copilot/KpiResult";
import ToolTimeline from "../src/features/operations-copilot/ToolTimeline";

const ask = vi.hoisted(() => vi.fn());
const decide = vi.hoisted(() => vi.fn());
const feedback = vi.hoisted(() => vi.fn());
const listRequests = vi.hoisted(() => vi.fn().mockResolvedValue({items:[]}));
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
vi.mock("../src/services/apiOperationsCopilot", async (importOriginal) => ({
  ...await importOriginal<typeof import("../src/services/apiOperationsCopilot")>(),
  askOperationsCopilot: ask,
  decideOperationsApproval: decide,
  sendOperationsFeedback: feedback,
  getApprovalRequests: listRequests,
}));
vi.mock("react-hot-toast", () => ({
  default: { success: toastSuccess, error: toastError },
}));

function LocationProbe() {
  return <span data-testid="location"><LocationText /></span>;
}
function LocationText() {
  return useLocation().pathname;
}

async function userAction(action: () => Promise<unknown>) {
  await act(async () => {
    await action();
  });
}

describe("Operations Copilot drawer", () => {
  it("keeps generating while hidden and shows the completed answer on reopen", async () => {
    let finish!: (answer: OperationsResponse) => void;
    let update!: (answer: OperationsResponse) => void;
    ask.mockImplementation((_text, _signal, onUpdate) => { update = onUpdate; return new Promise(resolve => { finish = resolve; }); });
    const user = userEvent.setup();
    render(<MemoryRouter><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /Operations Copilot/ })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    const signal = ask.mock.calls[0][1];
    await act(async () => update({ text: "Partial answer", steps: [] }));
    await userAction(() => user.click(screen.getByRole("button", { name: "Close operations copilot" })));
    expect(signal.aborted).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await act(async () => finish({ text: "Complete answer while hidden", steps: [] }));
    await userAction(() => user.click(screen.getByRole("button", { name: /Operations Copilot/ })));
    expect(screen.getByText("Complete answer while hidden")).toBeVisible();
    expect(screen.queryByText(/Response stopped/)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeEnabled();
  });
  it("renders live cards and text, keeps them on stop, and ignores late updates from the cancelled request", async () => {
    let update!: (result: OperationsResponse) => void;
    let resolve!: (result: OperationsResponse) => void;
    let signal!: AbortSignal;
    ask.mockImplementation((_text, requestSignal, onUpdate) => { signal = requestSignal; update = onUpdate; return new Promise((done) => { resolve = done; }); });
    const user = userEvent.setup();
    render(<MemoryRouter><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /Operations Copilot/ })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    const partial: OperationsResponse = { text: "Arrivals checked.", steps: [{ stepNumber: 0, text: "", status: "running", toolCalls: [{ toolName: "getArrivals", input: {}, status: "completed" }, { toolName: "getBookingRisks", input: {}, status: "running" }], toolResults: [{ toolName: "getArrivals", output: { kind: "arrivals", arrivals: [], facts: [], sourceIds: [], truncated: false } }] }] };
    await act(async () => update(partial));
    expect(screen.getByText("No matching arrivals were found.")).toBeVisible();
    expect(screen.getByText("Arrivals checked.")).toBeVisible();
    expect(screen.getByText("Booking risk review · running")).toBeVisible();
    await userAction(() => user.click(screen.getByRole("button", { name: "Stop response" })));
    expect(signal.aborted).toBe(true);
    expect(screen.getByText("Arrivals checked.")).toBeVisible();
    expect(screen.getByText("Booking risk review · interrupted")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(toastError).not.toHaveBeenCalled();
    await act(async () => { update({ text: "Stale update", steps: [] }); resolve({ text: "Stale final", steps: [] }); });
    expect(screen.queryByText(/Stale/)).not.toBeInTheDocument();
    expect(screen.getByText("Arrivals checked.")).toBeVisible();
  });

  it("pauses scrolling while reading earlier results and resumes with Jump to latest", async () => {
    let update!: (result: OperationsResponse) => void;
    ask.mockImplementation((_text, _signal, onUpdate) => { update = onUpdate; return new Promise(() => {}); });
    const user = userEvent.setup();
    const { unmount } = render(<MemoryRouter><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /Operations Copilot/ })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    const content = screen.getByLabelText("Operations response");
    Object.defineProperties(content, { scrollHeight: { configurable: true, value: 1200 }, clientHeight: { configurable: true, value: 300 } });
    content.scrollTop = 200;
    fireEvent.scroll(content);
    await act(async () => update({ text: "New answer text", steps: [] }));
    expect(content.scrollTop).toBe(200);
    await userAction(() => user.click(screen.getByRole("button", { name: "Jump to latest" })));
    expect(content.scrollTop).toBe(1200);
    const signal = ask.mock.calls[0][1];
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("keeps received results visible when a stream fails", async () => {
    ask.mockImplementation(async (_text, _signal, onUpdate) => { onUpdate({ text: "Partial answer", steps: [] }); throw new Error("Connection interrupted."); });
    const user = userEvent.setup();
    render(<MemoryRouter><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /Operations Copilot/ })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(screen.getByText("Partial answer")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Connection interrupted");
  });
  beforeEach(() => {
    ask.mockReset();
    decide.mockReset();
    feedback.mockReset();
    feedback.mockResolvedValue(undefined);
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it("renders a KPI and tool timeline from a safe tool result", async () => {
    ask.mockResolvedValue({
      text: "There are two active bookings.",
      steps: [{
        stepNumber: 0,
        status: "completed",
        text: "",
        toolCalls: [{ toolName: "getBookingMetrics", input: { from: "2026-08-23", to: "2026-08-29" } }],
        toolResults: [{ toolName: "getBookingMetrics", output: { kind: "booking-metrics", metrics: { totalBookings: 2, totalRevenue: 500, extrasRevenue: 25, paidBookings: 1, unpaidBookings: 1, byStatus: { unconfirmed: 2 }, currency: "USD", dateBasis: "created_at", revenueBasis: "totalPrice", includesCancelled: true }, facts: [], sourceIds: ["booking:1"], truncated: false } }],
      }],
    });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    expect(screen.getByRole("status")).toHaveTextContent(/begin/i);
    await userAction(() => user.type(screen.getByRole("textbox"), "Show this week's metrics"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByText("There are two active bookings.")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    expect(screen.getByText("Bookings")).toBeVisible();
    const activity = screen.getByText("Data activity · 1 tool").closest("details");
    expect(activity).not.toHaveAttribute("open");
    expect(screen.getAllByText("Evidence (1)")[0]).toBeVisible();
  });

  it("renders public and staff policy citations as accessible disclosures", async () => {
    ask.mockResolvedValue({
      text: "Escalate the exception for approval.",
      steps: [{
        stepNumber: 0,
        status: "completed",
        text: "",
        toolCalls: [{ toolName: "searchHotelPolicies", input: { question: "refund exception SOP" } }],
        toolResults: [{
          toolName: "searchHotelPolicies",
          output: {
            kind: "policy-search",
            status: "grounded",
            answerContext: "Trusted context",
            citations: [
              { documentId: "exception-handling-sop", title: "Exception handling SOP", section: "Administrator escalation", version: 1, effectiveDate: "2026-08-30", excerpt: "Escalate refund exceptions for administrator approval.", scope: "staff" },
              { documentId: "cancellation-refund", title: "Cancellation and refund policy", section: "Review and processing", version: 1, effectiveDate: "2026-08-30", excerpt: "Refunds return to the original payment method.", scope: "public" },
            ],
            truncated: false,
          },
        }],
      }],
    });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "refund exception SOP"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByText("Staff SOP")).toBeVisible();
    expect(screen.getByText("Public policy")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Policy sources" })).toBeVisible();
    expect(screen.getByText(/Exception handling SOP · Administrator escalation/)).toBeVisible();
    const summary = screen.getByText(/Exception handling SOP · Administrator escalation/).closest("summary");
    summary?.focus();
    expect(summary).toHaveFocus();
    const nextSummary = screen.getByText(/Cancellation and refund policy · Review and processing/).closest("summary");
    await userAction(() => user.tab());
    expect(nextSummary).toHaveFocus();
    await userAction(() => user.tab({ shift: true }));
    expect(summary).toHaveFocus();
    if (summary) await userAction(() => user.click(summary));
    expect(screen.getByText(/Escalate refund exceptions/i)).toBeVisible();
  });

  it("shows a loading state while the BFF request is pending", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    ask.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
    await act(async () => {
      resolveRequest?.({ text: "Done", steps: [] });
    });
    expect(await screen.findByText("Done")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
  });

  it("shows approval actions for a draft and sends the chosen decision", async () => {
    ask.mockResolvedValue({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [{ toolName: "addBookingInternalNote", input: { bookingId: 1, note: "Follow up on payment." } }], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000001", bookingId: 1, note: "Follow up on payment.", status: "draft", facts: [], sourceIds: ["booking:1"], truncated: false } }] }] });
    decide.mockResolvedValue({ status: "cancelled" });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a note for booking 1"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    await userAction(() => user.click(screen.getByRole("button", { name: "Withdraw request" })));
    expect(decide).toHaveBeenCalledWith("00000000-0000-0000-0000-000000000001", "cancel");
    expect(await screen.findByText("Decision: cancelled.")).toBeVisible();
  });

  it.each(["submit", "cancel"] as const)("blocks a new query while recording %s so its result cannot apply to another draft", async (action) => {
    ask.mockResolvedValue({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000001", bookingId: 1, note: "Acceptance fixture note.", status: "draft", facts: [], sourceIds: [], truncated: false } }] }] });
    let finishDecision!: (value: { status: string }) => void;
    decide.mockImplementation(() => new Promise((resolve) => { finishDecision = resolve; }));
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a note for booking 1"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    await userAction(() => user.click(screen.getByRole("button", { name: action === "submit" ? "Submit for approval" : "Withdraw request" })));
    expect(screen.getByRole("button", { name: "Recording decision…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: action === "submit" ? "Submitting…" : "Withdrawing…" })).toBeDisabled();
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(ask).toHaveBeenCalledOnce();
    const status = action === "submit" ? "pending" : "cancelled";
    await act(async () => finishDecision({ status }));
    expect(screen.getByText(status === "pending" ? "Awaiting administrator review" : `Decision: ${status}.`)).toBeVisible();
    expect(screen.getByRole("textbox")).toBeEnabled();
  });

  it("does not show approval success when response validation rejects a malformed payload", async () => {
    ask.mockResolvedValue({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000001", bookingId: 1, note: "Follow up on payment.", status: "draft", facts: [], sourceIds: ["booking:1"], truncated: false } }] }] });
    decide.mockRejectedValue(new Error("The approval service returned an invalid response."));
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a note for booking 1"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    await userAction(() => user.click(screen.getByRole("button", { name: "Submit for approval" })));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("The approval service returned an invalid response."));
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.queryByText(/Decision:/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit for approval" })).not.toBeDisabled();
  });

  it("keeps an old result and questions when the next request fails", async () => {
    ask.mockResolvedValueOnce({ text: "First answer", steps: [] }).mockRejectedValueOnce(new Error("BFF unavailable"));
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    const input = screen.getByRole("textbox");
    await userAction(() => user.type(input, "First question"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByText("First answer")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    await userAction(() => user.type(input, "Second question"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByRole("alert")).toHaveTextContent("BFF unavailable");
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    expect(screen.getByText("First answer")).toBeVisible();
    expect(screen.getByText("First question")).toBeVisible();
    expect(screen.getByText("Second question")).toBeVisible();
    expect(ask.mock.calls[1][3]).toEqual(["First question"]);
    await userAction(() => user.click(screen.getByRole("button", { name: "Close operations copilot" })));
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    expect(screen.getByText("First answer")).toBeVisible();
    expect(screen.getByText("Second question")).toBeVisible();
  });

  it("keeps an older approval attached to its own turn after a later answer", async () => {
    ask.mockResolvedValueOnce({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000001", bookingId: 1, note: "Synthetic note.", status: "draft", facts: [], sourceIds: [], truncated: false } }] }] })
      .mockResolvedValueOnce({ text: "Second read-only answer.", steps: [] });
    decide.mockResolvedValue({ status: "cancelled" });
    const user = userEvent.setup();
    render(<MemoryRouter><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a synthetic note"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    await userAction(() => user.type(screen.getByRole("textbox"), "Explain the policy"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByText("Second read-only answer.")).toBeVisible();
    await userAction(() => user.click(screen.getByRole("button", { name: "Withdraw request" })));
    expect(decide).toHaveBeenCalledWith("00000000-0000-0000-0000-000000000001", "cancel");
    const turns = screen.getAllByLabelText("Conversation turn");
    expect(within(turns[0]).getByText("Decision: cancelled.")).toBeVisible();
    expect(within(turns[1]).queryByText(/Decision:/)).not.toBeInTheDocument();
  });

  it("labels and focuses the question, traps focus, closes on Escape, and restores launcher focus", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    const launcher = screen.getByRole("button", { name: /operations copilot/i });
    await userAction(() => user.click(launcher));

    const question = screen.getByLabelText("Ask an operational question");
    const close = screen.getByRole("button", { name: "Close operations copilot" });
    expect(question).toHaveFocus();

    close.focus();
    await userAction(() => user.tab({ shift: true }));
    expect(question).toHaveFocus();
    await userAction(() => user.tab({ shift: true }));
    expect(screen.getByRole("link", { name: "Continue with Bookings" })).toHaveFocus();

    await userAction(() => user.type(question, "Show arrivals"));
    const submit = screen.getByRole("button", { name: "Ask Copilot" });
    submit.focus();
    await userAction(() => user.tab());
    expect(close).toHaveFocus();
    await userAction(() => user.tab());
    expect(screen.getByRole("link", { name: "Continue with Bookings" })).toHaveFocus();

    await userAction(() => user.keyboard("{Escape}"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(launcher).toHaveFocus();
  });

  it("renders evidence for chart and booking outputs and opens a booking detail route", async () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BookingResult output={{ kind: "arrivals", arrivals: [{ bookingId: 12, cabinId: 1, cabinName: "Cabin 1", arrivalDate: "2026-08-24", departureDate: "2026-08-25", status: "unconfirmed", isPaid: false, numGuests: 2, totalPrice: 100, riskTags: [], sourceIds: ["booking:12", "cabin:1"] }], facts: [], sourceIds: ["booking:12"], truncated: false }} /><LocationProbe /></MemoryRouter>);
    const user = userEvent.setup();
    await userAction(() => user.click(screen.getByRole("button", { name: "Open booking" })));
    expect(screen.getByTestId("location")).toHaveTextContent("/bookings/12");
    expect(screen.getAllByText("Evidence (1)")[0]).toBeVisible();

    render(<ChartResult output={{ kind: "cabin-performance", cabins: [{ cabinId: 1, cabinName: "Cabin 1", bookings: 1, nights: 2, revenue: 100, sourceIds: ["booking:12", "cabin:1"] }], facts: [], sourceIds: ["cabin:1"], truncated: false }} />);
    expect(screen.getByText("Cabin 1")).toBeVisible();
    expect(screen.getByText("Revenue:")).toBeVisible();
    expect(screen.getByText("1 booking")).toBeVisible();
    expect(screen.getByText("2 nights")).toBeVisible();
    expect(screen.getByRole("listitem", {
      name: "Cabin 1. Revenue USD 100.00. 1 booking. 2 nights.",
    })).toBeVisible();
    expect(screen.getAllByText("Evidence (1)").length).toBeGreaterThan(1);
  });

  it("shows a clear partial-result warning for every structured result", () => {
    const booking = { bookingId: 12, cabinId: 1, cabinName: "Cabin 1", arrivalDate: "2026-08-24", departureDate: "2026-08-25", status: "unconfirmed", isPaid: false, numGuests: 2, totalPrice: 100, riskTags: [], sourceIds: ["booking:12", "cabin:1"] };
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <KpiResult output={{ kind: "booking-metrics", metrics: { totalBookings: 2, totalRevenue: 500, extrasRevenue: 25, paidBookings: 1, unpaidBookings: 1, byStatus: { unconfirmed: 2 }, currency: "USD", dateBasis: "created_at", revenueBasis: "totalPrice", includesCancelled: true }, facts: [], sourceIds: ["booking:1"], truncated: true }} />
      <ChartResult output={{ kind: "cabin-performance", cabins: [{ cabinId: 1, cabinName: "Cabin 1", bookings: 1, nights: 2, revenue: 100, sourceIds: ["booking:12", "cabin:1"] }], facts: [], sourceIds: ["cabin:1"], truncated: true }} />
      <BookingResult output={{ kind: "arrivals", arrivals: [booking], facts: [], sourceIds: ["booking:12"], truncated: true }} />
    </MemoryRouter>);
    expect(screen.getAllByText(/Partial result:/)).toHaveLength(3);
  });

  it("distinguishes completed, failed, and interrupted tool steps", () => {
    render(<ToolTimeline steps={[{ stepNumber: 0, status: "completed", text: "", toolCalls: [{ toolName: "getArrivals", input: {} }], toolResults: [] }, { stepNumber: 1, status: "failed", text: "", toolCalls: [{ toolName: "getBookingMetrics", input: {} }], toolResults: [] }, { stepNumber: 2, status: "interrupted", text: "", toolCalls: [{ toolName: "getBookingRisks", input: {} }], toolResults: [] }]} />);
    const activity = screen.getByText("Data activity · 3 tools").closest("details");
    expect(activity).toHaveAttribute("open");
    expect(screen.getByText("Arrival lookup · completed")).toBeVisible();
    expect(screen.getByText("Booking metrics · failed")).toBeVisible();
    expect(screen.getByText("Booking risk review · interrupted")).toBeVisible();
  });

  it("renders only the allowed Markdown semantics without executable or navigable DOM", async () => {
    render(<CopilotAnswer
      hasStructuredResults={false}
      text={'# Main title\n\n## Subheading\n\n**Important** and *careful*.\n\n- First item\n- Second item\n\n<script>alert("x")</script>\n\n![tracking](https://example.invalid/pixel.png)\n\n[Unsafe link](https://example.invalid)'}
    />);

    expect(await screen.findByRole("heading", { level: 3, name: "Main title" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Subheading" })).toBeVisible();
    expect(screen.getByText("Important").tagName).toBe("STRONG");
    expect(screen.getByRole("list")).toBeVisible();
    expect(screen.getByText("Unsafe link")).toBeVisible();
    expect(document.querySelector("script, img, a")).toBeNull();
    expect(document.body).not.toHaveTextContent("## Subheading");
    expect(document.body).not.toHaveTextContent("**Important**");
  });

  it("collapses AI explanation when structured results exist and has one explicit empty state", async () => {
    const { rerender } = render(<CopilotAnswer hasStructuredResults text={"## Explanation\n\nDetails"} />);
    const details = screen.getByText("AI explanation").closest("details");
    expect(details).not.toHaveAttribute("open");
    expect(await screen.findByRole("heading", { level: 4, name: "Explanation" })).not.toBeVisible();

    rerender(<CopilotAnswer hasStructuredResults={false} text="   " />);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("No AI explanation was provided.");
  });

  it("orders approvals and business results before explanation and activity and merges empty booking outputs", async () => {
    ask.mockResolvedValue({
      text: "## Operational summary\n\n**No matching bookings.**",
      steps: [{
        stepNumber: 0,
        status: "completed",
        text: "",
        toolCalls: [
          { toolName: "getArrivals", input: {} },
          { toolName: "getBookingMetrics", input: {} },
          { toolName: "getBookingRisks", input: {} },
          { toolName: "addBookingInternalNote", input: { bookingId: 699, note: "[redacted]" } },
        ],
        toolResults: [
          { toolName: "getArrivals", output: { kind: "arrivals", arrivals: [], facts: [], sourceIds: ["arrivals:none"], truncated: true } },
          { toolName: "getBookingMetrics", output: { kind: "booking-metrics", metrics: { totalBookings: 0, totalRevenue: 0, extrasRevenue: 0, paidBookings: 0, unpaidBookings: 0, byStatus: {}, currency: "USD", dateBasis: "created_at", revenueBasis: "totalPrice", includesCancelled: true }, facts: [], sourceIds: ["metrics:month"], truncated: false } },
          { toolName: "getBookingRisks", output: { kind: "booking-risks", risks: [], facts: [], sourceIds: ["risks:none"], truncated: false } },
          { toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000699", bookingId: 699, note: "Follow up on payment before check-in.", status: "draft", facts: [], sourceIds: ["booking:699"], truncated: false } },
        ],
      }],
    });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Compare this month"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));

    const approval = await screen.findByText("Internal note · Booking #699");
    const metrics = screen.getByRole("heading", { name: "Summary metrics" });
    const bookings = screen.getByText("No matching arrivals or bookings needing attention were found.");
    const explanation = screen.getByText("No matching bookings.");
    const activity = screen.getByText("Data activity · 4 tools");
    const footer = screen.getByRole("link", { name: "Continue with Bookings" });
    const before = (first: Element, second: Element) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(before(approval, metrics)).toBe(true);
    expect(before(metrics, bookings)).toBe(true);
    expect(before(bookings, explanation)).toBe(true);
    expect(before(explanation, activity)).toBe(true);
    expect(before(activity, footer)).toBe(true);
    expect(screen.getAllByText("No matching arrivals or bookings needing attention were found.")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Bookings" })).not.toBeInTheDocument();
    expect(screen.getByText(/Partial result:/)).toBeVisible();
    expect(screen.getByText("Evidence (2)")).toBeVisible();
    expect(within(metrics.parentElement as HTMLElement).getAllByText(/^0$|^USD 0$/).length).toBeGreaterThan(0);
    expect(screen.getByText("Follow up on payment before check-in.")).toBeVisible();
  });

  it("does not show an arrivals empty state when another arrivals output has data", async () => {
    const arrival = { bookingId: 12, cabinId: 1, cabinName: "Cabin 1", arrivalDate: "2026-09-28", departureDate: "2026-09-29", status: "unconfirmed", isPaid: false, numGuests: 2, totalPrice: 100, riskTags: [], sourceIds: ["booking:12"] };
    ask.mockResolvedValue({
      text: "Arrivals ready.",
      steps: [{
        stepNumber: 0,
        status: "completed",
        text: "",
        toolCalls: [{ toolName: "getArrivals", input: {} }, { toolName: "getArrivals", input: {} }],
        toolResults: [
          { toolName: "getArrivals", output: { kind: "arrivals", arrivals: [], facts: [], sourceIds: ["arrivals:empty"], truncated: true } },
          { toolName: "getArrivals", output: { kind: "arrivals", arrivals: [arrival], facts: [], sourceIds: ["booking:12"], truncated: false } },
        ],
      }],
    });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));

    expect(await screen.findByRole("heading", { name: "Arrivals" })).toBeVisible();
    expect(screen.getByText("Booking #12 · Cabin 1")).toBeVisible();
    expect(screen.queryByText("No matching arrivals were found.")).not.toBeInTheDocument();
    expect(screen.queryByText("No matching arrivals or bookings needing attention were found.")).not.toBeInTheDocument();
    expect(screen.getByText(/Partial result:/)).toBeVisible();
    expect(screen.getAllByText("Evidence (1)")).toHaveLength(2);
  });

  it("keeps an arrivals-only empty state before nonempty attention results", async () => {
    const risk = { bookingId: 699, cabinId: 1, cabinName: "Cabin 1", arrivalDate: "2026-09-28", departureDate: "2026-09-29", status: "unconfirmed", isPaid: false, numGuests: 2, totalPrice: 100, riskTags: ["payment"], sourceIds: ["booking:699"] };
    ask.mockResolvedValue({
      text: "Review this booking.",
      steps: [{
        stepNumber: 0,
        status: "completed",
        text: "",
        toolCalls: [{ toolName: "getArrivals", input: {} }, { toolName: "getBookingRisks", input: {} }],
        toolResults: [
          { toolName: "getArrivals", output: { kind: "arrivals", arrivals: [], facts: [], sourceIds: ["arrivals:empty"], truncated: false } },
          { toolName: "getBookingRisks", output: { kind: "booking-risks", risks: [risk], facts: [], sourceIds: ["booking:699"], truncated: false } },
        ],
      }],
    });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals and risks"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));

    const arrivalsHeading = await screen.findByRole("heading", { name: "Arrivals" });
    const attentionHeading = screen.getByRole("heading", { name: "Bookings needing attention" });
    expect(arrivalsHeading.compareDocumentPosition(attentionHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("No matching arrivals were found.")).toBeVisible();
    expect(screen.getByText("Booking #699 · Cabin 1")).toBeVisible();
    expect(screen.queryByText("No bookings needing attention were found.")).not.toBeInTheDocument();
    expect(screen.queryByText("No matching arrivals or bookings needing attention were found.")).not.toBeInTheDocument();
  });

  it.each([
    { action: "cancel" as const, status: "cancelled", button: "Withdraw request" },
    { action: "submit" as const, status: "pending", button: "Submit for approval" },
  ])("keeps submitted or withdrawn requests from being resubmitted", async ({ action, status, button }) => {
    ask.mockResolvedValue({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [{ toolName: "addBookingInternalNote", input: { bookingId: 699, note: "[redacted]" } }], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000699", bookingId: 699, note: "Exact note", status: "draft", facts: [], sourceIds: ["booking:699"], truncated: false } }] }] });
    decide.mockResolvedValue({ status });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a note"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    const decisionButton = await screen.findByRole("button", { name: button });
    await userAction(() => user.click(decisionButton));

    expect(decide).toHaveBeenCalledWith("00000000-0000-0000-0000-000000000699", action);
    expect(screen.queryByRole("button", { name: "Submit for approval" })).not.toBeInTheDocument();
    if (status === "pending") {
      expect(screen.getByText("Awaiting administrator review")).toBeVisible();
      expect(screen.getByRole("button", { name: "Withdraw request" })).toBeEnabled();
    } else {
      expect(screen.queryByRole("button", { name: "Withdraw request" })).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("Decision: cancelled.");
    }
  });

  it("stores response feedback once and keeps the long reference in collapsed response details", async () => {
    const traceId = "00000000-0000-4000-8000-000000000099";
    ask.mockResolvedValue({ text: "Answer", steps: [], receipt: { traceId, token: "feedback-token" } });
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CopilotDrawer /></MemoryRouter>);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Question"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));

    const responseDetails = await screen.findByText("Response details");
    expect(responseDetails.closest("details")).not.toHaveAttribute("open");
    expect(screen.getByText(traceId)).not.toBeVisible();
    await userAction(() => user.click(screen.getByRole("button", { name: "Helpful" })));
    expect(await screen.findByText("Feedback saved.")).toBeVisible();
    expect(feedback).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Helpful" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Not helpful" })).toBeDisabled();
  });
});
