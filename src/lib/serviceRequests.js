export async function submitServiceRequest(payload) {
  const response = await fetch('/api/service-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

  return data;
}
