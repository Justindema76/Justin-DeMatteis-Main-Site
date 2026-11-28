// Shopify Tips (how-to guides): /shopify-studio/tips and /shopify-studio/tips/:slug.
// Tips come from the admin (Shopify Studio → Shopify Tips, site_key "shopifystudio"), the same way
// Sunwings' Moving Tips work. Each tip can have a quick answer and FAQs (content_blocks.quickAnswer / .faq).
// A post shows once it is Published and its publish time has passed (future = scheduled).
import { readPublic } from '../../../lib/supabase';

export const STUDIO_BLOG_SITE = 'shopifystudio';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const live = p => p && p.status === 'published' && (!p.published_at || new Date(p.published_at) <= new Date());
const date = iso => (iso ? new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

// Studio footer social icons: their own list in the Shopify Studio dashboard (Social Links).
let socialCache = null;
export function loadStudioSocial() {
  if (!socialCache) {
    socialCache = readPublic('site_settings', `select=value&site_key=eq.${STUDIO_BLOG_SITE}&key=eq.social_links&limit=1`)
      .then(rows => rows?.[0]?.value || {})
      .catch(() => ({}));
  }
  return socialCache;
}

let listCache = null;
export function loadStudioPosts() {
  if (!listCache) {
    listCache = readPublic('blog_posts', `select=id,slug,title,excerpt,category,tags,featured_image,published_at,status,seo_title,seo_description&site_key=eq.${STUDIO_BLOG_SITE}&status=eq.published&order=published_at.desc&limit=100`)
      .then(rows => (rows || []).filter(live))
      .catch(() => []);
  }
  return listCache;
}

export async function loadStudioPost(slug) {
  const rows = await readPublic('blog_posts', `select=*&site_key=eq.${STUDIO_BLOG_SITE}&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`).catch(() => []);
  return live(rows?.[0]) ? rows[0] : null;
}

// Markdown (what ChatGPT writes) or simple HTML (older admin posts) → safe HTML.
export function renderBody(body = '') {
  const src = String(body || '').trim();
  if (/<(p|h2|h3|ul|ol|div|br)\b/i.test(src)) {
    return src.replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
  }
  const inline = t => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, (_, label, href) => `<a href="${href}"${/^https?:/.test(href) && !href.includes('justindematteis.com') ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`);
  const out = [];
  let listType = '';
  const close = () => { if (listType) { out.push(`</${listType}>`); listType = ''; } };
  for (const block of src.split(/\n{2,}/)) {
    const lines = block.split('\n');
    if (lines.every(l => /^\s*[-*]\s+/.test(l)) || lines.every(l => /^\s*\d+[.)]\s+/.test(l))) {
      const type = /^\s*\d/.test(lines[0]) ? 'ol' : 'ul';
      if (listType !== type) { close(); out.push(`<${type}>`); listType = type; }
      lines.forEach(l => out.push(`<li>${inline(l.replace(/^\s*([-*]|\d+[.)])\s+/, ''))}</li>`));
      continue;
    }
    close();
    const h = block.match(/^(#{2,4})\s+(.+)$/);
    if (h && lines.length === 1) { const n = Math.min(4, h[1].length); out.push(`<h${n}>${inline(h[2])}</h${n}>`); continue; }
    if (/^#\s+/.test(block) && lines.length === 1) { out.push(`<h2>${inline(block.replace(/^#\s+/, ''))}</h2>`); continue; }
    if (/^>\s?/.test(block)) { out.push(`<blockquote>${inline(block.replace(/^>\s?/gm, ''))}</blockquote>`); continue; }
    out.push(`<p>${lines.map(inline).join('<br>')}</p>`);
  }
  close();
  return out.join('\n');
}

// Tip images, modelled on the Sunwings Moving Tips page:
//  - photo: the card + banner photo (public/shopify-studio/tips-img/photos/<slug>.jpg)
//  - screen: the real Shopify admin screen shown inside the article (public/shopify-studio/tips-img/<slug>.png)
const ALL_TIPS = ['how-to-set-up-shipping-rates-in-canada-on-shopify', 'how-to-charge-gst-hst-pst-in-shopify', 'how-to-add-a-size-chart-to-shopify-products', 'how-to-speed-up-a-slow-shopify-store', 'how-to-get-shopify-products-found-on-google', 'how-to-add-a-free-shipping-announcement-bar-in-shopify'];
const TIP_PHOTOS = new Set(ALL_TIPS);
const TIP_SCREENS = new Set([
  'how-to-set-up-shipping-rates-in-canada-on-shopify', 'how-to-charge-gst-hst-pst-in-shopify',
  'how-to-add-a-size-chart-to-shopify-products', 'how-to-speed-up-a-slow-shopify-store',
  'how-to-get-shopify-products-found-on-google', 'how-to-add-a-free-shipping-announcement-bar-in-shopify',
]);
// "After" pictures: what the finished result looks like on a real Shopify store.
const RESULTS = {
  'how-to-add-a-free-shipping-announcement-bar-in-shopify': 'The finished free shipping bar on a real Canadian Shopify store.',
  'how-to-get-shopify-products-found-on-google': "Shopify's preview of how the product shows up on Google once the search listing is filled in.",
};
const TALL = new Set(['how-to-add-a-free-shipping-announcement-bar-in-shopify']);
// Where each photo's subject sits, so the banner crop keeps it in view.
// pos/size per photo: subject on the right, clear of the title on the left.
const FOCUS = { 'how-to-add-a-free-shipping-announcement-bar-in-shopify': 'center 60%' };
// Wide banner versions (subject on the right, calm left side for the title).
const WIDE = new Set(ALL_TIPS);
const bannerPhoto = p => (WIDE.has(p.slug) ? `/shopify-studio/tips-img/photos/${p.slug}-banner.jpg` : tipPhoto(p));
const BANNER = '/shopify-studio/tips-img/photos/how-to-add-a-free-shipping-announcement-bar-in-shopify-banner.jpg';
const tipPhoto = p => (TIP_PHOTOS.has(p.slug) ? `/shopify-studio/tips-img/photos/${p.slug}-banner.jpg` : '');
const tipScreen = p => (TIP_SCREENS.has(p.slug) ? `/shopify-studio/tips-img/${p.slug}.png` : '');
const cardImage = p => tipPhoto(p) || tipScreen(p) || p.featured_image || '';
const slugId = t => String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z0-9#]+;/gi, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const shortDate = iso => (iso ? new Date(iso).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' }) : '');
const readTime = body => { const w = String(body || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length; return w ? `${Math.max(1, Math.ceil(w / 220))} min` : ''; };

export const BLOG_STYLE = `<style>
.tp{--tp-line:#e4e1d8;--tp-muted:#5b6070;--tp-soft:#f6f4ee;--tp-r:10px;font-size:16px}
.tp .tp-wrap{width:min(1200px,100% - 40px);margin-inline:auto}
.tp-hero{color:#fff;background:linear-gradient(90deg,rgba(22,24,29,.86) 0%,rgba(22,24,29,.62) 34%,rgba(22,24,29,.12) 62%,rgba(22,24,29,0) 100%),var(--tp-img,none) var(--tp-pos,center)/var(--tp-size,cover) no-repeat,#16181d;padding:84px 0 92px}
.tp-crumbs{font-size:14px;color:#c9d6b8;margin-bottom:16px}.tp-crumbs a{color:#c9d6b8}.tp-crumbs a:hover{color:#fff}.tp-crumbs b{color:#fff;font-weight:600}
.tp-hero h1{font-size:clamp(34px,4.6vw,54px);line-height:1.08;font-weight:800;max-width:820px;margin:0;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.3)}
.tp-hero p{color:#fff;font-weight:500;font-size:18px;line-height:1.55;margin:16px 0 0;max-width:680px;text-shadow:0 1px 12px rgba(0,0,0,.45)}
.tp-sec{padding:72px 0;background:#fff}.tp-sec.soft{background:var(--tp-soft)}
.tp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}
.tp-chip{cursor:pointer;font:inherit;font-size:14px;font-weight:600;background:var(--tp-soft);border:1px solid var(--tp-line);color:var(--ink);padding:7px 13px;border-radius:999px}
.tp-chip:hover{border-color:var(--green);color:var(--green)}
.tp-chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.tp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.tp-card{background:#fff;border:1px solid var(--tp-line);border-radius:var(--tp-r);overflow:hidden;display:flex;flex-direction:column;transition:.25s}
.tp-card:hover{transform:translateY(-4px);box-shadow:0 10px 30px rgba(22,24,29,.09)}
.tp-card .img{aspect-ratio:16/10;background:#ebe7dd center/cover no-repeat;border-bottom:1px solid var(--tp-line)}
.tp-card .img.screen{background-position:top left}
.tp-card .img.photo{background-position:82% center}
.tp-card .bd{padding:22px 22px 20px;display:flex;flex-direction:column;flex:1}
.tp-tag{display:inline-block;align-self:flex-start;font-size:12px;font-weight:700;background:#eef6e3;color:var(--green);padding:4px 10px;border-radius:999px;margin-bottom:10px}
.tp-card h3{font-size:20px;line-height:1.25;margin:0 0 8px;font-family:Inter,sans-serif;font-weight:700}
.tp-card p{color:var(--tp-muted);font-size:15px;line-height:1.5;margin:0;flex:1}
.tp-meta{font-size:13px;color:var(--tp-muted);margin-top:14px}
.tp-empty{border:1px dashed var(--tp-line);border-radius:var(--tp-r);padding:28px;color:var(--tp-muted);text-align:center}
.tp-side-wrap{display:grid;grid-template-columns:1fr 360px;gap:48px;align-items:start}
.tp-prose .lead{font-size:20px;line-height:1.6;color:var(--ink);margin:0 0 22px}
.tp-prose h2{font-size:28px;line-height:1.2;margin:36px 0 12px;scroll-margin-top:110px}
.tp-prose h3{font-size:21px;margin:28px 0 10px}
.tp-prose p,.tp-prose li{color:#33384a;font-size:17px;line-height:1.7}
.tp-prose p{margin:0 0 14px}
.tp-prose ul{margin:0 0 16px 20px}.tp-prose li{margin-bottom:6px}
.tp-prose ol{counter-reset:step;list-style:none;padding:0;margin:0 0 16px}
.tp-prose ol>li{counter-increment:step;position:relative;padding:2px 0 8px 42px}
.tp-prose ol>li::before{content:counter(step);position:absolute;left:0;top:2px;width:28px;height:28px;border-radius:6px;display:grid;place-items:center;background:var(--ink);color:#fff;font-weight:700;font-size:14px}
.tp-prose a{color:var(--green);font-weight:600;text-decoration:underline}
.tp-prose blockquote{background:#eef6e3;border-left:4px solid var(--green);border-radius:8px;padding:16px 18px;margin:20px 0}
.tp-prose blockquote p{margin:0;color:var(--ink)}
.tp-quick{background:var(--tp-soft);border:1px solid var(--tp-line);border-radius:var(--tp-r);padding:20px 22px;margin:0 0 28px}
.tp-quick b{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--green);margin-bottom:6px}
.tp-quick p{margin:0;font-size:17px;line-height:1.6;color:var(--ink)}
.tp-screen{margin:8px 0 28px}
.tp-screen .frame{background:#ebe7dd;border:1px solid var(--tp-line);border-radius:var(--tp-r);padding:22px 22px 0;overflow:hidden;max-height:520px}
.tp-screen.tall img{width:auto;max-width:420px;margin:0 auto}
.tp-screen img{display:block;width:100%;border-radius:8px 8px 0 0;box-shadow:0 10px 28px rgba(22,24,29,.12);background:#fff}
.tp-result-k{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--green);margin-bottom:8px}
.tp-screen.result .frame{padding:22px;max-height:none}.tp-screen.result img{border-radius:6px}
.tp-screen figcaption{font-size:13px;color:var(--tp-muted);margin-top:8px}
.tp-cta{background:var(--ink);color:#fff;border-radius:var(--tp-r);padding:26px 28px;margin:30px 0;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.tp-cta h3{font-size:22px;margin:0;color:#fff}.tp-cta p{margin:4px 0 0;color:#cfd4c6;font-size:16px}
.tp-cta .btn{background:var(--green2);color:var(--ink);border-color:var(--green2);box-shadow:none}
.tp-faq .qa{border-top:1px solid var(--tp-line);padding:16px 0}.tp-faq h3{font-size:19px;margin:0 0 6px}.tp-faq p{margin:0}
.tp-side{position:sticky;top:110px;display:grid;gap:18px}
.tp-card-s{background:#fff;border:1px solid var(--tp-line);border-radius:var(--tp-r);padding:22px}
.tp-card-s h4{font-size:17px;margin:0 0 10px;font-family:Inter,sans-serif;font-weight:700}
.tp-toc a{display:block;padding:6px 0;color:var(--tp-muted);font-weight:600;font-size:15px}.tp-toc a:hover{color:var(--green)}
.tp-card-s p{color:var(--tp-muted);font-size:15px;line-height:1.5;margin:0 0 14px}
.tp-rel{display:flex;flex-wrap:wrap;gap:8px}.tp-rel a{font-size:14px;font-weight:600;border:1px solid var(--tp-line);background:var(--tp-soft);border-radius:999px;padding:6px 12px}
.tp-rel a:hover{border-color:var(--green);color:var(--green)}
.tp-head{margin-bottom:28px}.tp-head h2{font-size:32px;margin:0}
@media(max-width:980px){.tp-grid{grid-template-columns:1fr 1fr}.tp-side-wrap{grid-template-columns:1fr}.tp-side{position:static}}
@media(max-width:640px){.tp-grid{grid-template-columns:1fr}.tp-hero{padding:56px 0 64px}.tp-sec{padding:48px 0}}
</style>`;

const card = p => {
  const img = cardImage(p), screen = !tipPhoto(p) && tipScreen(p);
  return `<a class="tp-card" data-cat="${esc(p.category || 'Shopify Tips')}" href="/shopify-studio/tips/${esc(p.slug)}">`
    + `<div class="img${screen ? ' screen' : tipPhoto(p) ? ' photo' : ''}"${img ? ` style="background-image:url('${esc(img)}')"` : ''}></div>`
    + `<div class="bd"><span class="tp-tag">${esc(p.category || 'Shopify Tips')}</span><h3>${esc(p.title)}</h3>${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}`
    + `<div class="tp-meta">${[shortDate(p.published_at), readTime(p.body)].filter(Boolean).join(' · ')}</div></div></a>`;
};

export function blogListHtml(posts) {
  const cats = ['All', ...new Set(posts.map(p => p.category || 'Shopify Tips'))];
  return `<div class="tp"><section class="tp-hero" style="--tp-img:url('${BANNER}');--tp-pos:center 28%"><div class="tp-wrap">`
    + `<div class="tp-crumbs"><a href="/shopify-studio">Shopify Studio</a> / <b>Shopify Tips</b></div>`
    + `<h1>Shopify tips &amp; how-to guides</h1><p>Step-by-step guides with the real Shopify screens: setup, shipping, taxes, speed and SEO. Written in Hamilton, Ontario for shops across Canada.</p></div></section>`
    + `<section class="tp-sec"><div class="tp-wrap">`
    + (posts.length ? `<div class="tp-chips" data-tip-filters>${cats.map((c, i) => `<button type="button" class="tp-chip${i ? '' : ' on'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="tp-grid">${posts.map(card).join('')}</div>`
      : `<div class="tp-empty">The first tips are on their way.</div>`)
    + `</div></section></div>`;
}

// Category filter buttons on the tips page (same behaviour as Sunwings Moving Tips).
export function wireTipFilters(root) {
  const bar = root?.querySelector('[data-tip-filters]');
  if (!bar) return () => {};
  const onClick = e => {
    const b = e.target.closest('.tp-chip'); if (!b) return;
    const cat = b.dataset.cat;
    bar.querySelectorAll('.tp-chip').forEach(x => x.classList.toggle('on', x === b));
    root.querySelectorAll('.tp-grid .tp-card').forEach(c => { c.style.display = cat === 'All' || c.dataset.cat === cat ? '' : 'none'; });
  };
  bar.addEventListener('click', onClick);
  return () => bar.removeEventListener('click', onClick);
}

export function blogPostHtml(post, services = [], others = []) {
  if (!post) return `<div class="tp"><section class="tp-sec"><div class="tp-wrap"><a href="/shopify-studio/tips">← All Shopify Tips</a><h1>Tip not found</h1><p>It may have moved or not be published yet.</p></div></section></div>`;
  const extras = (post.content_blocks && !Array.isArray(post.content_blocks)) ? post.content_blocks : {};
  const rel = (extras.relatedServices || []).map(id => services.find(s => s.id === id)).filter(Boolean);
  const cta = { label: extras.ctaLabel || 'Get a free store review', url: extras.ctaUrl || '/shopify-studio#audit' };
  const faq = (Array.isArray(extras.faq) ? extras.faq : []).filter(f => f?.q && f?.a);
  const toc = [];
  const html = renderBody(post.body).replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => { const id = slugId(t); toc.push([id, t]); return `<h2 id="${id}">${t}</h2>`; });
  if (faq.length) toc.push(['questions', 'Questions people ask']);
  const parts = html.split(/(?=<h2\b)/i), first = parts.slice(0, 2).join(''), restHtml = parts.slice(2).join('');
  const screen = tipScreen(post);
  const more = others.filter(p => p.slug !== post.slug).slice(0, 3);
  return `<div class="tp"><section class="tp-hero" style="--tp-img:url('${esc(bannerPhoto(post) || BANNER)}');--tp-pos:${WIDE.has(post.slug) || !bannerPhoto(post) ? 'center 28%' : (FOCUS[post.slug] || 'center')}"><div class="tp-wrap">`
    + `<div class="tp-crumbs"><a href="/shopify-studio">Shopify Studio</a> / <a href="/shopify-studio/tips">Shopify Tips</a>${post.category && post.category !== 'Shopify Tips' ? ` / <b>${esc(post.category)}</b>` : ''}</div>`
    + `<h1>${esc(post.title)}</h1><p>${[esc(post.author_name || 'Justin DeMatteis'), esc(date(post.published_at)), `${readTime(post.body)} read`].filter(Boolean).join(' · ')}</p></div></section>`
    + `<section class="tp-sec"><div class="tp-wrap tp-side-wrap"><article class="tp-prose">`
    + (post.excerpt ? `<p class="lead">${esc(post.excerpt)}</p>` : '')
    + (extras.quickAnswer ? `<div class="tp-quick"><b>Quick answer</b><p>${esc(extras.quickAnswer)}</p></div>` : '')
    + (screen ? `<figure class="tp-screen${TALL.has(post.slug) ? ' tall' : ''}"><div class="frame"><img src="${esc(screen)}" alt="${esc(`The Shopify admin screen for: ${post.title}`)}"></div><figcaption>The real Shopify admin screen for this tip.</figcaption></figure>` : '')
    + (RESULTS[post.slug] ? `<figure class="tp-screen result"><b class="tp-result-k">The result</b><div class="frame"><img src="/shopify-studio/tips-img/${esc(post.slug)}-result.png" alt="${esc(RESULTS[post.slug])}"></div><figcaption>${esc(RESULTS[post.slug])}</figcaption></figure>` : '')
    + first
    + `<div class="tp-cta"><div><h3>Rather have it done for you?</h3><p>We set this up for Canadian Shopify stores every week.</p></div><a class="btn" href="${esc(cta.url)}">${esc(cta.label)}</a></div>`
    + restHtml
    + (faq.length ? `<section class="tp-faq" id="questions"><h2>Questions people ask</h2>${faq.map(f => `<div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('')}</section>` : '')
    + `</article><aside class="tp-side">`
    + (toc.length ? `<div class="tp-card-s tp-toc"><h4>On this page</h4>${toc.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</div>` : '')
    + `<div class="tp-card-s"><h4>Free store review</h4><p>Send your store and we'll tell you what to fix first. Canadian-owned, based in Hamilton, Ontario.</p><a class="btn" href="${esc(cta.url)}">${esc(cta.label)}</a></div>`
    + (rel.length ? `<div class="tp-card-s"><h4>Related services</h4><div class="tp-rel">${rel.map(s => `<a href="/shopify-studio/pricing#${esc(s.id)}">${esc(s.name)}</a>`).join('')}</div></div>` : '')
    + `</aside></div></section>`
    + (more.length ? `<section class="tp-sec soft"><div class="tp-wrap"><div class="tp-head"><h2>More Shopify tips</h2></div><div class="tp-grid">${more.map(card).join('')}</div></div></section>` : '')
    + `</div>`;
}
