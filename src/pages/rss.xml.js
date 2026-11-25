import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/posts';
import { SITE } from '../lib/site';

export async function GET(context) {
  const posts = await getPublishedPosts('desc');
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/posts/${post.id}/`,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
    })),
    customData: `<language>zh-CN</language><copyright>© ${new Date().getUTCFullYear()} ${SITE.author}</copyright>`,
  });
}
