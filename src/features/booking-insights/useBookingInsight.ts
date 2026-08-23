import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  analyzeBookingInsight,
  getBookingInsight,
  reviewBookingInsight,
  type BookingInsightFeedback,
  type BookingInsightPayload,
} from "../../services/apiAi";

export const BOOKING_INSIGHT_PENDING_STALE_MS = 2 * 60 * 1000;

export function isStalePendingInsight(
  payload: BookingInsightPayload | undefined,
  now = Date.now()
) {
  if (payload?.state !== "pending" || !payload.insight?.updatedAt) return false;
  const updatedAt = Date.parse(payload.insight.updatedAt);
  return Number.isFinite(updatedAt) && now - updatedAt > BOOKING_INSIGHT_PENDING_STALE_MS;
}

export function useBookingInsight(bookingId: number) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => Date.now());
  const queryKey = ["booking-insight", bookingId] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => getBookingInsight(bookingId),
    enabled: Number.isSafeInteger(bookingId) && bookingId > 0,
    retry: false,
    refetchInterval: (data) =>
      data?.state === "pending" && !isStalePendingInsight(data)
        ? 2_500
        : false,
  });

  useEffect(() => {
    if (query.data?.state !== "pending" || !query.data.insight?.updatedAt) {
      return undefined;
    }
    const updatedAt = Date.parse(query.data.insight.updatedAt);
    if (!Number.isFinite(updatedAt)) return undefined;
    const delay = Math.max(
      0,
      BOOKING_INSIGHT_PENDING_STALE_MS - (Date.now() - updatedAt) + 1
    );
    const timer = window.setTimeout(() => setNow(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [query.data?.state, query.data?.insight?.updatedAt]);

  const analysis = useMutation({
    mutationFn: (force: boolean) => analyzeBookingInsight(bookingId, force),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });
  const review = useMutation({
    mutationFn: (feedback: BookingInsightFeedback) =>
      reviewBookingInsight(bookingId, feedback),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data),
  });

  const data = isStalePendingInsight(query.data, now)
    ? { ...query.data, state: "stale-pending" as const }
    : query.data;

  return {
    ...query,
    data,
    analyze: analysis.mutate,
    isAnalyzing: analysis.isLoading,
    analysisError: analysis.error,
    review: review.mutate,
    isReviewing: review.isLoading,
    reviewError: review.error,
  };
}
