export interface LinkItem {
  url: string;
  ava: string;
  name: string;
  des: string;
}

export type LinkGroups = Record<string, Record<string, LinkItem>>;

export const links: LinkGroups = {
  Frinends: {
    1: {
      url: "https://www.bilibili.com/",
      ava: "",
      name: "Bilibili",
      des: "A popular video sharing website in China.",
    },
    2: {
      url: "https://www.zhihu.com/",
      ava: "",
      name: "Zhihu",
      des: "A Chinese question-and-answer website.",
    },
  },
  Tools: {
    1: {
      url: "https://www.github.com/",
      ava: "",
      name: "GitHub",
      des: "A web-based platform for version control and collaboration.",
    },
  },
};
