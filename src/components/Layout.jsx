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

const WORK_SUBMENU = [
  { label: 'Jill & The Beanstalk', url: '/work/jill-and-the-beanstalk' },
  { label: 'Wheels Automotive', url: '/work/wheels-automotive' },
  { label: 'WordPress Websites', url: '/work/wordpress-websites' },
];

function navItems(config) {
  return Array.from({ length: 7 }, (_, index) => {
    const n = index + 1;
    const item = { label: config[`nav${n}Label`], url: config[`nav${n}Url`] };
    if (item.url === '/work') item.children = WORK_SUBMENU;
    return item;
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
  const brandFirst = header.brandFirst || DEFAULT_HEADER.brandFirst || 'Justin';
  const brandSecond = header.brandSecond || DEFAULT_HEADER.brandSecond || 'DeMatteis';

  return <div className="site-shell" style={styleVars(styles)}>
    <header className="site-nav">
      <div className="shared-wrap nav-inner">
        <Link to="/" className="brand" aria-label={`${brandFirst} ${brandSecond} home`}>
          <span style={{color: header.brandFirstColor || DEFAULT_HEADER.brandFirstColor}}>{brandFirst}</span>{' '}
          <em style={{color: header.brandSecondColor || DEFAULT_HEADER.brandSecondColor}}>{brandSecond}</em>
        </Link>

        <button className="menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? '×' : '☰'}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          {links.map(item => item.children?.length ? (
            <div className="nav-dropdown" key={item.url}>
              <NavLink
                to={item.url}
                className={({ isActive }) => `nav-dropdown-parent${isActive || location.pathname.startsWith('/work/') ? ' active' : ''}`}
              >
                {item.label}
                <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
              </NavLink>
              <div className="nav-dropdown-menu" aria-label={`${item.label} pages`}>
                <NavLink to="/work" end>All Work</NavLink>
                {item.children.map(child => (
                  <NavLink key={child.url} to={child.url}>{child.label}</NavLink>
                ))}
              </div>
            </div>
          ) : (
            <NavLink key={item.url} to={item.url}>{item.label}</NavLink>
          ))}
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
