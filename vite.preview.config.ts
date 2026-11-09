import { defineConfig } from "vite";
import path from "node:path";
const r = (p: string) => path.resolve(__dirname, p);
export default defineConfig({
  define: { "process.env.NODE_ENV": '"production"' },
  resolve: {
    alias: [
      { find: "@/lib/studio.functions", replacement: r("preview/fns.ts") },
      { find: "@/integrations/supabase/client", replacement: r("preview/supabase.ts") },
      { find: "@tanstack/react-start", replacement: r("preview/start.ts") },
      { find: /^@\//, replacement: r("src") + "/" },
    ],
  },
  build: {
    lib: {
      entry: r("preview/main.tsx"),
      name: "Preview",
      formats: ["iife"],
      fileName: () => "p.js",
    },
    outDir: "preview-dist",
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
