import type { MetadataRoute } from 'next';

const siteUrl = 'https://jscdn.wuxit.cn';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/waf'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
