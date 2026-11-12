import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    thread: z.enum(["compilers", "systems", "graphics", "security", "ml"]),
    period: z.string(),
    context: z.string(),
    tech: z.array(z.string()),
    repo: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

export const collections = { projects };
