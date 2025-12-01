import React, { useState } from 'react';
import { Lock, Unlock, ArrowRight, X } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../constants';

interface WelcomeScreenProps {
  onStart: () => void;
  onAdminLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onAdminLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      onAdminLogin();
      onStart();
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 p-6 max-w-2xl w-full flex flex-col items-center text-center animate-fade-in">
        
        {/* Main Title */}
        <div className="mb-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-indigo-200">
            Escala Diaconia
          </h2>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mt-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            IPGII
          </h1>
        </div>

        {/* Bible Verse */}
        <div className="mb-12 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-lg md:text-xl font-medium italic leading-relaxed text-indigo-100/90 mb-3">
            “Portanto, meus amados irmãos, sede firmes, inabaláveis e sempre abundantes na obra do Senhor, sabendo que, no Senhor, o vosso trabalho não é vão.”
          </p>
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-widest">
            1 Coríntios 15:58
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-full shadow-lg shadow-indigo-900/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <span>Começar Agora</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Subtle Admin Login */}
        <button
          onClick={() => setShowLogin(true)}
          className="mt-16 text-xs text-indigo-400/50 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <Lock className="w-3 h-3" /> Login Administrativo
        </button>
      </div>

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-indigo-600" /> Acesso Admin
              </h3>
              <button onClick={() => setShowLogin(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@diaconia.com"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;