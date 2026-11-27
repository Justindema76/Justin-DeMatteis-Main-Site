// One source of truth for Shopify Studio: business details, the design showcase list,
// SEO wording and the footer. Pages, the footer, structured data, emails and the build-time
// SEO script all read from here. Anything here can be overridden from the admin
// (Website → Shopify Studio → Business & SEO), saved in the "global_shopify-studio" setting.
// Plain JS with no imports, so the Node build script (scripts/generate-seo.mjs) can use it too.

export const SITE_URL = 'https://www.justindematteis.com';
export const STUDIO_PATH = '/shopify-studio';

export const BUSINESS_DEFAULTS = {
  name: 'Shopify Studio',
  owner: 'Justin DeMatteis',
  tagline: 'Canadian-owned. Ontario-based. Built around your business.',
  description: 'Fully customized Shopify design, development and business solutions for Canadian retailers. From storefront to backend, your vision drives everything we build.',
  city: 'Hamilton',
  region: 'Ontario',
  regionCode: 'ON',
  country: 'Canada',
  countryCode: 'CA',
  serviceArea: 'Serving clients across Canada',
  currency: 'CAD',
  // Shown in the footer next to the location. Leave blank to hide.
  businessLine: 'Canadian-owned · Prices in CAD',
  // Used in customer confirmation emails.
  reviewResponse: 'within 48 hours',
  quoteResponse: 'within 2 business days',
};

// Google titles/descriptions for the fixed Studio pages. Each can be overridden in the admin.
export const PAGE_SEO = {
  '/shopify-studio': {
    title: 'Custom Shopify Website Design & Development in Canada | Shopify Studio',
    description: 'Canadian-owned, Ontario-based Shopify developer. Fully customized Shopify stores, redesigns, backend cleanup and custom apps for Canadian retailers. Free store review.',
  },
  '/shopify-studio/pricing': {
    title: 'Shopify Website Design Pricing in Canada (CAD) | Shopify Studio',
    description: 'Shopify pricing in Canadian dollars: new stores, redesigns, migrations, custom apps, SEO, backend cleanup and monthly care. Clear packages, no surprises.',
  },
  '/shopify-studio/case-study': {
    title: 'Jill & The Beanstalk Shopify Case Study: +90% Online Revenue | Shopify Studio',
    description: 'How a Toronto kids\' shop went from a free theme to a custom Shopify store, reached the first page of Google and grew online revenue 90% with no ad spend.',
  },
  '/shopify-studio/about': {
    title: 'About Shopify Studio | Canadian Shopify Developer',
    description: 'Ontario-based Shopify design and development. Custom storefronts, apps, backend solutions and digital marketing for Canadian retailers.',
  },
  '/shopify-studio/blog': {
    title: 'Shopify Tips for Canadian Retailers | Shopify Studio Blog',
    description: 'Practical Shopify advice from a Hamilton, Ontario developer: store design, redesigns, backend cleanup, apps, SEO and pricing for Canadian shops.',
  },
  '/shopify-studio/privacy': {
    title: 'Privacy Policy | Shopify Studio',
    description: 'How Shopify Studio collects, uses and protects information sent through justindematteis.com.',
  },
  '/shopify-studio/terms': {
    title: 'Terms of Service | Shopify Studio',
    description: 'Terms for using the Shopify Studio website and requesting Shopify services.',
  },
};

export function pageSeo(path, settings = {}) {
  const base = PAGE_SEO[path];
  if (!base) return null;
  const o = (settings.seo?.pages || {})[path] || {};
  return { title: o.title || base.title, description: o.description || base.description };
}

