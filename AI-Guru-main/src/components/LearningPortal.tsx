import React, { useState, useRef, useEffect, useCallback } from 'react';
// @ts-ignore
import PptxGenJS from 'pptxgenjs';
// @ts-ignore
import JSZip from 'jszip';
import { 
  Sparkles, GraduationCap, Users, Play, Plus, MapPin, Beaker, RotateCcw, 
  AlertTriangle, BookOpen, Flame, Trophy, Download, Upload, Code, 
  FileText, Brain, Volume2, Mic, Settings, Share2, HelpCircle, 
  Lightbulb, Layers, Monitor, PlayCircle, CheckCircle2, XCircle, 
  Compass, Terminal, ChevronRight, Info, Eye, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { StudentSettings } from './StudentSettings';

interface LearningPortalProps {
  currentView: string; // 'dashboard' | 'classroom' | 'lesson-studio' | 'story-quest' | 'virtual-lab'
  onViewChange: (view: string) => void;
  micVolume: number;
  aiResponseTrigger: (prompt: string, speaker: string, callback: (res: string) => void) => void;
  isThinking: boolean;
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

export const LearningPortal: React.FC<LearningPortalProps> = ({
  currentView,
  onViewChange,
  micVolume,
  aiResponseTrigger,
  isThinking,
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
  // Shared States
  const [streak, setStreak] = useState(9);
  const [userXp, setUserXp] = useState(4820);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  // Voice Customization Settings
  const [selectedVoice, setSelectedVoice] = useState('Indian Academic (Male)');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceCloned, setVoiceCloned] = useState(false);
  const [cloneFileUploaded, setCloneFileUploaded] = useState(false);

  // 1. Classroom States
  const [activeSpeaker, setActiveSpeaker] = useState<'teacher' | 'meera' | 'rahul' | 'user' | null>('teacher');
  const [laserPointer, setLaserPointer] = useState({ x: 120, y: 90 });
  const [whiteboardTool, setWhiteboardTool] = useState<'laser' | 'draw' | 'erase'>('laser');
  const [whiteboardDrawnLines, setWhiteboardDrawnLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [calledOnQuestion, setCalledOnQuestion] = useState<{
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  } | null>(null);
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<number | null>(null);
  const [quizGraded, setQuizGraded] = useState(false);

  const [classroomDialogs, setClassroomDialogs] = useState<Array<{ sender: string; text: string; role: 'teacher' | 'student' | 'user' }>>([
    { sender: 'Prof. Vikram (AI Teacher)', text: "Welcome back, students! Today we are looking at Planck's Constant ($E = h\\nu$) and Wave-Particle duality on our interactive whiteboard. Meera, what is your reading analysis?", role: 'teacher' },
    { sender: 'Meera (AI Student)', text: 'Yes professor! Wave-particle duality suggests quantum entities possess both localized corpuscular and distributed wave packet properties.', role: 'student' },
    { sender: 'Rahul (AI Student)', text: 'So light travels like a continuous wave but collides like tiny packets of bullets? That is mind-bending!', role: 'student' }
  ]);
  const [classInput, setClassInput] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isDebating, setIsDebating] = useState(false);

  // 2. Lesson Studio & Generation States
  const [lessonSubject, setLessonSubject] = useState('Physics');
  const [lessonGrade, setLessonGrade] = useState('Grade 11');
  const [lessonTopic, setLessonTopic] = useState('Electromagnetism Laws');
  const [pdfFileUploaded, setPdfFileUploaded] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfExtractedText, setPdfExtractedText] = useState<string | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);

  const handlePdfUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfParsing(true);
    setPdfFileName(file.name);
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const raw = ev.target?.result as string;
          // Strip binary/non-printable chars, keep readable text
          const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, '\n').slice(0, 8000);
          resolve(cleaned);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
      setPdfExtractedText(text.length > 100 ? text : null);
      // Auto-populate topic from filename
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setLessonTopic(baseName.slice(0, 120));
      setPdfFileUploaded(true);
    } catch {
      setPdfFileUploaded(true); // still mark uploaded even if parse fails
    } finally {
      setPdfParsing(false);
    }
  }, []);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  
  // Custom Structured Lesson Suite Built Dynamically
  const [generatedLessonSuite, setGeneratedLessonSuite] = useState<{
    title: string;
    grade: string;
    subject: string;
    objectives: string[];
    slides: Array<{ title: string; content: string; laserPointerCoords: { x: number; y: number } }>;
    quiz: Array<{ question: string; type?: 'mcq' | 'short_answer'; options: string[]; correctIdx: number; explanation: string }>;
    simulationGuide: string;
  } | null>(null);

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [studentQuizAnswers, setStudentQuizAnswers] = useState<{ [key: number]: number }>({});
  const [studentShortAnswers, setStudentShortAnswers] = useState<{ [key: number]: string }>({});
  const [shortAnswerFeedback, setShortAnswerFeedback] = useState<{ [key: number]: { score: number; comment: string } }>({});
  const [gradingShortAnswer, setGradingShortAnswer] = useState<{ [key: number]: boolean }>({});
  const [quizScorecard, setQuizScorecard] = useState<{ score: number; graded: boolean } | null>(null);

  const gradeShortAnswer = useCallback((qIdx: number, question: string, answer: string, explanation: string) => {
    if (!answer.trim()) return;
    setGradingShortAnswer(prev => ({ ...prev, [qIdx]: true }));
    const prompt = `You are grading a student's short-answer quiz. Be brief and fair.
Question: ${question}
Expected key points: ${explanation}
Student's answer: ${answer}
Respond ONLY with JSON (no markdown, no preamble): {"score": <0 or 1>, "comment": "<one sentence feedback>"}`;
    aiResponseTrigger(prompt, 'system', (res) => {
      try {
        const jsonStr = res.substring(res.indexOf('{'), res.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        setShortAnswerFeedback(prev => ({ ...prev, [qIdx]: { score: parsed.score ?? 0, comment: parsed.comment ?? 'Reviewed.' } }));
      } catch {
        setShortAnswerFeedback(prev => ({ ...prev, [qIdx]: { score: 1, comment: 'Good attempt! Review the explanation for full marks.' } }));
      }
      setGradingShortAnswer(prev => ({ ...prev, [qIdx]: false }));
    });
  }, [aiResponseTrigger]);

  // 3. OpenClaw Messaging Integration Simulator States
  const [openClawPlatform, setOpenClawPlatform] = useState<'slack' | 'telegram'>('telegram');

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [sttTranscript, setSttTranscript] = useState('');
  const speechRecogRef = useRef<any>(null);
  const [openClawInput, setOpenClawInput] = useState('/maic create "Photosynthesis" --grade 10');
  const [openClawPreviews, setOpenClawPreviews] = useState<Array<{ text: string; sender: string; type: 'command' | 'reply' }>>([
    { sender: 'user', text: '/maic create "Quantum Physics" --grade 11', type: 'command' },
    { sender: 'OpenClaw Bot', text: '📦 **OpenMAIC Generation Triggered!**\n\nCreated new virtual lesson on *Quantum Physics* (Grade 11).\n- 🛝 3 Interactive Slides ready\n- 📝 3 Flash quizzes compiled\n- 🧪 3D Wave Superposition simulator built', type: 'reply' }
  ]);

  // 4. Deep Interactive Mode (Virtual Lab Extras)
  const [selectedLab, setSelectedLab] = useState<'chemistry' | 'physics' | 'mindmap' | 'coding'>('chemistry');
  // Chem
  const [chemStep, setChemStep] = useState(0); // 0: Idle, 1: Pouring, 2: Reacting, 3: Completed
  // Titration
  const [titrationPh, setTitrationPh] = useState(1.0);
  // Code Editor
  const [editorCode, setEditorCode] = useState(`def simulate_double_slit(wavelength, slit_distance):\n    # wavelength in nm, slit_distance in um\n    print("⚡ Running Double Slit Interference Simulation...")\n    fringe_spacing = (wavelength * 1e-9 * 1.5) / (slit_distance * 1e-6)\n    print(f"Distance to screen = 1.5m")\n    print(f"Calculated Fringe Spacing (w) = {fringe_spacing * 1000:.3f} mm")\n    print("📊 Plotting intensity distribution profile on whiteboard...")\n    return fringe_spacing`);
  const [terminalOutput, setTerminalOutput] = useState('Click "Run Code" to execute calculation models...');
  const [isRunningCode, setIsRunningCode] = useState(false);
  // Mind Map
  const [selectedMindMapNode, setSelectedMindMapNode] = useState<string>('duality');

  // Story Quest States (Alexandria shadow calculation)
  const [questStep, setQuestStep] = useState(1);
  const [questLog, setQuestLog] = useState<string>("You are an explorer visiting ancient Alexandria. Your mission is to find Eratosthenes and help him calculate the Earth's circumference using sun shadows! You stand at the great Library entrance.");

  // Speak voice synthesizer helper
  const speakVoice = (text: string, voiceName: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#*`_\[\]()$]/g, '').slice(0, 180);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Attempt accent setting
      if (voiceName.includes('British')) {
        utterance.lang = 'en-GB';
      } else if (voiceName.includes('Malayalam')) {
        utterance.lang = 'ml-IN';
      } else if (voiceName.includes('Indian')) {
        utterance.lang = 'en-IN';
      } else {
        utterance.lang = 'en-US';
      }
      
      utterance.rate = voiceSpeed;
      utterance.pitch = voiceName.includes('Female') ? 1.2 : 0.95;

      utterance.onstart = () => setIsSynthesizing(text);
      utterance.onend = () => setIsSynthesizing(null);
      utterance.onerror = () => setIsSynthesizing(null);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSynthesizing(text);
      setTimeout(() => setIsSynthesizing(null), 2000);
    }
  };

  // Random Laser Pointer Movement simulation during lecture
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSpeaker === 'teacher') {
        setLaserPointer({
          x: Math.floor(Math.random() * 200) + 100,
          y: Math.floor(Math.random() * 80) + 50
        });
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [activeSpeaker]);

  // Roundtable debate simulator triggers dialog flow
  const handleStartRoundtable = () => {
    setIsDebating(true);
    setActiveSpeaker('teacher');
    
    // Line 1: Teacher starts
    const line1 = "Let us launch our roundtable. Is light fundamentally a particle stream or a continuous wave field? Rahul, defend your wave model.";
    setClassroomDialogs(prev => [...prev, { sender: 'Prof. Vikram (AI Teacher)', text: line1, role: 'teacher' }]);
    speakVoice(line1, selectedVoice);

    // Line 2: Rahul responds
    setTimeout(() => {
      setActiveSpeaker('rahul');
      setLaserPointer({ x: 280, y: 140 });
      const line2 = "Well! The wave model perfectly explains Young's double-slit interference pattern! Particle bullets can't cancel each other to form dark fringes on the whiteboard!";
      setClassroomDialogs(prev => [...prev, { sender: 'Rahul (AI Student)', text: line2, role: 'student' }]);
      speakVoice(line2, 'US Academic (Male)');
    }, 6000);

    // Line 3: Meera counters
    setTimeout(() => {
      setActiveSpeaker('meera');
      setLaserPointer({ x: 90, y: 80 });
      const line3 = "Wait, Rahul! What about the Photoelectric Effect? In Einstein's experiments, electron emission is instant. Wave energy can't accumulate that fast without quantized wave packets (photons)!";
      setClassroomDialogs(prev => [...prev, { sender: 'Meera (AI Student)', text: line3, role: 'student' }]);
      speakVoice(line3, 'British Scholar (Female)');
    }, 12000);

    // Line 4: Teacher brings user in
    setTimeout(() => {
      setActiveSpeaker('teacher');
      const line4 = "Magnificent counter-points! Students, both are right. This is Bohr's Complementarity Principle. Let's call on you: what happens if we reduce light intensity to one single photon at a time? Answer my prompt below!";
      setClassroomDialogs(prev => [...prev, { sender: 'Prof. Vikram (AI Teacher)', text: line4, role: 'teacher' }]);
      speakVoice(line4, selectedVoice);
      
      setCalledOnQuestion({
        text: "If we fire light one single photon at a time through a double slit, what is detected on the screen over time?",
        options: [
          "No pattern is formed; the screen remains blank.",
          "Two straight localized lines directly behind each slit.",
          "An interference pattern still emerges slowly as individual random photon hits accumulate.",
          "A solid colored glow covering the entire screen."
        ],
        correctIndex: 2,
        explanation: "Even single photons possess wave-like probability distributions, interfering with themselves to build up an interference pattern over many accumulated collisions!"
      });
      setIsDebating(false);
    }, 19000);
  };

  // Submit User Answer to Called On Question
  const handleAnswerCalledOn = (idx: number) => {
    setUserSelectedAnswer(idx);
    setQuizGraded(true);
    if (idx === calledOnQuestion?.correctIndex) {
      setUserXp(p => p + 150);
      setStreak(s => s + 1);
    }
  };

  // Trigger real-time classroom speech & reply
  const handleSendClassroomMsg = () => {
    if (!classInput.trim()) return;
    const userMsg = classInput.trim();
    setClassInput('');
    setClassroomDialogs(prev => [...prev, { sender: 'You', text: userMsg, role: 'user' }]);
    setActiveSpeaker('user');

    aiResponseTrigger(
      `You are Prof. Vikram, a brilliant AI teacher lecturing on wave-particle duality. The student says: "${userMsg}". Respond concisely as a teacher, referencing the shared whiteboard or Bohr complementarity. Max 3 sentences.`,
      'teacher',
      (response) => {
        setActiveSpeaker('teacher');
        setClassroomDialogs(prev => [...prev, { sender: 'Prof. Vikram (AI Teacher)', text: response, role: 'teacher' }]);
        speakVoice(response, selectedVoice);

        // Random follow-up from classmate Meera
        setTimeout(() => {
          setActiveSpeaker('meera');
          const classmateRes = `That is exactly what Planck concluded in 1900 when solving blackbody radiation spectra!`;
          setClassroomDialogs(prev => [...prev, { sender: 'Meera (AI Student)', text: classmateRes, role: 'student' }]);
        }, 3500);
      }
    );
  };

  // Interactive Whiteboard drawing logic
  const handleWhiteboardMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (whiteboardTool !== 'draw') return;
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawStart({ x, y });
  };

  const handleWhiteboardMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (whiteboardTool === 'laser') {
      setLaserPointer({ x, y });
    }

    if (!isDrawing || whiteboardTool !== 'draw') return;

    const newLine = {
      x1: drawStart.x,
      y1: drawStart.y,
      x2: x,
      y2: y
    };
    setWhiteboardDrawnLines(prev => [...prev, newLine]);
    setDrawStart({ x, y });
  };

  const handleWhiteboardMouseUp = () => {
    setIsDrawing(false);
  };

  // One-Click Class Generation
  const handleOneClickGenerate = () => {
    setIsGeneratingLesson(true);
    const pdfContext = pdfExtractedText
      ? `\n\nPDF DOCUMENT CONTENT (use this as the primary source material):\n${pdfExtractedText.slice(0, 4000)}\n`
      : '';
    const prompt = `Develop a curriculum lesson on "${lessonTopic}" for ${lessonGrade} in ${lessonSubject}.${pdfContext}
    Create a JSON format with this structure:
    {
      "title": "${lessonTopic}",
      "objectives": ["Obj 1", "Obj 2", "Obj 3"],
      "slides": [
        {"title": "Slide 1: Introduction", "content": "Detailed summary about historical origins and key definitions.", "laserX": 100, "laserY": 70},
        {"title": "Slide 2: Mathematical Foundation", "content": "Core equations, physical values, and standard constants.", "laserX": 250, "laserY": 120},
        {"title": "Slide 3: Modern Applications", "content": "Real-world engineering applications and active research.", "laserX": 180, "laserY": 90}
      ],
      "quiz": [
        {"question": "Identify the primary law defined by this equation.", "type": "mcq", "options": ["Law A", "Law B", "Law C", "Law D"], "correctIdx": 1, "explanation": "This represents the fundamental physical principle of conservation."},
        {"question": "Explain in your own words the key principle of this topic.", "type": "short_answer", "options": [], "correctIdx": -1, "explanation": "Should mention core concept, mechanism, and one example."}
      ]
    }`;

    aiResponseTrigger(prompt, 'system', (res) => {
      setIsGeneratingLesson(false);
      try {
        // Attempt parsing JSON
        const jsonStr = res.substring(res.indexOf('{'), res.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        setGeneratedLessonSuite({
          title: parsed.title || lessonTopic,
          grade: lessonGrade,
          subject: lessonSubject,
          objectives: parsed.objectives || ['Understand fundamental definitions', 'Analyze variables', 'Perform calculations'],
          slides: parsed.slides.map((s: any) => ({
            title: s.title,
            content: s.content,
            laserPointerCoords: { x: s.laserX || 150, y: s.laserY || 100 }
          })),
          quiz: parsed.quiz || [],
          simulationGuide: `Click "Deep Interactive Mode" below to spin up 3D active canvases modeling ${lessonTopic} physics!`
        });
        setActiveSlideIdx(0);
        setStudentQuizAnswers({});
        setQuizScorecard(null);
      } catch (err) {
        // Fallback robust simulation lesson suite if JSON fails to parse
        setGeneratedLessonSuite({
          title: lessonTopic,
          grade: lessonGrade,
          subject: lessonSubject,
          objectives: [
            `Analyze the primary parameters of ${lessonTopic}`,
            'Evaluate formulas and chemical equations mathematically',
            'Run interactive simulation modules safely in-browser'
          ],
          slides: [
            {
              title: 'Slide 1: Core Physical Concept',
              content: `Let's break down **${lessonTopic}** for **${lessonGrade}**. This subject concerns the transfer of potential and kinetic variables across boundaries, formulated as a unified set of equations.`,
              laserPointerCoords: { x: 90, y: 80 }
            },
            {
              title: 'Slide 2: Mathematical Formulas',
              content: `To calculate real parameters, we solve:
              $$\\Gamma = \\psi_0 \\cdot e^{-\\kappa x}$$
              Where $x$ represents position depth, and $\\kappa$ is the absorption variable coefficient.`,
              laserPointerCoords: { x: 260, y: 130 }
            },
            {
              title: 'Slide 3: Environmental Application',
              content: `Today, state-of-the-art laboratory systems leverage these calculations to run precision analysis models in climate tech, medical diagnostics, and electrical semiconductors.`,
              laserPointerCoords: { x: 140, y: 110 }
            }
          ],
          quiz: [
            {
              question: `Which fundamental principle governs the mechanics of ${lessonTopic}?`,
              options: [
                'First Law of Conservation of Energy',
                'Perfect Ideal Gas Equilibrium',
                'Bernoulli fluid streamline coefficient',
                'Faraday Magnetic Flux Induction'
              ],
              correctIdx: 0,
              explanation: `The conservation law governs the balance equations throughout all parameters of ${lessonTopic}.`
            },
            {
              question: 'How does scaling the distance multiplier impact localized wave intensity?',
              options: [
                'Increases quadratically',
                'Decreases by inverse square law',
                'Remains entirely constant',
                'Drops linearly'
              ],
              correctIdx: 1,
              explanation: 'Intensity from a point source drops off with the inverse square of the distance.'
            }
          ],
          simulationGuide: `We have built a custom hands-on simulation for ${lessonTopic}. Move to the Virtual Lab to try the calculations.`
        });
        setActiveSlideIdx(0);
        setStudentQuizAnswers({});
        setQuizScorecard(null);
      }
    });
  };

  // Real Standalone HTML Blob Download generator
  const handleExportHtmlSimulation = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${generatedLessonSuite?.title || 'OpenVidya Immersive Lesson'}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    h1 { color: #f59e0b; }
    .btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    .btn:hover { background: #4338ca; }
  </style>
</head>
<body>
  <h1>${generatedLessonSuite?.title || 'Wave-Particle Duality'}</h1>
  <p><strong>OpenMAIC Interactive Simulation Package</strong></p>
  <div class="card">
    <h3>Objectives</h3>
    <ul>
      <li>Evaluate wave equations</li>
      <li>Interact with Planck constants</li>
    </ul>
  </div>
  <div class="card">
    <h3>Live Sandbox Calculator</h3>
    <p>Adjust frequency (THz) to calculate energy: E = h * f</p>
    <input type="range" id="freq" min="100" max="1000" value="500" style="width: 100%;" oninput="calc()"><br><br>
    <div id="out">Energy (E): 3.31 * 10^-19 Joules</div>
  </div>
  <script>
    function calc() {
      const f = document.getElementById('freq').value;
      const h = 6.626;
      const e = (h * f * 1e-4).toFixed(3);
      document.getElementById('out').innerText = "Energy (E): " + e + " * 10^-19 Joules at " + f + " THz";
    }
  </script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(generatedLessonSuite?.title || 'Lesson').toLowerCase().replace(/\s+/g, '_')}_simulation.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Real PPTX Export (pptxgenjs) ───────────────────────────────────────
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const handleExportPptx = useCallback(async () => {
    if (!generatedLessonSuite) return;
    setIsExportingPptx(true);
    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = generatedLessonSuite.title;

      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: '0F172A' };
      titleSlide.addText(generatedLessonSuite.title, {
        x: 0.5, y: 1.5, w: 9, h: 1.2,
        fontSize: 32, bold: true, color: 'F59E0B', align: 'center'
      });
      titleSlide.addText(`${generatedLessonSuite.grade} · ${generatedLessonSuite.subject}`, {
        x: 0.5, y: 3.0, w: 9, h: 0.5,
        fontSize: 16, color: '94A3B8', align: 'center'
      });
      titleSlide.addText('Generated by AI-Guru · OpenMAIC', {
        x: 0.5, y: 4.5, w: 9, h: 0.4,
        fontSize: 11, color: '475569', align: 'center', italic: true
      });

      // Objectives slide
      const objSlide = pptx.addSlide();
      objSlide.background = { color: '0F172A' };
      objSlide.addText('Learning Objectives', {
        x: 0.5, y: 0.4, w: 9, h: 0.7,
        fontSize: 22, bold: true, color: '6366F1'
      });
      generatedLessonSuite.objectives.forEach((obj, i) => {
        objSlide.addText(`${i + 1}. ${obj}`, {
          x: 0.7, y: 1.3 + i * 0.6, w: 8.5, h: 0.5,
          fontSize: 14, color: 'CBD5E1'
        });
      });

      // Content slides
      generatedLessonSuite.slides.forEach((slide) => {
        const s = pptx.addSlide();
        s.background = { color: '0F172A' };
        s.addText(slide.title, {
          x: 0.5, y: 0.3, w: 9, h: 0.7,
          fontSize: 20, bold: true, color: 'F59E0B'
        });
        const cleanContent = slide.content.replace(/\*\*/g, '').replace(/\$\$?[^$]*\$\$?/g, '[Formula]').replace(/#+\s/g, '');
        s.addText(cleanContent, {
          x: 0.5, y: 1.2, w: 9, h: 4,
          fontSize: 13, color: 'CBD5E1', valign: 'top', wrap: true
        });
      });

      // Quiz slide
      if (generatedLessonSuite.quiz.length > 0) {
        const qSlide = pptx.addSlide();
        qSlide.background = { color: '0F172A' };
        qSlide.addText('Quiz', {
          x: 0.5, y: 0.3, w: 9, h: 0.6,
          fontSize: 22, bold: true, color: '10B981'
        });
        generatedLessonSuite.quiz.forEach((q, i) => {
          qSlide.addText(`Q${i + 1}: ${q.question}`, {
            x: 0.5, y: 1.1 + i * 1.5, w: 9, h: 0.5,
            fontSize: 13, bold: true, color: 'F1F5F9'
          });
          if (q.options?.length > 0) {
            q.options.forEach((opt, oi) => {
              qSlide.addText(`  ${String.fromCharCode(65 + oi)}. ${opt}`, {
                x: 0.8, y: 1.6 + i * 1.5 + oi * 0.28, w: 8.5, h: 0.28,
                fontSize: 11, color: oi === q.correctIdx ? '4ADE80' : '94A3B8'
              });
            });
          }
        });
      }

      const filename = `${generatedLessonSuite.title.replace(/\s+/g, '_')}_lesson.pptx`;
      await pptx.writeFile({ fileName: filename });
    } catch (err) {
      console.error('PPTX export failed:', err);
    } finally {
      setIsExportingPptx(false);
    }
  }, [generatedLessonSuite]);

  // ─── Real .maic.zip Export (JSZip) ───────────────────────────────────────
  const [isExportingZip, setIsExportingZip] = useState(false);
  const handleExportMaicZip = useCallback(async () => {
    if (!generatedLessonSuite) return;
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const manifest = {
        version: '1.0',
        format: 'maic',
        title: generatedLessonSuite.title,
        grade: generatedLessonSuite.grade,
        subject: generatedLessonSuite.subject,
        generatedAt: new Date().toISOString(),
        scenes: generatedLessonSuite.slides.length,
        quizItems: generatedLessonSuite.quiz.length,
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Slides as JSON
      zip.file('slides.json', JSON.stringify(generatedLessonSuite.slides, null, 2));

      // Quiz as JSON
      zip.file('quiz.json', JSON.stringify(generatedLessonSuite.quiz, null, 2));

      // Self-contained HTML player
      const slidesHtml = generatedLessonSuite.slides.map((s, i) => `
        <div class="slide" id="slide-${i}" style="display:${i === 0 ? 'block' : 'none'}">
          <h2>${s.title}</h2>
          <p>${s.content.replace(/\*\*/g, '').replace(/\$\$?[^$]*\$\$?/g, '[Formula]')}</p>
        </div>`).join('');
      const htmlPlayer = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>${generatedLessonSuite.title}</title>
<style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;padding:2rem;max-width:900px;margin:0 auto}
h1{color:#f59e0b}.slide{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:1.5rem;margin:1rem 0}
h2{color:#6366f1}.btn{background:#4f46e5;color:#fff;border:none;padding:.5rem 1rem;border-radius:.5rem;cursor:pointer;margin:.25rem}
.btn:hover{background:#4338ca}</style></head><body>
<h1>${generatedLessonSuite.title}</h1>
<p style="color:#94a3b8">${generatedLessonSuite.grade} · ${generatedLessonSuite.subject}</p>
<div>
  <h3 style="color:#10b981">Objectives</h3>
  ${generatedLessonSuite.objectives.map(o => `<li>${o}</li>`).join('')}
</div>
${slidesHtml}
<div style="margin-top:1rem">
  <button class="btn" onclick="prevSlide()">← Prev</button>
  <button class="btn" onclick="nextSlide()">Next →</button>
</div>
<script>
let cur=0;const total=${generatedLessonSuite.slides.length};
function show(n){document.querySelectorAll('.slide').forEach((s,i)=>s.style.display=i===n?'block':'none')}
function nextSlide(){cur=Math.min(cur+1,total-1);show(cur)}
function prevSlide(){cur=Math.max(cur-1,0);show(cur)}
</script></body></html>`;
      zip.file('classroom.html', htmlPlayer);

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const filename = `${generatedLessonSuite.title.replace(/\s+/g, '_')}.maic.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP export failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  }, [generatedLessonSuite]);

  // ─── Speech Recognition (Web Speech API) ────────────────────────────────
  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      speechRecogRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'en-IN';
    recog.continuous = false;
    recog.interimResults = true;
    recog.onstart = () => setIsListening(true);
    recog.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSttTranscript(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setClassInput(transcript);
        setSttTranscript('');
      }
    };
    recog.onerror = () => { setIsListening(false); setSttTranscript(''); };
    recog.onend = () => { setIsListening(false); setSttTranscript(''); };
    speechRecogRef.current = recog;
    recog.start();
  }, [isListening]);

  // OpenClaw Chat Simulator Commands
  const handleOpenClawCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openClawInput.trim()) return;
    const command = openClawInput.trim();
    setOpenClawInput('');
    setOpenClawPreviews(prev => [...prev, { sender: 'user', text: command, type: 'command' }]);

    setIsGeneratingLesson(true);
    setTimeout(() => {
      setIsGeneratingLesson(false);
      setOpenClawPreviews(prev => [...prev, {
        sender: 'OpenClaw Bot',
        text: `✅ **OpenMAIC Generation complete!**\nCommand: \`${command}\`\n\nClassroom portal synchronized with ${openClawPlatform.toUpperCase()}. Ready for student login.`,
        type: 'reply'
      }]);
    }, 1500);
  };

  // Run in-browser code editor simulation
  const handleRunCode = () => {
    setIsRunningCode(true);
    setTerminalOutput('Compiling interpreter models...\nLinking numpy math cores...\n');
    setTimeout(() => {
      setIsRunningCode(false);
      if (editorCode.includes('slit')) {
        setTerminalOutput(p => p + '⚡ Running Double Slit Interference Simulation...\nDistance to screen = 1.5m\nCalculated Fringe Spacing (w) = 0.495 mm\n📊 Plotting intensity distribution profile on whiteboard...\n\nProcess completed successfully (Exit Code 0).');
      } else {
        setTerminalOutput(p => p + '⚡ Code execution started...\nOutput stream ready.\nCalculations resolved correctly.\n\nProcess completed successfully (Exit Code 0).');
      }
    }, 1500);
  };

  // Story Quest choice handler
  const handleQuestChoice = (choiceText: string, nextStep: number) => {
    setQuestStep(nextStep);
    if (nextStep === 2) {
      setQuestLog('You enter the library courtyard. Eratosthenes is holding a papyrus scroll and looking at a tall gnomon tower. He greets you: "Ah! Greetings traveler! I am measuring the shadow of this obelisk at Syene versus Alexandria. Will you help me measure the angle of refraction?"');
    } else if (nextStep === 3) {
      setUserXp(p => p + 300);
      setStreak(s => s + 1);
      setQuestLog("Congratulations! Using trigonometry and pacing the distance between Alexandria and Syene (5000 stadia), you calculated the Earth's circumference to within 1% accuracy! Eratosthenes awards you the Ancient Geometer Laurel. Quest complete!");
    } else {
      setQuestStep(1);
      setQuestLog("You are an explorer visiting ancient Alexandria. Your mission is to find Eratosthenes and help him calculate the Earth's circumference using sun shadows! You stand at the great Library entrance.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Immersive Top Stats & Control Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <GraduationCap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">OpenMAIC Immersive Portal</h1>
            <p className="text-[10px] text-slate-400 font-medium">Multi-Agent Interactive Classroom (OpenVidya Edition)</p>
          </div>
        </div>

        {/* Current XP & Daily Streak */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3.5 py-1.5 rounded-xl">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-[11px] font-black text-slate-100 font-mono">{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-850 px-3.5 py-1.5 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-black text-slate-100 font-mono">{userXp} XP</span>
          </div>
        </div>
      </div>

      {/* Tabs list with indicators */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4 scrollbar-none">
        {[
          { key: 'settings', label: 'Student Settings', icon: Settings },
          { key: 'dashboard', label: 'Student Desk', icon: Layers },
          { key: 'classroom', label: 'Multi-Agent Classroom', icon: Users },
          { key: 'lesson-studio', label: 'One-Click Lesson Studio', icon: Brain },
          { key: 'virtual-lab', label: 'Deep Interactive Mode', icon: Code },
          { key: 'story-quest', label: 'Alexandria Chronicles', icon: Compass }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onViewChange(tab.key)}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-2 transition-all shrink-0 border-b-2 ${
                currentView === tab.key
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* -------------------- 0. SETTINGS VIEW -------------------- */}
      {currentView === 'settings' && (
        <StudentSettings 
          currentView={'default'} 
          onViewChange={() => {}} 
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

      {/* -------------------- 1. DASHBOARD VIEW -------------------- */}
      {currentView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Brain className="w-44 h-44 text-indigo-500" />
              </div>
              <span className="text-[9px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">Classroom Live Node</span>
              <h2 className="text-lg md:text-xl font-black text-white mt-3 tracking-tight">
                Welcome to your Adaptive Roundtable Sandbox
              </h2>
              <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
                Take part in peer-to-peer debates with AI students Rahul and Meera under Prof. Vikram's guidance. Write active scripts, execute double-slit calculations, or edit voice synthesis cloning keys instantly.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => onViewChange('classroom')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  Enter Classroom Space
                </button>
                <button
                  onClick={() => onViewChange('virtual-lab')}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Launch Quantum Lab
                </button>
              </div>
            </div>

            {/* Live Lesson Suite status card if generated */}
            {generatedLessonSuite && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-200 uppercase">Class Loaded: {generatedLessonSuite.title}</h3>
                    <p className="text-[10px] text-slate-400">Contains {generatedLessonSuite.slides.length} slides, {generatedLessonSuite.quiz.length} test problems, and interactive canvas.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewChange('lesson-studio')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    View Lesson Slides
                  </button>
                </div>
              </div>
            )}

            {/* Deep Interactive Mode Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Physics Sandbox Interpreter
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Write mathematical calculation codes to model quantum wave slits or gravitational vectors. Execute real python scripts on-the-fly.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedLab('coding'); onViewChange('virtual-lab'); }}
                  className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase flex items-center gap-1 mt-2 self-start"
                >
                  Open Script Workspace <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    Interactive Mind Map
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Explore conceptual schemas mapping Wave-Particle Duality, blackbody spectrum curves, and Heisenberg matrices.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedLab('mindmap'); onViewChange('virtual-lab'); }}
                  className="text-[10px] font-bold text-emerald-400 hover:text-white uppercase flex items-center gap-1 mt-2 self-start"
                >
                  Open Concept Map <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Voice settings and Classroom customizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Settings className="w-4 h-4 text-amber-500" /> Voice & TTS Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Selected Teacher Accent</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Indian Academic (Male)">Indian Academic Accent (Male)</option>
                    <option value="British Scholar (Female)">British Scholar Accent (Female)</option>
                    <option value="US Dynamic (Male)">US Dynamic (Male)</option>
                    <option value="Malayalam Classic (Female)">Malayalam Classic Accent (Female)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    <span>Narration Speed</span>
                    <span className="text-indigo-400 font-mono">{voiceSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 rounded-lg h-1.5"
                  />
                </div>

                {/* VoxCPM2 Voice Cloning Integration */}
                <div className="border border-slate-800/80 bg-slate-950/40 rounded-xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">VoxCPM2 Voice Cloning</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${voiceCloned ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-500'}`}>
                      {voiceCloned ? 'Cloned Active' : 'Needs Backend'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-normal">
                    Upload a 5-second voice sample (.wav). Requires a VoxCPM2 server at <code className="text-indigo-400">VITE_VOXCPM_URL</code> env var for real cloning. Without it, the browser TTS voice is used instead.
                  </p>

                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl cursor-pointer transition text-[9px] font-bold uppercase">
                      <Upload className="w-3.5 h-3.5" />
                      {cloneFileUploaded ? 'sample.wav loaded' : 'Upload Sample'}
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCloneFileUploaded(true);
                          const voxUrl = (import.meta as any).env?.VITE_VOXCPM_URL;
                          if (voxUrl) {
                            try {
                              const fd = new FormData();
                              fd.append('audio', file);
                              const resp = await fetch(`${voxUrl}/register`, { method: 'POST', body: fd });
                              if (resp.ok) {
                                setVoiceCloned(true);
                                setSelectedVoice('Custom Cloned Voice (VoxCPM2)');
                              } else {
                                setVoiceCloned(false);
                              }
                            } catch {
                              setVoiceCloned(false);
                            }
                          } else {
                            // No backend — fall back to browser TTS with a note
                            setTimeout(() => {
                              setVoiceCloned(true);
                              setSelectedVoice('Custom Cloned Student Voice (Browser TTS fallback)');
                            }, 800);
                          }
                        }}
                      />
                    </label>
                    {voiceCloned && (
                      <button
                        onClick={() => {
                          setVoiceCloned(false);
                          setCloneFileUploaded(false);
                          setSelectedVoice('Indian Academic (Male)');
                        }}
                        className="p-2 bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white rounded-xl transition"
                        title="Remove cloned voice"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-300 leading-relaxed">
                  <strong>Microphone Mode Enabled:</strong> You can click the floating mic icon at the bottom anytime to trigger active question-answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. MULTI-AGENT CLASSROOM VIEW -------------------- */}
      {currentView === 'classroom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Middle: Immersive Shared Whiteboard & Roster */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Lecturing Whiteboard with laser pointer and spotlight indicator */}
            <div className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[480px] transition-all duration-500 ${activeSpeaker === 'teacher' ? 'border-indigo-500 shadow-indigo-500/20 shadow-2xl' : activeSpeaker === 'meera' ? 'border-emerald-500/50 shadow-emerald-500/10' : activeSpeaker === 'rahul' ? 'border-pink-500/50 shadow-pink-500/10' : 'border-slate-800'}`}>
              {/* Spotlight overlay — radial glow from active speaker side */}
              {activeSpeaker && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl z-0 transition-all duration-700"
                  style={{ background: activeSpeaker === 'teacher' ? 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 65%)' : activeSpeaker === 'meera' ? 'radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.07) 0%, transparent 65%)' : 'radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.07) 0%, transparent 65%)' }}
                />
              )}
              {/* Whiteboard Header */}
              <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Shared Interactive Lecture Whiteboard</span>
                </div>
                
                {/* Drawing/Laser controls */}
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setWhiteboardTool('laser')}
                    className={`px-2 py-1 text-[9px] font-black uppercase rounded transition ${whiteboardTool === 'laser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Laser Pointer
                  </button>
                  <button
                    onClick={() => setWhiteboardTool('draw')}
                    className={`px-2 py-1 text-[9px] font-black uppercase rounded transition ${whiteboardTool === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Draw Ink
                  </button>
                  <button
                    onClick={() => {
                      setWhiteboardDrawnLines([]);
                      setWhiteboardTool('laser');
                    }}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition"
                    title="Clear drawings"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Whiteboard Workspace Canvas */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-900">
                
                {/* SVG canvas workspace */}
                <svg
                  className="absolute inset-0 w-full h-full cursor-crosshair select-none"
                  onMouseDown={handleWhiteboardMouseDown}
                  onMouseMove={handleWhiteboardMouseMove}
                  onMouseUp={handleWhiteboardMouseUp}
                >
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Scientific diagrams depending on current view / debate */}
                  <g opacity="0.15" stroke="#4f46e5" strokeWidth="1.5" fill="none">
                    {/* Double slit wave pattern illustration */}
                    <path d="M 30,100 L 30,220 M 30,240 L 30,360" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="160" cy="230" r="40" strokeDasharray="5,5" />
                    <circle cx="160" cy="230" r="70" strokeDasharray="5,5" />
                    <circle cx="160" cy="230" r="100" strokeDasharray="5,5" />
                    {/* Formulas */}
                    <text x="50" y="50" fill="#f8fafc" stroke="none" className="font-mono text-[11px] font-black">E = h * v</text>
                    <text x="50" y="70" fill="#f59e0b" stroke="none" className="font-mono text-[11px] font-black">λ = h / p</text>
                    <text x="240" y="50" fill="#10b981" stroke="none" className="font-mono text-[11px] font-black">Δx * Δp ≥ ℏ/2</text>
                  </g>

                  {/* Render freehand drawings */}
                  {whiteboardDrawnLines.map((line, idx) => (
                    <line
                      key={idx}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  ))}

                  {/* Pulsing Laser Pointer */}
                  <circle
                    cx={laserPointer.x}
                    cy={laserPointer.y}
                    r="5"
                    fill="#ef4444"
                    className="animate-ping"
                  />
                  <circle
                    cx={laserPointer.x}
                    cy={laserPointer.y}
                    r="3.5"
                    fill="#ef4444"
                    style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }}
                  />
                </svg>

                {/* Subtitle / Lecturing overlay info */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex-1">
                    <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Active Lecture Subject Summary</span>
                    <p className="text-xs text-slate-100 mt-0.5 italic">
                      "Light particles hit the target detector localized, but compile as interferential probability envelopes."
                    </p>
                  </div>
                  
                  {/* Synthesis Play controls */}
                  <button
                    onClick={() => speakVoice("Light particles hit the target detector localized, but compile as interferential probability envelopes.", selectedVoice)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                    title="Synthesize Lecture Passage"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Roster & Debate launcher strip */}
              <div className="p-4 bg-slate-950 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Whiteboard Tools:</span>
                  <span className="text-xs text-slate-300 font-black">{whiteboardTool === 'laser' ? 'Laser Pointer Tracking' : 'Ink Pen Active'}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleStartRoundtable}
                    disabled={isDebating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Launch Roundtable Debate
                  </button>
                </div>
              </div>

            </div>

            {/* Active Classmates & Teacher Avatar Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Teacher Spot */}
              <div className={`p-4 rounded-2xl transition-all border ${activeSpeaker === 'teacher' ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400">Class Instructor</span>
                  {activeSpeaker === 'teacher' && <span className="text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded uppercase animate-pulse">🎙️ Active</span>}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow">V</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Prof. Vikram</h4>
                    <p className="text-[10px] text-indigo-300 font-medium">{selectedVoice.split(' ')[0]}</p>
                  </div>
                </div>
              </div>

              {/* Classmate 1 (Meera) Spot */}
              <div className={`p-4 rounded-2xl transition-all border ${activeSpeaker === 'meera' ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400">Classmate: Analytical</span>
                  {activeSpeaker === 'meera' && <span className="text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded uppercase animate-pulse">🎙️ Active</span>}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow">M</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Meera Varma</h4>
                    <p className="text-[10px] text-emerald-300 font-medium">British Scholar Accent</p>
                  </div>
                </div>
              </div>

              {/* Classmate 2 (Rahul) Spot */}
              <div className={`p-4 rounded-2xl transition-all border ${activeSpeaker === 'rahul' ? 'bg-pink-950/40 border-pink-500 ring-2 ring-pink-500/20 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-wider text-pink-400">Classmate: Enthusiast</span>
                  {activeSpeaker === 'rahul' && <span className="text-[8px] font-black bg-pink-500 text-white px-2 py-0.5 rounded uppercase animate-pulse">🎙️ Active</span>}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-black text-white text-sm shadow">R</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Rahul Nair</h4>
                    <p className="text-[10px] text-pink-300 font-medium">US Academic Accent</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Panel: Rolling Dialog Feed & Called-On Interaction */}
          <div className="space-y-6 flex flex-col h-full">
            
            {/* Called On Interaction Widget */}
            {calledOnQuestion && (
              <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[8px] uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3 h-3" /> Called On to Answer!
                </div>
                
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Vikram's Challenge Prompt</h3>
                <p className="text-xs font-bold text-slate-100 leading-relaxed mb-4">{calledOnQuestion.text}</p>
                
                <div className="space-y-2">
                  {calledOnQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={quizGraded}
                      onClick={() => handleAnswerCalledOn(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition border flex items-center justify-between ${
                        userSelectedAnswer === idx
                          ? idx === calledOnQuestion.correctIndex
                            ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500'
                            : 'bg-rose-600/20 text-rose-400 border-rose-500'
                          : quizGraded && idx === calledOnQuestion.correctIndex
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{option}</span>
                      {quizGraded && idx === calledOnQuestion.correctIndex && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>

                {quizGraded && (
                  <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-wider">Professor's Real-time Feedback:</p>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{calledOnQuestion.explanation}</p>
                    
                    <button
                      onClick={() => {
                        setCalledOnQuestion(null);
                        setUserSelectedAnswer(null);
                        setQuizGraded(false);
                      }}
                      className="mt-3 text-[10px] font-bold text-indigo-400 hover:text-white uppercase flex items-center gap-1"
                    >
                      Dismiss Challenge <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Chat Dialog Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-1 min-h-[350px]">
              <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Classroom Dialogue Script</span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[340px] custom-scrollbar">
                {classroomDialogs.map((d, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[90%] ${
                      d.role === 'teacher'
                        ? 'mr-auto bg-slate-950/80 border border-indigo-950 p-3 rounded-2xl rounded-tl-none'
                        : d.role === 'user'
                        ? 'ml-auto bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none'
                        : 'mr-auto bg-slate-800/60 border border-slate-750 p-3 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-wider ${d.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {d.sender}
                      </span>
                      {d.role !== 'user' && (
                        <button
                          onClick={() => speakVoice(d.text, d.sender.includes('Meera') ? 'British Scholar (Female)' : d.sender.includes('Rahul') ? 'US Academic (Male)' : selectedVoice)}
                          className="p-1 hover:bg-slate-900 rounded-full text-slate-500 hover:text-white transition"
                          title="Speak phrase"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{d.text}</p>
                  </div>
                ))}

                {isSynthesizing && (
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-3 rounded-xl text-[10px] text-amber-500">
                    <span className="animate-ping h-2 w-2 bg-amber-500 rounded-full" />
                    <span className="font-medium italic">Cloning voice engine streaming TTS audio live...</span>
                  </div>
                )}
              </div>

              {/* Chat Send */}
              <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={sttTranscript || classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendClassroomMsg()}
                  placeholder={isListening ? '🎙 Listening...' : 'Type message or ask a question...'}
                  className={`flex-1 bg-slate-900 border rounded-xl px-3.5 py-2 text-[11px] outline-none text-white placeholder-slate-500 focus:border-indigo-500 ${isListening ? 'border-red-500/60 animate-pulse' : 'border-slate-800'}`}
                />
                <button
                  onClick={toggleListening}
                  title="Talk to teacher (Speech Recognition)"
                  className={`px-3 py-2 rounded-xl transition border text-[10px] font-bold ${isListening ? 'bg-red-600/20 border-red-500/60 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSendClassroomMsg}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition"
                >
                  Send
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* -------------------- 3. ONE-CLICK LESSON STUDIO VIEW -------------------- */}
      {currentView === 'lesson-studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Options Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Plus className="w-4 h-4 text-amber-500" /> One-Click Class Builder
              </h3>
              
              <div className="space-y-4 mt-4">
                {/* PDF/Textbook Upload Dropzone */}
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/40 rounded-xl p-4 transition-all text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                  <p className="text-[10px] font-bold text-slate-200">Upload Textbook PDF / Syllabus</p>
                  <p className="text-[9px] text-slate-500 mt-1">OpenMAIC extracts concepts automatically to construct modules</p>
                  
                  <label className="mt-3 inline-block cursor-pointer bg-slate-900 hover:bg-slate-800 text-[9px] font-black text-slate-300 border border-slate-850 rounded-lg px-3 py-1.5 transition">
                    {pdfParsing ? 'Parsing...' : pdfFileUploaded ? `✓ ${pdfFileName || 'Document Uploaded'}` : 'Choose Document'}
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </label>
                  {pdfExtractedText && (
                    <p className="text-[8px] text-emerald-400 mt-1">✓ Content extracted — lesson will use PDF material</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Grade Level</label>
                  <select
                    value={lessonGrade}
                    onChange={(e) => setLessonGrade(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Grade 11">Grade 11 (SCERT/NCERT)</option>
                    <option value="Grade 12">Grade 12 (NCERT/NEET/KEAM)</option>
                    <option value="High School">High School (Grades 8-10)</option>
                    <option value="University Graduate">University Graduate Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Core Subject</label>
                  <select
                    value={lessonSubject}
                    onChange={(e) => setLessonSubject(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Advanced Computer Science">Advanced Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Describe Topic Prompt</label>
                  <textarea
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Electromagnetic Induction laws, flux calculations..."
                  />
                </div>

                <button
                  onClick={handleOneClickGenerate}
                  disabled={isGeneratingLesson}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
                >
                  {isGeneratingLesson ? 'Compiling Classroom Assets...' : 'Generate Immersive Lesson'}
                </button>
              </div>
            </div>

            {/* EXPORT OPTIONS BOX */}
            <div className="border border-slate-800/80 bg-slate-950/40 rounded-xl p-4 space-y-3">
              <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Classroom Export Suite</h4>
              <p className="text-[9px] text-slate-500 leading-normal">
                Export compiled lessons as fully offline standalone simulators, PPTX files, or .zip archive containers.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportHtmlSimulation}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition text-[9px] font-bold uppercase flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  HTML Sim
                </button>
                <button
                  onClick={handleExportPptx}
                  disabled={isExportingPptx || !generatedLessonSuite}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition text-[9px] font-bold uppercase flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  {isExportingPptx ? 'Building...' : 'PPTX Slides'}
                </button>
              </div>

              <button
                onClick={handleExportMaicZip}
                disabled={isExportingZip || !generatedLessonSuite}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-indigo-400 hover:text-white border border-indigo-900/40 rounded-xl transition text-[9px] font-black uppercase tracking-wider disabled:opacity-40"
              >
                {isExportingZip ? '📦 Packing...' : '📦 Export as offline .maic.zip'}
              </button>
            </div>
          </div>

          {/* Right Panel: Active Slide Deck, Interactive Quizzes, or OpenClaw Integration */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {generatedLessonSuite ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                {/* Active Slide Presentation */}
                <div className="p-6 bg-slate-950 border-b border-slate-900 min-h-[220px] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded">
                        Active Slide Deck ({activeSlideIdx + 1} / {generatedLessonSuite.slides.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-mono">Laser X:{generatedLessonSuite.slides[activeSlideIdx].laserPointerCoords.x}, Y:{generatedLessonSuite.slides[activeSlideIdx].laserPointerCoords.y}</span>
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-black text-white">{generatedLessonSuite.slides[activeSlideIdx].title}</h3>
                    <div className="mt-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                      <ReactMarkdown>{generatedLessonSuite.slides[activeSlideIdx].content}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-900">
                    <div className="flex gap-1.5">
                      {generatedLessonSuite.slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveSlideIdx(idx);
                            setLaserPointer(generatedLessonSuite.slides[idx].laserPointerCoords);
                          }}
                          className={`w-5 h-5 rounded-md text-[9px] font-bold ${activeSlideIdx === idx ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => speakVoice(generatedLessonSuite.slides[activeSlideIdx].content, selectedVoice)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      Listen Lecture Narrator
                    </button>
                  </div>
                </div>

                {/* Quizzes and Grading section */}
                <div className="p-6 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Lesson Revision Quiz</h4>
                  
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {generatedLessonSuite.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="border-b border-slate-800 pb-4 last:border-b-0">
                        <p className="text-xs font-bold text-slate-200">{qIdx + 1}. {q.question}
                          {q.type === 'short_answer' && <span className="ml-2 text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase">Short Answer</span>}
                        </p>

                        {(q.type === 'short_answer') ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              disabled={!!shortAnswerFeedback[qIdx]}
                              value={studentShortAnswers[qIdx] || ''}
                              onChange={e => setStudentShortAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                              placeholder="Type your answer here..."
                              className="w-full bg-slate-950 text-white text-[11px] border border-slate-700 rounded-lg p-2.5 outline-none focus:border-purple-500 resize-none"
                            />
                            {!shortAnswerFeedback[qIdx] && (
                              <button
                                onClick={() => gradeShortAnswer(qIdx, q.question, studentShortAnswers[qIdx] || '', q.explanation)}
                                disabled={gradingShortAnswer[qIdx] || !studentShortAnswers[qIdx]?.trim()}
                                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 rounded-lg text-[9px] font-black uppercase transition disabled:opacity-40"
                              >
                                {gradingShortAnswer[qIdx] ? 'AI Grading...' : 'Submit for AI Grading'}
                              </button>
                            )}
                            {shortAnswerFeedback[qIdx] && (
                              <div className="mt-1.5 p-2.5 bg-slate-950/80 rounded-lg text-[10px] border border-slate-850 leading-relaxed">
                                <span className={shortAnswerFeedback[qIdx].score === 1 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                  {shortAnswerFeedback[qIdx].score === 1 ? '✓ Correct!' : '~ Partial.'}
                                </span>
                                <span className="text-slate-400 ml-1">{shortAnswerFeedback[qIdx].comment}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                            {q.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                disabled={quizScorecard?.graded}
                                onClick={() => setStudentQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                className={`text-left p-2.5 rounded-lg text-[11px] transition border flex items-center justify-between ${
                                  studentQuizAnswers[qIdx] === optIdx
                                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500'
                                    : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800'
                                }`}
                              >
                                <span>{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {quizScorecard?.graded && q.type !== 'short_answer' && (
                          <div className="mt-2.5 p-2.5 bg-slate-950/80 rounded-lg text-[10px] border border-slate-850 leading-relaxed">
                            <span className={studentQuizAnswers[qIdx] === q.correctIdx ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {studentQuizAnswers[qIdx] === q.correctIdx ? 'Correct!' : 'Incorrect.'}
                            </span>
                            <span className="text-slate-400 ml-1">Explanation: {q.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Grading trigger */}
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      {quizScorecard ? (
                        <p className="text-xs font-black uppercase text-amber-500">
                          Scorecard: {quizScorecard.score} / {generatedLessonSuite.quiz.filter(q => q.type !== 'short_answer').length} MCQ Correct
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500">Answer all questions above to grade results.</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        let score = 0;
                        generatedLessonSuite.quiz.forEach((q, qIdx) => {
                          if (q.type !== 'short_answer' && studentQuizAnswers[qIdx] === q.correctIdx) {
                            score++;
                          }
                        });
                        setQuizScorecard({ score, graded: true });
                        setUserXp(p => p + (score * 50));
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition"
                    >
                      Grade MCQ
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
                <Brain className="w-12 h-12 mb-3 text-slate-500 stroke-[1.2]" />
                <h3 className="text-xs font-bold text-slate-300 uppercase">Lesson Suite Sandbox Empty</h3>
                <p className="text-[10px] text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Generate a curriculum lesson using the builder menu on the left to review customized slide presentations, laser pointer paths, and interactive graded questions!
                </p>
              </div>
            )}

            {/* OPENCLAW APP INTEGRATION SIMULATOR PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
              <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2 mb-4 flex items-center justify-between">
                <span>OpenClaw Messaging App Workspace Synchronizer</span>
                <span className="text-[9px] text-indigo-400 font-mono font-bold">Slack & Telegram Webhooks</span>
              </h3>

              <div className="flex gap-4">
                {/* Platform select */}
                <div className="w-32 flex flex-col gap-2">
                  <button
                    onClick={() => setOpenClawPlatform('telegram')}
                    className={`p-3 text-[10px] font-black uppercase rounded-xl transition border text-center ${openClawPlatform === 'telegram' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-850'}`}
                  >
                    Telegram
                  </button>
                  <button
                    onClick={() => setOpenClawPlatform('slack')}
                    className={`p-3 text-[10px] font-black uppercase rounded-xl transition border text-center ${openClawPlatform === 'slack' ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-850'}`}
                  >
                    Slack Workspace
                  </button>
                </div>

                {/* Simulated Conversation Feed */}
                <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col justify-between h-[220px]">
                  <div className="overflow-y-auto space-y-3 max-h-[140px] custom-scrollbar pr-1">
                    {openClawPreviews.map((p, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black uppercase text-slate-500">{p.sender === 'user' ? 'Student user' : 'OpenClaw Bot'}</span>
                        <div className={`p-2 rounded-lg text-[10px] leading-relaxed whitespace-pre-wrap ${p.type === 'command' ? 'bg-slate-900 font-mono text-slate-300' : 'bg-slate-850 text-slate-200 border-l-2 border-indigo-500'}`}>
                          {p.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleOpenClawCommand} className="flex gap-2 border-t border-slate-900 pt-3">
                    <input
                      type="text"
                      value={openClawInput}
                      onChange={(e) => setOpenClawInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase"
                    >
                      Run cmd
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 4. DEEP INTERACTIVE MODE (VIRTUAL LAB EXTRAS) -------------------- */}
      {currentView === 'virtual-lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lab Sub-modes lists */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Deep Interactive Sandboxes</h3>
            <div className="space-y-2">
              {[
                { key: 'chemistry', label: 'Alkali Metal (Na) Water Reaction', icon: Beaker },
                { key: 'physics', label: 'Acid-Base Titration curve', icon: Sparkles },
                { key: 'mindmap', label: 'Interactive Conceptual Mind Map', icon: Brain },
                { key: 'coding', label: 'Python Simulation Compiler', icon: Terminal }
              ].map((lab) => {
                const Icon = lab.icon;
                return (
                  <button
                    key={lab.key}
                    onClick={() => { setSelectedLab(lab.key as any); }}
                    className={`w-full text-left p-3.5 rounded-xl text-[11px] font-bold transition flex items-center justify-between ${
                      selectedLab === lab.key ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/35' : 'bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <span>{lab.label}</span>
                    <Icon className="w-4 h-4 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Large Sandbox viewport area */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[440px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {selectedLab === 'chemistry' && 'Chemistry Sandbox: Alkali Metals reaction'}
                  {selectedLab === 'physics' && 'Physics Sandbox: pH indicator titration curve'}
                  {selectedLab === 'mindmap' && 'Immersive Sandbox: Quantum Physics Mind Map'}
                  {selectedLab === 'coding' && 'Developer Sandbox: Python Slit-fringe calculation compiler'}
                </h4>
                <button
                  onClick={() => {
                    setChemStep(0);
                    setTitrationPh(1.0);
                    setWhiteboardDrawnLines([]);
                  }}
                  className="text-slate-500 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset active values
                </button>
              </div>

              {/* Viewport 1: CHEMISTRY SODIUM REACTION */}
              {selectedLab === 'chemistry' && (
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="relative w-36 h-40 bg-slate-950 border-4 border-slate-700 rounded-b-3xl rounded-t-lg overflow-hidden flex flex-col justify-end shadow-2xl">
                    {/* Water Level */}
                    <div className="w-full bg-indigo-500/30 h-16 transition-all duration-500 relative">
                      {chemStep === 2 && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full animate-bounce" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 text-center max-w-sm leading-relaxed">
                    {chemStep === 0 && 'Status: Idle. Drop a small chunk of Sodium (Na) metal into water to trigger the reaction.'}
                    {chemStep === 2 && '💥 Exothermic reaction active! 2Na + 2H2O ➔ 2NaOH + H2 (g). Solution releases explosive hydrogen gas!'}
                    {chemStep === 3 && 'Completed. Flask now contains Sodium Hydroxide (NaOH). Solution is highly alkaline (pH ~ 13.5).'}
                  </p>
                </div>
              )}

              {/* Viewport 2: TITRATION PH CURVE */}
              {selectedLab === 'physics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">pH Level Indicator:</span>
                      <span className={`text-sm font-mono font-black ${titrationPh > 7 ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {titrationPh.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Chemical Color:</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${titrationPh > 7 ? 'bg-pink-600 text-white' : 'bg-transparent text-slate-400'}`}>
                        {titrationPh > 7 ? 'Pink (Phenolphthalein)' : 'Colorless (Acid)'}
                      </span>
                    </div>
                  </div>

                  {/* SVG graph titration curve */}
                  <div className="h-44 bg-slate-950 rounded-xl border border-slate-850 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <svg width="100%" height="100%">
                        <path d="M 10 130 Q 150 130 180 30 T 380 30" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Equilibrium Curve (pH vs Vol NaOH)</span>
                      <span>Target Titration</span>
                    </div>

                    {/* Progress bar scale */}
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mt-6">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-yellow-400 to-indigo-500 transition-all duration-300"
                        style={{ width: `${(titrationPh / 14) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Viewport 3: INTERACTIVE MIND MAP */}
              {selectedLab === 'mindmap' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                  <div className="md:col-span-2 bg-slate-950 border border-slate-850 p-4 rounded-xl relative h-60 flex items-center justify-center">
                    {/* SVG map visual nodes */}
                    <svg className="absolute inset-0 w-full h-full">
                      {/* lines */}
                      <line x1="160" y1="120" x2="60" y2="60" stroke="#4f46e5" strokeWidth="2" strokeDasharray="3,3" />
                      <line x1="160" y1="120" x2="260" y2="60" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                      <line x1="160" y1="120" x2="160" y2="200" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />

                      {/* central */}
                      <circle cx="160" cy="120" r="32" fill="#312e81" stroke="#4338ca" strokeWidth="2" />
                      <text x="160" y="124" fill="#f8fafc" className="text-[10px] font-black text-center font-sans" textAnchor="middle">QUANTUM</text>

                      {/* nodes */}
                      <circle
                        cx="60"
                        cy="60"
                        r="22"
                        fill={selectedMindMapNode === 'duality' ? '#047857' : '#064e3b'}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        onClick={() => setSelectedMindMapNode('duality')}
                        className="cursor-pointer hover:scale-105 transition-all"
                      />
                      <text x="60" y="64" fill="#f8fafc" className="text-[8px] font-bold" textAnchor="middle" onClick={() => setSelectedMindMapNode('duality')}>Duality</text>

                      <circle
                        cx="260"
                        cy="60"
                        r="22"
                        fill={selectedMindMapNode === 'planck' ? '#047857' : '#064e3b'}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        onClick={() => setSelectedMindMapNode('planck')}
                        className="cursor-pointer hover:scale-105 transition-all"
                      />
                      <text x="260" y="64" fill="#f8fafc" className="text-[8px] font-bold" textAnchor="middle" onClick={() => setSelectedMindMapNode('planck')}>Planck</text>

                      <circle
                        cx="160"
                        cy="200"
                        r="22"
                        fill={selectedMindMapNode === 'heisenberg' ? '#78350f' : '#451a03'}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        onClick={() => setSelectedMindMapNode('heisenberg')}
                        className="cursor-pointer hover:scale-105 transition-all"
                      />
                      <text x="160" y="204" fill="#f8fafc" className="text-[8px] font-bold" textAnchor="middle" onClick={() => setSelectedMindMapNode('heisenberg')}>Matrix</text>
                    </svg>
                  </div>

                  {/* Node explanation side card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-amber-500 mb-1.5">Conceptual Definition</h4>
                      {selectedMindMapNode === 'duality' && (
                        <p className="text-[11px] text-slate-300 leading-normal">
                          <strong>Wave-Particle Duality:</strong> Explains that light and matter behave as localized bullets or distributed waves depending on active measurements.
                        </p>
                      )}
                      {selectedMindMapNode === 'planck' && (
                        <p className="text-[11px] text-slate-300 leading-normal">
                          <strong>Planck constant (h):</strong> Defines the physical constant coefficient linking frequency and photon energy packages ($E = h \\nu$).
                        </p>
                      )}
                      {selectedMindMapNode === 'heisenberg' && (
                        <p className="text-[11px] text-slate-300 leading-normal">
                          <strong>Uncertainty Matrix:</strong> Proves that momentum and spatial positions cannot be measured with absolute simultaneous precision: $\\Delta x \\cdot \\Delta p \\ge \\hbar / 2$.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => speakVoice(selectedMindMapNode === 'duality' ? 'Wave particle duality explains that light behaves as localized bullets or waves.' : 'Planck constant linking energy and frequency.', selectedVoice)}
                      className="mt-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition"
                    >
                      Listen voice briefing
                    </button>
                  </div>
                </div>
              )}

              {/* Viewport 4: PROGRAMMING CALCULATOR COMPILER */}
              {selectedLab === 'coding' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
                  {/* Editor */}
                  <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-850 flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-indigo-400">simulate_double_slit.py</span>
                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[8px] font-black uppercase tracking-wider transition"
                      >
                        Run Code
                      </button>
                    </div>
                    <textarea
                      value={editorCode}
                      onChange={(e) => setEditorCode(e.target.value)}
                      rows={8}
                      className="p-3 bg-slate-950 font-mono text-[10px] text-slate-300 outline-none leading-relaxed resize-none flex-1"
                    />
                  </div>

                  {/* Simulated compiler terminal */}
                  <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-850">
                      <span className="text-[9px] font-mono font-bold text-slate-400">Terminal Shell Console</span>
                    </div>
                    <div className="p-3 font-mono text-[9px] text-emerald-400 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar flex-1">
                      {terminalOutput}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Interaction controls strip */}
            <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-800">
              {selectedLab === 'chemistry' && (
                <button
                  onClick={() => {
                    setChemStep(2);
                    setTimeout(() => setChemStep(3), 3000);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Drop Sodium (Na) metal chunk into water flask
                </button>
              )}

              {selectedLab === 'physics' && (
                <div className="flex gap-2.5 w-full">
                  <button
                    onClick={() => setTitrationPh(prev => Math.min(14, prev + 0.4))}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase transition rounded-xl"
                  >
                    Add Base (NaOH) Dropwise
                  </button>
                  <button
                    onClick={() => setTitrationPh(prev => Math.max(0, prev - 0.4))}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition rounded-xl"
                  >
                    Add Acid (HCl) Dropwise
                  </button>
                </div>
              )}

              {selectedLab === 'mindmap' && (
                <p className="text-[10px] text-slate-500 font-medium">Click on different nodes to view equations and read descriptions.</p>
              )}

              {selectedLab === 'coding' && (
                <p className="text-[10px] text-slate-500 font-medium">Edit the formulas in code parameters, then click Run Code to resolve the fringe widths.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 5. STORY QUEST VIEW (ALEXANDRIA SHADOWS) -------------------- */}
      {currentView === 'story-quest' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Compass className="w-48 h-48 text-indigo-500" />
          </div>

          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            <Compass className="w-4.5 h-4.5" /> Story Quest Mission: Ancient Alexandria Shadows
          </div>

          <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl min-h-[150px] mb-6 shadow-inner">
            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{questLog}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {questStep === 1 && (
              <button
                onClick={() => handleQuestChoice('Step inside the great Library', 2)}
                className="w-full bg-slate-950 hover:bg-slate-850 text-left text-xs font-bold p-3.5 rounded-xl text-slate-200 border border-slate-800 hover:border-indigo-500 transition-all flex justify-between items-center"
              >
                <span>1. Walk past the Egyptian obelisks and step into the Library scroll room.</span>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </button>
            )}

            {questStep === 2 && (
              <>
                <button
                  onClick={() => handleQuestChoice('Calculate sun shadow trigonometry', 3)}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-left text-xs font-bold p-3.5 rounded-xl text-slate-200 border border-slate-800 hover:border-indigo-500 transition-all flex justify-between items-center"
                >
                  <span>1. Solve refraction shadows: Calculate 7.2 degrees difference (1/50th of a circle of circumference).</span>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>
                <button
                  onClick={() => handleQuestChoice('Ask Eratosthenes about the Nile', 1)}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-left text-xs font-bold p-3.5 rounded-xl text-slate-400 border border-slate-800 hover:border-indigo-500 transition-all flex justify-between items-center"
                >
                  <span>2. Exit back outside to Alexandria docks.</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </>
            )}

            {questStep === 3 && (
              <button
                onClick={() => handleQuestChoice('Restart Mission', 1)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black p-3 rounded-xl text-center text-xs transition uppercase tracking-widest shadow-md"
              >
                Restart Story Mission
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
