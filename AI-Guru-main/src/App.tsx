import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MicrophoneCameraPanel } from './components/MicrophoneCameraPanel';
import { LearningPortal } from './components/LearningPortal';
import { KnowledgePortal } from './components/KnowledgePortal';
import { ExamPortal } from './components/ExamPortal';
import { VoicePortal } from './components/VoicePortal';
import { TeacherPortal } from './components/TeacherPortal';
import { ParentPortal } from './components/ParentPortal';
import { AIBrainPortal } from './components/AIBrainPortal';
import { SystemPortal } from './components/SystemPortal';
import { RegistrationForm } from './components/RegistrationForm';
import { ConnectionStatus, PortalType, RoleType } from './types';
import { GoogleGenAI } from '@google/genai';
import { litertEngine } from './lib/litert';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Navigation states
  const [activePortal, setActivePortal] = useState<PortalType>('learning');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [subViews, setSubViews] = useState<Record<PortalType, string>>({
    learning: 'dashboard',
    knowledge: 'ncert-library',
    exam: 'exam-dojo',
    voice: 'teacher-narration',
    teacher: 'teacher-dashboard',
    parent: 'parent-dashboard',
    brain: 'brain-manager',
    system: 'profile'
  });

  // Localization & Persona States
  const [language, setLanguage] = useState<'English' | 'Malayalam'>('English');
  const [userRole, setUserRole] = useState<RoleType>('student');

  // Connection State
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTED);

  // Mic / Volume States
  const [micVolume, setMicVolume] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Custom prompt guidelines
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a skilled math teacher at OpenVidya. Your goal is to explain mathematical concepts to students. First read the text or problem, then explain it clearly in Malayalam, while using English for technical terms or when necessary. Provide formula breakdowns and encourage the student."
  );

  // AI Models Config State (Elevated)
  const [models, setModels] = useState([
    { id: 'm1', name: 'Gemini 3.5 Flash (Cloud)', type: 'Primary cloud model', provider: 'Google Cloud Platform', cost: '$0.000075 / 1K tokens', latency: '420ms', isActive: true, downloaded: true },
    { id: 'm2', name: 'Gemma 4 E2B (Local LiteRT)', type: 'Local lightweight model', provider: 'Offline local browser worker', cost: 'Free / On-Device', latency: '120ms', isActive: false, downloaded: false },
    { id: 'm3', name: 'VibeThinker 3B (Local LiteRT)', type: 'Advanced local reasoning model', provider: 'Offline local browser worker', cost: 'Free / On-Device', latency: '210ms', isActive: false, downloaded: false }
  ]);

  // Real LiteRT Gemma 4 Model Loading States
  const [isGemmaDownloading, setIsGemmaDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(1430);
  const [gemmaDownloaded, setGemmaDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadMode, setDownloadMode] = useState<'real' | 'simulated'>('real');
  const [isDownloadPaused, setIsDownloadPaused] = useState(false);
  const [downloadLogs, setDownloadLogs] = useState<string[]>([]);
  const [customModelUrl, setCustomModelUrl] = useState<string>('');

  // Check if model is already loaded in the engine on mount and hook log listener
  useEffect(() => {
    if (litertEngine.isLoaded()) {
      setGemmaDownloaded(true);
      setModels(prev => prev.map(m => (m.id === 'm2' || m.id === 'm3') ? { ...m, downloaded: true } : m));
    }

    litertEngine.setLogListener((log) => {
      setDownloadLogs(prev => [...prev, log]);
    });
  }, []);

  const loadGemmaModel = async (modeOverride?: 'real' | 'simulated', targetModelIdOverride?: string) => {
    if (isGemmaDownloading && !isDownloadPaused) return;

    const activeModel = models.find(m => m.isActive) || models[0];
    const targetModelId = targetModelIdOverride || ((activeModel.id === 'm2' || activeModel.id === 'm3') ? activeModel.id : 'm2');

    // Select the downloading model as active
    setModels(prev => prev.map(m => m.id === targetModelId ? { ...m, isActive: true } : { ...m, isActive: false }));

    setDownloadError(null);
    setIsDownloadPaused(false);
    setIsGemmaDownloading(true);

    try {
      await litertEngine.loadModel(
        (progress, loaded, total) => {
          setDownloadProgress(progress);
          setDownloadedMB(loaded);
          if (total > 0) setTotalMB(total);
        },
        () => {
          setGemmaDownloaded(true);
          setModels(prev => prev.map(m => m.id === targetModelId ? { ...m, downloaded: true, isActive: true } : { ...m, isActive: false }));
          setIsGemmaDownloading(false);
        },
        (errorMsg) => {
          setDownloadError(errorMsg);
          setIsGemmaDownloading(false);
        },
        customModelUrl || undefined,
        targetModelId
      );
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDownloadError(errorMsg);
      setIsGemmaDownloading(false);
    }
  };

  const handlePauseDownload = () => {
    litertEngine.pauseDownload();
    setIsDownloadPaused(true);
  };

  const handleResumeDownload = () => {
    setIsDownloadPaused(false);
    const activeModel = models.find(m => m.isActive) || models[0];
    const targetModelId = (activeModel.id === 'm2' || activeModel.id === 'm3') ? activeModel.id : 'm2';

    litertEngine.resumeDownload(
      (progress, loaded, total) => {
        setDownloadProgress(progress);
        setDownloadedMB(loaded);
        if (total > 0) setTotalMB(total);
      },
      () => {
        setGemmaDownloaded(true);
        setModels(prev => prev.map(m => m.id === targetModelId ? { ...m, downloaded: true, isActive: true } : { ...m, isActive: false }));
        setIsGemmaDownloading(false);
      },
      (errorMsg) => {
        setDownloadError(errorMsg);
        setIsGemmaDownloading(false);
      },
      customModelUrl || undefined
    );
  };

  const handleCancelOrResetDownload = () => {
    litertEngine.unload();
    setGemmaDownloaded(false);
    setDownloadProgress(0);
    setDownloadedMB(0);
    setDownloadError(null);
    setIsGemmaDownloading(false);
    setIsDownloadPaused(false);
    setDownloadLogs([]);
    setModels(prev => prev.map((m, idx) => ({ ...m, downloaded: m.id === 'm1' ? true : false, isActive: idx === 0 })));
  };

  // Initialize client if API Key exists
  const [genAI, setGenAI] = useState<GoogleGenAI | null>(null);

  useEffect(() => {
    // process.env.API_KEY is replaced during build with GEMINI_API_KEY
    const apiKey = (process.env as any).API_KEY || '';
    if (apiKey) {
      try {
        const client = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
        setGenAI(client);
        setStatus(ConnectionStatus.CONNECTED);
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
        setStatus(ConnectionStatus.ERROR);
      }
    } else {
      // Offline fallback indicator
      setStatus(ConnectionStatus.DISCONNECTED);
    }
  }, []);

  // Update active subview within active portal
  const handleSubViewChange = (view: string) => {
    setSubViews(prev => ({
      ...prev,
      [activePortal]: view
    }));
  };

  const triggerAIResponse = async (
    prompt: string,
    speaker: string,
    callback: (res: string) => void
  ) => {
    setIsThinking(true);
    const activeModel = models.find(m => m.isActive) || models[0];

    // Case 1: Active model is Gemma 4 Local or VibeThinker 3B and it is loaded!
    if (activeModel.id === 'm2' || activeModel.id === 'm3') {
      if (activeModel.downloaded) {
        try {
          console.log('Running real local LiteRT inference...');
          const response = await litertEngine.generate(prompt);
          setIsThinking(false);
          const formattedResponse = `*(Answered by ${activeModel.name})*\n\n${response}`;
          callback(formattedResponse);
          speakOutput(response);
          return;
        } catch (err: any) {
          console.error('Local LiteRT inference failed:', err);
          setIsThinking(false);
          const errorMsg = `On-device inference execution encountered an issue: ${err?.message || String(err)}. Please ensure your device supports WebGPU/WebGL acceleration.`;
          callback(`*(Local Model Error)*\n\n${errorMsg}`);
          speakOutput(errorMsg);
          return;
        }
      } else {
        setIsThinking(false);
        const warnText = `${activeModel.name} is currently selected but not yet loaded. Please go to 'Student Settings' or 'AI Brain Portal' to download and load the model on-device.`;
        callback(`*(System Alert)*\n\n${warnText}`);
        speakOutput(warnText);
        return;
      }
    }

    // Case 2: Active model is Gemini 3.5 Flash (Cloud)
    if (activeModel.id === 'm1') {
      if (!genAI) {
        setIsThinking(false);
        const warnText = "Gemini Cloud API is selected but no valid API Key is detected or configured. Please configure your GEMINI_API_KEY environment variable, or select a local model ('Gemma 4 E2B' or 'VibeThinker 3B') and download it for fully offline use.";
        callback(`*(System Alert)*\n\n${warnText}`);
        speakOutput(warnText);
        return;
      }
      try {
        console.log('Running Gemini Cloud inference...');
        const response = await genAI.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt
          }
        });
        
        setIsThinking(false);
        if (response.text) {
          const formattedResponse = `*(Answered by ${activeModel.name})*\n\n${response.text}`;
          callback(formattedResponse);
          speakOutput(response.text);
        } else {
          callback(`*(Answered by ${activeModel.name})*\n\nI processed your request but received no output.`);
        }
        return;
      } catch (err: any) {
        console.error('Gemini cloud query failed:', err);
        setIsThinking(false);
        const errorMsg = `Cloud inference execution encountered an issue: ${err?.message || String(err)}. Please check your network or ensure your GEMINI_API_KEY is correctly configured.`;
        callback(`*(Cloud Model Error)*\n\n${errorMsg}`);
        speakOutput(errorMsg);
        return;
      }
    }
  };

  // Speaks response using Web Speech Synthesis
  const speakOutput = (text: string) => {
    window.speechSynthesis.cancel();
    // Clean markdown before reading
    const cleanText = text.replace(/[#*`_\[\]()]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'Malayalam' ? 'ml-IN' : 'en-US';
    
    utterance.onstart = () => setIsModelSpeaking(true);
    utterance.onend = () => setIsModelSpeaking(false);
    utterance.onerror = () => setIsModelSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {!isLoggedIn ? (
        <RegistrationForm onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
          
          {/* 8-Portal Left Navigation rail */}
          <Sidebar 
            currentPortal={activePortal} 
            onPortalChange={(portal) => setActivePortal(portal)} 
          />

          {/* Main layout container */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            
            {/* Top Header */}
            <Header 
              status={status} 
              userRole={userRole} 
              language={language} 
              models={models}
              onModelSelect={(id) => {
                setModels(prev => prev.map(m => m.id === id ? { ...m, isActive: true } : { ...m, isActive: false }));
              }}
            />

            {/* Content canvas */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* Render active portal */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 md:p-6 min-h-[400px]">
                {activePortal === 'learning' && (
                  <LearningPortal
                    currentView={subViews.learning}
                    onViewChange={handleSubViewChange}
                    micVolume={micVolume}
                    aiResponseTrigger={triggerAIResponse}
                    isThinking={isThinking}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                    isGemmaDownloading={isGemmaDownloading}
                    downloadProgress={downloadProgress}
                    downloadedMB={downloadedMB}
                    totalMB={totalMB}
                    gemmaDownloaded={gemmaDownloaded}
                    loadGemmaModel={loadGemmaModel}
                    models={models}
                    setModels={setModels}
                    downloadError={downloadError}
                    downloadMode={downloadMode}
                    setDownloadMode={setDownloadMode}
                    isDownloadPaused={isDownloadPaused}
                    handlePauseDownload={handlePauseDownload}
                    handleResumeDownload={handleResumeDownload}
                    handleCancelOrResetDownload={handleCancelOrResetDownload}
                    downloadLogs={downloadLogs}
                    customModelUrl={customModelUrl}
                    setCustomModelUrl={setCustomModelUrl}
                  />
                )}

                {activePortal === 'knowledge' && (
                  <KnowledgePortal
                    currentView={subViews.knowledge}
                    onViewChange={handleSubViewChange}
                    aiResponseTrigger={triggerAIResponse}
                    isThinking={isThinking}
                  />
                )}

                {activePortal === 'exam' && (
                  <ExamPortal
                    currentView={subViews.exam}
                    onViewChange={handleSubViewChange}
                    aiResponseTrigger={triggerAIResponse}
                    isThinking={isThinking}
                  />
                )}

                {activePortal === 'voice' && (
                  <VoicePortal
                    currentView={subViews.voice}
                    onViewChange={handleSubViewChange}
                    micVolume={micVolume}
                  />
                )}

                {activePortal === 'teacher' && (
                  <TeacherPortal
                    currentView={subViews.teacher}
                    onViewChange={handleSubViewChange}
                    aiResponseTrigger={triggerAIResponse}
                    isThinking={isThinking}
                  />
                )}

                {activePortal === 'parent' && (
                  <ParentPortal
                    currentView={subViews.parent}
                    onViewChange={handleSubViewChange}
                  />
                )}

                {activePortal === 'brain' && (
                  <AIBrainPortal
                    currentView={subViews.brain}
                    onViewChange={handleSubViewChange}
                    systemPrompt={systemPrompt}
                    onPromptSave={(newPrompt) => setSystemPrompt(newPrompt)}
                    models={models}
                    setModels={setModels}
                    isGemmaDownloading={isGemmaDownloading}
                    downloadProgress={downloadProgress}
                    downloadedMB={downloadedMB}
                    totalMB={totalMB}
                    gemmaDownloaded={gemmaDownloaded}
                    loadGemmaModel={loadGemmaModel}
                    downloadError={downloadError}
                    downloadMode={downloadMode}
                    setDownloadMode={setDownloadMode}
                    isDownloadPaused={isDownloadPaused}
                    handlePauseDownload={handlePauseDownload}
                    handleResumeDownload={handleResumeDownload}
                    handleCancelOrResetDownload={handleCancelOrResetDownload}
                    downloadLogs={downloadLogs}
                    customModelUrl={customModelUrl}
                    setCustomModelUrl={setCustomModelUrl}
                  />
                )}

                {activePortal === 'system' && (
                  <SystemPortal
                    currentView={subViews.system}
                    onViewChange={handleSubViewChange}
                    language={language}
                    onLanguageChange={(lang) => setLanguage(lang)}
                    userRole={userRole}
                    onRoleChange={(role) => setUserRole(role)}
                  />
                )}
              </div>

            </div>

          </div>

          {/* Microphone & Camera controls - Positioned at the viewport root to prevent clipping or layout scrolling issues! */}
          <MicrophoneCameraPanel 
            onVolumeChange={(vol) => setMicVolume(vol)}
            isModelSpeaking={isModelSpeaking}
            isThinking={isThinking}
            onRaiseHand={() => setIsHandRaised(!isHandRaised)}
            isHandRaised={isHandRaised}
            triggerAIResponse={triggerAIResponse}
          />

        </div>
      )}
    </>
  );
}
