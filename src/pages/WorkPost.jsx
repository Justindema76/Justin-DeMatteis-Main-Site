import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadWorkPost, loadWorkPosts } from '../lib/content';
import CaseStudyHero from '../components/CaseStudyHero';

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

function ProjectLink({ href, children, secondary = false }) {
  if (!href) return null;
  const className = `work-post-btn ${secondary ? 'secondary' : 'primary'}`;
  if (/^https?:\/\//i.test(href)) {
    return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
  }
  return <Link className={className} to={href}>{children}</Link>;
}

function youtubeId(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || '';
    const direct = url.searchParams.get('v');
    if (direct) return direct;
    const parts = url.pathname.split('/').filter(Boolean);
    const marker = parts.findIndex(part => ['embed', 'shorts', 'live'].includes(part));
    if (marker >= 0) return parts[marker + 1] || '';
  } catch {}
  return /^[A-Za-z0-9_-]{6,}$/.test(raw) ? raw : '';
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

function Paragraphs({ text }) {
  if (!text) return null;
  return String(text).split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

function sectionId(value = '', index = 0) {
  const slug = String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || `section-${index + 1}`;
}

function hasStructuredSections(sections) {
  if (!sections || typeof sections !== 'object') return false;
  const storyKeys = [
    'overview','overviewSecondary','quote','problem','built','connectedWorkflow',
    'visualsIntro','youtubeHeading','youtubeIntro','youtubeUrl','ongoing'
  ];
  if (storyKeys.some(key => Boolean(sections[key]))) return true;
  return ['extras','gallery','videos','workflow','problemPoints']
    .some(key => Array.isArray(sections[key]) && sections[key].length > 0);
}

function StructuredWorkStory({ sections }) {
  const gallery = Array.isArray(sections.gallery) ? sections.gallery.filter(item => item?.url) : [];
  const videos = Array.isArray(sections.videos) ? sections.videos.filter(item => item?.url) : [];
  const workflow = Array.isArray(sections.workflow) ? sections.workflow.filter(item => item?.title || item?.text) : [];
  const points = Array.isArray(sections.problemPoints) ? sections.problemPoints.filter(Boolean) : [];
  const extras = Array.isArray(sections.extras) ? sections.extras.filter(item => item?.heading || item?.text) : [];
  const ytId = youtubeId(sections.youtubeUrl);

  return <>
    {(sections.overview || sections.overviewSecondary || sections.quote) && <section id="overview" className="work-post-story-section">
      <h2>{sections.overviewHeading || 'Overview'}</h2>
      <Paragraphs text={sections.overview}/>
      <Paragraphs text={sections.overviewSecondary}/>
      {sections.quote && <blockquote>{sections.quote}</blockquote>}
    </section>}

    {(sections.problem || points.length > 0) && <section id="problem" className="work-post-story-section">
      <h2>{sections.problemHeading || 'The business problem'}</h2>
      <Paragraphs text={sections.problem}/>
      {points.length > 0 && <ul>{points.map((point, index) => <li key={index}>{point}</li>)}</ul>}
    </section>}

    {(sections.built || sections.connectedWorkflow) && <section id="solution" className="work-post-story-section">
      <h2>{sections.builtHeading || 'What I built'}</h2>
      <Paragraphs text={sections.built}/>
      {sections.connectedWorkflow && <div className="work-post-callout">
        <strong>Connected workflow</strong>
        <span>{sections.connectedWorkflow}</span>
      </div>}
    </section>}

    {(sections.visualsIntro || gallery.length > 0) && <section id="media" className="work-post-story-section">
      <h2>{sections.visualsHeading || 'Product visuals'}</h2>
      <Paragraphs text={sections.visualsIntro}/>
      {gallery.length > 0 && <div className={`work-post-gallery ${gallery.length === 1 ? 'single' : ''}`}>
        {gallery.map((item, index) => <figure key={item.url || index}>
          <img src={item.url} alt={item.alt || ''} loading="lazy" decoding="async"/>
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>)}
      </div>}
    </section>}

    {(sections.youtubeHeading || sections.youtubeIntro || ytId) && <section id="video" className="work-post-story-section">
      <h2>{sections.youtubeHeading || 'Video demo'}</h2>
      <Paragraphs text={sections.youtubeIntro}/>
      {ytId && <div className="work-post-video">
        <iframe src={`https://www.youtube.com/embed/${ytId}`} title={sections.youtubeHeading || 'Project video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
      </div>}
    </section>}

    {videos.length > 0 && <section id="uploaded-videos" className="work-post-story-section">
      <h2>Project videos</h2>
      <div className="work-post-uploaded-videos">
        {videos.map((item, index) => <figure key={item.url || index}>
          {item.title && <h3>{item.title}</h3>}
          <video controls preload="metadata" src={item.url}/>
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>)}
      </div>
    </section>}

    {workflow.length > 0 && <section id="workflow" className="work-post-story-section">
      <h2>The workflow</h2>
      <div className="work-post-workflow-steps">
        {workflow.map((step, index) => <article key={index}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            {step.title && <h3>{step.title}</h3>}
            <Paragraphs text={step.text}/>
          </div>
        </article>)}
      </div>
    </section>}

    {sections.ongoing && <section id="ongoing" className="work-post-story-section">
      <h2>{sections.ongoingHeading || 'Ongoing work'}</h2>
      <Paragraphs text={sections.ongoing}/>
    </section>}

    {extras.map((section, index) => {
      const id = sectionId(section.heading, index);
      return <section id={id} className="work-post-story-section" key={id}>
        {section.heading && <h2>{section.heading}</h2>}
        <Paragraphs text={section.text}/>
      </section>;
    })}
  </>;
}

export default function WorkPost() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState(undefined);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    let active = true;
    setPost(undefined);
    Promise.all([
      loadWorkPost(slug),
      loadWorkPosts().catch(() => []),
    ])
      .then(([value, list]) => {
        if (!active) return;
        setPost(value);
        setAllPosts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!active) return;
        setPost(null);
        setAllPosts([]);
      });
    return () => { active = false; };
  }, [slug]);

  const sections = post?.sections && typeof post.sections === 'object' ? post.sections : {};
  const structured = hasStructuredSections(sections);
  const tags = Array.isArray(post?.tags) ? post.tags : [];

  const toc = useMemo(() => {
    if (!post) return [];
    if (!structured) {
      const items = [];
      const regex = /<h2[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi;
      let match;
      while ((match = regex.exec(post.body_html || ''))) items.push({ id: match[1], label: String(match[2]).replace(/<[^>]*>/g, '').trim() });
      if (tags.length && sections.techEnabled !== false && !items.some(item => item.id === 'technology')) items.push({ id: 'technology', label: sections.techHeading || 'Technology and tools' });
      return items;
    }

    const items = [];
    if (sections.overview || sections.overviewSecondary || sections.quote) items.push({ id: 'overview', label: sections.overviewHeading || 'Overview' });
    if (sections.problem || sections.problemPoints?.length) items.push({ id: 'problem', label: sections.problemHeading || 'The business problem' });
    if (sections.built || sections.connectedWorkflow) items.push({ id: 'solution', label: sections.builtHeading || 'What I built' });
    if (sections.visualsIntro || sections.gallery?.length) items.push({ id: 'media', label: sections.visualsHeading || 'Product visuals' });
    if (sections.youtubeHeading || sections.youtubeIntro || sections.youtubeUrl) items.push({ id: 'video', label: sections.youtubeHeading || 'Video demo' });
    if (sections.videos?.length) items.push({ id: 'uploaded-videos', label: 'Project videos' });
    if (sections.workflow?.length) items.push({ id: 'workflow', label: 'The workflow' });
    if (sections.ongoing) items.push({ id: 'ongoing', label: sections.ongoingHeading || 'Ongoing work' });
    (sections.extras || []).forEach((section, index) => {
      if (section?.heading) items.push({ id: sectionId(section.heading, index), label: section.heading });
    });
    if (tags.length && sections.techEnabled !== false) items.push({ id: 'technology', label: sections.techHeading || 'Technology and tools' });
    return items;
  }, [post, structured, sections, tags.length]);

  const relatedItems = useMemo(() => {
    if (!post) return [];
    const candidates = allPosts.filter(item => item.slug && item.slug !== post.slug);
    const selected = String(sections.relatedSlugs || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (!selected.length) return candidates.slice(0, 3);
    return selected
      .map(slugValue => candidates.find(item => item.slug === slugValue))
      .filter(Boolean);
  }, [allPosts, post, sections.relatedSlugs]);

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
      keywords: tags.join(', ') || undefined,
      datePublished: post.published_at || undefined,
      dateModified: post.updated_at || post.published_at || undefined,
      inLanguage: 'en-CA',
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [post, tags]);

  if (post === undefined) return <main className="status-page"><p>Loading work…</p></main>;
  if (!post) return <main className="status-page"><h1>Work post not found.</h1></main>;

  return <main className="work-post-page">
    <CaseStudyHero
      post={post}
      sections={sections}
      typeLabel="Case Study"
      backHref="/work"
      backLabel="Back to Work"
    />

    <div className="work-post-wrap">
      <section className="work-post-snapshot" aria-label="Project snapshot">
        <div className="work-post-snapshot-head">
          <div>
            <div className="work-post-eyebrow">Project Snapshot</div>
            <h2>What this project involved.</h2>
          </div>
        </div>

        <div className="work-post-fact-cards">
          {post.company && <article className="project-card project-card-brand">
            <div className="project-card-brand-row">
              {post.featured_image && <div className="project-card-logo">
                <img src={post.featured_image} alt={post.featured_image_alt || post.company || post.title} />
              </div>}
              <div>
                <span>Project</span>
                <strong>{post.company}</strong>
              </div>
            </div>
          </article>}
          {post.role && <article className="project-card">
            <span>Role</span>
            <strong>{post.role}</strong>
          </article>}
          {post.platform && <article className="project-card project-card-soft">
            <span>Platform</span>
            <strong>{post.platform}</strong>
          </article>}
          {post.audience && <article className="project-card">
            <span>Built for</span>
            <strong>{post.audience}</strong>
          </article>}
        </div>
      </section>

      <div className="work-post-article-grid">
        {toc.length > 0 && <aside className="work-post-toc">
          <div className="work-post-toc-title">On this page</div>
          {toc.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
        </aside>}

        <article className="work-post-content">
          {structured
            ? <StructuredWorkStory sections={sections}/>
            : <div dangerouslySetInnerHTML={{ __html: post.body_html || '' }} />}

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
