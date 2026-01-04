
import React from 'react';
import { Subject } from '../types';
import { SYLLABUS_SUMMARY } from '../constants';

const StudyTrack: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Trilha de Aprendizado</h2>
          <p className="text-slate-500 mt-1">Edital 03/2023 - VUNESP</p>
        </div>
        <div className="bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-600">
          65% CONCLUÍDO
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(SYLLABUS_SUMMARY).map(([subject, topics], idx) => (
          <div key={subject} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-slate-200 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">{idx + 1}</span>
                {subject}
              </h3>
              <span className="text-xs font-bold text-green-600">Completo</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topics.map((topic, tIdx) => (
                <div key={tIdx} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors cursor-pointer group">
                  <input type="checkbox" defaultChecked={tIdx % 2 === 0} className="w-5 h-5 rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900">{topic}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-3 flex justify-end">
              <button className="text-blue-600 text-sm font-bold hover:underline">Ver Videoaulas & Apostilas →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyTrack;
