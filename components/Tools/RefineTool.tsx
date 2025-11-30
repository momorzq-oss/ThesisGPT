
import React, { useState, useEffect } from 'react';
import { ToolType, GenerationConfig } from '../../types';
import { AIService } from '../../services/mockBackend';
import { downloadDoc, downloadPDF } from '../../utils/download';

interface RefineToolProps {
  type: ToolType;
  config: GenerationConfig;
  onResult: (text: string) => void;
  onClose?: () => void;
}

export const RefineTool: React.FC<RefineToolProps> = ({ type, config, onResult, onClose }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clear state when tool changes
  useEffect(() => {
    setInput('');
    setOutput('');
    setIsProcessing(false);
    setCopied(false);
  }, [type]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToolMeta = () => {
    switch(type) {
      case ToolType.REWRITER: 
        return { 
          title: 'Essay Rewriter', 
          desc: 'Paraphrase text to improve clarity, flow, and vocabulary while keeping the original meaning.',
          action: 'Rewrite Text', 
          icon: 'fa-sync-alt', 
          promptPrefix: 'Rewrite the following text to be more academic and coherent:' 
        };
      case ToolType.EXTENDER: 
        return { 
          title: 'Essay Extender', 
          desc: 'Expand short paragraphs into detailed sections with more examples and explanations.',
          action: 'Extend Text', 
          icon: 'fa-expand-alt', 
          promptPrefix: 'Expand upon the following text with more details, evidence, and examples:' 
        };
      case ToolType.CHECKER: 
        return { 
          title: 'Essay Checker', 
          desc: 'Analyze text for structure, clarity, grammar, and flow.',
          action: 'Check Essay', 
          icon: 'fa-check-double', 
          promptPrefix: 'Analyze the following text for structure, clarity, and grammar. Provide specific improvements:' 
        };
      case ToolType.SHORTENER: 
        return { 
          title: 'Essay Shortener', 
          desc: 'Condense wordy text into concise summaries without losing key information.',
          action: 'Shorten Text', 
          icon: 'fa-compress-alt', 
          promptPrefix: 'Summarize and shorten the following text while retaining key points:' 
        };
      default: 
        return { title: 'Tool', desc: '', action: 'Process', icon: 'fa-tools', promptPrefix: 'Process:' };
    }
  };

  const meta = getToolMeta();

  const handleProcess = async () => {
    if (!input) return;
    setIsProcessing(true);
    setOutput(''); 
    
    try {
      let currentText = '';
      await AIService.streamResponse(
        `${meta.promptPrefix} "${input}"\n\nConfiguration: ${JSON.stringify(config)}`,
        (chunk) => {
          currentText = chunk;
          setOutput(chunk);
        },
        () => {
          setIsProcessing(false);
        }
      );
    } catch (e) {
      alert("Error processing request. Please check your quota.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative animate-fade-in">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-gray-800 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          title="Close Tool"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 no-print">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
            <i className={`fas ${meta.icon} text-2xl`}></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{meta.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{meta.desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
           {/* Input Column */}
           <div className="flex flex-col h-full bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
              <div className="flex justify-between items-center mb-3 px-1">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Original Text</label>
                 {input && (
                   <button onClick={() => setInput('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                     Clear
                   </button>
                 )}
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 w-full bg-transparent resize-none outline-none text-base leading-relaxed text-gray-700 placeholder-gray-400"
                placeholder="Paste your text here to begin..."
                spellCheck={false}
              ></textarea>
              <div className="mt-2 text-right">
                <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                  {input.length} chars
                </span>
              </div>
           </div>

           {/* Output Column */}
           <div className={`flex flex-col h-full rounded-2xl p-4 border relative transition-all ${output ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex justify-between items-center mb-3 px-1">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    AI Result
                    {output && !isProcessing && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                 </label>
                 {output && (
                   <button 
                    onClick={handleCopy}
                    className={`text-xs flex items-center gap-1 font-medium transition-colors ${copied ? 'text-green-600' : 'text-gray-400 hover:text-indigo-600'}`}
                   >
                     <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                     {copied ? 'Copied!' : 'Copy'}
                   </button>
                 )}
              </div>
              
              <div className="flex-1 overflow-y-auto relative">
                 {output ? (
                   <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">{output}</div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                     {isProcessing ? (
                       <>
                         <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                         <div className="animate-pulse">Refining your text...</div>
                       </>
                     ) : (
                       <div className="flex flex-col items-center opacity-50">
                         <i className="fas fa-arrow-left text-2xl mb-2 md:hidden"></i>
                         <i className="fas fa-arrow-left text-2xl mb-2 hidden md:block transform rotate-180 md:rotate-0"></i>
                         <span>Result will appear here</span>
                       </div>
                     )}
                   </div>
                 )}
              </div>
              
              {output && (
                 <div className="mt-2 text-right">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                    {output.length} chars
                    </span>
                 </div>
              )}
           </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
           <button 
             onClick={handleProcess}
             disabled={isProcessing || !input}
             className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 transform active:scale-95"
           >
             {isProcessing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className={`fas ${meta.icon}`}></i>}
             {isProcessing ? 'Processing...' : meta.action}
           </button>
           
           {output && !isProcessing && (
             <div className="flex gap-2 border-l border-gray-200 pl-3 ml-2">
               <button 
                  onClick={() => downloadDoc(output, meta.title)}
                  className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Download DOC"
               >
                 <i className="fas fa-file-word"></i>
               </button>
               <button 
                  onClick={() => downloadPDF()}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Download PDF"
               >
                 <i className="fas fa-file-pdf"></i>
               </button>
               <button 
                 onClick={() => onResult(output)}
                 className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all flex items-center gap-2"
               >
                 Open in Editor <i className="fas fa-external-link-alt text-xs"></i>
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
