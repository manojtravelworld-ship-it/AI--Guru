import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Play, Pause, RefreshCw, AlertTriangle, 
  Terminal, Check, Activity, Globe, Cpu, ChevronDown, ChevronUp 
} from 'lucide-react';

interface StudentSettingsProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  isGemmaDownloading: boolean;
  downloadProgress: number;
  downloadedMB: number;
  totalMB: number;
  gemmaDownloaded: boolean;
  loadGemmaModel: (mode?: 'real' | 'simulated', modelId?: string) => Promise<void>;
  models: Array<{ id: string; name: string; type: string; provider: string; cost: string; latency: string; isActive: boolean; downloaded: boolean }>;
  setModels: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; type: string; provider: string; cost: string; latency: string; isActive: boolean; downloaded: boolean }>>>;
  
  // Advanced Download Manager states
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

export const StudentSettings: React.FC<StudentSettingsProps> = ({
  selectedSubject,
  setSelectedSubject,
  isGemmaDownloading,
  downloadProgress,
  downloadedMB,
  totalMB,
  gemmaDownloaded,
  loadGemmaModel,
  models,
  setModels,
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
  const subjects = ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'Geography'];
  const [showLogs, setShowLogs] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const activeModel = models.find(m => m.isActive) || models[0];

  const handleSelectModel = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, isActive: true } : { ...m, isActive: false }));
  };

  // Scroll logs to bottom when updated
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [downloadLogs, showLogs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 text-white bg-slate-950/40 rounded-3xl border border-slate-900 shadow-2xl">
      {/* Left Half: Subjects */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-extrabold mb-2 text-amber-500 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5" /> Student Syllabus Hub
          </h2>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Selecting a subject maps your active NCERT / SCERT studies. You can use either the Cloud model or run our Local LiteRT model for 100% offline access.
          </p>
          <ul className="space-y-2.5">
            {subjects.map((subject) => {
              const isRecommendedForGemma = ['Mathematics', 'Physics', 'Computer Science'].includes(subject);
              return (
                <li 
                  key={subject} 
                  onClick={() => setSelectedSubject(subject)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedSubject === subject 
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-md' 
                      : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs">{subject}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {isRecommendedForGemma ? 'Local Gemma 4 Recommended (Offline)' : 'VibeThinker 3B Recommended (Offline)'}
                    </div>
                  </div>
                  {selectedSubject === subject && (
                    <span className="text-[8px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase font-black tracking-wider">
                      Active Study
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-850 text-[10px] text-slate-500 leading-normal">
          Currently mapping your Roundtable responses according to the selected NCERT guidelines.
        </div>
      </div>

      {/* Right Half: AI Configuration & Model Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-amber-500 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5" /> AI Engine Configuration
          </h3>
          
          <div className="w-full bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1.5 shadow-inner">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Selected Subject:</span>
              <span className="font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-md">{selectedSubject}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Active AI Model:</span>
              <span className="font-bold text-amber-400">{activeModel.name}</span>
            </div>
            <div className="text-[9px] text-slate-500 border-t border-slate-850 pt-1.5 mt-1.5 flex justify-between">
              <span>{activeModel.provider}</span>
              <span>{activeModel.cost}</span>
            </div>
          </div>

          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Choose Active Orchestrator
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {models.map((model) => {
              const isLocal = model.provider === 'Offline local browser worker';
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    model.isActive
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-md'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-850 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>{model.name}</span>
                    {isLocal && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${
                        model.downloaded 
                          ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/35' 
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}>
                        {model.downloaded ? 'Downloaded' : 'No Weights'}
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 leading-normal">{model.type}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Local model load controls & Advanced Download Manager */}
        <div className="border-t border-slate-850 pt-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              LiteRT-LM {activeModel.provider === 'Offline local browser worker' ? activeModel.name : 'Model'} Download Manager
            </h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[9px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-all"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'} {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Advanced / Resiliency Controls Panel */}
          {showAdvanced && (
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3 shadow-inner">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Pipeline Target URL</span>
                <input
                  type="text"
                  placeholder={activeModel.id === 'm3' ? "https://huggingface.co/manojbillionaire123/VibeThinker-3B-litert-lm/resolve/main/vibethinker3b_q8_ekv8192_lora16.litertlm" : "https://huggingface.co/manojbillionaire123/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task"}
                  value={customModelUrl}
                  onChange={(e) => setCustomModelUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono rounded-lg p-2 focus:outline-none focus:border-amber-500 text-slate-300"
                />
                <p className="text-[8px] text-slate-500">
                  Leave empty to use the default optimized HuggingFace mirror. Paste a direct link to resolve custom GGUF/Task formats.
                </p>
              </div>

            </div>
          )}
          
          {activeModel.id === 'm1' ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-center space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  Cloud Orchestration model (Gemini 3.5 Flash) is active!
                </p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  No local downloads are required to run in Cloud mode. Ensure your API key is configured in your project settings. You can switch to 'Gemma 4 E2B' or 'VibeThinker 3B' at any time to run fully on-device.
                </p>
              </div>
            </div>
          ) : activeModel.downloaded ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center justify-between gap-2 shadow-inner">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold">{activeModel.name} is fully initialized on-device!</span>
                </span>
                <button
                  onClick={handleCancelOrResetDownload}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 transition"
                  title="Unload model weight memory and clear cache files"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Purge Cache
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                You can now head to the <b>Adaptive Study Roundtable</b> or click the microphone to chat offline. Try choosing Mathematics or Physics to let {activeModel.name} take over completely!
              </p>
            </div>
          ) : isGemmaDownloading ? (
            <div className="space-y-3 bg-slate-950/60 p-4 border border-slate-850 rounded-2xl relative overflow-hidden">
              {/* Active Download Happening Glow Indicator */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 animate-pulse" />
              
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-amber-500 font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  {isDownloadPaused ? 'Download Paused' : `ACTIVE BINARY DOWNLOAD: Fetching ${activeModel.id === 'm3' ? 'vibethinker3b_q8_ekv8192_lora16.litertlm' : 'gemma-4-E2B-it-web.task'}...`}
                </span>
                <span className="text-slate-300 font-bold">{downloadProgress}%</span>
              </div>

              {/* Progress Slider */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDownloadPaused ? 'bg-slate-500' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300'
                  }`}
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>

              {/* Transferred Bytes Counter */}
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>{downloadedMB} MB / {totalMB} MB</span>
                <span className="flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-amber-500 animate-spin" />
                  Est. speed: {isDownloadPaused ? '0.0' : '12.5'} MB/s
                </span>
              </div>

              {/* Download Controls: Play, Pause, Reset */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-900">
                {isDownloadPaused ? (
                  <button
                    onClick={handleResumeDownload}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-lg text-[10px] uppercase flex items-center justify-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-slate-950" /> Resume Download
                  </button>
                ) : (
                  <button
                    onClick={handlePauseDownload}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-lg text-[10px] uppercase flex items-center justify-center gap-1 transition"
                  >
                    <Pause className="w-3 h-3 fill-slate-950" /> Pause Download
                  </button>
                )}
                
                <button
                  onClick={handleCancelOrResetDownload}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white px-3 py-2 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Abort
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Default download selector buttons */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Run {activeModel.name} locally on your device's browser using our recommended Android/WASM <b>"Production Trio"</b> model pipelines:
                </p>

                {/* Show the Trio quick visual references */}
                <div className="grid grid-cols-3 gap-2 text-center text-[8px] text-slate-500 border border-slate-900 p-2.5 rounded-xl bg-slate-950/40">
                  <div className="space-y-1">
                    <span className="font-bold text-[9px] text-amber-500/90 flex items-center justify-center gap-0.5"><Globe className="w-2.5 h-2.5" /> OkHttp</span>
                    <span>Range Headers & chunks</span>
                  </div>
                  <div className="space-y-1 border-x border-slate-900 px-1">
                    <span className="font-bold text-[9px] text-amber-500/90 flex items-center justify-center gap-0.5"><Activity className="w-2.5 h-2.5" /> WorkManager</span>
                    <span>Stably runs in background</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-[9px] text-amber-500/90 flex items-center justify-center gap-0.5"><Cpu className="w-2.5 h-2.5" /> LiteRT</span>
                    <span>WebGL accelerated</span>
                  </div>
                </div>
              </div>

              {/* Errors Display Alert */}
              {downloadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl space-y-1">
                  <div className="font-bold flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> Pipeline Download Blocked
                  </div>
                  <p>{downloadError}</p>
                </div>
              )}

              {/* Primary load trigger button */}
              <button 
                onClick={() => loadGemmaModel(downloadMode, activeModel.id)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-xl text-xs transition uppercase tracking-wider text-center shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download & Load {activeModel.name} to Device ({activeModel.id === 'm3' ? '3.26 GB' : '1.43 GB'})
              </button>
            </div>
          )}

          {/* Logs and Shell display drawer */}
          {(downloadLogs.length > 0 || isGemmaDownloading) && (
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className="w-full bg-slate-950 hover:bg-slate-900 text-left px-3 py-2 text-[9px] font-mono text-slate-400 border-b border-slate-900 flex justify-between items-center"
              >
                <span className="flex items-center gap-1 text-slate-300 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-amber-500" />
                  Pipeline Core logs ({downloadLogs.length} items)
                </span>
                <span>{showLogs ? 'Hide Output' : 'View Output'}</span>
              </button>
              
              {showLogs && (
                <div className="p-3 bg-slate-950 max-h-36 overflow-y-auto font-mono text-[8px] text-slate-400 space-y-1.5 shadow-inner select-all">
                  {downloadLogs.map((log, i) => {
                    let color = 'text-slate-400';
                    if (log.includes('[OkHttp]')) color = 'text-sky-400';
                    else if (log.includes('[WorkManager]')) color = 'text-purple-400';
                    else if (log.includes('[LiteRT]')) color = 'text-amber-400';
                    else if (log.includes('[System]')) color = 'text-emerald-400';

                    return (
                      <div key={i} className={`${color} leading-relaxed break-all`}>
                        {log}
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
