"use client";

import { cx } from "./cx";
import { CopyButton } from "./CopyButton";

export type CodeBlockProps = {
  code: string;
  language?: "tsx" | "html" | "css" | "bash";
  className?: string;
};

/** Monospace code with a copy button and light, single-pass highlighting. */
export function CodeBlock({ code, language = "tsx", className }: CodeBlockProps) {
  return (
    <div className={cx("code-block", className)}>
      <pre className="code-block__pre">
        <code className={`code-block__code code-block__code--${language}`} dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
      </pre>
      <CopyButton value={code} size="sm" variant="ghost" aria-label="Copy code" className="code-block__copy" />
    </div>
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (cls: string, text: string) => `<span class="${cls}">${esc(text)}</span>`;

/** One regex pass: each match is wrapped once, so inserted markup is never re-scanned. */
function highlight(code: string, language: string): string {
  if (language === "bash") return esc(code);
  if (language === "css") {
    const re = /(\/\*[\s\S]*?\*\/)|(--[\w-]+)|(^|[\s,}])([.#:][\w:().-]+(?:[\s>+~,]+[.#:]?[\w:().-]+)*)(?=\s*[,{])|("[^"]*")/gm;
    return replaceAll(code, re, (m) => {
      if (m[1]) return wrap("tok-comment", m[1]);
      if (m[2]) return wrap("tok-attr", m[2]);
      if (m[4]) return esc(m[3]) + wrap("tok-tag", m[4]);
      if (m[5]) return wrap("tok-string", m[5]);
      return esc(m[0]);
    });
  }
  // tsx and html: comments, tags, attribute names, strings, braces
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|\{\/\*[\s\S]*?\*\/\})|(<\/?)([\w.-]+)|(\s)([\w-]+)(?==)|("[^"]*"|'[^']*'|`[^`]*`)|(\{[^{}]*\})/g;
  return replaceAll(code, re, (m) => {
    if (m[1]) return wrap("tok-comment", m[1]);
    if (m[3]) return esc(m[2]) + wrap("tok-tag", m[3]);
    if (m[5]) return esc(m[4]) + wrap("tok-attr", m[5]);
    if (m[6]) return wrap("tok-string", m[6]);
    if (m[7]) return wrap("tok-brace", m[7]);
    return esc(m[0]);
  });
}

function replaceAll(src: string, re: RegExp, fn: (m: RegExpExecArray) => string): string {
  let out = "";
  let last = 0;
  for (const m of src.matchAll(re)) {
    out += esc(src.slice(last, m.index)) + fn(m as RegExpExecArray);
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}
