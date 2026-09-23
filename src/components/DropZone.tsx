"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { TextPair } from "./TextPair";

export type DropZoneState = { dragging: boolean; open: () => void };

export type DropZoneProps = {
  onFiles: (files: File[]) => void;
  /** Accepted types, as for a file input, e.g. "image/*,.pdf". */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Standalone zone copy. */
  title?: ReactNode;
  description?: ReactNode;
  /** Wrap an element to make it the drop target. A function also receives drag state and an open() for the file picker. */
  children?: ReactNode | ((state: DropZoneState) => ReactNode);
  className?: string;
};

const matches = (file: File, accept?: string) => {
  if (!accept) return true;
  return accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase();
    if (!r) return false;
    if (r.startsWith(".")) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith("/*")) return file.type.toLowerCase().startsWith(r.slice(0, -1));
    return file.type.toLowerCase() === r;
  });
};

/**
 * Drop files here. Standalone it is a dashed area that also opens a file picker on click; with
 * children it turns them into the drop target and shows an overlay while files are dragged over.
 */
export function DropZone({ onFiles, accept, multiple = true, disabled, title = "Drop files here", description = "or click to browse", children, className }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const inputId = useId();

  // Looked up by id rather than a ref, so `open` can be handed to render-prop children.
  const open = () => {
    if (!disabled) (document.getElementById(inputId) as HTMLInputElement | null)?.click();
  };
  const accept_ = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => matches(f, accept));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  const handlers = disabled
    ? {}
    : {
        onDragEnter: (e: DragEvent) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          depth.current += 1;
          setDragging(true);
        },
        onDragOver: (e: DragEvent) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: (e: DragEvent) => {
          if (!hasFiles(e)) return;
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        },
        onDrop: (e: DragEvent) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          accept_(e.dataTransfer.files);
        },
      };

  const input = (
    <input
      id={inputId}
      type="file"
      className="drop-zone__input"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      tabIndex={-1}
      onChange={(e) => {
        accept_(e.target.files);
        e.target.value = "";
      }}
    />
  );

  if (children !== undefined) {
    return (
      <div className={cx("drop-zone", "drop-zone--target", dragging && "drop-zone--dragging", className)} {...handlers}>
        {typeof children === "function" ? children({ dragging, open }) : children}
        <div className="drop-zone__overlay" aria-hidden>
          <Icon name="file" className="drop-zone__overlay-icon" />
          <span>Drop to attach</span>
        </div>
        {input}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cx("drop-zone", "drop-zone--standalone", dragging && "drop-zone--dragging", disabled && "drop-zone--disabled", className)}
      onClick={open}
      disabled={disabled}
      {...handlers}
    >
      <Icon name="file" className="drop-zone__icon" />
      <TextPair align="center" title={title} description={description} />
      {input}
    </button>
  );
}
