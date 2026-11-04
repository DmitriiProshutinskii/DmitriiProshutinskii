import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// `vite build --mode artifact` inlines everything into one HTML file for a quick shareable preview.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), tailwindcss(), ...(mode === "artifact" ? [viteSingleFile()] : [])],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: mode === "artifact" ? { outDir: "dist-artifact" } : {},
}))
