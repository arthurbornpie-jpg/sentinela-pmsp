
import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, ThemeMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pmsp_profile');
    return saved ? JSON.parse(saved) : { name: 'Recruta', email: '', theme: 'light', avatarSeed: 'Recruta' };
  });

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifEnabled(true);
    }

    const syncProfile = () => {
      const saved = localStorage.getItem('pmsp_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', syncProfile);
    window.addEventListener('theme-changed', syncProfile);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('theme-changed', syncProfile);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const saveProfile = (updatedProfile: UserProfile) => {
    localStorage.setItem('pmsp_profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('theme-changed'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Arquivo muito pesado, recruta! Limite de 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => saveProfile({ ...profile, photoURL: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const getAvatarUrl = () => profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed || profile.name}`;

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'study', label: 'Trilha', icon: '📚' },
    { id: 'agenda', label: 'Escala', icon: '📅' },
    { id: 'simulated', label: 'Simula', icon: '📝' },
    { id: 'news', label: 'Radar', icon: '📰' },
    { id: 'performance', label: 'Dados', icon: '📊' },
    { id: 'tutor', label: 'IA', icon: '🎖️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-28 md:pb-0">
      <header className="sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-white/5 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-red-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-black text-lg md:text-xl italic shadow-lg shadow-red-200">S</div>
          <h1 className="military-font text-lg md:text-xl font-bold tracking-widest text-slate-900 dark:text-white leading-none">SENTINELA <span className="text-red-600">PMSP</span></h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => setShowProfilePanel(true)} className="flex items-center gap-2 md:gap-3 bg-slate-100 dark:bg-slate-800 py-1 pl-1 pr-3 rounded-full border border-slate-200 dark:border-white/5 hover:border-red-400 dark:hover:border-red-600 transition-all active:scale-95">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center text-white overflow-hidden">
              <img src={getAvatarUrl()} alt="User" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase text-slate-600 dark:text-slate-300 tracking-tighter truncate max-w-[80px]">{profile.name}</span>
          </button>
        </div>
      </header>

      {showProfilePanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => { setShowProfilePanel(false); setShowApkGuide(false); }}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border dark:border-white/10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            <div className="p-6 md:p-8 border-b dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="military-font text-lg font-bold tracking-widest dark:text-white uppercase">
                {showApkGuide ? 'Central de Comando APK' : 'Identidade Militar'}
              </h3>
              <button onClick={() => { setShowProfilePanel(false); setShowApkGuide(false); }} className="text-slate-400 hover:text-red-600 font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
              {!showApkGuide ? (
                <>
                  <div className="flex flex-col items-center gap-4">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       <div className="w-24 h-24 rounded-3xl bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden">
                          <img src={getAvatarUrl()} alt="Preview" className="w-full h-full object-cover" />
                       </div>
                       <div className="absolute -bottom-2 -right-2 bg-red-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg">📸</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nome de Guerra</label>
                      <input type="text" value={profile.name} onChange={(e) => saveProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:border-red-600 transition-all shadow-inner" />
                    </div>

                    <button 
                      onClick={() => setShowApkGuide(true)}
                      className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                      <span>🤖</span> Gerar APK para Celular
                    </button>
                    
                    {deferredPrompt && (
                      <button onClick={handleInstallClick} className="w-full bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">Instalar PWA Direto</button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-white/5">
                    <h4 className="text-xs font-black text-red-600 uppercase mb-3">Passo 1: Hospede o App</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Você precisa subir este código para um servidor (Vercel ou Netlify são grátis) para ter uma URL oficial.</p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-white/5">
                    <h4 className="text-xs font-black text-red-600 uppercase mb-3">Passo 2: Use o PWA Builder</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">Acesse <b>pwabuilder.com</b> e cole a URL do seu app. O sistema vai validar o manifesto que eu já configurei para você.</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
                      <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Package ID Recomendado:</p>
                      <code className="text-[10px] font-mono text-red-600 select-all">com.sentinelapmsp.app</code>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-5 rounded-3xl">
                    <h4 className="text-xs font-black text-white uppercase mb-3">Passo 3: Download do APK</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Clique em "Generate" e escolha "Android". O site vai te dar um arquivo .zip. Dentro dele estará o seu <b>.apk</b> pronto para instalar em qualquer Android!</p>
                  </div>

                  <button onClick={() => setShowApkGuide(false)} className="w-full text-[10px] font-black uppercase text-slate-400 py-2">Voltar ao Perfil</button>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-center shrink-0">
              <button onClick={() => { setShowProfilePanel(false); setShowApkGuide(false); }} className="bg-red-600 text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Confirmar Missão</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-3 md:p-8 animate-slide-up">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-2 pointer-events-none md:flex md:justify-center">
        <div className="max-w-xl mx-auto w-full glass-dark rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-1.5 md:p-2 flex justify-between items-center pointer-events-auto border border-white/10">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all rounded-2xl ${activeTab === item.id ? 'flex-[1.8] bg-red-600 shadow-lg' : 'flex-1 hover:bg-white/5'}`}>
              <span className={`text-lg md:text-xl mb-0.5 ${activeTab === item.id ? 'scale-110' : 'opacity-60 grayscale'}`}>{item.icon}</span>
              <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tighter ${activeTab === item.id ? 'text-white block' : 'text-slate-400 hidden'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
