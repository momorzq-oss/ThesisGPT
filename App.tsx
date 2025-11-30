
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { AuthModal } from './components/Auth/AuthModal';
import { Wizard } from './components/Wizard/Wizard';
import { CapstoneWizard } from './components/Wizard/CapstoneWizard';
import { ChatInterface } from './components/Chat/ChatInterface';
import { Editor } from './components/Editor/Editor';
import { RefineTool } from './components/Tools/RefineTool';
import { AdminView } from './components/Admin/AdminView';
import { AuthService } from './services/mockBackend';
import { ToolType, User, Plan, GenerationConfig, UserRole, SupportedLang } from './types';
import { getTranslation } from './utils/i18n';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  
  // UI Language State
  const [uiLang, setUiLang] = useState<SupportedLang>('en');

  // Generation Config
  const [config, setConfig] = useState<GenerationConfig>({
    words: 1000,
    language: 'English (US)',
    type: 'Argumentative',
    undetectable: false
  });

  const t = (key: any) => getTranslation(uiLang, key);

  useEffect(() => {
    const stored = AuthService.getCurrentUser();
    if (stored) setUser(stored);
  }, []);

  const handleGenerationComplete = (text: string) => {
    setEditorContent(text);
    setActiveTool(ToolType.EDITOR);
  };

  const handleCloseTool = () => {
    setActiveTool(ToolType.HOME);
  };

  const GlobalToolbar = () => (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0 sticky top-0 z-20 shadow-sm">
      <div className="font-medium text-gray-700 flex items-center gap-3">
        <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">{t('current_tool')}</span>
        <div className="h-4 w-px bg-gray-300"></div>
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          {activeTool === ToolType.HOME ? 'Dashboard' : activeTool.replace('_', ' ')}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        
        {/* Content Settings */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <i className="fas fa-globe text-gray-400 text-xs"></i>
          <select 
            className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer font-medium"
            value={config.language}
            onChange={(e) => setConfig({...config, language: e.target.value})}
          >
            <option>English (US)</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Arabic</option>
            <option>German</option>
            <option>Chinese</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <i className="fas fa-ruler text-gray-400 text-xs"></i>
          <select 
            className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer font-medium"
             value={config.words}
             onChange={(e) => setConfig({...config, words: Number(e.target.value)})}
          >
            <option value="500">~500 {t('words')}</option>
            <option value="1000">~1000 {t('words')}</option>
            <option value="2500">~2500 {t('words')}</option>
          </select>
        </div>

        <button 
          onClick={() => setConfig(p => ({...p, undetectable: !p.undetectable}))}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
            config.undetectable 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
          title="Bypass AI Detectors"
        >
          <i className={`fas ${config.undetectable ? 'fa-shield-check' : 'fa-shield-alt'}`}></i>
          {t('undetectable')}
        </button>

        {user && (
          <div className="ml-4 flex flex-col items-end pl-4 border-l border-gray-200">
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('quota')}</div>
             <div className={`text-xs font-bold ${user.gensUsed > (user.plan === Plan.FREE ? 8 : 450) ? 'text-orange-500' : 'text-gray-700'}`}>
                {user.gensUsed} / {user.plan === Plan.FREE ? 10 : user.plan === Plan.STARTER ? 500 : 2000}
             </div>
          </div>
        )}
      </div>
    </div>
  );

  const isRefineTool = [
    ToolType.REWRITER, 
    ToolType.EXTENDER, 
    ToolType.CHECKER, 
    ToolType.SHORTENER
  ].includes(activeTool);

  // Handle RTL for Arabic
  useEffect(() => {
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  }, [uiLang]);

  // If Admin View
  if (activeTool === ToolType.ADMIN_PANEL) {
    return <AdminView onBack={() => setActiveTool(ToolType.HOME)} uiLang={uiLang} />;
  }

  const renderContent = () => {
    if (activeTool === ToolType.HOME) {
      return (
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-10 text-white mb-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{t('welcome')}, {user ? user.name : 'Guest'}</h1>
                <p className="text-indigo-100 text-lg max-w-xl font-medium leading-relaxed">
                Your advanced academic writing suite is ready. Select a tool to start generating thesis content, essays, or research papers with Kimi-2 AI.
                </p>
                {!user && (
                <button onClick={() => setIsAuthOpen(true)} className="mt-8 bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg">
                    {t('signin')}
                </button>
                )}
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2 flex items-center gap-2">
            <i className="fas fa-sparkles text-yellow-500"></i> {t('nav_create')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            <div onClick={() => setActiveTool(ToolType.WIZARD)} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <i className="fas fa-magic"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-2 group-hover:text-indigo-600 transition-colors">{t('tool_wizard')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Generate comprehensive essays step-by-step or via direct instructions. Supports undetectable mode and auto-citations.</p>
            </div>
            <div onClick={() => setActiveTool(ToolType.CAPSTONE_GEN)} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <i className="fas fa-project-diagram"></i>
              </div>
              <h3 className="font-bold text-gray-800 text-xl mb-2 group-hover:text-purple-600 transition-colors">{t('tool_capstone')}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Manage complex projects, generate milestones, literature reviews, and methodologies for thesis work.</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTool === ToolType.WIZARD) {
      return <Wizard onComplete={handleGenerationComplete} config={config} uiLang={uiLang} onClose={handleCloseTool} />;
    }

    if (activeTool === ToolType.CAPSTONE_GEN) {
      return <CapstoneWizard onComplete={handleGenerationComplete} config={config} uiLang={uiLang} onClose={handleCloseTool} />;
    }

    if (activeTool === ToolType.EDITOR) {
      return <Editor content={editorContent} onChange={setEditorContent} onClose={handleCloseTool} />;
    }

    if (activeTool === ToolType.SCHOLAR_CHAT) {
      return <ChatInterface onClose={handleCloseTool} />;
    }

    if (isRefineTool) {
      return <RefineTool type={activeTool} config={config} onResult={handleGenerationComplete} onClose={handleCloseTool} />;
    }

    // Generic Tool Placeholder
    return (
      <div className="max-w-4xl mx-auto relative animate-fade-in">
        <button 
          onClick={handleCloseTool}
          className="absolute -top-12 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
          title="Close Tool"
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-full mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{activeTool.replace('_', ' ')}</h2>
              <p className="text-gray-500">This tool uses the specialized ThesisAI engine.</p>
            </div>
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px] col-span-full relative">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-3xl mb-6 shadow-sm">
                <i className="fas fa-tools"></i>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-xl">Ready to Generate</h3>
              <p className="text-gray-500 max-w-md mb-8">
                Enter your topic below to start generating specific academic content using the Kimi-2 model.
              </p>
              <div className="flex w-full max-w-lg gap-3">
                <input 
                    type="text" 
                    className="flex-1 border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
                    placeholder="Enter your topic..." 
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                    Go
                </button>
              </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar 
        activeTool={activeTool} 
        onNavigate={setActiveTool} 
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => { AuthService.logout(); setUser(null); }}
        uiLang={uiLang}
        onLangChange={setUiLang}
      />
      
      <div className="ml-64 rtl:ml-0 rtl:mr-64 flex-1 flex flex-col h-screen overflow-hidden">
        <GlobalToolbar />
        
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          {renderContent()}
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLogin={(u) => setUser(u)}
      />
    </div>
  );
};

export default App;
