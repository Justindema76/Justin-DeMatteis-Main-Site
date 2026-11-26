// Shopify Studio pages that aren't era pages: the main page (/shopify-studio, home.html = public home-v9.html)
// and the Jill case study (/shopify-studio/case-study, case-study.html = public case-study-v1.html).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSetting } from '../../../lib/content';
import { STUDIO_DEFAULTS, STUDIO_SETTING_KEY } from '../studioConfig';
import { fillTokens, wireForm } from '../studioShared';
import homeRaw from './home.html?raw';
import caseRaw from './case-study.html?raw';

const PAGES = { home: homeRaw, case: caseRaw };

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
  const page = useMemo(() => split(PAGES[pageKey] || homeRaw), [pageKey]);
  const navigate = useNavigate();
  const rootRef = useRef(null);
  // Package prices and "spots left" come from the Shopify Studio admin settings.
  const [settings, setSettings] = useState(STUDIO_DEFAULTS);
  useEffect(() => {
    let live = true;
    loadSetting(STUDIO_SETTING_KEY, STUDIO_DEFAULTS).then(value => { if (live) setSettings({ ...STUDIO_DEFAULTS, ...(value || {}) }); });
    return () => { live = false; };
  }, []);
  const html = useMemo(() => fillTokens(page.body, settings), [page.body, settings]);

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

  // Page scripts (the store walkthrough slider) and the free-audit form, wired to whatever markup is on the page.
  useEffect(() => {
    page.scripts.forEach(code => new Function(code)());
    const offForm = rootRef.current ? wireForm(rootRef.current, '') : () => {};
    return () => {
      window.__studioHomeCleanup?.();
      delete window.__studioHomeCleanup;
      offForm();
    };
  }, [page, html]);

  // Same-site links move inside the app instead of reloading the page.
  const onClick = event => {
    const a = event.target.closest('a');
    const href = a?.getAttribute('href');
    if (!href || href.startsWith('#') || /^https?:/.test(href) || a.target) return;
    event.preventDefault();
    navigate(href);
  };

  return <div className="studio-home" ref={rootRef} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
