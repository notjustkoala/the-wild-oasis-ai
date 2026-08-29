import styled from "styled-components";

const Warning = styled.p`
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-yellow-700);
  border-radius: var(--border-radius-sm);
  background: var(--color-yellow-100);
  color: var(--color-yellow-700);
`;

export default function PartialResultWarning({ truncated }: { truncated: boolean }) {
  if (!truncated) return null;

  return (
    <Warning role="status">
      Partial result: this view reached the server row limit. Totals and lists may be incomplete.
    </Warning>
  );
}
