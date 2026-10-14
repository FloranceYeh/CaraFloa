import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content" }),
  schema: z.object({
    id: z.string(),
    section: z.string(),
    period: z.string().optional(),
    title: z.string(),
    summary: z.string().optional().default(""),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { articles };
