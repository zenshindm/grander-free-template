// @ts-check
import { defineConfig } from "astro/config";
import websiteSetting from "./src/features/websiteSetting.json";
import tailwindcss from "@tailwindcss/vite";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: websiteSetting.websiteUrl,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    sitemap({
      filter: (page) => {
        const excludedPaths = websiteSetting.sitemapExcluded;
        const path = page.replace(websiteSetting.websiteUrl, "");
        return !excludedPaths.includes(path);
      },
    })
  ],
  image: {
    domains: websiteSetting.listOfAuthrizedImgDomain,
  },
  devToolbar: {
    enabled: false,
  },
});
