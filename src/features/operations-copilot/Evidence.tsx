import styled from "styled-components";

const Details = styled.details`
  color: var(--color-grey-500);
  font-size: 1.2rem;
`;
const Code = styled.code`
  display: block;
  margin-top: 0.4rem;
  overflow-wrap: anywhere;
`;

export default function Evidence({ sourceIds }: { sourceIds: unknown }) {
  const values = Array.isArray(sourceIds) ? sourceIds.filter((value): value is string => typeof value === "string") : [];
  if (!values.length) return null;
  return <Details><summary>Evidence ({values.length})</summary><Code>{values.join(", ")}</Code></Details>;
}
