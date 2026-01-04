
import React, { useState, useEffect } from 'react';
import { PMSP_SUBJECTS } from '../constants';
import { StudySlot, UserProfile } from '../types';

const Dashboard: React.FC = () => {
  const [nextStudy, setNextStudy] = useState<StudySlot | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pmsp_profile');
    return saved ? JSON.parse(saved) : { name: 'Recruta' };
  });

  useEffect(() => {
    const saved = localStorage.getItem('pmsp_agenda');
    if (saved) {
      const slots: StudySlot[] = JSON.parse(saved);
      const now = new Date();
      const currentDay = now.getDay();
      const futureSlots = slots
        .filter(s => s.active)
        .sort((a,b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time));
      const next = futureSlots.find(s => s.dayOfWeek >= currentDay) || futureSlots[0];
      setNextStudy(next || null);
    }
  }, []);

  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
            Prontidão Máxima
          </div>
          <h2 className="text-3xl font-bold military-font tracking-widest uppercase">Bem-vindo ao Front, {profile.name}</h2>
          <p className="text-slate-400 text-xs mt-2 italic max-w-xs">A disciplina é a alma de um exército. Torne-se imbatível.</p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Missões Cumpridas</p>
              <p className="text-2xl font-black">127</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Fogo de Estudo</p>
              <p className="text-2xl font-black">08 <span className="text-xs text-orange-500">🔥</span></p>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]"></div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Escala de Hoje
          </h3>
          {nextStudy ? (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold">
                {days[nextStudy.dayOfWeek]}
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">{nextStudy.subject}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase">ÀS {nextStudy.time}H</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma patrulha agendada para agora.</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Performance por Área
          </h3>
          <div className="space-y-4">
            {PMSP_SUBJECTS.slice(0, 3).map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                  <span>{s}</span>
                  <span className="text-slate-900 dark:text-white">{[85, 42, 67][i]}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${[85, 42, 67][i]}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
