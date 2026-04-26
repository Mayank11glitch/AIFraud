import React, { useEffect } from 'react';
import { useStaggerReveal, useScrollReveal } from '../hooks/useScrollReveal';

const Architecture = () => {
    const titleRef = useScrollReveal({ animation: 'fade-up', once: true });
    const introRef = useScrollReveal({ animation: 'fade-up', delay: 100, once: true });
    const pipelineRef = useStaggerReveal({ baseDelay: 200, staggerDelay: 150, once: true });
    const gpuRef = useScrollReveal({ animation: 'fade-up', delay: 400, once: true });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const models = [
        {
            name: "mDeBERTa-v3",
            role: "Multilingual NLP Core",
            color: "bg-[#111111]",
            description: "A zero-shot classification transformer. Unlike English-only models, mDeBERTa understands over 100 languages natively (including Hindi, Bengali, Tamil, and Hinglish). Analyzes text for psychological manipulation."
        },
        {
            name: "OpenAI CLIP",
            role: "Visual Threat Detection",
            color: "bg-[#444444]",
            description: "Contrastive Language-Image Pretraining. CLIP visually classifies image content to identify fake UPI screenshots, fraudulent QR codes, and suspicious brand impersonation UIs."
        },
        {
            name: "OpenAI Whisper",
            role: "Audio Transcription",
            color: "bg-[#838282]",
            description: "A robust speech recognition system used to transcribe spoken audio from uploaded videos into text for downstream NLP pipeline processing."
        },
        {
            name: "EasyOCR",
            role: "Multilingual Extract",
            color: "bg-[#b6b5b5]",
            description: "Extracts embedded text from images (English/Hindi). If a scammer hides malicious text inside an image to bypass filters, EasyOCR forces it into the NLP layer."
        }
    ];

    return (
        <div className="bg-[#f2f2f2] text-[#111111] min-h-screen py-16 px-4 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col gap-16">
                
                {/* Header Section */}
                <div className="flex flex-col items-center text-center gap-6 border-b-[3px] border-[#111111] pb-16 relative">
                    <h1 ref={titleRef} className="font-display text-5xl md:text-7xl font-bold tracking-[-0.04em] leading-none uppercase">
                        Architecture
                    </h1>
                    <p ref={introRef} className="font-body text-[#444444] max-w-2xl text-lg relative z-10 px-4">
                        ScamDetect AI utilizes a multi-modal, zero-shot inference pipeline powered by unified transformer stacks.
                    </p>
                    
                    {/* GPU Tag */}
                    <div ref={gpuRef} className="mt-4 border border-[rgba(30,30,30,0.2)] bg-white px-6 py-2 flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#111111]"></div>
                        <span className="font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-[#111111]">Hardware Acceleration: Active</span>
                    </div>
                </div>

                {/* Flowchart Diagram (CSS based) */}
                <div className="w-full">
                    <div className="flex items-center gap-3 border-b border-[rgba(30,30,30,0.1)] pb-4 mb-8">
                        <span className="material-symbols-outlined text-[#111111]">route</span>
                        <h2 className="font-display text-[#111111] text-2xl font-bold tracking-[-0.02em] uppercase">Inference Pipeline</h2>
                    </div>

                    <div className="bg-white border border-[rgba(30,30,30,0.1)] p-8 md:p-12 overflow-x-auto relative">
                        {/* Blueprint decorative grid */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23111111' stroke-width='1' fill='none'/%3E%3C/svg%3E\")"
                        }}></div>

                        <div className="min-w-[800px] flex flex-col items-center relative z-10 gap-8">
                            
                            {/* Inputs Row */}
                            <div className="flex justify-center w-full gap-8">
                                {['Text input', 'URL input', 'Image input', 'Video input'].map((input, i) => (
                                    <div key={i} className="flex-1 max-w-[160px] py-3 bg-[#f2f2f2] border border-[#111111] text-center font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                                        {input}
                                    </div>
                                ))}
                            </div>

                            {/* Arrows */}
                            <div className="flex justify-center w-full gap-8 text-[#111111]">
                                {['↓', '↓', '↓', '↓'].map((arrow, i) => (
                                    <div key={i} className="flex-1 max-w-[160px] flex justify-center font-bold">{arrow}</div>
                                ))}
                            </div>

                            {/* Extractors Row */}
                            <div className="flex justify-center w-full gap-4">
                                <div className="flex-[0.8] max-w-[120px] bg-transparent border-2 border-dashed border-[#838282] flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#838282] h-16">Direct</div>
                                <div className="flex-1 max-w-[140px] bg-[#111111] text-[#f2f2f2] border border-[#111111] flex flex-col items-center justify-center h-16 transition-transform hover:-translate-y-1">
                                    <span className="font-display font-bold text-sm tracking-tight">BS4 Scraper</span>
                                </div>
                                <div className="flex-1 max-w-[140px] bg-[#111111] text-[#f2f2f2] border border-[#111111] flex flex-col items-center justify-center h-16 transition-transform hover:-translate-y-1">
                                    <span className="font-display font-bold text-sm tracking-tight">EasyOCR</span>
                                    <span className="font-mono text-[8px] text-[#b6b5b5] tracking-widest mt-1">Extract</span>
                                </div>
                                <div className="flex-1 max-w-[140px] bg-[#111111] text-[#f2f2f2] border border-[#111111] flex flex-col items-center justify-center h-16 transition-transform hover:-translate-y-1">
                                    <span className="font-display font-bold text-sm tracking-tight">OpenCV</span>
                                    <span className="font-mono text-[8px] text-[#b6b5b5] tracking-widest mt-1">Frames</span>
                                </div>
                                <div className="flex-1 max-w-[140px] bg-[#111111] text-[#f2f2f2] border border-[#111111] flex flex-col items-center justify-center h-16 transition-transform hover:-translate-y-1">
                                    <span className="font-display font-bold text-sm tracking-tight">Whisper</span>
                                    <span className="font-mono text-[8px] text-[#b6b5b5] tracking-widest mt-1">Audio</span>
                                </div>
                            </div>

                            {/* Complex Routing line */}
                            <div className="h-10 w-full relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[2px] bg-[#111111]"></div>
                                {[15, 32, 49, 66, 83].map((pos, i) => (
                                    <div key={i} className={`absolute top-1/2 left-[${pos}%] h-6 w-[2px] bg-[#111111] transform -translate-x-1/2 -translate-y-1/2`}></div>
                                ))}
                            </div>

                            {/* Models Row */}
                            <div className="flex justify-center w-full gap-12 mt-4 relative">
                                <div className="w-[300px] bg-[#f9f9f9] border border-[#111111] p-6 text-center relative group">
                                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#111111]"></div>
                                    <h3 className="font-display text-xl font-bold tracking-tight text-[#111111] uppercase mb-1">mDeBERTa-v3</h3>
                                    <p className="font-mono text-[9px] text-[#111111] font-bold uppercase tracking-[0.2em] mb-4">Zero-Shot NLP</p>
                                    <p className="font-body text-xs text-[#838282]">Structural processing of all text strings, HTML, OCR text, and transcripts.</p>
                                </div>

                                <div className="w-[300px] bg-[#f9f9f9] border border-[#111111] p-6 text-center relative group">
                                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#444444]"></div>
                                    <h3 className="font-display text-xl font-bold tracking-tight text-[#111111] uppercase mb-1">OpenAI CLIP</h3>
                                    <p className="font-mono text-[9px] text-[#111111] font-bold uppercase tracking-[0.2em] mb-4">Zero-Shot Vision</p>
                                    <p className="font-body text-xs text-[#838282]">Semantic embedding of raw images and extracted video keyframes.</p>
                                </div>
                            </div>

                            <div className="text-[#111111] font-bold">↓</div>

                            {/* Final Output */}
                            <div className="bg-[#111111] border border-[#111111] px-16 py-6 text-center text-[#f2f2f2]">
                                <h3 className="font-display text-2xl font-bold uppercase tracking-[-0.02em]">Combined Threat Score</h3>
                                <p className="font-mono text-[10px] text-[#838282] font-bold tracking-[0.1em] mt-2">+ EXPLAINABLE ATTRIBUTION LOG</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Model Detail Cards & XAI side by side on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Models Grid */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[rgba(30,30,30,0.1)] pb-4 mb-2">
                            <span className="material-symbols-outlined text-[#111111]">memory</span>
                            <h2 className="font-display text-[#111111] text-2xl font-bold tracking-[-0.02em] uppercase">Core Models</h2>
                        </div>
                        <div ref={pipelineRef} className="grid grid-cols-1 gap-4">
                            {models.map((model, idx) => (
                                <div key={idx} className="bg-white p-6 border border-[rgba(30,30,30,0.1)] flex flex-col gap-3 group hover:border-[#111111] transition-colors reveal">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-display text-xl font-bold text-[#111111] uppercase tracking-tight">{model.name}</h3>
                                        <div className={`w-3 h-3 ${model.color}`}></div>
                                    </div>
                                    <p className="font-mono text-[10px] font-bold text-[#838282] uppercase tracking-[0.2em] border-b border-[rgba(30,30,30,0.05)] pb-3">
                                        {model.role}
                                    </p>
                                    <p className="font-body text-[#444444] text-sm leading-relaxed mt-2">
                                        {model.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* XAI Engine */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-[rgba(30,30,30,0.1)] pb-4 mb-2">
                            <span className="material-symbols-outlined text-[#111111]">psychology</span>
                            <h2 className="font-display text-[#111111] text-2xl font-bold tracking-[-0.02em] uppercase">Transparency Engine</h2>
                        </div>
                        <div className="bg-[#111111] p-8 border border-[#111111] flex flex-col gap-6 h-full text-[#f2f2f2]">
                            <p className="font-body text-[#b6b5b5] text-sm leading-relaxed">
                                Unlike black-box neural networks that simply output "Scam" or "Safe", our mechanism provides precise attribution. It utilizes dynamic lexical highlighting against local datasets to quote specific manipulative structures.
                            </p>
                            
                            <div className="flex-1 bg-white border border-[#444444] p-6 text-[#111111]">
                                <div className="font-mono text-[10px] text-[#838282] uppercase tracking-widest mb-4 font-bold border-b border-[rgba(30,30,30,0.1)] pb-2">Log Output Example</div>
                                <div className="font-display font-bold text-lg leading-tight tracking-tight mb-2 uppercase">
                                    Urgency Manipulation / <span className="text-[#838282]">90% Weight</span>
                                </div>
                                <div className="font-body text-sm text-[#444444] leading-relaxed pl-4 border-l-2 border-[#111111]">
                                    Detected synthetic urgency utilizing vocabulary markers such as <span className="bg-[#f2f2f2] border border-[#111111] font-bold px-1.5 py-0.5 mx-1 uppercase tracking-wider text-[10px]">suspended</span> and <span className="bg-[#f2f2f2] border border-[#111111] font-bold px-1.5 py-0.5 mx-1 uppercase tracking-wider text-[10px]">immediately</span>. Structural match with standard phishing coercion templates.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Architecture;
