import { useState } from "react";
import { sendOperationsFeedback, type OperationsReceipt } from "../../services/apiOperationsCopilot";
export default function ResponseFeedback({ receipt }: { receipt: OperationsReceipt }) {
  const [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  async function rate(rating: "helpful" | "not-helpful") {
    setBusy(true); setMessage("");
    try { await sendOperationsFeedback(receipt, rating); setMessage("Feedback saved."); }
    catch { setMessage("Feedback could not be saved. Please try again."); }
    finally { setBusy(false); }
  }
  return <section><small>Reference: <code>{receipt.traceId}</code></small>{receipt.token ? <div><button type="button" disabled={busy} onClick={() => void rate("helpful")}>Helpful</button>{" · "}<button type="button" disabled={busy} onClick={() => void rate("not-helpful")}>Not helpful</button></div> : null}{message ? <p role="status">{message}</p> : null}</section>;
}
