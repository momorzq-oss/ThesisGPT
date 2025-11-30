
import React, { useState, useEffect } from 'react';
import { AdminService, AuthService } from '../../services/mockBackend';
import { User, AdminConfig, SupportedLang } from '../../types';
import { getTranslation } from '../../utils/i18n';

interface AdminViewProps {
  onBack: () => void;
  uiLang?: SupportedLang;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, uiLang = 'en' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'finance' | 'settings'>('dashboard');
  
  // Data State
  const [stats, setStats] = useState(AdminService.getStats());
  const [settings, setSettings] = useState<AdminConfig>(AdminService.getSettings());
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const t = (key: any) => getTranslation(uiLang, key);

  useEffect(() => {
    // Check if current user is already admin
    const curr = AuthService.getCurrentUser();
    if (curr?.role === 'ADMIN') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    setUsers(AdminService.getUsers());
    setPayments(AdminService.getPayments());
    setSettings(AdminService.getSettings());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await AuthService.login(username, password);
      if (user.role === 'ADMIN') {
        setIsAuthenticated(true);
        loadData();
      } else {
        alert("Not authorized as Admin");
      }
    } catch {
      alert("Invalid credentials. Try default: admin / admin");
    }
  };

  const handleSaveSettings = async () => {
    await AdminService.updateSettings(settings);
    alert("Settings Saved Successfully. New credentials will be active on next login.");
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,User,Amount,Date,Status\n"
      + payments.map(p => `${p.id},${p.user},${p.amount},${p.date},${p.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <i className="fas fa-shield-alt text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('admin_login_title')}</h2>
            <p className="text-gray-500 text-sm mt-2">{t('admin_login_desc')}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Username</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg">
              Login to Console
            </button>
          </form>
          <button onClick={onBack} className="w-full mt-6 text-sm text-gray-500 hover:text-gray-800 font-medium">
            ← Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-100 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-6 shadow-lg flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-indigo-400">
             <i className="fas fa-terminal"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">ADMIN CONSOLE</h1>
            <div className="flex gap-2 text-xs text-gray-400">
               <span className="text-green-400">● System Online</span>
               <span>v2.4.0</span>
            </div>
          </div>
        </div>
        <button onClick={onBack} className="bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors border border-gray-700">
          Exit Admin
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col pt-6">
          {[
            { id: 'dashboard', icon: 'fa-chart-pie', label: 'Overview' },
            { id: 'users', icon: 'fa-users', label: 'User Database' },
            { id: 'finance', icon: 'fa-wallet', label: 'Financials' },
            { id: 'settings', icon: 'fa-sliders-h', label: 'System Settings' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-8 py-4 text-sm font-bold border-r-4 transition-all ${
                activeTab === item.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-4 gap-6 animate-fade-in">
              {[
                { label: 'Total Revenue', val: `$${stats.totalRevenue.toLocaleString()}`, color: 'bg-emerald-100 text-emerald-700', icon: 'fa-dollar-sign' },
                { label: 'Active Users', val: stats.activeUsers.toLocaleString(), color: 'bg-blue-100 text-blue-700', icon: 'fa-user-check' },
                { label: 'Tokens Burned', val: `${(stats.tokensBurned / 1000000).toFixed(1)}M`, color: 'bg-purple-100 text-purple-700', icon: 'fa-fire' },
                { label: 'Server Cost', val: `$${stats.serverCost.toFixed(2)}`, color: 'bg-red-100 text-red-700', icon: 'fa-server' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.color}`}>
                     <i className={`fas ${s.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">{s.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{s.val}</div>
                  </div>
                </div>
              ))}
              <div className="col-span-4 bg-white p-8 rounded-2xl border border-gray-200 mt-4 shadow-sm">
                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <i className="fas fa-satellite-dish text-indigo-500"></i> Live Activity Feed
                 </h3>
                 <div className="h-64 bg-slate-900 rounded-xl p-6 font-mono text-xs text-green-400 overflow-y-auto shadow-inner">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className="mb-2 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-purple-400">REQ_ID:{Math.floor(Math.random()*10000)}</span> | user: <span className="text-yellow-200">{users[i % users.length]?.email || 'anon'}</span> | tokens: <span className="text-blue-300">{Math.floor(Math.random()*500)}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-5">User Profile</th>
                    <th className="p-5">Subscription</th>
                    <th className="p-5">Usage Stats</th>
                    <th className="p-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 flex items-center gap-4">
                        <img src={u.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-gray-400 text-xs font-mono">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-5"><span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">{u.plan}</span></td>
                      <td className="p-5">
                          <div className="flex items-center gap-2">
                             <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{width: `${Math.min((u.gensUsed / 2000) * 100, 100)}%`}}></div>
                             </div>
                             <span className="text-gray-600 font-medium">{u.gensUsed}</span>
                          </div>
                      </td>
                      <td className="p-5">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4 text-xs uppercase tracking-wide">Edit</button>
                        <button className="text-red-500 hover:text-red-700 font-medium text-xs uppercase tracking-wide">Ban</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'finance' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700">Recent Transactions</h3>
                 <button onClick={handleExportReport} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                   <i className="fas fa-download"></i>
                   {t('report_gen')}
                 </button>
               </div>
               <table className="w-full text-left">
                 <thead className="text-xs text-gray-500 uppercase bg-gray-50 font-bold tracking-wider">
                   <tr>
                     <th className="p-5">Transaction ID</th>
                     <th className="p-5">User</th>
                     <th className="p-5">Amount</th>
                     <th className="p-5">Status</th>
                     <th className="p-5">Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 text-sm">
                   {payments.map(p => (
                     <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                       <td className="p-5 font-mono text-xs text-gray-400">#{p.id}</td>
                       <td className="p-5 font-medium text-gray-700">{p.user}</td>
                       <td className="p-5 font-bold text-gray-900">${p.amount.toFixed(2)}</td>
                       <td className="p-5">
                         <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${p.status === 'Succeeded' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                           {p.status}
                         </span>
                       </td>
                       <td className="p-5 text-gray-500">{p.date}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white p-10 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">System Configuration</h3>
              <div className="space-y-8">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Stripe Secret Key</label>
                   <div className="flex gap-2">
                      <input 
                        type="password" 
                        value={settings.stripeKey}
                        onChange={e => setSettings({...settings, stripeKey: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-gray-50 focus:bg-white transition-all" 
                      />
                      <button className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200"><i className="fas fa-eye"></i></button>
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Kimi API Key</label>
                   <input 
                      type="password" 
                      value={settings.kimiKey}
                      onChange={e => setSettings({...settings, kimiKey: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-gray-50 focus:bg-white transition-all" 
                    />
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-user-lock"></i> Admin Credentials
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase">Username</label>
                        <input 
                        value={settings.adminUser}
                        onChange={e => setSettings({...settings, adminUser: e.target.value})}
                        className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase">Password</label>
                        <input 
                        value={settings.adminPass}
                        onChange={e => setSettings({...settings, adminPass: e.target.value})}
                        className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        />
                    </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                    onClick={handleSaveSettings}
                    className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                    <i className="fas fa-save"></i>
                    {t('save_config')}
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
