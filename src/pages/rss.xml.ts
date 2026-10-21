import type { APIRoute } from "astro";
import { articleSection, getArticles, homeSections } from "../lib/articles";
import { SiteTitle } from "@content-config/site";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: APIRoute = async ({ site, url }) => {
  const configuredSite = import.meta.env.PUBLIC_SITE_URL?.trim();
  const baseUrl = (configuredSite || site?.toString() || url.origin).replace(/\/$/, "");
  const now = Date.now();
  const sectionTitles = new Map(homeSections.map((section) => [section.id, section.title]));
  const articles = (await getArticles())
    .filter((article) => article.id !== "about" && article.data.publishedAt.getTime() <= now)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  const items = articles
    .map((article) => {
      const section = articleSection(article);
      const link = `${baseUrl}/${section}/${encodeURIComponent(article.data.id)}`;
      const title = escapeXml(article.data.title);
      const description = escapeXml(article.data.summary || sectionTitles.get(section) || "");
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${article.data.publishedAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SiteTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(`${SiteTitle} 最新文章`)}</description>
    <language>zh-CN</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
