import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import DecoyGenerator from '../components/DecoyGenerator';
import DeepfakeVisualizer from '../components/DeepfakeVisualizer';
import { API_BASE } from '../config/api';

const Analysis = () => {
  const location = useLocation();
  const scanResult = location.state?.scanResult;
  const originalInput = location.state?.originalInput;
  const [previewUnlocked, setPreviewUnlocked] = useState(false);

  if (!scanResult) {
    return (
      <main className="flex-1 px-4 md:px-10 lg:px-40 py-24 flex justify-center w-full bg-[#f2f2f2] text-[#111111]">
        <div className="flex flex-col items-center justify-center gap-6 border border-[rgba(30,30,30,0.1)] bg-white p-16 max-w-[600px] w-full">
          <span className="material-symbols-outlined text-[64px] text-[#b6b5b5]">search_off</span>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#111111]">No Analysis Data</h2>
          <p className="font-body text-[#838282] max-w-[400px] text-center">Please run a scan through the detection engine first to generate a threat intelligence report.</p>
          <Link to="/scan" className="mt-4 px-8 py-3 bg-[#111111] text-[#f2f2f2] font-body text-[11px] font-bold uppercase tracking-[0.15em] border border-[#111111] hover:bg-transparent hover:text-[#111111] transition-colors">Start Scan Engine</Link>
        </div>
      </main>
    );
  }

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-[#111111] font-black'; // Brutalist uses bold black instead of red
      case 'high': return 'text-[#444444]';
      case 'medium': return 'text-[#838282]';
      case 'low': return 'text-[#b6b5b5]';
      default: return 'text-[#111111]';
    }
  };

  const getRiskBg = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-[#111111] text-[#f2f2f2]';
      case 'high': return 'bg-[#444444] text-[#f2f2f2]';
      case 'medium': return 'bg-[#838282] text-[#f2f2f2]';
      case 'low': return 'bg-[#e0e0e0] text-[#111111]';
      default: return 'bg-[#111111] text-[#f2f2f2]';
    }
  };

  const riskColorClass = getRiskColor(scanResult.risk_level);
  const riskBgClass = getRiskBg(scanResult.risk_level);

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-16 flex justify-center w-full bg-[#f2f2f2] text-[#111111]">
      <div className="flex flex-col max-w-[1000px] w-full gap-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white p-8 border border-[rgba(30,30,30,0.1)] relative">
          {/* Decorative bracket */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#111111]"></div>
          
          <div className="flex flex-col gap-2 pl-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-none text-[#111111]">
              Analysis Report
            </h1>
            <p className="font-mono text-[#838282] text-xs font-bold tracking-widest uppercase mt-2">
              ID: {scanResult.id.substring(0, 8)} / TYPE: {scanResult.type}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pl-4 sm:pl-0">
            <Link to="/explainable" state={{ scanResult }} className="flex min-w-[140px] items-center justify-center gap-2 h-10 px-5 bg-transparent text-[#111111] text-[11px] font-bold uppercase tracking-[0.1em] border border-[#111111] hover:bg-[#111111] hover:text-[#f2f2f2] transition-colors">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>XAI Explanations</span>
            </Link>
            <a href={`${API_BASE}/api/export/pdf/${scanResult.id}`} target="_blank" rel="noopener noreferrer" className="flex min-w-[140px] items-center justify-center gap-2 h-10 px-5 bg-[#111111] text-[#f2f2f2] text-[11px] font-bold uppercase tracking-[0.1em] border border-[#111111] hover:bg-transparent hover:text-[#111111] transition-colors">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Record</span>
            </a>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Risk Assessment Card */}
          <div className="flex flex-col gap-6 p-8 bg-white border border-[rgba(30,30,30,0.1)] col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 border-b border-[rgba(30,30,30,0.1)] pb-4">
              <span className="material-symbols-outlined text-[#111111]">warning</span>
              <h3 className="font-display text-[#111111] text-xl font-bold tracking-widest uppercase">Threat Assessment</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-10 items-center justify-center py-4">
              {/* Brutalist Risk Circle */}
              <div className="relative w-48 h-48 flex items-center justify-center border-4 border-[#111111] rounded-full p-2">
                <div className="w-full h-full rounded-full border border-[rgba(30,30,30,0.2)] flex items-center justify-center relative">
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-display text-5xl font-bold tracking-[-0.04em] text-[#111111] leading-none">{scanResult.risk_score}</span>
                    <span className="font-mono text-[10px] font-bold text-[#838282] uppercase tracking-[0.2em] mt-2">Score</span>
                  </div>
                </div>
              </div>
              
              {/* Stats lines */}
              <div className="flex flex-col w-full gap-1">
                <div className="flex items-center justify-between p-4 bg-[#f9f9f9] border border-[rgba(30,30,30,0.05)]">
                  <span className="font-body text-[12px] font-bold uppercase tracking-[0.1em] text-[#838282]">Threat Level</span>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${riskBgClass}`}>
                    {scanResult.risk_level}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#f9f9f9] border border-[rgba(30,30,30,0.05)]">
                  <span className="font-body text-[12px] font-bold uppercase tracking-[0.1em] text-[#838282]">Timestamp</span>
                  <span className="font-mono text-[#111111] text-xs font-bold">{new Date(scanResult.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#f9f9f9] border border-[rgba(30,30,30,0.05)]">
                  <span className="font-body text-[12px] font-bold uppercase tracking-[0.1em] text-[#838282]">Target Mode</span>
                  <span className="font-mono text-[#111111] text-xs font-bold uppercase">{scanResult.type}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Secondary Stats */}
          <div className="flex flex-col gap-6 p-8 bg-white border border-[rgba(30,30,30,0.1)]">
            <div className="flex items-center gap-3 border-b border-[rgba(30,30,30,0.1)] pb-4">
              <span className="material-symbols-outlined text-[#111111]">category</span>
              <h3 className="font-display text-[#111111] text-xl font-bold tracking-widest uppercase">Signatures</h3>
            </div>
            
            <div className="flex flex-col gap-4 mt-2">
              {scanResult.threat_categories.map((category, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#111111]">label</span>
                    <span className="font-mono text-[#111111] text-[11px] font-bold tracking-wider">{category}</span>
                  </div>
                  {/* Brutalist Progress Bar */}
                  <div className="w-full h-2 bg-[#f2f2f2] border border-[rgba(30,30,30,0.1)]">
                    <div className="h-full bg-[#111111]" style={{ width: `${80 - (idx * 15)}%` }}></div>
                  </div>
                </div>
              ))}
              {scanResult.threat_categories.length === 0 && (
                <div className="p-4 bg-[#f9f9f9] border border-[rgba(30,30,30,0.1)] text-center">
                  <p className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#838282]">No Known Signatures</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Injection Segment */}
        {scanResult.type === 'url' && originalInput && (
          <div className="flex flex-col border border-[rgba(30,30,30,0.1)] bg-white mt-4 p-8">
            <div className="flex items-center justify-between border-b border-[rgba(30,30,30,0.1)] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#111111]">public</span>
                <h3 className="font-display text-[#111111] text-xl font-bold tracking-widest uppercase">Safe Visual Preview</h3>
              </div>
              {!previewUnlocked && (
                <button 
                  onClick={() => setPreviewUnlocked(true)}
                  className="px-4 py-2 bg-[#111111] text-[#f2f2f2] font-body text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-transparent hover:text-[#111111] border border-[#111111] transition-colors"
                >
                  Unlock Sandbox
                </button>
              )}
            </div>
            
            {previewUnlocked ? (
              <div className="w-full h-[500px] border-4 border-red-500 relative bg-[#f9f9f9]">
                <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest p-1 text-center select-none shadow-md z-10">
                  ⚠️ ISOLATED SANDBOX - SCRIPTS DISABLED - DO NOT ENTER REAL CREDENTIALS ⚠️
                </div>
                <iframe 
                  src={originalInput} 
                  sandbox="" 
                  className="w-full h-full pt-6 border-none"
                  title="Safe Preview Sandbox"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#f9f9f9] border border-dashed border-[rgba(30,30,30,0.2)]">
                <span className="material-symbols-outlined text-4xl text-[#838282] mb-4">lock</span>
                <p className="font-mono text-[#444444] text-xs uppercase tracking-widest leading-relaxed max-w-[600px]">
                  Visual preview is locked for your safety.<br/><br/>
                  Unlocking the sandbox will load the website in an isolated, script-disabled iframe. Malicious scripts, tracking cookies, and redirects cannot execute.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Deepfake Spectrogram if applicable */}
        {(scanResult.type === 'video' || scanResult.threat_categories.includes('Deepfake') || scanResult.threat_categories.includes('Audio Manipulation')) && (
          <DeepfakeVisualizer />
        )}

        {/* Decoy Generator */}
        <DecoyGenerator />

      </div>
    </main>
  );
};

export default Analysis;
