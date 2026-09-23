"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

export type Presence = "online" | "away" | "busy" | "offline";

export type AvatarProps = {
  /** Used for initials and the alt text. */
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
  presence?: Presence;
  /** Small element overlaid at the bottom right, e.g. a company logo. */
  badge?: ReactNode;
  className?: string;
};

function initials(name: string, count: 1 | 2) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (count === 1 ? first : first + last).toUpperCase();
}

/** Stable hue from the name, so the same person always gets the same color. */
function hue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function Avatar({ name, src, size = "md", shape = "circle", presence, badge, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <span
      className={cx(
        "avatar",
        size !== "md" && `avatar--${size}`,
        shape === "square" && "avatar--square",
        presence && "avatar--presence",
        !!badge && "avatar--badge",
        className,
      )}
      style={{ "--avatar-hue": hue(name) } as CSSProperties}
      title={name}
    >
      <span className="avatar__body">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar__image" src={src} alt={name} onError={() => setFailed(true)} />
        ) : (
          <span className="avatar__initials" aria-label={name}>
            {/* The smallest size only fits one letter. */}
            {initials(name, size === "xs" ? 1 : 2)}
          </span>
        )}
      </span>
      {presence && <span className={cx("avatar__presence", `avatar__presence--${presence}`)} aria-label={presence} />}
      {badge && <span className="avatar__badge">{badge}</span>}
    </span>
  );
}

export type AvatarGroupProps = {
  size?: AvatarProps["size"];
  /** Show at most this many avatars, then a "+N" counter. */
  max?: number;
  className?: string;
  /** Avatar children. */
  children: ReactNode[];
};

/** Overlapping row of avatars. Each avatar masks out an outline where the next one overlaps it. */
export function AvatarGroup({ size = "md", max, className, children }: AvatarGroupProps) {
  const items = children.filter(Boolean);
  const visible = max ? items.slice(0, max) : items;
  const rest = items.length - visible.length;
  return (
    <span className={cx("avatar-group", size !== "md" && `avatar-group--${size}`, className)}>
      {visible}
      {rest > 0 && (
        <span className={cx("avatar", "avatar--counter", size !== "md" && `avatar--${size}`)} title={`${rest} more`}>
          <span className="avatar__body">
            <span className="avatar__initials">+{rest}</span>
          </span>
        </span>
      )}
    </span>
  );
}
