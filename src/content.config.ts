import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content" }),
  schema: z.object({
    id: z.string(),
    section: z.string(),
    period: z.string().optional(),
    title: z.string(),
    summary: z.string().optional().default(""),
    cover: z.string().optional(),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { articles };
