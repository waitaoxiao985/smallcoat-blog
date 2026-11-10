import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { imageSize } from 'image-size';
import fs from 'node:fs';
import path from 'node:path';

// 文章 Markdown 图片：懒加载 + 构建时读出真实宽高写进属性，消除加载跳动（CLS）。
const rehypeImageMeta = () => (tree) => {
  const walk = (node) => {
    if (node.tagName === 'img') {
      const props = node.properties;
      if (!props.loading) props.loading = 'lazy';
      if (!props.decoding) props.decoding = 'async';
      const src = typeof props.src === 'string' ? props.src : '';
      if (src.startsWith('/') && !props.width) {
        try {
          const file = path.join(process.cwd(), 'public', src);
          const size = imageSize(fs.readFileSync(file));
          props.width = size.width;
          props.height = size.height;
        } catch {
          // 读不到尺寸的图跳过，只保留懒加载。
        }
      }
    }
    (node.children || []).forEach(walk);
  };
  walk(tree);
};

export default defineConfig({
  site: 'https://smallcoat-blog.vercel.app',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // 紫蓝底色主题，与全站深紫配色呼应。
      theme: 'tokyo-night',
    },
    rehypePlugins: [rehypeImageMeta],
  },
});
