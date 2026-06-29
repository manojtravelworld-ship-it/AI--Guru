import React from 'react';
import { PortalProps, RoleType } from '../types';

interface SystemPortalProps extends PortalProps {
  systemPrompt: string;
  onPromptSave: (newPrompt: string) => void;
  models: any[];
  setModels: React.Dispatch<React.SetStateAction<any[]>>;
  customModelUrl: string;
  setCustomModelUrl: (url: string) => void;
  language: 'English' | 'Malayalam';
  onLanguageChange: (lang: 'English' | 'Malayalam') => void;
  userRole: RoleType;
  onRoleChange: (role: RoleType) => void;
}

export const SystemPortal: React.FC<SystemPortalProps> = ({ 
  currentView, 
  onViewChange,
  systemPrompt,
  onPromptSave,
  models,
  setModels,
  customModelUrl,
  setCustomModelUrl,
  language,
  onLanguageChange,
  userRole,
  onRoleChange
}) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-black text-white">System Portal ({currentView})</h2>
      <p className="text-slate-400">System settings go here.</p>
    </div>
  );
};
