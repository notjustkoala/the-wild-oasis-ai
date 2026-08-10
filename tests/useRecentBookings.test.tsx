import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBookingsAfterDate: vi.fn().mockResolvedValue([]),
  getStaysAfterDate: vi.fn().mockResolvedValue([]),
  useQuery: vi.fn(({ queryFn }: { queryFn: () => unknown }) => {
    void queryFn();
    return { isLoading: false, data: [] };
  }),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("../src/services/apiBookings", () => ({
  getBookingsAfterDate: mocks.getBookingsAfterDate,
  getStaysAfterDate: mocks.getStaysAfterDate,
}));

import { useRecentBookings } from "../src/features/dashboard/useRecentBookings";

function Wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={["/?last=30"]}>{children}</MemoryRouter>;
}

describe("useRecentBookings", () => {
  it("loads bookings created in the dashboard period, not stays by arrival date", () => {
    renderHook(() => useRecentBookings(), { wrapper: Wrapper });

    expect(mocks.getBookingsAfterDate).toHaveBeenCalledOnce();
    expect(mocks.getStaysAfterDate).not.toHaveBeenCalled();
  });
});
