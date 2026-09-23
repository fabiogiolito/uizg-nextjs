"use client";

import { cx } from "./cx";
import { Badge } from "./Badge";
import { Collapsible } from "./Collapsible";
import { Icon } from "./Icon";
import { Shimmer } from "./Shimmer";
import { Spinner } from "./Spinner";

export type TaskStatus = "done" | "active" | "pending";
export type Task = { id: string; label: string; status: TaskStatus };

export type TaskListProps = {
  /** What the whole task is about, e.g. "Launch the marketing site". */
  title: string;
  /** The breakdown. Empty while still being planned. */
  tasks: Task[];
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/** Small circular status icons. Drawn inline because they need fills and dashes the stroke icons lack. */
function StatusIcon({ status, progress }: { status: TaskStatus | "summary"; progress?: number }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (status === "summary") {
    if (progress === 1) {
      return (
        <svg className="icon task-list__icon task-list__icon--done" {...common}>
          <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
          <path d="m8 12.5 2.5 2.5L16 9.5" stroke="var(--color-bg)" />
        </svg>
      );
    }
    // Progress ring: dashed track with a solid arc for the finished share.
    const r = 9;
    const c = 2 * Math.PI * r;
    return (
      <svg className="icon task-list__icon task-list__icon--progress" {...common}>
        <circle cx="12" cy="12" r={r} strokeDasharray="2 2.5" opacity="0.5" />
        <circle cx="12" cy="12" r={r} strokeDasharray={`${c * (progress ?? 0)} ${c}`} transform="rotate(-90 12 12)" />
      </svg>
    );
  }
  if (status === "done") {
    return (
      <svg className="icon task-list__icon task-list__icon--done-item" {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12.5 2.5 2.5L16 9.5" />
      </svg>
    );
  }
  if (status === "active") {
    return (
      <svg className="icon task-list__icon task-list__icon--active" {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8M12 8l4 4-4 4" />
      </svg>
    );
  }
  return (
    <svg className="icon task-list__icon task-list__icon--pending" {...common}>
      <circle cx="12" cy="12" r="10" strokeDasharray="2.5 3" />
    </svg>
  );
}

/** Collapsed task summary that expands to the full checklist. Hovering the header swaps the status for a chevron. */
export function TaskList({ title, tasks, defaultOpen = false, open, onOpenChange, className }: TaskListProps) {
  const planning = tasks.length === 0;
  const done = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? done / tasks.length : 0;
  const inProgress = planning || tasks.some((t) => t.status === "active");
  return (
    <Collapsible
      className={cx("task-list", planning && "task-list--planning", progress === 1 && "task-list--complete", className)}
      defaultOpen={defaultOpen}
      open={planning ? false : open}
      onOpenChange={onOpenChange}
      trigger={({ open: isOpen, triggerProps }) => (
        <button type="button" className="task-list__header" {...triggerProps} disabled={planning} aria-disabled={planning || undefined}>
          <span className="task-list__status">
            {planning ? <Spinner label="Planning" className="task-list__icon" /> : <StatusIcon status="summary" progress={progress} />}
            <Icon name="chevronDown" className={cx("task-list__chevron", isOpen && "task-list__chevron--open")} />
          </span>
          <Shimmer active={inProgress} className="task-list__title">{title}</Shimmer>
          {/* Progress counts read "n of m" in a default badge, the same as Questionnaire. */}
          <Badge className="task-list__count">
            {done} of {tasks.length}
          </Badge>
        </button>
      )}
    >
      <ul className="task-list__items">
        {tasks.map((t) => (
          <li key={t.id} className={cx("task-list__item", `task-list__item--${t.status}`)}>
            <StatusIcon status={t.status} />
            <Shimmer active={t.status === "active"} className="task-list__label">{t.label}</Shimmer>
          </li>
        ))}
      </ul>
    </Collapsible>
  );
}
