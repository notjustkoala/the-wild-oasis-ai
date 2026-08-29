import styled from "styled-components";
import type { OperationsStep } from "../../services/apiOperationsCopilot";

const Timeline = styled.ol`
  display: grid;
  gap: 0.6rem;
  padding-left: 1.8rem;
`;
const Step = styled.li`
  color: var(--color-grey-600);
  font-size: 1.3rem;
`;

export default function ToolTimeline({ steps }: { steps: OperationsStep[] }) {
  const calls = steps.flatMap((step) => step.toolCalls.map((call) => ({ name: call.toolName, status: step.status })));
  if (!calls.length) return null;
  return <Timeline aria-label="Tool execution timeline">{calls.map((call, index) => <Step key={`${call.name}-${index}`}>{call.name} {call.status}</Step>)}</Timeline>;
}
