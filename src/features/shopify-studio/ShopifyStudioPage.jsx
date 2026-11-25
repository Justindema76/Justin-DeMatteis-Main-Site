import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { loadSetting } from '../../lib/content';
import { submitServiceRequest } from '../../lib/serviceRequests';
import { STUDIO_DEFAULTS, STUDIO_ERAS, STUDIO_SETTING_KEY } from './studioConfig';
import fonts from './fonts.json';
import './shopifyStudio.css';

const MARKUP = import.meta.glob('./content/*.html', { query: '?raw', import: 'default' });
const STYLES = import.meta.glob('./styles/*.css', { query: '?inline', import: 'default' });

const ERA_KEYS = STUDIO_ERAS.map(era => era.key);

function pickEra(requested, settings) {
  const enabled = (settings.enabledEras?.length ? settings.enabledEras : ERA_KEYS).filter(key => ERA_KEYS.includes(key));
  if (requested && enabled.includes(requested)) return requested;
  if (enabled.includes(settings.defaultEra)) return settings.defaultEra;
  return enabled[0] || '50s';
}

function price(value) {
  const clean = String(value || '').trim().replace(/^\$/, '');
  return clean ? `from <b>$${clean}</b>` : '<b>Free quote</b>';
}

function fillTokens(html, settings) {
  const spots = String(settings.spotsLeft || '').trim();
  return html
    .replaceAll('{{PRICE1}}', price(settings.priceTuneUp))
    .replaceAll('{{PRICE2}}', price(settings.priceRedesign))
    .replaceAll('{{PRICE3}}', price(settings.priceCustomApp))
    .replaceAll('{{SPOTS}}', spots ? ` · ${spots} spots left this month` : '')
    .replaceAll('{{SPOTS_BADGE}}', spots ? `${spots} spots left` : 'Free');
}

