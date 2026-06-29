import React, { useState } from 'react';
import { Camera, Mic, CameraOff, MicOff } from 'lucide-react';

export const MicrophoneCameraPanel: React.FC = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  return (
    <div className="p-4 bg-slate-900 rounded-xl space-y-4">
      <h2 className="text-lg font-bold text-white">Audio/Video Settings</h2>
      <div className="flex gap-4">
        <button 
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`p-3 rounded-full ${isCameraOn ? 'bg-emerald-600' : 'bg-slate-700'}`}
        >
          {isCameraOn ? <Camera className="w-6 h-6 text-white" /> : <CameraOff className="w-6 h-6 text-white" />}
        </button>
        <button 
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-3 rounded-full ${isMicOn ? 'bg-emerald-600' : 'bg-slate-700'}`}
        >
          {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>
      </div>
    </div>
  );
};
