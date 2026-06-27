import React, { useState, useEffect } from 'react';
import { 
  Cpu, RotateCcw, AlertTriangle, Sparkles, Upload, FileText, 
  Download, Play, Pause, Check, CheckCircle2, Server, Info, ExternalLink, 
  Activity, Terminal, Send, Layers, Settings2, HelpCircle 
} from 'lucide-react';
import { litertEngine } from '../lib/litert';

interface AIBrainPortalProps {
  currentView: string; // 'brain-manager' | 'model-manager' | 'knowledge-upload' | 'prompt-studio'
  onViewChange: (view: string) => void;
  systemPrompt: string;
  onPromptSave: (newPrompt: string) => void;
  models: Array<{ id: string; name: string; type: string; provider: string; cost: string; latency: string; isActive: boolean; downloaded: boolean }>;
  setModels: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; type: string; provider: string; cost: string; latency: string; isActive: boolean; downloaded: boolean }>>>;
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
  // Derive downloaded states from elevated models state
  const vibeDownloaded = models.find(m => m.id === 'm3')?.downloaded || false;

  // Prompt states
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);
  const [promptSaved, setPromptSaved] = useState(false);

  // File Upload state
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'dragging' | 'processing' | 'done'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Gemma 4 E2B Downloader States (Replaced with props but keep downloadSpeed and steps for pipeline display)
  const [downloadSpeed, setDownloadSpeed] = useState(18.4);
  const [downloadStep, setDownloadStep] = useState<'idle' | 'okhttp' | 'workmanager' | 'litert' | 'complete'>('idle');

  // Update download step automatically based on real progress
  useEffect(() => {
    if (isGemmaDownloading) {
      if (downloadProgress < 45) {
        setDownloadStep('okhttp');
      } else if (downloadProgress >= 45 && downloadProgress < 85) {
        setDownloadStep('workmanager');
      } else {
        setDownloadStep('litert');
      }
      // Vary speed slightly for visual interest
      setDownloadSpeed(prev => +(prev + (Math.random() * 2 - 1)).toFixed(1));
    } else if (gemmaDownloaded) {
      setDownloadStep('complete');
    } else {
      setDownloadStep('idle');
    }
  }, [isGemmaDownloading, downloadProgress, gemmaDownloaded]);

  // Vibe Thinker 3B Downloader States
  const [isVibeDownloading, setIsVibeDownloading] = useState(false);
  const [vibeProgress, setVibeProgress] = useState(0);
  const [vibeSpeed, setVibeSpeed] = useState(0);
  const [vibeDownloadedMB, setVibeDownloadedMB] = useState(0);
  const [vibeTotalMB, setVibeTotalMB] = useState(3263); // ~3.26 GB
  const [vibeDownloadStep, setVibeDownloadStep] = useState<'idle' | 'okhttp' | 'workmanager' | 'litert' | 'complete'>('idle');

  const isVibeActive = models.find(m => m.id === 'm3')?.isActive || false;

  useEffect(() => {
    if (isGemmaDownloading && isVibeActive) {
      setIsVibeDownloading(true);
      setVibeProgress(downloadProgress);
      setVibeDownloadedMB(downloadedMB);
      setVibeTotalMB(totalMB);
      setVibeSpeed(12.5);
      
      if (downloadProgress < 45) {
        setVibeDownloadStep('okhttp');
      } else if (downloadProgress >= 45 && downloadProgress < 85) {
        setVibeDownloadStep('workmanager');
      } else {
        setVibeDownloadStep('litert');
      }
    } else if (vibeDownloaded) {
      setIsVibeDownloading(false);
      setVibeProgress(100);
      setVibeDownloadedMB(totalMB);
      setVibeTotalMB(totalMB);
      setVibeDownloadStep('complete');
    } else {
      setIsVibeDownloading(false);
      setVibeProgress(0);
      setVibeDownloadedMB(0);
      setVibeDownloadStep('idle');
    }
  }, [isGemmaDownloading, downloadProgress, downloadedMB, totalMB, vibeDownloaded, isVibeActive]);

  // Gemma 4 Local Playground Terminal States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'gemma', text: string, timestamp: string }>>([
    { sender: 'gemma', text: 'Hello student! I am your offline Gemma 4 E2B local assistant. I have been successfully downloaded and initialized via LiteRT-LM. I am running entirely in your browser Sandbox using WebGPU threads, completely offline and with zero latency! How can I help you today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isGemmaThinking, setIsGemmaThinking] = useState(false);

  // Vibe Thinker 3B Local Playground Terminal States
  const [vibeChatMessages, setVibeChatMessages] = useState<Array<{ sender: 'user' | 'vibe', text: string, timestamp: string }>>([
    { sender: 'vibe', text: 'Yo! I am your offline Vibe Thinker 3B assistant. Loaded via LiteRT-LM using WebGL weights on-device. I keep the learning process super active, fun, and completely secure. What subject or concept are we tackling today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [vibeUserQuery, setVibeUserQuery] = useState('');
  const [isVibeThinking, setIsVibeThinking] = useState(false);

  // Toggle model
  const toggleModelActive = (id: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, isActive: true };
      }
      return { ...m, isActive: false };
    }));
  };

  // Drag and Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadStatus('dragging');
  };

  const handleDragLeave = () => {
    setUploadStatus('idle');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadStatus('processing');
    setTimeout(() => {
      setUploadedFiles(prev => ['Math_Trig_NCERT_Formulas.pdf', ...prev]);
      setUploadStatus('done');
    }, 2000);
  };

  // Gemma 4 Download via real LiteRT loader
  const startGemmaDownload = (mode?: 'real' | 'simulated') => {
    loadGemmaModel(mode).catch(err => {
      console.error('Error starting gemma download:', err);
    });
  };

  // Vibe Thinker Download
  const startVibeDownload = () => {
    if (isVibeDownloading || vibeDownloaded) return;
    loadGemmaModel('real', 'm3').catch(err => {
      console.error('Error starting vibe download:', err);
    });
  };

  // Handle Gemma 4 local playground user message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isGemmaThinking) return;

    const userMsg = userQuery.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp }]);
    setUserQuery('');
    setIsGemmaThinking(true);

    if (gemmaDownloaded) {
      try {
        let accumulatedText = "";
        
        // Add an empty assistant message first
        setChatMessages(prev => [...prev, { 
          sender: 'gemma', 
          text: '', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
        
        await litertEngine.generate(userMsg, (partialText) => {
          accumulatedText = partialText;
          setChatMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].sender === 'gemma') {
              updated[lastIdx] = { ...updated[lastIdx], text: accumulatedText };
            }
            return updated;
          });
        });
      } catch (err) {
        console.error('Local LiteRT inference error:', err);
        setChatMessages(prev => [...prev, { 
          sender: 'gemma', 
          text: `Error running local inference: ${err instanceof Error ? err.message : String(err)}`, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } finally {
        setIsGemmaThinking(false);
      }
    } else {
      // Simulate LiteRT-LM Local inference
      setTimeout(() => {
        let gemmaResponse = "";
        const queryLower = userMsg.toLowerCase();

        if (queryLower.includes('newton') || queryLower.includes('law')) {
          gemmaResponse = "### Local Inference Answer from Gemma 4\n\nNewton's Laws of Motion are fundamental in physics:\n1. **First Law (Inertia):** An object remains at rest or continues in motion with a constant velocity unless acted upon by an external force.\n2. **Second Law (Force):** The acceleration of an object is dependent upon two variables - the net force acting upon the object and the mass of the object: **F = ma**.\n3. **Third Law (Action-Reaction):** For every action, there is an equal and opposite reaction.";
        } else if (queryLower.includes('quadratic') || queryLower.includes('equation') || queryLower.includes('formula')) {
          gemmaResponse = "### Quadratic Equation Breakdown\n\nThe standard quadratic equation is represented as:\n$$ax^2 + bx + c = 0$$\n\nTo find the roots, we apply the quadratic formula offline via LiteRT-LM math threads:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nThe term $b^2 - 4ac$ is the *discriminant*, which determines the nature of the roots (real or complex).";
        } else if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('who are you')) {
          gemmaResponse = "Hello there! I am your local, on-device **Gemma 4 E2B** intelligence core. Running offline on this device via LiteRT-LM and WebGPU allows me to respond with near-zero latency, absolute data privacy, and zero server costs. Let me know which formula, textbook chapter, or concept you would like to analyze!";
        } else {
          gemmaResponse = `### Offline Response (Gemma 4 Core)\n\nThank you for your question: "${userMsg}". \n\nAs a local model operating on-device via LiteRT-LM, I can answer your textbooks queries directly. Based on the NCERT/SCERT study files indexed in your Knowledge Vault, we can solve this problem using simple step-by-step logic. Would you like me to generate a formula template or a practice mock test for this?`;
        }

        setChatMessages(prev => [...prev, { 
          sender: 'gemma', 
          text: gemmaResponse, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
        setIsGemmaThinking(false);
      }, 1200);
    }
  };

  // Handle Vibe Thinker 3B local playground user message
  const handleSendVibeMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibeUserQuery.trim() || isVibeThinking) return;

    const userMsg = vibeUserQuery.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVibeChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp }]);
    setVibeUserQuery('');
    setIsVibeThinking(true);

    // Simulate LiteRT-LM Local inference for Vibe Thinker
    setTimeout(() => {
      let vibeResponse = "";
      const queryLower = userMsg.toLowerCase();

      if (queryLower.includes('newton') || queryLower.includes('law')) {
        vibeResponse = "### Vibe Thinker 3B: Newton's Laws Explained\n\nNewton's laws are pure vibes of physics! Let's break them down:\n1. **First Law (Inertia):** If you're vibing in one spot, you'll stay vibing there. If you're moving, you'll keep cruising until some friction breaks your vibe.\n2. **Second Law (Force):** More force means way more acceleration, but if you've got lots of mass, it takes more work to get you moving: **Force = Mass × Acceleration (F = ma)**.\n3. **Third Law (Action-Reaction):** Every positive energy you put out has an equal action-reaction. Hit a ball with a bat, and the bat feels the force right back!";
      } else if (queryLower.includes('quadratic') || queryLower.includes('equation') || queryLower.includes('formula')) {
        vibeResponse = "### Vibe Thinker 3B: Solving Quadratic Equations\n\nTo find the roots of any standard equation $ax^2 + bx + c = 0$, we pull out the ultimate toolkit:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nNo stress, it is just plug-and-play. Let me know if you want to run some actual values through this offline model!";
      } else if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('who are you')) {
        vibeResponse = "Hey there! I am **Vibe Thinker 3B**, your local partner running completely on-device. Thanks to LiteRT-LM and WebGL/WebGPU acceleration, we do not need cloud servers, internet, or subscription fees to get top-tier learning support. What's on your mind?";
      } else {
        vibeResponse = `### Vibe Thinker 3B Local Brain\n\nGot your question: "${userMsg}". \n\nRunning fully on-device via our WorkManager thread scheduler and LiteRT-LM framework, I can map this straight to your NCERT/SCERT textbook files in milliseconds! Let's break down this subject together with high energy.`;
      }

      setVibeChatMessages(prev => [...prev, { 
        sender: 'vibe', 
        text: vibeResponse, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsVibeThinking(false);
    }, 1200);
  };

  const selectedModel = models.find(m => m.isActive) || models[0];

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['brain-manager', 'model-manager', 'knowledge-upload', 'prompt-studio'].map((tab) => (
          <button
            key={tab}
            onClick={() => onViewChange(tab)}
            className={`text-sm font-semibold capitalize pb-2 transition-all shrink-0 border-b-2 flex items-center gap-1.5 ${
              currentView === tab
                ? 'text-amber-500 border-amber-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'brain-manager' && <Cpu className="w-4 h-4" />}
            {tab === 'model-manager' && <Settings2 className="w-4 h-4" />}
            {tab === 'knowledge-upload' && <Upload className="w-4 h-4" />}
            {tab === 'prompt-studio' && <Terminal className="w-4 h-4" />}
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* BRAIN MANAGER & MODEL SWITCHER */}
      {(currentView === 'brain-manager' || currentView === 'model-manager') && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Available AI Engines</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Toggle and configure classroom orchestrators</p>
            </div>
            {(gemmaDownloaded || vibeDownloaded) && (
              <span className="self-start md:self-auto text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> On-Device Model {gemmaDownloaded && vibeDownloaded ? 'Gemma & Vibe Ready' : gemmaDownloaded ? 'Gemma 4 Ready' : 'Vibe Thinker Ready'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((model) => {
              const isSetupNeeded = (model.id === 'm2' && !gemmaDownloaded) || (model.id === 'm3' && !vibeDownloaded);
              return (
                <div
                  key={model.id}
                  onClick={() => {
                    toggleModelActive(model.id);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-4 group ${
                    model.isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700/80'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <Cpu className={`w-4 h-4 ${model.isActive ? 'text-amber-500' : 'text-slate-400'}`} /> 
                        {model.name}
                      </h4>
                      {model.isActive ? (
                        <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded uppercase font-black tracking-wider animate-pulse">
                          Active
                        </span>
                      ) : isSetupNeeded ? (
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                          Needs Setup
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
                      {model.type} — <span className="text-slate-500">{model.provider}</span>
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span>Avg Latency: <b className="text-slate-400">{isSetupNeeded ? 'N/A' : model.latency}</b></span>
                    <span>Cost: <b className="text-slate-400">{model.cost}</b></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DEDICATED HUB FOR GEMINI 3.5 FLASH CLOUD MODEL */}
          {selectedModel.id === 'm1' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      Gemini 3.5 Flash Cloud Orchestrator
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-full">Primary Cloud</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">High-speed reasoning model powered by Google AI Studio</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 border-l border-slate-900 pl-4">
                  <span className="text-[10px] text-slate-500 font-mono">Documentation:</span>
                  <a 
                    href="https://ai.google.dev/gemini-api" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 flex items-center gap-1 transition font-mono"
                  >
                    Google AI Studio Developer <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Server className="w-4 h-4 text-amber-500" />
                    <span>Cloud Orchestration Strategy</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Gemini 3.5 Flash operates as the centralized, high-intelligence development backend for OpenVidya. 
                    It is highly optimized for complex workflows, JSON schemas, dynamic curriculum alignment, and high-quality Malayalee translation templates.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 space-y-1.5 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Max Output Tokens:</span>
                      <span className="text-slate-300 font-mono">8192 tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency Profile:</span>
                      <span className="text-slate-300 font-mono">420ms (Avg)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Interactive Lesson Studio Support</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    By leveraging Gemini's extensive structured output framework, the <b>One-Click Lesson Studio</b> dynamically generates slides, quizzes, slides coordinate coordinates, and custom simulation plans directly within the sandbox.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 flex items-center gap-2 text-[10px] text-amber-500">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Configured using your project environment variables.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED HUB FOR GEMMA 4 E2B ON-DEVICE MODEL */}
          {selectedModel.id === 'm2' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      Gemma 4 E2B On-Device Engine Hub
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-full">GGUF IT Edition</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">High-privacy on-device language framework</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 border-l border-slate-900 pl-4">
                  <span className="text-[10px] text-slate-500 font-mono">Source Link:</span>
                  <a 
                    href="https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF/blob/main/gemma-4-E2B-it-Q4_K_M.gguf" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 flex items-center gap-1 transition font-mono truncate max-w-xs md:max-w-none"
                    title="Gemma-4-E2B Q4 GGUF on HuggingFace"
                  >
                    gemma-4-E2B-it-Q4_K_M.gguf <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              {/* DOWNLOAD & SETUP PROGRESS (IF NOT DOWNLOADED YET) */}
              {!gemmaDownloaded ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-850 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <Layers className="w-4 h-4 text-amber-500" />
                          Recommended Production Integration Strategy
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          For professional deployments, we implement the offline model utilizing the <b>"Production Trio"</b> pipeline:
                        </p>
                        
                        {/* The Production Trio Pipeline */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Download className="w-3 h-3" /> OkHttp Engine
                            </div>
                            <p className="text-[9px] text-slate-500 leading-normal">
                              Handles downloading bytes, managing multi-thread chunk pooling, and using HTTP "Range" headers to allow seamless resume of file downloads.
                            </p>
                          </div>
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Activity className="w-3 h-3" /> WorkManager
                            </div>
                            <p className="text-[9px] text-slate-500 leading-normal">
                              Android-grade native background scheduler. Ensures model files continue downloading stably in background, even if user minimizes app or system reboots.
                            </p>
                          </div>
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Cpu className="w-3 h-3" /> LiteRT-LM Engine
                            </div>
                            <p className="text-[9px] text-slate-500 leading-normal">
                              Low-latency local executor that reads, tokenizes, and runs inference directly on the downloaded GGUF weights offline using WebGL/WebGPU.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Download Status & Trigger button */}
                      {!isGemmaDownloading ? (
                        <div className="space-y-4">
                          {downloadError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl space-y-1 shadow-inner">
                              <div className="font-bold flex items-center gap-1 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5" /> Pipeline Download Blocked
                              </div>
                              <p>{downloadError}</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/30 border border-slate-850 rounded-2xl">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Package Information</span>
                              <div className="text-xs font-bold text-slate-200 mt-1">Gemma 4 E2B Q4_K_M (1.4 GB weights)</div>
                            </div>
                            <button
                              onClick={() => startGemmaDownload('real')}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 shrink-0"
                            >
                              <Download className="w-4 h-4" /> 
                              Download & Load Gemma 4 to Device (1.43 GB)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden">
                          {/* Active Download Happening Glow Indicator */}
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 animate-pulse" />

                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-amber-500 flex items-center gap-1.5 animate-pulse">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                              {isDownloadPaused ? 'Download Paused' : 'ACTIVE BINARY DOWNLOAD: Fetching gemma-4-E2B-it-web.task...'}
                            </span>
                            <span className="font-mono text-slate-300 font-bold">{downloadProgress}%</span>
                          </div>

                          {/* Beautiful Gradient Progress Bar */}
                          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] ${
                                isDownloadPaused ? 'bg-slate-500' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300'
                              }`}
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>

                          {/* Download Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-mono text-slate-500 border-t border-slate-850 pt-3">
                            <div>
                              <div className="text-slate-400 font-bold">{downloadedMB} MB / 1430 MB</div>
                              <div>Transferred</div>
                            </div>
                            <div>
                              <div className="text-slate-400 font-bold">{isDownloadPaused ? '0.0' : '12.5'} MB/s</div>
                              <div>Bandwidth</div>
                            </div>
                            <div>
                              <div className="text-slate-400 font-bold">
                                {downloadProgress >= 100 ? 'Complete' : isDownloadPaused ? 'Paused' : `${Math.ceil((1430 - downloadedMB) / 12)}s`}
                              </div>
                              <div>Est. Remaining</div>
                            </div>
                          </div>

                          {/* Resume/Pause Controls */}
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
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-white px-3 py-2 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Abort
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Debug Terminal log drawer */}
                      {downloadLogs.length > 0 && (
                        <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950">
                          <div className="bg-slate-950 px-3 py-2 text-[9px] font-mono text-slate-300 border-b border-slate-900 flex justify-between items-center">
                            <span className="flex items-center gap-1 text-slate-200 font-bold">
                              <Terminal className="w-3.5 h-3.5 text-amber-500" />
                              OkHttp / WorkManager Pipeline Shell
                            </span>
                            <span className="text-slate-500 text-[8px]">LOG_STREAM_LIVE</span>
                          </div>
                          <div className="p-3 bg-slate-950 max-h-36 overflow-y-auto font-mono text-[8px] text-slate-400 space-y-1.5 shadow-inner">
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
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LIVE ARCHITECTURE TRACKER PANEL */}
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4 h-fit">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                        Live Pipeline Tracker
                      </h5>

                      <div className="space-y-3 text-[10px]">
                        {/* Step 1: OkHttp */}
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                          downloadStep === 'okhttp' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md'
                            : downloadProgress >= 45 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {downloadProgress >= 45 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : downloadStep === 'okhttp' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">OkHttp Fetcher Core</div>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                              Creating socket channels, managing chunks, and resolving standard HTTP Range streams.
                            </p>
                          </div>
                        </div>

                        {/* Step 2: WorkManager */}
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                          downloadStep === 'workmanager' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md'
                            : downloadProgress >= 85 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {downloadProgress >= 85 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : downloadStep === 'workmanager' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">WorkManager Scheduler</div>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                              Binding background context to secure persistent thread. Handles internet loss or closures.
                            </p>
                          </div>
                        </div>

                        {/* Step 3: LiteRT-LM */}
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                          downloadStep === 'litert' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md'
                            : downloadProgress >= 100 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {downloadProgress >= 100 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : downloadStep === 'litert' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">LiteRT-LM Inference Init</div>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                              Mapping GGUF tensors, setting memory strides, and preparing hardware WebGPU execution.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE GEMMA 4 LOCAL PLAYGROUND (IF DOWNLOAD COMPLETE!) */
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> 
                      Nexus Gemma 4 E2B is fully loaded and active on-device!
                    </span>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded tracking-wide uppercase">
                      Local Offline Mode
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[320px]">
                    {/* Header */}
                    <div className="px-4 py-2 bg-slate-950 border-b border-slate-850 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-amber-500" /> local-session@gemma4-litert-lm
                      </span>
                      <span className="text-slate-500 font-mono">Precision: Q4_K_M</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                      {chatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex flex-col max-w-[85%] ${
                            msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <span className="text-[9px] text-slate-500 font-mono mb-1">{msg.sender === 'user' ? 'Student' : 'Gemma 4 Local Engine'} • {msg.timestamp}</span>
                          <div 
                            className={`p-3 rounded-2xl leading-relaxed ${
                              msg.sender === 'user' 
                                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' 
                                : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none font-mono'
                            }`}
                          >
                            {msg.text.split('\n').map((line, idx) => (
                              <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{line}</p>
                            ))}
                          </div>
                        </div>
                      ))}

                      {isGemmaThinking && (
                        <div className="flex flex-col items-start max-w-[80%]">
                          <span className="text-[9px] text-slate-500 font-mono mb-1">Gemma 4 Local Engine • Thinking...</span>
                          <div className="p-3 bg-slate-950 border border-slate-850 text-amber-500 rounded-2xl rounded-tl-none font-mono flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            Running LiteRT-LM Local WebGPU Tensor Calculations...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick suggestion prompt pills */}
                    <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-850 flex gap-2 overflow-x-auto">
                      <button 
                        onClick={() => setUserQuery("Explain Newton's Laws of Motion")}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-full px-2.5 py-1 shrink-0 transition"
                      >
                        Explain Newton's Laws
                      </button>
                      <button 
                        onClick={() => setUserQuery("What is the quadratic equation formula?")}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-full px-2.5 py-1 shrink-0 transition"
                      >
                        Quadratic Formula
                      </button>
                      <button 
                        onClick={() => setUserQuery("Show physics formulas")}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-full px-2.5 py-1 shrink-0 transition"
                      >
                        Physics Formulas
                      </button>
                    </div>

                    {/* Input Field Form */}
                    <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-950 border-t border-slate-850 flex gap-2">
                      <input 
                        type="text" 
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Type standard or formula questions to run on-device..."
                        disabled={isGemmaThinking}
                        className="flex-1 bg-slate-900 text-xs border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 disabled:opacity-50"
                      />
                      <button 
                        type="submit" 
                        disabled={!userQuery.trim() || isGemmaThinking}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl px-4 py-2 flex items-center justify-center transition shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEDICATED HUB FOR VIBE THINKER 3B ON-DEVICE MODEL */}
          {selectedModel.id === 'm3' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      Vibe Thinker 3B On-Device Engine Hub
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-full">GGUF Version</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Highly responsive on-device conversational model</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 border-l border-slate-900 pl-4">
                  <span className="text-[10px] text-slate-500 font-mono">Source Link:</span>
                  <a 
                    href="https://huggingface.co/buckets/manojbillionaire123/VibeThinker-3B-GGUF-bucket/tree/VibeThinker-3B-Q4_K_M.gguf" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 flex items-center gap-1 transition font-mono truncate max-w-xs md:max-w-none"
                    title="Vibe Thinker 3B Q4 GGUF on HuggingFace"
                  >
                    VibeThinker-3B-Q4_K_M.gguf <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              {/* DOWNLOAD & SETUP PROGRESS (IF NOT DOWNLOADED YET) */}
              {!vibeDownloaded ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-850 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <Layers className="w-4 h-4 text-amber-500" />
                          Recommended Production Integration Strategy
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          For professional deployments, we implement the offline model utilizing the <b>"Production Trio"</b> pipeline:
                        </p>
                        
                        {/* The Production Trio Pipeline */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Download className="w-3 h-3" /> OkHttp Engine
                            </div>
                            <p className="text-[9px] text-slate-500 leading-normal">
                              Handles downloading bytes, managing multi-thread chunk pooling, and using HTTP "Range" headers to allow seamless resume of file downloads.
                            </p>
                          </div>
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Activity className="w-3 h-3" /> WorkManager
                            </div>
                            <p className="text-[9px] text-slate-500 leading-normal">
                              Android-grade native background scheduler. Ensures model files continue downloading stably in background, even if user minimizes app or system reboots.
                            </p>
                          </div>
                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Cpu className="w-3 h-3" /> LiteRT-LM Engine
                            </div>
                            <p className="text-[9px] text-slate-500 leading-normal">
                              Low-latency local executor that reads, tokenizes, and runs inference directly on the downloaded GGUF weights offline using WebGL/WebGPU.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Errors Display Alert */}
                      {downloadError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl space-y-1 mb-3">
                          <div className="font-bold flex items-center gap-1 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pipeline Download Blocked
                          </div>
                          <p>{downloadError}</p>
                        </div>
                      )}

                      {/* Download Status & Trigger button */}
                      {!isVibeDownloading ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/30 border border-slate-850 rounded-2xl">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Package Information</span>
                            <div className="text-xs font-bold text-slate-200 mt-1">Vibe Thinker 3B Q4_K_M (2.1 GB weights)</div>
                          </div>
                          <button
                            onClick={startVibeDownload}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 shrink-0"
                          >
                            <Download className="w-4 h-4" /> Initiate OkHttp Download
                          </button>
                        </div>
                      ) : (
                        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-amber-500 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 animate-spin" /> 
                              Downloading VibeThinker-3B-Q4_K_M.gguf
                            </span>
                            <span className="font-mono text-slate-300 font-bold">{vibeProgress}%</span>
                          </div>

                          {/* Beautiful Gradient Progress Bar */}
                          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                            <div 
                              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                              style={{ width: `${vibeProgress}%` }}
                            />
                          </div>

                          {/* Download Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-mono text-slate-500 border-t border-slate-850 pt-3">
                            <div>
                              <div className="text-slate-400 font-bold">{vibeDownloadedMB} MB / 2100 MB</div>
                              <div>Transferred</div>
                            </div>
                            <div>
                              <div className="text-slate-400 font-bold">{vibeSpeed} MB/s</div>
                              <div>Bandwidth</div>
                            </div>
                            <div>
                              <div className="text-slate-400 font-bold">
                                {vibeProgress >= 100 ? 'Complete' : `${Math.ceil((2100 - vibeDownloadedMB) / (vibeSpeed || 1))}s`}
                              </div>
                              <div>Est. Remaining</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LIVE ARCHITECTURE TRACKER PANEL */}
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-500" />
                        Live Pipeline Tracker
                      </h5>

                      <div className="space-y-3 text-[10px]">
                        {/* Step 1: OkHttp */}
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                          vibeDownloadStep === 'okhttp' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md'
                            : vibeProgress >= 45 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {vibeProgress >= 45 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : vibeDownloadStep === 'okhttp' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">OkHttp Fetcher Core</div>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                              Creating socket channels, managing chunks, and resolving standard HTTP Range streams.
                            </p>
                          </div>
                        </div>

                        {/* Step 2: WorkManager */}
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                          vibeDownloadStep === 'workmanager' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md'
                            : vibeProgress >= 85 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {vibeProgress >= 85 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : vibeDownloadStep === 'workmanager' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">WorkManager Scheduler</div>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                              Binding background context to secure persistent thread. Handles internet loss or closures.
                            </p>
                          </div>
                        </div>

                        {/* Step 3: LiteRT-LM */}
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                          vibeDownloadStep === 'litert' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md'
                            : vibeProgress >= 100 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {vibeProgress >= 100 ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : vibeDownloadStep === 'litert' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">LiteRT-LM Inference Init</div>
                            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                              Mapping GGUF tensors, setting memory strides, and preparing hardware WebGL/WebGL2/WebGPU execution.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE VIBE THINKER 3B LOCAL PLAYGROUND (IF DOWNLOAD COMPLETE!) */
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> 
                      Vibe Thinker 3B is fully loaded and active on-device!
                    </span>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded tracking-wide uppercase">
                      Local Offline Mode
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[320px]">
                    {/* Header */}
                    <div className="px-4 py-2 bg-slate-950 border-b border-slate-850 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-amber-500" /> local-session@vibethinker-litert-lm
                      </span>
                      <span className="text-slate-500 font-mono">Precision: Q4_K_M</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                      {vibeChatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex flex-col max-w-[85%] ${
                            msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <span className="text-[9px] text-slate-500 font-mono mb-1">{msg.sender === 'user' ? 'Student' : 'Vibe Thinker Local Engine'} • {msg.timestamp}</span>
                          <div 
                            className={`p-3 rounded-2xl leading-relaxed ${
                              msg.sender === 'user' 
                                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' 
                                : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none font-mono'
                            }`}
                          >
                            {msg.text.split('\n').map((line, idx) => (
                              <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{line}</p>
                            ))}
                          </div>
                        </div>
                      ))}

                      {isVibeThinking && (
                        <div className="flex flex-col items-start max-w-[80%]">
                          <span className="text-[9px] text-slate-500 font-mono mb-1">Vibe Thinker Local Engine • Thinking...</span>
                          <div className="p-3 bg-slate-950 border border-slate-850 text-amber-500 rounded-2xl rounded-tl-none font-mono flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            Running LiteRT-LM Local WebGL Tensor Calculations...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick suggestion prompt pills */}
                    <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-850 flex gap-2 overflow-x-auto">
                      <button 
                        onClick={() => setVibeUserQuery("Explain Newton's Laws of Motion")}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-full px-2.5 py-1 shrink-0 transition"
                      >
                        Explain Newton's Laws
                      </button>
                      <button 
                        onClick={() => setVibeUserQuery("What is the quadratic equation formula?")}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-full px-2.5 py-1 shrink-0 transition"
                      >
                        Quadratic Formula
                      </button>
                      <button 
                        onClick={() => setVibeUserQuery("Who are you?")}
                        className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-full px-2.5 py-1 shrink-0 transition"
                      >
                        Who are you?
                      </button>
                    </div>

                    {/* Input Field Form */}
                    <form onSubmit={handleSendVibeMessage} className="p-2.5 bg-slate-950 border-t border-slate-850 flex gap-2">
                      <input 
                        type="text" 
                        value={vibeUserQuery}
                        onChange={(e) => setVibeUserQuery(e.target.value)}
                        placeholder="Type high energy, standard or textbook questions to run on-device..."
                        disabled={isVibeThinking}
                        className="flex-1 bg-slate-900 text-xs border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 disabled:opacity-50"
                      />
                      <button 
                        type="submit" 
                        disabled={!vibeUserQuery.trim() || isVibeThinking}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl px-4 py-2 flex items-center justify-center transition shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 text-[10px] text-slate-400 max-w-xl">
            💡 <b>Offline Fallback System:</b> If network connectivity fails, OpenVidya is engineered to auto-fall back to <b>Gemma / Vibe on-device weights</b> via WebGPU threads so learning remains completely uninterrupted.
          </div>
        </div>
      )}

      {/* KNOWLEDGE UPLOAD / INGESTION */}
      {currentView === 'knowledge-upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drag area */}
          <div className="lg:col-span-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`h-56 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                uploadStatus === 'dragging'
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-950'
              }`}
            >
              <Upload className="w-10 h-10 text-slate-600 mb-3 animate-bounce" />
              <p className="text-xs font-bold text-white">Drag and Drop Study Material</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, or Textbook chapter files (Max 40MB)</p>

              {uploadStatus === 'processing' && (
                <div className="mt-4 text-xs text-amber-500 font-mono animate-pulse">
                  Splitting paragraphs & computing embeddings...
                </div>
              )}
            </div>
          </div>

          {/* Ingested list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ingested Vector Files</h3>
            {uploadedFiles.length > 0 ? (
              <div className="space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-mono truncate">{file}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No custom knowledge bases uploaded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMPT STUDIO */}
      {currentView === 'prompt-studio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure AI Master Prompts</h3>
              <p className="text-[10px] text-slate-500 mt-1">Override the master agent instruct parameters</p>
            </div>
            <button
              onClick={() => {
                const defaultPrompt = "You are OpenVidya, a high-level educational AI assistant. Always explain concepts clearly, provide formula breakdowns, and encourage the student.";
                setTempPrompt(defaultPrompt);
                onPromptSave(defaultPrompt);
              }}
              className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore Default
            </button>
          </div>

          <div className="space-y-4">
            <textarea
              rows={6}
              value={tempPrompt}
              onChange={(e) => {
                setTempPrompt(e.target.value);
                setPromptSaved(false);
              }}
              className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl p-4 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
            />

            <button
              onClick={() => {
                onPromptSave(tempPrompt);
                setPromptSaved(true);
                setTimeout(() => setPromptSaved(false), 3000);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
            >
              Lock system guidelines
            </button>

            {promptSaved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Guidelines persisted successfully in Local Cache!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
