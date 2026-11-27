// About, Privacy and Terms for Shopify Studio. They use the main Studio page's header, menu and footer;
// only the middle of the page comes from here. Business details come from studioSite.js / the admin.
import { businessInfo } from '../studioSite';

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const UPDATED = 'November 26, 2026';

const STYLE = `<style>
.info{padding:72px 0 84px;background:#fff;border-bottom:2px solid var(--line)}
.info .wrap{max-width:820px}
.info h1{font-size:clamp(38px,5vw,60px);line-height:1.05;margin:0 0 18px}
.info .lead{font-size:20px;color:var(--mute);margin:0 0 34px;line-height:1.55}
.info h2{font-size:26px;margin:38px 0 10px}
.info p,.info li{font-size:17px;line-height:1.7}
.info ul{padding-left:22px}
.info .facts{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid var(--line);background:var(--green2);margin:30px 0}
.info .facts div{padding:18px 20px}.info .facts div+div{border-left:2px solid var(--line)}
.info .facts b{display:block;font-family:Fraunces,serif;font-size:22px}
.info .facts span{font-size:14px}
.info .cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:36px}
.info .upd{font-size:14px;color:var(--mute)}
@media(max-width:640px){.info{padding:48px 0 60px}.info .facts{grid-template-columns:1fr}.info .facts div+div{border-left:0;border-top:2px solid var(--line)}}
</style>`;

function about(b) {
  return `<section class="info"><div class="wrap">
<span class="kick">About ${esc(b.name)}</span>
<h1>${esc(b.tagline)}</h1>
<p class="lead">Based in ${esc(b.city)}, ${esc(b.region)}, ${esc(b.name)} is an independent design and development business helping Canadian retailers build, improve and customize their online stores. We believe your online store should reflect your business — not the limitations of a template.</p>
<div class="facts"><div><b>${esc(b.city)}, ${esc(b.regionCode)}</b><span>Based in ${esc(b.region)}</span></div><div><b>All of ${esc(b.country)}</b><span>Clients coast to coast</span></div><div><b>${esc(b.currency)}</b><span>Every price in Canadian dollars</span></div></div>
<h2>Total customization. From storefront to backend.</h2>
<p>Every business operates differently. Your website, product catalogue, customer experience and administrative tools should work together in a way that makes sense for you. Our services include:</p>
<ul>
<li>Custom Shopify website design and development</li>
<li>Complete storefront redesigns</li>
<li>Product catalogue and backend optimization</li>
<li>Custom Shopify applications and integrations</li>
<li>Inventory and retail workflow solutions</li>
<li>Business automation</li>
<li>Search engine optimization</li>
<li>Digital marketing and creative services</li>
<li>Ongoing website management and support</li>
</ul>
<p>Whether you're launching your first online store or improving an established retail business, we develop solutions around your requirements.</p>
<h2>Unlimited creative possibilities</h2>
<p>Our <a href="/shopify-studio#eras">design showcase</a> explores distinctive visual styles, from vintage-inspired designs to contemporary e-commerce experiences. These designs demonstrate what's possible. They are not a fixed collection of templates. Your store can have its own colours, typography, layouts, features and functionality — completely tailored to your brand.</p>
<h2>Engineering experience meets digital creativity</h2>
<p>Founded by ${esc(b.owner)}, ${esc(b.name)} brings together an engineering and manufacturing background with web and mobile development. That combination of engineering, design and software development shapes our approach: understand the problem, develop the right solution and build something that works.</p>
<p>We look beyond the appearance of a website to consider how it functions for both customers and business owners.</p>
<h2>Real businesses. Practical solutions.</h2>
<p>Our work includes retail website redevelopment, product catalogue management, custom Shopify applications and administrative systems designed to simplify everyday business operations. Explore our <a href="/shopify-studio/case-study">Jill &amp; The Beanstalk case study</a> and discover <a href="/work/justconsignin">JustConsignIn</a>, our consignment management application built around the needs of independent retailers.</p>
<h2>Proudly Canadian</h2>
<p>Located in ${esc(b.city)}, ${esc(b.region)}, we serve businesses throughout ${esc(b.country)}. Our pricing is in Canadian dollars, and our approach considers the needs of Canadian retailers, including local and national shipping, payment systems, taxes and bilingual requirements where applicable.</p>
<p>Work directly with an independent Canadian developer who understands your business requirements.</p>
<h2>Let's build something that's yours.</h2>
<p>From your first storefront to your next major redesign, we're here to help you create a Shopify experience that reflects your brand and supports your business.</p>
<p><b>Your business. Your vision. Your Shopify store.</b></p>
<div class="cta"><a class="btn" href="/shopify-studio#audit">Get a free store review</a><a class="btn ghost" href="/shopify-studio/pricing">See services &amp; pricing</a></div>
</div></section>`;
}

