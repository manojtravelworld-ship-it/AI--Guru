import React from 'react';
import { PortalProps } from '../types';

interface VoicePortalProps extends PortalProps {
  micVolume: number;
}

export const VoicePortal: React.FC<VoicePortalProps> = ({ 
  currentView, 
  onViewChange,
  micVolume
}) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-black text-white">Voice Portal ({currentView})</h2>
      <p className="text-slate-400">Voice interactions go here. Volume: {micVolume}</p>
    </div>
  );
};
