import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { contentMappings } from "./sync-content.mjs";

const imageTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const vitePath = (value) => value
  .replaceAll("\\", "/")
  .replace(/^\/@fs\//, "")
  .replace(/^\/(?=[A-Za-z]:\/)/, "");

export default function devContent() {
  return {
    name: "local-content",
    hooks: {
      "astro:config:setup": async ({ command, config, updateConfig, logger }) => {
        if (command !== "dev") return;
        const root = fileURLToPath(config.root);
        const source = process.env.CONTENT_SOURCE_DIR ??
          loadEnv(process.env.NODE_ENV || "development", root, "CONTENT_SOURCE_DIR").CONTENT_SOURCE_DIR;
        if (!source) return;
        const sourceDirectory = resolve(root, source);
        const sourceArticles = resolve(sourceDirectory, "articles");
        const sourceConfig = resolve(sourceDirectory, "config");
        const sourceImages = resolve(sourceDirectory, "images");
        for (const directory of [sourceArticles, sourceConfig, sourceImages]) {
          const directoryStat = await stat(directory).catch(() => undefined);
          if (!directoryStat?.isDirectory()) {
            throw new Error(`内容仓库缺少目录：${directory}`);
          }
        }
        logger.info(`已引用本地内容：${sourceDirectory}`);
        updateConfig({
          vite: {
            plugins: [{
              name: "route-local-content",
              enforce: "pre",
              resolveId(id) {
                const configRoot = vitePath(resolve(root, "src/config"));
                const normalizedId = vitePath(id.split("?")[0]);
                if (normalizedId === configRoot || normalizedId.startsWith(`${configRoot}/`)) {
                  return join(sourceConfig, normalizedId.slice(configRoot.length + 1));
                }
              },
              configureServer(server) {
                let closed = false;
                const reload = (file) => {
                  if (closed || !file) return;
                  if (!contentMappings.some(([name]) =>
                    file === name || file.startsWith(`${name}${sep}`))) return;
                  server.ws.send({ type: "full-reload" });
                };
                const onChange = (file) => reload(relative(sourceDirectory, file));
                server.watcher.add(sourceDirectory);
                server.watcher.on("add", onChange);
                server.watcher.on("change", onChange);
                server.watcher.on("unlink", onChange);
                server.middlewares.use(async (request, response, next) => {
                  const pathname = decodeURIComponent(request.url?.split("?")[0] ?? "");
                  if (!pathname.startsWith("/images/")) return next();
                  const imagePath = resolve(sourceImages, pathname.slice("/images/".length));
                  const imageRelativePath = relative(sourceImages, imagePath);
                  if (imageRelativePath.startsWith(`..${sep}`) || imageRelativePath === "..") {
                    return next();
                  }
                  const imageStat = await stat(imagePath).catch(() => undefined);
                  if (!imageStat?.isFile()) return next();
                  response.setHeader("Content-Type", imageTypes[extname(imagePath).toLowerCase()] ?? "application/octet-stream");
                  createReadStream(imagePath).pipe(response);
                });
                server.httpServer?.once("close", () => {
                  closed = true;
                  server.watcher.off("add", onChange);
                  server.watcher.off("change", onChange);
                  server.watcher.off("unlink", onChange);
                });
              },
            }],
          },
        });
      },
    },
  };
}
