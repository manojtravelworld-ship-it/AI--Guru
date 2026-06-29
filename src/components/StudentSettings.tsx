import React from 'react';
import { PortalProps } from '../types';

export const StudentSettings: React.FC<PortalProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="p-4 bg-slate-900 rounded-xl">
      <h2 className="text-lg font-bold text-white">Student Settings ({currentView})</h2>
      <p className="text-slate-400">Settings go here.</p>
    </div>
  );
};
