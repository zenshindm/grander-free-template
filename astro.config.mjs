// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import websiteSetting from "./src/features/websiteSetting.json";
import tailwindcss from "@tailwindcss/vite";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";

const providerMap = {
  google: fontProviders.google(),
  fontsource: fontProviders.fontsource(),
  bunny: fontProviders.bunny(),
  fontshare: fontProviders.fontshare(),
};

/** @param {string} [name] */
function getProvider(name = "google") {
  const map = /** @type {Record<string, any>} */ (providerMap);
  if (name && !map[name]) {
    name = "google";
  }
  return map[name] ?? fontProviders.fontsource();
}

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: websiteSetting.websiteUrl,
  fonts: [
    {
      provider: getProvider(websiteSetting.bodyFont.source),
      name: websiteSetting.bodyFont.name,
      cssVariable: "--font-body",
      weights: ["100 900"],
    },
    {
      provider: getProvider(websiteSetting.headerFont.source),
      name: websiteSetting.headerFont.name,
      cssVariable: "--font-heading",
      weights: ["100 900"],
    },
  ],
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
    }),
  ],
  image: {
    domains: websiteSetting.listOfAuthrizedImgDomain,
  },
  devToolbar: {
    enabled: false,
  },
});
