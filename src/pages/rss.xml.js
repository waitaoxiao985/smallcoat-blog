import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.id.localeCompare(a.id));

export function GET(context) {
  return rss({
    title: 'SmalLCoat — 以代码为笔，探索技术的无限可能。',
    description: 'SmalLCoat 的个人技术博客，记录编程实践与网络安全学习。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/posts/${post.id}/`,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
