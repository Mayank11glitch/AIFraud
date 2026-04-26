import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Explainable = () => {
  const location = useLocation();
  const scanResult = location.state?.scanResult;

  if (!scanResult) {
    return (
      <main className="flex-1 px-4 md:px-10 lg:px-40 py-24 flex justify-center bg-[#f2f2f2] text-[#111111]">
        <div className="flex flex-col items-center justify-center gap-6 border border-[rgba(30,30,30,0.1)] bg-white p-16 max-w-[600px] w-full relative">
          {/* Brutalist top thick border */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#111111]"></div>
          
          <span className="material-symbols-outlined text-[64px] text-[#b6b5b5]">psychology_alt</span>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#111111] text-center">No AI Explanations</h2>
          <p className="font-body text-[#838282] max-w-[400px] text-center mb-4">Please submit content to the detection engine first to view the Explainable AI rationale.</p>
          <Link to="/scan" className="px-8 py-3 bg-[#111111] text-[#f2f2f2] font-body text-[11px] font-bold uppercase tracking-[0.15em] border border-[#111111] hover:bg-transparent hover:text-[#111111] transition-colors">Start Engine</Link>
        </div>
      </main>
    );
  }

  // Monochrome colors for brutalist theme
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-[#f2f2f2] bg-[#111111]';
      case 'high': return 'text-[#f2f2f2] bg-[#444444]';
      case 'medium': return 'text-[#f2f2f2] bg-[#838282]';
      case 'low': return 'text-[#111111] bg-[#e0e0e0]';
      default: return 'text-[#f2f2f2] bg-[#111111]';
    }
  };

  const riskClass = getRiskColor(scanResult.risk_level);

  return (
    <main className="flex-1 py-16 px-4 md:px-10 lg:px-40 flex justify-center bg-[#f2f2f2] text-[#111111]">
      <div className="flex flex-col max-w-[1000px] w-full gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b-[3px] border-[#111111]">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.04em] leading-none text-[#111111]">
              Explainable AI Log
            </h1>
            <p className="font-mono text-[#838282] text-xs font-bold tracking-widest uppercase mt-2">
              Trace ID: {scanResult.id.substring(0, 8).toUpperCase()} / Transparency Engine
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/analysis" state={{ scanResult }} className="flex min-w-[120px] items-center justify-center gap-2 h-10 px-5 bg-transparent text-[#111111] text-[11px] font-bold uppercase tracking-[0.1em] border border-[#111111] hover:bg-[#111111] hover:text-[#f2f2f2] transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Analysis</span>
            </Link>
            <button className="flex min-w-[140px] items-center justify-center gap-2 h-10 px-5 bg-[#111111] text-[#f2f2f2] text-[11px] font-bold uppercase tracking-[0.1em] border border-[#111111] hover:bg-transparent hover:text-[#111111] transition-colors">
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Log</span>
            </button>
          </div>
        </div>

        {/* Top Overview Block */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 bg-white border border-[rgba(30,30,30,0.1)] p-0 lg:p-0">
          <div className="flex flex-col justify-center gap-4 p-8 flex-1 lg:border-r border-[rgba(30,30,30,0.1)]">
            <div className="flex items-center gap-4">
              <div className={`font-mono text-[11px] font-bold tracking-widest uppercase px-3 py-1 ${riskClass}`}>
                Level: {scanResult.risk_level}
              </div>
              <div className="font-mono text-[10px] uppercase text-[#838282] font-bold tracking-widest">
                Engine Confidence: >98%
              </div>
            </div>
            <h3 className="font-display text-2xl font-bold leading-tight tracking-[-0.03em] text-[#111111] mt-2">
              The detection model assigned a <span className="underline decoration-2">{scanResult.risk_score}% threat score</span> based on {scanResult.threat_categories.length} distinct signatures.
            </h3>
            <p className="font-body text-sm text-[#444444] max-w-[500px]">
              Our NLP and visual pipelines isolate specific manipulative tactics. Below is the structural breakdown of the flagged artifacts.
            </p>
          </div>

          {(scanResult.raw_text_extracted || scanResult.type === 'text') && (
            <div className="flex-1 p-8 bg-[#f9f9f9]">
              <h3 className="font-mono text-[10px] font-bold text-[#838282] mb-4 uppercase tracking-[0.2em] border-b border-[rgba(30,30,30,0.1)] pb-2">
                Raw Input Extracted
              </h3>
              <div className="font-body text-sm leading-relaxed text-[#111111] break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
                <span className="text-[#838282] mr-2">"</span>
                {scanResult.raw_text_extracted}
                <span className="text-[#838282] ml-2">"</span>
              </div>
            </div>
          )}
        </div>

        {/* Explainability Breakdown */}
        <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.03em] mt-8 mb-2 flex items-center justify-between border-b border-[rgba(30,30,30,0.1)] pb-4">
          <span>Structural Indicators</span>
          <span className="material-symbols-outlined text-[#b6b5b5]">account_tree</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scanResult.explanations && scanResult.explanations.length > 0 ? (
            scanResult.explanations.map((explanation, index) => (
              <div key={index} className="flex flex-col gap-4 bg-white border border-[rgba(30,30,30,0.1)] p-6 relative group hover:border-[#111111] transition-colors">
                {/* Structural Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#e0e0e0] group-hover:bg-[#111111] transition-colors"></div>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#111111]">emergency</span>
                    <h3 className="font-display text-lg font-bold tracking-tight text-[#111111] leading-none">{explanation.feature}</h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-wider px-2 py-1 bg-[#f2f2f2] border border-[rgba(30,30,30,0.1)] text-[#111111]">
                    +{explanation.risk_contribution.toFixed(1)}%
                  </span>
                </div>
                
                <p className="font-body text-[#444444] text-[13px] leading-relaxed">
                  {explanation.description}
                </p>
                
                <div className="mt-auto pt-4">
                  <div className="w-full bg-[#f2f2f2] h-[2px]">
                    <div className="bg-[#111111] h-[2px]" style={{ width: `${Math.min(explanation.risk_contribution, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-16 bg-[#f9f9f9] border border-[rgba(30,30,30,0.1)] text-center">
              <span className="material-symbols-outlined text-[48px] text-[#b6b5b5] mb-4">gpp_good</span>
              <h3 className="font-display text-2xl font-bold tracking-tight text-[#111111]">No Malicious Artifacts</h3>
              <p className="font-mono text-[11px] tracking-widest text-[#838282] max-w-sm mt-2 uppercase">Analysis verified clean source material.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Explainable;
