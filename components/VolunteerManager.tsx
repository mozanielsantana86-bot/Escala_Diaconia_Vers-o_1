import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, User } from 'lucide-react';
import { Volunteer } from '../types';

interface VolunteerManagerProps {
  volunteers: Volunteer[];
  setVolunteers: (volunteers: Volunteer[]) => void;
  isAdmin: boolean;
  sectionTitle: string;
  onUpdateTitle: (newTitle: string) => void;
}

const VolunteerManager: React.FC<VolunteerManagerProps> = ({
  volunteers,
  setVolunteers,
  isAdmin,
  sectionTitle,
  onUpdateTitle
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(sectionTitle);
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const handleSaveTitle = () => {
    onUpdateTitle(tempTitle);
    setIsEditingTitle(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    
    const newVolunteer: Volunteer = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      phone: newPhone.trim()
    };
    setVolunteers([...volunteers, newVolunteer]);
    setNewName('');
    setNewPhone('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este diácono? Isso não removerá o nome dele da escala existente, mas impedirá novas escalas.')) {
      setVolunteers(volunteers.filter(v => v.id !== id));
    }
  };

  const startEdit = (v: Volunteer) => {
    setEditingId(v.id);
    setEditName(v.name);
    setEditPhone(v.phone);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editPhone.trim()) return;
    setVolunteers(volunteers.map(v => 
      v.id === editingId ? { ...v, name: editName, phone: editPhone } : v
    ));
    setEditingId(null);
  };

  const sortedVolunteers = [...volunteers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
      <div className="flex justify-between items-center mb-6">
        {isAdmin && isEditingTitle ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="text-xl font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-white"
            />
            <button onClick={handleSaveTitle} className="p-1 text-green-600 hover:text-green-700"><Check size={20}/></button>
            <button onClick={() => setIsEditingTitle(false)} className="p-1 text-red-600 hover:text-red-700"><X size={20}/></button>
          </div>
        ) : (
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="text-indigo-600" />
            {sectionTitle}
            {isAdmin && (
              <button 
                onClick={() => { setTempTitle(sectionTitle); setIsEditingTitle(true); }}
                className="ml-2 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            )}
          </h2>
        )}
      </div>

      {isAdmin && (
        <form onSubmit={handleAdd} className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Novo Cadastro</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome completo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="md:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={!newName || !newPhone}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} /> Adicionar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVolunteers.map(volunteer => (
          <div key={volunteer.id} className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all">
            {editingId === volunteer.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">Cancelar</button>
                  <button onClick={saveEdit} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{volunteer.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{volunteer.phone}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(volunteer)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(volunteer.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {sortedVolunteers.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-400 italic">
            Nenhum voluntário cadastrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerManager;