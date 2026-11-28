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

export const BLOG_STYLE = `<style>
.sblog{padding:64px 0 84px;background:#fff;border-bottom:2px solid var(--line)}
.sblog .wrap{max-width:1100px}
.sblog h1{font-size:clamp(38px,5vw,60px);line-height:1.05;margin:0 0 14px}
.sblog .lead{font-size:20px;color:var(--mute);margin:0 0 36px;line-height:1.55;max-width:760px}
.sblog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.sblog-card{border:2px solid var(--line);background:var(--paper);display:flex;flex-direction:column;transition:transform .15s,box-shadow .15s}
.sblog-card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--green2)}
.sblog-card .im{aspect-ratio:16/10;background:#e9e6de;border-bottom:2px solid var(--line);overflow:hidden}
.sblog-card .im img{width:100%;height:100%;object-fit:cover}
.sblog-card .t{padding:18px 20px 22px;display:flex;flex-direction:column;gap:8px}
.sblog-card small{font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--green)}
.sblog-card h2{font-size:22px;line-height:1.2;margin:0}
.sblog-card p{margin:0;color:var(--mute);font-size:15px;line-height:1.55}
.sblog-empty{border:2px dashed var(--line);padding:40px;text-align:center;color:var(--mute)}
.sart .wrap{max-width:780px}
.sart .meta{font-size:14px;color:var(--mute);margin:0 0 26px}
.sart .hero{border:2px solid var(--line);margin:0 0 32px}
.sart .hero img{display:block;width:100%;height:auto}
.sart .body h2{font-size:30px;margin:40px 0 12px}.sart .body h3{font-size:23px;margin:30px 0 10px}
.sart .body p,.sart .body li{font-size:18px;line-height:1.75}
.sart .body a{text-decoration:underline}
.sart .body blockquote{margin:24px 0;padding:14px 20px;border-left:5px solid var(--green2);background:var(--paper)}
.sart .rel{margin-top:44px;border:2px solid var(--line);background:var(--paper);padding:22px 24px}
.sart .rel h2{font-size:22px;margin:0 0 12px}
.sart .rel ul{list-style:none;padding:0;margin:0 0 18px;display:flex;flex-wrap:wrap;gap:8px}
.sart .rel li a{display:inline-block;border:2px solid var(--ink);padding:6px 12px;font-weight:700;font-size:14px;background:#fff}
.sart .back{display:inline-block;margin-bottom:22px;font-weight:700}
.sart .quick{border:2px solid var(--line);border-left:8px solid var(--green2);background:var(--paper);padding:16px 20px;margin:0 0 30px}
.sart .quick b{display:block;font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.sart .quick p{margin:0;font-size:18px;line-height:1.6}
.sart .body ol{counter-reset:step;list-style:none;padding:0}
.sart .body ol>li{counter-increment:step;position:relative;padding:4px 0 10px 48px}
.sart .body ol>li::before{content:counter(step);position:absolute;left:0;top:2px;width:32px;height:32px;display:grid;place-items:center;border:2px solid var(--line);background:var(--green2);font-weight:800;font-size:15px}
.sart .faq{margin-top:44px}.sart .faq h2{font-size:30px;margin:0 0 14px}
.sart .faq .qa{border-top:2px solid var(--line);padding:16px 0}.sart .faq h3{font-size:20px;margin:0 0 6px}.sart .faq p{margin:0;font-size:17px;line-height:1.7}
@media(max-width:900px){.sblog-grid{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.sblog{padding:44px 0 60px}.sblog-grid{grid-template-columns:1fr}}
</style>`;

export function blogListHtml(posts) {
  const cards = posts.map(p => `<a class="sblog-card" href="/shopify-studio/tips/${esc(p.slug)}">`
    + `<div class="im">${p.featured_image ? `<img src="${esc(p.featured_image)}" alt="" loading="lazy">` : ''}</div>`
    + `<div class="t"><small>${esc(p.category || 'Shopify Tips')} · ${esc(date(p.published_at))}</small><h2>${esc(p.title)}</h2>${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}</div></a>`).join('');
  return `<section class="sblog"><div class="wrap"><span class="kick">Shopify Tips</span><h1>How to do it in Shopify</h1>`
    + `<p class="lead">Step-by-step guides for running a Shopify store — setup, shipping, taxes, speed, SEO and design. Written in Hamilton, Ontario for shops across Canada.</p>`
    + (cards ? `<div class="sblog-grid">${cards}</div>` : `<div class="sblog-empty">The first tips are on their way.</div>`)
    + `</div></section>`;
}

export function blogPostHtml(post, services = []) {
  if (!post) return `<section class="sblog sart"><div class="wrap"><a class="back" href="/shopify-studio/tips">← All Shopify Tips</a><h1>Tip not found</h1><p class="lead">It may have moved or not be published yet.</p></div></section>`;
  const extras = (post.content_blocks && !Array.isArray(post.content_blocks)) ? post.content_blocks : {};
  const rel = (extras.relatedServices || []).map(id => services.find(s => s.id === id)).filter(Boolean);
  const cta = { label: extras.ctaLabel || 'Get a free store review', url: extras.ctaUrl || '/shopify-studio#audit' };
  const faq = (Array.isArray(extras.faq) ? extras.faq : []).filter(f => f?.q && f?.a);
  return `<article class="sblog sart"><div class="wrap"><a class="back" href="/shopify-studio/tips">← All Shopify Tips</a>`
    + `<span class="kick" style="display:block">${esc(post.category || 'Shopify Tips')}</span><h1>${esc(post.title)}</h1>`
    + `<p class="meta">By ${esc(post.author_name || 'Justin DeMatteis')} · ${esc(date(post.published_at))}</p>`
    + (post.excerpt ? `<p class="lead">${esc(post.excerpt)}</p>` : '')
    + (post.featured_image ? `<figure class="hero"><img src="${esc(post.featured_image)}" alt="${esc(post.title)}"></figure>` : '')
    + (extras.quickAnswer ? `<div class="quick"><b>Quick answer</b><p>${esc(extras.quickAnswer)}</p></div>` : '')
    + `<div class="body">${renderBody(post.body)}</div>`
    + (faq.length ? `<section class="faq"><h2>Questions people ask</h2>${faq.map(f => `<div class="qa"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('')}</section>` : '')
    + `<div class="rel">${rel.length ? `<h2>Related services</h2><ul>${rel.map(s => `<li><a href="/shopify-studio/pricing#${esc(s.id)}">${esc(s.name)}</a></li>`).join('')}</ul>` : '<h2>Want help with your store?</h2>'}`
    + `<a class="btn" href="${esc(cta.url)}">${esc(cta.label)}</a></div>`
    + `</div></article>`;
}
