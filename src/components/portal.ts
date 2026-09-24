/** One shared container at the end of body for floating layers (menus, hover cards), created on first use. */
let root: HTMLElement | null = null;
export function getPortalRoot() {
  if (!root) {
    root = document.createElement("div");
    root.className = "uizg-portal";
    document.body.appendChild(root);
  }
  return root;
}
