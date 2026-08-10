import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => {
  const lte = vi.fn();
  const gte = vi.fn(() => ({ lte }));
  const select = vi.fn(() => ({ gte }));
  const from = vi.fn(() => ({ select }));
  return { from, select, gte, lte };
});

vi.mock("../src/services/supabase", () => ({
  default: { from: query.from },
}));

import { getBookingsAfterDate } from "../src/services/apiBookings";

describe("getBookingsAfterDate", () => {
  beforeEach(() => {
    query.lte.mockResolvedValue({
      data: [{ created_at: "2026-08-01", totalPrice: 750, extrasPrice: 0 }],
      error: null,
    });
  });

  it("queries booking creation dates and financial fields for dashboard sales", async () => {
    const start = "2026-08-01T00:00:00.000Z";

    await expect(getBookingsAfterDate(start)).resolves.toEqual([
      { created_at: "2026-08-01", totalPrice: 750, extrasPrice: 0 },
    ]);
    expect(query.from).toHaveBeenCalledWith("bookings");
    expect(query.select).toHaveBeenCalledWith(
      "created_at, totalPrice, extrasPrice"
    );
    expect(query.gte).toHaveBeenCalledWith("created_at", start);
  });
});
