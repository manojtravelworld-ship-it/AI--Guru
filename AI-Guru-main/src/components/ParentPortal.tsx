import React from 'react';
import { LayoutDashboard, CheckCircle, Award, Calendar, AlertCircle, TrendingUp, Bell } from 'lucide-react';

interface ParentPortalProps {
  currentView: string; // 'parent-dashboard' | 'attendance-activity' | 'performance-trends' | 'parent-notifications'
  onViewChange: (view: string) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ currentView, onViewChange }) => {
  const notifications = [
    { id: 'n1', title: 'Quiz Achievement', text: 'Anand excelled in Planck\'s constant quiz scoring 92% (A+).', date: 'Today' },
    { id: 'n2', title: 'Activity Completed', text: 'Anand finished chapter Electrostatics lesson review.', date: 'Yesterday' }
  ];

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['parent-dashboard', 'attendance-activity', 'performance-trends', 'parent-notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => onViewChange(tab)}
            className={`text-sm font-semibold capitalize pb-2 transition-all shrink-0 border-b-2 ${
              currentView === tab
                ? 'text-amber-500 border-amber-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {currentView === 'parent-dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-amber-500" /> Child Achievement Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Child Profile</span>
                <p className="text-sm font-bold text-white mt-1">Anand G. Nair</p>
                <p className="text-[10px] text-slate-500">Grade 12 Science — Batch A</p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Average Grade</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">92.0% (A+)</p>
                <p className="text-[10px] text-slate-500">Exceeds national grade average</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Daily Streak Active</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Your child logged in 8 consecutive days!</p>
              </div>
              <span className="text-xl font-bold text-orange-500 font-mono">🔥 8 Days</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Teacher Feedback</h3>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
              <p className="text-xs text-slate-300 italic">"Anand participates actively in AI roundtable sessions. His understanding of wave equations is excellent. Suggest revision on optics before Keam mocks."</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">— Prof. Vikram</p>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE & ACTIVITY TRACKER */}
      {currentView === 'attendance-activity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" /> Attendance & Study Logs
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Interactive Class Session Logs</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Duration: 42 minutes — Quantum Mechanics roundtable</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Present</span>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Mock Test Center Session</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Attempted JEE simulation — 2 correct / 0 wrong</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE TRENDS */}
      {currentView === 'performance-trends' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Monthly Subject Growth Curves
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Physics Score Track</span>
                <span className="font-bold text-white">94%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Chemistry Score Track</span>
                <span className="font-bold text-white">88%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Biology Score Track</span>
                <span className="font-bold text-white">92%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {currentView === 'parent-notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500" /> Parent Alerts Center
          </h3>
          
          <div className="space-y-3">
            {notifications.map((not) => (
              <div key={not.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex justify-between items-center w-full">
                    <h4 className="text-xs font-bold text-white">{not.title}</h4>
                    <span className="text-[9px] font-mono text-slate-600">{not.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{not.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
