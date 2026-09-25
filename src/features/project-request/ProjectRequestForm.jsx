import { useState } from 'react';
import { submitServiceRequest } from '../../lib/serviceRequests';

const SERVICES = [
  ['website_wordpress', 'Website / WordPress'],
  ['wordpress_plugin', 'Custom WordPress Plugin'],
  ['shopify_ecommerce', 'Shopify / Ecommerce'],
  ['ai_automation', 'AI Automation'],
  ['api_integration', 'API Integration'],
  ['custom_web_app', 'Custom Web App'],
  ['seo_digital', 'SEO / Digital Marketing'],
  ['not_sure', 'Not sure yet'],
];

function trackingPayload() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source_path: window.location.pathname,
    referrer: document.referrer || '',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
  };
}

export default function ProjectRequestForm({ config, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    service: 'not_sure',
    budget: '',
    timeline: '',
    message: '',
    contact_consent: false,
    fax_number: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setError('');

    try {
      const payload = await submitServiceRequest({
        ...form,
        ...trackingPayload(),
      });
      setResult(payload);
      setStatus('success');
    } catch (submitError) {
      setStatus('error');
      setError(submitError?.message || config.errorMessage);
    }
  }

  if (status === 'success') {
    return (
      <div className="project-request-success" role="status">
        <span className="project-request-success-icon" aria-hidden="true">✓</span>
        <h3>{config.successTitle}</h3>
        <p>{config.successMessage}</p>
        {result?.classification?.primary_service_label && (
          <div className="project-request-routing-result">
            <span>Routed to</span>
            <strong>{result.classification.primary_service_label}</strong>
            {result.classification.summary && <p>{result.classification.summary}</p>}
          </div>
        )}
        <button className="project-request-secondary-button" type="button" onClick={onClose}>{config.closeLabel}</button>
      </div>
    );
  }

  return (
    <form className="project-request-form" onSubmit={handleSubmit}>
      <div className="project-request-field is-half">
        <label htmlFor="project-request-name">Name <span className="project-request-required">*</span></label>
        <input id="project-request-name" name="name" value={form.name} onChange={update} required autoComplete="name" disabled={status === 'submitting'} />
      </div>

      <div className="project-request-field is-half">
        <label htmlFor="project-request-email">Email <span className="project-request-required">*</span></label>
        <input id="project-request-email" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" disabled={status === 'submitting'} />
      </div>

      <div className="project-request-field is-half">
        <label htmlFor="project-request-phone">Phone <span className="project-request-optional">(optional)</span></label>
        <input id="project-request-phone" name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" disabled={status === 'submitting'} />
      </div>

      <div className="project-request-field is-half">
        <label htmlFor="project-request-company">Company <span className="project-request-optional">(optional)</span></label>
        <input id="project-request-company" name="company" value={form.company} onChange={update} autoComplete="organization" disabled={status === 'submitting'} />
      </div>

      <div className="project-request-field">
        <label htmlFor="project-request-website">Website <span className="project-request-optional">(optional)</span></label>
        <input id="project-request-website" name="website" type="url" value={form.website} onChange={update} placeholder="https://" disabled={status === 'submitting'} />
      </div>

      <div className="project-request-field">
        <label htmlFor="project-request-service">What do you need? <span className="project-request-required">*</span></label>
        <select id="project-request-service" name="service" value={form.service} onChange={update} required disabled={status === 'submitting'}>
          {SERVICES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </div>

      <div className="project-request-field is-half">
        <label htmlFor="project-request-budget">Budget range <span className="project-request-optional">(optional)</span></label>
        <select id="project-request-budget" name="budget" value={form.budget} onChange={update} disabled={status === 'submitting'}>
          <option value="">Not sure yet</option>
          <option value="under_2500">Under $2,500</option>
          <option value="2500_5000">$2,500 – $5,000</option>
          <option value="5000_10000">$5,000 – $10,000</option>
          <option value="10000_25000">$10,000 – $25,000</option>
          <option value="25000_plus">$25,000+</option>
        </select>
      </div>

      <div className="project-request-field is-half">
        <label htmlFor="project-request-timeline">Timeline <span className="project-request-optional">(optional)</span></label>
        <select id="project-request-timeline" name="timeline" value={form.timeline} onChange={update} disabled={status === 'submitting'}>
          <option value="">No fixed timeline</option>
          <option value="asap">As soon as possible</option>
          <option value="30_days">Within 30 days</option>
          <option value="60_90_days">Within 60–90 days</option>
          <option value="planning">Planning / research stage</option>
        </select>
      </div>

      <div className="project-request-field">
        <label htmlFor="project-request-message">Tell me about the problem or project <span className="project-request-required">*</span></label>
        <textarea
          id="project-request-message"
          name="message"
          value={form.message}
          onChange={update}
          required
          minLength="20"
          maxLength="6000"
          placeholder="What are you doing manually now? What systems are involved? What do you want the finished solution to do?"
          disabled={status === 'submitting'}
        />
      </div>

      <label className="project-request-consent">
        <input name="contact_consent" type="checkbox" checked={form.contact_consent} onChange={update} required disabled={status === 'submitting'} />
        <span>You can contact me about this request.</span>
      </label>

      <div className="project-request-honeypot" aria-hidden="true">
        <label htmlFor="project-request-fax">Fax number</label>
        <input id="project-request-fax" name="fax_number" value={form.fax_number} onChange={update} tabIndex="-1" autoComplete="off" />
      </div>

      <div className="project-request-next-step">
        <strong>{config.nextStepTitle}</strong>
        <span>{config.nextStepText}</span>
      </div>

      {error && <div className="project-request-error" role="alert">{error}</div>}

      <button className="project-request-submit" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? config.submittingLabel : config.submitLabel}
        {status !== 'submitting' && <span aria-hidden="true">→</span>}
      </button>
      <p className="project-request-privacy">{config.privacyText}</p>
    </form>
  );
}
