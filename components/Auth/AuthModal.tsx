import React, { useState } from 'react';
import { AuthService } from '../../services/mockBackend';
import { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      onLogin(user);
      onClose();
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const user = await AuthService.socialLogin(provider);
    onLogin(user);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 font-bold text-sm transition-colors uppercase tracking-wide ${activeTab === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 font-bold text-sm transition-colors uppercase tracking-wide ${activeTab === 'signup' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Create Account
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-3 mb-6">
            <button 
              onClick={() => handleSocial('google')}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <i className="fab fa-google text-red-500 text-lg"></i>
              Continue with Google
            </button>
            <button 
              onClick={() => handleSocial('apple')}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white hover:bg-black font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <i className="fab fa-apple text-white text-lg"></i>
              Continue with Apple
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">Or with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleCredentials} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center transform active:scale-95"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to our <a href="#" className="underline hover:text-indigo-600">Terms of Service</a> and <a href="#" className="underline hover:text-indigo-600">Privacy Policy</a>.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
             Admin Demo: <span className="font-mono bg-gray-100 px-1 rounded">admin@demo.com</span> / <span className="font-mono bg-gray-100 px-1 rounded">demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
};