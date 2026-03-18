import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

const DOMAIN = 'https://aarogroups.com';

const staticPages = [
    { path: '/',            priority: '1.0', changefreq: 'daily' },
    { path: '/shop',        priority: '0.9', changefreq: 'daily' },
    { path: '/phones',      priority: '0.9', changefreq: 'daily' },
    { path: '/laptops',     priority: '0.9', changefreq: 'daily' },
    { path: '/accessories',  priority: '0.9', changefreq: 'daily' },
    { path: '/brands',      priority: '0.7', changefreq: 'weekly' },
    { path: '/contact',     priority: '0.7', changefreq: 'monthly' },
    { path: '/community',   priority: '0.7', changefreq: 'weekly' },
];

router.get('/', async (_req, res) => {
    try {
        const products = await Product.find({}, '_id updatedAt').lean();

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        for (const page of staticPages) {
            xml += '  <url>\n';
            xml += `    <loc>${DOMAIN}${page.path}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        }

        // Product pages
        for (const product of products) {
            const lastmod = product.updatedAt
                ? new Date(product.updatedAt).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            xml += '  <url>\n';
            xml += `    <loc>${DOMAIN}/product/${product._id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.6</priority>\n`;
            xml += '  </url>\n';
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).set('Content-Type', 'application/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

export default router;
