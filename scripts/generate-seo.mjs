import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const BASE = 'https://www.justindematteis.com';
const SITE_KEY = 'justindematteis';
const SUPABASE_URL = 'https://nowsajdmbpxvlvrhopjg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AZbVouJ6gN00dQGdZwPjog_GTQR0J-w';

const routeMeta = {
  '/': {
    title: 'Justin DeMatteis — Developer, Product Builder & AI-Assisted Problem Solver',
    description: 'Justin DeMatteis builds web applications, Shopify tools, ecommerce systems and AI-assisted digital products that solve real business problems.',
    type: 'ProfilePage',
  },
  '/work': {
    title: 'Web, Shopify & Ecommerce Work | Justin DeMatteis',
    description: 'Selected work by Justin DeMatteis across Shopify, ecommerce, custom web applications, internal tools and real business workflows.',
    type: 'CollectionPage',
  },
  '/work/justconsignin': {
    title: 'JustConsignIn Case Study | Shopify Consignment Software | Justin DeMatteis',
    description: 'Case study: how Justin DeMatteis designed and built JustConsignIn, a Shopify consignment application connecting intake, products, POS sales, commissions and payouts.',
    type: 'WebPage',
    projectName: 'JustConsignIn',
  },
  '/work/jill-and-the-beanstalk': {
    title: 'Jill & The Beanstalk Case Study | Shopify SEO & Ecommerce Growth',
    description: 'Shopify ecommerce, SEO, content, search visibility and growth work by Justin DeMatteis for Jill & The Beanstalk.',
    type: 'WebPage',
    projectName: 'Jill & The Beanstalk',
  },
  '/work/wheels-automotive': {
    title: 'Wheels Automotive Case Study | Adobe Commerce & Magento B2B',
    description: 'Adobe Commerce and Magento B2B ecommerce case study covering frontend work, PageBuilder, QA, SEO, product content and launch support.',
    type: 'WebPage',
    projectName: 'Wheels Automotive Dealer Supplies',
  },
  '/work/wordpress-websites': {
    title: 'WordPress Website Projects | Elementor, SEO & Responsive Development',
    description: 'WordPress and Elementor client website work by Justin DeMatteis, including responsive builds, forms, SEO, content integration and ongoing support.',
    type: 'WebPage',
    projectName: 'WordPress Client Websites',
  },
  '/about': {
    title: 'About Justin DeMatteis | Developer, Product Builder & Ecommerce',
    description: 'Justin DeMatteis combines an engineering and manufacturing background with web development, ecommerce, Shopify, Adobe Commerce and AI-assisted product development.',
    type: 'ProfilePage',
  },
  '/ai-development': {
    title: 'AI-Assisted Software Development | Justin DeMatteis',
    description: 'How Justin DeMatteis uses AI for research, architecture, prototyping, coding, debugging and iteration while keeping product decisions human-led.',
    type: 'WebPage',
  },
  '/experience': {
    title: 'Development Experience & Skills | Justin DeMatteis',
    description: 'Web, mobile, Shopify, Adobe Commerce, React, JavaScript, TypeScript, Node, PHP, MySQL, Supabase and ecommerce development experience.',
    type: 'WebPage',
  },
  '/blog': {
    title: 'Development Blog | Justin DeMatteis',
    description: 'Development notes, project case studies, ecommerce work and lessons from building practical software products.',
    type: 'Blog',
  },
  '/contact': {
    title: 'Contact Justin DeMatteis | Web & Ecommerce Developer',
    description: 'Contact Justin DeMatteis about web development, ecommerce, Shopify, product development, collaboration and selected projects.',
    type: 'ContactPage',
  },
};

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const xml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

function personSchema() {
  return {
    '@type': 'Person',
    '@id': `${BASE}/#person`,
    name: 'Justin DeMatteis',
    url: BASE,
    jobTitle: 'Web & Mobile Developer',
    description: 'Developer, product builder and ecommerce specialist building practical digital products around real business workflows.',
    knowsAbout: [
      'Web Development',
      'Mobile Development',
      'Shopify',
      'Shopify POS',
      'Ecommerce',
      'Adobe Commerce',
      'Magento',
      'React',
      'JavaScript',
      'TypeScript',
      'Node.js',
      'Supabase',
      'Artificial Intelligence assisted software development'
    ],
  };
}

