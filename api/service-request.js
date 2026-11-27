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


// ---- Spam protection -------------------------------------------------------
// Silent drops (bots get a normal "ok" so they don't retry): honeypot field, sent faster than a
// person can type or straight to the API, link-stuffed messages, repeats of the same request.
// Rate limit: a few requests per visitor per hour. Kept in memory, so it is per server instance:
// a first line of defence. Cloudflare Turnstile switches on once TURNSTILE_SECRET_KEY is set.
const MIN_FORM_MS = 1500;
const RATE_MAX = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const DUP_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();
const recent = new Map();

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').split(',')[0].trim() || 'unknown';
}

function rateLimited(ip, now) {
  const list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

function duplicate(key, now) {
  for (const [k, t] of recent) if (now - t > DUP_WINDOW_MS) recent.delete(k);
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
}

function validWebsite(value) {
  if (!value) return true;
  return /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(value.trim());
}

function linkCount(text) {
  return (String(text).match(/https?:\/\/|www\./gi) || []).length;
}

async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: String(token), remoteip: ip });
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = await result.json();
    return data?.success === true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const body = req.body || {};

  const now = Date.now();
  const ip = clientIp(req);
  const formMs = Number(body.form_ms) || 0;

  if (clean(body.fax_number, 'phone') || formMs < MIN_FORM_MS) {
    return res.status(200).json({ ok: true });
  }

  if (rateLimited(ip, now)) {
    return res.status(429).json({ message: 'Too many requests. Please try again in an hour, or email me directly.' });
  }

  if (!(await turnstileOk(body.turnstile_token, ip))) {
    return res.status(400).json({ message: 'Please confirm you are not a robot and try again.' });
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

  if (!validWebsite(input.website)) {
    return res.status(400).json({ message: 'Please enter a valid store web address, like yourstore.com.' });
  }

  if (linkCount(input.message) > 3 || duplicate(`${input.email}|${input.message}`, now)) {
    return res.status(200).json({ ok: true });
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
