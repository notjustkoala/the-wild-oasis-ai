import { render, screen } from "@testing-library/react";
import CopilotAnswer from "../src/features/operations-copilot/CopilotAnswer";

it("renders S2 without literal format markers, entities or invented footnotes", () => {
  render(<CopilotAnswer text={"**高优先级处理**&#x20;立即人工介入[^3]。\n\n[^3]: exception-handling-sop v1 — High-priority cases"} hasStructuredResults={false} />);
  expect(screen.getByText("高优先级处理").tagName).toBe("STRONG");
  expect(document.body.textContent).not.toMatch(/\[\^|&#|exception-handling/);
  expect(document.body.textContent).toContain("立即人工介入");
});
