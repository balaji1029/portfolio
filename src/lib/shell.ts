export type Route = "~" | "projects" | "about" | "toys";

export interface ShellCtx {
  name: string;
  tagline: string;
  now: string;
  bio: string[];
  github: string;
  linkedin: string;
  routes: Record<Route, string>;
}

export interface ShellResult {
  lines: string[];
  navigate?: string;
  clear?: boolean;
}

const HELP = [
  "ls              list this directory",
  "cd <dir>        go to projects/, about/, toys/ or ~",
  "whoami          who is this",
  "cat bio.txt     the short version",
  "github          open github",
  "linkedin        open linkedin",
  "clear           clear the screen",
];

function resolveDir(arg: string | undefined, routes: ShellCtx["routes"]): string | undefined {
  if (arg === undefined) return routes["~"];
  const dir = arg.replace(/^\.\//, "").replace(/\/+$/, "");
  if (dir === "" || dir === "~" || dir === ".." || dir === "/") return routes["~"];
  return Object.hasOwn(routes, dir) ? routes[dir as Route] : undefined;
}

/** Interpret one line typed at the home-page prompt. Pure: the caller does the DOM work. */
export function run(input: string, ctx: ShellCtx): ShellResult {
  const [rawCmd, ...args] = input.trim().split(/\s+/).filter(Boolean);
  if (!rawCmd) return { lines: [] };
  const cmd = rawCmd.toLowerCase();

  switch (cmd) {
    case "help":
      return { lines: HELP };
    case "ls":
      return { lines: ["projects/  about/  toys/  bio.txt"] };
    case "cd": {
      const target = resolveDir(args[0]?.toLowerCase(), ctx.routes);
      return target ? { lines: [], navigate: target } : { lines: [`cd: no such file or directory: ${args[0]}`] };
    }
    case "whoami":
      return { lines: [ctx.name, ctx.tagline, `now: ${ctx.now}`] };
    case "cat":
      return args[0]?.toLowerCase() === "bio.txt"
        ? { lines: ctx.bio }
        : { lines: [`cat: ${args[0] ?? ""}: No such file or directory`] };
    case "clear":
      return { lines: [], clear: true };
    case "sudo":
      return { lines: ["nice try."] };
    case "github":
      return { lines: [], navigate: ctx.github };
    case "linkedin":
      return { lines: [], navigate: ctx.linkedin };
    default:
      return { lines: [`command not found: ${rawCmd}`] };
  }
}
