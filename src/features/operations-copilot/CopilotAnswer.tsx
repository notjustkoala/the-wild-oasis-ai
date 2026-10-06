import styled from "styled-components";
import { cleanAiAnswer } from "./aiAnswerText";

import ReactMarkdown from "react-markdown";

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
          allowedElements={[...ALLOWED_MARKDOWN_ELEMENTS]}
          components={{
            h1: ({ children }) => <h3>{children}</h3>,
            h2: ({ children }) => <h4>{children}</h4>,
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
