import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE = 'https://www.justindematteis.com';

const META = {
  '/': ['Justin DeMatteis — Developer, Product Builder & AI-Assisted Problem Solver', 'Justin DeMatteis builds web applications, Shopify tools, ecommerce systems and AI-assisted digital products that solve real business problems.'],
  '/work': ['Work | Justin DeMatteis', 'Selected web, ecommerce, Shopify and product development work by Justin DeMatteis.'],
  '/about': ['About | Justin DeMatteis', 'Mechanical engineering and manufacturing experience translated into web, mobile and product development.'],
  '/ai-development': ['AI + Development | Justin DeMatteis', 'How Justin DeMatteis uses AI as part of a practical software-development workflow.'],
  '/experience': ['Experience | Justin DeMatteis', 'Web, mobile, ecommerce and product-development experience.'],
  '/blog': ['Development Blog | Justin DeMatteis', 'Development notes, project case studies and lessons from building practical software products.'],
  '/contact': ['Contact | Justin DeMatteis', 'Contact Justin DeMatteis about development roles, ecommerce work and product collaboration.'],
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

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const [title, description] = META[location.pathname] || (location.pathname.startsWith('/blog/')
      ? ['Development Blog | Justin DeMatteis', 'Development articles and project notes from Justin DeMatteis.']
      : ['Justin DeMatteis', 'Web, mobile and ecommerce development portfolio.']);

    document.title = title;
    upsertMeta('description', description);
    upsertMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:type', 'website', true);
    upsertMeta('og:url', `${BASE}${location.pathname}`, true);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE}${location.pathname}`;

    let schema = document.head.querySelector('#site-schema');
    if (!schema) {
      schema = document.createElement('script');
      schema.id = 'site-schema';
      schema.type = 'application/ld+json';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      '@context':'https://schema.org',
      '@graph':[
        {'@type':'Person','@id':`${BASE}/#person`,name:'Justin DeMatteis',url:BASE,jobTitle:'Web & Mobile Developer'},
        {'@type':'WebSite','@id':`${BASE}/#website`,url:BASE,name:'Justin DeMatteis',author:{'@id':`${BASE}/#person`},inLanguage:'en-CA'}
      ]
    });
  }, [location.pathname]);

  return null;
}
