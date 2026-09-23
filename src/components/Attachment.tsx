import { cx } from "./cx";
import { Button } from "./Button";

export type AttachmentData = {
  id: string;
  type: "image" | "file";
  name: string;
  /** Image source or file link. */
  url?: string;
  /** Human-readable size, e.g. "2.4 MB". */
  size?: string;
};

export type AttachmentProps = {
  attachment: AttachmentData;
  size?: "sm" | "md";
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
};

const extension = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 4) : "");
const baseName = (name: string) => (name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name);

/** Square thumbnail for an image or file. */
export function Attachment({ attachment, size = "md", onRemove, onClick, className }: AttachmentProps) {
  const isImage = attachment.type === "image" && attachment.url;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cx("attachment", `attachment--${attachment.type}`, size === "sm" && "attachment--sm", className)}
      title={attachment.size ? `${attachment.name} · ${attachment.size}` : attachment.name}
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="attachment__image" src={attachment.url} alt={attachment.name} />
      ) : (
        <>
          <span className="attachment__ext">{extension(attachment.name)}</span>
          <span className="attachment__name">{baseName(attachment.name)}</span>
        </>
      )}
      {onRemove && (
        <Button size="sm" variant="ghost" icon="x" aria-label="Remove attachment" className="attachment__remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} />
      )}
    </Tag>
  );
}
