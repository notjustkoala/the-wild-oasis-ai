import styled from "styled-components";
import type { OperationsToolOutput } from "../../services/apiOperationsCopilot";
import { useNavigate } from "react-router-dom";
import Evidence from "./Evidence";
import PartialResultWarning from "./PartialResultWarning";

const List = styled.ul`
  display: grid;
  gap: 0.8rem;
`;
const Item = styled.li`
  padding: 1rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  display: grid;
  gap: 0.3rem;
`;
const OpenBooking = styled.button`
  width: fit-content;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  padding: 0.5rem 0.8rem;
  background: var(--color-grey-0);
  color: var(--color-brand-700);
`;

type BookingOutput = Extract<OperationsToolOutput, { kind: "arrivals" | "booking-risks" | "booking-details" }>;

function getBookings(output: BookingOutput) {
  if (output.kind === "booking-details") return output.bookings;
  if (output.kind === "booking-risks") return output.risks;
  return output.arrivals;
}

export default function BookingResult({ output }: { output: BookingOutput }) {
  const navigate = useNavigate();
  const bookings = getBookings(output);
  if (!bookings.length) return <><PartialResultWarning truncated={output.truncated} /><p>No bookings found for this request.</p><Evidence sourceIds={output.sourceIds} /></>;
  return <><PartialResultWarning truncated={output.truncated} /><List aria-label="Booking results">{bookings.map((booking) => <Item key={String(booking.bookingId)}><strong>Booking #{String(booking.bookingId)} · {String(booking.cabinName)}</strong><span>{String(booking.arrivalDate)} → {String(booking.departureDate)} · {String(booking.status)}</span><span>{booking.isPaid ? "Paid" : "Payment pending"} · {String(booking.numGuests)} guests</span>{booking.riskTags.length ? <span>Risks: {booking.riskTags.join(", ")}</span> : null}<OpenBooking type="button" onClick={() => navigate(`/bookings/${String(booking.bookingId)}`)}>Open booking</OpenBooking></Item>)}</List><Evidence sourceIds={output.sourceIds} /></>;
}
