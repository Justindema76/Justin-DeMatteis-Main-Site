// Shopify Studio main page (/shopify-studio): explains the studio and lets visitors pick an era.
// The page itself lives in home.html (same file as the public/shopify-studio/home-v1.html preview).
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import raw from './home.html?raw';

function split(html) {
  const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const fonts = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  const body = (html.match(/<body>([\s\S]*?)<\/body>/) || [])[1] || '';
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  return { style, fonts, body, title };
}

export default function StudioHome() {
  const page = useMemo(() => split(raw), []);
  const navigate = useNavigate();

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
    window.scrollTo(0, 0);
    return () => { style.remove(); links.forEach(l => l.remove()); document.title = oldTitle; };
  }, [page]);

  // Same-site links move inside the app instead of reloading the page.
  const onClick = event => {
    const a = event.target.closest('a');
    const href = a?.getAttribute('href');
    if (!href || href.startsWith('#') || /^https?:/.test(href) || a.target) return;
    event.preventDefault();
    navigate(href);
  };

  return <div className="studio-home" onClick={onClick} dangerouslySetInnerHTML={{ __html: page.body }} />;
}