// Permanent marketing rules (agreed with ChatGPT, 2026-11-26). Served to content tools through the API.
export const BRAND_RULES = [
  { rule: 'Location', requirement: 'Hamilton, Ontario, Canada' },
  { rule: 'Market', requirement: 'Canadian businesses' },
  { rule: 'Currency', requirement: 'CAD' },
  { rule: 'Language', requirement: 'Canadian English' },
  { rule: 'Primary selling point', requirement: 'Total customization — from storefront to backend' },
  { rule: 'Brand statement', requirement: 'Canadian-owned. Ontario-based. Built around your business.' },
  { rule: 'Design collection', requirement: 'Unlimited and continuously expanding — the decade designs are examples, not templates' },
  { rule: 'Marketing claims', requirement: 'Verified facts only (no certifications, awards or numbers that are not confirmed)' },
  { rule: 'Client work', requirement: 'Real projects and approved imagery only' },
  { rule: 'Pricing', requirement: 'Current centralized pricing only (from the API), always in CAD' },
  { rule: 'Social posts', requirement: 'Clearly reinforce Canadian and Ontario identity' },
  { rule: 'Publishing', requirement: 'Drafts only through the API; Justin approves and publishes' },
];

// Design showcase. Add a design here (plus its page files) and it appears in the menu,
// footer, sitemap and SEO automatically. Order = display order.
export const DESIGNS = [
  { key: '50s', look: '1950s atomic-diner', label: '1950s', name: '1950s', style: 'Atomic diner',
    seo: 'teal, cherry red, chrome and starburst details — friendly and nostalgic, a natural fit for diners, candy shops, vintage and gift stores', fit: 'diners, candy, vintage and gift shops' },
  { key: '60s', look: '1960s flower-power', label: '1960s', name: '1960s', style: 'Flower power',
    seo: 'sunbursts, round pill buttons and groovy waves — bright and playful, great for kids, toy, craft and lifestyle shops', fit: 'kids, toy, craft and lifestyle shops' },
  { key: '70s', look: 'Warm, earthy 1970s', label: '1970s', name: '1970s', style: 'Warm & earthy',
    seo: 'rust, mustard and olive with big soft type — warm and handmade, suited to home goods, plants, coffee and artisan makers', fit: 'home goods, plant, coffee and maker brands' },
  { key: '80s', look: '1980s neon', label: '1980s Neon', name: '1980s neon', style: 'Neon',
    seo: 'synthwave grids, hot pink and electric blue — loud and nocturnal, built for streetwear, gaming, music and nightlife brands', fit: 'streetwear, gaming and music brands' },
  { key: '80s-memphis', look: '1980s Memphis', label: '1980s Memphis', name: '1980s Memphis', style: 'Memphis',
    seo: 'bold shapes, squiggles and primary colour — graphic and fun, ideal for stationery, design studios and gift shops', fit: 'stationery, design and gift shops' },
  { key: '90s', look: '1990s paint-and-attitude', label: '1990s', name: '1990s', style: 'Paint & attitude',
    seo: 'paint splats, halftone dots and zig-zags — confident and youthful, a match for skate, sneaker, comic and youth brands', fit: 'skate, sneaker and comic shops' },
  { key: '2000s', look: 'Y2K 2000s', label: '2000s / Y2K', name: '2000s Y2K', style: 'Y2K',
    seo: 'glossy bubbles, chrome stars and dreamy blue — shiny and upbeat, made for beauty, accessories and pop-culture stores', fit: 'beauty, accessory and pop-culture stores' },
  { key: '2010s', look: 'Clean, modern 2010s', label: '2010s', name: '2010s', style: 'Clean & modern',
    seo: 'clean layouts, bright colour and gradient swooshes — modern and trustworthy, right for boutiques, wellness and premium retail', fit: 'boutiques, wellness and premium retail' },
];

// Social icons can be shown per website section (admin → Social Links).
export const SOCIAL_SECTION = 'shopify-studio';
export const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'github', label: 'GitHub' },
];

