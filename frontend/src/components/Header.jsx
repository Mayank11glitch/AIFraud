import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Scanner', path: '/scan' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Explainable AI', path: '/explainable' },
    { name: 'Behavioral', path: '/behavioral' },
  ];

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 bg-[#f2f2f2]"
      style={{
        height: '80px',
        borderBottom: '2px solid #111111',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-[#111111] text-[#f2f2f2] w-8 h-8 rounded-sm">
          <span className="material-symbols-outlined text-[18px]">security</span>
        </div>
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-[-0.05em]"
          style={{ color: '#111111' }}
        >
          ScamDetect AI
        </Link>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-10">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`font-body relative group py-2`}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: isActive ? '#111111' : '#838282',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#111111'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#111111' : '#838282'; }}
            >
              {link.name}
              {/* Brutalist underline on active / hover */}
              <span 
                className={`absolute left-0 bottom-0 h-[2px] bg-[#111111] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
              ></span>
            </Link>
          );
        })}
      </nav>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        <Link
          to="/scan"
          className="hidden md:flex items-center justify-center px-6 brutal-btn relative transition-transform active:translate-x-[2px] active:translate-y-[2px]"
          style={{
            height: '42px',
            backgroundColor: '#f2f2f2',
            border: '2px solid #111111',
            color: '#111111',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontFamily: '"Satoshi", sans-serif',
            boxShadow: '4px 4px 0px #111111',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#111111';
            e.currentTarget.style.color = '#f2f2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f2f2f2';
            e.currentTarget.style.color = '#111111';
          }}
        >
          Start Scanning
        </Link>
      </div>
    </header>
  );
};

export default Header;
