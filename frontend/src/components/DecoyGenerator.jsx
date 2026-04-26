import React, { useState } from 'react';

const generateFakeCC = () => {
  // Simple fake CC generator that passes basic Luhn checks (or just looks realistic)
  const prefixes = ['4532', '5123', '3782'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const mid1 = Math.floor(1000 + Math.random() * 9000);
  const mid2 = Math.floor(1000 + Math.random() * 9000);
  const end = Math.floor(1000 + Math.random() * 8000) + 120; // Ensure it looks valid
  return `${p} ${mid1} ${mid2} ${end}`;
};

const generateFakeIdentity = () => {
  const firsts = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley'];
  const lasts = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  
  const f = firsts[Math.floor(Math.random() * firsts.length)];
  const l = lasts[Math.floor(Math.random() * lasts.length)];
  const d = domains[Math.floor(Math.random() * domains.length)];
  
  const num = Math.floor(Math.random() * 999);
  
  return {
    name: `${f} ${l}`,
    email: `${f.toLowerCase()}.${l.toLowerCase()}${num}@${d}`,
    password: `${f.substring(0, 1).toUpperCase()}${l.toLowerCase()}@${num}!` + Math.random().toString(36).substring(2, 6),
    phone: `+1 (${Math.floor(200 + Math.random() * 700)}) ${Math.floor(200 + Math.random() * 700)}-${Math.floor(1000 + Math.random() * 8000)}`,
    cc: generateFakeCC(),
    cvv: Math.floor(100 + Math.random() * 899).toString()
  };
};

const DecoyGenerator = () => {
  const [decoyData, setDecoyData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleGenerate = () => {
    setDecoyData(generateFakeIdentity());
    setCopiedField(null);
  };

  const handleCopy = (label, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#111111] text-[#f2f2f2] border border-[#333333]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#333333] pb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-2xl">science</span>
          <div>
            <h3 className="font-display text-white text-xl font-bold tracking-widest uppercase">The Poison Pill</h3>
            <p className="font-body text-[#838282] text-xs uppercase tracking-widest mt-1">Scam Decoy Data Generator</p>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-body text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">autorenew</span>
          Generate Decoy
        </button>
      </div>

      {!decoyData ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#333333] text-center">
          <p className="font-mono text-[#838282] text-xs">Generate disposable synthetic credentials to safely paste into phishing sites and poison the attacker's database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: decoyData.name },
            { label: 'Email Address', value: decoyData.email },
            { label: 'Password', value: decoyData.password },
            { label: 'Phone Number', value: decoyData.phone },
            { label: 'Credit Card', value: decoyData.cc },
            { label: 'CVV Security Code', value: decoyData.cvv },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2 p-4 border border-[#333333] bg-[#1a1a1a] relative group">
              <span className="font-mono text-[10px] text-[#838282] tracking-widest uppercase">{item.label}</span>
              <span className="font-mono text-[14px] text-white tracking-widest">{item.value}</span>
              
              <button 
                onClick={() => handleCopy(item.label, item.value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-[#333333] hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedField === item.label ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecoyGenerator;
