
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { AIService } from '../../services/mockBackend';
import { downloadDoc, downloadPDF } from '../../utils/download';

interface ChatProps {
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am ScholarChat. I cite real papers in my answers. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    // Placeholder message
    setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      let accumulatedText = "";
      await AIService.streamResponse(
        input,
        (chunk) => {
          accumulatedText = chunk;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: accumulatedText } : m));
        },
        () => {
          setIsTyping(false);
          setMessages(prev => prev.map(m => m.id === botMsgId ? { 
            ...m, 
            isStreaming: false,
            citations: ['10.1038/s41586-023-00000', '10.1145/3411764.3445520', '10.1016/j.ai.2024.01.001']
          } : m));
        }
      );
    } catch (e) {
      alert("Quota exceeded or error.");
      setIsTyping(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
    downloadDoc(text, 'ScholarChat_Transcript');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative animate-fade-in">
      {/* Header with Exports */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm z-10">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
               <i className="fas fa-graduation-cap"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">ScholarChat</h3>
              <div className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </div>
            </div>
         </div>
         <div className="flex gap-2 items-center">
            <button 
              onClick={exportChat} 
              className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors shadow-sm"
            >
              <i className="fas fa-file-word mr-1"></i> DOC
            </button>
            <button 
              onClick={() => downloadPDF()} 
              className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors shadow-sm"
            >
              <i className="fas fa-file-pdf mr-1"></i> PDF
            </button>
            {onClose && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </>
            )}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
            {msg.role === 'assistant' && (
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-3 mt-1 shrink-0 border border-indigo-200">AI</div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm relative ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <div className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</div>
              {msg.citations && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-[10px] font-bold uppercase opacity-50 mb-2 tracking-wider">Academic Sources (DOI)</div>
                  <div className="space-y-1">
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-xs flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer bg-gray-50 p-1.5 rounded text-indigo-600">
                        <i className="fas fa-external-link-alt text-[10px]"></i> {cite}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Message Copy Button */}
              {msg.role === 'assistant' && !msg.isStreaming && (
                <button 
                  onClick={() => copyMessage(msg.content, msg.id)}
                  className={`absolute -bottom-6 left-0 text-xs px-2 py-1 rounded hover:bg-gray-200 transition-all flex items-center gap-1 ${copiedId === msg.id ? 'text-green-600' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                >
                  <i className={`fas ${copiedId === msg.id ? 'fa-check' : 'fa-copy'}`}></i>
                  {copiedId === msg.id ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs ml-3 mt-1 shrink-0"><i className="fas fa-user"></i></div>
            )}
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start ml-11">
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
           </div>
        )}
        <div ref={bottomRef}></div>
      </div>
      
      <div className="p-5 border-t border-gray-200 bg-white">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a research question..."
            className="flex-1 px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 transform active:scale-95 flex items-center justify-center w-16"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-gray-400">AI can make mistakes. Verify citations.</span>
        </div>
      </div>
    </div>
  );
};
