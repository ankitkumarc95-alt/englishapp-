export interface ExplanationDetails {
  rule?: string;
  tutorFeedback?: string; // Sanjeevani warning / Trap feedback
  postMortem?: string; // Subject, Verb, Object breakdown
  howToSpot?: string; // Kaise Pehchane trick
  logic?: string; // Asli logic (Kyon)
  correction?: string; // Exact fix
}

export interface Question {
  id: number;
  fixedStart?: string; // S1 for PQRS
  fixedEnd?: string; // S6 for PQRS
  p?: string;
  q?: string;
  r?: string;
  s?: string;
  text: string; // The core sentence
  options: string[]; // ['A', 'B', 'C', 'D'] with text
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: ExplanationDetails;
  hindiTranslation?: string; // Translation of this sentence
}

export interface VocabularyItem {
  word: string;
  meaning: string; // e.g. "Clamouring [शोर मचाना]"
}

export interface QuizData {
  title: string;
  topic?: string;
  passage?: string; // Passage for RC/Cloze
  questions: Question[];
  vocabularyList?: VocabularyItem[];
  passageHindiTranslation?: string; // Translation of the passage/cloze test
}

export interface ProgressLog {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface BookmarkedQuestion {
  id: string; // Unique bookmark ID
  category: string;
  categoryLabel: string;
  quizTitle: string;
  question: Question;
}
