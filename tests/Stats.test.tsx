import { render, screen } from "@testing-library/react";
import Stats from "../src/features/dashboard/Stats";

function expectOccupancy(expected: string) {
  const value = screen.getByText("Occupancy rate").nextElementSibling;

  expect(value).not.toBeNull();
  expect(value?.textContent).toBe(expected);
  expect(value?.textContent).not.toMatch(/(?:NaN|-?Infinity)%/);
}

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
    expectOccupancy("50%");
  });

  it.each([
    {
      name: "there are no cabins or confirmed stays",
      confirmedStays: [],
      numDays: 7,
      cabinCount: 0,
    },
    {
      name: "there are occupied nights but no cabins",
      confirmedStays: [{ numNights: 4 }],
      numDays: 7,
      cabinCount: 0,
    },
    {
      name: "the date range has no days",
      confirmedStays: [{ numNights: 4 }],
      numDays: 0,
      cabinCount: 2,
    },
    {
      name: "the day count is missing",
      confirmedStays: [{ numNights: 4 }],
      numDays: undefined,
      cabinCount: 2,
    },
    {
      name: "the cabin count is missing",
      confirmedStays: [{ numNights: 4 }],
      numDays: 7,
      cabinCount: undefined,
    },
    {
      name: "the day count is null",
      confirmedStays: [{ numNights: 4 }],
      numDays: null,
      cabinCount: 2,
    },
    {
      name: "the cabin count is null",
      confirmedStays: [{ numNights: 4 }],
      numDays: 7,
      cabinCount: null,
    },
    {
      name: "the day count is an empty string",
      confirmedStays: [{ numNights: 4 }],
      numDays: "",
      cabinCount: 2,
    },
    {
      name: "the cabin count is whitespace",
      confirmedStays: [{ numNights: 4 }],
      numDays: 7,
      cabinCount: "   ",
    },
    {
      name: "the day count is NaN",
      confirmedStays: [{ numNights: 4 }],
      numDays: Number.NaN,
      cabinCount: 2,
    },
    {
      name: "the cabin count is positive infinity",
      confirmedStays: [{ numNights: 4 }],
      numDays: 7,
      cabinCount: Number.POSITIVE_INFINITY,
    },
    {
      name: "the day count is negative infinity",
      confirmedStays: [{ numNights: 4 }],
      numDays: Number.NEGATIVE_INFINITY,
      cabinCount: 2,
    },
    {
      name: "the cabin count is negative",
      confirmedStays: [{ numNights: 4 }],
      numDays: 7,
      cabinCount: -2,
    },
  ])("shows 0% when $name", ({ confirmedStays, numDays, cabinCount }) => {
    render(
      <Stats
        bookings={[]}
        confirmedStays={confirmedStays}
        numDays={numDays}
        cabinCount={cabinCount}
      />
    );

    expectOccupancy("0%");
  });

  it("ignores invalid stay nights and accepts numeric stay-night strings", () => {
    render(
      <Stats
        bookings={[]}
        confirmedStays={[
          { numNights: Number.NaN },
          { numNights: Number.POSITIVE_INFINITY },
          { numNights: Number.NEGATIVE_INFINITY },
          { numNights: -3 },
          {},
          { numNights: "not-a-number" },
          { numNights: "4" },
        ]}
        numDays={4}
        cabinCount={2}
      />
    );

    expectOccupancy("50%");
  });

  it("shows 0% when every stay-night value is invalid", () => {
    render(
      <Stats
        bookings={[]}
        confirmedStays={[
          { numNights: Number.NaN },
          { numNights: Number.POSITIVE_INFINITY },
          { numNights: Number.NEGATIVE_INFINITY },
          { numNights: -1 },
          { numNights: null },
          {},
          { numNights: "not-a-number" },
        ]}
        numDays={4}
        cabinCount={2}
      />
    );

    expectOccupancy("0%");
  });

  it("calculates occupancy from numeric-string capacity values", () => {
    render(
      <Stats
        bookings={[]}
        confirmedStays={[{ numNights: "4" }]}
        numDays="4"
        cabinCount="2"
      />
    );

    expectOccupancy("50%");
  });

  it("keeps an extreme but finite capacity calculation finite", () => {
    render(
      <Stats
        bookings={[]}
        confirmedStays={[{ numNights: Number.MAX_VALUE }]}
        numDays={Number.MAX_VALUE}
        cabinCount={2}
      />
    );

    expectOccupancy("50%");
  });

  it("does not clamp a finite occupancy result above 100%", () => {
    render(
      <Stats
        bookings={[]}
        confirmedStays={[{ numNights: 12 }]}
        numDays={5}
        cabinCount={2}
      />
    );

    expectOccupancy("120%");
  });
});
