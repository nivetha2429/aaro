import fs from 'fs';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import ContactSettings from '../models/ContactSettings.js';

const BOT_UA = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|msnbot|semrushbot|ahrefsbot|rogerbot|embedly|quora|pinterest|redditbot|slackbot/i;

const DOMAIN = 'https://aarogroups.com';

/**
 * SEO prerender middleware — intercepts bot requests to SPA pages
 * and injects dynamic meta tags + visible content into the HTML
 * so search engines can index the site properly.
 */
export function createSeoMiddleware(indexHtmlPath) {
    let htmlTemplate = '';

    // Read the template once at startup (and re-read if it changes)
    const loadTemplate = () => {
        try { htmlTemplate = fs.readFileSync(indexHtmlPath, 'utf-8'); } catch { /* */ }
    };
    loadTemplate();
    // Re-read every 60s in case of redeploy
    setInterval(loadTemplate, 60_000);

    return async (req, res, next) => {
        const ua = req.headers['user-agent'] || '';

        // Only intercept bot requests to page routes (not API, assets, etc.)
        if (!BOT_UA.test(ua)) return next();
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.match(/\.\w+$/)) return next();

        if (!htmlTemplate) { loadTemplate(); if (!htmlTemplate) return next(); }

        try {
            const seo = await buildSeoData(req.path);
            const html = injectSeo(htmlTemplate, seo);
            res.set('Content-Type', 'text/html');
            res.set('Cache-Control', 'public, max-age=3600');
            res.send(html);
        } catch (err) {
            console.error('SEO prerender error:', err.message);
            next(); // Fall through to normal SPA handler
        }
    };
}

async function buildSeoData(pathname) {
    const seo = {
        title: 'Aaro Groups | Buy Mobile Phones, Laptops & Accessories in Coimbatore',
        description: 'Shop latest mobile phones, laptops, accessories in Coimbatore at best prices. iPhone, Samsung, OnePlus, Realme, Xiaomi. EMI available. WhatsApp order. Aaro Groups.',
        url: `${DOMAIN}${pathname}`,
        image: `${DOMAIN}/og-image.jpg`,
        content: '', // Visible text content for crawlers
    };

    // Home page
    if (pathname === '/') {
        const [products, categories, brands] = await Promise.all([
            Product.find({ featured: true }).limit(20).select('name brand category').lean(),
            Category.find().select('name').lean(),
            Brand.find().select('name').lean(),
        ]);
        seo.content = buildHomeContent(products, categories, brands);
    }
    // Product detail page
    else if (pathname.startsWith('/product/')) {
        const id = pathname.split('/product/')[1];
        if (id) {
            const product = await Product.findById(id).lean();
            if (product) {
                seo.title = `${product.brand} ${product.name} Price in Coimbatore | Aaro Groups`;
                seo.description = `Buy ${product.brand} ${product.name} at best price in Coimbatore. ${(product.condition || 'new') === 'new' ? 'Brand new' : 'Refurbished'} with warranty. EMI available. WhatsApp order. Aaro Groups.`;
                seo.image = product.images?.[0] || seo.image;
                seo.content = buildProductContent(product);
            }
        }
    }
    // Phones page
    else if (pathname === '/phones') {
        const phones = await Product.find({ category: 'phone' }).select('name brand').limit(50).lean();
        seo.title = 'Buy Mobile Phones in Coimbatore | iPhone Samsung OnePlus | Aaro Groups';
        seo.description = 'Buy latest mobile phones at best prices in Coimbatore. iPhone, Samsung, OnePlus, Realme, Xiaomi, Vivo & more. New & refurbished. EMI available. Aaro Groups.';
        seo.content = buildListContent('Mobile Phones', phones);
    }
    // Laptops page
    else if (pathname === '/laptops') {
        const laptops = await Product.find({ category: 'laptop' }).select('name brand').limit(50).lean();
        seo.title = 'Buy Laptops in Coimbatore | HP Dell Lenovo MacBook | Aaro Groups';
        seo.description = 'Buy laptops at best prices in Coimbatore. HP, Dell, Lenovo, ASUS, Apple MacBook. Gaming, business & student laptops. EMI available. Aaro Groups.';
        seo.content = buildListContent('Laptops', laptops);
    }
    // Accessories page
    else if (pathname === '/accessories') {
        const accessories = await Product.find({ category: 'accessory' }).select('name brand').limit(50).lean();
        seo.title = 'Mobile Accessories in Coimbatore | Cases Chargers Earphones | Aaro Groups';
        seo.description = 'Shop phone & laptop accessories at Aaro Groups Coimbatore. Cases, chargers, earbuds, headphones, screen protectors at best prices.';
        seo.content = buildListContent('Accessories', accessories);
    }
    // Shop page
    else if (pathname === '/shop') {
        const count = await Product.countDocuments();
        seo.title = 'Online Mobile & Laptop Shop Coimbatore | Best Deals | Aaro Groups';
        seo.description = `Browse ${count}+ smartphones, laptops & accessories at Aaro Groups. Filter by brand, price & category. Best deals in Coimbatore. EMI available.`;
        seo.content = `<h1>Shop All Products at Aaro Groups Coimbatore</h1><p>${count} products available. Browse mobile phones, laptops, and accessories at the best prices in Coimbatore.</p>`;
    }
    // Brands page
    else if (pathname === '/brands') {
        const brands = await Brand.find().select('name category').lean();
        seo.title = 'All Brands | Mobile Phones & Laptops | Aaro Groups Coimbatore';
        seo.content = `<h1>Shop by Brand at Aaro Groups</h1><ul>${brands.map(b => `<li><a href="/shop?brand=${encodeURIComponent(b.name)}">${b.name}</a></li>`).join('')}</ul>`;
    }
    // Contact page
    else if (pathname === '/contact') {
        const contact = await ContactSettings.findOne().lean();
        seo.title = 'Contact Aaro Groups | Mobile Shop Coimbatore | Phone Number Address';
        if (contact) {
            seo.content = `<h1>Contact Aaro Groups Coimbatore</h1><p>Phone: ${contact.phone}</p><p>Email: ${contact.email}</p><p>Address: ${contact.address}</p>`;
            if (contact.branches?.length) {
                seo.content += contact.branches.map(b => `<div><h2>${b.name}</h2><p>${b.address}</p><p>Phone: ${b.phone}</p><p>Hours: ${b.hours}</p></div>`).join('');
            }
        }
    }

    return seo;
}

