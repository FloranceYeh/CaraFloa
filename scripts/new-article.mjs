import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const options = {};

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === "--help" || argument === "-h") {
    printUsage();
    process.exit(0);
  }
  if (!argument.startsWith("--")) {
    fail(`无法识别参数：${argument}`);
  }

  const [rawKey, inlineValue] = argument.slice(2).split("=", 2);
  const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  const value = inlineValue ?? args[index + 1];
  if (inlineValue === undefined) index += 1;
  if (!value || value.startsWith("--")) fail(`参数 --${rawKey} 需要一个值`);
  options[key] = value;
}

const section = required(options.section, "section");
const title = required(options.title, "title");
const articleId = options.id || slugify(title) || `article-${timestamp()}`;
const summary = options.summary || "";
const period = options.period;
const cover = options.cover;
const publishedAt = options.publishedAt || new Date().toISOString();
const body = options.content || options.body || `# ${title}\n\n在这里开始写文章。\n`;

if (!/^[a-z0-9][a-z0-9-]*$/i.test(section)) {
  fail("section 只能包含字母、数字和短横线");
}
if (!/^[a-z0-9][a-z0-9-]*$/i.test(articleId)) {
  fail("id 只能包含字母、数字和短横线");
}
if (Number.isNaN(Date.parse(publishedAt))) {
  fail(`publishedAt 不是有效日期：${publishedAt}`);
}

const fields = [
  ["id", articleId],
  ["section", section],
  ["period", period],
  ["title", title],
  ["summary", summary],
  ["cover", cover],
  ["publishedAt", publishedAt],
];
const frontmatter = fields
  .filter(([, value]) => value !== undefined)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join("\n");
const content = `---\n${frontmatter}\n---\n\n${body.trim()}\n`;
const outputPath = resolve("src", "content", section, `${articleId}.md`);

if (existsSync(outputPath)) {
  fail(`文章已存在：${outputPath}`);
}

mkdirSync(resolve("src", "content", section), { recursive: true });
writeFileSync(outputPath, content, "utf8");
console.log(`已创建文章：${outputPath}`);

function required(value, name) {
  if (!value) fail(`缺少必填参数：--${name}`);
  return value;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function timestamp() {
  return new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}

function fail(message) {
  console.error(`错误：${message}`);
  console.error("使用 --help 查看命令用法。");
  process.exit(1);
}

function printUsage() {
  console.log(`用法：
  npm run new:article -- --section <栏目> --title <标题> [选项]

选项：
  --id <id>                 文件名和文章 id，默认从英文标题生成
  --summary <摘要>          文章摘要
  --period <周期>           例如 p2
  --cover <路径>            头图路径，例如 /images/cover.jpg
  --published-at <时间>     发布时间，默认当前时间
  --content <正文>          Markdown 正文
  --help                    显示帮助`);
}
