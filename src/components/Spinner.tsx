import { cx } from "./cx";

export type SpinnerProps = { size?: "sm" | "md" | "lg"; label?: string; className?: string };

/** Rotating arc, sized like an icon by default. */
export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <svg
      className={cx("spinner", size !== "md" && `spinner--${size}`, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      role="status"
      aria-label={label}
    >
      <circle cx="12" cy="12" r="9" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
