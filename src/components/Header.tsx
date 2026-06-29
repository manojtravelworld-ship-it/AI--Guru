import React, { useState } from 'react';
import { Camera, Mic, CameraOff, MicOff } from 'lucide-react';
import { ConnectionStatus, RoleType, ModelType } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  userRole: RoleType;
  language: 'English' | 'Malayalam';
  models: ModelType[];
  onModelSelect: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ status, userRole, language, models, onModelSelect }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  return (
    <header className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-white">AI-Guru</h1>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`p-2 rounded-full ${isCameraOn ? 'bg-emerald-600' : 'bg-slate-800'}`}
        >
          {isCameraOn ? <Camera className="w-5 h-5 text-white" /> : <CameraOff className="w-5 h-5 text-slate-400" />}
        </button>
        <button 
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-2 rounded-full ${isMicOn ? 'bg-emerald-600' : 'bg-slate-800'}`}
        >
          {isMicOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};
