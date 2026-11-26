// Hero extras: small Shopify logo badge everywhere; faded era year in the background.
// a (default): original CSS art on phones.
// b (?look=b): on phones the era picture fills the hero under a dark overlay.
import { HERO_DEFAULTS } from './studioConfig';

const MARKS = { '50s': "'50s", '60s': "'60s", '70s': "'70s", '80s': "'80s", '80s-memphis': "'80s", '90s': "'90s", '2000s': 'Y2K', '2010s': "'10s" };

const BAG = `<svg viewBox="0 0 40 46" aria-hidden="true"><path d="M13 13c0-5 3-9 7-9s7 4 7 9" fill="none" stroke="#5e8e3e" stroke-width="3" stroke-linecap="round"/><path d="M5 13h30l-2 31H7z" fill="#95bf47"/><path d="M25 21.5c-1-1-2.6-1.6-4.3-1.6-2.6 0-4.3 1.4-4.3 3.4 0 4.1 7 3 7 5.8 0 1-.9 1.7-2.5 1.7-1.6 0-3-.7-4-1.7l-1.3 2c1.3 1.2 3.2 1.9 5.2 1.9 3 0 4.9-1.5 4.9-3.7 0-4.4-7-3.3-7-5.9 0-.9.8-1.5 2.1-1.5 1.2 0 2.3.5 3.1 1.3z" fill="#fff"/></svg>`;

export function heroLook() {
  const v = new URLSearchParams(window.location.search).get('look');
  return v === 'b' ? 'b' : 'a';
}

export function lookCss(kind, era, look, phoneUrl) {
  if (!look) return '';
  const s = `.ssp-${kind}-${era} .hero`;
  let css = `${s} .ssp-eramark{position:absolute;right:2%;bottom:-4%;font-weight:900;line-height:.9;letter-spacing:-.03em;font-size:clamp(120px,22vw,320px);opacity:.14;pointer-events:none;white-space:nowrap;z-index:1}`
    + `${s} .in{position:relative;z-index:2}`
    + `${s} .ssp-shopify-mark{position:absolute;top:14px;left:14px;z-index:3;display:inline-flex;align-items:center;gap:8px;margin:0;padding:6px 12px 6px 8px;background:#fff;color:#1b1b1b;font:700 13px/1 Inter,system-ui,sans-serif;letter-spacing:.02em;border:2px solid #1b1b1b}`
    + `${s} .ssp-shopify-mark svg{width:20px;height:23px}`
    + `@media(max-width:600px){${s} .in{margin-top:46px}${s} .ssp-shopify-mark{top:22px;left:16px;padding:4px 10px 4px 6px;font-size:12px}${s} .ssp-shopify-mark svg{width:16px;height:18px}}`
    + `@media(max-width:600px){${s} .ssp-eramark{font-size:150px;right:-6px;bottom:auto;top:40%;opacity:.2}}`;
  if (look === 'b' && phoneUrl) {
    const url = phoneUrl.replace(/["\\()\s]/g, encodeURIComponent);
    css += `${s} .ssp-look-bg{display:none}`
      + `@media(max-width:600px){${s} .bg,${s} .mdeco{display:none!important}`
      + `${s} .ssp-look-bg{display:block;position:absolute;inset:0;z-index:0;background:linear-gradient(rgba(12,10,16,.7),rgba(12,10,16,.8)),url("${url}") center/cover no-repeat}`
      + `${s} .ssp-eramark{color:#fff!important;opacity:.16}}`;
  }
  return css;
}

export function applyLook(root, era, look, phoneUrl) {
  if (!look) return () => {};
  const usePic = look === 'b' && !!phoneUrl;
  const hero = root.querySelector('.hero');
  const inner = hero?.querySelector('.in');
  if (!hero || !inner) return () => {};
  const head = inner.querySelector('h1, .sign, h2');
  const mark = document.createElement('span');
  mark.className = 'ssp-eramark';
  mark.textContent = MARKS[era] || '';
  if (head) {
    const hs = getComputedStyle(head);
    mark.style.fontFamily = hs.fontFamily;
  }
  mark.style.color = getComputedStyle(inner.querySelector('p') || inner).color;
  hero.insertBefore(mark, inner);
  const logo = document.createElement('div');
  logo.className = 'ssp-shopify-mark';
  logo.innerHTML = `${BAG}<span>Shopify stores &amp; apps</span>`;
  hero.append(logo);
  // Match the era: same corners, border and font as the hero's outline button.
  const twin = inner.querySelector('.btn.ghost, .btn:not(.red)') || inner.querySelector('.btn');
  if (twin) {
    const ts = getComputedStyle(twin);
    logo.style.borderRadius = ts.borderTopLeftRadius;
    logo.style.borderColor = ts.borderTopColor;
    logo.style.fontFamily = ts.fontFamily;
  }
  // Option b on phones: the paragraph turns white so it reads on the dark picture.
  let shade = null;
  const lead = inner.querySelector('p');
  const phone = window.matchMedia('(max-width:600px)');
  const paint = () => {
    if (!lead) return;
    if (usePic && phone.matches) { lead.style.setProperty('color', '#fff', 'important'); lead.style.setProperty('-webkit-text-fill-color', '#fff', 'important'); }
    else { lead.style.removeProperty('color'); lead.style.removeProperty('-webkit-text-fill-color'); }
  };
  if (usePic) {
    shade = document.createElement('div');
    shade.className = 'ssp-look-bg';
    hero.prepend(shade);
    paint();
    phone.addEventListener('change', paint);
  }
  return () => { mark.remove(); logo.remove(); shade?.remove(); if (lead) { lead.style.removeProperty('color'); lead.style.removeProperty('-webkit-text-fill-color'); } phone.removeEventListener('change', paint); };
}

export function phonePicture(era, settings) {
  return String(settings.heroImages?.[era]?.phone || '').trim() || HERO_DEFAULTS[era]?.phone || '';
}