// Which footer column each pricing service belongs in. New services default to "Shopify Services".
const MARKETING_SERVICES = new Set(['seo', 'email', 'social', 'design', 'config']);
const FOOTER_SERVICE_LABELS = {
  new: 'Store Development', redesign: 'Store Redesign', migration: 'Migrations', apps: 'Custom Apps',
  backend: 'Backend Optimization', care: 'Monthly Store Care', consulting: 'Consulting & Training',
  seo: 'SEO', email: 'Email Marketing', social: 'Social Media', design: 'Graphic Design', config: 'Analytics & Setup',
};

export function businessInfo(settings = {}) {
  return { ...BUSINESS_DEFAULTS, ...cleanObject(settings.business) };
}

export function enabledDesigns(settings = {}) {
  const on = Array.isArray(settings.enabledEras) && settings.enabledEras.length ? new Set(settings.enabledEras) : null;
  return DESIGNS.filter(d => !on || on.has(d.key));
}

// SEO for a design page. Titles and descriptions follow a template, can be overridden per page in the admin.
export function designSeo(design, settings = {}) {
  const biz = businessInfo(settings);
  const o = (settings.seo?.pages || {})[`${STUDIO_PATH}/${design.key}`] || {};
  return {
    title: o.title || `${design.name} Shopify Store Design | Custom Shopify Developer in Ontario`,
    // Kept under ~160 characters so Google shows it in full.
    description: o.description || `${design.look} Shopify design for ${design.fit}. Fully custom stores, built in ${biz.city}, ${biz.region} for Canadian retailers.`,
  };
}

// Footer columns. Built from live data, so only real, published pages are linked.
export function footerColumns(settings = {}, pricing = {}) {
  const services = (pricing.services || []).filter(s => s.id && s.id !== 'terms' && s.hidden !== true);
  const svc = s => ({ label: FOOTER_SERVICE_LABELS[s.id] || s.name, href: `${STUDIO_PATH}/pricing#${s.id}` });
  const cols = [
    { title: 'Shopify Services', links: services.filter(s => !MARKETING_SERVICES.has(s.id)).map(svc) },
    { title: 'Marketing & Growth', links: services.filter(s => MARKETING_SERVICES.has(s.id)).map(svc) },
    { title: 'Design Showcase', links: [
      ...enabledDesigns(settings).map(d => ({ label: d.label, href: `${STUDIO_PATH}/${d.key}` })),
      { label: 'Demo store', href: `${STUDIO_PATH}/store`, external: true },
    ] },
    { title: 'Portfolio', links: [
      { label: 'Jill & The Beanstalk', href: `${STUDIO_PATH}/case-study` },
      { label: 'JustConsignIn', href: '/work/justconsignin' },
    ] },
    // Resources appears once the Studio blog has a published article (no dead links).
    ...(settings.__hasBlog ? [{ title: 'Resources', links: [{ label: 'Blog', href: `${STUDIO_PATH}/blog` }] }] : []),
    { title: 'Work With Us', links: [
      { label: 'Pricing & Packages', href: `${STUDIO_PATH}/pricing` },
      { label: 'Free Store Review', href: `${STUDIO_PATH}#audit` },
      { label: 'Request a Quote', href: `${STUDIO_PATH}/pricing` },
      { label: 'FAQs', href: `${STUDIO_PATH}#faq` },
    ] },
    { title: 'Company', links: [
      { label: 'About', href: `${STUDIO_PATH}/about` },
      { label: 'Privacy Policy', href: `${STUDIO_PATH}/privacy` },
      { label: 'Terms of Service', href: `${STUDIO_PATH}/terms` },
    ] },
  ];
  // Extra links added in the admin: { column, label, href }.
  for (const extra of settings.footerLinks || []) {
    if (!extra?.label || !extra?.href) continue;
    let col = cols.find(c => c.title === extra.column);
    if (!col) { col = { title: extra.column || 'More', links: [] }; cols.push(col); }
    col.links.push({ label: extra.label, href: extra.href });
  }
  return cols.filter(c => c.links.length);
}