function tracking() {
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


// Any text that is too faint against its own solid background gets darker or lighter
// (same colour, different shade) until it reads. Skips text over pictures and gradient text.
function parseRgb(value) {
  const m = String(value || '').match(/[\d.]+/g) || [];
  return [Number(m[0] || 0), Number(m[1] || 0), Number(m[2] || 0), m[3] === undefined ? 1 : Number(m[3])];
}
function luminance([r, g, b]) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function shade([r, g, b], t) { // t<0 darker, t>0 lighter
  return t < 0 ? [r * (1 + t), g * (1 + t), b * (1 + t)].map(Math.round) : [r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t].map(Math.round);
}
function fixFaintText(root) {
  const win = root.ownerDocument.defaultView;
  root.querySelectorAll('h1,h2,h3,h4,h5,p,span,b,strong,em,small,li,a,label,summary,div').forEach(el => {
    if (!el.offsetWidth || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    if (el.closest('.hero, .chero')) return; // banners sit on pictures/shapes, handled in CSS
    const cs = win.getComputedStyle(el);
    if (/rgba\(0, 0, 0, 0\)/.test(cs.webkitTextFillColor || '')) return;
    const text = parseRgb(cs.webkitTextFillColor || cs.color);
    let node = el, bg = null;
    while (node && node !== root.parentElement) {
      const ncs = win.getComputedStyle(node);
      if (ncs.backgroundImage && ncs.backgroundImage !== 'none') return;
      const c = parseRgb(ncs.backgroundColor);
      if (c[3] > 0.6) { bg = c; break; }
      node = node.parentElement;
    }
    if (!bg || contrast(text, bg) >= 4.5) return;
    const dir = luminance(bg) > 0.4 ? -1 : 1;
    let best = text;
    for (let t = 0.08; t <= 1; t += 0.08) { best = shade(text, dir * t); if (contrast(best, bg) >= 4.5) break; }
    const css = `rgb(${best.join(',')})`;
    el.style.setProperty('color', css, 'important');
    el.style.setProperty('-webkit-text-fill-color', css, 'important');
  });
}


// No glows: drop any blurred text-shadow / box-shadow and drop-shadow filters on the page.
function stripGlows(root) {
  const win = root.ownerDocument.defaultView;
  const blurred = part => { const nums = part.replace(/rgba?\([^)]*\)|#[0-9a-f]+|[a-z]+/gi, ' ').trim().split(/\s+/).map(parseFloat); return (nums[2] || 0) > 0; };
  const split = value => value.split(/,(?![^(]*\))/).map(v => v.trim());
  root.querySelectorAll('*').forEach(el => {
    if (el.closest('svg')) return;
    const cs = win.getComputedStyle(el);
    if (cs.textShadow && cs.textShadow !== 'none') {
      const keep = split(cs.textShadow).filter(p => !blurred(p));
      el.style.setProperty('text-shadow', keep.length ? keep.join(', ') : 'none', 'important');
    }
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      const keep = split(cs.boxShadow).filter(p => p.includes('inset') || !blurred(p));
      el.style.setProperty('box-shadow', keep.length ? keep.join(', ') : 'none', 'important');
    }
    if (cs.filter && cs.filter.includes('drop-shadow')) el.style.setProperty('filter', 'none', 'important');
  });
}

// Before/after slider on the case study.
function wireSlider(root) {
  const cmp = root.querySelector('#cmp');
  if (!cmp) return () => {};
  const after = cmp.querySelector('.after');
  const handle = cmp.querySelector('.handle');
  const before = cmp.querySelector('img');
  let dragging = false;
  const set = x => {
    const rect = cmp.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = `${pct}%`;
  };
  const down = e => { dragging = true; set(e.clientX); };
  const move = e => { if (dragging) set(e.clientX); };
  const up = () => { dragging = false; };
  cmp.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  const tabs = [...root.querySelectorAll('.tabs button')];
  const clickers = tabs.map(button => {
    const onClick = () => {
      tabs.forEach(t => t.classList.remove('on'));
      button.classList.add('on');
      before.src = button.dataset.b.replace(/^img\//, '/shopify-studio/img/');
      after.src = button.dataset.a.replace(/^img\//, '/shopify-studio/img/');
    };
    button.addEventListener('click', onClick);
    return () => button.removeEventListener('click', onClick);
  });
  return () => {
    cmp.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    clickers.forEach(off => off());
  };
}

// The free store review form posts into the existing Service Requests inbox.
function wireForm(root, era) {
  const form = root.querySelector('form[data-ss-review]');
  if (!form) return () => {};
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
        message: `Free Shopify audit request.\nStore: ${website}\nBiggest headache: ${headache}\nSeen on: Shopify Studio (${era} style)`,
        contact_consent: data.get('contact_consent') === 'on',
        fax_number: String(data.get('fax_number') || ''),
        ...tracking(),
      });
      form.innerHTML = '<h3>Got it, thank you.</h3><p class="sub">Your free audit will be in your inbox within 48 hours.</p>';
    } catch (error) {
      button.disabled = false;
      msg.textContent = error?.message || 'Unable to send right now. Please try again.';
    }
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

export default function ShopifyStudioPage({ kind = 'studio' }) {
  const { era: requestedEra } = useParams();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [settings, setSettings] = useState(STUDIO_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState({ html: '', css: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeSlot, setThemeSlot] = useState(null);

  useEffect(() => {
    let live = true;
    loadSetting(STUDIO_SETTING_KEY, STUDIO_DEFAULTS).then(value => {
      if (live) { setSettings({ ...STUDIO_DEFAULTS, ...value }); setLoaded(true); }
    });
    return () => { live = false; };
  }, []);

  const era = pickEra(requestedEra, settings);
  const pageKey = `${kind}-${era}`;
  const enabledEras = STUDIO_ERAS.filter(item => (settings.enabledEras?.length ? settings.enabledEras : ERA_KEYS).includes(item.key));

  useEffect(() => {
    if (!loaded) return;
    let live = true;
    Promise.all([MARKUP[`./content/${pageKey}.html`](), STYLES[`./styles/${pageKey}.css`]()]).then(([html, css]) => {
      if (live) setPage({ html, css });
    });
    return () => { live = false; };
  }, [pageKey, loaded]);

  // Era fonts
  useEffect(() => {
    const href = fonts[pageKey];
    if (!href) return undefined;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.ssFonts = pageKey;
    document.head.appendChild(link);
    return () => link.remove();
  }, [pageKey]);

  const html = useMemo(() => fillTokens(page.html, settings), [page.html, settings]);

  // Wire up the page once its markup is in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !html) return undefined;
    const offSlider = wireSlider(root);
    const offForm = wireForm(root, era);
    const onClick = event => {
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank') return;
      const href = link.getAttribute('href');
      if (!href.startsWith('/')) return;
      event.preventDefault();
      const [path, hash] = href.split('#');
      if (path === window.location.pathname) {
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      navigate(path + (hash ? `#${hash}` : ''));
    };
    root.addEventListener('click', onClick);
    // Logo always goes back to the Shopify Studio home page for this era.
    root.querySelectorAll('header .plate').forEach(a => a.setAttribute('href', `/shopify-studio/${era}`));
    // "Themes" switcher lives in the page's own nav bar, before the Free Store Review button.
    const nav = root.querySelector('header nav');
    let slot = null;
    if (nav) {
      slot = document.createElement('span');
      slot.className = 'ss-themes-slot';
      nav.insertBefore(slot, nav.querySelector('.btn') || null);
    }
    setThemeSlot(slot);
    const fixTimer = setTimeout(() => { stripGlows(root); fixFaintText(root); }, 400);
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    else window.scrollTo(0, 0);
    return () => { offSlider(); offForm(); root.removeEventListener('click', onClick); slot?.remove(); setThemeSlot(null); clearTimeout(fixTimer); };
  }, [html, era, navigate]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = event => { if (!event.target.closest('.ss-themes')) setMenuOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  function switchEra(key) {
    setMenuOpen(false);
    navigate(kind === 'case' ? `/shopify-studio/jill-and-the-beanstalk/${key}` : `/shopify-studio/${key}`);
  }

  if (!html) return <div className="ssp-loading" aria-busy="true" />;

  return <>
    <style>{page.css}</style>
    <div ref={rootRef} className={`ssp ssp-${pageKey}`} dangerouslySetInnerHTML={{ __html: html }} />
    {themeSlot && settings.showEraSwitcher && enabledEras.length > 1 && createPortal(<span className="ss-themes">
      <a href="#" role="button" aria-expanded={menuOpen} onClick={event => { event.preventDefault(); event.stopPropagation(); setMenuOpen(open => !open); }}>Themes ▾</a>
      {menuOpen && <ul role="menu">
        {enabledEras.map(item => <li key={item.key}>
          <button type="button" role="menuitem" className={item.key === era ? 'on' : ''} onClick={() => switchEra(item.key)}>{item.label}</button>
        </li>)}
      </ul>}
    </span>, themeSlot)}
  </>;
}
