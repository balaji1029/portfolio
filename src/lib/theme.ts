export type Theme = "dark" | "light";
const KEY = "theme";

export function nextTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

export function readStoredTheme(storage: Pick<Storage, "getItem"> | null): Theme | null {
  try {
    const v = storage?.getItem(KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

export function storeTheme(storage: Pick<Storage, "setItem"> | null, theme: Theme): void {
  try {
    storage?.setItem(KEY, theme);
  } catch {
    /* storage blocked: theme still applies for this page view */
  }
}
