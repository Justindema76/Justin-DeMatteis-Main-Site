import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Notice for cold sales pitches, shown on the Contact page (pop-up) and in the contact form.
export const SALES_NOTICE_TITLE = 'A note for agencies and marketers';
export const SALES_NOTICE_TEXT = 'If you’re pitching SEO, marketing, lead generation or “white-label” services from a free Gmail address, I won’t reply. A real business uses its own business email. Please don’t send a follow-up or a price list. It won’t be read.';

const SEEN_KEY = 'jd_sales_notice_seen';

export function SalesNotice() {
  return (
    <div className="sales-notice" role="note">
      <strong>{SALES_NOTICE_TITLE}</strong>
      <p>{SALES_NOTICE_TEXT}</p>
    </div>
  );
}

// Opens when the Contact page loads, once per browser session. Rendered on <body> so it
// sits above every page section.
export function SalesNoticePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch { /* storage blocked */ }
    if (seen) return undefined;
    const timer = window.setTimeout(() => setOpen(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = event => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked */ }
  }

  if (!open) return null;
  return createPortal(
    <div className="sales-popup-backdrop" onClick={close}>
      <div className="sales-popup" role="dialog" aria-modal="true" aria-labelledby="sales-popup-title" onClick={event => event.stopPropagation()}>
        <span className="sales-popup-icon" aria-hidden="true">✋</span>
        <h2 id="sales-popup-title">{SALES_NOTICE_TITLE}</h2>
        <p>{SALES_NOTICE_TEXT}</p>
        <button type="button" className="sales-popup-button" onClick={close} autoFocus>Got it</button>
      </div>
    </div>,
    document.body,
  );
}
