import React, { useState } from 'react';
import { User, Settings, CreditCard, Download, CloudOff, HelpCircle, CheckCircle } from 'lucide-react';

interface SystemPortalProps {
  currentView: string; // 'profile' | 'settings' | 'subscription' | 'downloads' | 'offline' | 'help'
  onViewChange: (view: string) => void;
  language: 'English' | 'Malayalam';
  onLanguageChange: (lang: 'English' | 'Malayalam') => void;
  userRole: string;
  onRoleChange: (role: any) => void;
}

export const SystemPortal: React.FC<SystemPortalProps> = ({
  currentView,
  onViewChange,
  language,
  onLanguageChange,
  userRole,
  onRoleChange
}) => {
  // Configs
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [offlineSandbox, setOfflineSandbox] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['profile', 'settings', 'subscription', 'downloads', 'offline', 'help'].map((tab) => (
          <button
            key={tab}
            onClick={() => onViewChange(tab)}
            className={`text-sm font-semibold capitalize pb-2 transition-all shrink-0 border-b-2 ${
              currentView === tab
                ? 'text-amber-500 border-amber-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* USER PROFILE */}
      {currentView === 'profile' && (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-2xl">
              AN
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Anand G. Nair</h3>
              <p className="text-xs text-slate-400 mt-0.5">student@openvidya.edu</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Active Core Persona</label>
              <select
                value={userRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
              >
                <option value="student">Student Persona</option>
                <option value="teacher">Teacher Persona</option>
                <option value="parent">Parent Persona</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {currentView === 'settings' && (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Localization & Speech Rates</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Syllabus Medium (Localization)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onLanguageChange('English')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    language === 'English' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  English Medium
                </button>
                <button
                  onClick={() => onLanguageChange('Malayalam')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    language === 'Malayalam' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  മലയാളം മീഡിയം
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Speech Rate (TTS speed):</span>
                <span className="font-mono text-white font-bold">{voiceRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION */}
      {currentView === 'subscription' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-72">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Free Tier</h4>
              <p className="text-2xl font-black text-white mt-2">$0 <span className="text-xs text-slate-500">/ forever</span></p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">Basic textbook lookups, flashcards, standard physics virtual lab experiments.</p>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold transition">Active</button>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between h-72 relative overflow-hidden">
            <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider animate-pulse">Best Value</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Premium Pro</h4>
              <p className="text-2xl font-black text-white mt-2">$9 <span className="text-xs text-slate-500">/ month</span></p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">Complete JEE/NEET entrance coaches, multi-agent virtual classroom discuss, high-speed Malayalam TTS narrators.</p>
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 rounded-xl text-xs font-black transition">Upgrade Plan</button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-72">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">School License</h4>
              <p className="text-xl font-black text-white mt-2">Enterprise Custom</p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">Consolidated administrative dashboards, teacher question bank synchronization, parent-teacher automated text dispatchers.</p>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold transition">Contact Licensing</button>
          </div>
        </div>
      )}

      {/* DOWNLOADS & OFFLINE CONTENT */}
      {(currentView === 'downloads' || currentView === 'offline') && (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-amber-500" /> Offline Sandbox Manager
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-white">Simulate Offline Mode</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Locks out cloud API requests and switches to local Gemma/Vibe weights.</p>
            </div>
            <input
              type="checkbox"
              checked={offlineSandbox}
              onChange={(e) => setOfflineSandbox(e.target.checked)}
              className="accent-amber-500 w-4 h-4"
            />
          </div>

          {offlineSandbox && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs flex items-center gap-2 animate-pulse">
              On-Device browser model active. Vector indexing running through WebGPU cache threads!
            </div>
          )}
        </div>
      )}

      {/* HELP CENTER */}
      {currentView === 'help' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4.5 h-4.5 text-amber-500" /> Help & Support documentation
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
              <h4 className="text-xs font-bold text-white">How does OpenVidya multi-agent classroom operate?</h4>
              <p className="text-[11px] text-slate-400 mt-1">Our AI Classrooms dynamically deploy dual classmate bots alongside Prof. Vikram. They argue, validate, or question your inputs, prompting cooperative academic exploration.</p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
              <h4 className="text-xs font-bold text-white">How do we connect real mic data?</h4>
              <p className="text-[11px] text-slate-400 mt-1">Under "Voice Portal", toggle the Microphone button to grant audio capturing permission. This registers pitch patterns, analyzing and scoring spoken fluency.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
