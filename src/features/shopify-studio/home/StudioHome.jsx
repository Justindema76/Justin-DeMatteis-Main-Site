// Shopify Studio pages that aren't era pages: the main page (/shopify-studio, home.html = public home-v9.html)
// the Jill case study (/shopify-studio/case-study, case-study.html = public case-study-v1.html)
// and pricing (/shopify-studio/pricing, pricing.html = public pricing-v1.html).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadSetting } from '../../../lib/content';
import { STUDIO_DEFAULTS, STUDIO_SETTING_KEY } from '../studioConfig';
import { fillTokens, wireForm, wireTracking } from '../studioShared';
import { pageSeo, wireFooter } from '../studioSite';
import { INFO_PAGE_KEYS, infoPageHtml, swapMiddle } from './infoPages';
import { BLOG_STYLE, blogListHtml, blogPostHtml, loadStudioPost, loadStudioPosts, loadStudioSocial, wireTipFilters } from './studioBlog';
import { catalogue } from './pricingRender';
import { renderPricing } from './pricingRender';
import homeRaw from './home.html?raw';
import caseRaw from './case-study.html?raw';
import pricingRaw from './pricing.html?raw';

const PAGES = { home: homeRaw, case: caseRaw, pricing: pricingRaw };

function split(html) {
  const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const fonts = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  const fullBody = (html.match(/<body>([\s\S]*?)<\/body>/) || [])[1] || '';
  const scripts = [...fullBody.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const body = fullBody.replace(/<script>[\s\S]*?<\/script>/g, '');
  const title = ((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&');
  return { style, fonts, body, scripts, title };
}

export default function StudioHome({ page: pageKey = 'home' }) {
  // About / Privacy / Terms use the main page's header, menu and footer with their own middle.
  const info = INFO_PAGE_KEYS.includes(pageKey);
  const isBlog = pageKey === 'blog' || pageKey === 'blog-post';
  const { slug } = useParams();
  // Blog data: the list, or one article (undefined = still loading).
  const [blog, setBlog] = useState(undefined);
  useEffect(() => {
    if (!isBlog) return undefined;
    let live = true;
    setBlog(undefined);
    (pageKey === 'blog' ? loadStudioPosts() : Promise.all([loadStudioPost(slug), loadStudioPosts()]).then(([post, list]) => (post ? { ...post, __others: list } : null))).then(data => { if (live) setBlog(data); });
    return () => { live = false; };
  }, [isBlog, pageKey, slug]);
  const page = useMemo(() => {
    const parts = split((info || isBlog) ? homeRaw : (PAGES[pageKey] || homeRaw));
    if (pageKey === 'blog') return { ...parts, title: pageSeo('/shopify-studio/tips')?.title || parts.title };
    return info ? { ...parts, title: pageSeo(`/shopify-studio/${pageKey}`)?.title || parts.title } : parts;
  }, [pageKey, info, isBlog]);
  const navigate = useNavigate();
  const rootRef = useRef(null);
  // Package prices and "spots left" come from the Shopify Studio admin settings.
  const [settings, setSettings] = useState(STUDIO_DEFAULTS);
  useEffect(() => {
    let live = true;
    Promise.all([loadSetting(STUDIO_SETTING_KEY, STUDIO_DEFAULTS), loadStudioSocial(), loadStudioPosts()]).then(([value, social, posts]) => { if (live) setSettings({ ...STUDIO_DEFAULTS, ...(value || {}), __social: social || {}, __hasBlog: posts.length > 0 }); });
    return () => { live = false; };
  }, []);
  const html = useMemo(() => {
    const blogMiddle = () => BLOG_STYLE + (blog === undefined ? '<div class="tp"><section class="tp-sec"><div class="tp-wrap"><p>Loading…</p></div></section></div>'
      : pageKey === 'blog' ? blogListHtml(blog || []) : blogPostHtml(blog, catalogue(settings.pricing).services, blog?.__others || []));
    const body = pageKey === 'pricing' ? renderPricing(page.body, settings.pricing || {}) : info ? infoPageHtml(page.body, pageKey, settings) : isBlog ? swapMiddle(page.body, blogMiddle()) : page.body;
    return fillTokens(body, settings);
  }, [page.body, settings, pageKey, info, isBlog, blog]);

  useEffect(() => {
    const style = document.createElement('style');
    style.dataset.studioHome = '';
    style.textContent = page.style;
    document.head.appendChild(style);
    const links = page.fonts.map(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    const oldTitle = document.title;
    if (page.title) document.title = page.title;
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    else window.scrollTo(0, 0);
    return () => { style.remove(); links.forEach(l => l.remove()); document.title = oldTitle; };
  }, [page]);

  // Article pages: title, description and canonical come from the post (set after it loads).
  useEffect(() => {
    if (pageKey !== 'blog-post' || !blog) return;
    const extras = (blog.content_blocks && !Array.isArray(blog.content_blocks)) ? blog.content_blocks : {};
    document.title = `${blog.seo_title || blog.title} | Shopify Studio`;
    const set = (sel, attr, value) => { const el = document.head.querySelector(sel); if (el && value) el.setAttribute(attr, value); };
    set('meta[name="description"]', 'content', blog.seo_description || blog.excerpt);
    set('meta[property="og:title"]', 'content', blog.seo_title || blog.title);
    set('meta[property="og:description"]', 'content', blog.seo_description || blog.excerpt);
    set('link[rel="canonical"]', 'href', extras.canonical || `https://www.justindematteis.com/shopify-studio/tips/${blog.slug}`);
  }, [pageKey, blog]);

  // Page scripts (the store walkthrough slider) and the free-audit form, wired to whatever markup is on the page.
  useEffect(() => {
    page.scripts.forEach(code => new Function(code)());
    const offForm = rootRef.current ? wireForm(rootRef.current, '') : () => {};
    const offFooter = rootRef.current ? wireFooter(rootRef.current) : () => {};
    const offTrack = wireTracking(rootRef.current);
    const offTips = wireTipFilters(rootRef.current);
    return () => {
      offTips();
      offFooter();
      offTrack();
      window.__studioHomeCleanup?.();
      delete window.__studioHomeCleanup;
      offForm();
    };
  }, [page, html]);

  // Same-site links move inside the app instead of reloading the page.
  const onClick = event => {
    const a = event.target.closest('a');
    const href = a?.getAttribute('href');
    if (!href || href.startsWith('#') || /^https?:/.test(href) || a.target || a.hasAttribute('data-hard')) return;
    event.preventDefault();
    navigate(href);
  };

  return <div className="studio-home" ref={rootRef} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
