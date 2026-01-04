
import React, { useState } from 'react';
import { Subject, Question, MockExam, MockExamResult } from '../types';
import { geminiService } from '../services/geminiService';
import MockExamRunner from './MockExamRunner';

const SimulatedExam: React.FC = () => {
  const [view, setView] = useState<'selection' | 'running' | 'results'>('selection');
  const [currentMock, setCurrentMock] = useState<MockExam | null>(null);
  const [lastResult, setLastResult] = useState<MockExamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [detailedAnalyses, setDetailedAnalyses] = useState<Record<string, { loading: boolean, text: string }>>({});

  const startNewMock = async (title: string) => {
    setLoading(true);
    setLoadingProgress(5);
    setShowReview(false);
    const questions: Question[] = [];
    
    const distribution = [
      { subject: Subject.PORTUGUESE, count: 6 },
      { subject: Subject.MATHEMATICS, count: 5 },
      { subject: Subject.GENERAL_KNOWLEDGE, count: 4 },
      { subject: Subject.COMPUTER_SCIENCE, count: 3 },
      { subject: Subject.ADMIN_LAW, count: 2 },
    ];

    try {
      const batchPromises = distribution.map(d => geminiService.generateMockExamBatch(d.subject, d.count));
      const results = await Promise.all(batchPromises);
      results.forEach(batch => questions.push(...batch));

      const shuffled = questions.sort(() => Math.random() - 0.5);

      setCurrentMock({
        id: Date.now().toString(),
        title,
        questions: shuffled,
        durationMinutes: 45,
      });
      setView('running');
    } catch (error) {
      console.error("Failed to generate exam:", error);
      alert("ERRO DE COMUNICAÇÃO: Não pudemos carregar as questões. Verifique o sinal.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedAnalysis = async (question: Question, selectedIdx: number) => {
    if (detailedAnalyses[question.id]) return;
    setDetailedAnalyses(prev => ({ ...prev, [question.id]: { loading: true, text: '' } }));
    try {
      const analysis = await geminiService.explainQuestionResult(question, selectedIdx);
      setDetailedAnalyses(prev => ({ ...prev, [question.id]: { loading: false, text: analysis } }));
    } catch (e) {
      setDetailedAnalyses(prev => ({ ...prev, [question.id]: { loading: false, text: "Erro ao contatar o Sargento." } }));
    }
  };

  const handleFinish = (result: MockExamResult) => {
    setLastResult(result);
    setDetailedAnalyses({});
    setView('results');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 md:space-y-8 animate-pulse text-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <div className="absolute inset-0 border-[4px] md:border-[6px] border-slate-200 dark:border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-[4px] md:border-[6px] border-red-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-2xl md:text-3xl">📡</span>
          </div>
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold military-font tracking-widest text-slate-900 dark:text-white mb-2 uppercase">MOBILIZANDO TROPAS</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm px-6 italic">O motor de IA está selecionando as melhores questões para seu treinamento...</p>
        </div>
      </div>
    );
  }

  if (view === 'running' && currentMock) {
    return <MockExamRunner exam={currentMock} onFinish={handleFinish} onCancel={() => setView('selection')} />;
  }

  if (view === 'results' && lastResult && currentMock) {
    const accuracy = Math.round((lastResult.score / lastResult.total) * 100);
    
    // Análise de Dificuldades
    const subjectStats = Object.entries(lastResult.subjectBreakdown).map(([subj, stats]) => {
        const s = stats as { correct: number; total: number };
        return { subject: subj, accuracy: (s.correct / s.total) * 100 };
    }).sort((a, b) => a.accuracy - b.accuracy);

    const worstSubjects = subjectStats.filter(s => s.accuracy < 70).slice(0, 2);

    return (
      <div className="space-y-4 md:space-y-6 animate-fadeIn pb-10">
        <header className="bg-slate-900 dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border border-white/5">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1 md:mb-2">Relatório de Missão Finalizado</p>
              <h2 className="text-2xl md:text-3xl font-bold military-font tracking-widest uppercase truncate">{currentMock.title}</h2>
            </div>
            <div className="flex items-center gap-3 md:gap-4 bg-white/10 p-3 md:p-4 rounded-2xl md:rounded-3xl backdrop-blur-md border border-white/10">
              <div className="text-center border-r border-white/20 pr-3 md:pr-4">
                <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black">Acertos</p>
                <p className="text-xl md:text-2xl font-black text-red-500">{lastResult.score}/{lastResult.total}</p>
              </div>
              <div className="text-center pl-1 md:pl-2">
                <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black">Nota Final</p>
                <p className="text-xl md:text-2xl font-black">{accuracy}%</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 blur-3xl -mr-24 -mt-24"></div>
        </header>

        {/* Gráfico de Progresso por Questão (Timeline) */}
        <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Sequência de Combate (Progresso Passo-a-Passo)
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {currentMock.questions.map((q, idx) => {
              const isCorrect = lastResult.answers[q.id] === q.correctAnswer;
              return (
                <div 
                  key={q.id} 
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all shadow-sm ${
                    isCorrect ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'
                  }`}
                  title={`${q.subject}: ${isCorrect ? 'Acerto' : 'Erro'}`}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-[9px] font-bold uppercase text-slate-400">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-sm"></span> Alvo Atingido</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-sm"></span> Baixa de Desempenho</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <button 
            onClick={() => setShowReview(!showReview)}
            className={`py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all border-2 ${
              showReview ? 'bg-slate-900 dark:bg-red-600 text-white border-transparent' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-white/5'
            }`}
          >
            {showReview ? 'Voltar ao Relatório' : '🔍 Revisão Tática IA'}
          </button>
          <button 
            onClick={() => setView('selection')}
            className="bg-red-600 dark:bg-red-700 text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none"
          >
            Nova Missão
          </button>
        </div>

        {!showReview ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
             <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200/60 dark:border-white/5 shadow-sm">
               <h3 className="font-bold text-slate-800 dark:text-white mb-4 md:mb-6 uppercase text-[10px] md:text-xs tracking-widest">Performance por Setor</h3>
               <div className="space-y-4">
                 {Object.entries(lastResult.subjectBreakdown).map(([subj, stats]) => {
                   const s = stats as { correct: number; total: number };
                   const perc = (s.correct / s.total) * 100;
                   return (
                     <div key={subj}>
                       <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase mb-1 text-slate-500 dark:text-slate-400">
                         <span className="truncate mr-2">{subj}</span>
                         <span className={perc >= 70 ? 'text-green-600' : 'text-red-500'}>{perc.toFixed(0)}%</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full transition-all duration-700 ${ perc >= 70 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${perc}%` }}></div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             <div className="space-y-4 md:space-y-6">
                {/* Dificuldades - Alerta Vermelho */}
                {worstSubjects.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/20 p-5 md:p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      ⚠️ Prioridade de Reforço
                    </h4>
                    <div className="space-y-2">
                        {worstSubjects.map(s => (
                            <div key={s.subject} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.subject}</span>
                                <span className="text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded uppercase">Urgente</span>
                            </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl md:text-5xl mb-3 md:mb-4">{accuracy >= 70 ? '🎖️' : '👨‍🚀'}</div>
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs md:text-sm tracking-widest mb-2">Comando do Sargento</h4>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic px-4">
                    "{accuracy >= 85 ? 'Padrão especial, recruta! Você é um sniper. Mantenha essa cadência e a farda é sua!' : 
                      accuracy >= 70 ? 'Demonstrou brio, mas o campo de batalha é traiçoeiro. Reforce os pontos cegos e não se acomode.' : 
                      worstSubjects.length > 0 ? `Sua técnica falhou miseravelmente em ${worstSubjects[0].subject}. Volte ao quartel e estude até a exaustão!` :
                      'A missão foi comprometida. Estudo é disciplina, e disciplina não aceita desculpas. De novo!'}"
                    </p>
                </div>
             </div>
           </div>
        ) : (
          <div className="space-y-4 md:space-y-6 animate-slide-up">
            {currentMock.questions.map((q, idx) => {
              const userAns = lastResult.answers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              const analysis = detailedAnalyses[q.id];

              return (
                <div key={q.id} className={`bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border-2 overflow-hidden transition-all ${
                  isCorrect ? 'border-green-100 dark:border-green-900/20' : 'border-red-100 dark:border-red-900/20'
                }`}>
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] md:text-[9px] font-black uppercase px-2 py-1 rounded">
                        {q.subject}
                      </span>
                      <span className={`text-[9px] md:text-[10px] font-black uppercase px-2 md:px-3 py-1 rounded-full ${
                        isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-red-100 dark:bg-red-900/40 text-red-600'
                      }`}>
                        {isCorrect ? 'Alvo Atingido' : 'Erro de Combate'}
                      </span>
                    </div>
                    <h4 className="text-sm md:text-base text-slate-800 dark:text-white font-medium leading-relaxed mb-4 md:mb-6">
                      <span className="font-black mr-2 text-slate-400">#{idx + 1}</span>
                      {q.text}
                    </h4>
                    
                    <div className="space-y-2 mb-4 md:mb-6">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-2.5 md:p-3 rounded-xl text-[11px] md:text-xs flex gap-3 items-center border ${
                            oIdx === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 font-bold' : 
                            oIdx === userAns ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400' : 
                            'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400'
                        }`}>
                          <span className="font-black opacity-30">{String.fromCharCode(65 + oIdx)})</span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      ))}
                    </div>

                    {!analysis ? (
                      <button 
                        onClick={() => handleDetailedAnalysis(q, userAns)}
                        className="w-full bg-slate-900 dark:bg-red-600 text-white py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform"
                      >
                        ⚡ Analisar Erro com IA
                      </button>
                    ) : (
                      <div className="bg-slate-900 dark:bg-slate-950 rounded-xl md:rounded-2xl p-4 md:p-5 text-white animate-fadeIn relative overflow-hidden border border-white/5">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-red-500">Debriefing do Sargento</span>
                          <div className="h-[1px] flex-1 bg-white/10"></div>
                        </div>
                        {analysis.loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                            <span className="text-[8px] font-black uppercase tracking-widest animate-pulse">Consultando Arquivos...</span>
                          </div>
                        ) : (
                          <p className="text-[11px] md:text-xs text-slate-300 leading-relaxed italic">
                            "{analysis.text}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Missões de Simulado</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Geração dinâmica de questões padrão VUNESP.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="group bg-white dark:bg-slate-900 p-1 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-white/5 hover:shadow-xl transition-all overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[1.4rem] md:rounded-[2.2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 border border-white dark:border-white/5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 text-white rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shadow-xl shadow-red-200 dark:shadow-none shrink-0">
              📝
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white military-font tracking-widest uppercase mb-1">Simulado Rápido</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">20 questões mescladas com correção tática individualizada via Sargento IA.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                 <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400">20 Questões</span>
                 <span className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase border border-red-100 dark:border-red-900/30 text-red-600">Flash Engine</span>
              </div>
            </div>
            <button 
              onClick={() => startNewMock("Operação Sentinela Rápida")}
              className="w-full md:w-auto bg-slate-900 dark:bg-red-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-red-600 dark:hover:bg-red-500 transition-all shadow-lg active:scale-95"
            >
              Iniciar Marcha
            </button>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 p-8 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-60">
          <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎖️</div>
          <h3 className="font-bold text-slate-600 dark:text-slate-400 text-lg md:text-xl uppercase military-font tracking-widest">Simulado Oficial (60Q)</h3>
          <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">Simulação 1:1 com redação. Desbloqueia em breve.</p>
        </div>
      </div>
    </div>
  );
};

export default SimulatedExam;
