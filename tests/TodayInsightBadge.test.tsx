import { render, screen } from "@testing-library/react";

import TodayInsightBadge from "../src/features/booking-insights/TodayInsightBadge";

describe("TodayInsightBadge", () => {
  it("shows a compact cached severity with text, not color alone", () => {
    render(
      <TodayInsightBadge
        insight={{
          status: "succeeded",
          reviewed_at: "2026-08-15T00:00:00Z",
          result: {
            summary: "Allergy",
            riskTags: ["food-allergy"],
            severity: "high",
            actionItems: ["Notify kitchen"],
            confidence: 0.9,
          },
        }}
      />
    );
    expect(screen.getByText("AI HIGH · reviewed")).toBeVisible();
    expect(screen.getByLabelText("AI severity high")).toBeVisible();
  });

  it("does not generate or fetch when no cached insight exists", () => {
    render(<TodayInsightBadge insight={null} />);
    expect(screen.getByLabelText("No cached AI Briefing")).toBeVisible();
  });
});
