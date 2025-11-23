// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
    integrations: [mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }), react()],
    site: 'https://username.github.io',
    build: {
      assets: '_astro'
    },
    vite: {
      build: {
        assetsInlineLimit: 0
      }
    }
});
