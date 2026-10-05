import { Link } from "react-router-dom";
import styled from "styled-components";

import type {
  OperationsReceipt,
  OperationsResponse,
  OperationsToolOutput,
} from "../../services/apiOperationsCopilot";
import BookingResult from "./BookingResult";
import ChartResult from "./ChartResult";
import CopilotAnswer from "./CopilotAnswer";
import Evidence from "./Evidence";
import KpiResult from "./KpiResult";
import PartialResultWarning from "./PartialResultWarning";
import PolicyCitations from "./PolicyCitations";
import ResponseFeedback from "./ResponseFeedback";
import ToolTimeline from "./ToolTimeline";

const Results = styled.section`
  display: grid;
  min-width: 0;
  gap: 1.8rem;
`;

const Group = styled.section`
  display: grid;
  min-width: 0;
  gap: 1rem;

  & > h3 {
    margin: 0;
  }
`;

const PolicyGroup = styled(Group)`
  & > section > h3 {
    display: none;
  }
`;

const Approval = styled.section<{ $terminal: boolean }>`
  display: grid;
  min-width: 0;
  gap: 0.8rem;
  border: 1px solid ${({ $terminal }) => $terminal ? "var(--color-grey-300)" : "var(--color-yellow-700)"};
  border-radius: var(--border-radius-sm);
  padding: 1.4rem;
  background: ${({ $terminal }) => $terminal ? "var(--color-grey-100)" : "var(--color-yellow-100)"};

  p {
    overflow-wrap: anywhere;
  }
`;

const Status = styled.strong<{ $terminal: boolean }>`
  width: fit-content;
  border-radius: 100px;
  padding: 0.3rem 0.8rem;
  color: ${({ $terminal }) => $terminal ? "var(--color-grey-700)" : "var(--color-yellow-700)"};
  background: ${({ $terminal }) => $terminal ? "var(--color-grey-200)" : "var(--color-yellow-200)"};
  font-size: 1.2rem;
  text-transform: uppercase;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const Action = styled.button<{ $secondary?: boolean }>`
  border: ${({ $secondary }) => $secondary ? "1px solid var(--color-grey-300)" : "0"};
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  color: ${({ $secondary }) => $secondary ? "var(--color-grey-700)" : "var(--color-brand-50)"};
  background: ${({ $secondary }) => $secondary ? "var(--color-grey-0)" : "var(--color-brand-600)"};

  &:disabled {
    cursor: not-allowed;
    border-color: var(--color-grey-300);
    color: var(--color-grey-500);
    background: var(--color-grey-200);
    opacity: 0.72;
  }
`;

const EmptyBookings = styled.p`
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-100);
  color: var(--color-grey-700);
`;

const Footer = styled.footer`
  display: grid;
  min-width: 0;
  gap: 1.2rem;
  border-top: 1px solid var(--color-grey-200);
  padding-top: 1.6rem;
