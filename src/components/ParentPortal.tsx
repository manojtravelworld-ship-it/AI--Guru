import React from 'react';
import { PortalProps } from '../types';

export const ParentPortal: React.FC<PortalProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-black text-white">Parent Portal ({currentView})</h2>
      <p className="text-slate-400">Parent view goes here.</p>
    </div>
  );
};
