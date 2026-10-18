import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(".");
const repository = process.env.CONTENT_REPOSITORY;
const ref = process.env.CONTENT_REF || "main";
const repositoryUrl = repository?.includes("://")
  ? repository
  : `https://github.com/${repository}.git`;
const sourceDirectory = resolve(
  process.env.CONTENT_SOURCE_DIR || ".content-repository",
);

if (!process.env.CONTENT_SOURCE_DIR) {
  if (!repository) {
    fail("缺少 CONTENT_REPOSITORY，例如 FloranceYeh/CaraFloa-content");
  }

  if (existsSync(join(sourceDirectory, ".git"))) {
    runGit(["-C", sourceDirectory, "fetch", "--depth", "1", "origin", ref]);
    runGit(["-C", sourceDirectory, "reset", "--hard", `origin/${ref}`]);
  } else {
    await rm(sourceDirectory, { recursive: true, force: true });
    runGit(["clone", "--depth", "1", "--branch", ref, repositoryUrl, sourceDirectory]);
  }
}

const mappings = [
  ["articles", "src/content"],
  ["config", "src/config"],
  ["images", "public/images"],
];

for (const [source, destination] of mappings) {
  const sourcePath = join(sourceDirectory, source);
  const destinationPath = resolve(root, destination);

  if (!existsSync(sourcePath)) {
    fail(`内容仓库缺少目录：${source}/`);
  }

  await rm(destinationPath, { recursive: true, force: true });
  await mkdir(destinationPath, { recursive: true });
  await cp(sourcePath, destinationPath, { recursive: true });
  console.log(`已同步 ${source}/ -> ${destination}/`);
}

function runGit(args) {
  execFileSync("git", args, { stdio: "inherit" });
}

function fail(message) {
  console.error(`同步失败：${message}`);
  process.exit(1);
}
