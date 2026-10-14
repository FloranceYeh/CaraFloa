import { getCollection, type CollectionEntry } from "astro:content";
import { homeSections, type HomeSection } from "../config/home";

export type Article = CollectionEntry<"articles">;
export const getArticles = () => getCollection("articles");
export const articleSection = (article: Article) => article.id.split("/")[0];

export const latestArticleForSection = (
  articles: Article[],
  section: HomeSection,
  now = new Date(),
) =>
  articles
    .filter(
      (article) =>
        articleSection(article) === section.id &&
        article.data.publishedAt.getTime() <= now.getTime(),
    )
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())[0];

export const latestPublishedArticle = (articles: Article[], now = new Date()) =>
  articles
    .filter((article) => article.data.publishedAt.getTime() <= now.getTime())
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())[0];

export const sectionArticle = (articles: Article[], section: HomeSection) =>
  articles
    .filter((article) => articleSection(article) === section.id)
    .sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime());

export { homeSections };
