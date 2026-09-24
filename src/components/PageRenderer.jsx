import { Link } from 'react-router-dom';

const SHOWCASE_IMAGE = '/images/projects/justconsignin-showcase.svg';

function BlockHeading({ level = 'h2', className = '', children }) {
  const Tag = ['h1','h2','h3','h4'].includes(level) ? level : 'h2';
  return <Tag className={`${className} heading-level-${Tag}`.trim()}>{children}</Tag>;
}

function SmartLink({ to = '#', className = '', children }) {
  if (/^https?:\/\//i.test(to) || /^mailto:/i.test(to)) {
    return <a href={to} className={className} target={/^https?:\/\//i.test(to) ? '_blank' : undefined} rel="noreferrer">{children}</a>;
  }
  if (to.startsWith('#')) return <a href={to} className={className}>{children}</a>;
  return <Link to={to} className={className}>{children}</Link>;
}

function ShowcaseHero(p) {
  const image = p.image || SHOWCASE_IMAGE;
  return <section className="shared-showcase-hero">
    <div className="shared-wrap shared-showcase-grid">
      <div className="shared-showcase-copy">
        <div className="shared-eyebrow">{p.eyebrow}</div>
        <BlockHeading level={p.headingLevel || 'h1'} className="shared-showcase-heading">{p.heading} {p.accent && <span>{p.accent}</span>}</BlockHeading>
        <p>{p.text}</p>
        <div className="shared-showcase-actions">
          {p.primaryButtonText && <SmartLink className="shared-btn shared-btn-primary" to={p.primaryButtonUrl}>{p.primaryButtonText}</SmartLink>}
          {p.secondaryButtonText && <SmartLink className="shared-btn shared-btn-secondary" to={p.secondaryButtonUrl}>{p.secondaryButtonText}</SmartLink>}
        </div>
        {p.note && <div className="shared-showcase-note">{p.note}</div>}
      </div>
      <div className="shared-showcase-image">
        <img src={image} alt={p.imageAlt || 'JustConsignIn featured project'} loading="eager" decoding="async"/>
      </div>
    </div>
  </section>;
}

function ProofStrip(p) {
  return <section className="shared-proof-strip">
    <div className="shared-wrap shared-proof-grid">
      {[[p.item1Title,p.item1Text],[p.item2Title,p.item2Text],[p.item3Title,p.item3Text]].map(([title, copy], i) =>
        <div className="shared-proof" key={i}><BlockHeading level={p.itemHeadingLevel || 'h3'} className="shared-proof-title">{title}</BlockHeading><span>{copy}</span></div>
      )}
    </div>
  </section>;
}

function CaseStudy(p) {
  return <section className="shared-section shared-featured-case">
    <div className="shared-wrap">
      <div className="shared-eyebrow">{p.eyebrow}</div>
      <BlockHeading level={p.sectionHeadingLevel || 'h2'} className="shared-section-title">{p.sectionHeading}</BlockHeading>
      <p className="shared-lead">{p.sectionText}</p>
      <div className="shared-case-card">
        <div className="shared-case-copy">
          <div className="shared-eyebrow">{p.projectEyebrow}</div>
          <BlockHeading level={p.projectHeadingLevel || 'h3'} className="shared-case-heading">{p.projectHeading}</BlockHeading>
          <p>{p.projectText}</p>
          <div className="shared-tag-row">
            {String(p.tags || '').split(',').map(v => v.trim()).filter(Boolean).map(tag => <span className="shared-tag" key={tag}>{tag}</span>)}
          </div>
          {p.buttonText && <SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl}>{p.buttonText}</SmartLink>}
        </div>
        <div className="shared-case-visual">
          <div className="shared-workflow-card">
            <BlockHeading level={p.workflowHeadingLevel || 'h4'} className="shared-workflow-heading">{p.workflowTitle}</BlockHeading>
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
        {p.heading && <BlockHeading level={p.headingLevel || 'h2'} className="shared-section-title">{p.heading}</BlockHeading>}
        {p.text && <p className="shared-lead">{p.text}</p>}
      </div>}
      <div className="shared-work-grid">
        {[1,2,3,4].map(i => <article className={`shared-work-card ${p[`item${i}Style`] || 'white'}`} key={i}>
          <div className="shared-card-icon">{p[`item${i}Icon`]}</div>
          <div className="shared-eyebrow">{p[`item${i}Eyebrow`]}</div>
          <BlockHeading level={p.itemHeadingLevel || 'h3'} className="shared-work-card-heading">{p[`item${i}Title`]}</BlockHeading>
          <p>{p[`item${i}Text`]}</p>
        </article>)}
      </div>
      {p.buttonText && <div className="shared-section-cta"><SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl || '/work'}>{p.buttonText}</SmartLink></div>}
    </div>
  </section>;
}

