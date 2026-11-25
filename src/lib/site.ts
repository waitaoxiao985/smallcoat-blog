export interface ProjectItem {
  name: string;
  description: string;
  tech: string;
  href: string;
  number: string;
}

export interface WeekMeta {
  week: number;
  label: string;
  stage: string;
  summary: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export const SITE = {
  name: 'SmalLCoat',
  title: 'SmalLCoat — 以代码为笔，探索技术的无限可能。',
  description: 'SmalLCoat 的个人技术博客，记录编程实践与网络安全学习。',
  url: 'https://smallcoat-blog.vercel.app',
  github: 'https://github.com/waitaoxiao985',
  handle: '@waitaoxiao985',
  author: 'SmalLCoat',
} as const;

export const PROJECTS: ProjectItem[] = [
  {
    name: 'SecGuard',
    description: '轻量级主机安全监控平台，探索 SIEM / XDR 的实践。',
    tech: 'JAVA · SECURITY',
    href: 'https://github.com/waitaoxiao985/SecGuard',
    number: '01',
  },
  {
    name: 'dengbao-assessment-practice',
    description: '等保 2.0 测评练习，整理等级保护测评的流程与实践要点。',
    tech: 'PYTHON · SECURITY',
    href: 'https://github.com/waitaoxiao985/dengbao-assessment-practice',
    number: '02',
  },
  {
    name: 'AI_APP',
    description: '关于 AI 的知识百科 App，把 AI 学习装进手机里。',
    tech: 'JAVASCRIPT · AI',
    href: 'https://github.com/waitaoxiao985/AI_APP',
    number: '03',
  },
];

export const WEEK_META: WeekMeta[] = [
  {
    week: 1,
    label: '破冰与实验环境',
    stage: '第一阶段 · 基础建设',
    summary: 'Kali 隔离靶场、Docker、Burp Suite 抓包、Wireshark、HTTPS 与 SSH 基线。',
  },
  {
    week: 2,
    label: '信息搜集与侦察',
    stage: '第一阶段 · 资产测绘',
    summary: 'WHOIS / DNS 枚举、Nmap 端口与脚本扫描、目录探测与漏洞分析。',
  },
  {
    week: 3,
    label: '注入风险与验证',
    stage: '第一阶段 · 注入入门',
    summary: 'SQL 注入原理、Union 联合查询、信息收集与手工验证流程。',
  },
  {
    week: 4,
    label: '客户端与服务端安全',
    stage: '第一阶段 · 漏洞专题',
    summary: 'XSS 反射/存储/DOM 型漏洞、文件上传绕过、CSRF 与服务端利用。',
  },
  {
    week: 5,
    label: '第一阶段收官',
    stage: '第一阶段 · 综合实战',
    summary: '端到端综合渗透测试演练与标准化渗透测试报告撰写。',
  },
  {
    week: 6,
    label: 'SQL 注入进阶',
    stage: '第二阶段 · 攻坚深入',
    summary: '布尔盲注、时间盲注、报错注入、WAF 绕过、二次注入与宽字节注入。',
  },
];

export const ABOUT_SKILLS: SkillGroup[] = [
  {
    category: '编程与工程',
    items: ['Python（深入中）', 'C', 'Java', 'PHP', 'TypeScript / Astro'],
  },
  {
    category: '安全研究方向',
    items: ['Web 安全', 'SQLi / XSS 原理与绕过', 'CTF 实战', '等保 2.0 测评', 'SIEM / XDR 监控'],
  },
  {
    category: '常用工具栈',
    items: ['Kali Linux', 'Burp Suite', 'Nmap', 'Wireshark', 'Docker', 'SQLi-Labs / DVWA'],
  },
];
