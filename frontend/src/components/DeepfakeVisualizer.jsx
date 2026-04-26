import React, { useEffect, useState } from 'react';

const DeepfakeVisualizer = () => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    // Generate static 64 bars
    const initBars = Array.from({ length: 64 }).map((_, i) => ({
      id: i,
      height: Math.random() * 40 + 10,
      isAnomaly: i > 20 && i < 28 || i > 45 && i < 50
    }));
    setBars(initBars);

    const interval = setInterval(() => {
      setBars(prev => prev.map(bar => ({
        ...bar,
        height: bar.isAnomaly 
          ? Math.random() * 80 + 20 
          : Math.random() * 40 + 10
      })));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#111111] border border-[#333333] mt-8">
      <div className="flex items-center gap-3 border-b border-[#333333] pb-4">
        <span className="material-symbols-outlined text-red-500">graphic_eq</span>
        <h3 className="font-display text-[#f2f2f2] text-xl font-bold tracking-widest uppercase">Deepfake Forensics</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        <p className="font-mono text-[#838282] text-xs uppercase tracking-widest">
          Synthetic artifact detection in frequency domain
        </p>
        
        {/* Spectrogram Container */}
        <div className="h-40 w-full flex items-end justify-between gap-[2px] bg-[#0a0a0a] p-4 border border-[#333333] overflow-hidden">
          {bars.map((bar) => (
            <div 
              key={bar.id}
              className={`w-full transition-all duration-100 ease-in-out ${bar.isAnomaly ? 'bg-red-500' : 'bg-[#444444]'}`}
              style={{ height: `${bar.height}%` }}
            ></div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase">
          <div className="flex items-center gap-2 text-[#838282]">
            <div className="w-3 h-3 bg-[#444444]"></div>
            Natural Resonance
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-3 h-3 bg-red-500"></div>
            Synthetic Generation Artifacts
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeVisualizer;
