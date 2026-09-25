import { useEffect, useState } from 'react';

export default function ProductVisualGallery({ items = [] }) {
  const gallery = Array.isArray(items) ? items.filter(item => item?.url) : [];
  const [activeIndex, setActiveIndex] = useState(null);

  const close = () => setActiveIndex(null);
  const previous = () => setActiveIndex(index => {
    if (index === null || gallery.length < 2) return index;
    return (index - 1 + gallery.length) % gallery.length;
  });
  const next = () => setActiveIndex(index => {
    if (index === null || gallery.length < 2) return index;
    return (index + 1) % gallery.length;
  });

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = event => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, gallery.length]);

  if (!gallery.length) return null;

  const active = activeIndex === null ? null : gallery[activeIndex];

  return <>
    <div className="product-visual-gallery-wrap">
      <div className="product-visual-gallery-note">Click any image to enlarge.</div>
      <div className="product-visual-gallery" aria-label="Product visuals">
      {gallery.map((item, index) => (
        <button
          className="product-visual-thumbnail"
          type="button"
          key={item.url || index}
          onClick={() => setActiveIndex(index)}
          aria-label={`Open image ${index + 1} of ${gallery.length}`}
        >
          <img
            src={item.url}
            alt={item.alt || ''}
            loading="lazy"
            decoding="async"
          />
          {item.caption && <span>{item.caption}</span>}
        </button>
      ))}
      </div>
    </div>

    {active && <div
      className="product-visual-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Expanded product visual"
      onMouseDown={event => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <button
        type="button"
        className="product-visual-lightbox-close"
        onClick={close}
        aria-label="Close image"
      >
        ×
      </button>

      {gallery.length > 1 && <button
        type="button"
        className="product-visual-lightbox-nav previous"
        onClick={previous}
        aria-label="Previous image"
      >
        ‹
      </button>}

      <figure className="product-visual-lightbox-figure">
        <img
          src={active.url}
          alt={active.alt || ''}
          decoding="async"
        />
        {active.caption && <figcaption>{active.caption}</figcaption>}
      </figure>

      {gallery.length > 1 && <button
        type="button"
        className="product-visual-lightbox-nav next"
        onClick={next}
        aria-label="Next image"
      >
        ›
      </button>}
    </div>}
  </>;
}
