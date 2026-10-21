// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { remarkAlert } from 'remark-github-blockquote-alert';
import { join, resolve } from 'node:path';
import { loadEnv } from 'vite';
import devContent from './scripts/dev-content.mjs';

// https://astro.build/config
const projectRoot = process.cwd();
const env = loadEnv(process.env.NODE_ENV || 'development', projectRoot, 'CONTENT_SOURCE_DIR');
const contentSource = process.env.CONTENT_SOURCE_DIR ?? env.CONTENT_SOURCE_DIR;
const configDirectory = resolve(
  projectRoot,
  contentSource ? contentSource : '.',
  contentSource ? 'config' : 'src/config',
).replaceAll('\\', '/');

const configAlias = [{
    find: /^@content-config\/(.*)$/,
    replacement: `${configDirectory}/$1`,
}];

export default defineConfig({
    site: process.env.PUBLIC_SITE_URL,
    integrations: [devContent()],
    vite: {
      plugins: [{
        name: 'external-content-config',
        enforce: 'pre',
        resolveId(id) {
          if (id.startsWith('@content-config/')) {
            return join(configDirectory, id.slice('@content-config/'.length));
          }
        },
      }],
      resolve: {
        alias: configAlias,
      },
    },
    markdown: {
      processor: unified({
        remarkPlugins: [remarkGfm, remarkMath, [remarkAlert, { legacyTitle: true }]],
        rehypePlugins: [rehypeKatex],
      }),
    },
});
