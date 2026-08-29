import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

const ask = vi.hoisted(() => vi.fn());
const decide = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
vi.mock("../src/services/apiOperationsCopilot", () => ({
  askOperationsCopilot: ask,
  decideOperationsApproval: decide,
}));
vi.mock("react-hot-toast", () => ({
  default: { success: toastSuccess, error: toastError },
}));

import CopilotDrawer from "../src/features/operations-copilot/CopilotDrawer";
import BookingResult from "../src/features/operations-copilot/BookingResult";
import ChartResult from "../src/features/operations-copilot/ChartResult";
import KpiResult from "../src/features/operations-copilot/KpiResult";
import ToolTimeline from "../src/features/operations-copilot/ToolTimeline";

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
  beforeEach(() => {
    ask.mockReset();
    decide.mockReset();
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
    render(<CopilotDrawer />);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    expect(screen.getByRole("status")).toHaveTextContent(/begin/i);
    await userAction(() => user.type(screen.getByRole("textbox"), "Show this week's metrics"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByText("There are two active bookings.")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: "Ask Copilot" })).not.toBeDisabled());
    expect(screen.getByText("Bookings")).toBeVisible();
    expect(screen.getByText("getBookingMetrics completed")).toBeVisible();
    expect(screen.getAllByText("Evidence (1)")[0]).toBeVisible();
  });

  it("shows a loading state while the BFF request is pending", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    ask.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    const user = userEvent.setup();
    render(<CopilotDrawer />);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Show arrivals"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
    await act(async () => {
      resolveRequest?.({ text: "Done", steps: [] });
    });
    expect(await screen.findByText("Done")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: "Ask Copilot" })).not.toBeDisabled());
  });

  it("shows approval actions for a draft and sends the chosen decision", async () => {
    ask.mockResolvedValue({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [{ toolName: "addBookingInternalNote", input: { bookingId: 1, note: "Follow up on payment." } }], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000001", bookingId: 1, note: "Follow up on payment.", status: "pending", facts: [], sourceIds: ["booking:1"], truncated: false } }] }] });
    decide.mockResolvedValue({ status: "rejected" });
    const user = userEvent.setup();
    render(<CopilotDrawer />);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a note for booking 1"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    await userAction(() => user.click(screen.getByRole("button", { name: "Reject draft" })));
    expect(decide).toHaveBeenCalledWith("00000000-0000-0000-0000-000000000001", "reject");
    expect(await screen.findByText("Decision: rejected.")).toBeVisible();
  });

  it("does not show approval success when response validation rejects a malformed payload", async () => {
    ask.mockResolvedValue({ text: "Draft ready.", steps: [{ stepNumber: 0, status: "completed", text: "", toolCalls: [], toolResults: [{ toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-0000-0000-000000000001", bookingId: 1, note: "Follow up on payment.", status: "pending", facts: [], sourceIds: ["booking:1"], truncated: false } }] }] });
    decide.mockRejectedValue(new Error("The approval service returned an invalid response."));
    const user = userEvent.setup();
    render(<CopilotDrawer />);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    await userAction(() => user.type(screen.getByRole("textbox"), "Draft a note for booking 1"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    await userAction(() => user.click(screen.getByRole("button", { name: "Approve note" })));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("The approval service returned an invalid response."));
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.queryByText(/Decision:/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve note" })).not.toBeDisabled();
  });

  it("clears an old result when the next request fails", async () => {
    ask.mockResolvedValueOnce({ text: "First answer", steps: [] }).mockRejectedValueOnce(new Error("BFF unavailable"));
    const user = userEvent.setup();
    render(<CopilotDrawer />);
    await userAction(() => user.click(screen.getByRole("button", { name: /operations copilot/i })));
    const input = screen.getByRole("textbox");
    await userAction(() => user.type(input, "First question"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByText("First answer")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: "Ask Copilot" })).not.toBeDisabled());
    await userAction(() => user.type(input, "Second question"));
    await userAction(() => user.click(screen.getByRole("button", { name: "Ask Copilot" })));
    expect(await screen.findByRole("alert")).toHaveTextContent("BFF unavailable");
    await waitFor(() => expect(screen.getByRole("button", { name: "Ask Copilot" })).not.toBeDisabled());
    expect(screen.queryByText("First answer")).not.toBeInTheDocument();
  });

  it("labels and focuses the question, traps focus, closes on Escape, and restores launcher focus", async () => {
    const user = userEvent.setup();
    render(<CopilotDrawer />);
    const launcher = screen.getByRole("button", { name: /operations copilot/i });
    await userAction(() => user.click(launcher));

    const question = screen.getByLabelText("Ask an operational question");
    const close = screen.getByRole("button", { name: "Close operations copilot" });
    expect(question).toHaveFocus();

    close.focus();
    await userAction(() => user.tab({ shift: true }));
    expect(question).toHaveFocus();

    await userAction(() => user.type(question, "Show arrivals"));
    const submit = screen.getByRole("button", { name: "Ask Copilot" });
    submit.focus();
    await userAction(() => user.tab());
    expect(close).toHaveFocus();

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
    expect(screen.getByText("getArrivals completed")).toBeVisible();
    expect(screen.getByText("getBookingMetrics failed")).toBeVisible();
    expect(screen.getByText("getBookingRisks interrupted")).toBeVisible();
  });
});
