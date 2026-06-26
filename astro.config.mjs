import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.boringworks.se",
  vite: {
    plugins: [tailwindcss()],
  },
});
