import styled from "styled-components";
import { cleanAiAnswer } from "./aiAnswerText";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ALLOWED_MARKDOWN_ELEMENTS = [
  "p",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "code",
  "pre",
  "br",
  "table", "thead", "tbody", "tr", "th", "td",
] as const;

const Answer = styled.div`
  min-width: 0;
  overflow-wrap: anywhere;

  & > :first-child {
    margin-top: 0;
  }

  & > :last-child {
    margin-bottom: 0;
  }

  ul,
  ol {
    padding-left: 2.2rem;
  }

  pre {
    max-width: 100%;
    overflow-x: auto;
    border-radius: var(--border-radius-sm);
    padding: 1rem;
    background: var(--color-grey-100);
  }

  code {
    overflow-wrap: anywhere;
  }
`;

const TableScroll = styled.div`
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  margin: 1rem 0;

  &:focus-visible { outline: 2px solid var(--color-brand-500); outline-offset: 2px; }
  table { border-collapse: collapse; width: 100%; font-size: 1.3rem; }
  th, td { text-align: left; vertical-align: top; padding: 0.8rem 1rem; white-space: nowrap; border-bottom: 1px solid var(--color-grey-200); }
  th { background: var(--color-grey-100); font-weight: 600; }
  tbody tr:last-child td { border-bottom: 0; }
`;

const Explanation = styled.details`
  min-width: 0;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: 1rem 1.2rem;

  summary {
    cursor: pointer;
    font-weight: 600;
  }

  &[open] summary {
    margin-bottom: 1rem;
  }
`;

function Markdown({ text }: { text: string }) {
  return (
    <Answer aria-label="Copilot answer">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          allowedElements={[...ALLOWED_MARKDOWN_ELEMENTS]}
          components={{
            h1: ({ children }) => <h3>{children}</h3>,
            h2: ({ children }) => <h4>{children}</h4>,
            table: ({ children }) => <TableScroll role="region" aria-label="Response table, scroll horizontally" tabIndex={0}><table>{children}</table></TableScroll>,
          }}
          skipHtml
          unwrapDisallowed
        >
          {cleanAiAnswer(text)}
        </ReactMarkdown>
    </Answer>
  );
}

export default function CopilotAnswer({
  text,
  hasStructuredResults,
  streaming = false,
  expanded = streaming,
}: {
  text: string;
  hasStructuredResults: boolean;
  streaming?: boolean;
  expanded?: boolean;
}) {
  const trimmed = text.trim();
  const content = trimmed
    ? <Markdown text={trimmed} />
    : streaming ? null : <p role="status">No AI explanation was provided.</p>;

  if (!hasStructuredResults) return content;

  return (
    <Explanation open={expanded}>
      <summary>AI explanation</summary>
      {content}
    </Explanation>
  );
}
