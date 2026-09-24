"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import { Attachment, type AttachmentData } from "./Attachment";
import { Button } from "./Button";
import { DropZone } from "./DropZone";
import type { IconName } from "./Icon";
import { Toolbar, ToolbarGroup } from "./Toolbar";
import { Tooltip } from "./Tooltip";

export type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called on submit click or Enter (Shift+Enter inserts a line break). */
  onSubmit: () => void;
  placeholder?: string;
  /** Element inline before the textarea, e.g. an AI sparkle icon. */
  leading?: ReactNode;
  /** Shows a "+" attach button at the bottom left. */
  onAttach?: () => void;
  /** Shows a microphone button at the bottom left that starts voice-to-text input. */
  onDictate?: () => void;
  /** @deprecated Use onDictate. */
  onRecord?: () => void;
  /** Extra buttons rendered at the bottom left, after attach and record. */
  tools?: ReactNode;
  /** Buttons rendered at the bottom right, before the submit button. */
  actions?: ReactNode;
  /** Files and images attached to the draft, shown as thumbnails above the toolbar. */
  attachments?: AttachmentData[];
  onRemoveAttachment?: (id: string) => void;
  /** When set, the composer is a drop target and files dropped onto it are passed here. */
  onFiles?: (files: File[]) => void;
  /** Accepted file types for dropping. */
  accept?: string;
  /** Allow submitting with attachments but no text. */
  allowEmpty?: boolean;
  submitLabel?: string;
  submitIcon?: IconName;
  submitIconPosition?: "leading" | "trailing";
  /** Keep the box expanded even without focus or content. */
  expanded?: boolean;
  /** Focus the textarea when this turns true. */
  focus?: boolean;
  ariaLabel?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  className?: string;
};

/**
 * A growing textarea in a box with a toolbar. Collapsed to one line at rest; on focus or with
 * content it grows and shows the toolbar with the submit button at the bottom right.
 */
export function Composer({ value, onChange, onSubmit, placeholder, leading, onAttach, onDictate, onRecord, tools, actions, attachments, onRemoveAttachment, onFiles, accept, allowEmpty, submitLabel = "Send", submitIcon = "arrowUp", submitIconPosition = "leading", expanded, focus, ariaLabel = "Message", className }: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);

  const dictate = onDictate ?? onRecord;
  const hasAttachments = !!attachments?.length;
  const canSubmit = !!value.trim() || (allowEmpty && hasAttachments);
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (canSubmit) onSubmit();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const form = (
    <form className={cx("composer", (value || expanded || hasAttachments) && "composer--active", className)} onSubmit={submit}>
      <div className="composer__field">
        {leading && <div className="composer__leading">{leading}</div>}
        <textarea
          ref={ref}
          className="composer__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          rows={1}
        />
      </div>
      {hasAttachments && (
        <div className="composer__attachments">
          {attachments!.map((a) => (
            <Attachment key={a.id} attachment={a} size="sm" onRemove={onRemoveAttachment ? () => onRemoveAttachment(a.id) : undefined} />
          ))}
        </div>
      )}
      {/* Toolbar buttons keep focus on the textarea (Safari does not focus clicked buttons), so the box stays open. */}
      <div className="composer__toolbar" onMouseDown={(e) => e.preventDefault()}>
        <Toolbar variant="ghost" block aria-label="Composer tools">
          {(onAttach || dictate || tools) && (
            <ToolbarGroup>
              {onAttach && (
                <Tooltip content="Attach" side="top">
                  <Button variant="ghost" size="sm" icon="plus" aria-label="Attach" onClick={onAttach} />
                </Tooltip>
              )}
              {dictate && (
                <Tooltip content="Dictate" side="top">
                  <Button variant="ghost" size="sm" icon="mic" aria-label="Dictate" onClick={dictate} />
                </Tooltip>
              )}
              {tools}
            </ToolbarGroup>
          )}
          <ToolbarGroup end>
            {actions}
            <Button
              type="submit"
              variant="fill"
              color="primary"
              size="sm"
              icon={submitIconPosition === "leading" ? submitIcon : undefined}
              trailingIcon={submitIconPosition === "trailing" ? submitIcon : undefined}
              disabled={!canSubmit}
            >
              {submitLabel}
            </Button>
          </ToolbarGroup>
        </Toolbar>
      </div>
    </form>
  );

  if (!onFiles) return form;
  return (
    <DropZone onFiles={onFiles} accept={accept} className="composer__drop">
      {form}
    </DropZone>
  );
}
