import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollReveal, { useStaggerReveal } from '../hooks/useScrollReveal';
import { API_BASE } from '../config/api';

const redactPII = (text) => {
  if (!text) return text;
  let redacted = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  redacted = redacted.replace(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}/g, '[REDACTED_PHONE]');
  return redacted;
};

const Scanner = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if ((activeTab === 'image' || activeTab === 'video') && !selectedFile) return;
    if ((activeTab === 'url' || activeTab === 'text') && !inputValue) return;

    setIsScanning(true);

    try {
      const formData = new FormData();
      let endpoint = '';
      
      formData.append('ephemeral', isIncognito ? 'true' : 'false');

      if (activeTab === 'image') {
        formData.append('file', selectedFile);
        endpoint = '/api/scan/image';
      } else if (activeTab === 'video') {
        formData.append('file', selectedFile);
        endpoint = '/api/scan/video';
      } else if (activeTab === 'url') {
        formData.append('url', inputValue);
        endpoint = '/api/scan/url';
      } else if (activeTab === 'text') {
        const sanitizedText = redactPII(inputValue);
        formData.append('text', sanitizedText);
        endpoint = '/api/scan/text';
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/analysis', { state: { scanResult: data, originalInput: inputValue } });
      } else {
        console.error('Scan failed:', await response.text());
        alert('Scan failed. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error scanning:', error);
      alert('A network error occurred while connecting to the backend.');
    } finally {
      setIsScanning(false);
    }
  };

  const titleRef = useScrollReveal({ threshold: 0.1 });
  const scannerCardRef = useScrollReveal({ threshold: 0.1, delay: 200 });
  const featuresRef = useStaggerReveal({ staggerMs: 150 });

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-16 flex justify-center w-full bg-[#f2f2f2] text-[#111111]">
      <div className="flex flex-col max-w-[960px] w-full gap-8 relative z-10">
        
        {/* Header Section */}
        <div ref={titleRef} className="reveal blur-in flex flex-col gap-4 mb-4 text-center items-center">
          <h1 className="font-display text-[#111111] text-5xl md:text-6xl font-bold tracking-[-0.04em] leading-none">
            Content Scanner
          </h1>
          <p className="font-body text-[#838282] text-lg font-normal leading-relaxed max-w-2xl">
            Upload or paste content to check for scams using advanced AI analysis.
          </p>
        </div>

        {/* Scanner Card */}
        <div ref={scannerCardRef} className="reveal scale-blur bg-[#1a1a1a] border border-[#333333] rounded-none">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-[#333333] px-2 md:px-6">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex flex-col items-center justify-center border-b-2 ${activeTab === 'image' ? 'border-[#f2f2f2] text-[#f2f2f2]' : 'border-transparent text-[#838282] hover:text-[#f2f2f2]'} gap-2 pb-3 pt-5 px-6 min-w-[120px] transition-colors`}
            >
              <span className="material-symbols-outlined text-[20px]">image</span>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">Screenshot</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex flex-col items-center justify-center border-b-2 ${activeTab === 'video' ? 'border-[#f2f2f2] text-[#f2f2f2]' : 'border-transparent text-[#838282] hover:text-[#f2f2f2]'} gap-2 pb-3 pt-5 px-6 min-w-[120px] transition-colors`}
            >
              <span className="material-symbols-outlined text-[20px]">videocam</span>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">Video</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex flex-col items-center justify-center border-b-2 ${activeTab === 'url' ? 'border-[#f2f2f2] text-[#f2f2f2]' : 'border-transparent text-[#838282] hover:text-[#f2f2f2]'} gap-2 pb-3 pt-5 px-6 min-w-[120px] transition-colors`}
            >
              <span className="material-symbols-outlined text-[20px]">link</span>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">URL</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex flex-col items-center justify-center border-b-2 ${activeTab === 'text' ? 'border-[#f2f2f2] text-[#f2f2f2]' : 'border-transparent text-[#838282] hover:text-[#f2f2f2]'} gap-2 pb-3 pt-5 px-6 min-w-[120px] transition-colors`}
            >
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">Text Message</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="p-8 md:p-12">
            {(activeTab === 'image' || activeTab === 'video') ? (
              <label className="flex flex-col items-center justify-center gap-6 border-[1px] border-dashed border-[#444444] bg-[#151515] hover:bg-[#222222] transition-colors px-6 py-24 cursor-pointer group">
                <input type="file" className="hidden" onChange={handleFileChange} accept={activeTab === 'image' ? "image/*" : "video/*"} />
                <div className="w-16 h-16 bg-[#2a2a2a] border border-[#444444] flex items-center justify-center text-[#f2f2f2] group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>
                <div className="flex max-w-[480px] flex-col items-center gap-3">
                  <p className="font-display text-[#f2f2f2] text-2xl font-semibold tracking-[-0.02em] text-center">
                    {selectedFile ? selectedFile.name : "Drag & Drop file here"}
                  </p>
                  <p className="font-body text-[#b6b5b5] text-sm font-normal text-center">
                    {activeTab === 'image' ? "Supports JPG, PNG, GIF up to 10MB" : "Supports MP4, MOV up to 50MB"}
                  </p>
                </div>
                <div className="mt-4 px-8 py-3 bg-[#f2f2f2] border border-[#f2f2f2] text-[#111111] font-body text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-transparent hover:text-[#f2f2f2] transition-colors">
                  Browse Files
                </div>
              </label>
            ) : (
              <div className="flex flex-col gap-4">
                <label className="font-body text-[#f2f2f2] text-[11px] font-bold uppercase tracking-[0.1em]">
                  {activeTab === 'url' ? "Enter Suspicious URL" : "Paste Suspicious Text Message"}
                </label>
                {activeTab === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://example.com/login"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-5 py-4 font-body border border-[#444444] bg-[#151515] text-[#f2f2f2] focus:border-[#f2f2f2] focus:ring-0 outline-none transition-colors placeholder:text-[#555555]"
                  />
                ) : (
                  <textarea
                    rows="8"
                    placeholder="Paste the SMS or Email content here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-5 py-4 font-body border border-[#444444] bg-[#151515] text-[#f2f2f2] focus:border-[#f2f2f2] focus:ring-0 outline-none transition-colors resize-none placeholder:text-[#555555]"
                  ></textarea>
                )}
              </div>
            )}
          </div>

          {/* Action Button & Toggles */}
          <div className="px-8 py-8 border-t border-[#333333] bg-[#151515] flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsIncognito(!isIncognito)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${isIncognito ? 'bg-red-500' : 'bg-[#444444]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isIncognito ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px] text-[#f2f2f2]">{isIncognito ? 'local_fire_department' : 'history'}</span>
                 <span className="font-body text-[#f2f2f2] text-xs font-bold uppercase tracking-widest">
                   Burn Data (Incognito Mode)
                 </span>
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`flex w-full md:w-auto min-w-[240px] cursor-pointer items-center justify-center h-[56px] px-8 bg-[#f2f2f2] hover:bg-[#e0e0e0] ${isScanning ? 'opacity-70 cursor-not-allowed' : ''} text-[#111111] gap-3 font-body text-[13px] font-bold uppercase tracking-[0.1em] transition-colors`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isScanning ? 'animate-spin' : ''}`}>
                {isScanning ? 'autorenew' : 'security'}
              </span>
              <span>{isScanning ? 'Scanning...' : 'Scan Content Now'}</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights beneath scanner */}
        <div ref={featuresRef} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="reveal fade-up flex flex-col p-8 bg-[#ffffff] border border-[rgba(30,30,30,0.1)]">
            <div className="w-12 h-12 bg-[#f2f2f2] mb-6 flex items-center justify-center self-start">
              <span className="material-symbols-outlined text-[20px] text-[#111111]">speed</span>
            </div>
            <div>
              <h3 className="font-display text-[#111111] text-xl font-semibold mb-2 tracking-[-0.02em]">Fast Analysis</h3>
              <p className="font-body text-[#838282] text-[14px] leading-relaxed">Results in seconds using our advanced detection engine.</p>
            </div>
          </div>

          <div className="reveal fade-up flex flex-col p-8 bg-[#ffffff] border border-[rgba(30,30,30,0.1)]">
            <div className="w-12 h-12 bg-[#f2f2f2] mb-6 flex items-center justify-center self-start">
              <span className="material-symbols-outlined text-[20px] text-[#111111]">shield_lock</span>
            </div>
            <div>
              <h3 className="font-display text-[#111111] text-xl font-semibold mb-2 tracking-[-0.02em]">Secure &amp; Private</h3>
              <p className="font-body text-[#838282] text-[14px] leading-relaxed">Your files are encrypted and automatically deleted after scanning.</p>
            </div>
          </div>

          <div className="reveal fade-up flex flex-col p-8 bg-[#ffffff] border border-[rgba(30,30,30,0.1)]">
            <div className="w-12 h-12 bg-[#f2f2f2] mb-6 flex items-center justify-center self-start">
              <span className="material-symbols-outlined text-[20px] text-[#111111]">psychology</span>
            </div>
            <div>
              <h3 className="font-display text-[#111111] text-xl font-semibold mb-2 tracking-[-0.02em]">AI Powered</h3>
              <p className="font-body text-[#838282] text-[14px] leading-relaxed">Trained on millions of known scam patterns and phishing attempts.</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Scanner;
