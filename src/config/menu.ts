export interface MenuItem {
  name: string;
  path: `/${string}` | "/";
  icon: string;
}

export const menu: MenuItem[] = [
  { name: "Home", path: "/", icon: "fa-solid fa-house" },
  { name: "Archive", path: "/archive", icon: "fa-solid fa-box-archive" },
  { name: "Profile", path: "/profile", icon: "fa-solid fa-circle-user" },
  { name: "Link", path: "/link", icon: "fa-solid fa-link" },
];

export const pageByPath = (path: string) => menu.find((item) => item.path === path) ?? menu[0];
export const pageBySlug = (slug: string | string[]) =>
  pageByPath(`/${Array.isArray(slug) ? slug.join("/") : slug}`);
