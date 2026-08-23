const query = vi.hoisted(() => {
  const order = vi.fn();
  const or = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ or }));
  const from = vi.fn(() => ({ select }));
  return { from, select, or, order };
});

vi.mock("../src/services/supabase", () => ({
  default: { from: query.from },
}));

import { getStaysTodayActivity } from "../src/services/apiBookings";

describe("today activity cached AI insight query", () => {
  it("loads cached insights in one Supabase relationship query and makes zero BFF calls", async () => {
    query.order.mockResolvedValue({
      data: [
        {
          id: 12,
          booking_ai_insights: {
            status: "succeeded",
            result: { severity: "high" },
            reviewed_at: null,
          },
        },
      ],
      error: null,
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(getStaysTodayActivity()).resolves.toHaveLength(1);
    expect(query.from).toHaveBeenCalledTimes(1);
    expect(query.from).toHaveBeenCalledWith("bookings");
    expect(query.select).toHaveBeenCalledTimes(1);
    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining(
        "booking_ai_insights(status, result, reviewed_at)"
      )
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
