import React, { useState } from 'react';
import { Printer, AlertCircle, Edit3, Save } from 'lucide-react';
import { Volunteer, ScheduleMap, ServiceTime, DaySchedule } from '../types';

interface DashboardProps {
  volunteers: Volunteer[];
  schedule: ScheduleMap;
  infoText: string;
  setInfoText: (text: string) => void;
  isAdmin: boolean;
  currentDate: Date;
}

const Dashboard: React.FC<DashboardProps> = ({ volunteers, schedule, infoText, setInfoText, isAdmin, currentDate }) => {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempInfo, setTempInfo] = useState(infoText);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveInfo = () => {
    setInfoText(tempInfo);
    setIsEditingInfo(false);
  };

  // Calculate monthly stats
  const getStats = () => {
    const stats: Record<string, number> = {};
    volunteers.forEach(v => stats[v.id] = 0);

    const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    Object.values(schedule).forEach((day: DaySchedule) => {
       // Filter by current month only (in case schedule has multiple months in future)
       if (day.date.split('-')[1] === monthStr) {
           ['09:00', '18:00'].forEach(time => {
               day.services[time as ServiceTime].forEach(slot => {
                   if (slot.volunteerId) {
                       stats[slot.volunteerId] = (stats[slot.volunteerId] || 0) + 1;
                   }
               });
           });
       }
    });
    return stats;
  };

  const stats = getStats();
  const sortedStats = Object.entries(stats)
    .sort(([, a], [, b]) => b - a)
    .map(([id, count]) => ({
      name: volunteers.find(v => v.id === id)?.name || 'Desconhecido',
      count
    }));

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center no-print">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Visão Geral</h2>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg transition-all shadow-md"
        >
          <Printer size={18} />
          <span>Gerar PDF / Imprimir</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-6 relative group">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Avisos Importantes</h3>
            {isEditingInfo ? (
              <div className="space-y-3">
                <textarea
                  value={tempInfo}
                  onChange={(e) => setTempInfo(e.target.value)}
                  className="w-full p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditingInfo(false)} className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400">Cancelar</button>
                  <button onClick={handleSaveInfo} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
                    <Save size={14}/> Salvar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-blue-900/80 dark:text-blue-100/80 whitespace-pre-wrap">{infoText}</p>
            )}
          </div>
        </div>
        {!isEditingInfo && isAdmin && (
          <button 
            onClick={() => { setTempInfo(infoText); setIsEditingInfo(true); }}
            className="absolute top-4 right-4 p-2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 size={18} />
          </button>
        )}
      </div>

      {/* Stats - Only visible in App, hidden in Print usually, but can stay if needed. Let's hide in print for cleaner schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 no-print">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Escalas no Mês</h3>
        <div className="flex flex-wrap gap-2">
            {sortedStats.map((stat, idx) => (
                <div key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {stat.name}: <span className="text-indigo-600 dark:text-indigo-400">{stat.count}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;