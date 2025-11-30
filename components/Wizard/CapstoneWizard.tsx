
import React, { useState } from 'react';
import { GenerationConfig, SupportedLang } from '../../types';
import { KimiService } from '../../services/mockBackend';
import { getTranslation } from '../../utils/i18n';

interface CapstoneWizardProps {
  onComplete: (text: string) => void;
  config: GenerationConfig;
  uiLang?: SupportedLang;
  onClose?: () => void;
}

enum CapStep {
  TOPIC,
  MILESTONES,
  LITERATURE,
  METHODOLOGY,
  GENERATE
}

type Mode = 'STEP' | 'DIRECT';

export const CapstoneWizard: React.FC<CapstoneWizardProps> = ({ onComplete, config, uiLang = 'en', onClose }) => {
  const [mode, setMode] = useState<Mode>('STEP');
  
  // Step Mode State
  const [step, setStep] = useState<CapStep>(CapStep.TOPIC);
  const [topic, setTopic] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [litReview, setLitReview] = useState('');
  const [method, setMethod] = useState('');
  
  // Direct Mode State
  const [directPrompt, setDirectPrompt] = useState('');

  const [isBusy, setIsBusy] = useState(false);
  const t = (key: any) => getTranslation(uiLang, key);

  // Mock Generators
  const genMilestones = async () => {
    setIsBusy(true);
    // Simulate Kimi call
    setTimeout(() => {
      setMilestones([
        "Phase 1: Research Proposal & Approval",
        "Phase 2: Comprehensive Literature Review",
        "Phase 3: Data Collection & Field Work",
        "Phase 4: Statistical Analysis",
        "Phase 5: Final Drafting & Defense"
      ]);
      setStep(CapStep.MILESTONES);
      setIsBusy(false);
    }, 1000);
  };

  const genLitReview = async () => {
    setIsBusy(true);
    setTimeout(() => {
      setLitReview("Recent studies (Smith 2023, Al-Fayed 2024) indicate a correlation between...");
      setStep(CapStep.LITERATURE);
      setIsBusy(false);
    }, 1000);
  };
  
  const genMethod = async () => {
     setStep(CapStep.METHODOLOGY);
  };

  const genFinal = async (isDirect: boolean = false) => {
    if(!isDirect) setStep(CapStep.GENERATE);
    setIsBusy(true);
    let final = "";
    
    const prompt = isDirect 
      ? `GENERATE COMPLETE CAPSTONE/THESIS.\n\nINSTRUCTION: ${directPrompt}\n\nCONFIG: Language ${config.language}, Words ${config.words}`
      : `CAPSTONE PROJECT. Topic: ${topic}. Milestones: ${milestones.join(';')}. Lit: ${litReview}. Method: ${method}. Config: ${JSON.stringify(config)}`;

    try {
      await KimiService.streamResponse(
        prompt,
        (chunk) => final = chunk,
        () => {
          setIsBusy(false);
          onComplete(final);
        }
      );
    } catch {
       alert("Error generating capstone");
       setIsBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative animate-fade-in">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-gray-800 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          title="Close Tool"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col overflow-hidden">
        
        {/* Mode Toggle */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setMode('STEP')}
            className={`flex-1 py-5 font-bold text-sm uppercase tracking-wide transition-all ${mode === 'STEP' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            {t('mode_step')}
          </button>
          <button 
            onClick={() => setMode('DIRECT')}
            className={`flex-1 py-5 font-bold text-sm uppercase tracking-wide transition-all ${mode === 'DIRECT' ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            {t('mode_direct')}
          </button>
        </div>

        <div className="p-10 flex-1 flex flex-col">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
               {mode === 'STEP' ? 'Capstone & Milestone Manager' : 'Universal Capstone Generator'}
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
               {mode === 'STEP' ? 'Design your academic masterpiece step-by-step.' : 'Generate your entire project from a single detailed prompt or rubric.'}
            </p>
          </div>

          {mode === 'STEP' && (
            <div className="flex-1 flex flex-col animate-fade-in">
              {step === CapStep.TOPIC && (
                <div className="space-y-6">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Research Topic / Problem Statement</label>
                  <textarea 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full h-48 p-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg text-gray-800 placeholder-gray-300 resize-none shadow-sm transition-all"
                    placeholder="Describe the core problem your capstone addresses..."
                  />
                  <button onClick={genMilestones} disabled={!topic || isBusy} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none">
                    {isBusy ? 'Analyzing...' : 'Generate Project Milestones'}
                  </button>
                </div>
              )}

              {step === CapStep.MILESTONES && (
                <div className="space-y-6">
                  <h3 className="font-bold text-gray-800 text-xl">Proposed Milestones</h3>
                  <div className="space-y-3">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex gap-4 items-center p-4 bg-blue-50 rounded-xl border border-blue-100 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                          <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">{i+1}</div>
                          <input className="bg-transparent w-full outline-none text-gray-900 font-medium" value={m} onChange={(e) => {
                            const copy = [...milestones]; copy[i] = e.target.value; setMilestones(copy);
                          }} />
                      </div>
                    ))}
                  </div>
                  <button onClick={genLitReview} disabled={isBusy} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    {isBusy ? 'Researching...' : 'Generate Literature Review Sources'}
                  </button>
                </div>
              )}

              {step === CapStep.LITERATURE && (
                <div className="space-y-6">
                  <h3 className="font-bold text-gray-800 text-xl">Preliminary Literature Review</h3>
                  <textarea 
                    value={litReview}
                    onChange={e => setLitReview(e.target.value)}
                    className="w-full h-80 p-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base leading-relaxed text-gray-700"
                  />
                  <button onClick={genMethod} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    Proceed to Methodology
                  </button>
                </div>
              )}

              {step === CapStep.METHODOLOGY && (
                <div className="space-y-6">
                  <h3 className="font-bold text-gray-800 text-xl">Research Methodology</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {['Quantitative Survey', 'Qualitative Interviews', 'Mixed Methods', 'Case Study'].map(m => (
                        <button 
                          key={m}
                          onClick={() => setMethod(m)} 
                          className={`p-6 rounded-xl border transition-all font-bold text-left ${method === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                        >
                          <i className={`fas fa-${method === m ? 'check-circle' : 'circle'} mr-2`}></i>
                          {m}
                        </button>
                      ))}
                  </div>
                  <button onClick={() => genFinal(false)} disabled={!method} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold mt-4 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50">
                    Generate Capstone Draft
                  </button>
                </div>
              )}

              {step === CapStep.GENERATE && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-8">
                     <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                       <i className="fas fa-layer-group text-2xl"></i>
                     </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Compiling Capstone Project</h3>
                  <p className="text-gray-500 max-w-md">Integrating milestones, literature review, and methodology into a cohesive document using Kimi-2.</p>
                </div>
              )}
            </div>
          )}

          {/* === DIRECT MODE === */}
          {mode === 'DIRECT' && (
             <div className="space-y-6 animate-fade-in">
               <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
                  <label className="block text-sm font-bold text-purple-900 mb-3 uppercase tracking-wide">Instructions / Syllabus / Rubric</label>
                  <textarea 
                     value={directPrompt}
                     onChange={e => setDirectPrompt(e.target.value)}
                     className="w-full h-96 p-5 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-300 outline-none bg-white font-mono text-sm leading-relaxed text-gray-800 placeholder-purple-300 transition-all"
                     placeholder="Paste the entire project requirements here. The AI will parse milestones, required chapters, and specific formatting rules..."
                  />
                  <div className="flex justify-end mt-2">
                     <span className="text-xs text-purple-400 font-bold">{directPrompt.length} chars</span>
                  </div>
               </div>
               
               {isBusy ? (
                   <div className="w-full py-4 bg-gray-100 text-gray-500 text-center rounded-xl font-bold animate-pulse">
                      {t('processing')}
                   </div>
               ) : (
                   <button 
                     onClick={() => genFinal(true)}
                     disabled={!directPrompt}
                     className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
                   >
                     <i className="fas fa-magic mr-2"></i>
                     {t('generate_full')}
                   </button>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
