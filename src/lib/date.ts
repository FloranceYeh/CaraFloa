export const siteTimeZone = "Asia/Shanghai";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: siteTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: siteTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const formatSiteDateTime = (date: Date) => dateTimeFormatter.format(date);
export const formatSiteDate = (date: Date) => dateFormatter.format(date);
