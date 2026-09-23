import { Link } from 'react-router-dom';

function SmartLink({ to = '#', className = '', children }) {
  if (/^https?:\/\//i.test(to) || /^mailto:/i.test(to)) {
    return <a href={to} className={className} target={/^https?:\/\//i.test(to) ? '_blank' : undefined} rel="noreferrer">{children}</a>;
  }
  if (to.startsWith('#')) return <a href={to} className={className}>{children}</a>;
  return <Link to={to} className={className}>{children}</Link>;
}

function ShowcaseHero(p) {
  return <section className="shared-showcase-hero">
    <div className="shared-wrap shared-showcase-grid">
      <div className="shared-showcase-copy">
        <div className="shared-eyebrow">{p.eyebrow}</div>
        <h1>{p.heading} <span>{p.accent}</span></h1>
        <p>{p.text}</p>
        <div className="shared-showcase-actions">
          {p.primaryButtonText && <SmartLink className="shared-btn shared-btn-primary" to={p.primaryButtonUrl}>{p.primaryButtonText}</SmartLink>}
          {p.secondaryButtonText && <SmartLink className="shared-btn shared-btn-secondary" to={p.secondaryButtonUrl}>{p.secondaryButtonText}</SmartLink>}
        </div>
        {p.note && <div className="shared-showcase-note">{p.note}</div>}
      </div>
      <div className="shared-profile-card">
        <div className="shared-browser">
          <div className="shared-browser-top"><i/><i/><i/></div>
          <div className="shared-browser-body">
            <span className="shared-mini-badge">{p.cardBadge}</span>
            <div className="shared-mock-title">{p.cardTitle}</div>
            <p>{p.cardText}</p>
            <div className="shared-mock-flow">
              <span>{p.flow1}</span><span>{p.flow2}</span><span>{p.flow3}</span><span>{p.flow4}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

function ProofStrip(p) {
  return <section className="shared-proof-strip">
    <div className="shared-wrap shared-proof-grid">
      {[[p.item1Title,p.item1Text],[p.item2Title,p.item2Text],[p.item3Title,p.item3Text]].map(([title, copy], i) =>
        <div className="shared-proof" key={i}><strong>{title}</strong><span>{copy}</span></div>
      )}
    </div>
  </section>;
}

function CaseStudy(p) {
  return <section className="shared-section shared-featured-case">
    <div className="shared-wrap">
      <div className="shared-eyebrow">{p.eyebrow}</div>
      <h2 className="shared-section-title">{p.sectionHeading}</h2>
      <p className="shared-lead">{p.sectionText}</p>
      <div className="shared-case-card">
        <div className="shared-case-copy">
          <div className="shared-eyebrow">{p.projectEyebrow}</div>
          <h3>{p.projectHeading}</h3>
          <p>{p.projectText}</p>
          <div className="shared-tag-row">
            {String(p.tags || '').split(',').map(v => v.trim()).filter(Boolean).map(tag => <span className="shared-tag" key={tag}>{tag}</span>)}
          </div>
          {p.buttonText && <SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl}>{p.buttonText}</SmartLink>}
        </div>
        <div className="shared-case-visual">
          <div className="shared-workflow-card">
            <h4>{p.workflowTitle}</h4>
            <div className="shared-workflow-list">
              {[p.step1,p.step2,p.step3,p.step4].map((step, i) => <div className="shared-workflow-item" key={i}><b>{i + 1}</b><span>{step}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

function CardGrid(p) {
  return <section className="shared-card-grid-section">
    <div className="shared-wrap">
      {(p.eyebrow || p.heading || p.text) && <div className="shared-card-grid-heading">
        {p.eyebrow && <div className="shared-eyebrow">{p.eyebrow}</div>}
        {p.heading && <h2 className="shared-section-title">{p.heading}</h2>}
        {p.text && <p className="shared-lead">{p.text}</p>}
      </div>}
      <div className="shared-work-grid">
        {[1,2,3,4].map(i => <article className={`shared-work-card ${p[`item${i}Style`] || 'white'}`} key={i}>
          <div className="shared-card-icon">{p[`item${i}Icon`]}</div>
          <div className="shared-eyebrow">{p[`item${i}Eyebrow`]}</div>
          <h3>{p[`item${i}Title`]}</h3>
          <p>{p[`item${i}Text`]}</p>
        </article>)}
      </div>
    </div>
  </section>;
}

function StorySplit(p) {
  return <section className="shared-section">
    <div className="shared-wrap shared-story-grid">
      <aside className="shared-story-card">
        <div className="shared-eyebrow">{p.leftEyebrow}</div>
        <h3>{p.leftHeading}</h3>
        <p>{p.leftText1}</p>
        <p>{p.leftText2}</p>
      </aside>
      <div>
        <div className="shared-eyebrow">{p.rightEyebrow}</div>
        <h2 className="shared-section-title">{p.rightHeading}</h2>
        <div className="shared-story-points">
          {[1,2,3,4].map(i => <div className="shared-story-point" key={i}>
            <h4>{p[`point${i}Title`]}</h4>
            <p>{p[`point${i}Text`]}</p>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}

function ProcessRows(p) {
  return <section className="shared-section shared-process">
    <div className="shared-wrap shared-process-grid">
      <div>
        <div className="shared-eyebrow">{p.eyebrow}</div>
        <h2 className="shared-section-title">{p.heading}</h2>
        <p className="shared-lead">{p.text}</p>
        <div className="shared-process-note">{p.note}</div>
      </div>
      <div className="shared-process-rows">
        {[1,2,3,4,5].map(i => <div className="shared-process-row" key={i}>
          <strong>{p[`row${i}Label`]}</strong>
          <span>{p[`row${i}Text`]}</span>
        </div>)}
      </div>
    </div>
  </section>;
}

function SkillsGrid(p) {
  return <section className="shared-section shared-skills">
    <div className="shared-wrap">
      <div className="shared-eyebrow">{p.eyebrow}</div>
      <h2 className="shared-section-title">{p.heading}</h2>
      <p className="shared-lead">{p.text}</p>
      <div className="shared-skill-grid">
        {[1,2,3,4,5,6].filter(i => p[`item${i}Title`] || p[`item${i}Text`]).map(i =>
          <div className="shared-skill-card" key={i}>
            <h4>{p[`item${i}Title`]}</h4>
            <p>{p[`item${i}Text`]}</p>
          </div>
        )}
      </div>
    </div>
  </section>;
}

function LargeCta(p) {
  return <section className="shared-large-cta">
    <div className="shared-wrap shared-large-cta-box">
      <div>
        <div className="shared-eyebrow">{p.eyebrow}</div>
        <h2>{p.heading}</h2>
      </div>
      {p.buttonText && <SmartLink className="shared-btn shared-btn-dark" to={p.buttonUrl}>{p.buttonText}</SmartLink>}
    </div>
  </section>;
}

function ProjectCard(p) {
  const HeadingTag = ['h1','h2','h3','h4'].includes(p.headingLevel) ? p.headingLevel : 'h2';
  const tags = String(p.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);

  return <section id={p.anchorId || undefined} className={`standard-project-card panel-${p.panelPosition || 'left'}`}>
    <aside className="standard-project-panel">
      <div className="standard-project-logo">
        {p.logo ? <img src={p.logo} alt={p.logoAlt || ''} loading="lazy" decoding="async"/> : null}
      </div>
      <div>
        <div className="standard-project-company-label">{p.companyLabel}</div>
        <div className="standard-project-company-name">{p.companyName}</div>
        <div className="standard-project-category">{p.category}</div>
      </div>
    </aside>

    <div className="standard-project-content">
      <div className="standard-project-eyebrow">{p.eyebrow}</div>
      <HeadingTag>{p.heading}</HeadingTag>
      <p className="standard-project-summary">{p.summary}</p>

      <div className="standard-project-details">
        <div><span>{p.roleLabel}</span><strong>{p.roleText}</strong></div>
        <div><span>{p.audienceLabel}</span><strong>{p.audienceText}</strong></div>
      </div>

      {tags.length > 0 && <div className="standard-project-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>}

      <div className="standard-project-footer">
        <span>{p.note}</span>
        {p.buttonText && <SmartLink className="standard-project-button" to={p.buttonUrl || '#'}>{p.buttonText}</SmartLink>}
      </div>
    </div>
  </section>;
}

function GenericBlock({ type, p }) {
  if (type === 'HeroBlock') return <section className={`cms-hero hero-heading-${p.headingSize || 'medium'} theme-${p.background || 'light'}`}><div className="shared-wrap cms-hero-grid">
    <div>
      {p.eyebrow && <div className="shared-eyebrow">{p.eyebrow}</div>}
      <h1>{p.heading}</h1>
      <p>{p.text}</p>
      {p.buttonText && <SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl}>{p.buttonText}</SmartLink>}
    </div>
    {p.image && <img src={p.image} alt={p.imageAlt || ''} loading="lazy" decoding="async"/>}
  </div></section>;

  if (type === 'HeadingBlock') {
    const Tag = ['h2','h3','h4'].includes(p.level) ? p.level : 'h2';
    return <section className="cms-block"><div className="shared-wrap" style={{textAlign:p.align || 'left'}}><Tag>{p.text}</Tag></div></section>;
  }

  if (type === 'TextBlock') return <section className="cms-block cms-text"><div className="shared-wrap" style={{textAlign:p.align || 'left'}}><p>{p.text}</p></div></section>;

  if (type === 'ImageBlock') return <section className="cms-block"><div className="shared-wrap">{p.image && <img className="cms-image" src={p.image} alt={p.alt || ''} loading="lazy" decoding="async" style={{width:`${p.width || 100}%`}}/>}</div></section>;

  if (type === 'ImageTextBlock') return <section className={`cms-image-text-section theme-${p.background || 'white'}`}><div className={`shared-wrap cms-image-text ${p.imagePosition === 'right' ? 'image-right' : ''}`}>
    <div>{p.image && <img src={p.image} alt={p.alt || ''} loading="lazy" decoding="async"/>}</div>
    <div><h2>{p.heading}</h2><p>{p.text}</p></div>
  </div></section>;

  if (type === 'CtaBlock') return <section className={`cms-cta theme-${p.background || 'dark'}`}>
    <div className="shared-wrap"><h2>{p.heading}</h2><p>{p.text}</p>{p.buttonText && <SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl}>{p.buttonText}</SmartLink>}</div>
  </section>;

  return null;
}

export default function PageRenderer({ data }) {
  const blocks = Array.isArray(data?.content) ? data.content : [];
  return <main>
    {blocks.map((block, index) => {
      const type = block?.type || '';
      const p = block?.props || {};
      const key = p.id || `${type}-${index}`;

      if (type === 'ShowcaseHeroBlock') return <ShowcaseHero {...p} key={key}/>;
      if (type === 'ProofStripBlock') return <ProofStrip {...p} key={key}/>;
      if (type === 'CaseStudyBlock') return <CaseStudy {...p} key={key}/>;
      if (type === 'CardGridBlock') return <CardGrid {...p} key={key}/>;
      if (type === 'StorySplitBlock') return <StorySplit {...p} key={key}/>;
      if (type === 'ProcessRowsBlock') return <ProcessRows {...p} key={key}/>;
      if (type === 'SkillsGridBlock') return <SkillsGrid {...p} key={key}/>;
      if (type === 'LargeCtaBlock') return <LargeCta {...p} key={key}/>;
      if (type === 'ProjectCardBlock') return <ProjectCard {...p} key={key}/>;
      return <GenericBlock type={type} p={p} key={key}/>;
    })}
  </main>;
}
