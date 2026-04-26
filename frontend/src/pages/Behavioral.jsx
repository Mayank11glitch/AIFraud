import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

const Behavioral = () => {
  const [latestScan, setLatestScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/history?limit=10`);
        if (res.ok) {
          const data = await res.json();
          // Find the most recent scan that actually has a behavioral profile over 0
          const interestingScan = data.find(s => s.behavioral_profile &&
            (s.behavioral_profile.Urgency > 0 || Object.values(s.behavioral_profile).reduce((a, b) => a + b, 0) > 0));

          if (interestingScan) {
            setLatestScan(interestingScan);
          } else if (data.length > 0) {
            setLatestScan(data[0]); // fallback to very latest
          }
        }
      } catch (err) {
        console.error("Failed to fetch history for behavioral analysis", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Default behavioral profile if none exists
  const profile = latestScan?.behavioral_profile || {
    Urgency: 0, Fear: 0, Authority: 0, Reward: 0
  };

  // Calculate Radar Polygon Points
  // Center is (50, 50), Max Radius is 40 (so it fits in 0-100 viewBox with padding)
  // Angles: Urgency (Top, 270deg=-90), Fear (Right, 0deg), Authority (Bottom, 90deg), Reward (Left, 180deg)
  const calculatePoint = (score, angleDeg) => {
    const radius = (score / 100) * 40;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return `${x},${y}`;
  };

  const pUrgency = calculatePoint(profile.Urgency, -90);
  const pFear = calculatePoint(profile.Fear, 0);
  const pAuthority = calculatePoint(profile.Authority, 90);
  const pReward = calculatePoint(profile.Reward, 180);

  // Fallback point if all are 0
  const pointString = Object.values(profile).reduce((a, b) => a + b, 0) > 0
    ? `${pUrgency} ${pFear} ${pAuthority} ${pReward}`
    : `50,50 50,50 50,50 50,50`;

  // Determine primary and secondary drivers
  const sortedTraits = Object.entries(profile).sort((a, b) => b[1] - a[1]);
  const topTrait = sortedTraits[0][0];
  const topScore = sortedTraits[0][1];

  if (loading) {
    return (
      <main className="flex flex-col gap-8 flex-1 py-16 px-6 lg:px-12 max-w-6xl mx-auto w-full">
        <div className="animate-pulse bg-[#e5e5e5] h-10 w-64 rounded"></div>
        <div className="animate-pulse bg-[#e5e5e5] h-[400px] w-full rounded-sm"></div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-12 flex-1 py-16 px-6 lg:px-12 max-w-6xl mx-auto w-full">
      {/* Header Section */}
      <section className="flex flex-col gap-4">
        <h1 className="font-display text-[#111111] text-5xl md:text-6xl font-bold tracking-[-0.04em] leading-none">
          Behavioral Scam Analysis
        </h1>
        <p className="font-body text-[#838282] text-lg font-normal leading-relaxed max-w-2xl">
          Interactive radar chart visualizing persuasion techniques used in detected scams.
          Hover over categories for detailed insights.
        </p>
      </section>

      {/* Radar Chart Section */}
      <section className="flex flex-col p-10 bg-[#ffffff] border border-[rgba(30,30,30,0.08)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h3 className="font-body text-[#b6b5b5] text-[11px] font-bold uppercase tracking-[0.1em] mb-3">
              Persuasion Techniques Breakdown
            </h3>
            <h2 className="font-display text-[#111111] text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-none truncate">
              {latestScan?.risk_level || "Unknown"} Risk Profile
            </h2>
            <div className="flex gap-3 items-center mt-4">
              <span className="font-body px-3 py-1 bg-[#f2f2f2] text-[#838282] text-[11px] font-bold tracking-wider uppercase">
                Current Scan: {latestScan?.id ? latestScan.id.substring(0, 8) : "None"}
              </span>
              {topScore > 0 && (
                <span className="font-body px-3 py-1 border border-[#111111] text-[#111111] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>{topScore}% {topTrait}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center w-10 h-10 border border-[rgba(30,30,30,0.1)] text-[#111111] hover:bg-[#111111] hover:text-[#ffffff] transition-colors" title="Download Chart">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 border border-[rgba(30,30,30,0.1)] text-[#111111] hover:bg-[#111111] hover:text-[#ffffff] transition-colors" title="More Options">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>

        <div className="flex min-h-[400px] flex-col relative items-center justify-center">
          {/* Radar Chart */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
            {/* Background Grid Circles */}
            <div className="absolute inset-0 rounded-full border border-[rgba(30,30,30,0.06)] scale-[0.2]"></div>
            <div className="absolute inset-0 rounded-full border border-[rgba(30,30,30,0.06)] scale-[0.4]"></div>
            <div className="absolute inset-0 rounded-full border border-[rgba(30,30,30,0.06)] scale-[0.6]"></div>
            <div className="absolute inset-0 rounded-full border border-[rgba(30,30,30,0.06)] scale-[0.8]"></div>
            <div className="absolute inset-0 rounded-full border border-[rgba(30,30,30,0.15)] border-dashed scale-100"></div>

            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-[rgba(30,30,30,0.06)] rotate-0"></div>
            <div className="absolute w-full h-[1px] bg-[rgba(30,30,30,0.06)] rotate-90"></div>

            {/* Dynamic Target Data Polygon */}
            <svg className="absolute inset-0 w-full h-full text-[#111111] overflow-visible transition-all duration-1000 ease-out z-10" viewBox="0 0 100 100">
              <polygon fill="currentColor" fillOpacity="0.08" points={pointString} stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" className="transition-all duration-1000"></polygon>
              {Object.values(profile).reduce((a, b) => a + b, 0) > 0 && (
                <>
                  <circle cx={pUrgency.split(',')[0]} cy={pUrgency.split(',')[1]} fill="#ffffff" stroke="currentColor" strokeWidth="1.5" r="2.5" className="transition-all duration-1000"></circle>
                  <circle cx={pFear.split(',')[0]} cy={pFear.split(',')[1]} fill="#ffffff" stroke="currentColor" strokeWidth="1.5" r="2.5" className="transition-all duration-1000"></circle>
                  <circle cx={pAuthority.split(',')[0]} cy={pAuthority.split(',')[1]} fill="#ffffff" stroke="currentColor" strokeWidth="1.5" r="2.5" className="transition-all duration-1000"></circle>
                  <circle cx={pReward.split(',')[0]} cy={pReward.split(',')[1]} fill="#ffffff" stroke="currentColor" strokeWidth="1.5" r="2.5" className="transition-all duration-1000"></circle>
                </>
              )}
            </svg>

            {/* Simulated Baseline Polygon */}
            <svg className="absolute inset-0 w-full h-full text-[#b6b5b5] overflow-visible z-0" viewBox="0 0 100 100">
              <polygon fill="transparent" points="50,30 70,50 50,70 30,50" stroke="currentColor" strokeDasharray="3" strokeLinejoin="round" strokeWidth="1"></polygon>
            </svg>

            {/* Labels */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center group">
              <p className="font-body text-[#111111] text-[13px] font-bold uppercase tracking-[0.1em]">Urgency</p>
              <p className="font-display text-[#838282] text-[16px] font-semibold">{Math.round(profile.Urgency)}%</p>
            </div>
            <div className="absolute top-1/2 -right-20 -translate-y-1/2 text-center group">
              <p className="font-body text-[#111111] text-[13px] font-bold uppercase tracking-[0.1em]">Fear</p>
              <p className="font-display text-[#838282] text-[16px] font-semibold">{Math.round(profile.Fear)}%</p>
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center group">
              <p className="font-body text-[#111111] text-[13px] font-bold uppercase tracking-[0.1em]">Authority</p>
              <p className="font-display text-[#838282] text-[16px] font-semibold">{Math.round(profile.Authority)}%</p>
            </div>
            <div className="absolute top-1/2 -left-20 -translate-y-1/2 text-center group">
              <p className="font-body text-[#111111] text-[13px] font-bold uppercase tracking-[0.1em]">Reward</p>
              <p className="font-display text-[#838282] text-[16px] font-semibold">{Math.round(profile.Reward)}%</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-16 pt-8 border-t border-[rgba(30,30,30,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[rgba(17,17,17,0.08)] border border-[#111111]"></div>
            <span className="font-body text-[12px] text-[#111111] font-bold uppercase tracking-[0.1em]">Current Profile</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 border border-[#b6b5b5] border-dashed"></div>
            <span className="font-body text-[12px] text-[#838282] font-bold uppercase tracking-[0.1em]">Industry Baseline</span>
          </div>
        </div>
      </section>

      {/* Detail Cards Section */}
      <section className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[#111111] text-3xl font-semibold tracking-[-0.03em] leading-tight">
            Persuasion Categories Detailed
          </h2>
          <p className="font-body text-[#838282] text-base font-normal leading-relaxed max-w-2xl">
            Understanding the specific psychological triggers used in potential scams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Urgency */}
          <div className="service-card group flex flex-col p-8 bg-[#f2f2f2]">
            <div className="flex justify-between items-start mb-8">
              <div className="icon-container bg-[#ffffff]">
                <span className="material-symbols-outlined text-[24px] text-[#111111]">timer</span>
              </div>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-[#ffffff] border border-[rgba(30,30,30,0.1)] text-[#111111]">
                {Math.round(profile.Urgency)}% Match
              </span>
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-display text-[#111111] text-2xl font-semibold mb-3 tracking-[-0.02em]">Urgency</h3>
              <p className="font-body text-[#838282] text-[15px] font-normal leading-relaxed mb-6 flex-1">
                Attempts to force immediate action without thinking. Often uses phrases like "Act now," "Limited time offer," or countdown timers.
              </p>
              <div className="bg-[#ffffff] p-4 border border-[rgba(30,30,30,0.08)] relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#111111]"></div>
                <p className="font-editorial text-[14px] text-[#838282] italic leading-relaxed">
                  "Your account will be suspended in 24 hours unless you verify..."
                </p>
              </div>
            </div>
          </div>

          {/* Card: Fear */}
          <div className="service-card group flex flex-col p-8 bg-[#f2f2f2]">
            <div className="flex justify-between items-start mb-8">
              <div className="icon-container bg-[#ffffff]">
                <span className="material-symbols-outlined text-[24px] text-[#111111]">warning</span>
              </div>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-[#ffffff] border border-[rgba(30,30,30,0.1)] text-[#111111]">
                {Math.round(profile.Fear)}% Match
              </span>
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-display text-[#111111] text-2xl font-semibold mb-3 tracking-[-0.02em]">Fear</h3>
              <p className="font-body text-[#838282] text-[15px] font-normal leading-relaxed mb-6 flex-1">
                Threats of negative consequences, legal action, or financial loss. Designed to bypass rational thought through panic.
              </p>
              <div className="bg-[#ffffff] p-4 border border-[rgba(30,30,30,0.08)] relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#111111]"></div>
                <p className="font-editorial text-[14px] text-[#838282] italic leading-relaxed">
                  "We have detected illegal activity on your IP. Pay fine or face arrest."
                </p>
              </div>
            </div>
          </div>

          {/* Card: Authority */}
          <div className="service-card group flex flex-col p-8 bg-[#f2f2f2]">
            <div className="flex justify-between items-start mb-8">
              <div className="icon-container bg-[#ffffff]">
                <span className="material-symbols-outlined text-[24px] text-[#111111]">admin_panel_settings</span>
              </div>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-[#ffffff] border border-[rgba(30,30,30,0.1)] text-[#111111]">
                {Math.round(profile.Authority)}% Match
              </span>
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-display text-[#111111] text-2xl font-semibold mb-3 tracking-[-0.02em]">Authority</h3>
              <p className="font-body text-[#838282] text-[15px] font-normal leading-relaxed mb-6 flex-1">
                Impersonation of trusted figures, government agencies, or known organizations to demand compliance.
              </p>
              <div className="bg-[#ffffff] p-4 border border-[rgba(30,30,30,0.08)] relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#111111]"></div>
                <p className="font-editorial text-[14px] text-[#838282] italic leading-relaxed">
                  "This is the IRS. You owe back taxes. Please provide SSN."
                </p>
              </div>
            </div>
          </div>

          {/* Card: Reward */}
          <div className="service-card group flex flex-col p-8 bg-[#f2f2f2]">
            <div className="flex justify-between items-start mb-8">
              <div className="icon-container bg-[#ffffff]">
                <span className="material-symbols-outlined text-[24px] text-[#111111]">redeem</span>
              </div>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-[#ffffff] border border-[rgba(30,30,30,0.1)] text-[#111111]">
                {Math.round(profile.Reward)}% Match
              </span>
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-display text-[#111111] text-2xl font-semibold mb-3 tracking-[-0.02em]">Reward</h3>
              <p className="font-body text-[#838282] text-[15px] font-normal leading-relaxed mb-6 flex-1">
                Promises of unrealistic financial gains, prizes, or exclusive deals to exploit greed or hope.
              </p>
              <div className="bg-[#ffffff] p-4 border border-[rgba(30,30,30,0.08)] relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#111111]"></div>
                <p className="font-editorial text-[14px] text-[#838282] italic leading-relaxed">
                  "Congratulations! You've been selected to receive a free gift card."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex justify-center border-t border-[rgba(30,30,30,0.08)] pt-12 pb-8">
        <div className="flex gap-4 flex-wrap justify-center w-full max-w-md">
          <button
            className="flex items-center justify-center font-body text-[12px] font-bold uppercase tracking-[0.1em] h-[48px] px-8 bg-[#111111] text-[#f2f2f2] w-full sm:w-auto transition-colors hover:bg-[rgba(17,17,17,0.85)]"
          >
            Generate Report
          </button>
          <button
            className="flex items-center justify-center font-body text-[12px] font-bold uppercase tracking-[0.1em] h-[48px] px-8 bg-transparent border border-[#111111] text-[#111111] w-full sm:w-auto transition-colors hover:bg-[#111111] hover:text-[#f2f2f2]"
          >
            Export Data
          </button>
        </div>
      </section>
    </main>
  );
};

export default Behavioral;
