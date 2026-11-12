import { expect, test } from "vitest";
import { run, type ShellCtx } from "../src/lib/shell";

const ctx: ShellCtx = {
  name: "Balaji Karedla",
  tagline: "t",
  now: "n",
  bio: ["b1"],
  github: "G",
  linkedin: "L",
  routes: { "~": "/", projects: "/projects", about: "/about", toys: "/toys" },
};

test("help lists the commands", () => {
  expect(run("help", ctx).lines.join(" ")).toMatch(/ls.*cd.*whoami.*clear/s);
});

test("empty and whitespace-only input prints nothing", () => {
  expect(run("", ctx)).toEqual({ lines: [] });
  expect(run("   ", ctx)).toEqual({ lines: [] });
});

test("commands ignore case and surrounding spaces", () => {
  expect(run("  LS ", ctx).lines).toEqual(run("ls", ctx).lines);
  expect(run("ls", ctx).lines).toEqual(["projects/  about/  toys/  bio.txt"]);
});

test("cd navigates like a shell user expects", () => {
  expect(run("cd projects", ctx).navigate).toBe("/projects");
  expect(run("cd projects/", ctx).navigate).toBe("/projects");
  expect(run("cd ./about", ctx).navigate).toBe("/about");
  expect(run("cd ~", ctx).navigate).toBe("/");
  expect(run("cd", ctx).navigate).toBe("/");
  expect(run("cd ..", ctx).navigate).toBe("/");
  expect(run("cd nope", ctx)).toEqual({ lines: ["cd: no such file or directory: nope"] });
});

test("cd ignores inherited object keys", () => {
  for (const d of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
    expect(run(`cd ${d}`, ctx), d).toEqual({ lines: [`cd: no such file or directory: ${d}`] });
  }
});

test("whoami, cat, clear, sudo, links, unknown", () => {
  expect(run("whoami", ctx).lines).toEqual(["Balaji Karedla", "t", "now: n"]);
  expect(run("cat bio.txt", ctx).lines).toEqual(["b1"]);
  expect(run("cat nope.txt", ctx).lines).toEqual(["cat: nope.txt: No such file or directory"]);
  expect(run("clear", ctx)).toEqual({ lines: [], clear: true });
  expect(run("sudo rm -rf /", ctx).lines).toEqual(["nice try."]);
  expect(run("github", ctx).navigate).toBe("G");
  expect(run("linkedin", ctx).navigate).toBe("L");
  expect(run("foo bar", ctx).lines).toEqual(["command not found: foo"]);
});
