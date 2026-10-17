export interface HomeSection {
  id: string;
  title: string;
  summary: string;
}

export const homeSections: HomeSection[] = [
  { id: "open-source", title: "开源项目", summary: "开源项目分享推荐" },
  { id: "unpublished-1", title: "未发布", summary: "未发布内容" },
  { id: "weekly-topic", title: "每周议题", summary: "每周议题分享" },
  { id: "steganography", title: "每周隐写", summary: "每周一道隐写题" },
  { id: "tech-news", title: "技术新闻", summary: "最新科技新闻分享" },
  { id: "unpublished-2", title: "未发布", summary: "未发布内容" },
  { id: "weekly-review", title: "周汇小结", summary: "每周回顾总结" },
];
