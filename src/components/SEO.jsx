import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE = 'https://www.justindematteis.com';

const META = {
  '/': {
    title: 'Justin DeMatteis — Developer, Product Builder & AI-Assisted Problem Solver',
    description: 'Justin DeMatteis builds web applications, Shopify tools, ecommerce systems and AI-assisted digital products that solve real business problems.',
  },
  '/work': {
    title: 'Web, Shopify & Ecommerce Work | Justin DeMatteis',
    description: 'Selected work by Justin DeMatteis across Shopify, ecommerce, custom web applications, internal tools and real business workflows.',
  },
  '/about': {
    title: 'About Justin DeMatteis | Developer & Product Builder',
    description: 'Justin DeMatteis brings mechanical engineering, CNC programming and tool & die experience into practical web, mobile and product development.',
  },
  '/ai-development': {
    title: 'AI-Assisted Software Development | Justin DeMatteis',
    description: 'How Justin DeMatteis uses AI for research, architecture, prototyping, coding, debugging and iteration while keeping product decisions human-led.',
  },
  '/experience': {
    title: 'Development Experience & Skills | Justin DeMatteis',
    description: 'Web, mobile, Shopify, Adobe Commerce, React, JavaScript, TypeScript, Node, PHP, MySQL, Supabase and ecommerce development experience.',
  },
  '/blog': {
    title: 'Development Blog | Justin DeMatteis',
    description: 'Development notes, project case studies, ecommerce work and lessons from building practical software products.',
  },
  '/contact': {
    title: 'Contact Justin DeMatteis | Web & Ecommerce Developer',
    description: 'Contact Justin DeMatteis about web development, ecommerce, Shopify, product development, collaboration and selected projects.',
  },
};

function upsertMeta(name, content, property = false) {
  const key = property ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${key}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const meta = META[location.pathname] || (location.pathname.startsWith('/blog/')
      ? {
          title: 'Development Blog | Justin DeMatteis',
          description: 'Development articles and project notes from Justin DeMatteis.',
        }
      : {
          title: 'Justin DeMatteis',
          description: 'Web, mobile, ecommerce and AI-assisted product development portfolio.',
        });

    const canonical = `${BASE}${location.pathname === '/' ? '/' : location.pathname}`;

    document.title = meta.title;
    upsertMeta('description', meta.description);
    upsertMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    upsertMeta('author', 'Justin DeMatteis');
    upsertMeta('og:site_name', 'Justin DeMatteis — JUST INNOVATE.', true);
    upsertMeta('og:locale', 'en_CA', true);
    upsertMeta('og:title', meta.title, true);
    upsertMeta('og:description', meta.description, true);
    upsertMeta('og:type', location.pathname.startsWith('/blog/') ? 'article' : 'website', true);
    upsertMeta('og:url', canonical, true);
    upsertMeta('twitter:card', 'summary');
    upsertMeta('twitter:title', meta.title);
    upsertMeta('twitter:description', meta.description);
    setCanonical(canonical);
  }, [location.pathname]);

  return null;
}
