"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";
import { Dropdown } from "./Dropdown";
import type { IconName } from "./Icon";
import { ListItem } from "./List";

export type SubMenuProps = {
  label: ReactNode;
  icon?: IconName;
  description?: ReactNode;
  disabled?: boolean;
  /** ListItem, ListSection, ListDivider children, or further SubMenus. */
  children: ReactNode;
};

/**
 * A Dropdown whose trigger is a list item, opening beside it on click and staying open until the
 * item is clicked again or the pointer clicks outside. Put it among the items of a Dropdown or
 * ContextMenu; nest as deep as needed.
 */
export function SubMenu({ label, icon, description, disabled, children }: SubMenuProps) {
  return (
    <Dropdown
      side="right"
      className="submenu"
      trigger={(props, open) => (
        <ListItem
          {...props}
          icon={icon}
          label={label}
          description={description}
          disabled={disabled}
          trailingIcon="chevronRight"
          className={cx("list__item--submenu", open && "list__item--submenu-open")}
        />
      )}
    >
      {children}
    </Dropdown>
  );
}
