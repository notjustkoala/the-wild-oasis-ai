import styled from "styled-components";
import type { OperationsToolOutput } from "../../services/apiOperationsCopilot";
import Evidence from "./Evidence";
import PartialResultWarning from "./PartialResultWarning";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
`;
const Metric = styled.div`
  padding: 1rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-50);
`;
const Value = styled.strong`
  display: block;
  font-size: 2rem;
  color: var(--color-grey-800);
`;

type BookingMetricsOutput = Extract<OperationsToolOutput, { kind: "booking-metrics" }>;

export default function KpiResult({ output }: { output: BookingMetricsOutput }) {
  const metrics = output.metrics;
  const values: Array<[string, unknown]> = [["Bookings", metrics.totalBookings], ["Revenue", `${metrics.currency ?? ""} ${metrics.totalRevenue ?? 0}`.trim()], ["Extras (reported)", `${metrics.currency ?? ""} ${metrics.extrasRevenue ?? 0}`.trim()], ["Paid", metrics.paidBookings], ["Unpaid", metrics.unpaidBookings]];
  return <><PartialResultWarning truncated={output.truncated} /><Grid aria-label="Booking metrics">{values.map(([label, value]) => <Metric key={label}><Value>{String(value ?? 0)}</Value><span>{label}</span></Metric>)}</Grid><Evidence sourceIds={output.sourceIds} /></>;
}
