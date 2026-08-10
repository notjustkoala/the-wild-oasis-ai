import { render, screen } from "@testing-library/react";
import Stats from "../src/features/dashboard/Stats";

describe("Stats", () => {
  it("derives booking, revenue, check-in and occupancy metrics", () => {
    render(
      <Stats
        bookings={[{ totalPrice: 400 }, { totalPrice: 600 }]}
        confirmedStays={[{ numNights: 3 }, { numNights: 4 }]}
        numDays={7}
        cabinCount={2}
      />
    );

    expect(screen.getByText("bookings").nextElementSibling).toHaveTextContent(
      "2"
    );
    expect(screen.getByText("Sales").nextElementSibling).toHaveTextContent(
      "$1,000.00"
    );
    expect(screen.getByText("Check ins").nextElementSibling).toHaveTextContent(
      "2"
    );
    expect(
      screen.getByText("Occupancy rate").nextElementSibling
    ).toHaveTextContent("50%");
  });
});
