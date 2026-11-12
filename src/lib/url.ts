/** Prefix an internal path with the site base so builds work at `/` and `/~balaji/`. */
export function url(path: string, base: string = import.meta.env.BASE_URL): string {
  const b = base.endsWith("/") ? base : `${base}/`;
  const p = path.replace(/^\/+/, "");
  return `${b}${p}`;
}
