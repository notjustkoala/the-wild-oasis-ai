import styled from "styled-components";
import type { OperationsToolOutput } from "../../services/apiOperationsCopilot";
import Evidence from "./Evidence";
import PartialResultWarning from "./PartialResultWarning";

const List = styled.ul`
  display: grid;
  min-width: 0;
  gap: 0.9rem;
`;
const Row = styled.li`
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(8rem, 11rem) minmax(6rem, 1fr) minmax(16rem, auto);
  align-items: center;
  gap: 1rem;

  @media (max-width: 40rem) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.6rem;
  }
`;
const Track = styled.span`
  display: block;
  height: 0.8rem;
  overflow: hidden;
  border-radius: 100px;
  background: var(--color-grey-200);
`;
const Bar = styled.span<{ $width: number }>`
  display: block;
  width: ${({ $width }) => `${$width}%`};
  height: 100%;
  background: var(--color-brand-600);
`;
const Metrics = styled.span`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.3rem 0.8rem;

  @media (max-width: 40rem) {
    justify-content: flex-start;
  }
`;

type CabinPerformanceOutput = Extract<OperationsToolOutput, { kind: "cabin-performance" }>;

export default function ChartResult({ output }: { output: CabinPerformanceOutput }) {
  const cabins = output.cabins;
  const max = Math.max(1, ...cabins.map((cabin) => Number(cabin.revenue) || 0));
  if (!cabins.length) return <><PartialResultWarning truncated={output.truncated} /><p>No cabin performance data found.</p><Evidence sourceIds={output.sourceIds} /></>;
  return <><PartialResultWarning truncated={output.truncated} /><List aria-label="Cabin performance">{cabins.map((cabin) => {
    const cabinName = String(cabin.cabinName);
    const revenue = Number(cabin.revenue) || 0;
    const revenueLabel = `USD ${revenue.toFixed(2)}`;
    const bookingsLabel = `${cabin.bookings} ${cabin.bookings === 1 ? "booking" : "bookings"}`;
    const nightsLabel = `${cabin.nights} ${cabin.nights === 1 ? "night" : "nights"}`;
    return <Row
      key={String(cabin.cabinId)}
      aria-label={`${cabinName}. Revenue ${revenueLabel}. ${bookingsLabel}. ${nightsLabel}.`}
    >
      <span>{cabinName}</span>
      <Track aria-hidden="true"><Bar $width={(revenue / max) * 100} /></Track>
      <Metrics>
        <span><strong>Revenue:</strong> {revenueLabel}</span>
        <span>{bookingsLabel}</span>
        <span>{nightsLabel}</span>
      </Metrics>
    </Row>;
  })}</List><Evidence sourceIds={output.sourceIds} /></>;
}
