import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo1 from '../assets/Logos_Lost_and_Found/logo1.svg';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/report', label: 'Report' },
  { to: '/login', label: 'Login' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    color: 'white',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    fontWeight: isActive ? 700 : 400,
    borderBottom: isActive ? '3px solid white' : '3px solid transparent',
    display: 'inline-block',
  });

  const mobileLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    color: 'white',
    textDecoration: 'none',
    padding: '10px 20px',
    display: 'block',
    fontWeight: isActive ? 700 : 400,
    borderLeft: isActive ? '4px solid white' : '4px solid transparent',
    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#2D7C4E',
        borderBottom: '3px solid #014d0c',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 16px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo + title */}
        <NavLink
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <img src={logo1} alt="UPRM Lost & Found logo" style={{ height: 40, width: 40 }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>
            UPRM: Lost &amp; Found
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav
          style={{ display: 'flex', gap: 4 }}
          className="desktop-nav"
        >
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={linkStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger button (mobile) */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: 26,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          className="hamburger-btn"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav style={{ background: '#235f3c', borderTop: '1px solid #014d0c' }} className="mobile-nav">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={mobileLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 639px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
