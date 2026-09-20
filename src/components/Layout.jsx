import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_STYLES,
  loadGlobalStyles,
  loadSetting,
  styleVars,
} from '../lib/content';

function navItems(config) {
  return Array.from({ length: 7 }, (_, index) => {
    const n = index + 1;
    return { label: config[`nav${n}Label`], url: config[`nav${n}Url`] };
  }).filter(item => item.label && item.url);
}

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [styles, setStyles] = useState(DEFAULT_STYLES);

  useEffect(() => {
    Promise.all([
      loadSetting('global_header', DEFAULT_HEADER),
      loadSetting('global_footer', DEFAULT_FOOTER),
      loadGlobalStyles(),
    ]).then(([headerValue, footerValue, styleValue]) => {
      setHeader(headerValue);
      setFooter(footerValue);
      setStyles(styleValue);
    });
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const links = useMemo(() => navItems(header), [header]);

  return <div className="site-shell" style={styleVars(styles)}>
    <header className="site-nav">
      <div className="shared-wrap nav-inner">
        <Link to="/" className="brand" aria-label="Just Innovate home">
          <span>JUST</span> <em>INNOVATE.</em>
        </Link>

        <button className="menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? '×' : '☰'}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          {links.map(item => <NavLink key={item.url} to={item.url}>{item.label}</NavLink>)}
        </nav>
      </div>
    </header>

    <Outlet />

    <footer className="site-footer">
      <div className="shared-wrap footer-inner">
        <div>
          <strong>{footer.brand || 'JUST INNOVATE.'}</strong>
          <span>{footer.tagline || DEFAULT_FOOTER.tagline}</span>
        </div>
        <div>justindematteis.com • © {new Date().getFullYear()}</div>
      </div>
    </footer>
  </div>;
}
