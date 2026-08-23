import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const hook = vi.hoisted(() => vi.fn());

vi.mock("../src/features/booking-insights/useBookingInsight", () => ({
  useBookingInsight: hook,
}));

import BookingInsightCard from "../src/features/booking-insights/BookingInsightCard";

function state(overrides: Record<string, unknown> = {}) {
  return {
    data: { state: "missing", insight: null },
    isLoading: false,
    error: null,
    analyze: vi.fn(),
    isAnalyzing: false,
    analysisError: null,
    review: vi.fn(),
    isReviewing: false,
    reviewError: null,
    ...overrides,
  };
}

const insight = {
  result: {
    summary: "Prepare an allergen-safe late arrival.",
    riskTags: ["food-allergy", "late-arrival"],
    severity: "high",
    actionItems: ["Call the kitchen lead.", "Send after-hours instructions."],
    confidence: 0.93,
  },
  model: "gemini-test",
  promptVersion: "v1",
  sourceHash: "a".repeat(64),
  status: "succeeded",
  attemptCount: 1,
  failureCode: null,
  createdAt: "now",
  updatedAt: "now",
  reviewedAt: null,
  reviewerFeedback: null,
};

describe("BookingInsightCard", () => {
  it("keeps the raw observation visible while loading", () => {
    hook.mockReturnValue(state({ isLoading: true, data: undefined }));
    render(
      <BookingInsightCard
        bookingId={12}
        observation="Guest reports a gluten allergy."
      />
    );
    expect(screen.getByText("Guest reports a gluten allergy.")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Preparing");
  });

  it("starts missing analysis only when the employee clicks", async () => {
    const user = userEvent.setup();
    const analyze = vi.fn();
    hook.mockReturnValue(state({ analyze }));
    render(<BookingInsightCard bookingId={12} observation="Pet arriving." />);
    expect(analyze).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Generate Briefing" }));
    expect(analyze).toHaveBeenCalledWith(false);
  });

  it("renders text severity, tags, actions and supports forced reanalysis", async () => {
    const user = userEvent.setup();
    const analyze = vi.fn();
    hook.mockReturnValue(
      state({ data: { state: "cached", insight }, analyze })
    );
    render(<BookingInsightCard bookingId={12} observation="Allergy and late." />);
    expect(screen.getByText("Severity: HIGH")).toBeVisible();
    expect(screen.getAllByText("food-allergy")[0]).toBeVisible();
    expect(screen.getByText("Call the kitchen lead.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Reanalyze" }));
    expect(analyze).toHaveBeenCalledWith(true);
  });

  it("shows a safe retry state without hiding the raw note", async () => {
    const user = userEvent.setup();
    const analyze = vi.fn();
    hook.mockReturnValue(
      state({
        data: {
          state: "failed",
          insight: { ...insight, result: null, status: "failed" },
        },
        analyze,
      })
    );
    render(<BookingInsightCard bookingId={12} observation="Anniversary." />);
    expect(screen.getByText("Anniversary.")).toBeVisible();
    expect(screen.getByText(/failed safely/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Retry analysis" }));
    expect(analyze).toHaveBeenCalledWith(false);
  });

  it("offers a manual retry for a pending insight older than two minutes", async () => {
    const user = userEvent.setup();
    const analyze = vi.fn();
    hook.mockReturnValue(
      state({
        data: {
          state: "stale-pending",
          insight: { ...insight, result: null, status: "pending", updatedAt: "2026-08-23T09:57:00.000Z" },
        },
        analyze,
      })
    );
    render(<BookingInsightCard bookingId={12} observation="Late arrival." />);
    expect(screen.getByRole("status")).toHaveTextContent(/taking too long/i);
    await user.click(screen.getByRole("button", { name: "Retry analysis" }));
    expect(analyze).toHaveBeenCalledWith(false);
  });

  it("keeps a normal pending insight in preparing state without retry controls", () => {
    hook.mockReturnValue(
      state({
        data: {
          state: "pending",
          insight: { ...insight, result: null, status: "pending", updatedAt: new Date().toISOString() },
        },
      })
    );
    render(<BookingInsightCard bookingId={12} observation="Late arrival." />);
    expect(screen.getByRole("status")).toHaveTextContent(/Preparing/i);
    expect(screen.queryByRole("button", { name: "Retry analysis" })).not.toBeInTheDocument();
  });

  it("does not display a stale result as current and offers current analysis", async () => {
    const user = userEvent.setup();
    const analyze = vi.fn();
    hook.mockReturnValue(
      state({ data: { state: "stale", insight }, analyze })
    );
    render(<BookingInsightCard bookingId={12} observation="Updated pet note." />);
    expect(screen.getByText(/saved Briefing is out of date/i)).toBeVisible();
    expect(screen.queryByText("Severity: HIGH")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Analyze current observation" })
    );
    expect(analyze).toHaveBeenCalledWith(false);
  });

  it("keeps possible PII local and directs the employee to manual handling", () => {
    hook.mockReturnValue(
      state({ data: { state: "manual-review", insight: null } })
    );
    render(
      <BookingInsightCard
        bookingId={12}
        observation="Please welcome Alice Smith."
      />
    );
    expect(screen.getByText("Please welcome Alice Smith.")).toBeVisible();
    expect(screen.getByText(/AI analysis was skipped/i)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Generate|Analyze|Retry/i })
    ).not.toBeInTheDocument();
  });

  it("submits an employee verdict without modifying the AI result", async () => {
    const review = vi.fn();
    hook.mockReturnValue(
      state({ data: { state: "cached", insight }, review })
    );
    render(<BookingInsightCard bookingId={12} observation="Late." />);
    fireEvent.change(screen.getByLabelText("Review verdict"), {
      target: { value: "incorrect" },
    });
    fireEvent.change(screen.getByLabelText("Review note"), {
      target: { value: "No late arrival risk." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save review" }));
    expect(review).toHaveBeenCalledWith({
      verdict: "incorrect",
      note: "No late arrival risk.",
    });
    expect(screen.getByText("Prepare an allergen-safe late arrival.")).toBeVisible();
  });

  it("shows saved review details and prefills them for editing", () => {
    const reviewerFeedback = {
      verdict: "partially-correct",
      correctedTags: ["food-allergy", "other"],
      note: "Keep allergy; remove late arrival.",
    };
    hook.mockReturnValue(
      state({
        data: {
          state: "reviewed",
          insight: {
            ...insight,
            reviewedAt: "2026-08-15T12:00:00Z",
            reviewerFeedback,
          },
        },
      })
    );
    render(<BookingInsightCard bookingId={12} observation="Allergy and late." />);
    expect(screen.getByLabelText("Saved employee review")).toHaveTextContent(
      "Verdict: partially-correct"
    );
    expect(screen.getByLabelText("Saved employee review")).toHaveTextContent(
      "Corrected tags: food-allergy, other"
    );
    expect(screen.getByLabelText("Saved employee review")).toHaveTextContent(
      "Keep allergy; remove late arrival."
    );
    expect(screen.getByLabelText("Review verdict")).toHaveValue(
      "partially-correct"
    );
    expect(screen.getByLabelText("Review note")).toHaveValue(
      "Keep allergy; remove late arrival."
    );
    expect(screen.getByRole("checkbox", { name: "food-allergy" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "other" })).toBeChecked();
    expect(screen.getByText("Prepare an allergen-safe late arrival.")).toBeVisible();
  });
});
