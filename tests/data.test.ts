import { expect, test } from "vitest";
import fs from "node:fs";
import { achievements, experience, extracurriculars, profile, skills, THREADS, toys } from "../src/lib/data";
import { findForbidden } from "../scripts/verify.mjs";

test("experience is exactly Jump + TA, newest first", () => {
  const e = experience();
  expect(e.map((x) => x.id)).toEqual(["jump", "ta-cs101"]);
  expect(e[0]).toEqual({
    id: "jump",
    role: "Software Engineering Intern",
    org: "Jump Trading",
    location: "Mumbai",
    period: "May–Jul 2026",
    start: "2026.05",
    summary: "low-latency systems",
  });
  expect(e[1]).toMatchObject({ role: "Teaching Assistant, CS101", org: "IIT Bombay", period: "Aug–Dec 2024", start: "2024.08" });
});

test("contacts are only github + linkedin", () => {
  const p = profile();
  expect(p.github).toBe("https://github.com/balaji1029");
  expect(p.linkedin).toBe("https://www.linkedin.com/in/balaji-karedla/");
  expect(JSON.stringify(p)).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|mailto|gmail/i);
});

test("no banned content in any data or project file", () => {
  const projectText = fs
    .readdirSync("src/content/projects")
    .map((f) => fs.readFileSync(`src/content/projects/${f}`, "utf8"))
    .join("\n");
  const all = JSON.stringify([experience(), profile(), achievements(), toys(), skills(), extracurriculars()]) + projectText;
  expect(findForbidden(all)).toEqual([]);
});

test("jump is mentioned only in experience.yaml", () => {
  const files = [
    ...fs.readdirSync("src/data").filter((f) => f !== "experience.yaml").map((f) => `src/data/${f}`),
    ...fs.readdirSync("src/content/projects").map((f) => `src/content/projects/${f}`),
  ];
  for (const f of files) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/\bjump\b/i);
});

test("APhO entry names the olympiad", () => {
  expect(JSON.stringify(achievements())).toContain("Asian Physics Olympiad");
});

test("AP grades include CS6004 (sole AP among 110)", () => {
  const ap = achievements().find((a) => a.text.includes("AP (Advanced Performer)"));
  expect(ap?.text).toMatch(/^4 AP/);
  expect(ap?.text).toContain("CS6004 (1 of 110)");
});

test("eight achievements in two groups", () => {
  const a = achievements();
  expect(a).toHaveLength(8);
  expect(a.filter((x) => x.group === "scholastic")).toHaveLength(4);
  expect(a.filter((x) => x.group === "olympiads")).toHaveLength(4);
});

test("thread display names and order", () => {
  expect(Object.entries(THREADS)).toEqual([
    ["compilers", "compilers & program analysis"],
    ["systems", "systems & performance"],
    ["graphics", "graphics"],
    ["security", "architecture & security"],
    ["ml", "ml / rl"],
  ]);
});

test("thirteen projects, four featured", () => {
  const files = fs.readdirSync("src/content/projects").filter((f) => f.endsWith(".md"));
  expect(files).toHaveLength(13);
  const featured = files.filter((f) => /^featured:\s*true/m.test(fs.readFileSync(`src/content/projects/${f}`, "utf8")));
  expect(featured.sort()).toEqual(["c-like-compiler.md", "cdcl-sat.md", "graphics.md", "microarch-security.md"]);
});

test("toys and skills are populated", () => {
  expect(toys().map((t) => t.name)).toContain("censor-google-extension");
  expect(toys().every((t) => t.repo.startsWith("https://github.com/balaji1029/"))).toBe(true);
  expect(skills().languages[0]).toBe("C++ (23/20/17)");
});
