import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { loadSetting } from '../../lib/content';
import { fillTokens, track, wireForm, wireTracking } from './studioShared';
import { wireFooter } from './studioSite';
import { loadStudioPosts } from './home/studioBlog';
import { HERO_DEFAULTS, STUDIO_DEFAULTS, STUDIO_ERAS, STUDIO_SETTING_KEY } from './studioConfig';
import fonts from './fonts.json';
import { applyLook, heroLook, lookCss, phonePicture } from './heroLook';
import './shopifyStudio.css';

const MARKUP = import.meta.glob('./content/*.html', { query: '?raw', import: 'default' });
const STYLES = import.meta.glob('./styles/*.css', { query: '?inline', import: 'default' });
// Studio pages share one page (content/studio.html); each era only adds its hero decorations.
const STUDIO_DECO = import.meta.glob('./content/studio-deco/*.html', { query: '?raw', import: 'default' });

export function buildStudioHtml(shared, deco, era) {
  return shared
    .replaceAll('{{ERA}}', era)
    .replace('{{MDECO}}', deco)
    .replace('{{SURNAME}}', era === '80s-memphis' ? '<span class="hl">DeMatteis</span>' : 'DeMatteis');
}

function loadMarkup(kind, era) {
  if (kind !== 'studio') return MARKUP[`./content/${kind}-${era}.html`]();
  return Promise.all([MARKUP['./content/studio.html'](), STUDIO_DECO[`./content/studio-deco/${era}.html`]()])
    .then(([shared, deco]) => buildStudioHtml(shared, deco, era));
}

const ERA_KEYS = STUDIO_ERAS.map(era => era.key);

function pickEra(requested, settings) {
  const enabled = (settings.enabledEras?.length ? settings.enabledEras : ERA_KEYS).filter(key => ERA_KEYS.includes(key));
  if (requested && enabled.includes(requested)) return requested;
  if (enabled.includes(settings.defaultEra)) return settings.defaultEra;
  return enabled[0] || '50s';
}

