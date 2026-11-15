// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app may break with duplicate plugins:
//   - TanStack devtools, tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     Nitro, VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection.
// Keep the Lovable helper so the Lovable preview remains configured as before.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

export default defineConfig({
  tanstackStart: {
    // Keep the custom SSR error wrapper used by this project.
    server: { entry: "server" },
  },
  // Lovable keeps its existing default target; Vercel gets Nitro's Vercel preset.
  nitro: isVercel ? { preset: "vercel" } : undefined,
});
