export interface PageConfig {
  path: string;
  gridX: number;
  gridY: number;
  name?: string;
}

export const pageGrid: PageConfig[] = [
  { path: "/", gridX: 0, gridY: 0, name: "Home" },
  { path: "/archive", gridX: 0, gridY: 1, name: "Archive" },
  { path: "/about", gridX: 0, gridY: 2, name: "About" },
  { path: "/link", gridX: 0, gridY: 3, name: "Link" },

  { path: "article", gridX: 1, gridY: 0, name: "Article" },
  { path: "/404", gridX: 4, gridY: 4, name: "404" },
];

export const getPageConfig = (path: string): PageConfig | undefined => {
  return pageGrid.find((page) => page.path === path);
};
export const getPageByGrid = (x: number, y: number): PageConfig | undefined => {
  return pageGrid.find((page) => page.gridX === x && page.gridY === y);
};
export const getMainPages = (): PageConfig[] => {
  return pageGrid.filter((page) => page.gridX === 0);
};
export const getSubPages = (): PageConfig[] => {
  return pageGrid.filter((page) => page.gridX > 0);
};
