import { Router } from 'express';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

const router = Router();

const DOMAIN = 'https://aarogroups.com';

const staticPages = [
    { path: '/',             priority: '1.0', changefreq: 'daily' },
    { path: '/shop',         priority: '0.9', changefreq: 'daily' },
    { path: '/phones',       priority: '0.9', changefreq: 'daily' },
    { path: '/laptops',      priority: '0.9', changefreq: 'daily' },
    { path: '/accessories',  priority: '0.8', changefreq: 'daily' },
    { path: '/brands',       priority: '0.7', changefreq: 'weekly' },
    { path: '/offers',       priority: '0.8', changefreq: 'daily' },
    { path: '/community',    priority: '0.6', changefreq: 'weekly' },
    { path: '/contact',      priority: '0.7', changefreq: 'monthly' },
];

const today = () => new Date().toISOString().split('T')[0];

router.get('/', async (_req, res) => {
    try {
        const [products, brands] = await Promise.all([
            Product.find({}, '_id updatedAt').lean(),
            Brand.find({}, 'name slug updatedAt').lean(),
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        for (const page of staticPages) {
            xml += `  <url>\n    <loc>${DOMAIN}${page.path}</loc>\n    <lastmod>${today()}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
        }

        // Product pages
        for (const p of products) {
            const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : today();
            xml += `  <url>\n    <loc>${DOMAIN}/product/${p._id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }

        // Brand pages
        for (const b of brands) {
            const lastmod = b.updatedAt ? new Date(b.updatedAt).toISOString().split('T')[0] : today();
            xml += `  <url>\n    <loc>${DOMAIN}/shop?brand=${encodeURIComponent(b.name)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch {
        res.status(500).set('Content-Type', 'application/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

export default router;
