import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import useScrollReveal, { useStaggerReveal } from '../hooks/useScrollReveal';
import { API_BASE } from '../config/api';

const CHART_COLORS = ['#111111', '#838282', '#b6b5b5', '#d9d9d9', '#bfbfbf', '#636363'];
const RISK_COLORS = { Critical: '#111111', High: '#444444', Medium: '#838282', Low: '#b6b5b5' };

/* ==============================
   Echo Stack Component
   ============================== */
const EchoText = ({ text, className = '' }) => (
  <span className="echo-stack">
    {/* Background echo layers (rendered first, behind) */}
    <span className="echo-layer echo-layer-4" aria-hidden="true">{text}</span>
    <span className="echo-layer echo-layer-3" aria-hidden="true">{text}</span>
    <span className="echo-layer echo-layer-2" aria-hidden="true">{text}</span>
    <span className="echo-layer echo-layer-1" aria-hidden="true">{text}</span>
    {/* Foreground (main) layer */}
    <span className={`relative z-10 ${className}`}>{text}</span>
  </span>
);

const Home = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/history?limit=10`).then(r => r.json()),
      fetch(`${API_BASE}/api/stats`).then(r => r.json())
    ]).then(([history, statsData]) => {
      setScanHistory(history);
      setStats(statsData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch dashboard data:', err);
      setLoading(false);
    });
  }, []);

  const getRiskBadge = (level) => {
    const colors = {
      'Critical': 'bg-[#111111] text-[#f2f2f2]',
      'High': 'bg-[#444444] text-[#f2f2f2]',
      'Medium': 'bg-[#d9d9d9] text-[#111111]',
      'Low': 'bg-[#f2f2f2] text-[#111111] border border-[rgba(30,30,30,0.15)]',
    };
    return colors[level] || 'bg-[#e5e5e5] text-[#111111]';
  };

  const getTypeIcon = (type) => {
    const icons = { image: 'image', url: 'link', video: 'smart_display', text: 'chat' };
    return icons[type] || 'scan';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#ffffff', border: '1px solid rgba(30,30,30,0.1)', padding: '12px 16px' }}>
          <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '13px', fontWeight: 700, color: '#111111' }}>
            {payload[0].name || label}
          </p>
          <p style={{ fontFamily: '"Clash Display", sans-serif', fontSize: '18px', fontWeight: 600, color: '#111111' }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Scroll reveal refs
  const heroRef = useScrollReveal({ threshold: 0.1 });
  const heroLabelRef = useScrollReveal({ threshold: 0.1, delay: 100 });
  const heroTitleRef = useScrollReveal({ threshold: 0.1, delay: 300 });
  const heroSubRef = useScrollReveal({ threshold: 0.1, delay: 500 });
  const heroCtaRef = useScrollReveal({ threshold: 0.1, delay: 700 });
  const philosophyRef = useScrollReveal({ threshold: 0.15 });
  const philosophyGridRef = useStaggerReveal({ staggerMs: 150 });
  const analyticsHeaderRef = useScrollReveal({ threshold: 0.2 });
  const statsGridRef = useStaggerReveal({ staggerMs: 150 });
  const chartsGridRef = useStaggerReveal({ staggerMs: 200 });
  const trendRef = useScrollReveal({ threshold: 0.15 });
  const threatsRef = useScrollReveal({ threshold: 0.15 });
  const servicesRef = useStaggerReveal({ staggerMs: 180 });
  const recentHeaderRef = useScrollReveal({ threshold: 0.2 });
  const processRef = useStaggerReveal({ staggerMs: 200 });

  return (
    <main className="flex-1 relative" style={{ backgroundColor: '#f2f2f2' }}>
      <div className="bg-noise"></div>

      {/* ========================================
          HERO SECTION — Typographic Echo Stack
          ======================================== */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center overflow-hidden px-6"
        style={{ minHeight: '85vh', paddingTop: '120px', paddingBottom: '100px' }}
      >
        {/* Graffiti Marquee Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center translate-y-[-5%] opacity-[0.03]">
          <div className="animate-marquee whitespace-nowrap">
            <span className="font-display text-[22vw] font-bold leading-none select-none px-4 tracking-[-0.05em]">
              ZERO TRUST THREAT DETECTION ZERO TRUST THREAT DETECTION ZERO TRUST
            </span>
          </div>
        </div>

        {/* Brutalist Black Accents / Drafting Lines */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Plus Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 20v20M20 30h20' stroke='%23111111' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
            backgroundPosition: 'center'
          }}></div>

          {/* Stark Vertical Edges */}
          <div className="absolute left-[5%] md:left-[10%] top-0 bottom-0 w-[1px] bg-[#111111] opacity-20"></div>
          <div className="absolute right-[5%] md:right-[10%] top-0 bottom-0 w-[1px] bg-[#111111] opacity-20"></div>
          
          {/* Thick Solid Black Blocks */}
          <div className="absolute top-0 left-0 w-8 md:w-16 h-[30vh] bg-[#111111]"></div>
          <div className="absolute bottom-0 right-0 w-[40vw] h-4 md:h-12 bg-[#111111]"></div>
          
          {/* Solid Black Rectangle Abstract Element */}
          <div className="absolute top-[40%] left-[8%] w-12 h-12 bg-[#111111] hidden md:block"></div>
          <div className="absolute top-[40%] left-[calc(8%+3rem)] w-[20vw] h-[1px] bg-[#111111] hidden md:block"></div>

          {/* Technical Crosshair/Radar */}
          <div className="absolute top-[18%] right-[8%] md:right-[18%] opacity-[0.15]">
            <svg width="240" height="240" viewBox="0 0 240 240" stroke="#111111" strokeWidth="2" fill="none">
              <circle cx="120" cy="120" r="100" strokeDasharray="8 8" />
              <circle cx="120" cy="120" r="60" strokeDasharray="4 12" />
              <line x1="120" y1="0" x2="120" y2="240" />
              <line x1="0" y1="120" x2="240" y2="120" />
              <rect x="116" y="116" width="8" height="8" fill="#111111" />
            </svg>
            <span className="absolute -bottom-6 -left-12 font-mono text-[11px] tracking-widest font-bold text-[#111111]">SYS_RADAR.01 / ACTIVE</span>
          </div>

          {/* Typography Accents */}
          <p className="absolute bottom-[20%] left-[10%] font-mono text-[10px] tracking-[0.2em] font-bold text-[#111111] transform -rotate-90 origin-left">
            V 2.0.44 — ENGINE ONLINE
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Subtle label */}
        <div
          ref={heroLabelRef}
          className="reveal fade-up fast"
          style={{
            fontSize: '12px',
            fontFamily: '"Satoshi", sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#b6b5b5',
            marginBottom: '48px',
          }}
        >
          AI-Powered Protection
        </div>

        {/* Echo Hero Title */}
        <div ref={heroTitleRef} className="reveal blur-in slow">
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(60px, 11vw, 180px)',
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: '-0.05em',
              color: '#111111',
            }}
          >
            <EchoText text="SCAM" />
          </h1>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(60px, 11vw, 180px)',
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: '-0.05em',
              color: '#111111',
              marginTop: '-0.05em',
            }}
          >
            <EchoText text="DETECT" />
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={heroSubRef}
          className="reveal fade-up"
          style={{
            fontFamily: '"Satoshi", sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            color: '#838282',
            maxWidth: '520px',
            lineHeight: 1.6,
            marginTop: '48px',
          }}
        >
          Next-generation AI defense against fraud, phishing, and digital manipulation.
          Precision-engineered threat intelligence.
        </p>

        {/* CTA Buttons */}
        <div
          ref={heroCtaRef}
          className="reveal fade-up flex gap-4 items-center"
          style={{ marginTop: '40px' }}
        >
          <Link
            to="/scan"
            className="transition-all"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '48px',
              padding: '0 32px',
              backgroundColor: '#111111',
              color: '#f2f2f2',
              borderRadius: '9999px',
              fontSize: '12px',
              fontFamily: '"Satoshi", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '1px solid #111111',
              transitionDuration: '300ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#111111';
              e.currentTarget.style.color = '#f2f2f2';
            }}
          >
            Start Scanning →
          </Link>
          <a
            href="#analytics"
            className="transition-all"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '48px',
              padding: '0 32px',
              backgroundColor: 'transparent',
              color: '#838282',
              fontSize: '12px',
              fontFamily: '"Satoshi", sans-serif',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transitionDuration: '300ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#111111'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#838282'; }}
          >
            View Analytics
          </a>
        </div>
        </div>
      </section>

      {/* ========================================
          PHILOSOPHY / NARRATIVE SECTION
          ======================================== */}
      <section style={{ padding: '0 24px 120px 24px' }}>
        {/* Hairline divider */}
        <div className="hairline-v" style={{ marginBottom: '80px' }}></div>

        {/* Large editorial quote */}
        <div
          ref={philosophyRef}
          className="reveal fade-up slow max-w-4xl mx-auto text-center"
          style={{ marginBottom: '80px' }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#111111',
            }}
          >
            We believe in a digital world built on{' '}
            <span className="font-editorial" style={{ fontWeight: 400 }}>
              trust
            </span>
            , defended by intelligence.
          </h2>
        </div>

        {/* 3-Column Philosophy Grid */}
        <div
          ref={philosophyGridRef}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3"
          style={{ gap: '32px' }}
        >
          <div className="reveal fade-up">
            <h3
              className="font-display"
              style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2 }}
            >
              Precision Analysis
            </h3>
            <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '15px', fontWeight: 400, color: '#838282', lineHeight: 1.7 }}>
              Every scan is processed through multiple AI models simultaneously, cross-referencing patterns across millions of known threat signatures.
            </p>
          </div>
          <div className="reveal fade-up">
            <h3
              className="font-display"
              style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2 }}
            >
              Real-Time Defense
            </h3>
            <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '15px', fontWeight: 400, color: '#838282', lineHeight: 1.7 }}>
              Millisecond response times ensure threats are identified before they can cause damage. Always on, always learning, always ahead.
            </p>
          </div>
          <div className="reveal fade-up">
            <h3
              className="font-display"
              style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2 }}
            >
              Transparent AI
            </h3>
            <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '15px', fontWeight: 400, color: '#838282', lineHeight: 1.7 }}>
              Every decision is explainable. Our XAI engine provides full visibility into the reasoning behind each threat assessment.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================
          BESPOKE SERVICE CARDS
          ======================================== */}
      <section style={{ padding: '0 24px 120px 24px' }}>
        <div ref={servicesRef} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3" style={{ gap: '24px' }}>
          {[
            {
              icon: 'image',
              title: 'Screenshot Scan',
              desc: 'Upload screenshots of suspicious messages. Our AI analyzes visual patterns and embedded text for known scam signatures.',
              link: '/scan',
            },
            {
              icon: 'link',
              title: 'URL Verification',
              desc: 'Instantly verify URL safety with heuristic analysis, domain reputation scoring, and real-time content classification.',
              link: '/scan',
            },
            {
              icon: 'smart_display',
              title: 'Deepfake Detection',
              desc: 'Detect AI-generated deepfakes across video and audio. Ensure media authenticity before trusting sensitive content.',
              link: '/scan',
            },
          ].map((svc, i) => (
            <Link
              to={svc.link}
              key={i}
              className="reveal fade-up service-card group flex flex-col justify-between"
              style={{ padding: '40px 32px', minHeight: '280px' }}
            >
              {/* Icon Container */}
              <div
                className="icon-container mb-8"
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#f2f2f2',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '28px', color: '#111111' }}
                >
                  {svc.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3
                  className="font-display"
                  style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                    marginBottom: '12px',
                    color: '#111111',
                  }}
                >
                  {svc.title}
                </h3>
                <p
                  style={{
                    fontFamily: '"Satoshi", sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#838282',
                    lineHeight: 1.7,
                  }}
                >
                  {svc.desc}
                </p>
              </div>

              {/* CTA Arrow */}
              <div
                className="flex items-center gap-2 mt-6"
                style={{
                  fontSize: '12px',
                  fontFamily: '"Satoshi", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#b6b5b5',
                  transition: 'color 300ms',
                }}
              >
                <span className="group-hover:text-[#111111] transition-colors">Explore</span>
                <span
                  className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                  style={{ fontSize: '16px' }}
                >
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================
          HOW IT WORKS — Process Steps
          ======================================== */}
      <section style={{ padding: '0 24px 120px 24px' }}>
        <div className="hairline-v" style={{ marginBottom: '80px' }}></div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: '#111111',
                marginBottom: '16px',
              }}
            >
              How It Works
            </h2>
            <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '16px', color: '#838282', fontWeight: 400 }}>
              Three steps. Zero complexity.
            </p>
          </div>

          <div ref={processRef} className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '48px' }}>
            {[
              { step: '01', title: 'Upload', desc: 'Provide the URL, image, text, or video you want analyzed.' },
              { step: '02', title: 'Analyze', desc: 'Our ML models process the input through multiple detection layers in milliseconds.' },
              { step: '03', title: 'Protect', desc: 'Receive a clear safety score, risk breakdown, and actionable threat intelligence.' },
            ].map((item, i) => (
              <div key={i} className="reveal fade-up">
                <div
                  className="font-display"
                  style={{
                    fontSize: '64px',
                    fontWeight: 700,
                    color: '#d9d9d9',
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    marginBottom: '16px',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  className="font-display"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    marginBottom: '8px',
                    lineHeight: 1.2,
                    color: '#111111',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: '"Satoshi", sans-serif',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#838282',
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          ANALYTICS DASHBOARD
          ======================================== */}
      <section id="analytics" style={{ padding: '0 24px 120px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div ref={analyticsHeaderRef} className="reveal fade-up text-center" style={{ marginBottom: '64px' }}>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: '#111111',
                marginBottom: '16px',
              }}
            >
              Threat Intelligence
            </h2>
            <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '16px', color: '#838282', fontWeight: 400 }}>
              Real-time analytics from our AI-powered detection engine.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="animate-spin rounded-full h-12 w-12"
                style={{ border: '3px solid #d9d9d9', borderTopColor: '#111111' }}
              ></div>
            </div>
          ) : !stats || stats.total_scans === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20"
              style={{ border: '1px solid rgba(30,30,30,0.1)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>analytics</span>
              <h3 className="font-display" style={{ fontSize: '24px', fontWeight: 600, color: '#111111', marginBottom: '8px' }}>
                No Data Yet
              </h3>
              <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '15px', color: '#838282', marginBottom: '24px' }}>
                Run scans to populate threat intelligence.
              </p>
              <Link
                to="/scan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '40px',
                  padding: '0 24px',
                  backgroundColor: '#111111',
                  color: '#f2f2f2',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontFamily: '"Satoshi", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Run First Scan
              </Link>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div ref={statsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '1px', backgroundColor: 'rgba(30,30,30,0.08)', marginBottom: '48px' }}>
                {[
                  { icon: 'radar', label: 'Total Scans', value: stats.total_scans },
                  { icon: 'warning', label: 'Threats', value: stats.threats_detected },
                  { icon: 'verified_user', label: 'Safe Scans', value: stats.safe_scans },
                  { icon: 'speed', label: 'Avg Risk', value: `${stats.avg_risk}%` },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="reveal fade-up bg-white group"
                    style={{
                      padding: '32px',
                      transition: 'background 300ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#b6b5b5' }}>{card.icon}</span>
                      <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b6b5b5' }}>
                        {card.label}
                      </span>
                    </div>
                    <p className="font-display" style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.05em', color: '#111111', lineHeight: 1 }}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div ref={chartsGridRef} className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '24px', marginBottom: '48px' }}>
                <div className="reveal scale-in bg-white p-8" style={{ border: '1px solid rgba(30,30,30,0.08)' }}>
                  <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '24px', color: '#111111' }}>
                    Risk Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={stats.risk_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stats.risk_distribution.map((entry, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '12px', color: '#838282', fontWeight: 500 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="reveal scale-in bg-white p-8" style={{ border: '1px solid rgba(30,30,30,0.08)' }}>
                  <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '24px', color: '#111111' }}>
                    Scans by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.scans_by_type} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,30,0.06)" />
                      <XAxis dataKey="name" tick={{ fill: '#b6b5b5', fontSize: 12, fontFamily: '"Satoshi", sans-serif' }} />
                      <YAxis tick={{ fill: '#b6b5b5', fontSize: 12, fontFamily: '"Satoshi", sans-serif' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {stats.scans_by_type.map((entry, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Trend */}
              {stats.risk_trend && stats.risk_trend.length > 1 && (
                <div ref={trendRef} className="reveal fade-up slow bg-white p-8" style={{ border: '1px solid rgba(30,30,30,0.08)', marginBottom: '48px' }}>
                  <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '24px', color: '#111111' }}>
                    Risk Score Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={stats.risk_trend}>
                      <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,30,0.06)" />
                      <XAxis dataKey="time" tick={{ fill: '#b6b5b5', fontSize: 10, fontFamily: '"Satoshi", sans-serif' }} tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                      <YAxis tick={{ fill: '#b6b5b5', fontSize: 12, fontFamily: '"Satoshi", sans-serif' }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="#111111" strokeWidth={2} fill="url(#riskGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Threats */}
              {stats.top_threats && stats.top_threats.length > 0 && (
                <div ref={threatsRef} className="reveal fade-up bg-white p-8" style={{ border: '1px solid rgba(30,30,30,0.08)', marginBottom: '48px' }}>
                  <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '24px', color: '#111111' }}>
                    Top Threat Categories
                  </h3>
                  <div className="space-y-5">
                    {stats.top_threats.map((threat, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '13px', fontWeight: 600, color: '#111111', width: '160px' }} className="truncate">
                          {threat.name}
                        </span>
                        <div className="flex-1" style={{ backgroundColor: 'rgba(30,30,30,0.05)', height: '4px' }}>
                          <div
                            style={{
                              height: '4px',
                              backgroundColor: '#111111',
                              width: `${(threat.value / Math.max(...stats.top_threats.map(t => t.value))) * 100}%`,
                              transition: 'width 700ms cubic-bezier(0.77, 0, 0.175, 1)',
                            }}
                          ></div>
                        </div>
                        <span className="font-display" style={{ fontSize: '16px', fontWeight: 600, color: '#111111', width: '32px', textAlign: 'right' }}>
                          {threat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ========================================
          RECENT SCANS TABLE
          ======================================== */}
      <section style={{ padding: '0 24px 120px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div ref={recentHeaderRef} className="reveal fade-up text-center" style={{ marginBottom: '48px' }}>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: '#111111',
                marginBottom: '16px',
              }}
            >
              Recent Scans
            </h2>
            <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '16px', color: '#838282', fontWeight: 400 }}>
              Live feed of the latest threats detected by our AI engine.
            </p>
            {scanHistory.length > 0 && (
              <a
                href={`${API_BASE}/api/export/csv`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 transition-all"
                style={{
                  height: '36px',
                  padding: '0 20px',
                  border: '1px solid #1e1e1e',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontFamily: '"Satoshi", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#1e1e1e',
                  transitionDuration: '300ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e1e1e';
                  e.currentTarget.style.color = '#f2f2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1e1e1e';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
                Export CSV
              </a>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12" style={{ border: '3px solid #d9d9d9', borderTopColor: '#111111' }}></div>
            </div>
          ) : scanHistory.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20"
              style={{ border: '1px solid rgba(30,30,30,0.1)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}>inbox</span>
              <h3 className="font-display" style={{ fontSize: '24px', fontWeight: 600, color: '#111111', marginBottom: '8px' }}>
                No Scans Yet
              </h3>
              <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '15px', color: '#838282', marginBottom: '24px' }}>
                Start scanning content to see results.
              </p>
              <Link
                to="/scan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '40px',
                  padding: '0 24px',
                  backgroundColor: '#111111',
                  color: '#f2f2f2',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontFamily: '"Satoshi", sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Run First Scan
              </Link>
            </div>
          ) : (
            <div style={{ border: '1px solid rgba(30,30,30,0.08)', overflow: 'hidden' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid rgba(30,30,30,0.08)' }}>
                    {['Type', 'Scan ID', 'Risk Score', 'Risk Level', 'Threats', 'Time', 'Action'].map((col) => (
                      <th
                        key={col}
                        className="text-left px-6 py-4"
                        style={{
                          fontFamily: '"Satoshi", sans-serif',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: '#b6b5b5',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.map((scan) => (
                    <tr
                      key={scan.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(30,30,30,0.05)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#838282' }}>{getTypeIcon(scan.type)}</span>
                          <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize', color: '#111111' }}>{scan.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono" style={{ fontSize: '12px', color: '#b6b5b5' }}>
                          #{scan.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div style={{ width: '64px', height: '3px', backgroundColor: 'rgba(30,30,30,0.06)' }}>
                            <div style={{ height: '3px', backgroundColor: '#111111', width: `${Math.min(scan.risk_score, 100)}%` }}></div>
                          </div>
                          <span className="font-display" style={{ fontSize: '14px', fontWeight: 600, color: '#111111' }}>
                            {scan.risk_score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-bold ${getRiskBadge(scan.risk_level)}`}
                          style={{ fontFamily: '"Satoshi", sans-serif', letterSpacing: '0.05em' }}
                        >
                          {scan.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {scan.threat_categories.slice(0, 2).map((cat, i) => (
                            <span
                              key={i}
                              style={{
                                fontFamily: '"Satoshi", sans-serif',
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '2px 8px',
                                backgroundColor: 'rgba(30,30,30,0.04)',
                                color: '#838282',
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                          {scan.threat_categories.length > 2 && (
                            <span style={{ fontSize: '11px', color: '#b6b5b5' }}>+{scan.threat_categories.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4" style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '13px', color: '#b6b5b5' }}>
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to="/analysis"
                            state={{ scanResult: scan }}
                            style={{
                              fontFamily: '"Satoshi", sans-serif',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: '#111111',
                              transitionDuration: '120ms',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#838282'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#111111'; }}
                          >
                            View →
                          </Link>
                          <a
                            href={`${API_BASE}/api/export/pdf/${scan.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors"
                            style={{ color: '#d9d9d9' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#111111'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#d9d9d9'; }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>picture_as_pdf</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================
          FOOTER — Deep Dark Theme
          ======================================== */}
      <footer
        style={{
          backgroundColor: '#1e1e1e',
          color: 'rgba(246, 246, 246, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '80px 24px 40px 24px',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: '48px', marginBottom: '64px' }}>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f6f6f6' }}>security</span>
                <span className="font-display" style={{ fontSize: '16px', fontWeight: 600, color: '#f6f6f6', letterSpacing: '-0.02em' }}>
                  ScamDetect AI
                </span>
              </div>
              <p style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '14px', lineHeight: 1.7, color: 'rgba(246, 246, 246, 0.4)' }}>
                Next-generation AI defense against digital fraud and manipulation.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(246, 246, 246, 0.3)', marginBottom: '20px' }}>
                Navigation
              </h4>
              <div className="flex flex-col gap-3">
                {['Dashboard', 'Scanner', 'Analysis', 'Explainable AI'].map((link) => (
                  <a key={link} href="#" style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '14px', color: 'rgba(246, 246, 246, 0.5)', transition: 'color 120ms' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(246, 246, 246, 0.9)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(246, 246, 246, 0.5)'; }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(246, 246, 246, 0.3)', marginBottom: '20px' }}>
                Company
              </h4>
              <div className="flex flex-col gap-3">
                {['About', 'Privacy', 'Terms', 'Blog'].map((link) => (
                  <a key={link} href="#" style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '14px', color: 'rgba(246, 246, 246, 0.5)', transition: 'color 120ms' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(246, 246, 246, 0.9)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(246, 246, 246, 0.5)'; }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(246, 246, 246, 0.3)', marginBottom: '20px' }}>
                Contact
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'rgba(246, 246, 246, 0.3)' }}>mail</span>
                  <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '14px', color: 'rgba(246, 246, 246, 0.5)' }}>hello@scamdetect.ai</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'rgba(246, 246, 246, 0.3)' }}>language</span>
                  <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '14px', color: 'rgba(246, 246, 246, 0.5)' }}>scamdetect.ai</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'rgba(246, 246, 246, 0.3)' }}>location_on</span>
                  <span style={{ fontFamily: '"Satoshi", sans-serif', fontSize: '14px', color: 'rgba(246, 246, 246, 0.5)' }}>India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '24px',
              textAlign: 'center',
              fontFamily: '"Satoshi", sans-serif',
              fontSize: '12px',
              color: 'rgba(246, 246, 246, 0.25)',
            }}
          >
            © {new Date().getFullYear()} ScamDetect AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
