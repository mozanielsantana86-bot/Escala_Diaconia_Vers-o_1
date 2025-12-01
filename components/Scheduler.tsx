import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, X } from 'lucide-react';
import { Volunteer, ScheduleMap, ServiceTime, Shift } from '../types';

interface SchedulerProps {
  volunteers: Volunteer[];
  schedule: ScheduleMap;
  setSchedule: (schedule: ScheduleMap) => void;
  currentDate: Date;
  isAdmin: boolean;
}

const getSundaysInMonth = (year: number, month: number) => {
  const sundays: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 0) { // 0 is Sunday
      sundays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
};

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const Scheduler: React.FC<SchedulerProps> = ({ volunteers, schedule, setSchedule, currentDate, isAdmin }) => {
  const [sundays, setSundays] = useState<Date[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string, time: ServiceTime, slotIdx: number } | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const [alsoScheduleOther, setAlsoScheduleOther] = useState(false);
  const [feedback, setFeedback] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setSundays(getSundaysInMonth(currentDate.getFullYear(), currentDate.getMonth()));
  }, [currentDate]);

  // Initializer for dates that don't exist in schedule
  useEffect(() => {
    if (sundays.length === 0) return;

    const newSchedule = { ...schedule };
    let hasChanges = false;

    sundays.forEach(sunday => {
      const key = formatDateKey(sunday);
      if (!newSchedule[key]) {
        newSchedule[key] = {
          date: key,
          services: {
            '09:00': [
              { slotId: 1, volunteerId: null },
              { slotId: 2, volunteerId: null },
              { slotId: 3, volunteerId: null }
            ],
            '18:00': [
              { slotId: 1, volunteerId: null },
              { slotId: 2, volunteerId: null },
              { slotId: 3, volunteerId: null }
            ]
          }
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSchedule(newSchedule);
    }
  }, [sundays, schedule, setSchedule]);

  const getSlotLabel = (date: Date, time: ServiceTime, slotIdx: number, isOccupied: boolean) => {
    // 0 = 1st Sunday, 1 = 2nd, etc.
    const sundayIndex = sundays.findIndex(d => formatDateKey(d) === formatDateKey(date));
    
    // Logic for Lord's Supper (Ceia)
    // 1st Sunday (index 0) -> 18:00 Slot 1 is Ceia (17:00)
    // 3rd Sunday (index 2) -> 09:00 Slot 1 is Ceia (08:00)
    
    let arrivalTime = '';
    let isCeia = false;

    if (time === '09:00') {
      if (sundayIndex === 2 && slotIdx === 0) { // 3rd Sunday, Slot 1
        arrivalTime = '08:00';
        isCeia = true;
      } else if (slotIdx === 0) {
        arrivalTime = '08:00';
      } else {
        arrivalTime = '08:30';
      }
    } else { // 18:00
      if (sundayIndex === 0 && slotIdx === 0) { // 1st Sunday, Slot 1
        arrivalTime = '17:00';
        isCeia = true;
      } else if (slotIdx === 0) {
        arrivalTime = '17:00';
      } else {
        arrivalTime = '17:30';
      }
    }

    if (isOccupied) return `${isCeia ? 'Ceia' : 'Chegada'}: ${arrivalTime}`;
    return `${isCeia ? 'Ceia' : 'Disponível'} (${arrivalTime})`;
  };

  const handleSlotClick = (dateKey: string, time: ServiceTime, slotIdx: number) => {
    setSelectedSlot({ date: dateKey, time, slotIdx });
    // Pre-select current volunteer if exists
    const currentVolId = schedule[dateKey]?.services[time][slotIdx].volunteerId;
    setSelectedVolunteerId(currentVolId || '');
    setAlsoScheduleOther(false);
  };

  const handleSaveSlot = () => {
    if (!selectedSlot) return;

    const { date, time, slotIdx } = selectedSlot;
    const newSchedule = { ...schedule };
    
    // Update main slot
    newSchedule[date].services[time][slotIdx].volunteerId = selectedVolunteerId || null;

    // Handle "Also schedule other"
    if (alsoScheduleOther && selectedVolunteerId) {
      const otherTime: ServiceTime = time === '09:00' ? '18:00' : '09:00';
      // Find first empty slot in other service
      const emptySlotIdx = newSchedule[date].services[otherTime].findIndex(s => s.volunteerId === null);
      if (emptySlotIdx !== -1) {
        newSchedule[date].services[otherTime][emptySlotIdx].volunteerId = selectedVolunteerId;
      }
    }

    setSchedule(newSchedule);
    setSelectedSlot(null);
  };

  const handleManualSave = (dateKey: string, time: ServiceTime) => {
    const key = `${dateKey}-${time}`;
    setFeedback({ ...feedback, [key]: true });
    setTimeout(() => {
        setFeedback(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, 2000);
    // In this app, state is auto-saved to localStorage by App.tsx, but this provides user feedback
  };

  const getVolunteerName = (id: string | null) => {
    if (!id) return null;
    return volunteers.find(v => v.id === id)?.name || 'Desconhecido';
  };
  
  // Count shifts for this month for the selected volunteer in modal
  const getVolunteerShiftCount = (volId: string) => {
    if (!volId) return 0;
    let count = 0;
    sundays.forEach(d => {
      const key = formatDateKey(d);
      if (schedule[key]) {
        ['09:00', '18:00'].forEach((t) => {
           schedule[key].services[t as ServiceTime].forEach(s => {
             if (s.volunteerId === volId) count++;
           });
        });
      }
    });
    return count;
  }

  // Calculate Shifts Goal
  const sundaysCount = sundays.length;
  const minShifts = sundaysCount === 5 ? 3 : 2;

  return (
    <div className="space-y-8">
      {sundays.map((sunday, index) => {
        const dateKey = formatDateKey(sunday);
        const daySchedule = schedule[dateKey];
        if (!daySchedule) return null;

        return (
          <div key={dateKey} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-slate-300 print:shadow-none print:break-inside-avoid">
            {/* Date Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="text-indigo-600" size={20} />
                {sunday.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({index + 1}º Domingo)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              {(['09:00', '18:00'] as ServiceTime[]).map(time => (
                <div key={time} className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">Culto {time}</span>
                    <button 
                      onClick={() => handleManualSave(dateKey, time)}
                      className="text-xs font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 no-print"
                    >
                      {feedback[`${dateKey}-${time}`] ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 size={14}/> Salvo!</span>
                      ) : (
                        "Salvar Escala"
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 flex-1">
                    {daySchedule.services[time].map((slot, idx) => {
                        const isOccupied = !!slot.volunteerId;
                        const label = getSlotLabel(sunday, time, idx, isOccupied);
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSlotClick(dateKey, time, idx)}
                            className={`w-full text-left p-3 rounded-lg border transition-all relative group
                              ${isOccupied 
                                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700' 
                                : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                              }
                            `}
                          >
                            <span className="absolute top-1 right-2 text-[10px] font-bold uppercase tracking-wider opacity-50">
                                Vaga {idx + 1}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium opacity-70 mb-1">{label}</span>
                                <span className={`font-semibold truncate ${!isOccupied ? 'italic opacity-60' : 'text-slate-900 dark:text-white'}`}>
                                    {getVolunteerName(slot.volunteerId) || 'Clique para escalar'}
                                </span>
                            </div>
                          </button>
                        );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Assignment Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Escalar Voluntário
                </h3>
                <button onClick={() => setSelectedSlot(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    Domingo {selectedSlot.date.split('-').reverse().slice(0, 2).join('/')} • {selectedSlot.time} • Vaga {selectedSlot.slotIdx + 1}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selecione o Diácono</label>
                        <select
                            value={selectedVolunteerId}
                            onChange={(e) => setSelectedVolunteerId(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">-- Deixar Disponível --</option>
                            {[...volunteers].sort((a,b) => a.name.localeCompare(b.name)).map(v => {
                                const count = getVolunteerShiftCount(v.id);
                                return (
                                    <option key={v.id} value={v.id}>
                                        {v.name} ({count} escalas)
                                    </option>
                                );
                            })}
                        </select>
                        {selectedVolunteerId && (
                           <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                Meta sugerida: {minShifts} escalas este mês.
                           </p>
                        )}
                    </div>

                    {selectedVolunteerId && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <input
                                type="checkbox"
                                id="crossSchedule"
                                checked={alsoScheduleOther}
                                onChange={(e) => setAlsoScheduleOther(e.target.checked)}
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <label htmlFor="crossSchedule" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                Escalar também no culto das {selectedSlot.time === '09:00' ? '18:00' : '09:00'}?
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button 
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSaveSlot}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
                >
                    Salvar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;