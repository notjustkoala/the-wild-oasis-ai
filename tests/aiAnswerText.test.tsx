import { render, screen } from "@testing-library/react";
import CopilotAnswer from "../src/features/operations-copilot/CopilotAnswer";
import { cleanAiAnswer } from "../src/features/operations-copilot/aiAnswerText";
import { within } from "@testing-library/react";

it("renders booking Markdown as an accessible table rather than raw pipe text", () => {
  const text = "共 2 笔到店预订：\n\n| 预订编号 | 房型 | 是否已付款 | 风险标签 |\n| --- | --- | --- | --- |\n| 518 | 008 | 否 | - |\n| 699 | 003 | 否 | food-allergy |\n\n预订 699 需要特别关注。";
  render(<CopilotAnswer text={text} hasStructuredResults={false} />);
  const table = screen.getByRole("table");
  expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
  expect(within(table).getAllByRole("row")).toHaveLength(3);
  expect(within(table).getByRole("cell", { name: "food-allergy" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Response table, scroll horizontally" })).toHaveAttribute("tabindex", "0");
  expect(document.body.textContent).not.toContain("| --- |");
});

it("does not enable links, images or HTML while parsing GFM table cells", () => {
  const { container } = render(<CopilotAnswer text={"| 内容 |\n| --- |\n| [link](javascript:alert(1)) ![image](https://example.invalid/pixel) <script>alert(1)</script> |"} hasStructuredResults={false} />);
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(container.querySelector("a,img,script,iframe,input")).toBeNull();
});

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
