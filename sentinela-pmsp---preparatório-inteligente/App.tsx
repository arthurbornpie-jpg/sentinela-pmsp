
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudyTrack from './components/StudyTrack';
import SimulatedExam from './components/SimulatedExam';
import AITutor from './components/AITutor';
import News from './components/News';
import Performance from './components/Performance';
import StudyAgenda from './components/StudyAgenda';
import { StudySlot, UserProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastNotified, setLastNotified] = useState<string>("");

  // Aplicação de Tema
  useEffect(() => {
    const applyTheme = () => {
      const savedProfile = localStorage.getItem('pmsp_profile');
      const profile: UserProfile = savedProfile ? JSON.parse(savedProfile) : { theme: 'light' };
      
      const isDark = profile.theme === 'dark' || 
                    (profile.theme === 'dynamic' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    
    // Escuta mudanças manuais via evento customizado ou storage
    const handleUpdate = () => applyTheme();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('theme-changed', handleUpdate);

    // Escuta mudanças no sistema se for dinâmico
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('theme-changed', handleUpdate);
      mediaQuery.removeEventListener('change', handleUpdate);
    };
  }, []);

  // Monitor de Alarme de Estudo
  useEffect(() => {
    const checkAgenda = () => {
      const saved = localStorage.getItem('pmsp_agenda');
      if (!saved) return;
      
      const slots: StudySlot[] = JSON.parse(saved);
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
      
      const activeSlot = slots.find(s => s.dayOfWeek === currentDay && s.time === currentTime && s.active);
      
      if (activeSlot && lastNotified !== activeSlot.id + currentTime) {
        setLastNotified(activeSlot.id + currentTime);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("SENTINELA: MISSÃO AGENDADA", {
            body: `Recruta, hora de estudar ${activeSlot.subject}. Iniciar patrulha agora!`,
            icon: "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruta"
          });
        }
        
        alert(`🚨 ALERTA DE COMBATE: Hora de estudar ${activeSlot.subject}! Missão dada é missão cumprida!`);
      }
    };

    const interval = setInterval(checkAgenda, 30000);
    return () => clearInterval(interval);
  }, [lastNotified]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'study': return <StudyTrack />;
      case 'agenda': return <StudyAgenda />;
      case 'simulated': return <SimulatedExam />;
      case 'news': return <News />;
      case 'tutor': return <AITutor />;
      case 'performance': return <Performance />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
