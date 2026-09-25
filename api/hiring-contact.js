const MAX = {
  name: 120,
  company: 160,
  email: 254,
  phone: 60,
  website_or_linkedin: 500,
  reason: 80,
  role_title: 180,
  message: 6000,
  source_path: 500,
  referrer: 1000,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 300,
  utm_content: 300,
  utm_term: 300,
  company_services: 200,
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

  if (clean(body.company_services, 'company_services')) {
    return res.status(200).json({ ok: true });
  }

  const input = {
    name: clean(body.name, 'name'),
    company: clean(body.company, 'company'),
    email: clean(body.email, 'email').toLowerCase(),
    phone: clean(body.phone, 'phone'),
    website_or_linkedin: clean(body.website_or_linkedin, 'website_or_linkedin'),
    reason: clean(body.reason, 'reason').toLowerCase(),
    role_title: clean(body.role_title, 'role_title'),
    message: clean(body.message, 'message'),
    employment_consent: body.employment_consent === true,
    company_services: '',
    source_path: clean(body.source_path, 'source_path'),
    referrer: clean(body.referrer, 'referrer'),
    utm_source: clean(body.utm_source, 'utm_source'),
    utm_medium: clean(body.utm_medium, 'utm_medium'),
    utm_campaign: clean(body.utm_campaign, 'utm_campaign'),
    utm_content: clean(body.utm_content, 'utm_content'),
    utm_term: clean(body.utm_term, 'utm_term'),
  };

  const allowedReasons = new Set(['interview','job_opportunity','recruiter','other_employment']);
  if (!input.name || !input.company || !validEmail(input.email) || !allowedReasons.has(input.reason) || !input.role_title || input.message.length < 30 || !input.employment_consent) {
    return res.status(400).json({ message: 'Please complete the required employment contact fields.' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://nowsajdmbpxvlvrhopjg.supabase.co';
    const publishableKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_AZbVouJ6gN00dQGdZwPjog_GTQR0J-w';

    const response = await fetch(`${supabaseUrl}/functions/v1/send-site-email`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'hiring_contact_submit',
        ...input,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || 'Unable to send hiring contact.');
    }

    return res.status(201).json({
      ok: true,
      request_id: payload?.request?.id || null,
    });
  } catch (error) {
    console.error('Hiring contact submission failed.', error);
    return res.status(500).json({ message: 'Unable to send your message right now.' });
  }
}
