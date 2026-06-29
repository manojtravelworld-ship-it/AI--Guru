import React from 'react';
import { PortalProps } from '../types';

interface AIBrainPortalProps extends PortalProps {
  systemPrompt: string;
  onPromptSave: (newPrompt: string) => void;
  models: any[];
  setModels: React.Dispatch<React.SetStateAction<any[]>>;
  isGemmaDownloading: boolean;
  downloadProgress: number;
  downloadedMB: number;
  totalMB: number;
  gemmaDownloaded: boolean;
  loadGemmaModel: (mode?: 'real' | 'simulated', modelId?: string) => Promise<void>;
  downloadError: string | null;
  downloadMode: 'real' | 'simulated';
  setDownloadMode: (mode: 'real' | 'simulated') => void;
  isDownloadPaused: boolean;
  handlePauseDownload: () => void;
  handleResumeDownload: () => void;
  handleCancelOrResetDownload: () => void;
  downloadLogs: string[];
  customModelUrl: string;
  setCustomModelUrl: (url: string) => void;
}

export const AIBrainPortal: React.FC<AIBrainPortalProps> = ({ 
  currentView,
  onViewChange,
  systemPrompt,
  onPromptSave,
  models,
  setModels,
  isGemmaDownloading,
  downloadProgress,
  downloadedMB,
  totalMB,
  gemmaDownloaded,
  loadGemmaModel,
  downloadError,
  downloadMode,
  setDownloadMode,
  isDownloadPaused,
  handlePauseDownload,
  handleResumeDownload,
  handleCancelOrResetDownload,
  downloadLogs,
  customModelUrl,
  setCustomModelUrl
}) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-black text-white">AI Brain Portal ({currentView})</h2>
      <p className="text-slate-400">AI management goes here.</p>
    </div>
  );
};
