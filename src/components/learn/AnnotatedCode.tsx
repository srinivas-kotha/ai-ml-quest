"use client";

import { useState, useCallback } from "react";
import type { CodeContent } from "@/types/content";

interface AnnotatedCodeProps extends CodeContent {
  accentColor?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Lightweight regex-based tokenizer
// Returns an array of { type, value } tokens for a single line of code.
// ────────────────────────────────────────────────────────────────────────────
type TokenType = "kw" | "str" | "cmt" | "num" | "fn" | "op" | "plain";
interface Token {
  type: TokenType;
  value: string;
}

const PYTHON_KW = new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);
const JS_KW = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "async",
  "await",
  "of",
  "from",
  "null",
  "undefined",
  "true",
  "false",
]);
const SQL_KW = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "ON",
  "AS",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "INDEX",
  "DROP",
  "ALTER",
  "ADD",
  "COLUMN",
  "DISTINCT",
  "ORDER",
  "BY",
  "GROUP",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "LIKE",
  "EXISTS",
  "BETWEEN",
  "UNION",
  "ALL",
  "WITH",
  "CTE",
]);
const BASH_KW = new Set([
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "for",
  "do",
  "done",
  "while",
  "until",
  "case",
  "esac",
  "function",
  "return",
  "export",
  "echo",
  "cd",
  "ls",
  "mkdir",
  "rm",
  "cp",
  "mv",
  "cat",
  "grep",
  "awk",
  "sed",
  "curl",
  "wget",
  "git",
  "docker",
  "npm",
  "pip",
  "python",
  "python3",
  "node",
  "bash",
  "sh",
]);

function tokenizeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  // Determine which keywords to use
  const kwSet =
    lang === "python"
      ? PYTHON_KW
      : lang === "sql"
        ? SQL_KW
        : lang === "bash"
          ? BASH_KW
          : JS_KW; // js, ts, json default

  while (remaining.length > 0) {
    // Single-line comments
    const cmtPrefixes =
      lang === "sql" ? ["--"] : lang === "bash" ? ["#"] : ["//", "#"];
    let matchedCmt = false;
    for (const prefix of cmtPrefixes) {
      if (remaining.startsWith(prefix)) {
        tokens.push({ type: "cmt", value: remaining });
        remaining = "";
        matchedCmt = true;
        break;
      }
    }
    if (matchedCmt) break;

    // String literals (", ', `)
    const strMatch = remaining.match(/^(["'`])((?:[^\\]|\\.)*?)\1/);
    if (strMatch) {
      tokens.push({ type: "str", value: strMatch[0] });
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (numMatch) {
      tokens.push({ type: "num", value: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Identifiers / keywords
    const wordMatch = remaining.match(/^[a-zA-Z_]\w*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const isKw =
        lang === "sql" ? kwSet.has(word.toUpperCase()) : kwSet.has(word);
      // Function call detection: word followed by (
      const isFn =
        !isKw &&
        remaining.length > word.length &&
        remaining[word.length] === "(";
      tokens.push({
        type: isKw ? "kw" : isFn ? "fn" : "plain",
        value: word,
      });
      remaining = remaining.slice(word.length);
      continue;
    }

    // Operators / punctuation
    const opMatch = remaining.match(/^[+\-*/%=<>!&|^~?:,;.()\[\]{}@]+/);
    if (opMatch) {
      tokens.push({ type: "op", value: opMatch[0] });
      remaining = remaining.slice(opMatch[0].length);
      continue;
    }

    // Whitespace
    const wsMatch = remaining.match(/^\s+/);
    if (wsMatch) {
      tokens.push({ type: "plain", value: wsMatch[0] });
      remaining = remaining.slice(wsMatch[0].length);
      continue;
    }

    // Fallback: consume one char
    tokens.push({ type: "plain", value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  kw: "#c792ea", // purple — keywords
  str: "#c3e88d", // green  — strings
  cmt: "#546e7a", // grey   — comments
  num: "#f78c6c", // orange — numbers
  fn: "#82aaff", // blue   — function calls
  op: "#89ddff", // cyan   — operators
  plain: "#e2e8f0", // white  — default
};

function renderLine(line: string, lang: string) {
  const tokens = tokenizeLine(line, lang);
  return tokens.map((tok, i) => (
    <span key={i} style={{ color: TOKEN_COLORS[tok.type] }}>
      {tok.value}
    </span>
  ));
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────
export default function AnnotatedCode({
  language,
  title,
  code,
  annotations = [],
  accentColor = "#3b82f6",
}: AnnotatedCodeProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const lines = code.split("\n");

  // Build a map: lineNumber (1-indexed) → annotation index list
  const lineToAnnotations: Record<number, number[]> = {};
  annotations.forEach((ann, idx) => {
    ann.lines.forEach((ln) => {
      if (!lineToAnnotations[ln]) lineToAnnotations[ln] = [];
      lineToAnnotations[ln].push(idx);
    });
  });

  // Lines highlighted by the active annotation
  const highlightedLines = new Set<number>(
    activeAnnotation !== null
      ? (annotations[activeAnnotation]?.lines ?? [])
      : [],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [code]);

  const handleAnnotationClick = (idx: number) => {
    setActiveAnnotation((prev) => (prev === idx ? null : idx));
  };

  const handlePrev = () => {
    setActiveAnnotation((prev) =>
      prev === null || prev === 0 ? annotations.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setActiveAnnotation((prev) =>
      prev === null || prev === annotations.length - 1 ? 0 : prev + 1,
    );
  };

  const accentRgb = accentColor.startsWith("#")
    ? hexToRgb(accentColor)
    : "59,130,246";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "var(--text-muted)",
            }}
          >
            {language}
          </span>
          {title && (
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {title}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
          style={{
            color: copied ? "#c3e88d" : "var(--text-muted)",
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code area */}
      <div
        className="overflow-x-auto"
        style={{ backgroundColor: "var(--code-bg)" }}
      >
        <table
          className="w-full border-collapse text-[0.8125rem] leading-6"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const annIdxs = lineToAnnotations[lineNum] ?? [];
              const isHighlighted = highlightedLines.has(lineNum);

              return (
                <tr
                  key={lineNum}
                  style={{
                    backgroundColor: isHighlighted
                      ? `rgba(${accentRgb}, 0.12)`
                      : "transparent",
                    transition: "background-color 150ms",
                  }}
                >
                  {/* Line number gutter */}
                  <td
                    className="select-none text-right pr-4 pl-4 w-8"
                    style={{
                      color: isHighlighted ? accentColor : "var(--text-muted)",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                      userSelect: "none",
                    }}
                  >
                    {lineNum}
                  </td>

                  {/* Annotation marker column */}
                  <td
                    className="w-6 px-1 text-center"
                    style={{ verticalAlign: "middle" }}
                  >
                    {annIdxs.map((idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnnotationClick(idx)}
                        className="inline-flex items-center justify-center rounded-full text-[10px] font-bold cursor-pointer transition-transform hover:scale-110"
                        style={{
                          width: 18,
                          height: 18,
                          backgroundColor:
                            activeAnnotation === idx
                              ? accentColor
                              : `rgba(${accentRgb}, 0.25)`,
                          color:
                            activeAnnotation === idx ? "#fff" : accentColor,
                          border: `1px solid ${accentColor}`,
                          lineHeight: 1,
                        }}
                        aria-label={`Annotation ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </td>

                  {/* Code content */}
                  <td className="py-0.5 pl-2 pr-6 whitespace-pre">
                    {line === "" ? "\u00A0" : renderLine(line, language)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Annotation explanation panel */}
      {activeAnnotation !== null && annotations[activeAnnotation] && (
        <div
          className="px-4 py-3 text-sm"
          style={{
            backgroundColor: `rgba(${accentRgb}, 0.08)`,
            borderTop: `1px solid rgba(${accentRgb}, 0.2)`,
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-start gap-2">
            <span
              className="inline-flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5"
              style={{
                width: 18,
                height: 18,
                backgroundColor: accentColor,
                color: "#fff",
              }}
            >
              {activeAnnotation + 1}
            </span>
            <p className="leading-relaxed">
              {annotations[activeAnnotation].text}
            </p>
          </div>
        </div>
      )}

      {/* Auto-walk controls */}
      {annotations.length > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {activeAnnotation !== null
              ? `Annotation ${activeAnnotation + 1} of ${annotations.length}`
              : `${annotations.length} annotations`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="text-xs px-2.5 py-1 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="Previous annotation"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              className="text-xs px-2.5 py-1 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="Next annotation"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
