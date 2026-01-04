
import React, { useState, useEffect } from 'react';
import { geminiService, NewsBriefing } from '../services/geminiService';

const News: React.FC = () => {
  const [briefing, setBriefing] = useState<NewsBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await geminiService.fetchPMSPNews();
      setBriefing(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-block bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest mb-2 uppercase">Canal de Inteligência</div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Radar do Concurso</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Sincronização em tempo real com portais oficiais e Diário Oficial.</p>
        </div>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 active:scale-95 shrink-0"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Varrendo Rede...
            </>
          ) : '🔄 Atualizar Briefing'}
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">📡</div>
          </div>
          <div className="max-w-xs">
            <p className="text-slate-900 font-black uppercase text-xs tracking-[0.2em] mb-3">Escaneando Fontes Oficiais</p>
            <p className="text-slate-500 text-[10px] italic leading-relaxed">Cruzando dados da VUNESP, Diário Oficial de SP e Portal da PM para gerar seu relatório tático...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center shadow-inner">
          <div className="text-5xl mb-6">⚠️</div>
          <h3 className="text-red-900 font-black uppercase text-sm tracking-widest mb-2">Erro de Comunicação</h3>
          <p className="text-red-700/60 text-xs mb-8 max-w-xs mx-auto">Não foi possível estabelecer uma conexão segura com os servidores de busca. Verifique sua conexão.</p>
          <button 
            onClick={fetchNews}
            className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-200 active:scale-95 transition-all"
          >
            Tentar Reconexão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Main Briefing Terminal */}
          <div className="bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-5 md:p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <h3 className="font-bold military-font tracking-[0.2em] uppercase text-sm md:text-base">Relatório de Inteligência Tática</h3>
              </div>
              <span className="text-[9px] font-black bg-black/20 px-2 py-1 rounded border border-white/10">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="p-6 md:p-10 font-mono text-[11px] md:text-sm leading-relaxed text-slate-300">
              <div className="space-y-4 prose prose-invert max-w-none prose-sm md:prose-base">
                {briefing?.content.split('\n').map((line, i) => (
                  <p key={i} className={line.trim().startsWith('*') || line.trim().startsWith('-') ? 'flex gap-3 text-white font-medium' : ''}>
                    {line.trim().startsWith('*') || line.trim().startsWith('-') ? (
                      <>
                        <span className="text-red-500 font-black shrink-0">>></span>
                        {line.replace(/^[*-]\s*/, '')}
                      </>
                    ) : line}
                  </p>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>
          </div>

          {/* Sources Section */}
          <div className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl">🔗</span>
              <h4 className="font-black text-slate-900 uppercase text-[10px] md:text-xs tracking-widest">Referências de Verificação de Campo</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {briefing?.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Fonte {idx + 1}</p>
                    <h5 className="text-[11px] md:text-xs font-bold text-slate-700 truncate group-hover:text-red-700">{source.title}</h5>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-red-600 group-hover:border-red-200 transition-colors">
                    ↗
                  </div>
                </a>
              ))}
            </div>

            {briefing?.sources.length === 0 && (
              <div className="text-center py-6 text-slate-400 italic text-[10px]">
                Nenhuma fonte externa indexada para este briefing.
              </div>
            )}
          </div>

          {/* Warning Banner */}
          <div className="bg-red-600 text-white p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0 animate-pulse">🚨</div>
             <div>
               <h5 className="font-black military-font tracking-widest uppercase text-lg mb-1">Atenção Recruta</h5>
               <p className="text-white/80 text-xs md:text-sm leading-relaxed">Este radar é uma ferramenta de apoio. Sempre valide as informações finais e prazos diretamente no site oficial da <strong>VUNESP</strong> para evitar eliminação por perda de prazo.</p>
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
