
import React, { useState } from 'react';
import { GenerationConfig, SupportedLang } from '../../types';
import { KimiService } from '../../services/mockBackend';
import { getTranslation } from '../../utils/i18n';

interface WizardProps {
  onComplete: (text: string) => void;
  config: GenerationConfig;
  uiLang?: SupportedLang;
  onClose?: () => void;
}

enum Step {
  BRIEF,
  TITLE,
  OUTLINE,
  GENERATE
}

type WizardMode = 'STEP' | 'DIRECT';

export const Wizard: React.FC<WizardProps> = ({ onComplete, config, uiLang = 'en', onClose }) => {
  const [mode, setMode] = useState<WizardMode>('STEP');
  const [currentStep, setCurrentStep] = useState<Step>(Step.BRIEF);
  
  // Step Mode State
  const [brief, setBrief] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [outline, setOutline] = useState<string[]>([]);
  
  // Direct Mode State
  const [directPrompt, setDirectPrompt] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  
  const t = (key: any) => getTranslation(uiLang, key);

  // Mock Data generation
  const generateTitles = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(Step.TITLE);
    }, 800);
  };

  const generateOutline = () => {
    setIsGenerating(true);
    setOutline(['Introduction: The Rise of AI', 'Body 1: Productivity Benefits', 'Body 2: Ethical Concerns', 'Conclusion: Future Outlook']);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(Step.OUTLINE);
    }, 800);
  };

  const generateEssay = async (isDirect: boolean = false) => {
    if(!isDirect) setCurrentStep(Step.GENERATE);
    setIsGenerating(true);
    let finalText = "";
    
    // Construct prompt based on mode
    const systemPrompt = isDirect 
      ? `INSTRUCTION: ${directPrompt}\n\nCONTEXT: Write a full essay in ${config.language}. Target words: ${config.words}. Undetectable: ${config.undetectable}.`
      : `Write an essay about ${selectedTitle} based on outline: ${outline.join(', ')}. Config: ${JSON.stringify(config)}`;

    try {
      await KimiService.streamResponse(
        systemPrompt,
        (chunk) => {
          finalText = chunk; 
        },
        () => {
          setIsGenerating(false);
          onComplete(finalText);
        }
      );
    } catch (e) {
      alert("Generation failed or Quota exceeded.");
      setIsGenerating(false);
    }
  };

  const ProgressBar = () => (
    <div className="flex justify-between mb-10 relative px-4">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded"></div>
      {[Step.BRIEF, Step.TITLE, Step.OUTLINE, Step.GENERATE].map((step, idx) => (
        <div key={step} className={`flex flex-col items-center gap-2 bg-white px-3 transition-all duration-300`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm border-2 ${
            currentStep >= step 
              ? 'bg-indigo-600 text-white border-indigo-600' 
              : 'bg-white text-gray-400 border-gray-200'
          }`}>
            {idx + 1}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step ? 'text-indigo-600' : 'text-gray-400'}`}>
            {['Topic', 'Title', 'Outline', 'Draft'][idx]}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto relative animate-fade-in">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-gray-800 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          title="Close Tool"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Mode Switcher */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setMode('STEP')}
            className={`flex-1 py-5 text-sm font-bold uppercase tracking-wide transition-all relative ${
              mode === 'STEP' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-list-ol mr-2"></i>
            {t('mode_step')}
            {mode === 'STEP' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600"></div>}
          </button>
          <button 
            onClick={() => setMode('DIRECT')}
            className={`flex-1 py-5 text-sm font-bold uppercase tracking-wide transition-all relative ${
              mode === 'DIRECT' ? 'text-purple-600 bg-purple-50/50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-robot mr-2"></i>
            {t('mode_direct')}
            {mode === 'DIRECT' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600"></div>}
          </button>
        </div>

        <div className="p-10 min-h-[500px] flex flex-col">
          
          {/* === STEP BY STEP MODE === */}
          {mode === 'STEP' && (
            <div className="flex-1 flex flex-col">
              <ProgressBar />
              {currentStep === Step.BRIEF && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                     <h2 className="text-2xl font-bold text-gray-900">What is your essay about?</h2>
                     <p className="text-gray-500 mt-2">Describe your topic, requirements, or paste your assignment prompt.</p>
                  </div>
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    className="w-full h-40 p-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-lg text-gray-700 placeholder-gray-300 shadow-sm transition-all"
                    placeholder="e.g. Discuss the ethical implications of Artificial Intelligence in modern healthcare systems..."
                  />
                  <div className="flex justify-end">
                     <span className="text-xs text-gray-400">{brief.length} chars</span>
                  </div>
                  <button
                    onClick={generateTitles}
                    disabled={!brief || isGenerating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                  >
                    {isGenerating ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Analyzing...</> : 'Generate Titles'}
                  </button>
                </div>
              )}

              {currentStep === Step.TITLE && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Choose a Compelling Title</h2>
                  <div className="space-y-3">
                    {[
                      "The Impact of AI on Modern Education",
                      "Artificial Intelligence: A New Era of Learning",
                      "Education 2.0: Integrating Machine Learning",
                      "Challenges and Opportunities of AI in Schools"
                    ].map((title) => (
                      <div
                        key={title}
                        onClick={() => setSelectedTitle(title)}
                        className={`p-5 border rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                          selectedTitle === title 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md ring-1 ring-indigo-600' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium text-lg">{title}</span>
                        {selectedTitle === title && <i className="fas fa-check-circle text-indigo-600 text-xl"></i>}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={generateOutline}
                    disabled={!selectedTitle || isGenerating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 mt-4 disabled:opacity-50"
                  >
                    {isGenerating ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Structuring...</> : 'Generate Outline'}
                  </button>
                </div>
              )}

              {currentStep === Step.OUTLINE && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Review & Edit Outline</h2>
                  <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    {outline.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        <input 
                          value={item} 
                          onChange={(e) => {
                            const newOutline = [...outline];
                            newOutline[idx] = e.target.value;
                            setOutline(newOutline);
                          }}
                          className="bg-transparent w-full outline-none text-gray-700 font-medium"
                        />
                        <button className="text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                      </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-medium">
                        + Add Section
                    </button>
                  </div>
                  <button
                    onClick={() => generateEssay(false)}
                    disabled={isGenerating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    Generate Full Essay
                  </button>
                </div>
              )}

              {currentStep === Step.GENERATE && (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                          <i className="fas fa-pen-nib text-2xl animate-pulse"></i>
                      </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Writing your essay...</h3>
                  <p className="text-gray-500 max-w-sm">
                      Using <strong>Kimi-2 Turbo</strong> (256k context) to generate a unique, plagiarism-free essay based on your outline.
                  </p>
                  {config.undetectable && (
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-bold animate-bounce">
                      <i className="fas fa-shield-alt"></i> Undetectable Mode Active
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === DIRECT MODE === */}
          {mode === 'DIRECT' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 shadow-inner">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                     <i className="fas fa-magic text-xl"></i>
                   </div>
                   <div>
                     <h3 className="font-bold text-purple-900 text-lg">Custom LLM Instruction</h3>
                     <p className="text-sm text-purple-700 opacity-80">Paste your assignment brief, rubric, or specific commands below.</p>
                   </div>
                 </div>
                 <textarea 
                    value={directPrompt}
                    onChange={(e) => setDirectPrompt(e.target.value)}
                    className="w-full h-80 p-5 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 outline-none bg-white/80 font-mono text-sm leading-relaxed text-gray-800 placeholder-purple-300 transition-all"
                    placeholder={t('direct_placeholder')}
                 />
                 <div className="flex justify-between mt-2">
                    <button onClick={() => setDirectPrompt('')} className="text-xs font-bold text-purple-400 hover:text-purple-700 uppercase">Clear</button>
                    <span className="text-xs text-purple-400">{directPrompt.length} chars</span>
                 </div>
               </div>
               
               {isGenerating ? (
                  <div className="flex items-center justify-center gap-3 py-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                    {t('processing')}
                  </div>
               ) : (
                  <button
                    onClick={() => generateEssay(true)}
                    disabled={!directPrompt}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                  >
                    <i className="fas fa-bolt mr-2"></i>
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