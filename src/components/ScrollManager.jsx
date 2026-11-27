import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Every new page starts at the top. Links with a #section jump to that section once it has rendered.
// Back/forward (POP) is left to the browser so people return to where they were.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'auto';
  }, []);

  useEffect(() => {
    if (navType === 'POP') return undefined;
    // Close any open Shopify Studio phone menu left over from the previous page.
    document.querySelectorAll('.smenu.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); });
    document.querySelectorAll('.smenu-btn[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = '';
    const id = decodeURIComponent(hash.slice(1));
    let done = false;
    const top = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Lazy pages render a moment later, so check a few times; stop once the section is reached.
    const timers = [0, 80, 300, 800].map(ms => setTimeout(() => {
      if (done) return;
      if (!id) { if (ms < 800) top(); return; }
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        // Keep the section title out from under a sticky header.
        const header = [...document.querySelectorAll('header')].find(h => /sticky|fixed/.test(getComputedStyle(h).position) && h.getBoundingClientRect().top <= 0 + 1);
        if (header) window.scrollBy({ top: -(header.offsetHeight + 8), behavior: 'instant' });
        done = true;
      }
      else if (ms === 0) top();
    }, ms));
    return () => timers.forEach(clearTimeout);
  }, [pathname, hash, key, navType]);

  return null;
}
