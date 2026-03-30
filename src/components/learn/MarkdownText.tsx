import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

// Preprocesses markdown content, converting [[term:X]] syntax into
// a placeholder that react-markdown won't mangle, then post-processes
// the rendered text nodes to swap in GlossaryTooltip elements.
// Simpler approach: replace [[term:X]] with a custom HTML tag before
// passing to ReactMarkdown, then handle it as a custom component.
const GLOSSARY_TAG_RE = /\[\[term:([^\]]+)\]\]/g;

function preprocessGlossary(content: string): string {
  return content.replace(
    GLOSSARY_TAG_RE,
    (_, termKey) => `<glossary term="${termKey}">${termKey}</glossary>`,
  );
}

const components: Components & Record<string, React.ComponentType<any>> = {
  // Custom element produced by preprocessGlossary() for [[term:X]] syntax
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  glossary: ({ node, ...props }: any) => {
    const term = node?.properties?.term as string | undefined;
    const children = props.children as React.ReactNode;
    if (!term) return <>{children}</>;
    return <GlossaryTooltip term={term}>{children}</GlossaryTooltip>;
  },
  // Headings
  h1: ({ children }) => (
    <h1
      className="text-2xl font-bold mt-6 mb-3"
      style={{ color: "var(--text-primary)", letterSpacing: "-0.025em" }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="text-xl font-semibold mt-5 mb-2"
      style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="text-base font-semibold mt-4 mb-2"
      style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h3>
  ),

  // Paragraph
  p: ({ children }) => (
    <p
      className="mb-4 leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </p>
  ),

  // Strong / emphasis
  strong: ({ children }) => (
    <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
      {children}
    </em>
  ),

  // Inline code
  code: ({ children, className }) => {
    // Block code is handled by <pre> — this is inline only
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code
          className="block overflow-x-auto text-[0.8125rem] leading-relaxed p-4 rounded-lg"
          style={{
            backgroundColor: "var(--code-bg)",
            color: "#e2e8f0",
            fontFamily: "var(--font-mono), monospace",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="text-[0.875rem] px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: "var(--code-bg)",
          color: "#a5b4fc",
          fontFamily: "var(--font-mono), monospace",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </code>
    );
  },

  // Pre (code block wrapper)
  pre: ({ children }) => (
    <pre
      className="my-4 rounded-xl overflow-x-auto"
      style={{
        backgroundColor: "var(--code-bg)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "var(--font-mono), monospace",
        fontSize: "0.8125rem",
        lineHeight: "1.75",
        padding: "1rem",
      }}
    >
      {children}
    </pre>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote
      className="my-4 pl-4 py-1"
      style={{
        borderLeft: "3px solid rgba(255,255,255,0.15)",
        color: "var(--text-muted)",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  ),

  // Lists
  ul: ({ children }) => (
    <ul
      className="mb-4 pl-5 space-y-1.5"
      style={{ color: "var(--text-secondary)", listStyleType: "disc" }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="mb-4 pl-5 space-y-1.5"
      style={{ color: "var(--text-secondary)", listStyleType: "decimal" }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
      {children}
    </li>
  ),

  // Horizontal rule
  hr: () => (
    <hr
      className="my-6"
      style={{ borderColor: "rgba(255,255,255,0.08)", borderTopWidth: 1 }}
    />
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      style={{ color: "var(--rag)", textDecoration: "underline" }}
    >
      {children}
    </a>
  ),

  // Table
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table
        className="w-full text-sm border-collapse"
        style={{ borderColor: "var(--border)" }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th
      className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      className="py-2 px-3"
      style={{
        color: "var(--text-secondary)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </td>
  ),
};

export default function MarkdownText({
  content,
  className,
}: MarkdownTextProps) {
  const processed = preprocessGlossary(content);
  return (
    <div className={className}>
      <ReactMarkdown
        components={components}
        // Allow our custom <glossary> HTML elements through
        allowedElements={undefined}
        unwrapDisallowed={false}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