// Hero picture (admin can swap it): replaces the wide banner picture on desktop.
function heroCss(kind, era, settings) {
  const saved = settings.heroImages?.[era] || {};
  const pick = key => String(saved[key] || '').trim() || HERO_DEFAULTS[era]?.[key] || '';
  const safe = url => url.replace(/["\\()\s]/g, encodeURIComponent);
  const desktop = pick('desktop');
  const scope = `.ssp-${kind}-${era} .hero`;
  let css = '';
  if (desktop) css += `@media(min-width:601px){${scope} .bg{background-image:url("${safe(desktop)}")!important}}`;
  return css;
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
// One Shopify Studio menu, the same on the main page, case study, every era page and the demo store.
const STUDIO_MENU = [
  { href: '/shopify-studio', label: 'Home' },
  { href: '/shopify-studio/case-study', label: 'Case study: Jill & The Beanstalk' },
  { href: '/shopify-studio/pricing', label: 'Pricing' },
  { href: '/shopify-studio#faq', label: 'Questions' },
];
const ERA_NAMES = {
  '50s': ['1950s', 'Atomic diner'], '60s': ['1960s', 'Flower power'], '70s': ['1970s', 'Warm & earthy'], '80s': ['1980s', 'Neon'],
  '80s-memphis': ['1980s', 'Memphis'], '90s': ['1990s', 'Paint & attitude'], '2000s': ['2000s', 'Y2K'], '2010s': ['2010s', 'Clean & modern'],
};

export default function ShopifyStudioPage({ kind = 'studio' }) {
  const { era: requestedEra } = useParams();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const scrolledFor = useRef('');
  const [settings, setSettings] = useState(STUDIO_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState({ html: '', css: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeSlot, setThemeSlot] = useState(null);
  const [burgerSlot, setBurgerSlot] = useState(null);
  const [navLinks, setNavLinks] = useState([]);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const fabRef = useRef(null);
  const [auditBtnClass, setAuditBtnClass] = useState('btn red');
  const [fabOn, setFabOn] = useState(false);


  useEffect(() => {
    let live = true;
    Promise.all([loadSetting(STUDIO_SETTING_KEY, STUDIO_DEFAULTS), loadSetting('social_links', {}), loadStudioPosts()]).then(([value, social, posts]) => {
      if (live) { setSettings({ ...STUDIO_DEFAULTS, ...value, __social: social || {}, __hasBlog: posts.length > 0 }); setLoaded(true); }
    });
    return () => { live = false; };
  }, []);

  const era = pickEra(requestedEra, settings);
  const pageKey = `${kind}-${era}`;
  const enabledEras = STUDIO_ERAS.filter(item => (settings.enabledEras?.length ? settings.enabledEras : ERA_KEYS).includes(item.key));

  useEffect(() => {
    if (!loaded) return;
    let live = true;
    Promise.all([loadMarkup(kind, era), STYLES[`./styles/${pageKey}.css`]()]).then(([html, css]) => {
      if (live) setPage({ html, css });
    });
    return () => { live = false; };
  }, [pageKey, loaded]);

  // Analytics: which design people actually look at (case-study versions count too).
  useEffect(() => {
    if (loaded) track(kind === 'case' ? 'case_study_view' : 'design_view', { design: era });
  }, [era, kind, loaded]);

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
    const offFooter = wireFooter(root);
    const offTrack = wireTracking(root);
    const onClick = event => {
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('data-hard')) return;
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
    // Logo always goes back to the Shopify Studio main page (where you pick a style).
    root.querySelectorAll('header .plate').forEach(a => a.setAttribute('href', '/shopify-studio'));
    // "Themes" switcher lives in the page's own nav bar, before the Free Store Review button.
    const nav = root.querySelector('header nav');
    let slot = null;
    if (nav) {
      slot = document.createElement('span');
      slot.className = 'ss-themes-slot';
      nav.insertBefore(slot, nav.querySelector('.btn') || null);
    }
    setThemeSlot(slot);
    // Desktop "Demo store" button copies the header's Free store review button exactly.
    setAuditBtnClass(nav?.querySelector('.btn')?.className || 'btn red');
    // Phone menu: hamburger in the header with the same links
    let burger = null;
    const headerWrap = root.querySelector('header .wrap');
    if (headerWrap && nav) {
      burger = document.createElement('span');
      burger.className = 'ss-burger-slot';
      headerWrap.appendChild(burger);
      setNavLinks([...nav.querySelectorAll(':scope > a')].map(a => ({ href: a.getAttribute('href'), label: a.textContent.trim(), cta: a.classList.contains('btn') })));
    }
    setBurgerSlot(burger);
    const offLook = applyLook(root, era, heroLook(), phonePicture(era, settings));
    const fixTimer = setTimeout(() => { stripGlows(root); fixFaintText(root); }, 400);
    // Scroll once per page, not every time settings finish loading (that threw people back to the top).
    const placeKey = window.location.pathname + window.location.hash;
    if (scrolledFor.current !== placeKey && root.childElementCount) {
      scrolledFor.current = placeKey;
      const hash = window.location.hash.slice(1);
      if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
      else window.scrollTo(0, 0);
    }
    return () => { offTrack(); offFooter(); offLook(); offSlider(); offForm(); root.removeEventListener('click', onClick); slot?.remove(); setThemeSlot(null); burger?.remove(); setBurgerSlot(null); setBurgerOpen(false); clearTimeout(fixTimer); };
  }, [html, era, navigate, settings]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = event => { if (!event.target.closest('.ss-themes')) setMenuOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  function switchEra(key) {
    setMenuOpen(false);
    setBurgerOpen(false);
    navigate(kind === 'case' ? `/shopify-studio/jill-and-the-beanstalk/${key}` : `/shopify-studio/${key}`);
  }

  // Floating "Explore the demo store" button: appears once you scroll past the hero, dressed like this era's main button.
  useEffect(() => {
    const root = rootRef.current;
    const fab = fabRef.current;
    if (!root || !fab || kind !== 'studio') return undefined;
    const twin = root.querySelector('.hero .btn.red') || root.querySelector('.hero .btn') || root.querySelector('.btn');
    if (twin) {
      const ts = getComputedStyle(twin);
      ['backgroundColor', 'backgroundImage', 'color', 'fontFamily', 'fontWeight', 'textTransform', 'letterSpacing', 'borderTopLeftRadius', 'borderColor', 'borderStyle', 'borderWidth', 'boxShadow']
        .forEach(key => { fab.style[key] = ts[key]; });
      fab.style.setProperty('--fab-r', ts.borderTopLeftRadius);
    }
    const hero = root.querySelector('.hero');
    const onScroll = () => setFabOn(window.scrollY > (hero ? hero.offsetTop + hero.offsetHeight * 0.6 : 400));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [html, kind, era]);

  if (!html) return <div className="ssp-loading" aria-busy="true" />;


  return <>
    <style>{page.css + heroCss(kind, era, settings) + lookCss(kind, era, heroLook(), phonePicture(era, settings))}</style>
    <div ref={rootRef} className={`ssp ssp-${pageKey}`} dangerouslySetInnerHTML={{ __html: html }} />
    {kind === 'studio' && <a ref={fabRef} className="ss-demo-fab show" href={`/shopify-studio/store.html?theme=${era}`} data-hard=""><i aria-hidden="true" />Demo store</a>}
    {burgerSlot && createPortal(<>
      <button type="button" className="ss-burger" aria-label="Menu" aria-expanded={burgerOpen} onClick={() => setBurgerOpen(open => !open)}>{burgerOpen ? '✕' : '☰'}</button>
    </>, burgerSlot)}
    {themeSlot && kind === 'studio' && createPortal(<a className={`${auditBtnClass} ss-demo-top`} href={`/shopify-studio/store.html?theme=${era}`} data-hard="">Demo store</a>, themeSlot)}
    {burgerOpen && createPortal(<div className="ss-menu" onClick={event => {
      const link = event.target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('/') && !link.hasAttribute('data-hard')) { event.preventDefault(); navigate(href); }
        setBurgerOpen(false);
        return;
      }
      if (event.target.classList.contains('ss-menu-shade') || event.target.closest('[data-close]')) setBurgerOpen(false);
    }}>
        <div className="ss-menu-shade" />
        <div className="ss-menu-panel" role="dialog" aria-label="Shopify Studio menu">
          <div className="ss-menu-top"><b>Shopify Studio</b><button type="button" data-close aria-label="Close menu">×</button></div>
          {STUDIO_MENU.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
          <small>Pick a style</small>
          <div className="ss-menu-styles">{STUDIO_ERAS.map(item => <a key={item.key} className={item.key === era ? 'on' : ''} href={`/shopify-studio/${item.key}`}>{ERA_NAMES[item.key]?.[0] || item.label}<span>{ERA_NAMES[item.key]?.[1] || ''}</span></a>)}</div>
          <a className="ss-menu-cta" href="/shopify-studio#audit">Get a free store review</a>
          <a href="/">← justindematteis.com</a>
        </div>
      </div>, document.body)}
  </>;
}
