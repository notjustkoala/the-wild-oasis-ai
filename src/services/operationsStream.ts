import type { OperationsReceipt, OperationsResponse, OperationsStep, OperationsToolOutput } from "./apiOperationsCopilot";
import { publicOperationsStreamFailure } from "./operationsStreamError";

// AI SDK UI message SSE protocol. Never render provider input fragments or
// unvalidated tool outputs, and never treat an unexpected EOF as success.
const TOOL_KINDS: Record<string, OperationsToolOutput["kind"]> = {
  getArrivals: "arrivals", getBookingMetrics: "booking-metrics",
  getCabinPerformance: "cabin-performance", getBookingRisks: "booking-risks",
  getBookingDetails: "booking-details", addBookingInternalNote: "internal-note-approval",
  searchHotelPolicies: "policy-search",
};
const MAX_BYTES = 2_000_000;
const MAX_FRAME = 256_000;

export async function readOperationsStream(
  response: Response,
  validate: (value: unknown) => value is OperationsToolOutput,
  onUpdate?: (result: OperationsResponse) => void,
  signal?: AbortSignal,
  receipt?: OperationsReceipt,
): Promise<OperationsResponse> {
  if (!response.body) throw new Error("Missing stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const result: OperationsResponse = { text: "", steps: [], ...(receipt ? { receipt } : {}) };
  const calls = new Map<string, { step: OperationsStep; call: OperationsStep["toolCalls"][number] }>();
  const textIds = new Set<string>();
  let step: OperationsStep | undefined;
  let buffer = "";
  let bytes = 0;
  let finished = false;
  let done = false;
  const snapshot = () => ({ ...result, steps: result.steps.map((item) => ({ ...item,
    toolCalls: item.toolCalls.map((call) => ({ ...call })),
    toolResults: item.toolResults.map((output) => ({ ...output })),
  })) });
  const publish = () => { if (!signal?.aborted) onUpdate?.(snapshot()); };
  const currentStep = () => {
    if (!step) {
      step = { stepNumber: result.steps.length, text: "", status: "running", toolCalls: [], toolResults: [] };
      result.steps.push(step);
    }
    return step;
  };
  const interrupt = (status: "interrupted" | "failed") => {
    result.steps.forEach((item) => {
      if (item.status === "running") item.status = status;
      item.toolCalls.forEach((call) => { if (call.status === "running") call.status = status; });
    });
    // Publish the terminal state even after user cancellation; the caller guards
    // request identity so that an old request cannot overwrite a new response.
    onUpdate?.(snapshot());
  };
  function frame(raw: string) {
    const data = raw.split(/\r?\n/).filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, "")).join("\n");
    if (!data) return;
    if (data === "[DONE]") {
      if (!finished) throw new Error("Incomplete stream.");
      done = true;
      return;
    }
    if (finished) throw new Error("Unexpected stream data.");
    const event: Record<string, unknown> = JSON.parse(data);
    if (!event || typeof event !== "object" || typeof event.type !== "string") throw new Error("Invalid event.");
    const id = event.toolCallId;
    switch (event.type) {
      case "start-step":
        if (step) throw new Error("Overlapping steps.");
        currentStep(); break;
      case "text-start":
        if (typeof event.id !== "string" || textIds.has(event.id)) throw new Error("Invalid text.");
        textIds.add(event.id); break;
      case "text-delta":
        if (typeof event.id !== "string" || !textIds.has(event.id) || typeof event.delta !== "string") throw new Error("Invalid text.");
        result.text += event.delta; currentStep().text += event.delta; break;
      case "text-end":
        if (typeof event.id !== "string" || !textIds.delete(event.id)) throw new Error("Invalid text.");
        break;
      case "tool-input-start":
      case "tool-input-available": {
        if (typeof id !== "string" || typeof event.toolName !== "string" || !Object.prototype.hasOwnProperty.call(TOOL_KINDS, event.toolName)) throw new Error("Unknown tool.");
        let entry = calls.get(id);
        if (!entry) {
          const item = currentStep();
          const call: OperationsStep["toolCalls"][number] = { toolName: event.toolName, input: {}, status: "running" };
          item.toolCalls.push(call); entry = { step: item, call }; calls.set(id, entry);
        }
        if (entry.call.toolName !== event.toolName || entry.step !== step || entry.call.status !== "running") throw new Error("Invalid tool call.");
        // Inputs aren't needed to render activity. Keep them out of UI state.
        break;
      }
      case "tool-output-available": {
        const entry = typeof id === "string" ? calls.get(id) : undefined;
        if (!entry || entry.call.status !== "running" || !validate(event.output) || event.output.kind !== TOOL_KINDS[entry.call.toolName]) throw new Error("Invalid tool output.");
        entry.call.status = "completed";
        entry.step.toolResults.push({ toolName: entry.call.toolName, output: event.output }); break;
      }
      case "tool-input-error":
      case "tool-output-error":
      case "tool-output-denied": {
        let entry = typeof id === "string" ? calls.get(id) : undefined;
        // A complete invalid tool call can arrive without input-start. The SDK
        // may subsequently send output-error for the same failed call.
        if (!entry && event.type === "tool-input-error" && typeof id === "string" && typeof event.toolName === "string" && Object.prototype.hasOwnProperty.call(TOOL_KINDS, event.toolName)) {
          const item = currentStep();
          const call: OperationsStep["toolCalls"][number] = { toolName: event.toolName, input: {}, status: "running" };
          item.toolCalls.push(call); entry = { step: item, call }; calls.set(id, entry);
        }
        if (entry?.call.status === "failed" && event.type === "tool-output-error") break;
        if (!entry || entry.call.status !== "running") throw new Error("Invalid tool error.");
        entry.call.status = "failed"; entry.step.status = "failed";
        entry.step.toolResults.push({ toolName: entry.call.toolName, error: "Could not load this result." }); break;
      }
      case "finish-step":
        if (!step || step.toolCalls.some((call) => call.status === "running") || textIds.size) throw new Error("Incomplete step.");
        if (step.status === "running") step.status = "completed";
        step = undefined; break;
      case "finish":
        if (step || textIds.size || [...calls.values()].some((entry) => entry.call.status === "running") || event.finishReason === "error") throw new Error("Incomplete response.");
        finished = true; break;
      case "error":
        throw publicOperationsStreamFailure(event.errorText, receipt?.traceId) ?? new Error("Interrupted response.");
      case "abort": throw new Error("Interrupted response.");
      // SDK start/metadata, reasoning, sources and input deltas don't contain
      // business results. Ignore these instead of showing raw provider data.
    }
    publish();
  }
  const abort = () => { void reader.cancel().catch(() => undefined); };
  signal?.addEventListener("abort", abort, { once: true });
  try {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    publish();
    while (!done) {
      const chunk = await reader.read();
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BYTES) throw new Error("Stream too large.");
      buffer += decoder.decode(chunk.value, { stream: true });
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        if (match.index > MAX_FRAME) throw new Error("Frame too large.");
        const raw = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        frame(raw);
        if (done) break;
      }
      if (buffer.length > MAX_FRAME) throw new Error("Frame too large.");
    }
    decoder.decode();
    if (!done) throw new Error("Incomplete response.");
    return snapshot();
  } catch (error) {
    interrupt(signal?.aborted ? "interrupted" : "failed");
    throw error;
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
