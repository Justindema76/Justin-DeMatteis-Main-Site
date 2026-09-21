export default function WorkBlockPreview() {
  return <main className="work-block-preview-page">
    <div className="shared-wrap">
      <div className="work-block-preview-label">STANDARD · Project Card</div>

      <article className="work-project-card">
        <aside className="work-project-brand">
          <div className="work-project-logo">
            <img
              src="https://www.justconsignin.com/images/brand/justconsigin-logo.png"
              alt="JustConsignIn"
            />
          </div>

          <div>
            <div className="work-project-company-label">Company / Product</div>
            <div className="work-project-company">JustConsignIn</div>
            <div className="work-project-category">Shopify App · Consignment Management</div>
          </div>
        </aside>

        <div className="work-project-content">
          <div className="work-project-kicker">Featured Work</div>

          <h1>Building a Shopify-native consignment system from a real retail workflow.</h1>

          <p className="work-project-summary">
            JustConsignIn started with the day-to-day consignment process at Jill &amp; The Beanstalk.
            I designed and built a working application that connects consignor intake, inventory,
            Shopify product creation, POS sales, commission tracking and payouts in one workflow.
          </p>

          <div className="work-project-details">
            <div className="work-project-detail">
              <span>My role</span>
              <strong>Product Design · Full-Stack Development · UX · Shopify Integration</strong>
            </div>

            <div className="work-project-detail">
              <span>Built for</span>
              <strong>Consignment &amp; resale stores using Shopify and Shopify POS</strong>
            </div>
          </div>

          <div className="work-project-tags">
            {['Shopify','React','Supabase','Shopify POS','Mobile Intake','Payouts','AI-Assisted Development'].map(tag =>
              <span key={tag}>{tag}</span>
            )}
          </div>

          <div className="work-project-footer">
            <span>Case study with problem, workflow, architecture, build process and results.</span>
            <a href="#work" onClick={event => event.preventDefault()}>View Case Study →</a>
          </div>
        </div>
      </article>
    </div>
  </main>;
}
