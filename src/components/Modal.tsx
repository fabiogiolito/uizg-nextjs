"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { TextPair } from "./TextPair";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /**
   * sm: quick alerts and confirmations.
   * md: forms and short content.
   * lg: long content, the body scrolls inside the modal.
   * xl: wide layouts like side-by-side panels, around 1024px.
   * full: takes most of the viewport.
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: ReactNode;
  /** Hide the close button in the header. */
  hideClose?: boolean;
  /** Clicking the backdrop closes the modal. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
};

/** Built on the native dialog element, so focus trapping, Escape and top-layer stacking come for free. */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  hideClose,
  dismissible = true,
  className,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("modal", size !== "md" && `modal--${size}`, className)}
      onClose={onClose}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal__panel">
        {(title || !hideClose) && (
          <div className="modal__header">
            {title && <TextPair size="lg" titleAs="h2" title={title} description={description} className="modal__title" />}
            {!hideClose && <Button variant="ghost" size="sm" icon="x" aria-label="Close" onClick={onClose} className="modal__close" />}
          </div>
        )}
        {children && <div className="modal__body">{children}</div>}
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </dialog>
  );
}
