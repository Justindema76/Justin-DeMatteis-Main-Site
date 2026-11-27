// Spam check: the server drops requests sent faster than a person can fill a form,
// or sent straight to the API without anyone typing on the page.
let firstTyped = 0;
const pageLoaded = typeof performance !== 'undefined' ? Date.now() - performance.now() : Date.now();
if (typeof document !== 'undefined') {
  const mark = event => {
    if (!firstTyped && event.target?.closest?.('form')) firstTyped = Date.now();
  };
  ['focusin', 'input', 'pointerdown', 'keydown'].forEach(type => document.addEventListener(type, mark, true));
}

export async function submitServiceRequest(payload) {
  const response = await fetch('/api/service-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, form_ms: Date.now() - (firstTyped || pageLoaded) }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to submit your request right now.');
  }

  // GA4 key event: every form that posts to the Service Requests inbox counts as a lead.
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const message = String(payload?.message || '');
    window.gtag('event', 'generate_lead', {
      lead_type: message.startsWith('Quote request') ? 'quote' : message.startsWith('Free store review') ? 'free_store_review' : 'service_request',
      service: payload?.service || '',
      form_page: window.location.pathname,
    });
  }

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', { content_category: payload?.service || '' });
  }

  return data;
}
