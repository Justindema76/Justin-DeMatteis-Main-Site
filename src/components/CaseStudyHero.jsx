import { Link } from 'react-router-dom';

function HeroLink({ href, children, secondary = false }) {
  if (!href) return null;
  const className = `work-post-btn ${secondary ? 'secondary' : 'primary'}`;
  if (/^https?:\/\//i.test(href)) {
    return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
  }
  return <Link className={className} to={href}>{children}</Link>;
}

export default function CaseStudyHero({
  post,
  sections = {},
  typeLabel = 'Case Study',
  backHref = '/work',
  backLabel = 'Back to Work',
}) {
  const heroImage = sections.heroImage || '';
  const visitLabel = `Visit ${post.company || 'Project'} →`;
  const eyebrowType = post.work_type || (typeLabel === 'AI Project' ? 'AI Development' : 'Case Study');

  return <section className="work-post-hero">
    <div className={`work-post-wrap work-post-hero-grid ${heroImage ? 'has-image' : ''}`}>
      <div className="work-post-hero-copy">
        <div className="work-post-eyebrow">{eyebrowType} · {typeLabel}</div>
        <h1>{post.title}</h1>
        {post.excerpt && <p className="work-post-dek">{post.excerpt}</p>}
        <div className="work-post-actions">
          <HeroLink href={post.project_url}>{visitLabel}</HeroLink>
          <HeroLink href={backHref} secondary>{backLabel}</HeroLink>
        </div>
      </div>
      {heroImage && <figure className="work-post-hero-media">
        <img src={heroImage} alt={sections.heroImageAlt || post.title || ''}/>
      </figure>}
    </div>
  </section>;
}
