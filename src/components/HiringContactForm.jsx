import { useState } from 'react';
import { submitHiringContact } from '../lib/hiringContacts';

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

export default function HiringContactForm({
  eyebrow = 'Hiring & interviews',
  heading = 'Interested in interviewing or hiring me?',
  text = 'Use this form for job opportunities, interview requests or recruiter contact. Sales and service pitches are filtered.',
  submitButtonText = 'Contact Justin',
  successHeading = 'Message received.',
  successText = 'Thanks. I received your employment-related message and will review it.',
}) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website_or_linkedin: '',
    reason: '',
    role_title: '',
    message: '',
    employment_consent: false,
    company_services: '',
  });
  const [state, setState] = useState({ status: 'idle', message: '' });

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === 'submitting') return;
    setState({ status: 'submitting', message: '' });

    try {
      await submitHiringContact({ ...form, ...trackingPayload() });
      setState({ status: 'success', message: '' });
      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        website_or_linkedin: '',
        reason: '',
        role_title: '',
        message: '',
        employment_consent: false,
        company_services: '',
      });
    } catch (error) {
      setState({ status: 'error', message: error?.message || 'Unable to send your message right now.' });
    }
  }

  if (state.status === 'success') {
    return <section className="hiring-contact-section" id="hiring-contact">
      <div className="shared-wrap">
        <div className="hiring-contact-success">
          <div className="hiring-contact-success-icon" aria-hidden="true">✓</div>
          <div className="shared-eyebrow">{eyebrow}</div>
          <h2>{successHeading}</h2>
          <p>{successText}</p>
          <button className="shared-btn shared-btn-secondary" type="button" onClick={() => setState({ status: 'idle', message: '' })}>Send another message</button>
        </div>
      </div>
    </section>;
  }

  return <section className="hiring-contact-section" id="hiring-contact">
    <div className="shared-wrap hiring-contact-grid">
      <div className="hiring-contact-intro">
        <div className="shared-eyebrow">{eyebrow}</div>
        <h2>{heading}</h2>
        <p>{text}</p>
        <div className="hiring-contact-guard">
          <strong>Employment contact only</strong>
          <span>This form is for hiring, interviews and recruiting. Unsolicited SEO, marketing, web-service and sales pitches are automatically filtered.</span>
        </div>
      </div>

      <form className="hiring-contact-form" onSubmit={handleSubmit}>
        <div className="hiring-contact-field-grid">
          <label><span>Name *</span><input name="name" value={form.name} onChange={updateField} required autoComplete="name" /></label>
          <label><span>Company *</span><input name="company" value={form.company} onChange={updateField} required autoComplete="organization" /></label>
        </div>

        <div className="hiring-contact-field-grid">
          <label><span>Work email *</span><input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" /></label>
          <label><span>Phone</span><input name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" /></label>
        </div>

        <label><span>LinkedIn or company website</span><input name="website_or_linkedin" type="url" value={form.website_or_linkedin} onChange={updateField} placeholder="https://" /></label>

        <div className="hiring-contact-field-grid">
          <label>
            <span>Reason for contacting me *</span>
            <select name="reason" value={form.reason} onChange={updateField} required>
              <option value="">Select one</option>
              <option value="interview">Interview request</option>
              <option value="job_opportunity">Job opportunity</option>
              <option value="recruiter">Recruiter</option>
              <option value="other_employment">Other employment-related</option>
            </select>
          </label>
          <label><span>Position / role *</span><input name="role_title" value={form.role_title} onChange={updateField} required placeholder="e.g. Web Developer" /></label>
        </div>

        <label>
          <span>Message *</span>
          <textarea name="message" rows="7" value={form.message} onChange={updateField} required minLength="30" maxLength="6000" placeholder="Tell me about the position, team, location/remote expectations and what you would like to discuss." />
        </label>

        <label className="hiring-contact-consent">
          <input name="employment_consent" type="checkbox" checked={form.employment_consent} onChange={updateField} required />
          <span>I am contacting Justin about an employment, interview or recruiting opportunity.</span>
        </label>

        <div className="hiring-contact-honeypot" aria-hidden="true">
          <label>Company services<input name="company_services" value={form.company_services} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
        </div>

        {state.status === 'error' && <div className="hiring-contact-error" role="alert">{state.message}</div>}

        <button className="shared-btn shared-btn-primary hiring-contact-submit" type="submit" disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Sending…' : submitButtonText}
        </button>
        <p className="hiring-contact-privacy">Your email address is not published on this page. Employment-related messages are delivered privately.</p>
      </form>
    </div>
  </section>;
}
