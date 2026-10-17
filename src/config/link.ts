export interface LinkItem {
  url: string;
  ava: string;
  name: string;
  des: string;
}

export type LinkGroups = Record<string, Record<string, LinkItem>>;

export const links: LinkGroups = {
  "Section-A": {
    "Site-A": {
      url: "https://site-a.com/",
      ava: "https://site-a.com/images/avatar.jpg",
      name: "Site-A",
      des: "It's site-a.",
    },
    "Site-B": {
      url: "https://site-b.com/",
      ava: "https://site-b.com/images/avatar.jpg",
      name: "Site-B",
      des: "It's site-b.",
    },
  },
  "Section-B": {
    "Site-C": {
      url: "https://site-c.com/",
      ava: "https://site-c.com/images/avatar.jpg",
      name: "Site-C",
      des: "It's site-c.",
    },
  },
};
