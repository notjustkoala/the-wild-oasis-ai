import { render, screen } from "@testing-library/react";
import CopilotAnswer from "../src/features/operations-copilot/CopilotAnswer";
import { cleanAiAnswer } from "../src/features/operations-copilot/aiAnswerText";

it("removes only known duplicate bilingual policy labels in Chinese answers", () => {
  const text = cleanAiAnswer("根据《例外处理标准作业程序》（Exception handling SOP），标记为高优先级（High priority）。小屋（Cabin 002）仍需人工确认。");
  expect(text).toBe("根据《例外处理标准作业程序》，标记为高优先级。小屋（Cabin 002）仍需人工确认。");
  expect(cleanAiAnswer("Follow the Exception handling SOP. High priority cases need immediate handling."))
    .toBe("Follow the Exception handling SOP. High priority cases need immediate handling.");
});

it("renders S2 without literal format markers, entities or invented footnotes", () => {
  render(<CopilotAnswer text={"**高优先级处理**&#x20;立即人工介入[^3]。\n\n[^3]: exception-handling-sop v1 — High-priority cases"} hasStructuredResults={false} />);
  expect(screen.getByText("高优先级处理").tagName).toBe("STRONG");
  expect(document.body.textContent).not.toMatch(/\[\^|&#|exception-handling/);
  expect(document.body.textContent).toContain("立即人工介入");
});
