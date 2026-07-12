export interface PronunciationResult {
  originalText: string;
  ipa: string;
  syllables: string[];
  stressGuide: string;
  commonPitfalls: string[];
  vocalGuide: string;
  practiceExercises: string[];
}

export interface DialogueLine {
  speaker: string;
  text: string;
  spanishTranslation: string;
}

export interface VocabularyTerm {
  term: string;
  definition: string;
  example: string;
}

export interface ListeningQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface FillBlankExercise {
  sentence: string;
  blanks: string[];
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface ListeningResult {
  title: string;
  context: string;
  dialogue: DialogueLine[];
  vocabulary: VocabularyTerm[];
  questions: ListeningQuestion[];
  fillBlank?: FillBlankExercise;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatEvaluation {
  isCorrect: boolean;
  detectedErrors: string;
  correctedText: string;
  explanation: string;
  correctedTextTranslation?: string;
}

export interface ChatResult {
  reply: string;
  evaluation: ChatEvaluation;
  suggestedResponses: string[];
}

export interface TutorQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TutorExample {
  sentence: string;
  concept: string;
}

export interface TutorResult {
  explanation: string;
  examples: TutorExample[];
  quickQuiz: TutorQuizQuestion[];
  tutorTips: string[];
}

export interface TOEFLResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  grammarEvaluation: string;
  vocabularyEvaluation: string;
  exemplarResponse: string;
  tipsToImprove: string[];
}

export interface GrammarErrorDetail {
  originalFragment: string;
  correctedFragment: string;
  errorType: string;
  explanation: string;
}

export interface GrammarResult {
  originalText: string;
  fullyCorrectedText: string;
  errorsFound: GrammarErrorDetail[];
  overallFeedback: string;
}

export interface ReadingVocabulary {
  term: string;
  definition: string;
  translation: string;
  example: string;
}

export interface ReadingQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ReadingResult {
  title: string;
  articleText: string;
  translationText: string;
  vocabulary: ReadingVocabulary[];
  questions: ReadingQuestion[];
}

export interface VocabularyWord {
  term: string;
  definition: string;
  translation: string;
  example: string;
  ipa: string;
}

export interface VocabularyDiscoveryResult {
  words: VocabularyWord[];
}
