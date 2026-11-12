#!/usr/bin/env node
// Post-build checks: privacy rules and internal link integrity.
// Usage: node scripts/verify.mjs <distDir> <base>
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

/* ---------- private terms (stored only as hashes) ---------- */

const words = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/** sha256 of a phrase's normalised words; used to build the private-term list. */
export function hashTerm(phrase) {
  return crypto.createHash("sha256").update(words(phrase).join(" ")).digest("hex");
}

/** Phrases that must never appear on the site, as hashTerm() values. Up to 3 words each. */
export const DEFAULT_TERMS = new Set([
  "a0d07fe057db7a0bd0d6957d0f81b387b311d621a49d5162f7103074f7000319",
  "a127d6e448c97c8dca69b3f07f3558ea4f981e73a8918aeac1b528b78c6c09c9",
  "18d7e6a5fae4691ee2f02bf6115294e1281c8765d0c222969bc6df1ca0f5d36f",
  "336134156bdf3805b1566c824afbd50fcf5766b188e697dd96302031648b95ca",
]);

function hasPrivateTerm(text, terms) {
  const w = words(text);
  for (let i = 0; i < w.length; i++) {
    for (let n = 1; n <= 3 && i + n <= w.length; n++) {
      const h = crypto.createHash("sha256").update(w.slice(i, i + n).join(" ")).digest("hex");
      if (terms.has(h)) return true;
    }
  }
  return false;
}

/* ---------- email ---------- */

function decode(text) {
  return text
    .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&commat;/gi, "@")
    .replace(/&period;/gi, ".")
    .replace(/%([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

/** Names of every privacy rule the text violates. */
export function findForbidden(text, terms = DEFAULT_TERMS) {
  const t = decode(text);
  const hits = [];
  if (EMAIL.test(t)) hits.push("email");
  if (/gmail/i.test(t)) hits.push("gmail");
  if (/mailto:/i.test(t)) hits.push("mailto");
  if (hasPrivateTerm(t, terms)) hits.push("private-term");
  return hits;
}

/* ---------- the one approved experience line ---------- */

const APPROVED_JUMP = "2026.05 Software Engineering Intern — Jump Trading, Mumbai — May–Jul 2026 — low-latency systems";
const JUMP = /\bjump\b/i;

/** Jump may appear only as the exact approved line inside a bare data-exp="jump" element. */
export function checkJump(html) {
  const errors = [];
  const root = parse(html, { comment: true });
  for (const el of root.querySelectorAll('[data-exp="jump"]')) {
    const text = el.text.replace(/\s+/g, " ").trim();
    if (text !== APPROVED_JUMP) errors.push(`experience entry text differs from the approved line: "${text}"`);
    const extra = Object.keys(el.attributes).filter((a) => a !== "data-exp" && !a.startsWith("data-astro-cid"));
    if (extra.length) errors.push(`experience entry has extra attributes: ${extra.join(", ")}`);
    el.remove();
  }
  if (JUMP.test(root.toString())) errors.push("'Jump' mentioned outside the approved experience entry");
  return errors;
}

/* ---------- links ---------- */

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function exists(distDir, rel) {
  const p = path.join(distDir, rel);
  const isFile = (f) => fs.existsSync(f) && fs.statSync(f).isFile();
  return isFile(p) || isFile(path.join(p, "index.html")) || isFile(`${p.replace(/\/+$/, "")}.html`);
}

/** Every internal href/src (and CSS url()) must carry the base and resolve to a built file. */
export async function checkLinks(distDir, base) {
  const b = base.endsWith("/") ? base : `${base}/`;
  const errors = [];
  for (const file of walk(distDir)) {
    const ext = path.extname(file);
    if (ext !== ".html" && ext !== ".css") continue;
    const body = fs.readFileSync(file, "utf8");
    const re = ext === ".html" ? /\b(?:href|src)="([^"]*)"/g : /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
    for (const [, raw] of body.matchAll(re)) {
      if (!raw.startsWith("/") || raw.startsWith("//")) continue; // external, relative, hash, data:
      const clean = decodeURI(raw.split(/[?#]/)[0]);
      const rel = path.relative(distDir, file);
      if (!(clean + "/").startsWith(b) && clean !== b.slice(0, -1)) {
        errors.push(`${rel}: link ${raw} is missing base ${b}`);
        continue;
      }
      if (!exists(distDir, clean.slice(b.length))) errors.push(`${rel}: broken link ${raw}`);
    }
  }
  return errors;
}

/* ---------- whole build ---------- */

const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|wasm)$/i;

/** All checks over a built site; returns error strings (empty = pass). */
export async function verifyDir(distDir, base) {
  const errors = [];
  for (const file of walk(distDir)) {
    const rel = path.relative(distDir, file);
    for (const name of findForbidden(rel)) errors.push(`${rel}: forbidden file name (${name})`);
    if (/\.pdf$/i.test(file)) { errors.push(`${rel}: PDFs are not allowed in the build`); continue; }
    if (BINARY.test(file)) continue;
    const body = fs.readFileSync(file, "utf8");
    for (const name of findForbidden(body)) errors.push(`${rel}: forbidden content (${name})`);
    if (/\.html?$/i.test(file)) for (const e of checkJump(body)) errors.push(`${rel}: ${e}`);
    else if (JUMP.test(body)) errors.push(`${rel}: 'Jump' mentioned outside the approved experience entry`);
  }
  errors.push(...(await checkLinks(distDir, base)));
  return errors;
}

async function main([distDir, base = "/"]) {
  if (!distDir || !fs.existsSync(distDir)) {
    console.error(`verify: dist dir not found: ${distDir}`);
    process.exit(1);
  }
  const errors = await verifyDir(distDir, base);
  if (errors.length) {
    for (const e of errors) console.error(`verify: ${e}`);
    process.exit(1);
  }
  console.log(`verify: OK (${walk(distDir).length} files, base ${base})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
