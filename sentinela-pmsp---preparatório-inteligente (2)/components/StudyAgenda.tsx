
import React, { useState, useEffect } from 'react';
import { Subject, StudySlot } from '../types';

const StudyAgenda: React.FC = () => {
  const [slots, setSlots] = useState<StudySlot[]>(() => {
    const saved = localStorage.getItem('pmsp_agenda');
    return saved ? JSON.parse(saved) : [];
  });

  const [newSlot, setNewSlot] = useState({
    subject: Subject.PORTUGUESE,
    dayOfWeek: 1,
    time: "08:00"
  });

  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  useEffect(() => {
    localStorage.setItem('pmsp_agenda', JSON.stringify(slots));
  }, [slots]);

  const addSlot = () => {
    const slot: StudySlot = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newSlot.subject,
      dayOfWeek: newSlot.dayOfWeek,
      time: newSlot.time,
      active: true
    };
    setSlots([...slots, slot]);
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-10">
      <header>
        <div className="inline-block bg-slate-900 text-white px-2 py-1 rounded text-[8px] md:text-[10px] font-black tracking-[0.2em] mb-2 border border-slate-700 uppercase">
          Quartel General
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Escala de Serviço</h2>
        <p className="text-slate-500 text-xs md:text-sm">Programe suas patrulhas de estudo. O sistema emitirá alertas de prontidão.</p>
      </header>

      {/* Form de Adição */}
      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200/60 shadow-sm">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-4 md:mb-6">Novo Despacho de Estudo</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Matéria</label>
            <select 
              value={newSlot.subject}
              onChange={(e) => setNewSlot({...newSlot, subject: e.target.value as Subject})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-600 transition-colors"
            >
              {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Dia</label>
            <select 
              value={newSlot.dayOfWeek}
              onChange={(e) => setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-600 transition-colors"
            >
              {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Horário</label>
            <input 
              type="time"
              value={newSlot.time}
              onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-600 transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={addSlot}
              className="w-full bg-red-600 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
            >
              Mobilizar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Escala Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.length === 0 ? (
          <div className="md:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-[2rem] text-center">
            <div className="text-4xl mb-4 opacity-30">📅</div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sem missões agendadas</p>
          </div>
        ) : (
          slots.sort((a,b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time)).map(slot => (
            <div key={slot.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[8px] font-black uppercase opacity-60 leading-none mb-0.5">{days[slot.dayOfWeek]}</span>
                  <span className="text-xs font-bold leading-none">{slot.time}</span>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 mb-1">{slot.subject}</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Escala Ativa</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeSlot(slot.id)}
                className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer de Alerta */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">🔔</div>
          <div className="flex-1 text-center md:text-left">
             <h4 className="font-bold military-font tracking-widest text-lg mb-1 uppercase">Monitoramento em Tempo Real</h4>
             <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed">Mantenha a aba do Sentinela aberta ou em segundo plano. O sistema verificará sua escala a cada minuto para garantir que você não perca o início da missão.</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
      </div>
    </div>
  );
};

export default StudyAgenda;
