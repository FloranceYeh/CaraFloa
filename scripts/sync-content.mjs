import { cp, mkdir, readFile, readdir, realpath, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

export const contentMappings = [
  ["articles", "src/content"],
  ["config", "src/config"],
  ["images", "public/images"],
];

// Copy only changed files so dev updates do not invalidate every page and article.
async function mirrorDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  const names = new Set(entries.map((entry) => entry.name));
  for (const entry of await readdir(destination)) {
    if (!names.has(entry)) await rm(join(destination, entry), { recursive: true, force: true });
  }
  for (const entry of entries) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    const sourceStat = await stat(from);
    const targetStat = await stat(to).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    if (targetStat && sourceStat.isDirectory() !== targetStat.isDirectory()) {
      await rm(to, { recursive: true, force: true });
    }
    if (sourceStat.isDirectory()) {
      await mirrorDirectory(from, to);
    } else {
      const contents = await readFile(from);
      const existing = await readFile(to).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
      if (!existing?.equals(contents)) await cp(from, to);
    }
  }
}

export async function syncContent(sourceDirectory, root = resolve(".")) {
  // Validate every mapping before changing any destination.
  for (const [source, destination] of contentMappings) {
    const sourcePath = join(sourceDirectory, source);
    if (!(await stat(sourcePath).catch(() => undefined))?.isDirectory()) {
      throw new Error(`内容仓库缺少目录：${sourcePath}`);
    }
    const sourceRealPath = await realpath(sourcePath);
    const destinationPath = existsSync(resolve(root, destination))
      ? await realpath(resolve(root, destination))
      : resolve(root, destination);
    const overlaps = (a, b) => {
      const path = relative(a, b);
      return path === "" || (!isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`));
    };
    if (overlaps(sourceRealPath, destinationPath) || overlaps(destinationPath, sourceRealPath)) {
      throw new Error(`内容源与目标目录不能重叠：${sourcePath} -> ${destinationPath}`);
    }
  }
  for (const [source, destination] of contentMappings) {
    await mirrorDirectory(join(sourceDirectory, source), resolve(root, destination));
  }
}

async function main() {
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

await syncContent(sourceDirectory, root);
for (const [source, destination] of contentMappings) {
  console.log(`已同步 ${source}/ -> ${destination}/`);
}
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main().catch((error) => fail(error.message));
}

function runGit(args) {
  execFileSync("git", args, { stdio: "inherit" });
}

function fail(message) {
  console.error(`同步失败：${message}`);
  process.exit(1);
}
