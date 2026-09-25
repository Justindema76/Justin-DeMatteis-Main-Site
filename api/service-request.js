import { classifyServiceRequest } from '../server/service-requests/classify.js';
import { storeServiceRequest } from '../server/service-requests/store.js';

const MAX = {
  name: 120,
  email: 254,
  phone: 60,
  company: 160,
  website: 500,
  service: 80,
  budget: 80,
  timeline: 80,
  message: 6000,
  source_path: 500,
  referrer: 1000,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 300,
  utm_content: 300,
  utm_term: 300,
};

function clean(value, field) {
  return String(value ?? '').trim().slice(0, MAX[field] || 1000);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const body = req.body || {};

  if (clean(body.fax_number, 'phone')) {
    return res.status(200).json({ ok: true });
  }

  const input = {
    name: clean(body.name, 'name'),
    email: clean(body.email, 'email').toLowerCase(),
    phone: clean(body.phone, 'phone'),
    company: clean(body.company, 'company'),
    website: clean(body.website, 'website'),
    service: clean(body.service, 'service') || 'not_sure',
    budget: clean(body.budget, 'budget'),
    timeline: clean(body.timeline, 'timeline'),
    message: clean(body.message, 'message'),
    contact_consent: body.contact_consent === true,
    source_path: clean(body.source_path, 'source_path'),
    referrer: clean(body.referrer, 'referrer'),
    utm_source: clean(body.utm_source, 'utm_source'),
    utm_medium: clean(body.utm_medium, 'utm_medium'),
    utm_campaign: clean(body.utm_campaign, 'utm_campaign'),
    utm_content: clean(body.utm_content, 'utm_content'),
    utm_term: clean(body.utm_term, 'utm_term'),
  };

  if (!input.name || !validEmail(input.email) || input.message.length < 20 || !input.contact_consent) {
    return res.status(400).json({ message: 'Please complete the required fields.' });
  }

  try {
    const classification = await classifyServiceRequest(input);

    const record = {
      site_key: 'justindematteis',
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      website: input.website,
      requested_service: input.service,
      budget_range: input.budget,
      timeline: input.timeline,
      message: input.message,
      contact_consent: input.contact_consent,
      status: 'new',
      routed_queue: classification.queue,
      ai_primary_service: classification.primary_service,
      ai_secondary_services: classification.secondary_services,
      ai_priority: classification.priority,
      ai_summary: classification.summary,
      ai_confidence: classification.confidence,
      ai_provider: classification.provider,
      ai_model: classification.model,
      source_path: input.source_path,
      referrer: input.referrer,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_content: input.utm_content,
      utm_term: input.utm_term,
      metadata: {
        submitted_via: 'portfolio_service_request',
      },
    };

    const saved = await storeServiceRequest(record);

    return res.status(201).json({
      ok: true,
      request_id: saved?.id,
      classification: {
        primary_service: classification.primary_service,
        primary_service_label: classification.primary_service_label,
        secondary_services: classification.secondary_services,
        priority: classification.priority,
        summary: classification.summary,
      },
    });
  } catch (error) {
    console.error('Service request submission failed.', error);
    return res.status(500).json({ message: 'Unable to submit your request right now.' });
  }
}
