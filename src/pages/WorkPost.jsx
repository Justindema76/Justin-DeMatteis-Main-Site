import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadWorkPost } from '../lib/content';

const BASE = 'https://www.justindematteis.com';

function upsertMeta(name, content, property = false) {
  if (!content) return;
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

function stripTags(value = '') {
  return String(value).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
}

function extractToc(html = '') {
  const items = [];
  const regex = /<h2[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi;
  let match;
  while ((match = regex.exec(html))) {
    items.push({ id: match[1], label: stripTags(match[2]) });
  }
  return items;
}

function ProjectLink({ href, children, secondary = false }) {
  if (!href) return null;
  const className = `work-post-btn ${secondary ? 'secondary' : 'primary'}`;
  if (/^https?:\/\//i.test(href)) {
    return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
  }
  return <Link className={className} to={href}>{children}</Link>;
}

function technologyCards(tags = []) {
  const groups = [
    { title: 'Frontend', match: /react|html|css|javascript|typescript|angular|responsive|mobile/i, items: [] },
    { title: 'Backend & Data', match: /supabase|rest|api|node|express|php|mysql|database|data/i, items: [] },
    { title: 'Commerce', match: /shopify|pos|adobe commerce|magento|wordpress|ecommerce/i, items: [] },
    { title: 'Workflow', match: /.*/, items: [] },
  ];

  for (const tag of tags) {
    const group = groups.find(item => item.title !== 'Workflow' && item.match.test(tag)) || groups[3];
    if (!group.items.includes(tag)) group.items.push(tag);
  }

  return groups.filter(group => group.items.length);
}

export default function WorkPost() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    let active = true;
    setPost(undefined);
    loadWorkPost(slug)
      .then(value => { if (active) setPost(value); })
      .catch(() => { if (active) setPost(null); });
    return () => { active = false; };
  }, [slug]);

  const toc = useMemo(() => {
    const items = extractToc(post?.body_html || '');
    if (Array.isArray(post?.tags) && post.tags.length && !items.some(item => item.id === 'technology')) {
      items.push({ id: 'technology', label: 'Technology and tools' });
    }
    return items;
  }, [post?.body_html, post?.tags]);

  useEffect(() => {
    if (!post) return;
    const canonical = `${BASE}/work/${post.slug}`;
    const title = post.seo_title || `${post.title} | Justin DeMatteis`;
    const description = post.seo_description || post.excerpt || '';
    const image = post.og_image || post.featured_image || '';

    document.title = title;
    upsertMeta('description', description);
    upsertMeta('og:type', 'article', true);
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:url', canonical, true);
    if (image) {
      upsertMeta('og:image', image, true);
      upsertMeta('twitter:card', 'summary_large_image');
      upsertMeta('twitter:image', image);
    }
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    setCanonical(canonical);

    const id = 'work-post-schema';
    document.getElementById(id)?.remove();
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: post.title,
      description,
      url: canonical,
      image: image || undefined,
      creator: { '@type': 'Person', name: 'Justin DeMatteis', url: BASE },
      about: post.work_type || undefined,
      keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
      datePublished: post.published_at || undefined,
      dateModified: post.updated_at || post.published_at || undefined,
      inLanguage: 'en-CA',
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [post]);

  if (post === undefined) return <main className="status-page"><p>Loading work…</p></main>;
  if (!post) return <main className="status-page"><h1>Work post not found.</h1></main>;

  const tags = Array.isArray(post.tags) ? post.tags : [];

  return <main className="work-post-page">
    <section className="work-post-hero">
      <div className="work-post-wrap work-post-hero-grid">
        <div className="work-post-hero-copy">
          <div className="work-post-eyebrow">{post.work_type || 'Case Study'} · Case Study</div>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="work-post-dek">{post.excerpt}</p>}
          <div className="work-post-actions">
            <ProjectLink href={post.project_url}>Visit {post.company || 'Project'} →</ProjectLink>
            <ProjectLink href="/work" secondary>Back to Work</ProjectLink>
          </div>
          {post.role && <div className="work-post-note">{post.role}</div>}
        </div>

        {post.featured_image && <div className="work-post-logo-card">
          <img src={post.featured_image} alt={post.featured_image_alt || post.company || post.title} />
        </div>}
      </div>
    </section>

    <div className="work-post-wrap">
      <section className="work-post-fact-cards" aria-label="Project details">
        {post.company && <article><span>Project</span><strong>{post.company}</strong></article>}
        {post.role && <article><span>Role</span><strong>{post.role}</strong></article>}
        {post.platform && <article><span>Platform</span><strong>{post.platform}</strong></article>}
        {post.audience && <article><span>Built for</span><strong>{post.audience}</strong></article>}
      </section>

      <div className="work-post-article-grid">
        {toc.length > 0 && <aside className="work-post-toc">
          <div className="work-post-toc-title">On this page</div>
          {toc.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
        </aside>}

        <article className="work-post-content">
          <div dangerouslySetInnerHTML={{ __html: post.body_html || '' }} />

          {tags.length > 0 && <section className="work-post-tech-section">
            <div className="work-post-eyebrow">Technology</div>
            <h2 id="technology">What I used to build it.</h2>
            <div className="work-post-tech-cards">
              {technologyCards(tags).map(group => <article key={group.title}>
                <strong>{group.title}</strong>
                <p>{group.items.join(' · ')}</p>
              </article>)}
            </div>
          </section>}

          <section className="work-post-cta">
            <div>
              <div className="work-post-eyebrow">Live Product</div>
              <h2>See {post.company || 'the project'} in action.</h2>
              <p>This Work Post can continue growing as the product changes.</p>
            </div>
            <ProjectLink href={post.project_url}>Visit {post.company || 'Project'} →</ProjectLink>
          </section>
        </article>
      </div>

      <section className="work-post-related">
        <div className="work-post-eyebrow">More Work</div>
        <h2>Related projects</h2>
        <div className="work-post-related-grid">
          <Link to="/work/wheels-automotive"><span>B2B Ecommerce</span><strong>Wheels Automotive</strong><p>Adobe Commerce / Magento frontend work, QA, PageBuilder, SEO and launch support.</p></Link>
          <Link to="/work/jill-and-the-beanstalk"><span>Shopify Ecommerce</span><strong>Jill & The Beanstalk</strong><p>SEO, storefront improvements, ecommerce integrations and ongoing optimization.</p></Link>
          <Link to="/work/wordpress-websites"><span>Web Development</span><strong>WordPress Websites</strong><p>Responsive small-business websites, forms, SEO, content and ongoing support.</p></Link>
        </div>
      </section>
    </div>
  </main>;
}
