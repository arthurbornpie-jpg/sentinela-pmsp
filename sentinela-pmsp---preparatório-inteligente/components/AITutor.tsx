
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { geminiService } from '../services/geminiService';

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'QAP Recruta! Sargento Tutor na escuta. Qual a sua dúvida para a missão de hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const decodeAndPlay = async (base64: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const handleVocalize = async (text: string) => {
    const audioData = await geminiService.vocalizeText(text);
    if (audioData) decodeAndPlay(audioData);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await geminiService.askTutor(messages, input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Pane no sistema! Repita a pergunta, recruta.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-220px)] bg-slate-50 dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-xl shadow-lg ring-2 ring-red-600/20">🎖️</div>
          <div>
            <h3 className="military-font text-white text-sm tracking-widest uppercase font-bold">Sargento Tutor</h3>
            <p className="text-[8px] text-green-500 font-black uppercase animate-pulse">● Online - Alpha 01</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${
              m.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-slate-200 text-slate-800 rounded-tl-none border border-slate-100 dark:border-white/5'
            }`}>
              {m.content}
              {m.role === 'assistant' && (
                <button onClick={() => handleVocalize(m.content)} className="block mt-2 text-[9px] font-black uppercase text-red-600 hover:text-red-500 transition-colors">
                  🔊 Ouvir Ordem
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-slate-400 font-bold animate-pulse">SARGENTO ESTÁ DIGITANDO...</div>}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-800 border-t dark:border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Sua dúvida, recruta?"
          className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 dark:text-white"
        />
        <button type="submit" className="bg-red-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          ➔
        </button>
      </form>
    </div>
  );
};

export default AITutor;
