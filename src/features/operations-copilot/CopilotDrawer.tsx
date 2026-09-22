import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";

import {
  askOperationsCopilot,
  decideOperationsApproval,
  OperationsRequestError,
  type OperationsReceipt,
  type OperationsResponse,
  type OperationsToolOutput,
} from "../../services/apiOperationsCopilot";
import BookingResult from "./BookingResult";
import ChartResult from "./ChartResult";
import KpiResult from "./KpiResult";
import PolicyCitations from "./PolicyCitations";
import ToolTimeline from "./ToolTimeline";
import ResponseFeedback from "./ResponseFeedback";
import { Link } from "react-router-dom";

const Launcher = styled.button`
  position: fixed; right: 2.4rem; bottom: 2.4rem; z-index: 20; border: 0; border-radius: 100px; padding: 1.2rem 1.8rem; color: var(--color-brand-50); background: var(--color-brand-700); box-shadow: var(--shadow-lg); font-weight: 600;
`;
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 30; background: var(--backdrop-color);
`;
const Drawer = styled.aside`
  position: absolute; top: 0; right: 0; height: 100%; width: min(48rem, 100%); padding: 2.4rem; overflow-y: auto; background: var(--color-grey-0); box-shadow: var(--shadow-lg); display: grid; align-content: start; gap: 1.6rem;
`;
const Header = styled.header`
  display: flex; align-items: start; justify-content: space-between; gap: 1rem;
`;
const Close = styled.button`
  border: 0; background: transparent; font-size: 2.4rem;
`;
const Form = styled.form`
  display: grid; gap: 0.8rem;
  textarea { min-height: 8rem; resize: vertical; border: 1px solid var(--color-grey-300); border-radius: var(--border-radius-sm); padding: 1rem; background: var(--color-grey-0); }
`;
const Button = styled.button<{ $secondary?: boolean }>`
  border: ${({ $secondary }) => $secondary ? "1px solid var(--color-grey-300)" : "0"}; border-radius: var(--border-radius-sm); padding: 0.8rem 1.2rem; color: ${({ $secondary }) => $secondary ? "var(--color-grey-700)" : "var(--color-brand-50)"}; background: ${({ $secondary }) => $secondary ? "var(--color-grey-0)" : "var(--color-brand-600)"};
`;
const Result = styled.section`
  display: grid; gap: 1rem; border-top: 1px solid var(--color-grey-200); padding-top: 1.6rem;
`;
const Approval = styled.div`
  display: grid; gap: 0.8rem; padding: 1.2rem; border: 1px solid var(--color-yellow-700); border-radius: var(--border-radius-sm); background: var(--color-yellow-100);
