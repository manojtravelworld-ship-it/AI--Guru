import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, ClipboardList, BookOpen, UserCheck, Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';

interface TeacherPortalProps {
  currentView: string; // 'teacher-dashboard' | 'lesson-builder' | 'question-bank' | 'assignment-manager' | 'student-reports'
  onViewChange: (view: string) => void;
  aiResponseTrigger: (prompt: string, speaker: string, callback: (res: string) => void) => void;
  isThinking: boolean;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentView,
  onViewChange,
  aiResponseTrigger,
  isThinking
}) => {
  // Assignments list
  const [assignments, setAssignments] = useState<Array<{ id: string; title: string; subject: string; deadline: string }>>([
    { id: 'a1', title: 'Chapter 2: Solutions Practice Sheet', subject: 'Chemistry', deadline: '2026-06-30' },
    { id: 'a2', title: 'Calculus Advanced Limit Series', subject: 'Mathematics', deadline: '2026-07-02' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newDeadline, setNewDeadline] = useState('2026-06-30');

  // Custom question builder
  const [questions, setQuestions] = useState<Array<{ id: string; question: string; options: string[]; answer: string }>>([
    { id: 'q1', question: 'What is the SI unit of electric charge?', options: ['Newton', 'Volt', 'Ampere', 'Coulomb'], answer: 'Coulomb' }
  ]);
  const [qText, setQText] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qAns, setQAns] = useState('');

  // Lesson template builder
  const [lessonDraft, setLessonDraft] = useState('');
  const [draftTopic, setDraftTopic] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Trigger automated AI lesson planning for Teachers
  const handleAILessonPlan = () => {
    if (!draftTopic.trim()) return;
    setIsDrafting(true);
    aiResponseTrigger(
      `Create a detailed daily Lesson Plan Outline for teachers on subject: "${draftTopic}". Structure it into 3 phases: 1. Introduction & Hooks (5 mins), 2. Core Lecture & Formula Demonstrations (25 mins), and 3. Guided Quiz & Wrapup (10 mins). Provide in concise professional Markdown.`,
      'system',
      (response) => {
        setIsDrafting(false);
        setLessonDraft(response);
      }
    );
  };

  // Add Assignment
  const handleAddAssignment = () => {
    if (!newTitle.trim()) return;
    const item = {
      id: `a-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      deadline: newDeadline
    };
    setAssignments(prev => [...prev, item]);
    setNewTitle('');
  };

  // Add custom Question
  const handleAddQuestion = () => {
    if (!qText.trim() || !qOpt1.trim() || !qOpt2.trim() || !qAns.trim()) return;
    const item = {
      id: `q-${Date.now()}`,
      question: qText.trim(),
      options: [qOpt1.trim(), qOpt2.trim(), qOpt3.trim() || 'N/A', qOpt4.trim() || 'N/A'],
      answer: qAns.trim()
    };
    setQuestions(prev => [...prev, item]);
    setQText('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
    setQAns('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['teacher-dashboard', 'lesson-builder', 'question-bank', 'assignment-manager', 'student-reports'].map((tab) => (
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

      {/* DASHBOARD & ANALYTICS OVERVIEW */}
      {currentView === 'teacher-dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-28">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Active Class</h4>
            <p className="text-2xl font-black text-white">4 Batches</p>
            <span className="text-[10px] text-emerald-400">● 124 Registered Students</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-28">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Attendance</h4>
            <p className="text-2xl font-black text-white">96.4%</p>
            <span className="text-[10px] text-slate-500">Consolidated Weekly average</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-28">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Quizzes</h4>
            <p className="text-2xl font-black text-white">12 Exams</p>
            <span className="text-[10px] text-amber-500">8 Solved in Exam Dojo</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-28">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Syllabus Complete</h4>
            <p className="text-2xl font-black text-white">72%</p>
            <span className="text-[10px] text-slate-500">SCERT & NCERT tracks</span>
          </div>
        </div>
      )}

      {/* LESSON BUILDER */}
      {currentView === 'lesson-builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plan Lesson Outline</h3>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Lesson Target Topic</label>
              <input
                type="text"
                placeholder="e.g., Photosynthesis Dark reactions"
                value={draftTopic}
                onChange={(e) => setDraftTopic(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleAILessonPlan}
              disabled={isDrafting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
            >
              {isDrafting ? 'Drafting Outline...' : 'Generate AI Lesson Outline'}
            </button>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[300px]">
            {lessonDraft ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">AI Drafted Plan: {draftTopic}</h3>
                <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[300px]">
                  {lessonDraft}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                <FileText className="w-12 h-12 mb-3 stroke-[1.2]" />
                <p className="text-xs">Type a topic and click draft to compile an enterprise teacher lesson template.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUESTION BANK MANAGER */}
      {currentView === 'question-bank' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 h-fit">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Custom MCQ</h3>
            <input
              type="text"
              placeholder="Question statement"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Option A (Correct option)"
              value={qOpt1}
              onChange={(e) => setQOpt1(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Option B"
              value={qOpt2}
              onChange={(e) => setQOpt2(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Option C"
              value={qOpt3}
              onChange={(e) => setQOpt3(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Option D"
              value={qOpt4}
              onChange={(e) => setQOpt4(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Correct Answer explanation text"
              value={qAns}
              onChange={(e) => setQAns(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddQuestion}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
            >
              Save to Question Bank
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Saved Questions Repository</h3>
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-white">{q.question}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-slate-400">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`p-2 rounded bg-slate-950 border ${opt === q.answer ? 'border-emerald-500/20 text-emerald-400' : 'border-slate-850'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENT MANAGER */}
      {currentView === 'assignment-manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assign Task</h3>
            <input
              type="text"
              placeholder="Assignment title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
            />
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Deadline Date</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddAssignment}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
            >
              Issue Homework Assignment
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Pending Student Homework</h3>
            <div className="space-y-3">
              {assignments.map((as) => (
                <div key={as.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">{as.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{as.subject} — Due on {as.deadline}</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold border border-amber-500/20">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROGRESS REPORTS */}
      {currentView === 'student-reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Class Roster & Analytics Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-black tracking-wider uppercase text-[10px]">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Roll No</th>
                  <th className="pb-3">Average Score</th>
                  <th className="pb-3">Completed Lessons</th>
                  <th className="pb-3">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-950/20 transition-all">
                  <td className="py-3 font-semibold text-white">Anand G. Nair</td>
                  <td className="py-3">12</td>
                  <td className="py-3 font-bold text-emerald-400">92% (A+)</td>
                  <td className="py-3">14 Chapters</td>
                  <td className="py-3">98%</td>
                </tr>
                <tr className="hover:bg-slate-950/20 transition-all">
                  <td className="py-3 font-semibold text-white">Reshma Kurian</td>
                  <td className="py-3">14</td>
                  <td className="py-3 font-bold text-emerald-400">88% (A)</td>
                  <td className="py-3">12 Chapters</td>
                  <td className="py-3">95%</td>
                </tr>
                <tr className="hover:bg-slate-950/20 transition-all">
                  <td className="py-3 font-semibold text-white">Fadil Ahmed</td>
                  <td className="py-3">18</td>
                  <td className="py-3 font-bold text-amber-500">74% (B)</td>
                  <td className="py-3">9 Chapters</td>
                  <td className="py-3">92%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
