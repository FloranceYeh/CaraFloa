export interface LinkItem {
  url: string;
  ava: string;
  name: string;
  des: string;
}

export type LinkGroups = Record<string, Record<string, LinkItem>>;

export const links: LinkGroups = {
  Frinends: {
    Florance: {
      url: "https://Florance.top/",
      ava: "https://florance.top/images/avatar.jpg",
      name: "Florance's Blog",
      des: "It's Florance!",
    },
    Github: {
      url: "https://github.com/FloranceYeh",
      ava: "https://florance.top/images/avatar.jpg",
      name: "Florance's GitHub",
      des: "A web-based platform for version control and collaboration.",
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