`;

function outputs(result: OperationsResponse | null): OperationsToolOutput[] {
  return result?.steps.flatMap((step) =>
    step.toolResults.flatMap((item) => item.output ? [item.output] : [])
  ) ?? [];
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])'
  )).filter((element) => element.getAttribute("aria-hidden") !== "true");
}

export default function CopilotDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<OperationsResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OperationsReceipt | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const [approvalState, setApprovalState] = useState<string | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const restoreLauncherFocus = useRef(false);
  const toolOutputs = useMemo(() => outputs(result), [result]);
  const proposal = toolOutputs.find((output) => output.kind === "internal-note-approval");

  useEffect(() => {
    if (open) {
      restoreLauncherFocus.current = true;
      textareaRef.current?.focus();
      return;
    }

    if (restoreLauncherFocus.current) {
      restoreLauncherFocus.current = false;
      launcherRef.current?.focus();
    }
  }, [open]);

  function closeDrawer() {
    setOpen(false);
  }

  function handleDrawerKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== "Tab" || !drawerRef.current) return;

    const focusable = getFocusableElements(drawerRef.current);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const shouldWrapBackward = event.shiftKey && activeIndex <= 0;
    const shouldWrapForward = !event.shiftKey && (activeIndex === -1 || activeIndex === focusable.length - 1);
    if (!shouldWrapBackward && !shouldWrapForward) return;

    event.preventDefault();
    (shouldWrapBackward ? focusable.at(-1) : focusable[0])?.focus();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setReceipt(null);
    activeRequest.current = new AbortController();
    setApprovalState(null);
    try {
      const answer = await askOperationsCopilot(input, activeRequest.current.signal);
      setResult(answer); setReceipt(answer.receipt ?? null);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "The operations copilot is unavailable.";
      setError(message);
      if (requestError instanceof OperationsRequestError) setReceipt(requestError.receipt ?? null);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function decide(action: "approve" | "reject") {
    if (!proposal || approvalState) return;
    setApprovalState(`${action}ing`);
    try {
      const response = await decideOperationsApproval(proposal.approvalId, action);
      setApprovalState(response.status);
      toast.success(action === "approve" ? "Internal note added." : "Draft rejected; no booking field changed.");
    } catch (decisionError) {
      setApprovalState(null);
      toast.error(decisionError instanceof Error ? decisionError.message : "Approval decision failed.");
    }
  }

  return <>
    <Launcher ref={launcherRef} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>✦ Operations Copilot</Launcher>
    {open ? <Overlay>
      <Drawer ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="operations-copilot-title" aria-busy={busy} onKeyDown={handleDrawerKeyDown}>
        <Header>
          <div><h2 id="operations-copilot-title">Operations Copilot</h2><p>Read-only operational answers with approval-gated notes.</p></div>
          <Close type="button" onClick={closeDrawer} aria-label="Close operations copilot">×</Close>
        </Header>
        <Form onSubmit={submit}>
          <label htmlFor="operations-copilot-question">Ask an operational question</label>
          <textarea ref={textareaRef} id="operations-copilot-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={2_000} placeholder="Draft an internal note for booking 123: Follow up on payment" disabled={busy} />
          <Button type="submit" disabled={busy || !input.trim()}>{busy ? "Thinking…" : "Ask Copilot"}</Button>
        </Form>
        {busy ? <p role="status">Loading operational data…</p> : null}
        {busy ? <Button type="button" $secondary onClick={() => activeRequest.current?.abort()}>Stop response</Button> : null}
        {error ? <p role="alert">{error}</p> : null}
        {receipt ? <ResponseFeedback key={receipt.traceId} receipt={receipt} /> : null}
        <Link to="/bookings" onClick={closeDrawer}>Continue with Bookings</Link>
        {!busy && !result && !error ? <p role="status">Ask an operational question to begin.</p> : null}
        {result ? <Result>
          {result.text.trim() ? <p>{result.text}</p> : <p role="status">No operational data was returned.</p>}
          <ToolTimeline steps={result.steps} />
          {toolOutputs.map((output, index) => {
            if (output.kind === "booking-metrics") return <KpiResult key={`${output.kind}-${index}`} output={output} />;
            if (output.kind === "cabin-performance") return <ChartResult key={`${output.kind}-${index}`} output={output} />;
            if (output.kind === "arrivals" || output.kind === "booking-risks" || output.kind === "booking-details") {
              return <BookingResult key={`${output.kind}-${index}`} output={output} />;
            }
            if (output.kind === "policy-search") {
              return <PolicyCitations key={`${output.kind}-${index}`} output={output} />;
            }
            return null;
          })}
          {proposal ? <Approval>
            <strong>Approval required · booking #{proposal.bookingId}</strong>
            <p>{proposal.note}</p>
            <div>
              <Button type="button" onClick={() => void decide("approve")} disabled={Boolean(approvalState)}>{approvalState === "approving" ? "Approving…" : "Approve note"}</Button>{" "}
              <Button type="button" $secondary onClick={() => void decide("reject")} disabled={Boolean(approvalState)}>{approvalState === "rejecting" ? "Rejecting…" : "Reject draft"}</Button>
            </div>
            {approvalState ? <p role="status">Decision: {approvalState}.</p> : null}
          </Approval> : null}
        </Result> : null}
      </Drawer>
    </Overlay> : null}
  </>;
}
