import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navItems, profile } from '../../data/profile';
import Icon from '../ui/Icon.jsx';
import ThemeToggle from './ThemeToggle.jsx';

// Floating glass bar. The resume link lives here, and only here, so it is
// one click away on every page without being repeated through the content.
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: Escape or a click outside closes it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e) => {
      if (!headerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container">
        <div className="nav-bar">
          <Link to="/" className="brand" aria-label={`${profile.name}, home`}>
            <span className="brand__mark" aria-hidden="true">
              SN
            </span>
            <span className="brand__name">{profile.name}</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <a className="btn btn--small btn--quiet" href={profile.resume} target="_blank" rel="noopener" type="application/pdf">
              Resume
              <span className="visually-hidden"> (PDF, opens in a new tab)</span>
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="icon-button icon-button--quiet menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? 'close' : 'menu'} size={18} />
            </button>
          </div>
        </div>

        <nav id="mobile-nav" className="mobile-nav" aria-label="Site" hidden={!open}>
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
