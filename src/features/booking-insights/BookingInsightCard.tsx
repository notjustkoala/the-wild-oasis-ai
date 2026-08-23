import { useState } from "react";
import styled from "styled-components";

import type {
  BookingInsightFeedback,
  BookingRiskTag,
} from "../../services/apiAi";
import { useBookingInsight } from "./useBookingInsight";

const Card = styled.section`
  padding: 2.4rem 3.2rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-0);
  display: grid;
  gap: 1.6rem;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
`;

const RawObservation = styled.div`
  padding: 1.2rem 1.6rem;
  background: var(--color-grey-50);
  border-left: 4px solid var(--color-grey-300);

  strong {
    display: block;
    margin-bottom: 0.4rem;
  }
`;

const Severity = styled.p<{ $severity: "low" | "medium" | "high" }>`
  width: fit-content;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-weight: 600;
  color: ${({ $severity }) =>
    $severity === "high"
      ? "var(--color-red-700)"
      : $severity === "medium"
        ? "var(--color-yellow-700)"
        : "var(--color-green-700)"};
  background: ${({ $severity }) =>
    $severity === "high"
      ? "var(--color-red-100)"
      : $severity === "medium"
        ? "var(--color-yellow-100)"
        : "var(--color-green-100)"};
`;

const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;

  li {
    padding: 0.3rem 0.8rem;
    background: var(--color-indigo-100);
    color: var(--color-indigo-700);
    border-radius: 100px;
    font-size: 1.3rem;
  }
`;

const Actions = styled.ol`
  padding-left: 2rem;
  display: grid;
  gap: 0.6rem;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ActionButton = styled.button<{ $secondary?: boolean }>`
  border: ${({ $secondary }) =>
    $secondary ? "1px solid var(--color-grey-200)" : "none"};
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ $secondary }) =>
    $secondary ? "var(--color-grey-600)" : "var(--color-brand-50)"};
  background: ${({ $secondary }) =>
    $secondary ? "var(--color-grey-0)" : "var(--color-brand-600)"};

  &:hover:not(:disabled) {
    background: ${({ $secondary }) =>
      $secondary ? "var(--color-grey-50)" : "var(--color-brand-700)"};
  }
`;

const Feedback = styled.form`
  border-top: 1px solid var(--color-grey-200);
  padding-top: 1.6rem;
  display: grid;
  gap: 1.2rem;

  fieldset {
    border: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  textarea,
  select {
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    padding: 0.8rem 1rem;
    background: var(--color-grey-0);
  }
`;

const ReviewSummary = styled.div`
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--color-indigo-100);
  border-radius: var(--border-radius-sm);
  display: grid;
  gap: 0.6rem;
`;

const riskTags: BookingRiskTag[] = [
  "food-allergy",
  "late-arrival",
  "pet",
  "celebration",
  "extra-bed",
  "other",
];

function FeedbackForm({
  onSubmit,
  disabled,
  initialFeedback,
}: {
  onSubmit: (feedback: BookingInsightFeedback) => void;
  disabled: boolean;
  initialFeedback?: BookingInsightFeedback | null;
}) {
  const [verdict, setVerdict] = useState<BookingInsightFeedback["verdict"]>(
    initialFeedback?.verdict ?? "correct"
  );
  const [correctedTags, setCorrectedTags] = useState<BookingRiskTag[]>(
    initialFeedback?.correctedTags ?? []
  );
  const [note, setNote] = useState(initialFeedback?.note ?? "");

  function toggleTag(tag: BookingRiskTag) {
    setCorrectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag]
    );
  }

  return (
    <Feedback
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          verdict,
          ...(correctedTags.length ? { correctedTags } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
        });
      }}
    >
      <strong>Employee review</strong>
      <label>
        Verdict
        <select
          aria-label="Review verdict"
          value={verdict}
          onChange={(event) =>
            setVerdict(event.target.value as BookingInsightFeedback["verdict"])
          }
          disabled={disabled}
        >
          <option value="correct">Correct</option>
          <option value="partially-correct">Partially correct</option>
          <option value="incorrect">Incorrect</option>
        </select>
      </label>
      <fieldset disabled={disabled}>
        <legend>Corrected tags (optional)</legend>
        {riskTags.map((tag) => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={correctedTags.includes(tag)}
              onChange={() => toggleTag(tag)}
            />
            {tag}
          </label>
        ))}
      </fieldset>
      <label>
        Review note (optional)
        <textarea
          aria-label="Review note"
          maxLength={1000}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={disabled}
        />
      </label>
      <div>
        <ActionButton type="submit" disabled={disabled}>
          Save review
        </ActionButton>
      </div>
    </Feedback>
  );
}

