
import React from 'react';
import { ToolType, User, SupportedLang, Plan } from '../../types';
import { getTranslation } from '../../utils/i18n';

interface SidebarProps {
  activeTool: ToolType;
  onNavigate: (tool: ToolType) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  uiLang: SupportedLang;
  onLangChange: (lang: SupportedLang) => void;
  onOpenPricing?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onNavigate, user, onOpenAuth, onLogout, uiLang, onLangChange, onOpenPricing }) => {
  const t = (key: any) => getTranslation(uiLang, key);

  const NavItem = ({ tool, icon, label, badge }: { tool: ToolType, icon: string, label: string, badge?: string }) => (
    <button
      onClick={() => onNavigate(tool)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all mb-1 ${
        activeTool === tool 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span className="flex-1 text-left rtl:text-right">{label}</span>
      {badge && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold">{badge}</span>}
    </button>
  );

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0 overflow-y-auto">
      {/* Brand */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 text-white font-bold text-xl mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-feather-alt text-sm"></i>
          </div>
          ThesisGPT
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 flex flex-col">
        <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-2 mt-2 rtl:text-right">{t('nav_create')}</div>
        <NavItem tool={ToolType.WIZARD} icon="fa-magic" label={t('tool_wizard')} badge="HOT" />
        <NavItem tool={ToolType.CAPSTONE_GEN} icon="fa-project-diagram" label={t('tool_capstone')} badge="NEW" />
        <NavItem tool={ToolType.EDITOR} icon="fa-file-alt" label={t('tool_editor')} />
        <NavItem tool={ToolType.SCHOLAR_CHAT} icon="fa-graduation-cap" label={t('tool_chat')} />

        <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-2 mt-6 rtl:text-right">{t('nav_academic')}</div>
        <NavItem tool={ToolType.THESIS_GEN} icon="fa-lightbulb" label={t('tool_thesis')} />
        <NavItem tool={ToolType.RESEARCH_TITLE} icon="fa-heading" label={t('tool_titles')} />
        <NavItem tool={ToolType.OUTLINE_GEN} icon="fa-list-ul" label={t('tool_outline')} />
        <NavItem tool={ToolType.ABSTRACT_GEN} icon="fa-align-justify" label={t('tool_abstract')} />

        <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-2 mt-6 rtl:text-right">{t('nav_refine')}</div>
        <NavItem tool={ToolType.REWRITER} icon="fa-sync-alt" label={t('tool_rewriter')} />
        <NavItem tool={ToolType.CHECKER} icon="fa-check-double" label={t('tool_checker')} />
        <NavItem tool={ToolType.EXTENDER} icon="fa-expand-alt" label={t('tool_extender')} />

        {/* Language Selector (Bottom of Nav) */}
        <div className="mt-auto px-1 pt-6 mb-2">
          <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 flex items-center gap-2">
            <i className="fas fa-globe"></i> {t('lang')}
          </div>
          <div className="relative px-1">
            <select
              value={uiLang}
              onChange={(e) => onLangChange(e.target.value as SupportedLang)}
              className="w-full bg-slate-800 text-slate-300 text-xs font-medium py-2.5 px-3 rounded-lg appearance-none border border-slate-700 hover:border-slate-600 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Toggle */}
      <div className="px-3 pb-2 pt-2">
         <button 
           onClick={() => onNavigate(ToolType.ADMIN_PANEL)}
           className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white transition-all ${activeTool === ToolType.ADMIN_PANEL ? 'text-indigo-400 border-indigo-900 bg-slate-800' : 'text-slate-500'}`}
         >
           <i className="fas fa-user-shield"></i>
           {t('admin_panel')}
         </button>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        {user ? (
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-3">
              <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full bg-slate-700" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300" onClick={onLogout}>{t('signout')}</div>
              </div>
            </div>
            {user.plan !== Plan.ULTRA && (
              <button 
                onClick={onOpenPricing} 
                className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-lg uppercase tracking-wide hover:shadow-lg transition-all"
              >
                <i className="fas fa-crown mr-1"></i> Upgrade
              </button>
            )}
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            {t('signin')}
          </button>
        )}
      </div>
    </div>
  );
};
