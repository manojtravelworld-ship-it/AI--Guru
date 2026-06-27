import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Bookmark, Trash2, RotateCw, Check, Library, Download, FileText, Plus, Sparkles } from 'lucide-react';

interface KnowledgePortalProps {
  currentView: string; // 'ncert-library' | 'scert-library' | 'knowledge-vault' | 'revision-room'
  onViewChange: (view: string) => void;
  aiResponseTrigger: (prompt: string, speaker: string, callback: (res: string) => void) => void;
  isThinking: boolean;
}

export const KnowledgePortal: React.FC<KnowledgePortalProps> = ({
  currentView,
  onViewChange,
  aiResponseTrigger,
  isThinking
}) => {
  // Books lists
  const ncertBooks = [
    { id: 'n1', title: 'Physics Part I', grade: 'Grade 12', subject: 'Physics', chapters: ['Electrostatics', 'Current Electricity', 'Magnetic Effects of Current'] },
    { id: 'n2', title: 'Chemistry Part I', grade: 'Grade 12', subject: 'Chemistry', chapters: ['Solid State', 'Solutions', 'Electrochemistry'] },
    { id: 'n3', title: 'Biology', grade: 'Grade 11', subject: 'Biology', chapters: ['Cell Division', 'Plant Physiology', 'Human Digestion'] }
  ];

  const scertBooks = [
    { id: 's1', title: 'ഭൗതികശാസ്ത്രം (Physics Malayalam)', grade: 'Grade 10', subject: 'Physics', chapters: ['വൈദ്യുതപ്രവാഹത്തിന്റെ ഫലങ്ങൾ', 'വൈദ്യുതകാന്തിക പ്രേരണം', 'പ്രകാശപ്രതിപതനം'] },
    { id: 's2', title: 'രസതന്ത്രം (Chemistry Malayalam)', grade: 'Grade 10', subject: 'Chemistry', chapters: ['വാതകനിയമങ്ങളും മോളാർ സങ്കല്പവും', 'ക്രിയാശീലശ്രേണിയും വൈദ്യുതരസതന്ത്രവും'] }
  ];

  // States
  const [selectedBook, setSelectedBook] = useState<any>(ncertBooks[0]);
  const [selectedChapter, setSelectedChapter] = useState<string>(ncertBooks[0].chapters[0]);
  const [chapterContent, setChapterContent] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Vault states
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; title: string; text: string; date: string }>>(() => {
    const saved = localStorage.getItem('openvidya_knowledge_vault');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', title: 'Planck\'s Constant Formula Note', text: 'E = hf. Planck\'s Constant (h) is 6.626 x 10^-34 Joule-seconds.', date: '2026-06-20' },
      { id: 'v2', title: 'Kerala KEAM Core Physics Laws', text: 'Focus on Faraday\'s Law of Electromagnetic Induction and Lenz\'s Law of opposing flux.', date: '2026-06-21' }
    ];
  });
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Flashcards for Revision Room
  const flashcards = [
    { question: "What is Planck's constant (h) value?", answer: "6.626 × 10^-34 Joule-seconds (J·s)." },
    { question: "State Faraday's First Law of Electromagnetic Induction.", answer: "Whenever magnetic flux linked with a circuit changes, an electromotive force (EMF) is induced in it." },
    { question: "What is the pH indicator Phenolphthalein color in alkaline solution?", answer: "It turns bright pink (magenta)." },
    { question: "പ്രകാശപ്രതിപതനം എന്നാൽ എന്ത്? (What is reflection of light?)", answer: "പ്രകാശം ഒരു മാധ്യമത്തിൽ തട്ടി തിരിച്ചുപോകുന്ന പ്രതിഭാസം." }
  ];
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    localStorage.setItem('openvidya_knowledge_vault', JSON.stringify(savedNotes));
  }, [savedNotes]);

  // Request AI breakdown of selected chapter
  const handleGenerateSummary = (chap: string) => {
    setSelectedChapter(chap);
    setIsLoadingSummary(true);
    aiResponseTrigger(
      `Explain the core scientific or algebraic equations, definitions, and real-world implications of the chapter: "${chap}" from school textbook: "${selectedBook.title}" (Syllabus: ${selectedBook.syllabus || 'NCERT'}). Keep it clear, concise, and structured in Markdown format.`,
      'system',
      (response) => {
        setIsLoadingSummary(false);
        setChapterContent(response);
      }
    );
  };

  // Add note to Vault
  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteText.trim()) return;
    const newNote = {
      id: `v-${Date.now()}`,
      title: newNoteTitle.trim(),
      text: newNoteText.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    setSavedNotes(prev => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteText('');
  };

  // Delete note from Vault
  const handleDeleteNote = (id: string) => {
    setSavedNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 pb-2 overflow-x-auto gap-4">
        {['ncert-library', 'scert-library', 'knowledge-vault', 'revision-room'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              onViewChange(tab);
              // Auto-select correct default library book list
              if (tab === 'scert-library') {
                setSelectedBook(scertBooks[0]);
                setSelectedChapter(scertBooks[0].chapters[0]);
              } else if (tab === 'ncert-library') {
                setSelectedBook(ncertBooks[0]);
                setSelectedChapter(ncertBooks[0].chapters[0]);
              }
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

      {/* NCERT & SCERT LIBRARIES */}
      {(currentView === 'ncert-library' || currentView === 'scert-library') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books Shelf Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Book Shelf</h3>
            <div className="space-y-2">
              {(currentView === 'ncert-library' ? ncertBooks : scertBooks).map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedChapter(book.chapters[0]);
                    setChapterContent('');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition flex flex-col gap-1 ${
                    selectedBook?.id === book.id
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{book.title}</span>
                  <span className="text-[10px] text-slate-500">{book.grade} — {book.subject}</span>
                </button>
              ))}
            </div>

            {selectedBook && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Chapters</h4>
                <div className="space-y-1.5">
                  {selectedBook.chapters.map((chap: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleGenerateSummary(chap)}
                      className={`w-full text-left text-xs p-2 rounded-lg transition-all ${
                        selectedChapter === chap ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Chapter {index + 1}: {chap}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chapters summary view panel */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[350px] flex flex-col justify-between">
            {isLoadingSummary ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs">Analyzing and drafting a textbook study guide...</p>
              </div>
            ) : chapterContent ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedChapter}</h3>
                    <p className="text-[10px] text-slate-500">Curriculum Grounded Smart Study Summary</p>
                  </div>
                  <button
                    onClick={() => {
                      const newNote = {
                        id: `v-${Date.now()}`,
                        title: `Summary: ${selectedChapter}`,
                        text: chapterContent,
                        date: new Date().toISOString().split('T')[0]
                      };
                      setSavedNotes(prev => [newNote, ...prev]);
                      alert('Saved to Knowledge Vault!');
                    }}
                    className="text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg border border-indigo-500/20 font-bold transition flex items-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Keep in Vault
                  </button>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[350px]">
                  {chapterContent}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                <BookOpen className="w-12 h-12 mb-3 stroke-[1.2] text-slate-700" />
                <p className="text-xs">Select any book chapter from the shelf to generate dynamic explanations.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KNOWLEDGE VAULT */}
      {currentView === 'knowledge-vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Node */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" /> Save Personal Notes
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Note Title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
              <textarea
                placeholder="Write equations, laws, formulas or summaries..."
                rows={4}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddNote}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider"
              >
                Store in Vault
              </button>
            </div>
          </div>

          {/* Stored Nodes list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Saved Study Assets</h3>
            {savedNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedNotes.map((note) => (
                  <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 relative group">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-white">{note.title}</h4>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-4 whitespace-pre-wrap">{note.text}</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 mt-1">{note.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-12 text-center text-slate-500">
                <Library className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <p className="text-xs">Your Knowledge Vault is empty. Generate chapter summaries or write notes to save them here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVISION ROOM */}
      {currentView === 'revision-room' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Fast Flashcards</h3>
            <p className="text-xs text-slate-500 mt-1">Review critical formulas and laws before exam sessions.</p>
          </div>

          {/* Interactive Flashcard */}
          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="h-56 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all relative select-none shadow-xl"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              <RotateCw className="w-3 h-3 text-amber-500 animate-spin-slow" /> Click card to flip
            </div>

            <div className="flex-1 flex items-center justify-center text-center px-4">
              {showAnswer ? (
                <p className="text-sm font-medium text-emerald-400 leading-relaxed">{flashcards[cardIndex].answer}</p>
              ) : (
                <p className="text-sm font-semibold text-white leading-relaxed">{flashcards[cardIndex].question}</p>
              )}
            </div>

            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${showAnswer ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {showAnswer ? 'Answer Revealed' : 'Question Prompt'}
            </span>
          </div>

          {/* Carousel controls */}
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-mono text-slate-500">Card {cardIndex + 1} of {flashcards.length}</span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnswer(false);
                  setCardIndex(prev => (prev === 0 ? flashcards.length - 1 : prev - 1));
                }}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnswer(false);
                  setCardIndex(prev => (prev === flashcards.length - 1 ? 0 : prev + 1));
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Next Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
