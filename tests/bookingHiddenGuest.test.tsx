import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookingDataBox from "../src/features/bookings/BookingDataBox";
import BookingRow from "../src/features/bookings/BookingRow";
import Table from "../src/ui/Table";
import Menus from "../src/ui/Menus";

vi.mock("../src/features/check-in-out/useCheckout", () => ({ default: () => ({ checkout: vi.fn(), isCheckingOut: false }) }));
vi.mock("../src/features/bookings/useDeleteBooking", () => ({ useDeleteBooking: () => ({ deleteBooking: vi.fn(), isDeleting: false }) }));
const booking = { id: 699, created_at: "2026-08-01T00:00:00Z", startDate: "2026-08-31T00:00:00Z", endDate: "2026-09-03T00:00:00Z", numNights: 3, numGuests: 2, cabinPrice: 750, extrasPrice: 0, totalPrice: 750, hasBreakfast: false, observations: "Synthetic allergy note", isPaid: false, status: "unconfirmed", guests: null, cabins: { name: "001" } };

it("keeps the booking list usable when RLS hides the joined guest", () => {
  render(<MemoryRouter><Table columns="1fr"><Menus><BookingRow booking={booking} /></Menus></Table></MemoryRouter>);
  expect(screen.getByText("Guest details unavailable")).toBeVisible();
  expect(screen.getByText("$750.00")).toBeVisible();
  expect(screen.getByText("unconfirmed")).toBeVisible();
});

it("retains booking facts in details without inventing hidden guest identity", () => {
  render(<BookingDataBox booking={booking} />);
  expect(screen.getByText("Guest details unavailable for this account.")).toBeVisible();
  expect(screen.getByText("Synthetic allergy note")).toBeVisible();
  expect(screen.getByText("$750.00")).toBeVisible();
  expect(screen.queryByText(/National ID/)).not.toBeInTheDocument();
});