function StorySplit(p) {
  return <section className="shared-section">
    <div className="shared-wrap shared-story-grid">
      <aside className="shared-story-card">
        <div className="shared-eyebrow">{p.leftEyebrow}</div>
        <BlockHeading level={p.leftHeadingLevel || 'h3'} className="shared-story-card-heading">{p.leftHeading}</BlockHeading>
        <p>{p.leftText1}</p>
        <p>{p.leftText2}</p>
      </aside>
      <div>
        <div className="shared-eyebrow">{p.rightEyebrow}</div>
        <BlockHeading level={p.rightHeadingLevel || 'h2'} className="shared-section-title">{p.rightHeading}</BlockHeading>
        <div className="shared-story-points">
          {[1,2,3,4].map(i => <div className="shared-story-point" key={i}>
            <BlockHeading level={p.pointHeadingLevel || 'h4'} className="shared-story-point-heading">{p[`point${i}Title`]}</BlockHeading>
            <p>{p[`point${i}Text`]}</p>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}

function ProcessRows(p) {
  return <section className="shared-section shared-process">
    <div className="shared-wrap">
      <div className="shared-process-grid">
        <div>
          <div className="shared-eyebrow">{p.eyebrow}</div>
          <BlockHeading level={p.headingLevel || 'h2'} className="shared-section-title">{p.heading}</BlockHeading>
          <p className="shared-lead">{p.text}</p>
          <div className="shared-process-note">{p.note}</div>
        </div>
        <div className="shared-process-rows">
          {[1,2,3,4,5].map(i => <div className="shared-process-row" key={i}>
            <BlockHeading level={p.rowHeadingLevel || 'h4'} className="shared-process-row-heading">{p[`row${i}Label`]}</BlockHeading>
            <span>{p[`row${i}Text`]}</span>
          </div>)}
        </div>
      </div>
      {p.buttonText && <div className="shared-section-cta"><SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl || '/ai-development'}>{p.buttonText}</SmartLink></div>}
    </div>
  </section>;
}

function SkillsGrid(p) {
  return <section className="shared-section shared-skills" id={p.anchorId || undefined}>
    <div className="shared-wrap">
      <div className="shared-eyebrow">{p.eyebrow}</div>
      <BlockHeading level={p.headingLevel || 'h2'} className="shared-section-title">{p.heading}</BlockHeading>
      <p className="shared-lead">{p.text}</p>
      <div className="shared-skill-grid">
        {[1,2,3,4,5,6].filter(i => p[`item${i}Title`] || p[`item${i}Text`]).map(i => {
          const tags = String(p[`item${i}Tags`] || '').split(',').map(v => v.trim()).filter(Boolean);
          return <div className="shared-skill-card" key={i}>
            <BlockHeading level={p.itemHeadingLevel || 'h4'} className="shared-skill-card-heading">{p[`item${i}Title`]}</BlockHeading>
            <p>{p[`item${i}Text`]}</p>
            {tags.length > 0 && <div className="shared-skill-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          </div>;
        })}
      </div>
    </div>
  </section>;
}

function ResumeSkills(p) {
  const defaults = {
    eyebrow:'RESUME',
    heading:'Skills',
    headingLevel:'h2',
    itemHeadingLevel:'h4',
    text:'Development, ecommerce, data, SEO and delivery skills used across real client work and application projects.',
    item1Title:'Frontend Development',
    item1Text:'Responsive web interfaces, component-based applications and mobile-first user experiences.',
    item1Tags:'HTML, CSS, JavaScript, React, Angular, TypeScript, Bootstrap',
    item2Title:'Backend & Data',
    item2Text:'APIs, application logic, relational data and cloud-backed application workflows.',
    item2Tags:'Node, Express, PHP, MySQL, Supabase, REST APIs',
    item3Title:'Ecommerce',
    item3Text:'Storefront development, product workflows, integrations, B2B testing and ecommerce operations.',
    item3Tags:'Shopify, Shopify POS, Adobe Commerce, Magento 2, WordPress',
    item4Title:'SEO & Digital',
    item4Text:'Technical and on-page optimization, content architecture, search visibility and ecommerce content.',
    item4Tags:'Technical SEO, Search Console, Analytics, Product Content, Category Content',
    item5Title:'Development & Delivery',
    item5Text:'Source control, deployment, QA, debugging and production delivery.',
    item5Tags:'Git, GitHub, Vercel, Linux, QA, Deployment',
    item6Title:'AI-Assisted Development',
    item6Text:'Using AI throughout research, architecture, prototyping, debugging, iteration and documentation.',
    item6Tags:'Research, Architecture, Prototyping, Debugging, Refactoring',
  };
  const d = { ...defaults, ...p };
  return <section className="resume-skills-section" id={d.anchorId || undefined}>
    <div className="shared-wrap">
      <div className="resume-skills-head">
        <div className="resume-skills-title">
          <div className="shared-eyebrow">{d.eyebrow}</div>
          <BlockHeading level={d.headingLevel || 'h2'} className="resume-skills-heading">{d.heading}</BlockHeading>
        </div>
        <p className="resume-skills-intro">{d.text}</p>
      </div>
      <div className="resume-skills-divider"/>
      <div className="resume-skills-grid">
        {[1,2,3,4,5,6].filter(i => d[`item${i}Title`] || d[`item${i}Text`]).map(i => {
          const tags = String(d[`item${i}Tags`] || '').split(',').map(v => v.trim()).filter(Boolean);
          return <article className="resume-skill-card" key={i}>
            <BlockHeading level={d.itemHeadingLevel || 'h4'} className="resume-skill-card-title">{d[`item${i}Title`]}</BlockHeading>
            <p>{d[`item${i}Text`]}</p>
            {tags.length > 0 && <div className="resume-skill-pills">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          </article>;
        })}
      </div>
      {d.buttonText && <div className="shared-section-cta"><SmartLink className="shared-btn shared-btn-primary" to={d.buttonUrl || '/skills'}>{d.buttonText}</SmartLink></div>}
    </div>
  </section>;
}

function LargeCta(p) {
  return <section className="shared-large-cta">
    <div className="shared-wrap shared-large-cta-box">
      <div>
        <div className="shared-eyebrow">{p.eyebrow}</div>
        <BlockHeading level={p.headingLevel || 'h2'} className="shared-large-cta-heading">{p.heading}</BlockHeading>
      </div>
      {p.buttonText && <SmartLink className="shared-btn shared-btn-dark" to={p.buttonUrl}>{p.buttonText}</SmartLink>}
    </div>
  </section>;
}

function ProjectCard(p) {
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
      <BlockHeading level={p.headingLevel || 'h2'} className="standard-project-heading">{p.heading}</BlockHeading>
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
  if (type === 'HeroBlock') {
    const primaryButtonText = p.primaryButtonText ?? p.buttonText ?? '';
    const primaryButtonUrl = p.primaryButtonUrl ?? p.buttonUrl ?? '#';
    return <section className={`cms-hero showcase-style-hero theme-${p.background || 'light'} ${p.image ? 'with-media' : 'without-media'}`}>
      <div className="shared-wrap cms-hero-grid">
        <div className="cms-hero-copy">
          {p.eyebrow && <div className="shared-eyebrow">{p.eyebrow}</div>}
          <BlockHeading level={p.headingLevel || 'h1'} className="cms-hero-heading">{p.heading}{p.accent ? <> <span>{p.accent}</span></> : null}</BlockHeading>
          {p.text && <p>{p.text}</p>}
          {(primaryButtonText || p.secondaryButtonText) && <div className="shared-showcase-actions">
            {primaryButtonText && <SmartLink className="shared-btn shared-btn-primary" to={primaryButtonUrl}>{primaryButtonText}</SmartLink>}
            {p.secondaryButtonText && <SmartLink className="shared-btn shared-btn-secondary" to={p.secondaryButtonUrl || '#'}>{p.secondaryButtonText}</SmartLink>}
          </div>}
          {p.note && <div className="shared-showcase-note">{p.note}</div>}
        </div>
        {p.image && <img src={p.image} alt={p.imageAlt || ''} loading="lazy" decoding="async"/>}
      </div>
    </section>;
  }

  if (type === 'HeadingBlock') {
    const Tag = ['h1','h2','h3','h4'].includes(p.level) ? p.level : 'h2';
    return <section className="cms-block"><div className="shared-wrap" style={{textAlign:p.align || 'left'}}><Tag>{p.text}</Tag></div></section>;
  }

  if (type === 'TextBlock') return <section className="cms-block cms-text"><div className="shared-wrap" style={{textAlign:p.align || 'left'}}><p>{p.text}</p></div></section>;

  if (type === 'ImageBlock') return <section className="cms-block"><div className="shared-wrap">{p.image && <img className="cms-image" src={p.image} alt={p.alt || ''} loading="lazy" decoding="async" style={{width:`${p.width || 100}%`}}/>}</div></section>;

  if (type === 'ImageTextBlock') return <section className={`cms-image-text-section theme-${p.background || 'white'}`}><div className={`shared-wrap cms-image-text ${p.imagePosition === 'right' ? 'image-right' : ''}`}>
    <div>{p.image && <img src={p.image} alt={p.alt || ''} loading="lazy" decoding="async"/>}</div>
    <div><BlockHeading level={p.headingLevel || 'h2'} className="cms-image-text-heading">{p.heading}</BlockHeading><p>{p.text}</p></div>
  </div></section>;

  if (type === 'CtaBlock') return <section className={`cms-cta theme-${p.background || 'dark'}`}>
    <div className="shared-wrap"><BlockHeading level={p.headingLevel || 'h2'} className="cms-cta-heading">{p.heading}</BlockHeading><p>{p.text}</p>{p.buttonText && <SmartLink className="shared-btn shared-btn-primary" to={p.buttonUrl}>{p.buttonText}</SmartLink>}</div>
  </section>;

  return null;
}

function defaultBlockBackground(type, p = {}) {
  if (p.background) return p.background;
  if (['HeroBlock','ResumeHeroBlock','ShowcaseHeroBlock'].includes(type)) return 'light';
  if (['ProcessRowsBlock','ResumeAiBlock','CtaBlock'].includes(type)) return 'dark';
  if (['LargeCtaBlock','ResumeContactBlock'].includes(type)) return 'primary';
  if (type === 'ProjectCardBlock') return 'page';
  return 'white';
}

export default function PageRenderer({ data }) {
  const blocks = Array.isArray(data?.content) ? data.content : [];

  return <main>
    {blocks.map((block, index) => {
      const type = block?.type || '';
      const p = block?.props || {};
      const key = p.id || `${type}-${index}`;
      const background = defaultBlockBackground(type, p);
      let rendered = null;

      if (type === 'ShowcaseHeroBlock') rendered = <ShowcaseHero {...p}/>;
      else if (type === 'ProofStripBlock') rendered = <ProofStrip {...p}/>;
      else if (type === 'CaseStudyBlock') rendered = <CaseStudy {...p}/>;
      else if (type === 'CardGridBlock') rendered = <CardGrid {...p}/>;
      else if (type === 'StorySplitBlock') rendered = <StorySplit {...p}/>;
      else if (type === 'ProcessRowsBlock') rendered = <ProcessRows {...p}/>;
      else if (type === 'SkillsGridBlock') rendered = <SkillsGrid {...p}/>;
      else if (type === 'LargeCtaBlock') rendered = <LargeCta {...p}/>;
      else if (type === 'ProjectCardBlock') rendered = <ProjectCard {...p}/>;
      else if (type === 'ResumeHeroBlock') rendered = <GenericBlock type="HeroBlock" p={p}/>;
      else if (type === 'ResumeSkillsBlock') rendered = <ResumeSkills {...p}/>;
      else if (['ResumeWorkBlock','ResumeProjectsBlock','ResumeEducationBlock'].includes(type)) rendered = <SkillsGrid {...p}/>;
      else if (type === 'ResumeAiBlock') rendered = <ProcessRows {...p}/>;
      else if (type === 'ResumeAboutBlock') rendered = <StorySplit {...p}/>;
      else if (type === 'ResumeContactBlock') rendered = <LargeCta {...p}/>;
      else rendered = <GenericBlock type={type} p={p}/>;

      if (!rendered) return null;

      return <div
        key={key}
        className={`page-block-surface theme-${background} block-${type}`}
        data-block-type={type}
        data-block-background={background}
      >
        {rendered}
      </div>;
    })}
  </main>;
}