function baseGraph(route, meta) {
  const graph = [
    personSchema(),
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: `${BASE}/`,
      name: 'Justin DeMatteis — JUST INNOVATE.',
      inLanguage: 'en-CA',
      author: { '@id': `${BASE}/#person` },
    },
    {
      '@type': meta.type || 'WebPage',
      '@id': `${BASE}${route === '/' ? '/' : route}#webpage`,
      url: `${BASE}${route === '/' ? '/' : route}`,
      name: meta.title,
      description: meta.description,
      inLanguage: 'en-CA',
      isPartOf: { '@id': `${BASE}/#website` },
      about: { '@id': `${BASE}/#person` },
    },
  ];

  if (meta.projectName) {
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${BASE}${route}#project`,
      name: meta.projectName,
      description: meta.description,
      url: `${BASE}${route}`,
      creator: { '@id': `${BASE}/#person` },
      mainEntityOfPage: { '@id': `${BASE}${route}#webpage` },
      inLanguage: 'en-CA',
    });
  }

  if (route !== '/') {
    const crumbs = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
    ];
    if (route.startsWith('/work/')) {
      crumbs.push({ '@type': 'ListItem', position: 2, name: 'Work', item: `${BASE}/work` });
      crumbs.push({ '@type': 'ListItem', position: 3, name: meta.projectName || meta.title.split('|')[0].trim(), item: `${BASE}${route}` });
    } else {
      crumbs.push({ '@type': 'ListItem', position: 2, name: meta.title.split('|')[0].trim(), item: `${BASE}${route}` });
    }
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs,
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function seoBlock(route, meta, schema, robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1') {
  const canonical = `${BASE}${route === '/' ? '/' : route}`;
  return `<!-- SEO:START -->
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="Justin DeMatteis — JUST INNOVATE." />
    <meta property="og:locale" content="en_CA" />
    <meta property="og:type" content="${meta.ogType || 'website'}" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <script id="route-schema" type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
    <!-- SEO:END -->`;
}

async function supabase(table, query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!response.ok) return [];
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

async function writeRoute(route, html) {
  if (route === '/') {
    await fs.writeFile(path.join(DIST, 'index.html'), html);
    return;
  }

  const dir = path.join(DIST, route.replace(/^\//, ''));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), html);
}

const sourceHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
const marker = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/;

const pages = await supabase(
  'site_pages',
  `select=page_id,path,updated_at&site_key=eq.${encodeURIComponent(SITE_KEY)}`
);
const pageLastmod = new Map(pages.map(p => [p.path, p.updated_at]));

const blogs = await supabase(
  'blog_posts',
  `select=slug,title,excerpt,seo_title,seo_description,featured_image,published_at,updated_at&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&order=published_at.desc`
);

const sitemapEntries = [];

for (const [route, meta] of Object.entries(routeMeta)) {
  const schema = baseGraph(route, meta);
  const html = sourceHtml.replace(marker, seoBlock(route, meta, schema));
  await writeRoute(route, html);
  sitemapEntries.push({
    loc: `${BASE}${route === '/' ? '/' : route}`,
    lastmod: pageLastmod.get(route) || new Date().toISOString(),
    priority: route === '/' ? '1.0' : route === '/work' ? '0.9' : '0.7',
  });
}

for (const post of blogs) {
  const route = `/blog/${post.slug}`;
  const meta = {
    title: post.seo_title || `${post.title} | Justin DeMatteis`,
    description: post.seo_description || post.excerpt || 'Development article by Justin DeMatteis.',
    ogType: 'article',
  };
  const canonical = `${BASE}${route}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      personSchema(),
      {
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        headline: post.title,
        description: meta.description,
        url: canonical,
        mainEntityOfPage: canonical,
        author: { '@id': `${BASE}/#person` },
        datePublished: post.published_at || undefined,
        dateModified: post.updated_at || post.published_at || undefined,
        image: post.featured_image || undefined,
        inLanguage: 'en-CA',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  };
  await writeRoute(route, sourceHtml.replace(marker, seoBlock(route, meta, schema)));
  sitemapEntries.push({
    loc: canonical,
    lastmod: post.updated_at || post.published_at || new Date().toISOString(),
    priority: '0.6',
  });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `  <url>
    <loc>${xml(entry.loc)}</loc>
    <lastmod>${xml(new Date(entry.lastmod).toISOString())}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

const rssItems = blogs.map(post => {
  const url = `${BASE}/blog/${post.slug}`;
  return `  <item>
    <title>${xml(post.title)}</title>
    <link>${xml(url)}</link>
    <guid>${xml(url)}</guid>
    <description>${xml(post.excerpt || post.seo_description || '')}</description>
    ${post.published_at ? `<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>` : ''}
  </item>`;
}).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Justin DeMatteis Development Blog</title>
  <link>${BASE}/blog</link>
  <description>Development notes, project case studies and lessons from building practical software products.</description>
  <language>en-ca</language>
${rssItems}
</channel>
</rss>
`;
await fs.writeFile(path.join(DIST, 'rss.xml'), rss);

const notFoundMeta = {
  title: 'Page Not Found | Justin DeMatteis',
  description: 'The requested page could not be found.',
};
const notFoundSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Page Not Found',
  url: `${BASE}/404`,
};
await fs.writeFile(
  path.join(DIST, '404.html'),
  sourceHtml.replace(marker, seoBlock('/404', notFoundMeta, notFoundSchema, 'noindex,nofollow'))
);

console.log(`SEO generated: ${Object.keys(routeMeta).length} pages, ${blogs.length} blog posts, sitemap, RSS and 404.`);
