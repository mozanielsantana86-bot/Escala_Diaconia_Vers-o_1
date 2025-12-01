import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, ChevronLeft, ChevronRight, Edit3, Check, X } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen';
import VolunteerManager from './components/VolunteerManager';
import Scheduler from './components/Scheduler';
import Dashboard from './components/Dashboard';
import { Volunteer, ScheduleMap, AppSettings } from './types';
import { INITIAL_VOLUNTEERS, INITIAL_SETTINGS, INITIAL_SCHEDULE } from './constants';

type Screen = 'welcome' | 'app';

const App: React.FC = () => {
  // --- State Persistence Keys ---
  const KEYS = {
    THEME: 'diaconia_theme',
    SCREEN: 'diaconia_screen',
    ADMIN: 'diaconia_is_admin',
    VOLUNTEERS: 'diaconia_volunteers',
    SCHEDULE: 'diaconia_schedule',
    SETTINGS: 'diaconia_settings',
  };

  // --- Global State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light'
  );
  
  const [screen, setScreen] = useState<Screen>(() => 
    (localStorage.getItem(KEYS.SCREEN) as Screen) || 'welcome'
  );

  const [isAdmin, setIsAdmin] = useState<boolean>(() => 
    localStorage.getItem(KEYS.ADMIN) === 'true'
  );

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const stored = localStorage.getItem(KEYS.VOLUNTEERS);
    return stored ? JSON.parse(stored) : INITIAL_VOLUNTEERS;
  });

  const [schedule, setSchedule] = useState<ScheduleMap>(() => {
    const stored = localStorage.getItem(KEYS.SCHEDULE);
    return stored ? JSON.parse(stored) : INITIAL_SCHEDULE;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
  });

  // Date State (Current view month)
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // UI State for editing App Title
  const [isEditingAppTitle, setIsEditingAppTitle] = useState(false);
  const [tempAppTitle, setTempAppTitle] = useState('');

  // --- Effects ---

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => localStorage.setItem(KEYS.SCREEN, screen), [screen]);
  useEffect(() => localStorage.setItem(KEYS.ADMIN, isAdmin.toString()), [isAdmin]);
  useEffect(() => localStorage.setItem(KEYS.VOLUNTEERS, JSON.stringify(volunteers)), [volunteers]);
  useEffect(() => localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule)), [schedule]);
  useEffect(() => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)), [settings]);

  // --- Handlers ---

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    setScreen('welcome');
    setIsAdmin(false);
  };

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleUpdateAppTitle = () => {
    setSettings({ ...settings, appTitle: tempAppTitle });
    setIsEditingAppTitle(false);
  };

  // --- Render ---

  if (screen === 'welcome') {
    return (
      <WelcomeScreen 
        onStart={() => setScreen('app')} 
        onAdminLogin={() => setIsAdmin(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sair / Voltar"
            >
              <LogOut size={20} className={isAdmin ? "" : "transform rotate-180"} />
            </button>
            
            <div className="flex items-center gap-2">
              {isAdmin && isEditingAppTitle ? (
                <div className="flex items-center gap-2">
                  <input 
                    className="px-2 py-1 text-lg font-bold border rounded dark:bg-slate-800 dark:text-white dark:border-slate-600"
                    value={tempAppTitle}
                    onChange={(e) => setTempAppTitle(e.target.value)}
                  />
                  <button onClick={handleUpdateAppTitle} className="text-green-600"><Check size={20}/></button>
                  <button onClick={() => setIsEditingAppTitle(false)} className="text-red-600"><X size={20}/></button>
                </div>
              ) : (
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {settings.appTitle}
                </h1>
              )}
              {isAdmin && !isEditingAppTitle && (
                <button 
                  onClick={() => { setTempAppTitle(settings.appTitle); setIsEditingAppTitle(true); }}
                  className="text-slate-400 hover:text-indigo-600"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isAdmin && (
                 <span className="hidden md:inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase rounded-full tracking-wider">
                     Admin Mode
                 </span>
             )}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 no-print">
            <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                <ChevronLeft />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                <ChevronRight />
            </button>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">{settings.appTitle}</h1>
            <h2 className="text-xl text-gray-600 capitalize">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        </div>

        <Dashboard 
          volunteers={volunteers}
          schedule={schedule}
          infoText={settings.dashboardInfo}
          setInfoText={(text) => setSettings({...settings, dashboardInfo: text})}
          isAdmin={isAdmin}
          currentDate={currentDate}
        />

        <Scheduler 
          volunteers={volunteers}
          schedule={schedule}
          setSchedule={setSchedule}
          currentDate={currentDate}
          isAdmin={isAdmin}
        />

        <div className="no-print">
            <VolunteerManager 
            volunteers={volunteers}
            setVolunteers={setVolunteers}
            isAdmin={isAdmin}
            sectionTitle={settings.deaconSectionTitle}
            onUpdateTitle={(t) => setSettings({...settings, deaconSectionTitle: t})}
            />
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-sm no-print">
        &copy; {new Date().getFullYear()} IPGII - Sistema de Diaconia
      </footer>
    </div>
  );
};

export default App;