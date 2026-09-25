import { useMemo, useState } from 'react';
import { submitServiceRequest } from '../lib/serviceRequests';

const DEFAULT_SERVICES = [
  ['website_wordpress', 'Website / WordPress'],
  ['wordpress_plugin', 'Custom WordPress Plugin'],
  ['shopify_ecommerce', 'Shopify / Ecommerce'],
  ['ai_automation', 'AI Automation'],
  ['api_integration', 'API Integration'],
  ['custom_web_app', 'Custom Web App'],
  ['seo_digital', 'SEO / Digital Marketing'],
  ['not_sure', 'Not sure yet'],
];

function parseServiceOptions(value) {
  if (!value) return DEFAULT_SERVICES;

  const parsed = String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const [rawValue, ...labelParts] = item.split('|');
      const optionValue = rawValue?.trim();
      const label = labelParts.join('|').trim() || optionValue;
      return optionValue && label ? [optionValue, label] : null;
    })
    .filter(Boolean);

  return parsed.length ? parsed : DEFAULT_SERVICES;
}

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

export default function ServiceRequestForm({
  eyebrow = 'Start a project',
  heading = 'Tell me what you need.',
  text = 'Describe the problem, the system you are using, and what you want to improve. I will review it and route it into the right service workflow.',
  serviceOptions = '',
  submitButtonText = 'Send service request',
  successHeading = 'Request received.',
  successText = 'I have your project details and will review the request.',
  showRoutingResult = true,
}) {
  const options = useMemo(() => parseServiceOptions(serviceOptions), [serviceOptions]);
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
  const [state, setState] = useState({ status: 'idle', message: '', result: null });

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ status: 'submitting', message: '', result: null });

    try {
      const result = await submitServiceRequest({
        ...form,
        ...trackingPayload(),
      });

      setState({ status: 'success', message: '', result });
      setForm(current => ({
        ...current,
        name: '',
        email: '',
        phone: '',
        company: '',
        website: '',
        budget: '',
        timeline: '',
        message: '',
        contact_consent: false,
        fax_number: '',
      }));
    } catch (error) {
      setState({
        status: 'error',
        message: error?.message || 'Unable to submit your request right now.',
        result: null,
      });
    }
  }

  if (state.status === 'success') {
    return <section className="service-request-section" id="service-request">
      <div className="shared-wrap service-request-success">
        <div className="shared-eyebrow">{eyebrow}</div>
        <h2>{successHeading}</h2>
        <p>{successText}</p>
        {showRoutingResult && state.result?.classification?.primary_service_label && (
          <div className="service-request-routing-result">
            <span>Routed to</span>
            <strong>{state.result.classification.primary_service_label}</strong>
            {state.result.classification.summary && <p>{state.result.classification.summary}</p>}
          </div>
        )}
        <button
          type="button"
          className="shared-btn shared-btn-secondary"
          onClick={() => setState({ status: 'idle', message: '', result: null })}
        >
          Send another request
        </button>
      </div>
    </section>;
  }

  return <section className="service-request-section" id="service-request">
    <div className="shared-wrap service-request-grid">
      <div className="service-request-intro">
        <div className="shared-eyebrow">{eyebrow}</div>
        <h2>{heading}</h2>
        <p>{text}</p>
        <div className="service-request-flow" aria-label="What happens after submission">
          <span>1. Request received</span>
          <span>2. Classified and routed</span>
          <span>3. Reviewed for next steps</span>
        </div>
      </div>

      <form className="service-request-form" onSubmit={handleSubmit}>
        <div className="service-request-field-grid">
          <label>
            <span>Name *</span>
            <input name="name" value={form.name} onChange={updateField} required autoComplete="name"/>
          </label>
          <label>
            <span>Email *</span>
            <input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email"/>
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel"/>
          </label>
          <label>
            <span>Company</span>
            <input name="company" value={form.company} onChange={updateField} autoComplete="organization"/>
          </label>
        </div>

        <label>
          <span>Website</span>
          <input name="website" type="url" value={form.website} onChange={updateField} placeholder="https://"/>
        </label>

        <label>
          <span>What do you need? *</span>
          <select name="service" value={form.service} onChange={updateField} required>
            {options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>

        <div className="service-request-field-grid">
          <label>
            <span>Budget range</span>
            <select name="budget" value={form.budget} onChange={updateField}>
              <option value="">Not sure yet</option>
              <option value="under_2500">Under $2,500</option>
              <option value="2500_5000">$2,500 – $5,000</option>
              <option value="5000_10000">$5,000 – $10,000</option>
              <option value="10000_25000">$10,000 – $25,000</option>
              <option value="25000_plus">$25,000+</option>
            </select>
          </label>
          <label>
            <span>Timeline</span>
            <select name="timeline" value={form.timeline} onChange={updateField}>
              <option value="">No fixed timeline</option>
              <option value="asap">As soon as possible</option>
              <option value="30_days">Within 30 days</option>
              <option value="60_90_days">Within 60–90 days</option>
              <option value="planning">Planning / research stage</option>
            </select>
          </label>
        </div>

        <label>
          <span>Tell me about the problem or project *</span>
          <textarea
            name="message"
            rows="7"
            value={form.message}
            onChange={updateField}
            required
            minLength="20"
            placeholder="What are you doing manually now? What systems are involved? What do you want the finished solution to do?"
          />
        </label>

        <label className="service-request-consent">
          <input name="contact_consent" type="checkbox" checked={form.contact_consent} onChange={updateField} required/>
          <span>You can contact me about this request.</span>
        </label>

        <div className="service-request-honeypot" aria-hidden="true">
          <label>
            Fax number
            <input name="fax_number" value={form.fax_number} onChange={updateField} tabIndex="-1" autoComplete="off"/>
          </label>
        </div>

        {state.status === 'error' && <div className="service-request-error" role="alert">{state.message}</div>}

        <button className="shared-btn shared-btn-primary service-request-submit" type="submit" disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Sending…' : submitButtonText}
        </button>
      </form>
    </div>
  </section>;
}