function privacy(b) {
  return `<section class="info"><div class="wrap">
<span class="kick">Privacy</span>
<h1>Privacy Policy</h1>
<p class="upd">Last updated ${UPDATED}</p>
<p class="lead">${esc(b.name)} is run by ${esc(b.owner)} in ${esc(b.city)}, ${esc(b.region)}, ${esc(b.country)}. This page explains what information this website collects, why, and what you can ask for. Canadian privacy law (PIPEDA) applies.</p>
<h2>What we collect</h2>
<ul>
<li><b>What you send us.</b> When you request a free store review, a quote or get in touch, we receive your name, email, store address and whatever you write in the message.</li>
<li><b>Where you came from.</b> The page you sent the form from and, if present, the ad or campaign tag in the link (UTM tags), so we know which marketing works.</li>
<li><b>Website statistics.</b> Google Analytics records pages visited, device type and approximate location, using cookies. It doesn't tell us who you are.</li>
<li><b>Advertising cookies, only if you say yes.</b> The Meta (Facebook/Instagram) pixel loads only after you click “Accept” on the cookie banner. Click “No thanks” and it never loads.</li>
</ul>
<h2>How we use it</h2>
<ul>
<li>To reply to your request, prepare your store review or quote, and do the work you hire us for.</li>
<li>To understand which pages, posts and ads bring people to the site.</li>
<li>We don't sell your information, and we don't add you to a mailing list without asking.</li>
</ul>
<h2>Where it's kept</h2>
<p>Form submissions are stored in a secure database (Supabase) and emailed to us. The website is hosted by Vercel. These providers may store data outside Canada, under their own security and privacy commitments. Spam protection checks submissions automatically and discards junk.</p>
<h2>How long we keep it</h2>
<p>Requests are kept while we're talking about your project and for client records afterwards. Ask and we'll delete anything we don't need to keep by law (for example, tax records).</p>
<h2>Your choices</h2>
<ul>
<li>Ask what information we hold about you, to correct it, or to delete it.</li>
<li>Change your cookie choice any time by clearing this site's data in your browser; the banner will ask again.</li>
<li>Block Google Analytics with Google's opt-out browser add-on.</li>
</ul>
<h2>Contact</h2>
<p>For anything about your information, use the <a href="/contact">contact page</a> and mention “privacy”. If you're not satisfied with our answer, you can contact the Office of the Privacy Commissioner of Canada.</p>
</div></section>`;
}

function terms(b) {
  return `<section class="info"><div class="wrap">
<span class="kick">Terms</span>
<h1>Terms of Service</h1>
<p class="upd">Last updated ${UPDATED}</p>
<p class="lead">These terms cover using this website and requesting services from ${esc(b.name)} (${esc(b.owner)}, ${esc(b.city)}, ${esc(b.region)}). Paid projects also get a written proposal or agreement, which takes priority over this page.</p>
<h2>Prices and quotes</h2>
<ul>
<li>All prices are in Canadian dollars (${esc(b.currency)}) and don't include applicable taxes such as HST/GST.</li>
<li>Prices on the pricing page are starting points. Your final price is set in a written quote before any work starts.</li>
<li>Sending a request, a free store review or a quote doesn't commit either of us to a project. Work starts once a proposal is accepted and any deposit is paid.</li>
<li>Shopify subscriptions, paid apps, themes, domains and other third-party costs are paid by you, directly to those providers.</li>
</ul>
<h2>Free store review</h2>
<p>The free store review is a complimentary, preliminary look at your store with suggestions. It's general advice, not a guarantee of results, and you're free to use it however you like.</p>
<h2>Your store and access</h2>
<ul>
<li>You own your store, your content and your customer data. We work through Shopify's collaborator access and never ask for your Shopify password.</li>
<li>You're responsible for the rights to anything you give us to use (logos, photos, text, product data).</li>
<li>Once paid in full, the custom work we create for your store is yours to use. Third-party themes, apps and stock assets stay under their own licences.</li>
</ul>
<h2>Using this website</h2>
<p>The designs, demo stores, text and graphics on this site belong to ${esc(b.owner)} and are shown as examples. Don't copy them for your own store or resell them without permission. Don't misuse the forms (spam, automated submissions or false information).</p>
<h2>Results and liability</h2>
<p>We work hard for real results, but sales, search rankings and ad performance depend on many things outside our control, so they can't be guaranteed. To the extent the law allows, our liability for any project is limited to the amount you paid for it. This website is provided as-is.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of ${esc(b.region)} and the federal laws of ${esc(b.country)} that apply there.</p>
<h2>Questions</h2>
<p>Use the <a href="/contact">contact page</a>. See also our <a href="/shopify-studio/privacy">Privacy Policy</a> and the full service terms on the <a href="/shopify-studio/pricing#terms">pricing page</a>.</p>
</div></section>`;
}

const PAGES = { about, privacy, terms };
export const INFO_PAGE_KEYS = Object.keys(PAGES);

// Turn the main Studio page into an info page: keep the <head>, header, menu and footer, swap the middle.
export function infoPageHtml(homeHtml, key, settings) {
  const body = PAGES[key](businessInfo(settings));
  const start = homeHtml.indexOf('<section class="hero">');
  const end = homeHtml.indexOf('<div class="smenu"');
  if (start < 0 || end < 0) return homeHtml;
  return homeHtml.slice(0, start) + STYLE + body + '\n' + homeHtml.slice(end);
}
