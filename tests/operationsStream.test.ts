import { askOperationsCopilot, isOperationsToolOutput, type OperationsResponse } from "../src/services/apiOperationsCopilot";
import { readOperationsStream } from "../src/services/operationsStream";

vi.mock("../src/services/supabase", () => ({ default: { auth: { getSession: async () => ({ data: { session: { access_token: "fixture-token" } } }) } } }));

const output = { kind: "arrivals", arrivals: [], facts: [], sourceIds: [], truncated: false };
const encoder = new TextEncoder();
const sse = (...events: unknown[]) => events.map((event) => `data: ${JSON.stringify(event)}\r\n\r\n`).join("");
function fixture() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const cancel = vi.fn();
  const body = new ReadableStream<Uint8Array>({ start(value) { controller = value; }, cancel });
  const response = new Response(body, { headers: { "Content-Type": "text/event-stream", "X-AI-Trace-Id": "00000000-0000-4000-8000-000000000005", "X-AI-Feedback-Token": "fixture-receipt" } });
  return { response, cancel, write: (text: string) => controller.enqueue(encoder.encode(text)), close: () => controller.close(), controller };
}

describe("Operations UI message stream", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("requests SSE and delivers live tool progress, validated cards, and fragmented UTF-8 text before completion", async () => {
    const stream = fixture();
    const fetchMock = vi.fn().mockResolvedValue(stream.response);
    vi.stubGlobal("fetch", fetchMock);
    const updates: OperationsResponse[] = [];
    let settled = false;
    const answer = askOperationsCopilot("Show arrivals", undefined, (partial) => updates.push(partial));
    void answer.then(() => { settled = true; });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].headers.Accept).toBe("text/event-stream");
    stream.write(sse({ type: "start", messageId: "answer" }, { type: "start-step" }, { type: "tool-input-start", toolCallId: "a", toolName: "getArrivals" }));
    await vi.waitFor(() => expect(updates.at(-1)?.steps[0].toolCalls[0].status).toBe("running"));
    const first = updates.at(-1)!;
    stream.write(sse({ type: "tool-input-available", toolCallId: "a", toolName: "getArrivals", input: { private: "not retained" } }, { type: "tool-output-available", toolCallId: "a", output }, { type: "finish-step" }, { type: "start-step" }, { type: "text-start", id: "text" }));
    await vi.waitFor(() => expect(updates.at(-1)?.steps[0].toolResults[0].output).toEqual(output));
    expect(settled).toBe(false);
    expect(first.steps[0].toolCalls[0].status).toBe("running"); // immutable snapshots
    const bytes = encoder.encode(sse({ type: "text-delta", id: "text", delta: "已核查🙂" }));
    for (const byte of bytes) stream.controller.enqueue(Uint8Array.of(byte));
    await vi.waitFor(() => expect(updates.at(-1)?.text).toBe("已核查🙂"));
    expect(settled).toBe(false);
    stream.write(sse({ type: "text-end", id: "text" }, { type: "finish-step" }, { type: "finish", finishReason: "stop" }) + "data: [DONE]\r\n\r\n");
    const result = await answer;
    expect(result.receipt).toEqual({ traceId: "00000000-0000-4000-8000-000000000005", token: "fixture-receipt" });
    expect(result.steps.every((step) => step.status === "completed")).toBe(true);
    expect(result.steps[0].toolCalls[0].input).toEqual({});
    expect(stream.cancel).toHaveBeenCalled();
  });

  it("cancels a pending read and preserves completed results while marking unresolved tools interrupted", async () => {
    const stream = fixture();
    const abort = new AbortController();
    const update = vi.fn();
    const answer = readOperationsStream(stream.response, isOperationsToolOutput, update, abort.signal);
    const rejection = expect(answer).rejects.toMatchObject({ name: "AbortError" });
    stream.write(sse({ type: "start-step" }, { type: "tool-input-available", toolCallId: "a", toolName: "getArrivals", input: {} }, { type: "tool-output-available", toolCallId: "a", output }, { type: "tool-input-start", toolCallId: "b", toolName: "getBookingRisks" }));
    await vi.waitFor(() => expect(update.mock.lastCall?.[0].steps[0].toolCalls).toHaveLength(2));
    abort.abort();
    await rejection;
    expect(stream.cancel).toHaveBeenCalledOnce();
    const partial = update.mock.lastCall![0];
    expect(partial.steps[0].toolResults[0].output).toEqual(output);
    expect(partial.steps[0].toolCalls.map((call: { status: string }) => call.status)).toEqual(["completed", "interrupted"]);
  });

  it.each(["eof", "error", "abort"])("keeps text and does not report success on %s", async (failure) => {
    const stream = fixture();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(stream.response));
    const update = vi.fn();
    const answer = askOperationsCopilot("Show arrivals", undefined, update);
    const rejection = expect(answer).rejects.toThrow("Received results are kept");
    stream.write(sse({ type: "start-step" }, { type: "text-start", id: "text" }, { type: "text-delta", id: "text", delta: "Partial answer" }));
    await vi.waitFor(() => expect(update.mock.lastCall?.[0].text).toBe("Partial answer"));
    if (failure === "eof") stream.close();
    else stream.write(sse({ type: failure, errorText: "PRIVATE PROVIDER DETAIL" }));
    await rejection;
    expect(update.mock.lastCall![0].text).toBe("Partial answer");
    expect(update.mock.lastCall![0].steps[0].status).toBe("failed");
    expect(JSON.stringify(update.mock.calls)).not.toContain("PRIVATE PROVIDER DETAIL");
  });

  it.each([
    { kind: "arrivals", arrivals: [{ bookingId: -1 }], facts: [], sourceIds: [], truncated: false },
    { kind: "booking-risks", risks: [], facts: [], sourceIds: [], truncated: false },
    null,
  ])("rejects malformed or mismatched tool output before publishing a card", async (invalid) => {
    const stream = fixture();
    const update = vi.fn();
    const answer = readOperationsStream(stream.response, isOperationsToolOutput, update);
    const rejection = expect(answer).rejects.toThrow("Invalid tool output");
    stream.write(sse({ type: "start-step" }, { type: "tool-input-available", toolCallId: "a", toolName: "getArrivals", input: {} }, { type: "tool-output-available", toolCallId: "a", output: invalid }));
    await rejection;
    expect(update.mock.lastCall![0].steps[0].toolResults).toEqual([]);
  });

  it("keeps successful parallel tools completed when another tool fails", async () => {
    const stream = fixture();
    const answer = readOperationsStream(stream.response, isOperationsToolOutput);
    stream.write(sse({ type: "start-step" }, { type: "tool-input-available", toolCallId: "a", toolName: "getArrivals", input: {} }, { type: "tool-input-start", toolCallId: "b", toolName: "getBookingRisks" }, { type: "tool-output-available", toolCallId: "a", output }, { type: "tool-output-error", toolCallId: "b", errorText: "PRIVATE DETAIL" }, { type: "finish-step" }, { type: "finish" }) + "data: [DONE]\n\n");
    const result = await answer;
    expect(result.steps[0].toolCalls.map((call) => call.status)).toEqual(["completed", "failed"]);
    expect(result.steps[0].toolResults[1].error).toBe("Could not load this result.");
  });

  it.each([
    "data: [DONE]\n\n",
    sse({ type: "finish" }),
    sse({ type: "tool-input-start", toolCallId: "a", toolName: "untrustedTool" }),
    sse({ type: "text-delta", id: "missing", delta: "x" }),
    "data: {broken}\n\n",
    "data: " + "x".repeat(256_001) + "\n\n",
  ])("rejects incomplete, unknown or invalid framing", async (body) => {
    await expect(readOperationsStream(new Response(body), isOperationsToolOutput)).rejects.toThrow();
  });

  it("accepts SDK input validation failure without input-start and its subsequent output-error", async () => {
    const body = sse({ type: "start-step" }, { type: "tool-input-error", toolCallId: "bad", toolName: "getArrivals", input: "invalid", errorText: "PRIVATE DETAIL" }, { type: "tool-output-error", toolCallId: "bad", errorText: "PRIVATE DETAIL" }, { type: "finish-step" }, { type: "finish" }) + "data: [DONE]\n\n";
    const result = await readOperationsStream(new Response(body), isOperationsToolOutput);
    expect(result.steps[0].status).toBe("failed");
    expect(result.steps[0].toolResults).toEqual([{ toolName: "getArrivals", error: "Could not load this result." }]);
    expect(JSON.stringify(result)).not.toContain("PRIVATE DETAIL");
  });
});