`;

type ApprovalOutput = Extract<OperationsToolOutput, { kind: "internal-note-approval" }>;
type BookingOutput = Extract<OperationsToolOutput, { kind: "arrivals" | "booking-risks" | "booking-details" }>;

function getBookings(output: BookingOutput) {
  if (output.kind === "arrivals") return output.arrivals;
  if (output.kind === "booking-risks") return output.risks;
  return output.bookings;
}

function sourceIds(outputs: BookingOutput[]) {
  return [...new Set(outputs.flatMap((output) => output.sourceIds))];
}

function SectionTitle({ children }: { children: string }) {
  return <h3>{children}</h3>;
}

export default function StructuredResults({
  result,
  outputs,
  receipt,
  approvalState,
  onDecision,
  onContinue,
  streaming = false,
  expandExplanation = streaming,
}: {
  result: OperationsResponse;
  outputs: OperationsToolOutput[];
  receipt: OperationsReceipt | null;
  approvalState: string | null;
  onDecision: (action: "approve" | "reject") => void;
  onContinue: () => void;
  streaming?: boolean;
  expandExplanation?: boolean;
}) {
  const proposal = outputs.find((output): output is ApprovalOutput => output.kind === "internal-note-approval");
  const metrics = outputs.filter((output): output is Extract<OperationsToolOutput, { kind: "booking-metrics" }> => output.kind === "booking-metrics");
  const arrivals = outputs.filter((output): output is Extract<OperationsToolOutput, { kind: "arrivals" }> => output.kind === "arrivals");
  const attention = outputs.filter((output): output is Extract<OperationsToolOutput, { kind: "booking-risks" | "booking-details" }> => output.kind === "booking-risks" || output.kind === "booking-details");
  const cabins = outputs.filter((output): output is Extract<OperationsToolOutput, { kind: "cabin-performance" }> => output.kind === "cabin-performance");
  const policies = outputs.filter((output): output is Extract<OperationsToolOutput, { kind: "policy-search" }> => output.kind === "policy-search");
  const nonemptyArrivals = arrivals.filter((output) => output.arrivals.length > 0);
  const nonemptyAttention = attention.filter((output) => getBookings(output).length > 0);
  const emptyArrivals = arrivals.filter((output) => output.arrivals.length === 0);
  const emptyAttention = attention.filter((output) => getBookings(output).length === 0);
  const arrivalsAllEmpty = arrivals.length > 0 && nonemptyArrivals.length === 0;
  const attentionAllEmpty = attention.length > 0 && nonemptyAttention.length === 0;
  const combineBookingEmptyStates = arrivalsAllEmpty && attentionAllEmpty;
  const hasStructuredResults = outputs.length > 0;
  const decision = approvalState === "executed" || approvalState === "rejected" ? approvalState : null;
  const terminal = Boolean(decision);

  return (
    <Results aria-label="Operations Copilot results">
      {proposal ? (
        <Approval $terminal={terminal} aria-labelledby="copilot-approval-title">
          <Status $terminal={terminal}>{decision ?? "Pending approval"}</Status>
          <strong id="copilot-approval-title">Internal note · Booking #{proposal.bookingId}</strong>
          <p>{proposal.note}</p>
          <Actions>
            <Action type="button" onClick={() => onDecision("approve")} disabled={streaming || Boolean(approvalState)}>
              {approvalState === "approving" ? "Approving…" : "Approve note"}
            </Action>
            <Action type="button" $secondary onClick={() => onDecision("reject")} disabled={streaming || Boolean(approvalState)}>
              {approvalState === "rejecting" ? "Rejecting…" : "Reject draft"}
            </Action>
          </Actions>
          {approvalState ? <p role="status">Decision: {approvalState}.</p> : <p>Review the exact note before approving it.</p>}
        </Approval>
      ) : null}

      {metrics.length ? <Group><SectionTitle>Summary metrics</SectionTitle>{metrics.map((output, index) => <KpiResult key={`metrics-${index}`} output={output} />)}</Group> : null}
      {combineBookingEmptyStates ? <Group aria-label="Arrivals and bookings needing attention">
        <PartialResultWarning truncated={[...arrivals, ...attention].some((output) => output.truncated)} />
        <EmptyBookings role="status">No matching arrivals or bookings needing attention were found.</EmptyBookings>
        <Evidence sourceIds={sourceIds([...arrivals, ...attention])} />
      </Group> : <>
        {nonemptyArrivals.length ? <Group>
          <SectionTitle>Arrivals</SectionTitle>
          <PartialResultWarning truncated={emptyArrivals.some((output) => output.truncated)} />
          {nonemptyArrivals.map((output, index) => <BookingResult key={`arrivals-${index}`} output={output} />)}
          <Evidence sourceIds={sourceIds(emptyArrivals)} />
        </Group> : null}
        {arrivalsAllEmpty ? <Group>
          <SectionTitle>Arrivals</SectionTitle>
          <PartialResultWarning truncated={arrivals.some((output) => output.truncated)} />
          <EmptyBookings role="status">No matching arrivals were found.</EmptyBookings>
          <Evidence sourceIds={sourceIds(arrivals)} />
        </Group> : null}
        {nonemptyAttention.length ? <Group>
          <SectionTitle>Bookings needing attention</SectionTitle>
          <PartialResultWarning truncated={emptyAttention.some((output) => output.truncated)} />
          {nonemptyAttention.map((output, index) => <BookingResult key={`attention-${index}`} output={output} />)}
          <Evidence sourceIds={sourceIds(emptyAttention)} />
        </Group> : null}
        {attentionAllEmpty ? <Group>
          <SectionTitle>Bookings needing attention</SectionTitle>
          <PartialResultWarning truncated={attention.some((output) => output.truncated)} />
          <EmptyBookings role="status">No bookings needing attention were found.</EmptyBookings>
          <Evidence sourceIds={sourceIds(attention)} />
        </Group> : null}
      </>}
      {cabins.length ? <Group><SectionTitle>Cabin performance</SectionTitle>{cabins.map((output, index) => <ChartResult key={`cabins-${index}`} output={output} />)}</Group> : null}
      {policies.length ? <PolicyGroup><SectionTitle>Policy sources</SectionTitle>{policies.map((output, index) => <PolicyCitations key={`policies-${index}`} output={output} />)}</PolicyGroup> : null}

      <CopilotAnswer text={result.text} hasStructuredResults={hasStructuredResults} streaming={streaming} expanded={expandExplanation} />
      <ToolTimeline steps={result.steps} />

      <Footer>
        <Link to="/bookings" onClick={onContinue}>Continue with Bookings</Link>
        {receipt && !streaming ? <ResponseFeedback key={receipt.traceId} receipt={receipt} /> : null}
      </Footer>
    </Results>
  );
}
