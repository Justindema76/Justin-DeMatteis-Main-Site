// Builds the pricing page (/shopify-studio/pricing) from the admin's "pricing" settings.
// Layout agreed with Justin + ChatGPT: grouped service directory (left), one service at a time (right).
// Anything not saved in the admin falls back to pricingDefaults.json (the admin starts from the same file).
import DEFAULTS from '../pricingDefaults.json';

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const lines = text => String(text || '').split('\n').map(line => line.trim()).filter(Boolean);
const clean = price => String(price || '').trim().replace(/^\$/, '');

export function catalogue(saved) {
  const data = saved && Array.isArray(saved.services) && saved.services.length ? saved : DEFAULTS;
  return { groups: data.groups || DEFAULTS.groups, disclaimer: data.disclaimer ?? DEFAULTS.disclaimer, services: data.services };
}

// Sidebar line: packages start at X (cards), or the cheapest listed rate (table-only services).
function fromPrice(service) {
  const card = service.cards?.[0];
  if (card?.price) return `Packages from $${clean(card.price).replace(/\+$/, '')}${card.unit || ''}`;
  const row = service.tables?.[0]?.rows?.find(r => /\$/.test(r.price || ''));
  return row ? `From ${row.price}` : '';
}

// Price shown on a card. Never "from" and "+" together.
function priceLabel(c) {
  const price = clean(c.price);
  if (!price || c.priceType === 'quote') return 'Custom quote';
  const unit = c.unit ? `<em>${esc(c.unit)}</em>` : '';
  if (price.endsWith('+') || c.priceType === 'fixed' || c.priceType === 'monthly') return `$${esc(price)}${unit}`;
  return `<span>From</span> $${esc(price)}${unit}`;
}

const quoteHref = (service, pkg) => `/shopify-studio?service=${encodeURIComponent(service)}${pkg ? `&package=${encodeURIComponent(pkg)}` : ''}#audit`;

function grouped(text) {
  return lines(text).map(line => (line.startsWith('#')
    ? `<li class="grp">${esc(line.replace(/^#+\s*/, ''))}</li>` : `<li>${esc(line)}</li>`)).join('');
}

function card(service, c) {
  const full = lines(c.items).length;
  return `<article class="pc${c.recommended ? ' rec' : ''}" data-package="${esc(c.id)}">`
    + `${c.recommended ? '<span class="pc-badge">Recommended</span>' : ''}`
    + `<div class="pc-top">${c.tag ? `<small>${esc(c.tag)}</small>` : ''}<h3>${esc(c.name)}</h3>`
    + `<p class="pc-price">${priceLabel(c)}</p>`
    + `${c.who ? `<p class="pc-who">${esc(c.who)}</p>` : ''}</div>`
    + `${c.eta ? `<p class="pc-eta-m">${esc(c.eta.replace(/^Estimated delivery:\s*/i, ''))}</p>` : ''}<button type="button" class="pc-toggle" aria-expanded="false"><span class="o">View package details</span><span class="c">Hide details</span></button>`
    + `<div class="pc-body"><ul class="pc-high">${lines(c.highlights).map(l => `<li>${esc(l)}</li>`).join('')}</ul>`
    + `${full ? `<details class="pc-more"><summary><span class="o">See everything included</span><span class="c">Show less</span></summary><ul class="pc-full">${grouped(c.items)}</ul></details>` : ''}`
    + `<div class="pc-foot">${c.eta ? `<p class="pc-eta">${esc(c.eta)}</p>` : ''}`
    + `<a class="btn${c.recommended ? '' : ' ghost'}" href="${quoteHref(service.id, c.id)}" data-quote="${esc(service.id)}:${esc(c.id)}">Select package</a></div></div>`
    + '</article>';
}

function compare(service) {
  const cmp = service.compare;
  if (!cmp?.rows?.length) return '';
  return `<details class="cmp"><summary>Compare all ${cmp.cols.length === 3 ? 'three ' : ''}tiers</summary><div class="cmp-scroll"><table><thead><tr><th></th>${cmp.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>`
    + `<tbody>${cmp.rows.map(r => `<tr><th>${esc(r[0])}</th>${r.slice(1).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
}

function table(t) {
  return `<table class="svc"><thead><tr><th>${esc(t.title)}</th><th class="pr">${esc(t.col || 'From')}</th></tr></thead><tbody>`
    + (t.rows || []).map(r => `<tr${r.popular ? ' class="hot"' : ''}><td>${esc(r.name)}${r.note ? `<small>${esc(r.note)}</small>` : ''}</td><td class="pr">${esc(r.price)}</td></tr>`).join('')
    + '</tbody></table>';
}

function note(n) {
  const body = n.list ? `<ul class="ticks">${lines(n.text).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : lines(n.text).map(l => `<p>${esc(l)}</p>`).join('');
  return `<div class="pnote"><h3>${esc(n.title)}</h3>${body}</div>`;
}

function panel(service, data) {
  const cards = service.cards || [];
  return `<section class="ppanel" id="${esc(service.id)}" data-service="${esc(service.id)}" aria-labelledby="h-${esc(service.id)}">`
    + `<div class="pp-head"><h2 id="h-${esc(service.id)}">${esc(service.name)}</h2>${service.intro ? `<p>${esc(service.intro)}</p>` : ''}</div>`
    + (cards.length ? `<div class="pcards n${Math.min(cards.length, 5)}">${cards.map(c => card(service, c)).join('')}</div>` : '')
    + (cards.length && service.id !== 'terms' && data.disclaimer ? `<p class="pdisc">${esc(data.disclaimer)} <a href="#terms">Full terms</a></p>` : '')
    + compare(service)
    + (service.tables || []).map(table).join('')
    + (service.notes || []).map(note).join('')
    + (service.id !== 'terms' && !cards.length ? `<p class="pdisc"><a href="#terms">Customer requirements &amp; terms</a> apply to every service.</p>` : '')
    + `<div class="pp-cta"><a class="btn" href="${quoteHref(service.id)}" data-quote="${esc(service.id)}">Get a custom quote</a><span>Not sure? Start with a free store review.</span></div>`
    + '</section>';
}

function nav(data, byId) {
  return data.groups.map(g => `<div class="pnav-g"><small>${esc(g.name)}</small>${g.services.map(id => byId[id]).filter(Boolean)
    .map(s => `<a href="#${esc(s.id)}" data-nav="${esc(s.id)}"><span>${esc(s.name)}</span>${s.id === 'terms' ? '' : `<em>${esc(fromPrice(s))}</em>`}</a>`).join('')}</div>`).join('');
}

export function renderPricing(html, saved) {
  const data = catalogue(saved);
  const byId = Object.fromEntries(data.services.map(s => [s.id, s]));
  const order = data.groups.flatMap(g => g.services).filter(id => byId[id]);
  data.services.forEach(s => { if (!order.includes(s.id)) order.push(s.id); });
  return html
    .replace('<!--PRICING_NAV-->', nav(data, byId))
    .replace('<!--PRICING_NAV_M-->', nav(data, byId))
    .replace('<!--PRICING_PANELS-->', order.map(id => panel(byId[id], data)).join(''))
    .replace('<!--PRICING_FIRST-->', esc(byId[order[0]]?.name || ''));
}

// First tier price of a service, for the 3 package cards on the main page and era pages.
export function startingPrice(saved, id) {
  const service = catalogue(saved).services.find(s => s.id === id);
  return clean(service?.cards?.[0]?.price || '').replace(/\+$/, '');
}
