import { getCollection, type CollectionEntry } from 'astro:content';
import { WEEK_META, type WeekMeta } from './site';

export type PostEntry = CollectionEntry<'posts'>;

export interface WeekGroup extends WeekMeta {
  posts: PostEntry[];
}

export interface TagInfo {
  tag: string;
  slug: string;
  count: number;
  posts: PostEntry[];
}

export interface ReadingStats {
  wordCount: number;
  minutes: number;
  imageCount: number;
  h2Headings: string[];
}

/**
 * 23 个既有主题标签的干净 ASCII 语义 slug 映射，确保 URL 稳定可读。
 */
export const TAG_SLUGS: Record<string, string> = {
  '网络安全': 'cybersecurity',
  'Kali Linux': 'kali-linux',
  Docker: 'docker',
  DVWA: 'dvwa',
  'Burp Suite': 'burp-suite',
  Wireshark: 'wireshark',
  HTTPS: 'https',
  SSH: 'ssh',
  DNS: 'dns',
  Nmap: 'nmap',
  '漏洞分析': 'vulnerability-analysis',
  '侦察': 'reconnaissance',
  'SQL 注入': 'sql-injection',
  '注入风险': 'injection-risk',
  XSS: 'xss',
  '文件上传': 'file-upload',
  '综合渗透': 'pentest-practice',
  '渗透报告': 'pentest-report',
  '盲注': 'blind-sqli',
  '报错注入': 'error-based-sqli',
  'WAF 绕过': 'waf-bypass',
  '二次注入': 'second-order-sqli',
  '宽字节': 'wide-byte-sqli',
};

export function tagToSlug(tag: string): string {
  if (TAG_SLUGS[tag]) return TAG_SLUGS[tag];
  const ascii = tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii || 'tag';
}

export function parseDayNumber(id: string): number | null {
  const match = /^day-(\d+)$/i.exec(id);
  return match ? Number(match[1]) : null;
}

export function formatDayLabel(id: string): string {
  const day = parseDayNumber(id);
  return day !== null ? `DAY ${String(day).padStart(2, '0')}` : 'NOTE';
}

export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTopicTags(post: PostEntry): string[] {
  return (post.data.tags ?? []).filter((tag) => !/^Week\s+\d+$/i.test(tag));
}

export function getPostWeek(post: PostEntry): WeekMeta | null {
  const weekTag = (post.data.tags ?? []).find((tag) => /^Week\s+\d+$/i.test(tag));
  if (!weekTag) return null;
  const weekNumber = Number(weekTag.replace(/^Week\s+/i, ''));
  if (!Number.isFinite(weekNumber) || weekNumber <= 0) return null;
  return (
    WEEK_META.find((item) => item.week === weekNumber) ?? {
      week: weekNumber,
      label: `Week ${weekNumber}`,
      stage: '专题学习',
      summary: `Week ${weekNumber} 学习笔记。`,
    }
  );
}

function comparePosts(a: PostEntry, b: PostEntry, order: 'asc' | 'desc'): number {
  const dayA = parseDayNumber(a.id);
  const dayB = parseDayNumber(b.id);
  let diff = 0;

  if (dayA !== null && dayB !== null) {
    diff = dayA - dayB;
  } else if (dayA !== null) {
    diff = -1;
  } else if (dayB !== null) {
    diff = 1;
  } else {
    diff = a.data.pubDate.getTime() - b.data.pubDate.getTime();
    if (diff === 0) diff = a.id.localeCompare(b.id);
  }

  return order === 'asc' ? diff : -diff;
}

export async function getPublishedPosts(order: 'asc' | 'desc' = 'asc'): Promise<PostEntry[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => comparePosts(a, b, order));
}

export function getWeekGroups(posts: PostEntry[]): { groups: WeekGroup[]; uncategorized: PostEntry[] } {
  const byWeek = new Map<number, PostEntry[]>();
  const uncategorized: PostEntry[] = [];

  for (const post of posts) {
    const weekMeta = getPostWeek(post);
    if (!weekMeta) {
      uncategorized.push(post);
      continue;
    }
    const list = byWeek.get(weekMeta.week) ?? [];
    list.push(post);
    byWeek.set(weekMeta.week, list);
  }

  const weekNumbers = new Set<number>([...WEEK_META.map((w) => w.week), ...byWeek.keys()]);
  const groups: WeekGroup[] = [...weekNumbers]
    .sort((a, b) => a - b)
    .map((week) => {
      const meta = WEEK_META.find((item) => item.week === week) ?? {
        week,
        label: `Week ${week}`,
        stage: '专题学习',
        summary: `Week ${week} 学习笔记。`,
      };
      return {
        ...meta,
        posts: byWeek.get(week) ?? [],
      };
    });

  return { groups, uncategorized };
}

export function getAllTags(posts: PostEntry[]): TagInfo[] {
  const map = new Map<string, PostEntry[]>();
  for (const post of posts) {
    for (const tag of getTopicTags(post)) {
      const list = map.get(tag) ?? [];
      list.push(post);
      map.set(tag, list);
    }
  }

  return [...map.entries()]
    .map(([tag, taggedPosts]) => ({
      tag,
      slug: tagToSlug(tag),
      count: taggedPosts.length,
      posts: [...taggedPosts].sort((a, b) => comparePosts(a, b, 'asc')),
    }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export function estimateReadingStats(rawBody?: string): ReadingStats {
  const body = rawBody ?? '';
  const imageCount = (body.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length;

  // 提取代码围栏外的二级标题，避免把 bash/python 注释误识别为标题。
  const h2Headings: string[] = [];
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      const h2Match = /^##\s+(.+)$/.exec(line.trim());
      if (h2Match) h2Headings.push(h2Match[1].trim());
    }
  }

  const stripped = body
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?|```/g, ' '))
    .replace(/[`#>*_\-|[\]()]/g, ' ');

  const cjkChars = (stripped.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
  const asciiWords = (stripped.match(/[A-Za-z0-9_]+/g) ?? []).length;
  const wordCount = cjkChars + asciiWords;
  const minutes = Math.max(1, Math.ceil(wordCount / 320));

  return { wordCount, minutes, imageCount, h2Headings };
}

export function getAdjacentPosts(
  posts: PostEntry[],
  currentId: string,
): { previousPost?: PostEntry; nextPost?: PostEntry } {
  const currentDay = parseDayNumber(currentId);
  if (currentDay !== null) {
    const previousPost = posts.find((entry) => parseDayNumber(entry.id) === currentDay - 1);
    const nextPost = posts.find((entry) => parseDayNumber(entry.id) === currentDay + 1);
    if (previousPost || nextPost) return { previousPost, nextPost };
  }

  const index = posts.findIndex((entry) => entry.id === currentId);
  if (index === -1) return {};
  return {
    previousPost: index > 0 ? posts[index - 1] : undefined,
    nextPost: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export function getSameWeekPosts(posts: PostEntry[], currentPost: PostEntry): PostEntry[] {
  const weekMeta = getPostWeek(currentPost);
  if (!weekMeta) return [];
  const weekTag = `Week ${weekMeta.week}`;
  return posts.filter((entry) => entry.data.tags.includes(weekTag));
}
