import React, { useState, useEffect } from 'react';
import { Award, Timer, CheckCircle, XCircle, ChevronRight, BookOpen, GraduationCap, Flame, Sparkles } from 'lucide-react';

interface ExamPortalProps {
  currentView: string; // 'exam-dojo' | 'mock-test' | 'neet-coach' | 'jee-coach' | 'keam-coach' | 'cuet-coach'
  onViewChange: (view: string) => void;
  aiResponseTrigger: (prompt: string, speaker: string, callback: (res: string) => void) => void;
  isThinking: boolean;
}

export const ExamPortal: React.FC<ExamPortalProps> = ({
  currentView,
  onViewChange,
  aiResponseTrigger,
  isThinking
}) => {
  // Question banks
  const entranceQuestions = {
    NEET: [
      { question: "Which of the following is correct regarding cell division?", options: ["Meiosis reduces chromosome number by half", "Mitosis results in 4 daughter cells", "Interphase occupies only 5% of cell cycle", "Cytokinesis is always karyokinesis"], correctIndex: 0, explanation: "Meiosis is a reductional division where diploid parent cell divides to form 4 haploid gamete cells with half the chromosome number." },
      { question: "The major component of biogas is:", options: ["Ethane", "Propane", "Carbon dioxide", "Methane"], correctIndex: 3, explanation: "Methane (CH4) makes up about 50-70% of biogas and is highly combustible." }
    ],
    JEE: [
      { question: "For a particle executing simple harmonic motion, the displacement is given by x = A sin(wt). Find the kinetic energy at x = A/2.", options: ["(1/4) kA^2", "(3/8) kA^2", "(1/2) kA^2", "(3/4) kA^2"], correctIndex: 1, explanation: "Total Energy = (1/2) kA^2. Potential Energy = (1/2) k(A/2)^2 = (1/8) kA^2. Therefore, Kinetic Energy = Total Energy - PE = (3/8) kA^2." },
      { question: "The matrix A = [[0, 1], [-1, 0]] represents a rotation of:", options: ["90 degrees counter-clockwise", "180 degrees", "45 degrees clockwise", "90 degrees clockwise"], correctIndex: 0, explanation: "Multiplying with vector [x, y]^T gives [-y, x]^T which represents a rotation of 90 degrees counter-clockwise about the origin." }
    ],
    KEAM: [
      { question: "The coefficient of linear expansion of a solid depends on:", options: ["Length of the solid", "Temperature change", "Nature of the material", "Applied load"], correctIndex: 2, explanation: "The coefficient of linear expansion is an intrinsic property of a solid and depends purely on the nature of its material." }
    ],
    CUET: [
      { question: "In public finance, which tax is strictly progressive?", options: ["Sales Tax", "Value Added Tax", "Income Tax", "GST"], correctIndex: 2, explanation: "Income tax is progressive as tax rates rise dynamically with the taxpayers income level." }
    ]
  };

  // State managers
  const [selectedCoach, setSelectedCoach] = useState<'NEET' | 'JEE' | 'KEAM' | 'CUET'>('NEET');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completedQuestionsCount, setCompletedQuestionsCount] = useState(0);

  // Timer simulation for Mock Tests
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isTestActive, setIsTestActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTestActive(false);
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  // Handle active views
  useEffect(() => {
    if (currentView === 'neet-coach') setSelectedCoach('NEET');
    if (currentView === 'jee-coach') setSelectedCoach('JEE');
    if (currentView === 'keam-coach') setSelectedCoach('KEAM');
    if (currentView === 'cuet-coach') setSelectedCoach('CUET');
    
    // Reset test states on tab change
    setQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [currentView]);

  const activeQuestionsList = entranceQuestions[selectedCoach] || entranceQuestions.NEET;
  const currentQuestion = activeQuestionsList[qIndex] || activeQuestionsList[0];

  const handleOptionSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isSubmitted) return;
    setIsSubmitted(true);
    setCompletedQuestionsCount(prev => prev + 1);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore(prev => prev + 4); // Standard NEET/JEE scoring (+4 correct)
    } else {
      setScore(prev => prev - 1); // Negative marking (-1 incorrect)
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    if (qIndex < activeQuestionsList.length - 1) {
      setQIndex(prev => prev + 1);
    } else {
      setQIndex(0); // Loop back or finish
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['exam-dojo', 'mock-test', 'neet-coach', 'jee-coach', 'keam-coach', 'cuet-coach'].map((tab) => (
          <button
            key={tab}
            onClick={() => onViewChange(tab)}
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

      {/* TIMED MOCK TEST CONTAINER */}
      {currentView === 'mock-test' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4 text-rose-500" /> Full Mock Test Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1">Simulating KEAM & NEET joint mock series. Multi-subject layout.</p>
            </div>

            {/* Timers & Controls */}
            <div className="flex items-center gap-4">
              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-850 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">Timer:</span>
                <span className="text-xs font-mono font-bold text-rose-500">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => {
                  setIsTestActive(!isTestActive);
                  if (timeLeft === 0) setTimeLeft(900);
                }}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition ${
                  isTestActive ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isTestActive ? 'Pause Test' : 'Start Test Now'}
              </button>
            </div>
          </div>

          {/* Timed Question Block */}
          {isTestActive ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850">
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                  Physics (Mechanics)
                </span>
                <p className="text-xs font-semibold text-white mt-3 leading-relaxed">
                  A body falls freely from a tower of height H. The ratio of distance covered in 1st, 2nd, and 3rd second of its motion is:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["1 : 2 : 3", "1 : 3 : 5", "1 : 4 : 9", "1 : 5 : 9"].map((opt, idx) => (
                  <button
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-850 hover:border-slate-700 text-left text-xs text-slate-300 rounded-xl transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <Award className="w-12 h-12 mb-3 text-slate-700" />
              <p className="text-xs">The timed mock exam has not started. Set up your workspace and click "Start Test Now".</p>
            </div>
          )}
        </div>
      )}

      {/* EXAM DOJO & SPECIFIC ENTRANCE COACHES */}
      {currentView !== 'mock-test' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question workspace */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              
              {/* Heading */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                  {selectedCoach} Intake Mentorship
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Flame className="w-4 h-4 text-orange-500" /> Score: <b className="text-white">{score} XP</b>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 mb-4">
                <h4 className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 font-mono">
                  Question {qIndex + 1}
                </h4>
                <p className="text-xs font-semibold text-white leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${
                      isSubmitted
                        ? idx === currentQuestion.correctIndex
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                          : selectedOption === idx
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-slate-950 border-slate-850 text-slate-500'
                        : selectedOption === idx
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{option}</span>
                    {isSubmitted && idx === currentQuestion.correctIndex && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {isSubmitted && selectedOption === idx && idx !== currentQuestion.correctIndex && <XCircle className="w-4 h-4 text-rose-500" />}
                  </button>
                ))}
              </div>

              {/* Solution Summary / Explanations */}
              {isSubmitted && (
                <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-850 text-xs">
                  <span className="font-bold text-slate-400 block mb-1">Solution Explanation:</span>
                  <p className="text-slate-300 leading-relaxed font-sans">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Control Action Buttons */}
              <div className="flex gap-2 mt-6">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition"
                  >
                    Lock and Submit Option
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1"
                  >
                    Proceed to Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Coaching Performance Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Intake Analytics
            </h3>
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Intake Track:</span>
                <span className="text-white font-bold">{selectedCoach} Coach</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Solved count:</span>
                <span className="text-white font-mono">{completedQuestionsCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Score:</span>
                <span className="text-white font-mono font-bold">{score} Points</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center text-[10px] text-slate-400">
              Each correct answer awards <b>+4 XP</b>. Incorrect answers trigger negative marking of <b>-1 XP</b> matching actual national standard testing patterns.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
