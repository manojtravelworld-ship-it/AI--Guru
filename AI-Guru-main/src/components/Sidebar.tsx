import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Mic, 
  Users, 
  Heart, 
  Cpu, 
  Settings,
  Sparkles 
} from 'lucide-react';
import { PortalType } from '../types';

interface SidebarProps {
  currentPortal: PortalType;
  onPortalChange: (portal: PortalType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPortal, onPortalChange }) => {
  const portalItems = [
    { id: 'learning' as const, icon: <GraduationCap className="w-5 h-5" />, label: 'Learning' },
    { id: 'knowledge' as const, icon: <BookOpen className="w-5 h-5" />, label: 'Knowledge' },
    { id: 'exam' as const, icon: <Award className="w-5 h-5" />, label: 'Exam' },
    { id: 'voice' as const, icon: <Mic className="w-5 h-5" />, label: 'Voice' },
    { id: 'teacher' as const, icon: <Users className="w-5 h-5" />, label: 'Teacher' },
    { id: 'parent' as const, icon: <Heart className="w-5 h-5" />, label: 'Parent' },
    { id: 'brain' as const, icon: <Cpu className="w-5 h-5" />, label: 'AI Brain' },
    { id: 'system' as const, icon: <Settings className="w-5 h-5" />, label: 'System' }
  ];

  return (
    <div className="w-14 md:w-20 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-4 md:py-6 gap-4 md:gap-6 shrink-0 z-20">
      {/* Branding */}
      <div 
        className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-105 transition-all"
        title="OpenVidya Home"
        onClick={() => onPortalChange('learning')}
      >
        <span className="text-lg md:text-xl font-black text-slate-950 font-mono tracking-tighter">OV</span>
      </div>

      <div className="h-px w-6 md:w-8 bg-slate-900" />

      {/* Navigation Portals */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-2 md:gap-3 px-1 md:px-2">
        {portalItems.map((item) => {
          const isActive = currentPortal === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPortalChange(item.id)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all relative group ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
              title={item.label}
            >
              <div className="scale-90 md:scale-100">{item.icon}</div>
              
              {/* Active Bar indicator */}
              {isActive && (
                <div className="absolute left-0 w-1 h-4 md:h-5 bg-amber-500 rounded-r-full" />
              )}

              {/* Tooltip on hover */}
              <div className="absolute left-14 md:left-20 bg-slate-900 border border-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                {item.label} Portal
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