function buildHomeContent(products, categories, brands) {
    let html = '<h1>Aaro Groups — Buy Mobile Phones, Laptops & Accessories in Coimbatore</h1>';
    html += '<p>Shop the latest smartphones, laptops, and accessories at the best prices in Coimbatore, Tamil Nadu. We offer iPhone, Samsung, OnePlus, Realme, Xiaomi, HP, Dell, Lenovo, ASUS, and Apple MacBook. EMI options available. WhatsApp ordering. Free shipping and warranty on all products.</p>';

    if (categories.length) {
        html += '<h2>Shop by Category</h2><nav>';
        html += categories.map(c => `<a href="/shop?category=${(c.slug || c.name).toLowerCase()}">${c.name}</a>`).join(' | ');
        html += '</nav>';
    }

    if (brands.length) {
        html += '<h2>Popular Brands</h2><ul>';
        html += brands.map(b => `<li><a href="/shop?brand=${encodeURIComponent(b.name)}">${b.name}</a></li>`).join('');
        html += '</ul>';
    }

    if (products.length) {
        html += '<h2>Featured Products</h2><ul>';
        html += products.map(p => `<li><a href="/product/${p._id}">${p.brand} ${p.name}</a></li>`).join('');
        html += '</ul>';
    }

    return html;
}

function buildProductContent(product) {
    let html = `<h1>${product.brand} ${product.name} — Buy Online at Aaro Groups Coimbatore</h1>`;
    html += `<p>Brand: ${product.brand} | Category: ${product.category} | Condition: ${product.condition || 'new'}</p>`;
    if (product.description) html += `<p>${product.description}</p>`;

    const specs = product.specifications || {};
    const specEntries = Object.entries(specs).filter(([, v]) => v && String(v).trim());
    if (specEntries.length) {
        html += '<h2>Specifications</h2><table>';
        html += specEntries.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
        html += '</table>';
    }

    if (product.features?.length) {
        html += '<h2>Key Features</h2><ul>';
        html += product.features.map(f => `<li>${f}</li>`).join('');
        html += '</ul>';
    }

    html += `<p><a href="/shop">Browse more products at Aaro Groups</a></p>`;
    return html;
}

function buildListContent(category, products) {
    let html = `<h1>Buy ${category} in Coimbatore at Best Prices — Aaro Groups</h1>`;
    html += `<p>Browse ${products.length} ${category.toLowerCase()} available at Aaro Groups Coimbatore. Best prices, EMI available, WhatsApp order.</p>`;
    if (products.length) {
        html += '<ul>';
        html += products.map(p => `<li><a href="/product/${p._id}">${p.brand} ${p.name}</a></li>`).join('');
        html += '</ul>';
    }
    return html;
}

function injectSeo(html, seo) {
    // Replace title
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(seo.title)}</title>`);

    // Replace meta description
    html = html.replace(
        /<meta name="description" content="[^"]*"/,
        `<meta name="description" content="${escAttr(seo.description)}"`
    );

    // Replace OG tags
    html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escAttr(seo.title)}"`);
    html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escAttr(seo.description)}"`);
    html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escAttr(seo.url)}"`);
    html = html.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escAttr(seo.image)}"`);

    // Replace Twitter tags
    html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escAttr(seo.title)}"`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escAttr(seo.description)}"`);

    // Replace canonical
    html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escAttr(seo.url)}"`);

    // Inject crawlable content before </body> (visible to bots, hidden from users via React takeover)
    if (seo.content) {
        const seoBlock = `<div id="seo-content" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">${seo.content}</div>`;
        html = html.replace('</body>', `${seoBlock}\n</body>`);
    }

    return html;
}

function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
