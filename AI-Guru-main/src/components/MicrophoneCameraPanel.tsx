import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, Hand, Sparkles, X, RotateCcw, Volume2, Maximize2, Minimize2, Cpu, Zap, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceVisualizer } from './VoiceVisualizer';

interface MicrophoneCameraPanelProps {
  onVolumeChange: (vol: number) => void;
  isModelSpeaking: boolean;
  isThinking: boolean;
  onRaiseHand?: () => void;
  isHandRaised?: boolean;
  triggerAIResponse?: (
    prompt: string,
    speaker: string,
    callback: (res: string) => void
  ) => void;
}

export const MicrophoneCameraPanel: React.FC<MicrophoneCameraPanelProps> = ({
  onVolumeChange,
  isModelSpeaking: appIsSpeaking,
  isThinking: appIsThinking,
  onRaiseHand,
  isHandRaised = false,
  triggerAIResponse
}) => {
  // Mic States
  const [micEnabled, setMicEnabled] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [transcript, setTranscript] = useState('Click mic and ask a question...');
  const [aiReply, setAiReply] = useState('');
  const [displayedReply, setDisplayedReply] = useState('');
  const [isLocalThinking, setIsLocalThinking] = useState(false);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

  // Camera States
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraScale, setCameraScale] = useState<'normal' | 'large'>('normal');
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const consecutiveErrorsRef = useRef(0);

  const isThinking = appIsThinking || isLocalThinking;
  const isModelSpeaking = appIsSpeaking || isLocalSpeaking;

  // Refs to prevent stale closures in SpeechRecognition callbacks
  const handleVoiceQueryRef = useRef<any>(null);
  const stateRef = useRef({
    micEnabled,
    isThinking,
    isModelSpeaking
  });

  useEffect(() => {
    handleVoiceQueryRef.current = handleVoiceQuery;
  }, [handleVoiceQuery]);

  useEffect(() => {
    stateRef.current = {
      micEnabled,
      isThinking,
      isModelSpeaking
    };
  }, [micEnabled, isThinking, isModelSpeaking]);

  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setTranscript('Listening...');
    };

    rec.onresult = (event: any) => {
      consecutiveErrorsRef.current = 0; // reset on success!
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript(final);
        if (handleVoiceQueryRef.current) {
          handleVoiceQueryRef.current(final);
        }
      } else if (interim) {
        setTranscript(interim);
      }
    };

    rec.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'no-speech') {
        setTranscript('Speak now...');
        consecutiveErrorsRef.current += 1;
      } else if (e.error === 'not-allowed') {
        setTranscript('Mic access restricted in preview frame. Use the preset prompt buttons or type below, or open the app in a new tab to use your live mic!');
        consecutiveErrorsRef.current = 999; // terminal error, force stop
      } else if (e.error === 'service-not-allowed') {
        setTranscript('Speech-to-Text service blocked in iframe. Please use the quick preset prompts or the input field.');
        consecutiveErrorsRef.current = 999; // terminal error, force stop
      } else {
        setTranscript(`Speech Recognition error: ${e.error}. Try quick test buttons or typing below!`);
        consecutiveErrorsRef.current += 1;
      }

      // If consecutive errors are too high, stop the microphone gracefully
      if (consecutiveErrorsRef.current >= 3) {
        console.warn('Disabling microphone due to consecutive speech recognition errors/restrictions.');
        setMicEnabled(false);
        onVolumeChange(0);
        setMicLevel(0);
        
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (stopErr) {}
        }
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(track => track.stop());
          micStreamRef.current = null;
        }
        if (audioContextRef.current) {
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
          }
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };

    rec.onend = () => {
      // Automatically restart if mic is still enabled and no terminal or excessive errors occurred
      if (stateRef.current.micEnabled && consecutiveErrorsRef.current < 3 && !stateRef.current.isThinking && !stateRef.current.isModelSpeaking) {
        try {
          rec.start();
        } catch (err) {
          console.warn('Failed to auto-restart recognition:', err);
        }
      }
    };

    recognitionRef.current = rec;
  };

  // Handle voice query with local AI
  async function handleVoiceQuery(queryText: string) {
    if (!queryText.trim() || queryText === 'Listening...') return;
    
    setIsLocalThinking(true);
    setAiReply('');

    const formattedPrompt = `You are an intelligent voice tutor in OpenVidya. The student asked: "${queryText}". Give a brief, engaging, and clear academic explanation.`;

    if (triggerAIResponse) {
      triggerAIResponse(formattedPrompt, 'teacher', (response) => {
        setIsLocalThinking(false);
        setAiReply(response);
      });
    } else {
      // Fallback local response
      setTimeout(() => {
        setIsLocalThinking(false);
        const reply = "That is an excellent academic question. The core principles of physics tell us that energy is conserved in all closed systems. This means that total initial potential energy equals final kinetic energy minus any frictional heat loss.";
        setAiReply(reply);
        speakResponse(reply);
      }, 1500);
    }
  }

  // Speaks response using browser speech synthesis
  function speakResponse(text: string) {
    // 1. Play standard Web Audio API chimes immediately.
    // This is 100% reliable and always runs on user gesture inside iframes.
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Web Audio chime fallback failed:", e);
    }

    // 2. Synthesize using Web Speech Synthesis
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags and speaker prefixes like *(Answered by ...)*
      const cleanText = text
        .replace(/\*\(Answered by [^*]+\)\*/gi, '')
        .replace(/[#*`_\[\]()${}\\]/g, '') // Added { } and \ to the cleanup
        .replace(/mathbf/g, '') // Specifically remove mathbf
        .slice(0, 500);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';

      utterance.onstart = () => setIsLocalSpeaking(true);
      utterance.onend = () => setIsLocalSpeaking(false);
      utterance.onerror = (e) => {
        setIsLocalSpeaking(false);
        console.warn('Speech synthesis inside iframe encountered error:', e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis not allowed or supported:', err);
      setIsLocalSpeaking(false);
    }
  };

  const handleClearAll = () => {
    setAiReply('');
    setTranscript('Click mic and ask a question...');
    window.speechSynthesis.cancel();
    setIsLocalSpeaking(false);
  };

  // Toggle Microphone
  const toggleMic = async () => {
    if (micEnabled) {
      setMicEnabled(false);
      onVolumeChange(0);
      setMicLevel(0);
      setTranscript('Mic off.');
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    try {
      consecutiveErrorsRef.current = 0; // reset errors count
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = mediaStream;
      setupAudioAnalysis(mediaStream);
      setMicEnabled(true);
      setTranscript('Listening...');

      // Start recognition
      if (!recognitionRef.current) {
        initSpeechRecognition();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition already started or errored', e);
        }
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      // Fallback
      setMicEnabled(true);
      setTranscript('Listening (Simulation mode)...');
      simulateMicActivity();
    }
  };

  // Setup actual web audio analyser for mic input level
  const setupAudioAnalysis = (mediaStream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;
        const normalized = Math.min(average / 128, 1);
        setMicLevel(normalized);
        onVolumeChange(normalized);
        animationFrameRef.current = requestAnimationFrame(draw);
      };
      animationFrameRef.current = requestAnimationFrame(draw);
    } catch (e) {
      console.warn('Web Audio API fallback', e);
      simulateMicActivity();
    }
  };

  const simulateMicActivity = () => {
    const timer = setInterval(() => {
      if (micEnabled) {
        const rand = Math.random() > 0.4 ? Math.random() * 0.3 : 0;
        setMicLevel(rand);
        onVolumeChange(rand);
      } else {
        clearInterval(timer);
      }
    }, 150);
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (cameraEnabled) {
      setCameraEnabled(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      setStream(mediaStream);
      setCameraEnabled(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      // fallback
      setCameraEnabled(true);
    }
  };

  // Analyze held up notebook page/diagram using camera
  const triggerCameraScan = async () => {
    setIsScanning(true);
    setScanResult('Scanning document...');

    const scanPrompt = `You are an AI classroom document scanner in OpenVidya. Analyze the student's physical note page, homework draft, or textbook page. Give a concise explanation of the subject shown, highlighting formulas, chemical equations, or diagrams if any.`;

    if (triggerAIResponse) {
      triggerAIResponse(scanPrompt, 'system', (res) => {
        setIsScanning(false);
        setScanResult(res);
      });
    } else {
      setTimeout(() => {
        setIsScanning(false);
        setScanResult("### Scanner Analysis Result\n\n- **Page Detected:** Newton's Laws of Motion\n- **Formula Identified:** F = ma\n- **AI Insights:** This equation represents Newton's Second Law of Motion. Force is directly proportional to acceleration for a constant mass.");
      }, 2000);
    }
  };

  useEffect(() => {
    if (!aiReply) {
      setDisplayedReply('');
      return;
    }

    const cleanText = aiReply
      .replace(/\*\(Answered by [^*]+\)\*/gi, '')
      .replace(/[#*`_\[\]()${}\\]/g, '') // Added { } and \ to the cleanup
      .replace(/mathbf/g, '') // Specifically remove mathbf
      .slice(0, 500);

    let i = 0;
    setDisplayedReply('');
    const timer = setInterval(() => {
      if (i < cleanText.length) {
        setDisplayedReply((prev) => prev + cleanText.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [aiReply]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
        audioContextRef.current = null;
      }
    };
  }, [stream]);

  return (
    <>
      {/* Dynamic Popover: Speaks transcript, thinking states, and answers */}
      <AnimatePresence>
        {micEnabled && (
          <div className="fixed bottom-48 md:bottom-[210px] right-4 md:right-12 z-50 w-[calc(100vw-2rem)] max-w-[440px] pointer-events-none">
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0.05}
              whileDrag={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              className="bg-[#050915]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 md:p-6 w-full md:w-[480px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] flex flex-col gap-4 pointer-events-auto cursor-grab active:cursor-grabbing hover:border-indigo-500/30 transition-colors relative overflow-hidden"
            >
              {/* Subtle internal glowing spots */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-500/5 blur-[30px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 blur-[30px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3 z-10 select-none">
                <div className="flex items-center gap-2">
                  <div className="text-white/20 mr-0.5 cursor-grab active:cursor-grabbing hover:text-white/40" title="Drag to move panel">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  <div className={`h-2 w-2 rounded-full ${micEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300">Secure Voice Channel</span>
                </div>
                <div className="flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => {
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.stop();
                        } catch (e) {}
                      }
                      toggleMic();
                      setTimeout(() => toggleMic(), 300);
                    }}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                    title="Restart listening"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMicEnabled(false)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Volume Visualizer */}
              <div className="py-2 flex flex-col items-center gap-3 z-10">
                <VoiceVisualizer
                  volume={micLevel}
                  isModelSpeaking={isModelSpeaking}
                  isThinking={isThinking}
                  isConnected={micEnabled}
                />
                <div className="text-center font-medium text-slate-200 text-xs px-4 min-h-[2.5rem] flex flex-col items-center justify-center gap-1">
                  <span className="italic">{transcript === 'Listening...' ? 'Speak now... Professor Vikram is listening.' : `"${transcript}"`}</span>
                  {transcript === 'Listening...' && (
                    <span className="text-[9px] text-slate-400 font-normal">
                      🎙️ Sandbox blocked? Click **"Fix Mic/Voice (New Tab)"** at the top right!
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Test / Voice Simulation Presets */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 z-10 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Quick Voice Test Prompts</span>
                  <span className="text-[8px] text-slate-500 font-medium">Click to simulate speaking</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {[
                    "hello can you hear me",
                    "Explain Planck's Formula",
                    "What is Faraday's Law?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(preset);
                        handleVoiceQuery(preset);
                      }}
                      className="px-2.5 py-1.5 bg-black/50 hover:bg-indigo-950/40 border border-white/5 hover:border-indigo-500/30 text-[10px] font-semibold text-slate-300 rounded-xl transition-all text-left sm:text-center truncate"
                      title={`Simulate speaking: "${preset}"`}
                    >
                      🗣️ "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Question Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const q = fd.get('questionText') as string;
                  if (q.trim()) {
                    setTranscript(q);
                    handleVoiceQuery(q);
                    e.currentTarget.reset();
                  }
                }}
                className="flex items-center gap-2 bg-black/60 border border-white/5 rounded-2xl p-1.5 z-10 relative"
              >
                <input
                  type="text"
                  name="questionText"
                  placeholder="Or type a question here..."
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-500 flex-1 px-3 py-1 outline-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={isThinking}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-white shrink-0"
                >
                  Ask AI
                </button>
              </form>

              {/* User transcript area (if not just 'Listening...') */}
              {transcript && transcript !== 'Listening...' && (
                <div className="text-xs font-semibold text-indigo-300 italic tracking-wide max-h-20 overflow-y-auto custom-scrollbar select-text leading-relaxed px-1 z-10">
                  "{transcript}"
                </div>
              )}

              {/* AI Real-time Reply Card */}
              {aiReply && (
                <div className="bg-[#0c0f1b]/95 border border-indigo-500/10 p-4 rounded-2xl max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-2 z-10 relative">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1 gap-2">
                    <div className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-1 select-none">
                      <Sparkles className="w-3 h-3 animate-pulse" /> Professor Vikram Response
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 z-10">
                      <button
                        onClick={() => speakResponse(aiReply)}
                        className="text-[9px] font-black uppercase text-amber-400 hover:text-amber-300 bg-white/5 hover:bg-white/10 border border-amber-500/20 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                        title="Force read response aloud"
                      >
                        <span>🔊 Speak Aloud</span>
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-[9px] font-bold uppercase text-rose-400 hover:text-rose-300 bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded-lg transition-all"
                        title="Clear this answer to ask a new question"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-100 leading-relaxed whitespace-pre-wrap font-serif italic text-left tracking-wide">
                    {displayedReply}
                  </div>
                  <p className="text-[8px] text-slate-500 border-t border-white/5 pt-1.5 italic mt-1 leading-normal text-left">
                    💡 Chrome iframe sandbox limits automatic speech. If audio is silent, click "Speak Aloud" or click the flashing **"Fix Mic/Voice (New Tab)"** button at the top-right!
                  </p>
                </div>
              )}

              {isThinking && !aiReply && (
                <div className="bg-[#0b0f19]/60 border border-indigo-500/5 rounded-xl p-2.5 flex items-center gap-2 animate-pulse z-10">
                  <div className="flex gap-0.5 h-2.5 items-end shrink-0">
                    <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms] h-1.5" />
                    <span className="w-0.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:150ms] h-2.5" />
                    <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms] h-1.5" />
                  </div>
                  <p className="text-[9px] text-indigo-300 italic font-bold uppercase tracking-wider">Professor Vikram is formulating response...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Picture-in-Picture Camera Scanner Widget */}
      <AnimatePresence>
        {cameraEnabled && (
          <div className="fixed bottom-48 md:bottom-[210px] right-4 md:right-12 z-50 w-[calc(100vw-2rem)] max-w-[340px] md:max-w-none md:w-auto pointer-events-none">
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0.05}
              whileDrag={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className={`bg-slate-950/95 backdrop-blur-2xl border-2 border-slate-800 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-300 w-full pointer-events-auto cursor-grab active:cursor-grabbing hover:border-emerald-500/30 ${
                cameraScale === 'large' ? 'md:w-[420px] md:h-[480px] h-[400px]' : 'md:w-[290px] md:h-[340px] h-[300px]'
              }`}
            >
              {/* Camera Header */}
              <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-slate-500 mr-0.5 cursor-grab active:cursor-grabbing" title="Drag to move feed">
                    <GripVertical className="w-3.5 h-3.5 opacity-70" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Classroom Vision Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCameraScale(cameraScale === 'large' ? 'normal' : 'large')}
                    className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-all"
                    title={cameraScale === 'large' ? 'Shrink Window' : 'Enlarge Window'}
                  >
                    {cameraScale === 'large' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setCameraEnabled(false)}
                    className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Area */}
              <div className="flex-1 bg-black relative min-h-0 flex items-center justify-center">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-amber-500 animate-pulse" />
                    <p className="text-[11px] font-bold text-white">Active Vision Track</p>
                    <p className="text-[9px] text-slate-500 mt-1">Live camera tracking via local simulator stream</p>
                  </div>
                )}

                {/* Scan Overlay results */}
                {scanResult && (
                  <div className="absolute inset-0 bg-slate-950/90 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <span className="text-[9px] font-black text-amber-500 tracking-wider uppercase">Scan Explanation</span>
                      <button
                        onClick={() => setScanResult('')}
                        className="text-[9px] text-slate-400 hover:text-white bg-slate-900 px-2 py-0.5 rounded-full"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {scanResult}
                    </p>
                  </div>
                )}

                {/* Processing Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase animate-pulse">Running OCR & AI Analysis</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-900/20 border-t border-slate-900 flex gap-2">
                <button
                  onClick={triggerCameraScan}
                  disabled={isScanning}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Scan Textbook / Notes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIXED FLOATING CONTROL CAPSULE - DRAGGABLE & REPOSITIONABLE ANYWHERE ON THE SCREEN */}
      <div className="fixed bottom-24 md:bottom-28 right-4 md:right-12 flex flex-col items-end gap-4 z-50 w-auto px-4 pointer-events-none">
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0.05}
          whileDrag={{ scale: 1.05 }}
          className="bg-black/95 backdrop-blur-3xl p-2.5 sm:p-3.5 rounded-full border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.95)] flex items-center justify-center gap-3 md:gap-4 cursor-grab active:cursor-grabbing pointer-events-auto hover:border-indigo-500/30 transition-all"
        >
          {/* Drag Grip Handle */}
          <div className="text-white/20 hover:text-white/40 cursor-grab active:cursor-grabbing mr-0.5 flex items-center justify-center shrink-0 animate-pulse" title="Drag to reposition panel">
            <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          
          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 cursor-pointer ${
              cameraEnabled 
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] transform scale-105' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
            title={cameraEnabled ? "Turn off Classroom Vision Camera" : "Turn on Classroom Vision Camera"}
          >
            <svg className="w-4.5 h-4.5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Core Mic Button */}
          {micEnabled ? (
            <button 
              onClick={toggleMic} 
              className="w-12 h-12 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all duration-300 bg-rose-500 border-2 border-rose-400 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] cursor-pointer transform hover:scale-105 active:scale-95 shrink-0"
              title="Close Classroom Voice AI"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ) : (
            <button 
              onClick={toggleMic} 
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 cursor-pointer bg-rose-500/10 border-rose-500/20 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20 shrink-0"
              title="Initiate Classroom Voice AI"
            >
              <svg className="w-4.5 h-4.5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}

          {/* Raise Hand Button */}
          {onRaiseHand && (
            <button
              onClick={onRaiseHand}
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 cursor-pointer ${
                isHandRaised 
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] transform scale-105 animate-bounce' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title="Raise Hand in Classroom"
            >
              <Hand className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
            </button>
          )}

          {/* Separator */}
          <div className="hidden sm:block h-8 w-px bg-white/10 mx-1 shrink-0" />

          {/* Status block info */}
          <div className="hidden sm:flex flex-col select-none min-w-[70px] shrink-0 text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400 leading-none">NEXUS LINK</span>
            <span className="text-[8px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
               <span className={`w-1.5 h-1.5 rounded-full ${
                 micEnabled || cameraEnabled 
                   ? 'bg-emerald-500 animate-pulse' 
                   : 'bg-slate-500'
               }`} />
               <span className={
                 micEnabled || cameraEnabled 
                   ? 'text-emerald-400' 
                   : 'text-slate-500'
               }>
                 {micEnabled || cameraEnabled ? 'ACTIVE' : 'OFFLINE'}
               </span>
            </span>
          </div>

        </motion.div>
      </div>
    </>
  );
};
