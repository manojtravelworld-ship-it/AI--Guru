import React from 'react';
import { ConnectionStatus, RoleType } from '../types';
import { Sparkles, Globe, Cpu, ExternalLink } from 'lucide-react';

interface HeaderProps {
  status: ConnectionStatus;
  userRole: RoleType;
  language: 'English' | 'Malayalam';
  models: Array<{ id: string; name: string; type: string; provider: string; isActive: boolean; downloaded: boolean }>;
  onModelSelect: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  status, 
  userRole, 
  language,
  models,
  onModelSelect
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return (
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Cloud Sync Active</span>
          </div>
        );
      case ConnectionStatus.CONNECTING:
        return (
          <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[9px] uppercase tracking-wider animate-pulse">
            <span>Connecting...</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
            <span>Local Offline Weights</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-950 border-b border-slate-900 px-3 md:px-6 py-2.5 md:py-4 flex items-center justify-between z-10 gap-2">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-500 animate-pulse shrink-0" />
          <h1 className="text-xs md:text-base font-black text-white tracking-tight uppercase truncate">
            OpenVidya <span className="text-amber-500 text-[10px] lowercase font-mono">v1.2</span>
          </h1>
        </div>
        <div className="h-4 w-px bg-slate-800 hidden sm:block" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold hidden sm:block">
          AI Educational OS
        </span>
      </div>

      {/* Active AI Model Selector */}
      <div className="flex items-center gap-1.5 md:gap-2 bg-slate-900 border border-slate-800 rounded-full px-2 md:px-3 py-1 text-[10px] md:text-[11px] font-bold text-slate-300 shadow-md shrink-0">
        <Cpu className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
        <span className="text-slate-500 font-mono uppercase text-[8px] md:text-[9px] tracking-wider hidden sm:inline">Active AI:</span>
        <select
          value={models.find(m => m.isActive)?.id || 'm1'}
          onChange={(e) => onModelSelect(e.target.value)}
          className="bg-transparent text-white font-black hover:text-amber-400 focus:outline-none cursor-pointer pr-1 transition-colors text-[10px] md:text-[11px]"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id} className="bg-slate-950 text-white font-medium">
              {model.name} {!model.downloaded ? '(setup)' : ''}
            </option>
          ))}
        </select>
        <span className="text-[8px] md:text-[9px] font-mono text-emerald-400 uppercase tracking-wider shrink-0 bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded-full border border-emerald-500/20 hidden md:inline-flex">
          active
        </span>
      </div>

      {/* Roster / Status Elements */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        
        {/* Open in New Tab Button to bypass iframe speech/microphone restrictions */}
        <button
          onClick={() => window.open(window.location.href, '_blank')}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border border-amber-500/20 px-2 py-1 rounded-full text-[9px] md:text-[10px] font-black text-slate-950 shrink-0 transition-all shadow-lg active:scale-95 animate-bounce"
          title="Open in new tab to enable standard microphone and Web Speech narration"
        >
          <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-950 shrink-0" />
          <span>Fix Mic/Voice (New Tab)</span>
        </button>

        {/* Language Pill */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold text-slate-400 shrink-0">
          <Globe className="w-2.5 h-2.5 md:w-3 md:h-3 text-indigo-400 shrink-0" />
          <span className="truncate">{language === 'English' ? 'English' : 'മലയാളം'}</span>
        </div>

        {/* User Persona Tag */}
        <div className="bg-slate-900 border border-slate-850 px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1 md:gap-1.5 shrink-0">
          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full shrink-0" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white truncate">
            {userRole}
          </span>
        </div>

        {/* Uplink status */}
        <div className="hidden md:block bg-slate-900/60 border border-slate-850/60 px-3 py-1 rounded-full shrink-0">
          {getStatusDisplay()}
        </div>

      </div>

    </div>
  );
};
