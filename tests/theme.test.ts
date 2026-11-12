import { expect, test } from "vitest";
import { nextTheme, readStoredTheme, storeTheme } from "../src/lib/theme";

test("toggle flips between dark and light", () => {
  expect(nextTheme("dark")).toBe("light");
  expect(nextTheme("light")).toBe("dark");
});

test("theme toggle survives storage errors", () => {
  const bad = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  expect(readStoredTheme(bad as unknown as Storage)).toBeNull();
  expect(() => storeTheme(bad as unknown as Storage, "light")).not.toThrow();
  expect(readStoredTheme(null)).toBeNull();
  expect(() => storeTheme(null, "dark")).not.toThrow();
});

test("ignores junk stored values", () => {
  expect(readStoredTheme({ getItem: () => "purple" })).toBeNull();
});

test("round-trips a stored theme", () => {
  const m = new Map<string, string>();
  const s = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  storeTheme(s, "light");
  expect(readStoredTheme(s)).toBe("light");
});
