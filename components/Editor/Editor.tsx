import React from 'react';
import { downloadDoc, downloadPDF } from '../../utils/download';

interface EditorProps {
  content: string;
  onChange: (text: string) => void;
  onClose?: () => void;
}

export const Editor: React.FC<EditorProps> = ({ content, onChange, onClose }) => {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-100 rounded-xl overflow-hidden relative animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 px-4 border-b border-gray-200 bg-white shadow-sm z-10 sticky top-0 overflow-x-auto">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {['Undo', 'Redo'].map(t => (
             <button key={t} className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md text-sm transition-all" title={t}><i className={`fas fa-${t === 'Undo' ? 'undo' : 'redo'}`}></i></button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {[
            { icon: 'fa-bold', label: 'Bold' },
            { icon: 'fa-italic', label: 'Italic' },
            { icon: 'fa-underline', label: 'Underline' },
            { icon: 'fa-list-ul', label: 'List' },
          ].map((t, i) => (
            <button key={i} className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md text-sm w-8 transition-all" title={t.label}><i className={`fas ${t.icon}`}></i></button>
          ))}
        </div>
        
        <div className="flex-1"></div>
        
        {/* Stats */}
        <div className="text-xs font-medium text-gray-500 mr-4 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
           {wordCount} Words
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
            <button 
              onClick={() => downloadDoc(content, 'ThesisGPT_Document')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm"
              title="Download as Word"
            >
              <i className="fas fa-file-word"></i> DOC
            </button>
            <button 
              onClick={() => downloadPDF()}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
              title="Print / Save as PDF"
            >
              <i className="fas fa-file-pdf"></i> PDF
            </button>
            {onClose && (
               <button 
                  onClick={onClose}
                  className="ml-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
                  title="Close Editor"
               >
                  <i className="fas fa-times"></i>
               </button>
            )}
        </div>
      </div>

      {/* Page Container */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center cursor-text" onClick={() => document.getElementById('main-editor')?.focus()}>
         <div className="w-full max-w-[850px] min-h-[1000px] bg-white shadow-lg border border-gray-200 py-16 px-16 mb-10 transition-shadow hover:shadow-xl">
             <textarea
                id="main-editor"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full resize-none outline-none font-serif text-lg leading-relaxed text-gray-800 placeholder-gray-300"
                placeholder="Start writing or generate content..."
                spellCheck="false"
             ></textarea>
         </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .h-\\[calc\\(100vh-8rem\\)\\] { height: auto; overflow: visible; }
          textarea { border: none; padding: 0; }
        }
      `}</style>
    </div>
  );
};