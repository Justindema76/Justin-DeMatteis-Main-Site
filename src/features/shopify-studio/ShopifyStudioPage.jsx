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
        message: `Free Shopify store review request.\nStore: ${website}\nBiggest headache: ${headache}\nSeen on: Shopify Studio (${era} style)`,
        contact_consent: data.get('contact_consent') === 'on',
        fax_number: String(data.get('fax_number') || ''),
        ...tracking(),
      });
      form.innerHTML = '<h3>Got it, thank you.</h3><p class="sub">Your store review will be in your inbox within 48 hours.</p>';
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
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    else window.scrollTo(0, 0);
    return () => { offSlider(); offForm(); root.removeEventListener('click', onClick); slot?.remove(); setThemeSlot(null); };
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
