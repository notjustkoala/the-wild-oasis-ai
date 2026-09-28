import { useState } from "react";
import styled from "styled-components";
import { sendOperationsFeedback, type OperationsReceipt } from "../../services/apiOperationsCopilot";

const Feedback = styled.section`
  display: grid;
  min-width: 0;
  gap: 0.8rem;

  code {
    display: block;
    overflow-wrap: anywhere;
  }
`;

const Details = styled.details`
  color: var(--color-grey-600);

  summary {
    cursor: pointer;
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;

  button {
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    padding: 0.6rem 0.9rem;
    background: var(--color-grey-0);
  }

  button:disabled {
    cursor: not-allowed;
    color: var(--color-grey-500);
    background: var(--color-grey-200);
  }
`;

export default function ResponseFeedback({ receipt }: { receipt: OperationsReceipt }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function rate(rating: "helpful" | "not-helpful") {
    if (busy || submitted) return;
    setBusy(true); setMessage("");
    try { await sendOperationsFeedback(receipt, rating); setSubmitted(true); setMessage("Feedback saved."); }
    catch { setMessage("Feedback could not be saved. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <Feedback aria-label="Response feedback and details">
      {receipt.token ? <Actions aria-label="Rate this response">
        <button type="button" disabled={busy || submitted} onClick={() => void rate("helpful")}>Helpful</button>
        <button type="button" disabled={busy || submitted} onClick={() => void rate("not-helpful")}>Not helpful</button>
      </Actions> : null}
      {message ? <p role="status">{message}</p> : null}
      <Details>
        <summary>Response details</summary>
        <small>Reference</small>
        <code>{receipt.traceId}</code>
      </Details>
    </Feedback>
  );
}
