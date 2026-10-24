// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from 'astro-expressive-code';
// Astro markdown new pipeline
import { unified } from "@astrojs/markdown-remark";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
// rss & sitemap
import sitemap from "@astrojs/sitemap";

// Custom single bacticks rendering
function remarkCleanInlineCode() {
  return (tree) => {
    visit(tree, 'inlineCode', (node) => {
      // Kita ubah tipe node agar di-render sebagai HTML custom
      node.type = 'html';
      node.value = `<span class="inline-code">${node.value}</span>`;
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://axelkenshi.my.id",
  devToolbar: {
    enabled: false,
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, remarkCleanInlineCode],
    }),
  },
  integrations: [
    svelte(),
    sitemap(), 
    expressiveCode({
    themes: ['github-dark'],
  }),
  ],
  prefetch: {
    prefetchAll: false, // Hanya prefetch link dengan data-astro-prefetch
    defaultStrategy: "hover", // download HTML saat user hover link
  },
  build: {
    inlineStylesheets: "always", // Inline CSS < 4KB untuk eliminate render-blocking
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      minify: "esbuild",
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "assets/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
  },
});