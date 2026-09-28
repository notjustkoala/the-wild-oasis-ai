import { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import toast from "react-hot-toast";

import {
  askOperationsCopilot,
  decideOperationsApproval,
  OperationsRequestError,
  type OperationsReceipt,
  type OperationsResponse,
  type OperationsToolOutput,
} from "../../services/apiOperationsCopilot";
import ResponseFeedback from "./ResponseFeedback";
import StructuredResults from "./StructuredResults";
import { Link } from "react-router-dom";

const Launcher = styled.button`
  position: fixed; right: 2.4rem; bottom: 2.4rem; z-index: 20; border: 0; border-radius: 100px; padding: 1.2rem 1.8rem; color: var(--color-brand-50); background: var(--color-brand-700); box-shadow: var(--shadow-lg); font-weight: 600;

  @media (max-width: 40rem) {
    right: 1.2rem;
    bottom: 1.2rem;
  }
`;
const DrawerOpenScrollLock = createGlobalStyle`
  html,
  body {
    max-width: 100vw;
    overflow: hidden;
  }
`;
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 30; max-width: 100vw; overflow: hidden; background: var(--backdrop-color);
`;
const Drawer = styled.aside`
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  width: min(56rem, 100vw);
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  background: var(--color-grey-0);
  box-shadow: var(--shadow-lg);

  @media (max-width: 40rem) {
    width: 100vw;
  }
`;
const Header = styled.header`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  padding: 2rem 2.4rem 1rem;

  p {
    overflow-wrap: anywhere;
  }

  @media (max-width: 40rem) {
    padding: 1.4rem 1.6rem 0.8rem;
  }
`;
const Close = styled.button`
  display: grid;
  flex: 0 0 4.4rem;
  min-width: 4.4rem;
  min-height: 4.4rem;
  place-items: center;
  border: 0;
  border-radius: var(--border-radius-sm);
  background: transparent;
  font-size: 2.4rem;
`;
const Form = styled.form`
  display: grid;
  gap: 0.8rem;
  padding: 0 2.4rem 1.6rem;
  border-bottom: 1px solid var(--color-grey-200);

  textarea { min-height: 8rem; resize: vertical; border: 1px solid var(--color-grey-300); border-radius: var(--border-radius-sm); padding: 1rem; background: var(--color-grey-0); }

  @media (max-width: 40rem) {
    padding: 0 1.6rem 1.2rem;
  }
`;
const Button = styled.button<{ $secondary?: boolean }>`
  border: ${({ $secondary }) => $secondary ? "1px solid var(--color-grey-300)" : "0"}; border-radius: var(--border-radius-sm); padding: 0.8rem 1.2rem; color: ${({ $secondary }) => $secondary ? "var(--color-grey-700)" : "var(--color-brand-50)"}; background: ${({ $secondary }) => $secondary ? "var(--color-grey-0)" : "var(--color-brand-600)"};
`;
const Content = styled.div`
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 1.6rem;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1.6rem 2.4rem 2.4rem;
  overscroll-behavior: contain;

  @media (max-width: 40rem) {
    padding: 1.2rem 1.6rem 2rem;
  }
`;
const FallbackFooter = styled.footer`
  display: grid;
  min-width: 0;
  gap: 1.2rem;
  border-top: 1px solid var(--color-grey-200);
  padding-top: 1.6rem;
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
    {open ? <><DrawerOpenScrollLock /><Overlay>
      <Drawer ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="operations-copilot-title" aria-describedby="operations-copilot-description" aria-busy={busy} onKeyDown={handleDrawerKeyDown}>
        <Header>
          <div><h2 id="operations-copilot-title">Operations Copilot</h2><p id="operations-copilot-description">Read-only operational answers with approval-gated notes.</p></div>
          <Close type="button" onClick={closeDrawer} aria-label="Close operations copilot">×</Close>
        </Header>
        <Form onSubmit={submit}>
          <label htmlFor="operations-copilot-question">Ask an operational question</label>
          <textarea ref={textareaRef} id="operations-copilot-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={2_000} placeholder="Draft an internal note for booking 123: Follow up on payment" disabled={busy} />
          <Button type="submit" disabled={busy || !input.trim()}>{busy ? "Thinking…" : "Ask Copilot"}</Button>
        </Form>
        <Content>
          {busy ? <p role="status">Loading operational data…</p> : null}
          {busy ? <Button type="button" $secondary onClick={() => activeRequest.current?.abort()}>Stop response</Button> : null}
          {error ? <p role="alert">{error}</p> : null}
          {!busy && !result && !error ? <p role="status">Ask an operational question to begin.</p> : null}
          {result ? <StructuredResults
            result={result}
            outputs={toolOutputs}
            receipt={receipt}
            approvalState={approvalState}
            onDecision={(action) => void decide(action)}
            onContinue={closeDrawer}
          /> : null}
          {!result ? <FallbackFooter>
            <Link to="/bookings" onClick={closeDrawer}>Continue with Bookings</Link>
            {receipt ? <ResponseFeedback key={receipt.traceId} receipt={receipt} /> : null}
          </FallbackFooter> : null}
        </Content>
      </Drawer>
    </Overlay></> : null}
  </>;
}
