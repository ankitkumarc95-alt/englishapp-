import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ActiveQuiz from "./components/ActiveQuiz";
import { QuizData, ProgressLog, BookmarkedQuestion, Question } from "./types";
import { Sparkles, XCircle, RefreshCw, Bookmark, Award, HelpCircle } from "lucide-react";

export default function App() {
  const [activeSection, setActiveSection] = useState<"dashboard" | "quiz">("dashboard");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentCategoryLabel, setCurrentCategoryLabel] = useState<string>("");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Persistence States
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);

  // Detailed modal review of single bookmark
  const [reviewBookmark, setReviewBookmark] = useState<BookmarkedQuestion | null>(null);

  // Fetch initial persistence from localStorage
  useEffect(() => {
    try {
      const persistedLogs = localStorage.getItem("english_prep_logs_v1");
      const persistedBookmarks = localStorage.getItem("english_prep_bookmarks_v1");
      if (persistedLogs) setLogs(JSON.parse(persistedLogs));
      if (persistedBookmarks) setBookmarks(JSON.parse(persistedBookmarks));
    } catch (e) {
      console.error("Local storage retrieval issue:", e);
    }
  }, []);

  const handleSelectCategory = async (category: string) => {
    const labels: Record<string, string> = {
      rc: "Reading Comprehension",
      se_ranimam: "Spotting Error from Rani Mam 2.0",
      se_hard: "Spotting Error Hard Level",
      cloze: "Cloze Test",
      pqrs: "Para Jumble (PQRS) Hard Level",
      fillers: "Fill in the Blanks (Fillers)",
      improvement: "Sentence Improvement",
      narration: "Narration (Direct & Indirect)",
      voice: "Active & Passive Voice",
    };

    setCurrentCategory(category);
    setCurrentCategoryLabel(labels[category] || "English Practice");
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("Invalid or empty quiz generated. Please retry.");
      }

      setQuizData(data);
      setActiveSection("quiz");
    } catch (error: any) {
      console.error("Generate quiz error:", error);
      setErrorMessage(
        error.message || "Failed to generate dynamic test. Check network and try again, bhai!"
      );
      setCurrentCategory(null);
    } finally {
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Add Progress log on submit
  const handleSubmitResults = (score: number, totalQuestions: number, accuracy: number) => {
    const newLog: ProgressLog = {
      id: Math.random().toString(36).substr(2, 9),
      category: currentCategory || "general",
      categoryLabel: currentCategoryLabel,
      title: quizData?.title || "Grammar Practice Session",
      timestamp: new Date().toISOString(),
      score,
      totalQuestions,
      accuracy,
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    try {
      localStorage.setItem("english_prep_logs_v1", JSON.stringify(updatedLogs));
    } catch (e) {
      console.error(e);
    }
  };

  // Bookmark Management
  const handleAddBookmark = (question: Question) => {
    const newBookmark: BookmarkedQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      category: currentCategory || "general",
      categoryLabel: currentCategoryLabel,
      quizTitle: quizData?.title || "Grammar Drill",
      question,
    };

    const updatedBookmarks = [newBookmark, ...bookmarks];
    setBookmarks(updatedBookmarks);
    try {
      localStorage.setItem("english_prep_bookmarks_v1", JSON.stringify(updatedBookmarks));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveBookmark = (id: string) => {
    const updatedBookmarks = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updatedBookmarks);
    try {
      localStorage.setItem("english_prep_bookmarks_v1", JSON.stringify(updatedBookmarks));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveBookmarkByText = (text: string) => {
    const updatedBookmarks = bookmarks.filter((b) => b.question.text !== text);
    setBookmarks(updatedBookmarks);
    try {
      localStorage.setItem("english_prep_bookmarks_v1", JSON.stringify(updatedBookmarks));
    } catch (e) {
      console.error(e);
    }
  };

  const bookmarkedTexts = bookmarks.map((b) => b.question.text);

  return (
    <div id="english-prep-app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header 
        showBack={activeSection === "quiz"} 
        onBackToDashboard={() => {
          setQuizData(null);
          setCurrentCategory(null);
          setActiveSection("dashboard");
        }} 
      />

      {/* Error Toast banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-4 w-full">
          <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-sans font-semibold">{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded font-bold cursor-pointer transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Central Screen Renderer */}
      <main className="flex-1">
        {activeSection === "dashboard" ? (
          <Dashboard
            onSelectCategory={handleSelectCategory}
            logs={logs}
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onReviewBookmarkQuestion={(bookmark) => setReviewBookmark(bookmark)}
            isGenerating={isGenerating}
            selectedCategory={currentCategory}
          />
        ) : (
          quizData && (
            <ActiveQuiz
              category={currentCategory || ""}
              categoryLabel={currentCategoryLabel}
              quizData={quizData}
              onBack={() => {
                setQuizData(null);
                setCurrentCategory(null);
                setActiveSection("dashboard");
              }}
              onSubmitResults={handleSubmitResults}
              onAddBookmark={handleAddBookmark}
              onRemoveBookmarkByText={handleRemoveBookmarkByText}
              bookmarkedTexts={bookmarkedTexts}
            />
          )
        )}
      </main>

      {/* Footer component */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 font-sans mt-auto">
        <p className="font-semibold text-slate-700">Competitive English prep tool 2.0</p>
        <p className="mt-1">Designed exquisitely for Redmi Note 8 and dynamic web browsers. Powered by Gemini.</p>
      </footer>

      {/* INDIVIDUAL BOOKMARKED QUESTION OVERVIEW / LIVE CHAT POPUP */}
      {reviewBookmark && (
        <div className="fixed inset-0 bg-slate-950/65 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 rounded-t-2xl">
              <div>
                <span className="bg-amber-500 text-slate-900 text-[9px] uppercase font-black px-2 py-0.5 rounded font-mono">
                  {reviewBookmark.categoryLabel}
                </span>
                <h3 className="text-sm font-sans font-bold mt-1">Reviewing Tricky Question</h3>
              </div>
              <button
                onClick={() => setReviewBookmark(null)}
                className="text-xs bg-slate-800 border border-slate-700 font-sans font-bold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer select-none"
              >
                Close Revise
              </button>
            </div>

            {/* Question Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Question Text:</span>
                <p className="text-sm font-sans font-extrabold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {reviewBookmark.question.text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Options:</span>
                <div className="grid grid-cols-1 gap-2">
                  {reviewBookmark.question.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = letter === reviewBookmark.question.correctAnswer;
                    return (
                      <div 
                        key={i}
                        className={`text-xs p-3 rounded-lg border leading-relaxed font-sans ${
                          isCorrect 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold" 
                            : "bg-slate-50 border-slate-200/60 text-slate-600"
                        }`}
                      >
                        <b>({letter})</b> {opt}
                        {isCorrect && <span className="float-right text-emerald-700">✓ Correct Choice</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory data */}
              {reviewBookmark.question.explanation && (
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs font-sans leading-relaxed text-slate-700">
                  
                  {reviewBookmark.question.explanation.rule && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 px-2.5 py-1 rounded font-bold inline-block">
                      🏷️ Rule/Topic: {reviewBookmark.question.explanation.rule}
                    </div>
                  )}

                  {reviewBookmark.question.explanation.tutorFeedback && (
                    <div>
                      <h4 className="font-extrabold text-amber-700 uppercase tracking-wider text-[10px]">Tutor feedback (Dekho Bhai):</h4>
                      <p className="mt-0.5">{reviewBookmark.question.explanation.tutorFeedback}</p>
                    </div>
                  )}

                  {reviewBookmark.question.explanation.postMortem && (
                    <div>
                      <h4 className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Sentence Breakdown:</h4>
                      <p className="mt-0.5 font-mono bg-slate-50 p-2 rounded text-slate-600 border border-slate-100">{reviewBookmark.question.explanation.postMortem}</p>
                    </div>
                  )}

                  {reviewBookmark.question.explanation.logic && (
                    <div>
                      <h4 className="font-extrabold text-emerald-800 uppercase tracking-wider text-[10px]">Asli Logic (Kyon):</h4>
                      <p className="mt-0.5 text-slate-800 font-medium">{reviewBookmark.question.explanation.logic}</p>
                    </div>
                  )}

                  {reviewBookmark.question.explanation.correction && (
                    <div>
                      <h4 className="font-extrabold text-indigo-800 uppercase tracking-wider text-[10px]">Correction Fix:</h4>
                      <p className="mt-0.5 text-emerald-950 font-black bg-emerald-50 border border-emerald-100 p-1.5 rounded inline-block">✨ {reviewBookmark.question.explanation.correction}</p>
                    </div>
                  )}

                  {reviewBookmark.question.hindiTranslation && (
                    <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-slate-800">
                      <h4 className="font-extrabold text-rose-800 uppercase tracking-wider text-[10px] mb-0.5">Hindi Translation (अनुवाद):</h4>
                      <p className="font-extrabold mt-0.5">{reviewBookmark.question.hindiTranslation}</p>
                    </div>
                  )}
                  
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