export function studioSocial(social = {}) {
  return SOCIAL_NETWORKS
    .map(n => ({ ...n, url: String(social?.[n.key]?.url || '').trim(), on: social?.[n.key]?.enabled !== false, sections: social?.[n.key]?.sections || {} }))
    .filter(n => n.url && n.on && n.sections[SOCIAL_SECTION] === true);
}

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICONS = {
  facebook: '<path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3"/>',
  youtube: '<path d="M22 8.2c-.2-1.6-1-2.6-2.6-2.8C16.8 5 12 5 12 5s-4.8 0-7.4.4C3 5.6 2.2 6.6 2 8.2 1.8 9.6 1.8 12 1.8 12s0 2.4.2 3.8c.2 1.6 1 2.6 2.6 2.8C7.2 19 12 19 12 19s4.8 0 7.4-.4c1.6-.2 2.4-1.2 2.6-2.8.2-1.4.2-3.8.2-3.8s0-2.4-.2-3.8zM10 15V9l5.2 3L10 15z"/>',
  linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z"/>',
  tiktok: '<path d="M16 3c.3 2.4 1.7 3.9 4 4v3.3c-1.4.1-2.8-.3-4-1.1V15a6 6 0 1 1-6-6h.5v3.4A2.7 2.7 0 1 0 12.7 15V3H16z"/>',
  github: '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/>',
};

