import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Bookmark, 
  HelpCircle, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  BookOpen, 
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Award,
  BookCheck,
  Menu,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { QuizData, Question, ChatMessage } from "../types";

interface ActiveQuizProps {
  category: string;
  categoryLabel: string;
  quizData: QuizData;
  onBack: () => void;
  onSubmitResults: (score: number, totalQuestions: number, accuracy: number) => void;
  onAddBookmark: (question: Question) => void;
  onRemoveBookmarkByText: (text: string) => void;
  bookmarkedTexts: string[];
}

export default function ActiveQuiz({
  category,
  categoryLabel,
  quizData,
  onBack,
  onSubmitResults,
  onAddBookmark,
  onRemoveBookmarkByText,
  bookmarkedTexts,
}: ActiveQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Active Chats for Grammar Tutor (indexed by question standard id)
  const [questionChats, setQuestionChats] = useState<Record<number, ChatMessage[]>>({});
  const [questionInputs, setQuestionInputs] = useState<Record<number, string>>({});
  const [chatLoading, setChatLoading] = useState<Record<number, boolean>>({});

  // Active "Similar Practice Questions" modal/drawer state
  const [similarQuestions, setSimilarQuestions] = useState<Question[] | null>(null);
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);
  const [similarQuizSubmitted, setSimilarQuizSubmitted] = useState(false);
  const [similarAnswers, setSimilarAnswers] = useState<Record<number, string>>({});
  const [loadingSimilarError, setLoadingSimilarError] = useState("");

  // Quiz timer
  useEffect(() => {
    let timer: any;
    if (!isSubmitted) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const questions = quizData.questions || [];

  const handleSelectOption = (qId: number, optionLetter: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionLetter
    }));
  };

  const handleToggleBookmark = (q: Question) => {
    if (bookmarkedTexts.includes(q.text)) {
      onRemoveBookmarkByText(q.text);
    } else {
      onAddBookmark(q);
    }
  };

  // Calculate score & accuracy on submit
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected && selected.trim() === q.correctAnswer.trim()) {
        correctCount++;
      }
    });

    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    setIsSubmitted(true);
    onSubmitResults(correctCount, total, accuracy);

    // Smooth scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // AI Tutor message sender
  const handleSendTutorMessage = async (qId: number, q: Question) => {
    const textMessage = questionInputs[qId]?.trim();
    if (!textMessage) return;

    // Local state updates
    const updatedChats = questionChats[qId] ? [...questionChats[qId]] : [];
    updatedChats.push({ role: "user", text: textMessage });
    
    setQuestionChats(prev => ({ ...prev, [qId]: updatedChats }));
    setQuestionInputs(prev => ({ ...prev, [qId]: "" }));
    setChatLoading(prev => ({ ...prev, [qId]: true }));

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: q.text,
          explanation: q.explanation,
          userMessage: textMessage,
          history: questionChats[qId] || []
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setQuestionChats(prev => ({
          ...prev,
          [qId]: [...(prev[qId] || []), { role: "model", text: data.reply }]
        }));
      } else {
        throw new Error("No response from AI tutor.");
      }
    } catch (err) {
      console.error(err);
      setQuestionChats(prev => ({
        ...prev,
        [qId]: [...(prev[qId] || []), { role: "model", text: "Bhai, network me issue aa raha hai! Ek baar fir se try karo na." }]
      }));
    } finally {
      setChatLoading(prev => ({ ...prev, [qId]: false }));
    }
  };

  // Generate 10 similar questions dynamic helper
  const handleGenerateSimilarOnes = async (q: Question) => {
    setIsGeneratingSimilar(true);
    setSimilarQuestions(null);
    setSimilarAnswers({});
    setSimilarQuizSubmitted(false);
    setLoadingSimilarError("");

    try {
      const response = await fetch("/api/get-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionData: q }),
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setSimilarQuestions(data);
      } else {
        throw new Error("Invalid structure returned");
      }
    } catch (err: any) {
      console.error(err);
      setLoadingSimilarError("Similar mock questions generation failed. Please try again, bhai!");
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  // Score count for the similar popup questions
  const getSimilarScore = () => {
    if (!similarQuestions) return 0;
    let count = 0;
    similarQuestions.forEach((sq, idx) => {
      const userAns = similarAnswers[idx + 1];
      if (userAns && userAns.trim() === sq.correctAnswer.trim()) {
        count++;
      }
    });
    return count;
  };

  // Motivator tag based on score
  const getMotivationalMessage = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct === 100) return "Adbhut! 100% accuracy, bhai! Aap toh English exam ke topper banenge! Ekdum solid execution class logic! 🔥";
    if (pct >= 80) return "Bahut badhiya performance! Aapki grammar pakad bahut strong hai. Choti moti silly mistakes ko resolve karo, mja aa jayega! 👍";
    if (pct >= 50) return "Moderate score, bhai! Rules ko dhyan se padh ke error post-mortem samjho. AI tutor se doubt clear karo fir perfectly crack hoga! 📖";
    return "Nirash mat hona, bhrata! Ye tough questions the. Ek-ek question ka check karo 'Kaise Pehchane' aur 'Asli Logic'. Practice makes perfect! 💪";
  };

  const renderQuickJumpControl = () => {
    return (
      <div id="quick-jump-container" className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Category Question Panel
          </span>
          <span className="font-mono text-xs text-slate-500 font-bold">
            {Object.keys(selectedAnswers).length} of {questions.length} Solved
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const qNum = idx + 1;
            const isCurrent = idx === currentQuestionIndex;
            const isAns = selectedAnswers[q.id] !== undefined;
            const isAnsCorrect = isSubmitted && selectedAnswers[q.id]?.trim() === q.correctAnswer?.trim();

            return (
              <button
                key={q.id || idx}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-black transition-all cursor-pointer select-none ${
                  isSubmitted
                    ? isAnsCorrect
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                      : isAns
                        ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
                        : "bg-slate-250 text-slate-500 hover:bg-slate-300"
                    : isCurrent
                      ? "bg-amber-500 text-white font-black scale-102 ring-2 ring-amber-300 shadow-sm"
                      : isAns
                        ? "bg-slate-700 text-white hover:bg-slate-800"
                        : "bg-slate-100 text-slate-600 border border-slate-200/60 hover:bg-slate-200"
                }`}
              >
                {qNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActiveQuestionBlock = () => {
    if (questions.length === 0) return null;
    const q = questions[currentQuestionIndex];
    const qId = q.id || (currentQuestionIndex + 1);
    const isSelected = selectedAnswers[qId] !== undefined;
    const isBookmarked = bookmarkedTexts.includes(q.text);
    const userAns = selectedAnswers[qId];
    const isUserCorrect = isSubmitted && userAns && userAns.trim() === q.correctAnswer.trim();

    return (
      <div 
        id={`question-card-${qId}`}
        className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 relative select-none transition-all ${
          isSubmitted 
            ? isUserCorrect 
              ? "border-emerald-250 bg-emerald-50/10" 
              : "border-rose-250 bg-rose-50/10" 
            : isSelected 
              ? "border-amber-300 bg-amber-500/[0.005]" 
              : "border-slate-200"
        }`}
      >
        {/* Question Card Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-150 pb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-slate-900 text-white font-mono font-black text-xs w-6 h-6 flex items-center justify-center rounded">
              {currentQuestionIndex + 1}
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <button
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
            onClick={() => handleToggleBookmark(q)}
            className="text-slate-400 hover:text-amber-500 transition-colors p-1"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
        </div>

        {/* SPECIAL FORMATS (PQRS sentences rearrangement) */}
        {category === "pqrs" && (
          <div className="space-y-2 bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs sm:text-xs">
            {q.fixedStart && (
              <div className="font-semibold text-slate-700 flex gap-1">
                <b className="font-mono text-slate-900">S1:</b> <span>{q.fixedStart}</span>
              </div>
            )}
            {q.p && (
              <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                <b className="font-mono text-slate-900">P:</b> <span>{q.p}</span>
              </div>
            )}
            {q.q && (
              <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                <b className="font-mono text-slate-900">Q:</b> <span>{q.q}</span>
              </div>
            )}
            {q.r && (
              <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                <b className="font-mono text-slate-900">R:</b> <span>{q.r}</span>
              </div>
            )}
            {q.s && (
              <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                <b className="font-mono text-slate-900">S:</b> <span>{q.s}</span>
              </div>
            )}
            {q.fixedEnd && (
              <div className="font-semibold text-slate-700 flex gap-1">
                <b className="font-mono text-slate-900">S6:</b> <span>{q.fixedEnd}</span>
              </div>
            )}
          </div>
        )}

        {/* Standard Question Text */}
        <h3 className="text-sm sm:text-sm font-sans font-extrabold text-slate-800 leading-relaxed">
          {q.text}
        </h3>

        {/* Options Radio Grid */}
        <div className="grid grid-cols-1 gap-2.5 mt-4">
          {q.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isOptSelected = selectedAnswers[qId] === letter;
            const isOptCorrect = letter === q.correctAnswer;

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(qId, letter)}
                className={`min-h-[44px] px-4 py-3 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between cursor-pointer select-none gap-2 ${
                  isSubmitted
                    ? isOptCorrect
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold"
                      : isOptSelected
                        ? "bg-rose-50 border-rose-300 text-rose-800 font-bold"
                        : "bg-slate-50 border-slate-100 text-slate-400"
                    : isOptSelected
                      ? "bg-amber-500/10 border-amber-500 text-amber-900 font-bold shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50/[0.2]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`font-mono font-black text-xs uppercase px-1.5 py-0.5 rounded ${
                    isOptSelected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {letter}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </div>

                {isSubmitted && isOptCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                )}
                {isSubmitted && isOptSelected && !isOptCorrect && (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* POST-SUBMISSION DETAILED EXPLANATION */}
        {isSubmitted && q.explanation && (
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 mt-4 space-y-4 shadow-sm animate-fade-in text-xs max-h-[400px] overflow-y-auto scrollbar-thin">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1 ${
                  isUserCorrect 
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {isUserCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{isUserCorrect ? "Correct!" : "Tricked / Error Caught!"}</span>
                </span>
                <span className="text-[11px] text-slate-500 font-sans font-bold">
                  Correct Choice: <b className="font-mono bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded text-xs">{q.correctAnswer}</b>
                </span>
              </div>

              <button
                onClick={() => handleGenerateSimilarOnes(q)}
                className="text-[9px] bg-slate-900 border border-slate-755 hover:bg-amber-500 text-white font-sans font-black px-2 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 uppercase self-start sm:self-auto"
              >
                <BrainCircuit className="w-3 h-3 text-amber-400" />
                <span>Give 10 similar questions</span>
              </button>
            </div>

            {q.explanation.rule && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-2 rounded-md py-1 text-[11px] font-bold inline-block">
                🏷️ {q.explanation.rule}
              </div>
            )}

            {q.explanation.tutorFeedback && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-sans">Warning (Dekho Bhai):</div>
                <p className="text-slate-700 leading-relaxed font-sans font-medium">
                  {q.explanation.tutorFeedback}
                </p>
              </div>
            )}

            {q.explanation.postMortem && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Sentence Breakdown:</div>
                <p className="text-slate-700 font-mono font-medium p-2 bg-slate-100 rounded-lg border border-slate-200/50 leading-relaxed">
                  {q.explanation.postMortem}
                </p>
              </div>
            )}

            {q.explanation.howToSpot && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest font-sans">Kaise Pehchane? (Grammar Trick):</div>
                <p className="text-slate-700 leading-relaxed font-sans font-medium">
                  {q.explanation.howToSpot}
                </p>
              </div>
            )}

            {q.explanation.logic && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-sans">Asli Logic (Reason):</div>
                <p className="text-slate-700 leading-relaxed font-sans font-medium">
                  {q.explanation.logic}
                </p>
              </div>
            )}

            {q.explanation.correction && (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-sans">Correct Segment:</div>
                <p className="bg-emerald-500/10 text-emerald-955 font-sans font-black p-1.5 rounded-lg inline-block border border-emerald-500/10">
                  ✨ Correct: {q.explanation.correction}
                </p>
              </div>
            )}

            {q.hindiTranslation && (
              <div className="border-t border-slate-200 pt-3 flex flex-col gap-0.5">
                <div className="text-[10px] font-black text-rose-700 uppercase tracking-wider font-sans">Hindi Meaning (हिंदी अर्थ):</div>
                <p className="text-slate-800 leading-relaxed font-sans font-bold">
                  {q.hindiTranslation}
                </p>
              </div>
            )}

            {/* AI TUTOR doubts chatbot inside card */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="text-[11px] font-sans font-bold text-slate-800 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-amber-500" />
                Grammar Tutor (Bhai, yahan doubt pucho!)
              </h4>

              {questionChats[qId] && questionChats[qId].length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto bg-white border border-slate-150 p-2.5 rounded-xl shadow-inner scrollbar-thin">
                  {questionChats[qId].map((msg, mIdx) => (
                    <div 
                      key={mIdx} 
                      className={`p-2 rounded text-[11px] leading-relaxed relative ${
                        msg.role === "user" 
                          ? "bg-amber-500/10 text-amber-950 ml-5 font-semibold border-l-2 border-l-amber-500" 
                          : "bg-slate-100 text-slate-800 mr-5 font-medium border-l-2 border-l-slate-400"
                      }`}
                    >
                      <div className="font-bold text-[9px] text-slate-400 uppercase mb-0.5">
                        {msg.role === "user" ? "Aap" : "Grammar Tutor"}
                      </div>
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ask any doubts on this question..."
                  value={questionInputs[qId] || ""}
                  onChange={(e) => setQuestionInputs(prev => ({ ...prev, [qId]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendTutorMessage(qId, q);
                  }}
                  className="flex-1 bg-white border border-slate-300 font-sans text-[11px] px-3 py-2 rounded-lg outline-amber-500 focus:border-amber-500 placeholder-slate-400"
                />
                <button
                  title="Send query"
                  disabled={chatLoading[qId] || !questionInputs[qId]?.trim()}
                  onClick={() => handleSendTutorMessage(qId, q)}
                  className="p-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-lg transition-all cursor-pointer select-none active:scale-95 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {chatLoading[qId] ? (
                    <RefreshCw className="w-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* NAVIGATION CONTROLS ROW */}
        <div id="navigation-controls" className="flex items-center justify-between pt-4 border-t border-slate-100 bg-white">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => {
              setCurrentQuestionIndex(prev => prev - 1);
            }}
            className="text-xs bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-sans font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer select-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs font-black text-slate-600 font-mono">
            {currentQuestionIndex + 1} / {questions.length}
          </div>

          <button
            disabled={currentQuestionIndex === questions.length - 1}
            onClick={() => {
              setCurrentQuestionIndex(prev => prev + 1);
            }}
            className="text-xs bg-slate-900 text-white border border-slate-800 hover:bg-amber-500 hover:text-slate-955 disabled:opacity-30 disabled:cursor-not-allowed font-sans font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer select-none"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    );
  };

  const renderSubmitPromptBar = () => {
    if (isSubmitted) return null;
    return (
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow">
        <div className="text-center sm:text-left">
          <h4 className="text-xs sm:text-sm font-sans font-bold">Have you locked all inputs, bhrata?</h4>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">Attempted {Object.keys(selectedAnswers).length} out of {questions.length} questions.</p>
        </div>
        <button
          onClick={handleSubmitQuiz}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-sans font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 text-center flex items-center justify-center gap-1.5"
        >
          <BookCheck className="w-4 h-4" />
          <span>SUBMIT PRACTICE QUIZ</span>
        </button>
      </div>
    );
  };

  return (
    <div id="quiz-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Back Header & Timer */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 sticky top-[68px] bg-slate-50 z-40 py-2">
        <button
          onClick={onBack}
          className="text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 font-sans font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Arena</span>
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-3">
          <span className="bg-slate-200 text-slate-800 text-[9px] sm:text-[10px] uppercase font-mono font-bold px-1.5 sm:px-2 py-1 rounded-md hidden xs:inline-block">
            {categoryLabel}
          </span>
          
          {/* Question Palette Access Button positioned right next to Time */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-black text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Menu className="w-3.5 h-3.5 text-slate-900" />
            <span>Palette</span>
            <span className="font-mono text-[9px] sm:text-[10px] bg-slate-900 text-amber-400 rounded px-1.5 leading-snug">
              {Object.keys(selectedAnswers).length}/{questions.length}
            </span>
          </button>

          <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-xs text-slate-600 font-bold bg-white border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span className="font-mono">{isSubmitted ? "Done:" : "Time:"} {formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Comfort Sizing Zoom Bar (Crucial for Redmi Note 8 screen comfort) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 border border-slate-200/50 rounded-xl p-2.5 mb-5 text-xs font-sans shadow-xs">
        <div className="flex items-center space-x-1.5">
          <span className="bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase px-2 py-1 rounded border border-amber-500/10">COMFORT VIEW</span>
          <span className="font-semibold text-slate-600 hidden sm:inline">ज़ूम इन / ज़ूम आउट (Comfort Text Zoom):</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.05))}
            className="p-1.5 px-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 text-[11px]"
            title="Slightly Smaller Text"
          >
            <ZoomOut className="w-3 h-3 text-slate-500" />
            <span>A- (छोटा)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setZoomLevel(1.0)}
            className="text-[10px] bg-slate-800 hover:bg-slate-900 text-amber-400 font-black px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
            title="Reset to default 100%"
          >
            {Math.round(zoomLevel * 100)}% (Reset)
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.05))}
            className="p-1.5 px-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-extrabold flex items-center gap-1 transition-all cursor-pointer active:scale-95 text-[11px]"
            title="Slightly Bigger Text"
          >
            <ZoomIn className="w-3 h-3 text-slate-500" />
            <span>A+ (बड़ा)</span>
          </button>
        </div>
      </div>

      {/* Main Title Banner - visible only pre-submission or post-submission as desired, let's keep it visible post-submission for results presentation analysis */}
      {isSubmitted && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl mb-4 relative overflow-hidden shadow">
          <h2 className="text-sm sm:text-base font-sans font-extrabold tracking-tight relative z-10">
            {quizData.title}
          </h2>
          {quizData.topic && (
            <p className="text-[11px] text-slate-350 font-sans mt-1 relative z-10">
              Topic Drill: {quizData.topic}
            </p>
          )}
        </div>
      )}

      {/* TWO PANEL OR CONDITIONAL SINGLE PANEL WORKSPACE LAYOUT WRAPPER */}
      <div className={quizData.passage ? "flex flex-col lg:flex-row gap-6 items-start w-full" : "space-y-6 w-full"}>
        
        {/* READING COMPREHENSION / CLOZE PASSAGE BOX */}
        {quizData.passage && (
          <div id="quiz-passage-wrapper" className="w-full lg:w-7/12 lg:sticky lg:top-[140px] max-h-[380px] lg:max-h-[calc(100vh-220px)] overflow-y-auto bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 scrollbar-thin scroll-smooth">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-sans font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpenCheck className="w-4 h-4 text-sky-500" />
              Examination Passage / Editorial segment
            </h3>

            {quizData.passageHindiTranslation && (
              <button
                onClick={() => setShowPassageTranslation(!showPassageTranslation)}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-sans font-bold flex items-center gap-1 cursor-pointer select-none bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100"
              >
                <span>{showPassageTranslation ? "Hide Hindi Translation" : "Translate Passage Line-By-Line"}</span>
                {showPassageTranslation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Passage Text */}
            <div 
              className="text-slate-800 font-sans font-medium whitespace-pre-line p-2 select-text" 
              style={{ fontSize: `${zoomLevel * 14}px`, lineHeight: "1.7" }}
            >
              {quizData.passage}
            </div>

            {/* Side-by-side Translating segment */}
            {showPassageTranslation && quizData.passageHindiTranslation && (
              <div 
                className="bg-amber-50/50 border border-amber-100 text-amber-900 rounded-xl p-4 font-sans leading-relaxed whitespace-pre-line"
                style={{ fontSize: `${zoomLevel * 12}px`, lineHeight: "1.7" }}
              >
                <h4 className="font-extrabold text-amber-800 mb-2 border-b border-amber-200/60 pb-1 flex items-center gap-1">
                  <span>Clause-by-Clause Hindi translation (अनुवाद):</span>
                </h4>
                {quizData.passageHindiTranslation}
              </div>
            )}
          </div>

          {/* Vocab vault list if present - Show only in post-submit analysis mode as requested by user */}
          {isSubmitted && quizData.vocabularyList && quizData.vocabularyList.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-sans font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>📚 Important Passage Vocabulary (शब्दकोश):</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {quizData.vocabularyList.map((item, idx) => (
                  <span 
                    key={idx}
                    className="bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs px-2.5 py-1.5 rounded-md font-sans font-semibold border border-slate-200/50 transition-colors"
                  >
                    <b className="text-slate-900 font-extrabold">{item.word}</b>: {item.meaning}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTIONS ZONE COLUMN PANEL */}
      <div className={quizData.passage ? "w-full lg:w-5/12 space-y-6 flex-shrink-0" : "w-full space-y-6"}>

      {/* RESULTS DISPLAY ON SUBMIT */}
      {isSubmitted && (
        <>
          <div id="results-banner" className="bg-white border-2 border-amber-200 rounded-2xl p-6 mb-4 shadow flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
            <Award className="w-12 h-12 text-amber-500" />
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-800 font-sans">Mock Evaluation Summary</h3>
              <p className="text-xs text-slate-400 font-mono">Attempt completed under India coaching standards</p>
            </div>

            <div className="grid grid-cols-2 gap-8 py-3 px-8 bg-slate-50 border border-slate-100 rounded-xl max-w-sm w-full">
              <div>
                <div className="text-xs text-slate-500 font-sans font-bold uppercase">Accuracy</div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {Math.round((Object.keys(selectedAnswers).filter(id => {
                    const q = questions.find(item => item.id === Number(id));
                    return q && selectedAnswers[id]?.trim() === q.correctAnswer?.trim();
                  }).length / questions.length) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-sans font-bold uppercase">Correct</div>
                <div className="text-2xl font-black text-slate-800 font-mono">
                  {Object.keys(selectedAnswers).filter(id => {
                    const q = questions.find(item => item.id === Number(id));
                    return q && selectedAnswers[id]?.trim() === q.correctAnswer?.trim();
                  }).length} / {questions.length}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-semibold font-sans bg-amber-500/10 text-amber-900 py-3 px-4 rounded-xl border border-amber-500/10 max-w-xl leading-relaxed">
              {getMotivationalMessage(
                Object.keys(selectedAnswers).filter(id => {
                  const q = questions.find(item => item.id === Number(id));
                  return q && selectedAnswers[id]?.trim() === q.correctAnswer?.trim();
                }).length,
                questions.length
              )}
            </p>
          </div>

          {/* Analysis View Vocabulary Section */}
          {quizData.vocabularyList && quizData.vocabularyList.length > 0 && (
            <div id="analysis-vocabulary-bank" className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3 mb-4">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <BookCheck className="w-5 h-5 text-indigo-600" />
                </span>
                <div>
                  <h3 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest leading-none">
                    📚 Important Passage Vocabulary (शब्दकोश विश्लेषण)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Revise these critical words found in this cloze test/passage to expand your word bank!
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizData.vocabularyList.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 hover:bg-slate-100/60 border border-slate-200/50 p-3 rounded-xl transition-all flex items-start gap-2.5">
                    <span className="font-mono text-[10px] font-black text-indigo-500 bg-indigo-50/50 border border-indigo-100/40 w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900 tracking-wide font-sans">{item.word}</div>
                      <div className="text-xs text-slate-600 font-sans font-semibold">{item.meaning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* QUESTIONS LIST */}
      <div id="questions-list-root" className="space-y-6">
        {questions.map((q, idx) => {
          if (idx !== currentQuestionIndex) return null;
          const qId = q.id || (idx + 1);
          const isSelected = selectedAnswers[qId] !== undefined;
          const isBookmarked = bookmarkedTexts.includes(q.text);
          const userAns = selectedAnswers[qId];
          const isUserCorrect = isSubmitted && userAns && userAns.trim() === q.correctAnswer.trim();

          return (
            <div 
              key={qId}
              className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 relative select-none ${
                isSubmitted 
                  ? isUserCorrect 
                    ? "border-emerald-250 bg-emerald-50/[0.015]" 
                    : "border-rose-250 bg-rose-50/[0.015]" 
                  : isSelected 
                    ? "border-amber-300 bg-amber-500/[0.005]" 
                    : "border-slate-150"
              }`}
            >
              {/* Question Header - Side-By-Side Mobile Compact Row */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center space-x-1.5 animate-fade-in">
                  <span className="bg-slate-900 text-white font-mono font-black text-[10px] w-6 h-6 flex items-center justify-center rounded">
                    {qId}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-black tracking-widest leading-none">
                      {categoryLabel || "Mock"} Question
                    </span>
                    <span className="text-[10px] text-slate-500 font-extrabold font-sans">
                      Active: {currentQuestionIndex + 1}/{questions.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Compact Side-by-Side Question Palette Activator (above question card) */}
                  <button
                    type="button"
                    onClick={() => setIsPaletteOpen(true)}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-905 font-sans font-black text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <Menu className="w-3.5 h-3.5 text-slate-900" />
                    <span>Palette (☰)</span>
                  </button>

                  <button
                    type="button"
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                    onClick={() => handleToggleBookmark(q)}
                    className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                  >
                    <Bookmark className={`w-4.5 h-4.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                </div>
              </div>

              {/* SPECIAL FORMATS (PQRS sentences rearrangement) */}
              {category === "pqrs" && (
                <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-4 font-sans select-text text-xs leading-relaxed">
                  {q.fixedStart && (
                    <div className="font-semibold text-slate-705 flex gap-1">
                      <b className="font-mono text-slate-900">S1:</b> <span>{q.fixedStart}</span>
                    </div>
                  )}
                  {q.p && (
                    <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                      <b className="font-mono text-slate-900">P:</b> <span>{q.p}</span>
                    </div>
                  )}
                  {q.q && (
                    <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                      <b className="font-mono text-slate-900">Q:</b> <span>{q.q}</span>
                    </div>
                  )}
                  {q.r && (
                    <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                      <b className="font-mono text-slate-900">R:</b> <span>{q.r}</span>
                    </div>
                  )}
                  {q.s && (
                    <div className="text-slate-600 flex gap-1 font-medium leading-relaxed">
                      <b className="font-mono text-slate-900">S:</b> <span>{q.s}</span>
                    </div>
                  )}
                  {q.fixedEnd && (
                    <div className="font-semibold text-slate-705 flex gap-1">
                      <b className="font-mono text-slate-900">S6:</b> <span>{q.fixedEnd}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Question Text / Sentence */}
              <h3 className="text-xs sm:text-sm font-sans font-extrabold text-slate-800 leading-relaxed select-text">
                {q.text}
              </h3>

              {/* Options Radio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {q.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isOptSelected = selectedAnswers[qId] === letter;
                  const isOptCorrect = letter === q.correctAnswer;

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(qId, letter)}
                      className={`min-h-[44px] px-4 py-3 rounded-xl border text-left font-sans text-xs transition-all flex items-center justify-between cursor-pointer select-none gap-2 ${
                        isSubmitted
                          ? isOptCorrect
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold"
                            : isOptSelected
                              ? "bg-red-50 border-red-300 text-red-800 font-bold"
                              : "bg-slate-50 border-slate-100 text-slate-400"
                          : isOptSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-900 font-bold shadow-sm"
                            : "bg-white border-slate-200/70 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span 
                          className={`font-mono font-black text-xs uppercase px-1.5 py-0.5 rounded ${
                            isOptSelected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {isSubmitted && isOptCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                      {isSubmitted && isOptSelected && !isOptCorrect && (
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* POST-SUBMISSION DETAILED EXPLANATION */}
              {isSubmitted && q.explanation && (
                <div className="bg-slate-50 border border-slate-200/75 rounded-2xl p-4 sm:p-5 mt-4 space-y-4 shadow-sm animate-fade-in">
                  
                  {/* Correct and error logs banner */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-sans font-bold flex items-center gap-1 ${
                        isUserCorrect 
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {isUserCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{isUserCorrect ? "My Answer correct!" : "Tricked / Error Caught!"}</span>
                      </span>
                      <span className="text-xs text-slate-500 font-sans font-bold">
                        Correct Option: <b className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-sm">{q.correctAnswer}</b>
                      </span>
                    </div>

                    <button
                      onClick={() => handleGenerateSimilarOnes(q)}
                      className="text-[10px] bg-slate-900 border border-slate-700 hover:bg-amber-500 text-white font-sans font-black px-2.5 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 uppercase"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                      <span>Give 10 similar questions</span>
                    </button>
                  </div>

                  {/* Grammar Rule badge */}
                  {q.explanation.rule && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-sans font-bold inline-block">
                      🏷️ {q.explanation.rule}
                    </div>
                  )}

                  {/* Sanjeevani dynamic direct warning */}
                  {q.explanation.tutorFeedback && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-amber-600 uppercase tracking-widest font-sans">Warning / Warning (Dekho Bhai):</div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                        {q.explanation.tutorFeedback}
                      </p>
                    </div>
                  )}

                  {/* Sentence Post Mortem subject verb object identification */}
                  {q.explanation.postMortem && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans">Sentence Post-Mortem (Breakdown):</div>
                      <p className="text-xs bg-slate-100 text-slate-700 font-mono font-medium p-2.5 rounded-lg border border-slate-200/50 leading-relaxed">
                        {q.explanation.postMortem}
                      </p>
                    </div>
                  )}

                  {/* Kaise Pehchane grammar term identify trick */}
                  {q.explanation.howToSpot && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-sky-600 uppercase tracking-widest font-sans">Kaise Pehchane? (Grammar Trick):</div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                        {q.explanation.howToSpot}
                      </p>
                    </div>
                  )}

                  {/* Logical Reason Asli Logic */}
                  {q.explanation.logic && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest font-sans">Asli Logic (Kyon/Reason):</div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                        {q.explanation.logic}
                      </p>
                    </div>
                  )}

                  {/* Final Correction exact replace */}
                  {q.explanation.correction && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest font-sans">Correct Segment (Correction):</div>
                      <p className="text-xs bg-emerald-500/10 text-emerald-950 font-sans font-black p-2 rounded-lg inline-block border border-emerald-500/20">
                        ✨ Correct: {q.explanation.correction}
                      </p>
                    </div>
                  )}

                  {/* Hindi translation of current sentence */}
                  {q.hindiTranslation && (
                    <div className="border-t border-slate-200 pt-3 flex flex-col gap-1">
                      <div className="text-[11px] font-black text-rose-700 uppercase tracking-wider font-sans">Hindi Translation (हिंदी अर्थ):</div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans font-bold">
                        {q.hindiTranslation}
                      </p>
                    </div>
                  )}

                  {/* ACTIVE AI GRAMMAR TUTOR CHAT MODULE */}
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <h4 className="text-xs font-sans font-bold text-slate-800 flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-amber-500" />
                      Grammar Tutor (Bhai, yahan doubt hai? Sabhi doubts pucho!)
                    </h4>

                    {/* Chat Messages Log */}
                    {questionChats[qId] && questionChats[qId].length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto bg-white border border-slate-100 p-3 rounded-xl shadow-inner scrollbar-thin">
                        {questionChats[qId].map((msg, mIdx) => (
                          <div 
                            key={mIdx} 
                            className={`p-2.5 rounded-lg text-xs font-sans leading-relaxed ${
                              msg.role === "user" 
                                ? "bg-amber-500/10 text-amber-950 ml-8 font-semibold border-l-2 border-l-amber-500" 
                                : "bg-slate-100 text-slate-800 mr-8 font-medium border-l-2 border-l-slate-400"
                            }`}
                          >
                            <div className="font-bold text-[10px] text-slate-500 uppercase mb-0.5">
                              {msg.role === "user" ? "Aap" : "Grammar Tutor"}
                            </div>
                            <div className="whitespace-pre-line">{msg.text}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chat Input Group */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Sir, yahan plural verb kyun nahi ho sakta? Pucho..."
                        value={questionInputs[qId] || ""}
                        onChange={(e) => setQuestionInputs(prev => ({ ...prev, [qId]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendTutorMessage(qId, q);
                        }}
                        className="flex-1 bg-white border border-slate-300 font-sans text-xs px-3.5 py-2.5 rounded-xl outline-amber-500 focus:border-amber-500 placeholder-slate-400"
                      />
                      <button
                        title="Send query"
                        disabled={chatLoading[qId] || !questionInputs[qId]?.trim()}
                        onClick={() => handleSendTutorMessage(qId, q)}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-amber-500 text-white rounded-xl transition-all cursor-pointer select-none active:scale-95 disabled:bg-slate-150 disabled:text-slate-400"
                      >
                        {chatLoading[qId] ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ACTION FOOTER BAR: PREVIOUS & NEXT BUTTONS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 select-none disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                  {idx + 1} / {questions.length}
                </span>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="bg-slate-900 border border-slate-800 hover:bg-amber-500 hover:text-slate-900 text-white font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 select-none cursor-pointer"
                  >
                    <span>Next Que</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-[10px] text-amber-600 font-sans font-black uppercase tracking-wider bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                    Last Question
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      </div> {/* Close QUESTIONS ZONE COLUMN PANEL */}
    </div> {/* Close TWO PANEL OR CONDITIONAL SINGLE PANEL WORKSPACE LAYOUT WRAPPER */}

      {/* SIMILAR PRACTICE DRAWER/POPUP (Loads 10 questions) */}
      {(similarQuestions || isGeneratingSimilar || loadingSimilarError) && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col scrollbar-thin">
            
            {/* Drawer Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-sans font-bold">Double-Down Booster Arena</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">10 Newly Generated Practice Questions of exact same style!</p>
                </div>
              </div>
              <button
                onClick={() => setSimilarQuestions(null)}
                className="text-slate-400 hover:text-white font-sans text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer select-none"
              >
                Close Booster
              </button>
            </div>

            {/* Spinner or Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {isGeneratingSimilar ? (
                <div className="text-center py-16 space-y-3">
                  <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                  <p className="text-sm font-sans font-bold text-slate-700">AI is making 10 customized practice questions, bhai...</p>
                  <p className="text-xs text-slate-400 font-sans">Crafting matching error spots or vocabulary fills.</p>
                </div>
              ) : loadingSimilarError ? (
                <div className="text-center py-16 text-rose-600 font-sans space-y-3">
                  <p className="font-extrabold text-sm">{loadingSimilarError}</p>
                  <button 
                    onClick={() => setSimilarQuestions(null)}
                    className="bg-slate-900 text-white text-xs font-sans px-4 py-2 rounded-lg"
                  >
                    Go Back
                  </button>
                </div>
              ) : similarQuestions ? (
                <div className="space-y-6">

                  {similarQuizSubmitted && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-xl text-center space-y-1">
                      <h4 className="text-sm font-extrabold">Booster Practice Completed!</h4>
                      <p className="text-xs font-medium font-sans">
                        You scored: <b className="font-mono text-base">{getSimilarScore()} / 10</b> correctly. Accuracy of {Math.round((getSimilarScore() / 10) * 100)}%!
                      </p>
                    </div>
                  )}

                  {similarQuestions.map((sq, sIdx) => {
                    const sqNum = sIdx + 1;
                    const sqSelected = similarAnswers[sqNum];
                    const isSqCorrect = similarQuizSubmitted && sqSelected && sqSelected.trim() === sq.correctAnswer.trim();

                    return (
                      <div key={sIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="font-bold text-xs text-slate-500 font-mono">Booster Q{sqNum}</div>
                        <p className="text-xs sm:text-xs font-bold font-sans text-slate-800">{sq.text}</p>
                        
                        {/* Option Radio box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {sq.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSqOptSelected = similarAnswers[sqNum] === letter;
                            return (
                              <button
                                key={optIdx}
                                disabled={similarQuizSubmitted}
                                onClick={() => setSimilarAnswers(prev => ({ ...prev, [sqNum]: letter }))}
                                className={`text-xs p-2.5 rounded border text-left font-sans flex items-center justify-between cursor-pointer select-none ${
                                  similarQuizSubmitted
                                    ? letter === sq.correctAnswer
                                      ? "bg-emerald-100 border-emerald-300 text-emerald-800 font-bold"
                                      : isSqOptSelected
                                        ? "bg-red-50 border-red-300 text-red-800"
                                        : "bg-slate-50 border-slate-100 text-slate-400"
                                    : isSqOptSelected
                                      ? "bg-amber-500/10 border-amber-500 text-amber-950 font-bold"
                                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                                }`}
                              >
                                <span className="leading-snug">({letter}) {opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Booster explanation display */}
                        {similarQuizSubmitted && sq.explanation && (
                          <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-xs font-sans space-y-2 leading-relaxed">
                            <div className="text-[10px] font-black text-amber-600 uppercase">Grammar Rule:</div>
                            <p className="text-slate-800">{sq.explanation.rule || "Grammar standard"}</p>
                            <div className="text-[10px] font-black text-sky-600 uppercase">Kaise Pehchane & Logic:</div>
                            <p className="text-slate-700">{sq.explanation.logic || sq.explanation.tutorFeedback}</p>
                            <div className="text-[10px] font-black text-indigo-700 uppercase">Correct Fix:</div>
                            <p className="text-emerald-800 font-extrabold bg-emerald-50 px-2 py-1 rounded inline-block">✨ {sq.explanation.correction}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!similarQuizSubmitted && (
                    <button
                      onClick={() => setSimilarQuizSubmitted(true)}
                      className="w-full bg-slate-900 border border-slate-800 text-white font-sans font-black text-xs p-3.5 rounded-xl hover:bg-amber-500 transition-all cursor-pointer select-none text-center"
                    >
                      Submit Booster Answers
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Question Palette Sidebar/Drawer triggered by "three horizontal lines" button */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background overlay */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer" 
              onClick={() => setIsPaletteOpen(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out slide-in-from-right">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl rounded-l-3xl border-l border-slate-100">
                  {/* Drawer Header */}
                  <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-tl-3xl">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-sans font-black text-slate-800 uppercase tracking-widest">
                          Mock Arena Drawer
                        </h2>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {Object.keys(selectedAnswers).length} of {questions.length} questions answered
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPaletteOpen(false)}
                      className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="sr-only">Close drawer</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer Body - Question Numbers Grid */}
                  <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                    <div>
                      <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider mb-3">
                        Switch Questions / प्रश्न संख्या चुनें
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                        {questions.map((q, idx) => {
                          const qNum = idx + 1;
                          const isCurrent = idx === currentQuestionIndex;
                          const isAns = selectedAnswers[q.id] !== undefined;
                          const isAnsCorrect = isSubmitted && selectedAnswers[q.id]?.trim() === q.correctAnswer?.trim();

                          return (
                            <button
                              key={q.id || idx}
                              onClick={() => {
                                setCurrentQuestionIndex(idx);
                                setIsPaletteOpen(false); // Close drawer on select so they can see the question!
                              }}
                              className={`aspect-square rounded-xl flex flex-col items-center justify-center font-mono text-xs font-black transition-all cursor-pointer select-none border ${
                                isSubmitted
                                  ? isAnsCorrect
                                    ? "bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-sm"
                                    : isAns
                                      ? "bg-rose-500 text-white border-rose-400 hover:bg-rose-600 shadow-sm"
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  : isCurrent
                                    ? "bg-amber-500 text-white border-amber-400 font-extrabold ring-4 ring-amber-100 shadow"
                                    : isAns
                                      ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-900 shadow-sm"
                                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                              }`}
                            >
                              <span className="text-xs font-black">{qNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Legend / संकेत */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      <h4 className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest">
                        Index Legend / संकेतक तालिका
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-3.5 h-3.5 bg-amber-500 border border-amber-400 rounded-sm inline-block" />
                          <span className="text-slate-600 font-sans font-semibold">Active / सक्रिय</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-3.5 h-3.5 bg-slate-800 border border-slate-700 rounded-sm inline-block" />
                          <span className="text-slate-600 font-sans font-semibold">Answered / उत्तरित</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-3.5 h-3.5 bg-slate-50 border border-slate-200 rounded-sm inline-block" />
                          <span className="text-slate-600 font-sans font-semibold">Unanswered / बिना उत्तर</span>
                        </div>
                        {isSubmitted && (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="w-3.5 h-3.5 bg-emerald-500 border border-emerald-400 rounded-sm inline-block" />
                              <span className="text-slate-600 font-sans font-semibold">Correct / सही</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-3.5 h-3.5 bg-rose-500 border border-rose-400 rounded-sm inline-block" />
                              <span className="text-slate-600 font-sans font-semibold">Incorrect / गलत</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Extra assistance section similar to testbook */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                      <h4 className="text-[10px] font-sans font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
                        <span>Redmi Note 8 Layout Optimization</span>
                      </h4>
                      <p className="text-[10px] text-amber-900/80 font-sans leading-relaxed">
                        Optimized touch grid targets and horizontal layout parameters prevent viewport spilling on mobile screens.
                      </p>
                    </div>

                    {/* Submit Practice Quiz Option directly inside the Palette Panel */}
                    {!isSubmitted && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5 text-center">
                          <p className="text-[10px] text-amber-900/80 font-sans font-bold">
                            Attempted: {Object.keys(selectedAnswers).length} / {questions.length} Questions
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleSubmitQuiz();
                            setIsPaletteOpen(false);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 uppercase tracking-wider"
                        >
                          <BookCheck className="w-4 h-4 text-emerald-100" />
                          <span>Submit Practice Quiz</span>
                        </button>
                      </div>
                    )}

                    {/* Close action */}
                    <button
                      type="button"
                      onClick={() => setIsPaletteOpen(false)}
                      className="w-full bg-slate-900 text-white font-sans font-bold text-xs py-3 rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-wider cursor-pointer shadow active:scale-95 text-center mt-2.5"
                    >
                      Resume Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT FLOATING QUESTION PALETTE FAB (FOR MOBILE OR EASY ACCESS COMFORT) */}
      <button
        onClick={() => setIsPaletteOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-slate-950 text-white font-sans font-black text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 hover:bg-amber-500 hover:text-slate-900 border border-slate-800 transition-all cursor-pointer active:scale-95 select-none"
      >
        <Menu className="w-4 h-4 text-amber-400" />
        <span>Palette ({Object.keys(selectedAnswers).length}/{questions.length})</span>
      </button>

    </div>
  );
}
