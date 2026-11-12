import { expect, test } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { findForbidden, checkJump, checkLinks, hashTerm, verifyDir, DEFAULT_TERMS } from "../scripts/verify.mjs";

const APPROVED_TEXT = "2026.05 Software Engineering Intern — Jump Trading, Mumbai — May–Jul 2026 — low-latency systems";
const APPROVED = `<li data-exp="jump" data-astro-cid-abc123><span>2026.05</span> Software Engineering Intern — Jump Trading, Mumbai — May–Jul 2026 — low-latency systems</li>`;

// Private terms are stored only as hashes; tests use harmless stand-ins.
const TEST_TERMS = new Set([hashTerm("secret project"), hashTerm("zorblax")]);

test("private terms match in any spelling", () => {
  for (const t of ["Secret Project", "secret-project", "SecretProject", "the secret_project_v2 file", "ZORBLAX", "zorblax.pdf"]) {
    expect(findForbidden(t, TEST_TERMS), t).toContain("private-term");
  }
});

test("private terms do not match near-misses", () => {
  expect(findForbidden("secretive projection", TEST_TERMS)).toEqual([]);
  expect(findForbidden("function(s,e,c){}", TEST_TERMS)).toEqual([]);
});

test("default private term list is hashed and quiet on ordinary text", () => {
  expect(DEFAULT_TERMS.size).toBe(4);
  for (const h of DEFAULT_TERMS) expect(h).toMatch(/^[0-9a-f]{64}$/);
  expect(findForbidden("a short, sharp shirt; function(h,r,t){return h}")).toEqual([]);
});

test("flags emails, including encoded ones", () => {
  for (const t of ["foo.bar@example.com", "foo&#64;example.com", "foo&#x40;example.com", "foo&commat;example.com", "foo%40example.com"]) {
    expect(findForbidden(t), t).toContain("email");
  }
  expect(findForbidden('<a href="mailto:x">')).toContain("mailto");
  expect(findForbidden("@balaji1029 on github")).toEqual([]);
});

test("jump line passes only when exactly approved", () => {
  expect(checkJump(`<ul>${APPROVED}</ul>`)).toEqual([]);
  expect(checkJump(`<li data-exp="jump">${APPROVED_TEXT.replace("low-latency", "low-latency trading")}</li>`)).not.toEqual([]);
});

test("jump mentioned anywhere outside the approved element is an error", () => {
  const cases = [
    "<p>At Jump I built a thing</p>",
    `<head><meta name="description" content="worked at Jump Trading"></head>${APPROVED}`,
    `<img alt="Jump office">${APPROVED}`,
    `<script type="application/ld+json">{"worksFor":"Jump Trading"}</script>${APPROVED}`,
    `<div data-ctx='{"x":"jump"}'></div>`,
  ];
  for (const c of cases) expect(checkJump(c), c).not.toEqual([]);
});

test("extra attributes on the jump element are an error", () => {
  expect(checkJump(APPROVED.replace("<li ", '<li title="more detail" '))).not.toEqual([]);
});

function fixture(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-"));
  for (const [rel, body] of Object.entries(files)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, body);
  }
  return dir;
}

test("verifyDir scans every text file, js included, and file names", async () => {
  const dir = fixture({
    "index.html": "<p>hi</p>",
    "notes.md": "contact: a@b.io",
    "_astro/app.js": 'const x="Jump Trading desk";',
    "me@site.com.txt": "",
  });
  const errors: string[] = await verifyDir(dir, "/");
  expect(errors.some((e) => e.includes("notes.md") && e.includes("email"))).toBe(true);
  expect(errors.some((e) => e.includes("app.js") && /jump/i.test(e))).toBe(true);
  expect(errors.some((e) => e.includes("me@site.com.txt"))).toBe(true);
});

test("verifyDir passes a clean build", async () => {
  const dir = fixture({ "index.html": `<a href="/about/">a</a><ul>${APPROVED}</ul>`, "about/index.html": "", "_astro/x.js": "let a=1" });
  expect(await verifyDir(dir, "/")).toEqual([]);
});

test("resolves links under a non-root base", async () => {
  const dir = fixture({
    "index.html":
      '<a href="/~balaji/about/">ok</a><a href="/~balaji/missing/">bad</a>' +
      '<link href="/~balaji/favicon.svg"><a href="https://x.com">ext</a><a href="#top">hash</a>',
    "about/index.html": '<a href="/~balaji/">home</a><a href="/~balaji/about?x=1#y">self</a>',
    "favicon.svg": "<svg/>",
  });
  const errors: string[] = await checkLinks(dir, "/~balaji/");
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain("/~balaji/missing/");
});

test("an internal link missing the base is an error", async () => {
  const dir = fixture({ "index.html": '<a href="/about/">x</a>', "about/index.html": "" });
  const errors: string[] = await checkLinks(dir, "/~balaji/");
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain("/about/");
});

test("root base resolves file.html and directories", async () => {
  const dir = fixture({ "index.html": '<a href="/404">x</a><a href="/">y</a>', "404.html": "" });
  expect(await checkLinks(dir, "/")).toEqual([]);
});
