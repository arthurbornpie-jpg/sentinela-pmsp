
import React, { useState, useEffect } from 'react';
import { MockExam, MockExamResult, Subject, Question } from '../types';
import { geminiService } from '../services/geminiService';

interface MockExamRunnerProps {
  exam: MockExam;
  onFinish: (result: MockExamResult) => void;
  onCancel: () => void;
}

const MockExamRunner: React.FC<MockExamRunnerProps> = ({ exam, onFinish, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [hints, setHints] = useState<Record<string, { loading: boolean, text: string }>>({});
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIdx: number) => {
    setAnswers({ ...answers, [exam.questions[currentIdx].id]: optionIdx });
  };

  const handleRequestHint = async () => {
    const q = exam.questions[currentIdx];
    if (hints[q.id]?.text) {
      setShowHint(true);
      return;
    }
    setShowHint(true);
    setHints(prev => ({ ...prev, [q.id]: { loading: true, text: '' } }));
    try {
      const hintText = await geminiService.getTacticalHint(q);
      setHints(prev => ({ ...prev, [q.id]: { loading: false, text: hintText } }));
    } catch (e) {
      setHints(prev => ({ ...prev, [q.id]: { loading: false, text: "Interferência pesada! Não consigo transmitir agora." } }));
    }
  };

  const finishExam = () => {
    const subjectBreakdown: Record<string, { correct: number, total: number }> = {};
    let score = 0;
    exam.questions.forEach((q) => {
      if (!subjectBreakdown[q.subject]) subjectBreakdown[q.subject] = { correct: 0, total: 0 };
      subjectBreakdown[q.subject].total++;
      if (answers[q.id] === q.correctAnswer) {
        score++;
        subjectBreakdown[q.subject].correct++;
      }
    });
    onFinish({
      examId: exam.id, score, total: exam.questions.length, answers,
      timeSpentMinutes: (exam.durationMinutes * 60 - timeLeft) / 60,
      subjectBreakdown: subjectBreakdown as any
    });
  };

  const q = exam.questions[currentIdx];
  const progress = ((currentIdx + 1) / exam.questions.length) * 100;
  const currentHint = hints[q.id];

  return (
    <div className="max-w-4xl mx-auto pb-32 px-1">
      {/* Top HUD */}
      <div className="flex justify-between items-center mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-xl shadow-sm sticky top-0 md:top-20 z-30 border border-slate-200">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div>
            <h3 className="font-bold text-slate-800 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{exam.title}</h3>
            <p className="text-[8px] md:text-[9px] uppercase font-black text-red-600 tracking-widest">EM MISSÃO</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="text-right">
            <p className="text-[8px] uppercase font-bold text-slate-400">Tempo</p>
            <p className={`font-mono text-sm md:text-base font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <button 
            onClick={() => { if(confirm("Finalizar agora?")) finishExam(); }}
            className="bg-slate-900 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs"
          >
            Finalizar
          </button>
        </div>
      </div>

      <div className="mb-6 md:mb-8 px-2">
        <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 mb-1.5">
          <span>{currentIdx + 1} / {exam.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 md:h-2 rounded-full overflow-hidden">
          <div className="bg-red-600 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(220,38,38,0.3)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="relative">
        {/* Question Card */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[400px] md:min-h-[450px]">
          <div className="p-5 md:p-10">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200">
                {q.subject}
              </span>
              <button 
                onClick={handleRequestHint}
                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl active:scale-95 transition-all shadow-lg shadow-red-200"
              >
                <span className="text-sm">📻</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Pedir Apoio</span>
              </button>
            </div>

            <h2 className="text-lg md:text-2xl font-medium text-slate-800 leading-relaxed mb-8 md:mb-10">
              {q.text}
            </h2>

            <div className="grid grid-cols-1 gap-2.5 md:gap-3">
              {q.options.map((opt, idx) => {
                const isSelected = answers[q.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => { handleSelectOption(idx); }}
                    className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all flex items-start gap-3 md:gap-4 ${
                      isSelected ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <span className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shrink-0 ${
                      isSelected ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`text-[11px] md:text-base font-medium ${isSelected ? 'text-red-900' : 'text-slate-700'}`}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tactical Hint (Fixed Overlay for Mobile-First Readability) */}
        {showHint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fadeIn">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowHint(false)}></div>
            
            <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-red-600/40 overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 md:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600 flex items-center justify-center text-xl shadow-lg ring-4 ring-red-600/20">🎖️</div>
                    <div>
                      <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-red-500">APOIO ALPHA-1</h4>
                      <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">Transmissão Tática Segura</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowHint(false)} 
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="bg-black/40 p-5 rounded-2xl border border-white/10 font-mono text-xs md:text-sm leading-relaxed italic text-slate-300">
                  {currentHint?.loading ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Criptografando Dica...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="flex gap-3">
                        <span className="text-red-600 font-black">>></span>
                        {currentHint?.text}
                      </p>
                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Câmbio, Desligo.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 bg-slate-800/50 border-t border-white/5">
                <button 
                  onClick={() => setShowHint(false)}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 transition-colors shadow-lg"
                >
                  Entendido, Voltar à Missão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-slate-900/95 backdrop-blur-md text-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-2xl flex justify-between items-center border border-white/10 z-40">
        <button 
          onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); }}
          disabled={currentIdx === 0}
          className="px-4 md:px-6 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest disabled:opacity-20 flex items-center gap-2"
        >
          {`<`} Anterior
        </button>
        
        <div className="hidden md:flex gap-1.5 px-2 overflow-x-auto max-w-[50%] scrollbar-hide">
          {exam.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIdx(i); }}
              className={`w-7 h-7 rounded-lg text-[9px] font-black flex items-center justify-center transition-all shrink-0 ${
                currentIdx === i ? 'bg-red-600 ring-2 ring-white shadow-lg shadow-red-900/50' : 
                answers[exam.questions[i].id] !== undefined ? 'bg-green-600/50 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            if (currentIdx < exam.questions.length - 1) {
              setCurrentIdx(currentIdx + 1);
            } else {
              if(confirm("Deseja finalizar missão e enviar para correção?")) finishExam();
            }
          }}
          className="bg-red-600 px-6 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {currentIdx === exam.questions.length - 1 ? 'Finalizar' : 'Próxima >'}
        </button>
      </div>
    </div>
  );
};

export default MockExamRunner;
