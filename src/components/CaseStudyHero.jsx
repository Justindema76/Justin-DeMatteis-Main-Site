import { Link } from 'react-router-dom';

function HeroLink({ href, children, style = 'primary', newTab = false }) {
  if (!href || !children) return null;
  const className = `work-post-btn ${style === 'secondary' ? 'secondary' : 'primary'}`;
  const external = /^(https?:)?\/\//i.test(href);

  if (external || newTab) {
    return <a
      className={className}
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
    >{children}</a>;
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
  const heroFit = sections.heroImageFit || 'cover';
  const heroRatio = sections.heroImageRatio || '4/3';
  const heroPosition = sections.heroImagePosition || 'center';
  const heroWidth = sections.heroImageWidth || '42';
  const heroRadius = sections.heroImageRadius || '26';
  const visitLabel = `Visit ${post.company || 'Project'} →`;
  const eyebrowType = post.work_type || (typeLabel === 'AI Project' ? 'AI Development' : 'Case Study');
  const primaryEnabled = sections.heroPrimaryEnabled !== false;
  const primaryText = sections.heroPrimaryText || visitLabel;
  const primaryUrl = sections.heroPrimaryUrl || post.project_url || '';
  const primaryStyle = sections.heroPrimaryStyle || 'primary';
  const primaryNewTab = sections.heroPrimaryNewTab !== false;
  const secondaryEnabled = sections.heroSecondaryEnabled !== false;
  const secondaryText = sections.heroSecondaryText || backLabel;
  const secondaryUrl = sections.heroSecondaryUrl || backHref;
  const secondaryStyle = sections.heroSecondaryStyle || 'secondary';
  const secondaryNewTab = sections.heroSecondaryNewTab === true;

  return <section className="work-post-hero">
    <div
      className={`work-post-wrap work-post-hero-grid ${heroImage ? 'has-image' : ''}`}
      style={heroImage ? { '--hero-media-width': `${heroWidth}%` } : undefined}
    >
      <div className="work-post-hero-copy">
        <div className="work-post-eyebrow">{eyebrowType} · {typeLabel}</div>
        <h1>{post.title}</h1>
        {post.excerpt && <p className="work-post-dek">{post.excerpt}</p>}
        {(primaryEnabled || secondaryEnabled) && <div className="work-post-actions">
          {primaryEnabled && <HeroLink href={primaryUrl} style={primaryStyle} newTab={primaryNewTab}>{primaryText}</HeroLink>}
          {secondaryEnabled && <HeroLink href={secondaryUrl} style={secondaryStyle} newTab={secondaryNewTab}>{secondaryText}</HeroLink>}
        </div>}
      </div>
      {heroImage && <figure className="work-post-hero-media">
        <img
          src={heroImage}
          alt={sections.heroImageAlt || post.title || ''}
          style={{
            objectFit: heroFit,
            objectPosition: heroPosition,
            aspectRatio: heroRatio === 'auto' ? 'auto' : heroRatio,
            borderRadius: `${Number(heroRadius) || 0}px`,
          }}
        />
      </figure>}
    </div>
  </section>;
}