// The footer markup. Each era keeps its own colours and fonts; this only sets the layout.
export function renderStudioFooter(settings = {}, pricing = {}, social = {}) {
  const biz = businessInfo(settings);
  const year = new Date().getFullYear();
  const icons = studioSocial(social).map(n => `<a href="${esc(n.url)}" target="_blank" rel="noopener" aria-label="${esc(n.label)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">${ICONS[n.key] || ''}</svg></a>`).join('');
  const cols = footerColumns(settings, pricing).map(col => `<div class="ssf-col"><div class="ssf-h" role="button" tabindex="0" aria-expanded="true">${esc(col.title)}</div><ul>${col.links.map(l => `<li><a href="${esc(l.href)}"${l.external ? ' data-hard="1"' : ''}>${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('');
  return `<footer class="ssf"><div class="wrap">`
    + `<div class="ssf-top"><div class="ssf-brand"><b>${esc(biz.name)}</b><p class="ssf-tag">${esc(biz.tagline)}</p><p>${esc(biz.description)}</p>`
    + `<p class="ssf-loc">📍 ${esc(biz.city)}, ${esc(biz.region)}, ${esc(biz.country)} · ${esc(biz.serviceArea)}</p>`
    + (biz.businessLine ? `<p class="ssf-loc">${esc(biz.businessLine)}</p>` : '')
    + (icons ? `<div class="ssf-social">${icons}</div>` : '') + `</div>`
    + `<nav class="ssf-cols" aria-label="Shopify Studio footer">${cols}</nav></div>`
    + `<div class="ssf-bottom"><span>© ${year} ${esc(biz.owner)} · ${esc(biz.name)}</span><a href="/">← justindematteis.com</a></div>`
    + `</div></footer>`;
}

// Shared layout CSS for the footer (colours come from each era's own footer styles).
export const STUDIO_FOOTER_CSS = `
footer.ssf{padding:44px 0 28px!important;text-align:left}
footer.ssf .wrap{display:block!important}
footer.ssf .ssf-top{display:grid;grid-template-columns:minmax(220px,1.1fr) 3fr;gap:36px}
footer.ssf .ssf-brand b{display:block;font-size:22px;line-height:1.2;color:inherit;filter:brightness(1.4)}
footer.ssf .ssf-brand p{margin:8px 0 0;line-height:1.5;opacity:.9}
footer.ssf .ssf-tag{font-weight:700;opacity:1!important}
footer.ssf .ssf-loc{font-size:.92em}
footer.ssf .ssf-social{display:flex;gap:10px;margin-top:14px}
footer.ssf .ssf-social a{display:grid;place-items:center;width:38px;height:38px;border:1.5px solid currentColor;border-radius:50%;color:inherit;opacity:.9}
footer.ssf .ssf-social a:hover{opacity:1}
footer.ssf .ssf-cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:22px 26px}
footer.ssf .ssf-h{font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:.8em;margin:0 0 8px;font-family:inherit}
footer.ssf .ssf-col ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
footer.ssf .ssf-col li{margin:0;padding:0}
footer.ssf .ssf-col li::before{content:none}
footer.ssf .ssf-col a{color:inherit;text-decoration:none;opacity:.88}
footer.ssf .ssf-col a:hover{opacity:1;text-decoration:underline}
footer.ssf .ssf-bottom{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:30px;padding-top:16px;border-top:1px solid color-mix(in srgb,currentColor 25%,transparent);font-size:.9em}
footer.ssf .ssf-bottom a{color:inherit}
@media(max-width:760px){
  footer.ssf .ssf-top{grid-template-columns:1fr;gap:18px}
  footer.ssf .ssf-cols{display:block}
  footer.ssf .ssf-col{border-top:1px solid color-mix(in srgb,currentColor 25%,transparent)}
  footer.ssf .ssf-h{cursor:pointer;margin:0;padding:12px 0;display:flex;justify-content:space-between;align-items:center}
  footer.ssf .ssf-h::after{content:'+';font-size:1.5em;line-height:1;font-weight:400}
  footer.ssf .ssf-col.open .ssf-h::after{content:'–'}
  footer.ssf .ssf-col:not(.open) ul{display:none}
  footer.ssf .ssf-col ul{padding-bottom:12px}
}}`;

// Collapse footer sections on phones. Links are always in the HTML, so search engines see them.
export function wireFooter(root) {
  const footer = root?.querySelector('footer.ssf');
  if (!footer) return () => {};
  const toggle = h => { const col = h.closest('.ssf-col'); const open = !col.classList.contains('open'); col.classList.toggle('open', open); h.setAttribute('aria-expanded', String(open)); };
  const onClick = e => { const h = e.target.closest('.ssf-h'); if (h && window.matchMedia('(max-width:760px)').matches) toggle(h); };
  const onKey = e => { const h = e.target.closest('.ssf-h'); if (h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(h); } };
  footer.querySelectorAll('.ssf-h').forEach(h => h.setAttribute('aria-expanded', String(!window.matchMedia('(max-width:760px)').matches)));
  footer.addEventListener('click', onClick);
  footer.addEventListener('keydown', onKey);
  return () => { footer.removeEventListener('click', onClick); footer.removeEventListener('keydown', onKey); };
}

// schema.org data for Shopify Studio pages.
export function studioSchema(settings = {}, pricing = {}) {
  const biz = businessInfo(settings);
  const services = (pricing.services || []).filter(s => s.id && s.id !== 'terms');
  return {
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}${STUDIO_PATH}#business`,
    name: biz.name,
    description: biz.description,
    slogan: biz.tagline,
    url: `${SITE_URL}${STUDIO_PATH}`,
    founder: { '@type': 'Person', name: biz.owner },
    address: { '@type': 'PostalAddress', addressLocality: biz.city, addressRegion: biz.regionCode, addressCountry: biz.countryCode },
    areaServed: { '@type': 'Country', name: biz.country },
    currenciesAccepted: biz.currency,
    knowsAbout: ['Shopify', 'Shopify theme development', 'Custom Shopify apps', 'Ecommerce', 'Shopify SEO'],
    hasOfferCatalog: services.length ? {
      '@type': 'OfferCatalog',
      name: 'Shopify services',
      itemListElement: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: `${SITE_URL}${STUDIO_PATH}/pricing#${s.id}` } })),
    } : undefined,
  };
}

function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return {};
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v != null));
}
