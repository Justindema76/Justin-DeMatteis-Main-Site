// Shared by the Shopify Studio main page and the era pages: prices from the admin and the free-audit form.
import { submitServiceRequest } from '../../lib/serviceRequests';
import { catalogue, startingPrice } from './home/pricingRender';
import { renderStudioFooter, STUDIO_FOOTER_CSS } from './studioSite';

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
    .replaceAll('{{SPOTS_BADGE}}', spots ? `${spots} spots left` : 'Free')
    // One footer for every Studio page (main, pricing, case studies, all designs), built from the shared config.
    .replace(/<footer>[\s\S]*?<\/footer>/, () => `<style>${STUDIO_FOOTER_CSS}</style>${renderStudioFooter(settings, catalogue(settings.pricing), settings.__social || {})}`);
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
    track('quote_start', { service: picked().replace(/^\nInterested in: /, '') });
    if (button) button.textContent = 'Request a quote';
    const sub = form.querySelector('.sub');
    if (sub) sub.textContent = `Takes 30 seconds · ${picked().replace(/^\nInterested in: /, '')}`;
  }
  // The notes box and dropdown take the look of this era's own text fields.
  const model = form.querySelector('input[name="email"]');
  if (model) {
    const cs = getComputedStyle(model);
    form.querySelectorAll('textarea, select').forEach(el => {
      ['borderTopWidth', 'borderTopStyle', 'borderTopColor', 'borderRadius', 'backgroundColor', 'color', 'fontFamily', 'paddingLeft'].forEach(k => {
        if (k.startsWith('borderTop')) el.style[k.replace('Top', '')] = cs[k]; else el.style[k] = cs[k];
      });
      el.style.boxSizing = 'border-box';
      el.style.width = '100%';
      if (el.tagName === 'SELECT') el.style.paddingRight = '36px';
      if (el.tagName === 'TEXTAREA' && parseFloat(cs.borderRadius) > 20) el.style.borderRadius = '18px';
    });
  }
  const onSubmit = async event => {
    event.preventDefault();
    const data = new FormData(form);
    const msg = form.querySelector('.ss-form-msg');
    const button = form.querySelector('button[type="submit"]');
    const website = String(data.get('website') || '').trim();
    const headache = String(data.get('headache') || '').trim();
    const details = String(data.get('details') || '').trim();
    if (!headache) { msg.textContent = 'Please choose what you would like to improve.'; return; }
    button.disabled = true;
    msg.textContent = 'Sending…';
    try {
      await submitServiceRequest({
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        website,
        service: 'shopify_ecommerce',
        message: `${picked() ? 'Quote request' : 'Free store review request'}.${picked()}\nStore: ${website}\nWants to improve: ${headache}${details ? `\nNotes: ${details}` : ''}\nSeen on: Shopify Studio (${era ? `${era} style` : 'main page'})`,
        contact_consent: data.get('contact_consent') === 'on',
        fax_number: String(data.get('fax_number') || ''),
        ...tracking(),
      });
      // Counted only after the server confirms. No names or emails go to analytics.
      track(picked() ? 'quote_submit' : 'free_review_submit', { location: era || 'main' });
      form.innerHTML = '<h3>Got it, thank you.</h3><p class="sub">Your free store review will be in your inbox within 48 hours.</p>';
    } catch (error) {
      button.disabled = false;
      msg.textContent = error?.message || 'Unable to send right now. Please try again.';
    }
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}


// GA4 events for Shopify Studio (feeds the analytics dashboard later). One listener per page.
// design_view: a design page opened · design_click: a design picked · demo_store_open
// cta_free_review: any "free store review" button · select_package: "Select package"/"Get a quote"
// service_view: a service opened on the pricing page · pricing_click: a link to the pricing page
export function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, { ...params, page_path: window.location.pathname });
}

export function wireTracking(root) {
  if (!root) return () => {};
  const onClick = event => {
    const a = event.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const text = (a.textContent || '').trim().slice(0, 60);
    const where = a.closest('footer') ? 'footer' : a.closest('header, .smenu, .ss-menu-panel') ? 'menu' : 'page';
    let m;
    if (a.closest('.ssf-social')) track('social_click', { network: a.getAttribute('aria-label') || '' });
    else if (/^\/contact\b|^mailto:|^tel:/.test(href)) track('contact_click', { location: where });
    else if ((m = href.match(/^\/shopify-studio\?service=([^&#]+)(?:&package=([^&#]+))?/))) track('select_package', { service: decodeURIComponent(m[1]), package: decodeURIComponent(m[2] || 'custom') });
    else if (/#audit$/.test(href)) track('cta_free_review', { link_text: text, location: where });
    else if (/^\/shopify-studio\/(store|demo-store)\b/.test(href)) track('demo_store_open', { location: where });
    else if (/^\/shopify-studio\/pricing/.test(href) && !a.dataset.nav) track('pricing_click', { link_text: text, location: where, service: href.split('#')[1] || '' });
    else if (a.dataset.nav) track('service_view', { service: a.dataset.nav });
    else if ((m = href.match(/^\/shopify-studio\/([a-z0-9-]+)$/)) && !['pricing', 'case-study', 'about', 'privacy', 'terms', 'store'].includes(m[1])) track('design_click', { design: m[1], location: where });
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
