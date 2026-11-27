// Shared by the Shopify Studio main page and the era pages: prices from the admin and the free-audit form.
import { submitServiceRequest } from '../../lib/serviceRequests';
import { catalogue, startingPrice } from './home/pricingRender';

function price(value) {
  const clean = String(value || '').trim().replace(/^\$/, '');
  return clean ? `from <b>$${clean}</b>` : '<b>Free quote</b>';
}

export function fillTokens(html, settings) {
  const spots = String(settings.spotsLeft || '').trim();
  return html
    // The 3 package choices take their "from" price from the first tier on the pricing page (edited in the admin).
    .replaceAll('{{PRICE1}}', price(startingPrice(settings.pricing, 'new')))
    .replaceAll('{{PRICE2}}', price(startingPrice(settings.pricing, 'redesign')))
    .replaceAll('{{PRICE3}}', price(startingPrice(settings.pricing, 'backend')))
    .replaceAll('{{SPOTS}}', spots ? ` · ${spots} spots left this month` : '')
    .replaceAll('{{SPOTS_BADGE}}', spots ? `${spots} spots left` : 'Free');
}

export function tracking() {
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

// Package picked on the pricing page ("Select package" / "Get a custom quote"), sent along with the request.
function picked() {
  let value = '';
  try {
    const params = new URLSearchParams(window.location.search);
    value = params.get('service') ? `${params.get('service')}:${params.get('package') || ''}` : (sessionStorage.getItem('studioQuote') || '');
  } catch { value = ''; }
  if (!value) return '';
  const [serviceId, packageId] = value.split(':');
  const service = catalogue().services.find(s => s.id === serviceId);
  const pkg = service?.cards?.find(c => c.id === packageId);
  const label = [service?.name || serviceId, pkg?.name].filter(Boolean).join(' → ');
  return `\nInterested in: ${label}`;
}

export function wireForm(root, era) {
  const form = root.querySelector('form[data-ss-review]');
  if (!form) return () => {};
  // Came from "Select package" / "Get a custom quote" on the pricing page: same form, worded as a quote request.
  if (picked()) {
    const title = form.querySelector('h3');
    const button = form.querySelector('button[type="submit"]');
    if (title) title.textContent = 'Request a quote';
    if (button) button.textContent = 'Request a quote';
    const sub = form.querySelector('.sub');
    if (sub) sub.textContent = `Takes 30 seconds · ${picked().replace(/^\nInterested in: /, '')}`;
  }
  const onSubmit = async event => {
    event.preventDefault();
    const data = new FormData(form);
    const msg = form.querySelector('.ss-form-msg');
    const button = form.querySelector('button[type="submit"]');
    const website = String(data.get('website') || '').trim();
    const headache = String(data.get('headache') || '').trim();
    button.disabled = true;
    msg.textContent = 'Sending…';
    try {
      await submitServiceRequest({
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        website,
        service: 'shopify_ecommerce',
        message: `${picked() ? 'Quote request' : 'Free store review request'}.${picked()}\nStore: ${website}\nBiggest headache: ${headache}\nSeen on: Shopify Studio (${era ? `${era} style` : 'main page'})`,
        contact_consent: data.get('contact_consent') === 'on',
        fax_number: String(data.get('fax_number') || ''),
        ...tracking(),
      });
      form.innerHTML = '<h3>Got it, thank you.</h3><p class="sub">Your free store review will be in your inbox within 48 hours.</p>';
    } catch (error) {
      button.disabled = false;
      msg.textContent = error?.message || 'Unable to send right now. Please try again.';
    }
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

