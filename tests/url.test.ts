import { expect, test } from "vitest";
import { url } from "../src/lib/url";

test("root base", () => {
  expect(url("/projects", "/")).toBe("/projects");
  expect(url("/", "/")).toBe("/");
});

test("cse base", () => {
  expect(url("/projects", "/~balaji/")).toBe("/~balaji/projects");
  expect(url("projects", "/~balaji")).toBe("/~balaji/projects");
  expect(url("/", "/~balaji/")).toBe("/~balaji/");
  expect(url("", "/~balaji")).toBe("/~balaji/");
});
