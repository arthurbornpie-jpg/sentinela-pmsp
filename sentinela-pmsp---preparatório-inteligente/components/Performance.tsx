
import React from 'react';
import { INITIAL_ACHIEVEMENTS, PMSP_SUBJECTS } from '../constants';

const Performance: React.FC = () => {
  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-fadeIn">
      <header className="flex justify-between items-start">
        <div>
          <div className="inline-block bg-slate-900 dark:bg-red-600 text-white px-2 py-1 rounded text-[8px] md:text-[10px] font-black tracking-[0.2em] mb-2 border border-slate-700 dark:border-white/10 uppercase">
            Centro de Inteligência
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Relatório de Campo</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Análise tática e estatísticas de prontidão.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
           <span className="text-xl">🏆</span>
           <div className="hidden md:block">
              <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Status Atual</p>
              <p className="text-[10px] font-bold text-slate-800 dark:text-white uppercase">Sargento</p>
           </div>
        </div>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Precisão', value: '76%', color: 'text-green-600' },
          { label: 'Questões', value: '1.240', color: 'text-slate-900 dark:text-white' },
          { label: 'Estudo', value: '42h', color: 'text-slate-900 dark:text-white' },
          { label: 'Ranking', value: '#42', color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-1">{stat.label}</p>
            <p className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
            Matriz de Proficiência
          </h3>
          <div className="space-y-5">
            {PMSP_SUBJECTS.map((subject, idx) => {
              const percentages = [85, 42, 68, 92, 55];
              const val = percentages[idx];
              return (
                <div key={idx}>
                  <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                    <span className="truncate mr-2 text-xs md:text-sm">{subject}</span>
                    <span className={val > 60 ? 'text-green-600' : 'text-red-600'}>{val}%</span>
                  </div>
                  <div className="relative w-full h-2 md:h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${val > 60 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-red-950/20 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden border border-white/5 dark:border-red-900/30">
          <div className="relative z-10">
            <h3 className="font-bold military-font tracking-widest text-lg md:text-xl mb-6 text-white uppercase">Honrarias</h3>
            <div className="grid grid-cols-2 gap-3">
              {INITIAL_ACHIEVEMENTS.map((ach) => (
                <div key={ach.id} className={`p-3 md:p-4 rounded-xl border transition-all ${ ach.unlocked ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/5 grayscale opacity-40' }`}>
                  <div className="text-xl md:text-2xl mb-1">{ach.icon}</div>
                  <h4 className="text-[8px] font-black text-white uppercase tracking-tighter truncate">{ach.title}</h4>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 bg-red-600 text-white py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg">Todas Medalhas</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
