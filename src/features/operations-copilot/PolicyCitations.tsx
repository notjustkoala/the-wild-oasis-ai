import styled from "styled-components";

import type { OperationsPolicySearchOutput } from "../../services/apiOperationsCopilot";

const Sources = styled.section`
  display: grid;
  gap: 0.8rem;
`;

const Citation = styled.details`
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;
  background: var(--color-grey-50);

  summary {
    cursor: pointer;
    border-radius: var(--border-radius-tiny);
    font-weight: 600;
  }

  summary:focus-visible {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 3px;
  }

  p {
    margin-top: 0.8rem;
    border-top: 1px solid var(--color-grey-200);
    padding-top: 0.8rem;
  }
`;

const Label = styled.span<{ $staff: boolean }>`
  display: inline-block;
  margin-right: 0.8rem;
  border-radius: 100px;
  padding: 0.2rem 0.7rem;
  color: ${({ $staff }) => $staff ? "var(--color-red-700)" : "var(--color-brand-700)"};
  background: ${({ $staff }) => $staff ? "var(--color-red-100)" : "var(--color-brand-100)"};
  font-size: 1.1rem;
  text-transform: uppercase;
`;

export default function PolicyCitations({ output }: { output: OperationsPolicySearchOutput }) {
  if (output.status === "insufficient-evidence") {
    return <p role="status">No reliable authorized policy source was found.</p>;
  }

  return (
    <Sources aria-label="Policy and SOP sources">
      <h3>Policy sources</h3>
      {output.citations.map((citation) => (
        <Citation key={`${citation.documentId}-${citation.version}-${citation.section}`}>
          <summary tabIndex={0}>
            <Label $staff={citation.scope === "staff"}>
              {citation.scope === "staff" ? "Staff SOP" : "Public policy"}
            </Label>
            {citation.title} · {citation.section}
            <small> · Version {citation.version} · Effective {citation.effectiveDate}</small>
          </summary>
          <p>{citation.excerpt}</p>
        </Citation>
      ))}
    </Sources>
  );
}
