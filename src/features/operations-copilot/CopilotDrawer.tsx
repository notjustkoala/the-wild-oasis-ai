import { useEffect, useRef, useState } from "react";
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
  grid-template-rows: auto minmax(0, 1fr) auto;
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
  padding: 1.6rem 2.4rem;
  border-top: 1px solid var(--color-grey-200);

  textarea { min-height: 8rem; resize: none; max-height: 16rem; border: 1px solid var(--color-grey-300); border-radius: var(--border-radius-sm); padding: 1rem; background: var(--color-grey-0); }

  @media (max-width: 40rem) {
    padding: 1.2rem 1.6rem;
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

type ConversationTurn = {
  id: string; question: string; result: OperationsResponse | null; receipt: OperationsReceipt | null;
  error: string | null; cancelled: boolean; hasStreamed: boolean; approvalState: string | null;
};
const Question = styled.div`
  margin-left: 2.4rem; padding: 1.2rem 1.6rem; border: 1px solid var(--color-brand-500);
  border-radius: 1.2rem; background: var(--color-grey-100); white-space: pre-wrap; overflow-wrap: anywhere;
`;
const Turn = styled.section`
  display: grid; min-width: 0; gap: 1.2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--color-grey-200);
`;

export default function CopilotDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [showLatest, setShowLatest] = useState(false);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const activeTurnId = useRef<string | null>(null);
  const decisionPending = decisionId !== null;
  const launcherRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const restoreLauncherFocus = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);

  function updateTurn(id: string, changes: Partial<ConversationTurn> | ((turn: ConversationTurn) => ConversationTurn)) {
    setTurns(previous => previous.map(turn => turn.id !== id ? turn : typeof changes === "function" ? changes(turn) : { ...turn, ...changes }));
  }
  useEffect(() => () => { activeRequest.current?.abort(); activeRequest.current = null; }, []);
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (followLatest.current) content.scrollTop = content.scrollHeight;
    else setShowLatest(content.scrollHeight - content.scrollTop - content.clientHeight > 80);
  }, [turns, busy, open]);
  useEffect(() => {
    if (open) {
      restoreLauncherFocus.current = true;
      if (textareaRef.current?.disabled) drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      else textareaRef.current?.focus();
      return;
    }
    if (restoreLauncherFocus.current) { restoreLauncherFocus.current = false; launcherRef.current?.focus(); }
  }, [open]);

  function stopResponse() {
    const controller = activeRequest.current, id = activeTurnId.current;
    if (!controller || !id) return;
    controller.abort(); activeRequest.current = null; activeTurnId.current = null; setBusy(false);
    updateTurn(id, turn => ({ ...turn, cancelled: true, result: turn.result ? { ...turn.result,
      steps: turn.result.steps.map(step => ({ ...step, status: step.status === "running" ? "interrupted" : step.status,
        toolCalls: step.toolCalls.map(call => ({ ...call, status: call.status === "running" ? "interrupted" : call.status })) })) } : null }));
  }
  function closeDrawer() { setOpen(false); }
  function handleDrawerKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); closeDrawer(); return; }
    if (event.key !== "Tab" || !drawerRef.current) return;
    const focusable = getFocusableElements(drawerRef.current);
    if (!focusable.length) { event.preventDefault(); return; }
    const index = focusable.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && index <= 0 || !event.shiftKey && (index === -1 || index === focusable.length - 1)) {
      event.preventDefault(); (event.shiftKey ? focusable.at(-1) : focusable[0])?.focus();
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy || decisionPending) return;
    const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `turn-${Date.now()}-${Math.random()}`;
    const history = turns.map(turn => turn.question);
    const controller = new AbortController();
    activeRequest.current = controller; activeTurnId.current = id;
    setTurns(previous => [...previous, { id, question, result: null, receipt: null, error: null, cancelled: false, hasStreamed: false, approvalState: null }]);
    setInput(""); setBusy(true); followLatest.current = true; setShowLatest(false);
    try {
      const answer = await askOperationsCopilot(question, controller.signal, partial => {
        if (activeRequest.current !== controller) return;
        updateTurn(id, turn => ({ ...turn, hasStreamed: true, result: partial, receipt: partial.receipt ?? turn.receipt }));
      }, history);
      if (activeRequest.current !== controller) return;
      updateTurn(id, turn => ({ ...turn, result: answer, receipt: answer.receipt ?? turn.receipt }));
    } catch (requestError) {
      if (activeRequest.current !== controller || controller.signal.aborted) return;
      const message = requestError instanceof Error ? requestError.message : "The operations copilot is unavailable.";
      updateTurn(id, turn => ({ ...turn, error: message, receipt: requestError instanceof OperationsRequestError ? requestError.receipt ?? turn.receipt : turn.receipt }));
      toast.error(message);
    } finally {
      if (activeRequest.current === controller) { activeRequest.current = null; activeTurnId.current = null; setBusy(false); }
    }
  }
  async function decide(id: string, action: "approve" | "reject") {
    const turn = turns.find(item => item.id === id);
    const proposal = outputs(turn?.result ?? null).find(output => output.kind === "internal-note-approval");
    if (!turn || !proposal || turn.approvalState || busy || decisionPending) return;
    setDecisionId(id); updateTurn(id, { approvalState: action === "approve" ? "approving" : "rejecting" });
    try {
      const response = await decideOperationsApproval(proposal.approvalId, action);
      updateTurn(id, { approvalState: response.status });
      toast.success(action === "approve" ? "Internal note added." : "Draft rejected; no booking field changed.");
    } catch (error) {
      updateTurn(id, { approvalState: null }); toast.error(error instanceof Error ? error.message : "Approval decision failed.");
    } finally { setDecisionId(null); }
  }
  return <>
    <Launcher ref={launcherRef} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>✦ Operations Copilot</Launcher>
    {open ? <><DrawerOpenScrollLock /><Overlay><Drawer ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="operations-copilot-title" aria-describedby="operations-copilot-description" aria-busy={busy || decisionPending} onKeyDown={handleDrawerKeyDown}>
      <Header><div><h2 id="operations-copilot-title">Operations Copilot</h2><p id="operations-copilot-description">Read-only operational answers with approval-gated notes.</p></div><Close type="button" onClick={closeDrawer} aria-label="Close operations copilot">×</Close></Header>
      <Content ref={contentRef} aria-label="Operations response" aria-live="polite" aria-busy={busy} onScroll={() => {
        const content = contentRef.current; if (!content) return;
        followLatest.current = content.scrollHeight - content.scrollTop - content.clientHeight <= 80;
        if (followLatest.current) setShowLatest(false);
      }}>
        {!turns.length ? <><p role="status">Ask an operational question to begin.</p><FallbackFooter><Link to="/bookings" onClick={closeDrawer}>Continue with Bookings</Link></FallbackFooter></> : null}
        {turns.map(turn => {
          const streaming = busy && activeTurnId.current === turn.id;
          return <Turn key={turn.id} aria-label="Conversation turn">
            <Question><strong>You</strong><p>{turn.question}</p></Question>
            <strong>Copilot</strong>
            {streaming ? <p role="status">{turn.result?.text ? "Writing response…" : "Loading operational data…"}</p> : null}
            {turn.cancelled ? <p role="status">Response stopped. Received results are kept and may be incomplete.</p> : null}
            {turn.error ? <p role="alert">{turn.error}</p> : null}
            {turn.result ? <StructuredResults result={turn.result} outputs={outputs(turn.result)} receipt={turn.receipt}
              approvalState={turn.approvalState} onDecision={action => void decide(turn.id, action)} onContinue={closeDrawer}
              streaming={streaming} expandExplanation={turn.hasStreamed} inlineExplanation decisionsDisabled={busy || decisionPending} />
              : !streaming ? <FallbackFooter><Link to="/bookings" onClick={closeDrawer}>Continue with Bookings</Link>{turn.receipt ? <ResponseFeedback receipt={turn.receipt} /> : null}</FallbackFooter> : null}
          </Turn>;
        })}
      </Content>
      <Form onSubmit={submit}>
        {showLatest ? <Button type="button" $secondary onClick={() => { followLatest.current = true; setShowLatest(false); if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }}>Jump to latest</Button> : null}
        <label htmlFor="operations-copilot-question">Ask an operational question</label>
        <textarea ref={textareaRef} id="operations-copilot-question" value={input} onChange={event => setInput(event.target.value)}
          onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
          maxLength={2000} placeholder="Ask about bookings, hotel policies, or draft an internal note…" disabled={busy || decisionPending} />
        <Button type="submit" disabled={busy || decisionPending || !input.trim()}>{decisionPending ? "Recording decision…" : busy ? "Thinking…" : "Ask Copilot"}</Button>
        {busy ? <Button type="button" $secondary onClick={stopResponse}>Stop response</Button> : null}
        <small>Enter to send · Shift+Enter for a new line</small>
      </Form>
    </Drawer></Overlay></> : null}
  </>;
}
