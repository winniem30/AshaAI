import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
  },

  tanstackStart: {
    server: { entry: "server" },
  },

  vite: {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL || ''
      ),
    },
  },
});