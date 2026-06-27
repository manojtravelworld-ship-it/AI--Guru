import React, { useState } from 'react';
import { Volume2, Mic, Play, Square, Award, Sparkles, Languages, CheckCircle2 } from 'lucide-react';

interface VoicePortalProps {
  currentView: string; // 'teacher-narration' | 'conversation-practice' | 'pronunciation-lab'
  onViewChange: (view: string) => void;
  micVolume: number;
}

export const VoicePortal: React.FC<VoicePortalProps> = ({
  currentView,
  onViewChange,
  micVolume
}) => {
  // TTS Narrator states
  const narrations = [
    { id: 'v1', title: 'Newton\'s Law of Gravitation', language: 'English', text: 'Every particle attracts every other particle in the universe with a force proportional to the product of their masses.', duration: '1:15' },
    { id: 'v2', title: 'വൈദ്യുതകാന്തിക പ്രേരണം (Electromagnetism)', language: 'Malayalam', text: 'ഒരു ചാലകവുമായി ബന്ധപ്പെട്ടിരിക്കുന്ന കാന്തിക ഫ്ലക്സിൽ മാറ്റമുണ്ടാകുമ്പോഴെല്ലാം അതിൽ ഒരു ഇ.എം.എഫ് പ്രേരിതമാകുന്നു.', duration: '2:04' }
  ];

  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [synthText, setSynthText] = useState('');

  // Speaking simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [spokenScore, setSpokenScore] = useState<number | null>(null);
  const [labPrompt, setLabPrompt] = useState('Read aloud: "Quantum wave-particle duality is fundamental to quantum physics."');

  // Trigger browser TTS engine
  const handlePlayTTS = (text: string, id: string) => {
    if (isPlaying === id) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto detect Malayalam or English voice if available
    if (text.match(/[\u0D00-\u0D7F]/)) {
      utterance.lang = 'ml-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setIsPlaying(null);
    setIsPlaying(id);
    window.speechSynthesis.speak(utterance);
  };

  // Recording triggers
  const handleStartRecording = () => {
    setIsRecording(true);
    setSpokenScore(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Simulate pronunciation evaluation
    const randomScore = Math.floor(82 + Math.random() * 16);
    setSpokenScore(randomScore);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['teacher-narration', 'conversation-practice', 'pronunciation-lab'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsPlaying(null);
              onViewChange(tab);
            }}
            className={`text-sm font-semibold capitalize pb-2 transition-all shrink-0 border-b-2 ${
              currentView === tab
                ? 'text-amber-500 border-amber-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* TEACHER NARRATION VIEW */}
      {currentView === 'teacher-narration' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Audio Lessons List</h3>
            
            <div className="space-y-3">
              {narrations.map((nar) => (
                <div key={nar.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-amber-500">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {nar.title}
                        <span className="text-[9px] bg-slate-950 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                          {nar.language}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{nar.text}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayTTS(nar.text, nar.id)}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
                  >
                    {isPlaying === nar.id ? <Square className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" /> : <Play className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />}
                    {isPlaying === nar.id ? 'Stop Playing' : 'Play Lesson'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Direct Speech Synthesizer
            </h3>
            <div className="space-y-3">
              <textarea
                placeholder="Type or paste text in English or Malayalam..."
                rows={4}
                value={synthText}
                onChange={(e) => setSynthText(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handlePlayTTS(synthText, 'custom')}
                disabled={!synthText.trim()}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
              >
                {isPlaying === 'custom' ? 'Mute Speech' : 'Synthesize Voice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERSATION PRACTICE & PRONUNCIATION LAB */}
      {(currentView === 'conversation-practice' || currentView === 'pronunciation-lab') && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {currentView === 'pronunciation-lab' ? 'Interactive Pronunciation Lab' : 'Spoken English & Malayalam Mock Interviews'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {currentView === 'pronunciation-lab' ? 'Speak the passage clearly below. Our AI evaluates pronunciation mechanics.' : 'Engage in live simulated conversations to master spoken languages.'}
            </p>
          </div>

          {/* Interactive Lab Prompt */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-center">
            <p className="text-xs font-semibold text-white leading-relaxed">{labPrompt}</p>
          </div>

          {/* Audio Visualization feedback */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-3xl gap-4">
            {isRecording ? (
              <div className="flex items-center gap-1.5 h-10">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-amber-500 rounded-full animate-pulse"
                    style={{
                      height: `${10 + Math.random() * 32}px`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                <Mic className="w-6 h-6 stroke-[1.5]" />
              </div>
            )}

            <div className="flex gap-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Start Speaking Now
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="bg-rose-500 hover:bg-rose-400 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Analyze Pronunciation
                </button>
              )}
            </div>
          </div>

          {/* Evaluation Results */}
          {spokenScore !== null && (
            <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Score Generated!</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Fluency, rhythm, and intonation match standards.</p>
                </div>
              </div>
              <div className="text-center shrink-0">
                <p className="text-xs text-slate-500">Evaluation</p>
                <p className="text-lg font-black text-emerald-400 font-mono">{spokenScore}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
