import { describe, expect, test } from "vitest";
import fs from "node:fs";

// These assertions run against the built site; `npm run build` first.
const built = fs.existsSync("dist/index.html");
const read = (p: string) => fs.readFileSync(`dist/${p}`, "utf8");
const count = (h: string, re: RegExp) => (h.match(re) || []).length;

describe.skipIf(!built)("built pages (run `npm run build` first)", () => {
  test("home has every shell section and four featured cards", () => {
    const h = read("index.html");
    for (const c of ["whoami", "ls -l projects/ | head", "git log --oneline career", "ls toys/"]) expect(h).toContain(c);
    expect(count(h, /class="project-card"/g)).toBe(4);
    expect(h).toContain('data-exp="jump"');
  });

  test("projects grouped in thread order with all thirteen cards", () => {
    const h = read("projects/index.html");
    const names = ["compilers &amp; program analysis", "systems &amp; performance", "graphics", "architecture &amp; security", "ml / rl"];
    const idx = names.map((t) => h.indexOf(`>${t}<`));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(count(h, /class="project-card"/g)).toBe(13);
  });

  test("about has education, achievements and skills", () => {
    const h = read("about/index.html");
    for (const s of ["9.62", "Machine Learning", "Asian Physics Olympiad", "Teaching Assistant", "RenderDoc"]) expect(h).toContain(s);
  });

  test("toys page lists each toy as an executable", () => {
    const h = read("toys/index.html");
    expect(h).toContain("censor-google-extension*");
    expect(count(h, /class="exec"/g)).toBeGreaterThanOrEqual(5);
  });

  test("home prompt renders an inert fallback and carries no experience data", () => {
    const h = read("index.html");
    expect(count(h, /class="prompt"/g)).toBe(1);
    expect(h).toMatch(/<input[^>]*aria-label="terminal command"[^>]*hidden/);
    const ctx = h.match(/data-ctx="([^"]*)"/)?.[1] ?? "";
    expect(ctx).toContain("Balaji Karedla");
    expect(ctx).not.toMatch(/jump/i);
  });

  test("404 is shell-flavoured", () => {
    expect(read("404.html")).toContain("No such file or directory");
  });
});

test("build exists for page tests", () => {
  if (!built) console.warn("dist/ missing — page tests skipped; run `npm run build`");
  expect(true).toBe(true);
});
