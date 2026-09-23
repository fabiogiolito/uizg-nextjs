"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

export type CopyButtonProps = Omit<ButtonProps, "onClick" | "icon" | "children" | "value"> & {
  /** Text to copy: a string, a promise of one, or a function returning either. */
  value: string | Promise<string> | (() => string | Promise<string>);
  /** Label while idle. Omit for an icon-only button. */
  children?: ReactNode;
  /** Label after copying. Defaults to "Copied". */
  copiedLabel?: ReactNode;
  /** How long the copied state shows, in ms. */
  resetAfter?: number;
  /** Where the copy/check icon goes. */
  iconPosition?: "leading" | "trailing" | "none";
  onCopied?: (text: string) => void;
};

/** A Button that copies text to the clipboard and briefly confirms it. */
export function CopyButton({ value, children, copiedLabel = "Copied", resetAfter = 2000, iconPosition = "leading", onCopied, "aria-label": ariaLabel, ...rest }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    const text = await (typeof value === "function" ? value() : value);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older or restricted contexts: fall back to a temporary textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    onCopied?.(text);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetAfter);
  };

  return (
    <Button
      {...rest}
      icon={iconPosition === "leading" ? (copied ? "check" : "copy") : undefined}
      trailingIcon={iconPosition === "trailing" ? (copied ? "check" : "copy") : undefined}
      color={copied ? "success" : rest.color}
      aria-label={children ? ariaLabel : copied ? "Copied" : (ariaLabel ?? "Copy")}
      aria-live="polite"
      onClick={copy}
    >
      {children ? (copied ? copiedLabel : children) : null}
    </Button>
  );
}