export default function BookingInsightCard({
  bookingId,
  observation,
}: {
  bookingId: number;
  observation?: string | null;
}) {
  const {
    data,
    isLoading,
    error,
    analyze,
    isAnalyzing,
    analysisError,
    review,
    isReviewing,
    reviewError,
  } = useBookingInsight(bookingId);

  const state = observation?.trim() ? data?.state ?? "missing" : "empty";
  const insight = data?.insight?.result;
  const reviewerFeedback = data?.insight?.reviewerFeedback;
  const busy = isLoading || isAnalyzing || state === "pending";
  const visibleError = error || analysisError || reviewError;

  return (
    <Card aria-labelledby="booking-insight-title" aria-busy={busy}>
      <Header>
        <Title id="booking-insight-title">AI risk Briefing</Title>
        <span aria-live="polite">
          {isAnalyzing ? "Analyzing" : state === "cached" ? "Cached" : state}
        </span>
      </Header>

      <RawObservation>
        <strong>Original booking observation</strong>
        <p>{observation?.trim() || "No observation was provided."}</p>
      </RawObservation>

      {busy && <p role="status">Preparing the operational Briefing…</p>}
      {state === "stale-pending" && (
        <p role="status">
          The previous analysis attempt is taking too long. Retry when you are
          ready; the server will safely reclaim the stale request.
        </p>
      )}
      {Boolean(visibleError) && <p role="alert">AI Briefing could not be loaded. Please retry.</p>}
      {state === "empty" && <p>No note to analyze; the booking flow is unchanged.</p>}
      {state === "manual-review" && (
        <p role="status">
          AI analysis was skipped because this note may contain personal information.
          Use the original observation for manual handling.
        </p>
      )}
      {state === "stale" && (
        <p role="status">
          The saved Briefing is out of date because the observation, model, or
          prompt version changed. Generate a current Briefing before relying on it.
        </p>
      )}
      {state === "missing" && !isLoading && (
        <p>No AI analysis exists yet. Generation only starts on demand.</p>
      )}
      {state === "failed" && (
        <p role="alert">The last analysis failed safely. Booking data was not changed.</p>
      )}

      {insight && (state === "cached" || state === "reviewed") && (
        <>
          <Severity $severity={insight.severity}>
            Severity: {insight.severity.toUpperCase()}
          </Severity>
          <p><strong>Summary:</strong> {insight.summary}</p>
          <div>
            <strong>Risk tags</strong>
            <Tags>{insight.riskTags.map((tag) => <li key={tag}>{tag}</li>)}</Tags>
          </div>
          <div>
            <strong>Recommended actions</strong>
            <Actions>{insight.actionItems.map((item) => <li key={item}>{item}</li>)}</Actions>
          </div>
          <p>Confidence: {Math.round(insight.confidence * 100)}%</p>
          {state === "reviewed" && reviewerFeedback && (
            <ReviewSummary aria-label="Saved employee review">
              <strong>Saved employee review</strong>
              <p>Verdict: {reviewerFeedback.verdict}</p>
              <p>
                Corrected tags: {reviewerFeedback.correctedTags?.join(", ") || "None"}
              </p>
              <p>Review note: {reviewerFeedback.note || "None"}</p>
            </ReviewSummary>
          )}
        </>
      )}

      <Controls>
        {state === "missing" && !isLoading && (
          <ActionButton onClick={() => analyze(false)} disabled={isAnalyzing}>
            Generate Briefing
          </ActionButton>
        )}
      {state === "failed" && (
        <ActionButton onClick={() => analyze(false)} disabled={isAnalyzing}>
          Retry analysis
        </ActionButton>
      )}
      {state === "stale-pending" && (
        <ActionButton onClick={() => analyze(false)} disabled={isAnalyzing}>
          Retry analysis
        </ActionButton>
      )}
        {state === "stale" && (
          <ActionButton onClick={() => analyze(false)} disabled={isAnalyzing}>
            Analyze current observation
          </ActionButton>
        )}
        {(state === "cached" || state === "reviewed") && (
          <ActionButton $secondary onClick={() => analyze(true)} disabled={isAnalyzing}>
            Reanalyze
          </ActionButton>
        )}
      </Controls>

      {insight && (state === "cached" || state === "reviewed") && (
        <FeedbackForm
          key={data?.insight?.reviewedAt ?? "unreviewed"}
          onSubmit={review}
          disabled={isReviewing}
          initialFeedback={reviewerFeedback}
        />
      )}
    </Card>
  );
}
