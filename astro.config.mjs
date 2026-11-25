import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { imageSize } from 'image-size';
import fs from 'node:fs';
import path from 'node:path';

// 文章 Markdown 图片：懒加载 + 构建时读出真实宽高写进属性，消除加载跳动（CLS），
// 并将带 alt 说明的独立图片段落自动升级为合法语义的 <figure><figcaption> 结构。
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

    if (node.tagName === 'p' && Array.isArray(node.children)) {
      const meaningful = node.children.filter(
        (child) => !(child.type === 'text' && !child.value.trim()),
      );
      if (meaningful.length === 1 && meaningful[0].tagName === 'img') {
        const img = meaningful[0];
        const alt = typeof img.properties?.alt === 'string' ? img.properties.alt.trim() : '';
        if (alt) {
          node.tagName = 'figure';
          node.properties = { className: ['article-figure'] };
          node.children = [
            img,
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: alt }],
            },
          ];
        }
      }
    }
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
