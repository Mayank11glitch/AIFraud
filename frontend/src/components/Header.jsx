import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Header = () => {
  const location = useLocation();
  const { user, login, register, logout, loginWithGoogle } = useContext(AuthContext);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Scanner', path: '/scan' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Explainable AI', path: '/explainable' },
    { name: 'Behavioral', path: '/behavioral' },
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let success = false;
    
    if (isLoginTab) {
      success = await login(username, password);
      if (!success) setError('Invalid username or password');
    } else {
      if (!email) {
        setError('Email is required');
        return;
      }
      success = await register(username, email, password);
      if (!success) setError('Registration failed. Username/email might exist.');
    }
    
    if (success) {
      setShowAuthModal(false);
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await loginWithGoogle(credentialResponse.credential);
    if (success) {
      setShowAuthModal(false);
    } else {
      setError('Google Sign-In failed on the server.');
    }
  };

  return (
    <header
      className="safe-area-top sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 bg-[#f2f2f2]"
      style={{
        minHeight: '80px',
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 0px)`,
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
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-body uppercase tracking-wider">{user.username}</span>
            <button 
              onClick={logout}
              className="text-xs font-bold font-body uppercase tracking-wider underline hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-xs font-bold font-body uppercase tracking-wider hover:underline"
          >
            Login
          </button>
        )}
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#f2f2f2] border-2 border-[#111111] p-8 w-full max-w-md relative" style={{ boxShadow: '8px 8px 0px #111111' }}>
            <button 
              className="absolute top-4 right-4 material-symbols-outlined text-[#111111] hover:opacity-50"
              onClick={() => setShowAuthModal(false)}
            >
              close
            </button>
            <h2 className="text-2xl font-display font-bold mb-6 text-[#111111] uppercase tracking-tighter">
              {isLoginTab ? 'Access Terminal' : 'Register Operator'}
            </h2>
            
            <div className="flex gap-4 mb-6 border-b-2 border-[#111111] pb-2">
              <button 
                className={`font-body text-xs font-bold uppercase tracking-wider ${isLoginTab ? 'text-[#111111] underline' : 'text-[#838282]'}`}
                onClick={() => setIsLoginTab(true)}
              >
                Login
              </button>
              <button 
                className={`font-body text-xs font-bold uppercase tracking-wider ${!isLoginTab ? 'text-[#111111] underline' : 'text-[#838282]'}`}
                onClick={() => setIsLoginTab(false)}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {error && <div className="bg-red-100 text-red-800 p-2 text-xs font-bold font-body">{error}</div>}
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider font-body text-[#111111]">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border-2 border-[#111111] p-3 text-sm focus:outline-none focus:ring-0" 
                  required
                />
              </div>

              {!isLoginTab && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider font-body text-[#111111]">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-2 border-[#111111] p-3 text-sm focus:outline-none focus:ring-0" 
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider font-body text-[#111111]">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-2 border-[#111111] p-3 text-sm focus:outline-none focus:ring-0" 
                  required
                />
              </div>

              <button 
                type="submit"
                className="mt-4 bg-[#111111] text-[#f2f2f2] p-3 text-sm font-bold uppercase tracking-widest hover:bg-black active:translate-y-1 transition-all"
              >
                {isLoginTab ? 'Execute Login' : 'Initialize Account'}
              </button>
            </form>

            {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' && (
              <>
                <div className="mt-6 flex items-center justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider font-body text-[#838282] bg-[#f2f2f2] px-2 relative z-10">OR</span>
                  <div className="absolute left-8 right-8 h-[2px] bg-[#111111]/10 mt-[1px]"></div>
                </div>

                <div className="mt-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError('Google Sign-In failed.');
                    }}
                    theme="filled_black"
                    shape="rectangular"
                    text={isLoginTab ? "signin_with" : "signup_with"}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
