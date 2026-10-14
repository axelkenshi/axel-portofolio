// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
// rss & sitemap
import sitemap from "@astrojs/sitemap";

// custom remark plugin to embed YouTube videos
function remarkEmbed() {
  return (tree) => {
    visit(tree, (node) => {
      // 🎯 KOREKSI 2: Pastikan tipe node adalah directive terlebih dahulu agar tidak memicu crash di node biasa
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        // Gunakan optional chaining (?.) untuk membaca property attributes secara aman
        if (node.name === "embed" && node.attributes?.url?.includes("youtu")) {
          const url = node.attributes.url;
          const videoId = url
            .split(/v=|youtu\.be\/|\/embed\//)[1]
            ?.split(/[?&]/)[0];

          if (videoId) {
            node.type = "html";
            node.value = `
              <div class="w-full my-6">
                <iframe
                  src="https://www.youtube.com/embed/${videoId}"
                  class="w-full aspect-video rounded-2xl border border-zinc-800/50 shadow-lg block"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>`;
          }
        }
      }
    });
  };
}

// Custom remark plugin to handle callout directives (:::tip, :::note, etc.)
function remarkCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      // Kita hanya mengincar containerDirective (:::nama-blok)
      if (node.type === "containerDirective") {
        const name = node.name.toLowerCase();
        const allowedTypes = ["tip", "note", "alert", "important", "dangerous"];

        if (allowedTypes.includes(name)) {
          // Pemetaan tema warna border & background (Kompatibel dengan tema gelap zinc milikmu)
          const styles = {
            note: "border-blue-500 bg-blue-500/5 text-blue-200/90",
            tip: "border-emerald-500 bg-emerald-500/5 text-emerald-200/90",
            alert: "border-amber-500 bg-amber-500/5 text-amber-200/90",
            important: "border-purple-500 bg-purple-500/5 text-purple-200/90",
            dangerous: "border-rose-500 bg-rose-500/5 text-rose-200/90",
          };

          // Pemetaan warna teks khusus untuk Judul Label atas
          const titleColors = {
            note: "text-blue-400",
            tip: "text-emerald-400",
            alert: "text-amber-400",
            important: "text-purple-400",
            dangerous: "text-rose-400",
          };

          // Ubah runtime AST menjadi elemen HTML <div> dengan class Tailwind
          node.data = node.data || {};
          node.data.hName = "div";
          node.data.hProperties = {
            class: `p-4 my-6 rounded-r-xl border-l-4 font-sans text-sm space-y-1 ${styles[name]}`,
          };

          // Suntikkan node paragraf baru di urutan paling atas sebagai Title Label
          const titleNode = {
            type: "paragraph",
            data: {
              hName: "p",
              hProperties: {
                class: `font-bold tracking-wide uppercase text-xs flex items-center gap-1.5 ${titleColors[name]}`,
              },
            },
            children: [{ type: "text", value: name === "dangerous" ? "⚠️ DANGER" : name }],
          };

          // Masukkan judul ke baris pertama di dalam kontainer
          node.children.unshift(titleNode);
        }
      }
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
    remarkPlugins: [remarkDirective, remarkEmbed, remarkCallouts],
  },
  integrations: [svelte(),sitemap()],
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
