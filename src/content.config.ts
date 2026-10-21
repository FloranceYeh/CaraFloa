import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";
import { z } from "zod";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "CONTENT_SOURCE_DIR");
const contentSource = process.env.CONTENT_SOURCE_DIR ?? env.CONTENT_SOURCE_DIR;
const contentBase = contentSource
  ? pathToFileURL(resolve(process.cwd(), contentSource, "articles")).href
  : "./src/content";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: contentBase }),
  schema: z.object({
    id: z.string(),
    section: z.string(),
    period: z.string().optional(),
    title: z.string(),
    summary: z.string().optional().default(""),
    cover: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { articles };
