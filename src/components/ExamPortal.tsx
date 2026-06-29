import React from 'react';
import { PortalProps } from '../types';

interface ExamPortalProps extends PortalProps {
  aiResponseTrigger: (prompt: string, speaker: string, callback: (res: string) => void) => Promise<void>;
  isThinking: boolean;
}

export const ExamPortal: React.FC<ExamPortalProps> = ({ 
  currentView, 
  onViewChange, 
  aiResponseTrigger, 
  isThinking 
}) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-black text-white">Exam Portal ({currentView})</h2>
      <p className="text-slate-400">Exam interface goes here.</p>
    </div>
  );
};
