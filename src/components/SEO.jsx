import { useEffect, useState } from 'react';
import { loadSetting } from '../lib/content';
import { DESIGNS, designSeo, pageSeo } from '../features/shopify-studio/studioSite';
import { useLocation } from 'react-router-dom';

const BASE = 'https://www.justindematteis.com';

const META = {
  '/shopify-studio': {
    title: 'Custom Shopify Stores & Apps for Independent Retailers | Justin DeMatteis',
    description: 'Custom Shopify store design, features and apps for independent retailers in Ontario and across Canada. Get a free store review.',
  },
  '/shopify-studio/pricing': {
    title: 'Shopify Pricing: Store Builds, Redesigns, SEO, Apps & Monthly Care | Justin DeMatteis',
    description: 'Shopify pricing in CAD: new stores from $3,500, redesigns from $2,500, product and backend cleanup from $1,500, custom apps from $1,000, SEO from $500 and monthly store management from $375/month. Free store review first.',
  },
  '/shopify-studio/case-study': {
    title: 'Jill & The Beanstalk Shopify Case Study: +90% Online Revenue | Justin DeMatteis',
    description: 'How a Toronto kids\' shop went from a free theme to a custom Shopify store, reached the first page of Google and grew online revenue 90% with no ad spend.',
  },
  '/': {
    title: 'Justin DeMatteis — Developer, Product Builder & AI-Assisted Problem Solver',
    description: 'Justin DeMatteis builds web applications, Shopify tools, ecommerce systems and AI-assisted digital products that solve real business problems.',
  },
  '/work': {
    title: 'Web, Shopify & Ecommerce Work | Justin DeMatteis',
    description: 'Selected work by Justin DeMatteis across Shopify, ecommerce, custom web applications, internal tools and real business workflows.',
  },
  '/work/justconsignin': {
    title: 'JustConsignIn Case Study | Shopify Consignment Software | Justin DeMatteis',
    description: 'Case study: how Justin DeMatteis designed and built JustConsignIn, a Shopify consignment application connecting intake, products, POS sales, commissions and payouts.',
  },
  '/work/jill-and-the-beanstalk': {
    title: 'Jill & The Beanstalk Case Study | Shopify SEO & Ecommerce Growth',
    description: 'Shopify ecommerce, SEO, content, search visibility and growth work by Justin DeMatteis for Jill & The Beanstalk.',
  },
  '/work/wheels-automotive': {
    title: 'Wheels Automotive Case Study | Adobe Commerce & Magento B2B',
    description: 'Adobe Commerce and Magento B2B ecommerce case study covering frontend work, PageBuilder, QA, SEO, product content and launch support.',
  },
  '/work/wordpress-websites': {
    title: 'WordPress Website Projects | Elementor, SEO & Responsive Development',
    description: 'WordPress and Elementor client website work by Justin DeMatteis, including responsive builds, forms, SEO, content integration and ongoing support.',
  },
  '/about': {
    title: 'About Justin DeMatteis | Developer, Product Builder & Ecommerce',
    description: 'Justin DeMatteis combines an engineering and manufacturing background with web development, ecommerce, Shopify, Adobe Commerce and AI-assisted product development.',
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
  // Shopify Studio SEO overrides from the admin (loaded once, only on Studio pages).
  const [studio, setStudio] = useState(null);
  const onStudio = location.pathname.startsWith('/shopify-studio');
  useEffect(() => {
    if (!onStudio || studio) return;
    loadSetting('global_shopify-studio', {}).then(value => setStudio(value || {}));
  }, [onStudio, studio]);

  useEffect(() => {
    // Shopify Studio: pricing and case study have their own tags; era pages share the main page's;
    // the old /jill-and-the-beanstalk addresses point at the case study.
    const studioPath = META[location.pathname] ? '' : location.pathname.startsWith('/shopify-studio/jill-and-the-beanstalk') ? '/shopify-studio/case-study'
      : location.pathname.startsWith('/shopify-studio') ? '/shopify-studio' : '';
    const design = DESIGNS.find(d => location.pathname === `/shopify-studio/${d.key}`);
    const eraMatch = design ? [location.pathname, design.key] : null;
    const eraMeta = design ? designSeo(design, studio || {}) : pageSeo(location.pathname, studio || {});
    const meta = eraMeta || META[location.pathname] || META[studioPath] || (location.pathname.startsWith('/blog/')
      ? {
          title: 'Development Blog | Justin DeMatteis',
          description: 'Development articles and project notes from Justin DeMatteis.',
        }
      : {
          title: 'Justin DeMatteis',
          description: 'Web, mobile, ecommerce and AI-assisted product development portfolio.',
        });

    const canonicalPath = (eraMatch || pageSeo(location.pathname)) ? location.pathname : (studioPath || location.pathname);
    const canonical = `${BASE}${canonicalPath === '/' ? '/' : canonicalPath}`;

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

    // Meta Pixel sends the first PageView itself when it loads; later route changes are sent here.
    if (typeof window.fbq === 'function' && window.__jdRouted) window.fbq('track', 'PageView');
    window.__jdRouted = true;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: meta.title,
        page_location: window.location.href,
        page_path: `${location.pathname}${location.search || ''}`,
      });
    }
  }, [location.pathname, location.search, studio]);

  return null;
}
