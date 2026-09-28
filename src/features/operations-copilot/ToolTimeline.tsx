import styled from "styled-components";
import type { OperationsStep } from "../../services/apiOperationsCopilot";

const Activity = styled.details`
  min-width: 0;
  color: var(--color-grey-600);
  font-size: 1.3rem;

  summary {
    cursor: pointer;
    font-weight: 600;
  }
`;

const Timeline = styled.ol`
  display: grid;
  gap: 0.6rem;
  margin-top: 0.8rem;
  padding-left: 1.8rem;
`;
const Step = styled.li`
  overflow-wrap: anywhere;
`;

const TOOL_LABELS: Record<string, string> = {
  addBookingInternalNote: "Internal note draft",
  getArrivals: "Arrival lookup",
  getBookingDetails: "Booking details",
  getBookingMetrics: "Booking metrics",
  getBookingRisks: "Booking risk review",
  getCabinPerformance: "Cabin performance",
  searchHotelPolicies: "Policy and SOP search",
};

export default function ToolTimeline({ steps }: { steps: OperationsStep[] }) {
  const calls = steps.flatMap((step) => step.toolCalls.map((call) => ({ name: call.toolName, status: step.status })));
  if (!calls.length) return null;
  const hasProblem = calls.some((call) => call.status === "failed" || call.status === "interrupted");

  return (
    <Activity open={hasProblem}>
      <summary>Data activity · {calls.length} {calls.length === 1 ? "tool" : "tools"}</summary>
      <Timeline aria-label="Data activity timeline">
        {calls.map((call, index) => (
          <Step key={`${call.name}-${index}`}>
            {TOOL_LABELS[call.name] ?? "Operations data lookup"} · {call.status}
          </Step>
        ))}
      </Timeline>
    </Activity>
  );
}
