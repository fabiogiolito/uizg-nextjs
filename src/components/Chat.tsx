"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Attachment, type AttachmentData } from "./Attachment";
import { Button } from "./Button";
import { Citations, type CitationData } from "./Citation";
import { Composer } from "./Composer";
import { TaskList, type Task } from "./TaskList";
import type { IconName } from "./Icon";
import { Tooltip } from "./Tooltip";

export type ChatAction = { icon: IconName; label: string; onClick?: () => void };

export type ChatMessage = {
  id: string;
  /** "outgoing" renders as a bubble on the end side, "incoming" as plain text on the start side. */
  direction: "incoming" | "outgoing";
  content: ReactNode;
  author?: string;
  time?: Date;
  /** Hover actions. Defaults to copy, plus edit for outgoing and retry for incoming. */
  actions?: ChatAction[];
  /** Images and files shown in a row below the message. */
  attachments?: AttachmentData[];
  /** Sources referenced by <Cite> markers in the content, in reading order. */
  citations?: CitationData[];
  /** A task breakdown shown as a collapsed summary below the content. */
  tasks?: { title: string; items: Task[] };
};

export type ChatProps = {
  messages: ChatMessage[];
  /** Shows a typing indicator after the last message. */
  typing?: boolean;
  /** Renders a composer; called with the text and any draft attachments on submit. */
  onSend?: (text: string, attachments: AttachmentData[]) => void;
  /** Draft attachments shown in the composer. */
  draftAttachments?: AttachmentData[];
  onRemoveDraftAttachment?: (id: string) => void;
  /** Files dropped onto the composer. */
  onFiles?: (files: File[]) => void;
  placeholder?: string;
  /** Max height of the scrolling message area. Any CSS length. */
  maxHeight?: string | number;
  /** Fill the container's height; the message list takes the remaining space and scrolls. */
  grow?: boolean;
  /** Called for the default copy action. */
  onCopy?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
  /** Composer "+" button. */
  onAttach?: () => void;
  /** Composer microphone button. */
  onRecord?: () => void;
  /** Content shown between the messages and the composer, e.g. a Questionnaire. */
  panel?: ReactNode;
  className?: string;
};

// Fixed locale so server and client render the same text (avoids a hydration mismatch).
const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", hour: "numeric", minute: "2-digit" }).format(d);

export function Chat({ messages, typing, onSend, placeholder = "Message…", maxHeight, onCopy, onEdit, onRetry, onAttach, onRecord, panel, draftAttachments, onRemoveDraftAttachment, onFiles, className, grow }: ChatProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  // Messages present at mount don't animate; only later arrivals do.
  const [initialIds] = useState(() => new Set(messages.map((m) => m.id)));

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  const submit = () => {
    onSend?.(draft.trim(), draftAttachments ?? []);
    setDraft("");
  };

  const actionsFor = (m: ChatMessage): ChatAction[] =>
    m.actions ?? [
      { icon: "copy", label: "Copy", onClick: () => (onCopy ? onCopy(m) : typeof m.content === "string" && navigator.clipboard.writeText(m.content)) },
      m.direction === "outgoing"
        ? { icon: "edit", label: "Edit", onClick: () => onEdit?.(m) }
        : { icon: "refresh", label: "Retry", onClick: () => onRetry?.(m) },
    ];

  const meta = (m: ChatMessage) => (
    <div className="chat__meta">
      {(m.author || m.time) && (
        <span className="chat__meta-text">
          {m.author && <span className="chat__author">{m.author}</span>}
          {m.author && m.time && " · "}
          {m.time && <time dateTime={m.time.toISOString()}>{formatTime(m.time)}</time>}
        </span>
      )}
      <span className="chat__actions">
        {actionsFor(m).map((a) => (
          <Tooltip key={a.label} content={a.label} side="bottom">
            <Button size="sm" variant="ghost" icon={a.icon} aria-label={a.label} onClick={a.onClick} className="chat__action" />
          </Tooltip>
        ))}
      </span>
    </div>
  );

  return (
    <div className={cx("chat", grow && "chat--grow", className)}>
      <div ref={listRef} className="chat__messages" style={maxHeight !== undefined ? { maxHeight } : undefined}>
        {messages.map((m) => (
          <div key={m.id} className={cx("chat__message", `chat__message--${m.direction}`, !initialIds.has(m.id) && "chat__message--new")}>
            {m.content && <div className="chat__bubble">{m.content}</div>}
            {m.tasks && <TaskList title={m.tasks.title} tasks={m.tasks.items} className="chat__tasks" />}
            {m.attachments && m.attachments.length > 0 && (
              <div className="chat__attachments">
                {m.attachments.map((a) => (
                  <Attachment key={a.id} attachment={a} size="sm" />
                ))}
              </div>
            )}
            {/* Meta row always takes its space; it only becomes visible on hover or focus.
                With citations it shares a row with the citations toggle, and the list expands below. */}
            {m.citations && m.citations.length > 0 ? (
              <Citations items={m.citations} className="chat__citations" trailing={meta(m)} />
            ) : (
              meta(m)
            )}
          </div>
        ))}
        {typing && (
          <div className="chat__message chat__message--incoming chat__message--new" aria-live="polite" aria-label="Typing">
            <div className="chat__bubble chat__typing">
              <span className="chat__typing-dot" />
              <span className="chat__typing-dot" />
              <span className="chat__typing-dot" />
            </div>
          </div>
        )}
      </div>
      {panel && <div className="chat__panel">{panel}</div>}
      {onSend && (
        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={submit}
          placeholder={placeholder}
          className="chat__composer"
          attachments={draftAttachments}
          onRemoveAttachment={onRemoveDraftAttachment}
          onFiles={onFiles}
          allowEmpty
          onAttach={onAttach ?? (() => {})}
          onRecord={onRecord ?? (() => {})}
        />
      )}
    </div>
  );
}
