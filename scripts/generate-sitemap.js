const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://chenn-ai.vercel.app';
const OUT_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_PATH = path.join(OUT_DIR, 'sitemap.xml');

// Define your static routes here
const routes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/home', changefreq: 'daily', priority: '0.9' },
    { path: '/services', changefreq: 'weekly', priority: '0.8' },
    { path: '/chennai-gethu', changefreq: 'daily', priority: '0.9' },
    { path: '/live', changefreq: 'always', priority: '0.7' },
];

const generateSitemap = () => {
    const currentDate = new Date().toISOString().split('T')[0];

    const urlElements = routes
        .map((route) => {
            return `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
        })
        .join('\n');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

    try {
        fs.writeFileSync(SITEMAP_PATH, sitemapContent);
        console.log(`✅ Sitemap generated successfully at ${SITEMAP_PATH}`);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
};

generateSitemap();
