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

const AI_SUBMENU = [
  { label: 'JustConsignIn', url: '/ai-development/justconsignin' },
  { label: 'Website Admin & Visual Site Builder', url: '/ai-development/website-admin-visual-builder' },
  { label: 'Wheels Design Studio', url: '/ai-development/wheels-design-studio' },
  { label: 'Social Automation & Media Studio', url: '/ai-development/social-automation-media-studio' },
];

const SOCIAL_NETWORKS = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
];

function navItems(config) {
  const configured = Array.from({ length: 7 }, (_, index) => {
    const n = index + 1;
    const item = { label: config[`nav${n}Label`], url: config[`nav${n}Url`] };

    if (item.url === '/work') {
      item.children = WORK_SUBMENU;
      item.allLabel = 'All Work';
    }

    if (item.url === '/ai-development') {
      item.children = AI_SUBMENU;
      item.allLabel = 'All AI + Development';
    }

    return item;
  }).filter(item => {
    if (!item.label || !item.url) return false;
    if (item.url === '/' || item.url === '/home') return false;
    if (String(item.label).trim().toLowerCase() === 'home') return false;
    return true;
  });

  return [{ label: 'Home', url: '/' }, ...configured];
}

function SocialIcon({ network }) {
  if (network === 'linkedin') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 8.3H3.2V21h3.4V8.3ZM4.9 3A2 2 0 1 0 4.9 7a2 2 0 0 0 0-4ZM21 13.7c0-3.8-2-5.6-4.7-5.6-2.2 0-3.2 1.2-3.7 2v-1.8H9.2V21h3.4v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4V21H21v-7.3Z"/></svg>;
  if (network === 'github') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1.1 1.5 1.1.9 1.6 2.4 1.1 3 .9.1-.7.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.2 9.2 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10.2 10.2 0 0 0 22 12.2C22 6.6 17.5 2 12 2Z"/></svg>;
  if (network === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm-.2 2A3.1 3.1 0 0 0 4 7.1v9.8A3.1 3.1 0 0 0 7.1 20h9.8a3.1 3.1 0 0 0 3.1-3.1V7.1A3.1 3.1 0 0 0 16.9 4H7.1Zm10.2 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>;
  if (network === 'facebook') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4.4c-.5-.1-2-.4-3.8-.4-3.7 0-6.2 2.2-6.2 6.4V14H3v4h4v10h5V18h4l.6-4H12v-3.2C12 9.6 12.3 8 14 8Z" transform="scale(.8) translate(3 -2)"/></svg>;
  if (network === 'youtube') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.3V8.7l5.7 3.3L10 15.3Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.6 2h3.2c.3 2.5 1.7 4.3 4.2 5v3.2c-1.6 0-3-.5-4.2-1.3V16c0 4.1-3.3 7.4-7.4 7.4S4 20.1 4 16s3.3-7.4 7.4-7.4c.4 0 .8 0 1.2.1V12a4.1 4.1 0 1 0 2.9 3.9L15.6 2Z"/></svg>;
}

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [social, setSocial] = useState({});

  useEffect(() => {
    Promise.all([
      loadSetting('global_header', DEFAULT_HEADER),
      loadSetting('global_footer', DEFAULT_FOOTER),
      loadGlobalStyles(),
      loadSetting('social_links', {}),
    ]).then(([headerValue, footerValue, styleValue, socialValue]) => {
      setHeader(headerValue);
      setFooter(footerValue);
      setStyles(styleValue);
      setSocial(socialValue || {});
    });
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const links = useMemo(() => navItems(header), [header]);
  const activeSocial = useMemo(
    () => SOCIAL_NETWORKS.filter(network => social?.[network.key]?.url && social?.[network.key]?.enabled !== false),
    [social]
  );
  const brandFirst = header.brandFirst || DEFAULT_HEADER.brandFirst || 'Justin';
  const brandSecond = header.brandSecond || DEFAULT_HEADER.brandSecond || 'DeMatteis';
  const headerSocialStyle = {
    '--header-social-icon-color': header.socialIconColor || '#415162',
    '--header-social-icon-background': header.socialIconBackground || 'var(--site-surface,#fff)',
    '--header-social-icon-border': header.socialIconBorder || 'var(--site-border,#DCE4EC)',
    '--header-social-icon-hover-color': header.socialIconHoverColor || '#ffffff',
    '--header-social-icon-hover-background': header.socialIconHoverBackground || 'var(--site-primary,#2F6BFF)',
  };
  const footerSocialStyle = {
    '--footer-social-icon-color': footer.socialIconColor || '#ffffff',
    '--footer-social-icon-background': footer.socialIconBackground || 'rgba(255,255,255,.04)',
    '--footer-social-icon-border': footer.socialIconBorder || 'rgba(255,255,255,.18)',
    '--footer-social-icon-hover-color': footer.socialIconHoverColor || '#ffffff',
    '--footer-social-icon-hover-background': footer.socialIconHoverBackground || 'var(--site-primary,#2F6BFF)',
  };

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
                end={item.url === '/'}
                className={({ isActive }) => `nav-dropdown-parent${isActive || (item.url !== '/' && location.pathname.startsWith(`${item.url}/`)) ? ' active' : ''}`}
              >
                {item.label}
                <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
              </NavLink>
              <div className="nav-dropdown-menu" aria-label={`${item.label} pages`}>
                <NavLink to={item.url} end>{item.allLabel || item.label}</NavLink>
                {item.children.map(child => (
                  <NavLink key={child.url} to={child.url}>{child.label}</NavLink>
                ))}
              </div>
            </div>
          ) : (
            <NavLink key={item.url} to={item.url} end={item.url === '/'}>{item.label}</NavLink>
          ))}
          {activeSocial.length > 0 && <div className="nav-social-links" aria-label="Social links" style={headerSocialStyle}>
            {activeSocial.map(network => <a
              key={network.key}
              href={social[network.key].url}
              target="_blank"
              rel="noreferrer"
              aria-label={network.label}
              title={network.label}
            ><SocialIcon network={network.key}/></a>)}
          </div>}
        </nav>
      </div>
    </header>

    <Outlet />

    <footer className="site-footer">
      <div className="shared-wrap footer-inner">
        <div className="footer-brand">
          <strong>{footer.brand || 'JUST INNOVATE.'}</strong>
          <span>{footer.tagline || DEFAULT_FOOTER.tagline}</span>
        </div>
        <div className="footer-right">
          {activeSocial.length > 0 && <div className="footer-social-links" aria-label="Social links" style={footerSocialStyle}>
            {activeSocial.map(network => <a
              key={network.key}
              href={social[network.key].url}
              target="_blank"
              rel="noreferrer"
              aria-label={network.label}
              title={network.label}
            ><SocialIcon network={network.key}/></a>)}
          </div>}
          <div>justindematteis.com • © {new Date().getFullYear()}</div>
        </div>
      </div>
    </footer>
  </div>;
}
