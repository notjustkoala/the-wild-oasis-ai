import styled from "styled-components";

import type { BookingInsightResult } from "../../services/apiAi";

const Badge = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 100px;
  background: var(--color-indigo-100);
  color: var(--color-indigo-700);
  white-space: nowrap;
`;

type CachedInsight = {
  status: "pending" | "succeeded" | "failed";
  result: BookingInsightResult | null;
  reviewed_at: string | null;
};

export default function TodayInsightBadge({
  insight,
}: {
  insight?: CachedInsight | CachedInsight[] | null;
}) {
  const cached = Array.isArray(insight) ? insight[0] : insight;
  if (!cached) return <span aria-label="No cached AI Briefing">—</span>;
  if (cached.status === "pending") return <Badge>AI pending</Badge>;
  if (cached.status === "failed") return <Badge>AI retry</Badge>;
  if (!cached.result) return <span aria-label="No cached AI Briefing">—</span>;
  return (
    <Badge aria-label={`AI severity ${cached.result.severity}`}>
      AI {cached.result.severity.toUpperCase()}
      {cached.reviewed_at ? " · reviewed" : ""}
    </Badge>
  );
}
