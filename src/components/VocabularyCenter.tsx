import React, { useState } from "react";
import { ArrowLeft, BookOpen, Sparkles, AlertCircle, Bookmark, Compass, RefreshCw, Layers, Award, ChevronLeft, ChevronRight, CheckCircle2, Play } from "lucide-react";
import { VocabularyWord } from "../types";

interface Props {
  onBack: () => void;
  savedVocabulary: { term: string; definition: string; example: string }[];
  onSaveVocabulary: (term: string, definition: string, example: string) => void;
  onRemoveVocabulary: (term: string) => void;
  language: "es" | "en";
}

const PRESETS = [
  { id: "travel", label_es: "✈️ Viajes y Turismo", label_en: "✈️ Travel & Tourism", prompt: "Common travel, navigation, booking, airport, and transit terms" },
  { id: "job", label_es: "💼 Entrevistas de Trabajo", label_en: "💼 Job Interviews", prompt: "Professional corporate, career development, leadership, and skillset words" },
  { id: "daily", label_es: "🗣️ Conversaciones Diarias", label_en: "🗣️ Everyday Chatting", prompt: "Common idioms, casual greetings, phrasal verbs, and emotional states" },
  { id: "slang", label_es: "🌟 Expresiones y Modismos", label_en: "🌟 Idioms & Expressions", prompt: "Slang, metaphors, common cultural sayings, and modern figures of speech" },
  { id: "academic", label_es: "🎓 Vocabulario Académico", label_en: "🎓 Academic Writing", prompt: "Advanced scientific, formal research, essay transition words, and logical arguments" }
];

export default function VocabularyCenter({ onBack, savedVocabulary, onSaveVocabulary, onRemoveVocabulary, language }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<"discover" | "flashcards" | "quiz">("discover");
  
  // Tab 1: Discover state
  const [presetPrompt, setPresetPrompt] = useState(PRESETS[0].prompt);
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [discoveredWords, setDiscoveredWords] = useState<VocabularyWord[]>([]);
  const [savedStatus, setSavedStatus] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<"Básico" | "Intermedio" | "Avanzado">("Intermedio");
  const [isLevelChanged, setIsLevelChanged] = useState(false);

  // Tab 2: Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Tab 3: Quiz state
  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleDiscover = async () => {
    setLoading(true);
    setDiscoveredWords([]);
    setSavedStatus([]);
    setIsLevelChanged(false);

    try {
      const topicToSend = customTopic.trim() !== "" ? customTopic.trim() : presetPrompt;
      const response = await fetch("/api/gemini/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicToSend, level: selectedLevel }),
      });
      if (!response.ok) throw new Error("Failed to generate words");
      const data = await response.json();
      setDiscoveredWords(data.words || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = (word: VocabularyWord) => {
    onSaveVocabulary(word.term, `${word.ipa ? `[${word.ipa}] ` : ""}${word.definition} (${word.translation})`, word.example);
    setSavedStatus(prev => [...prev, word.term]);
  };

  const handleStartQuiz = async () => {
    setQuizLoading(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);

    try {
      let topicPrompt = customTopic.trim() !== "" ? customTopic.trim() : presetPrompt;
      if (savedVocabulary.length > 0) {
        topicPrompt += ". Standard examples: " + savedVocabulary.slice(0, 5).map(v => v.term).join(", ");
      }
      const response = await fetch("/api/gemini/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicPrompt, level: selectedLevel }),
      });
      const data = await response.json();
      setQuizWords(data.words || []);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerQuiz = (term: string, choiceTranslation: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [term]: choiceTranslation }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizWords.forEach(w => {
      if (quizAnswers[w.term] === w.translation) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  // Translations helper
  const t = {
    back: language === "es" ? "Atrás" : "Back",
    centerTitle: language === "es" ? "Centro de Vocabulario" : "Vocabulary Center",
    subtitle: language === "es" ? "Amplía tu vocabulario y memoriza palabras clave con IA" : "Boost your vocabulary & master key terms with AI",
    tabDiscover: language === "es" ? "Descubrir Vocabulario" : "Discover Words",
    tabFlashcards: language === "es" ? "Tarjetas de Memorización" : "Flipped Flashcards",
    tabQuiz: language === "es" ? "Prueba de Práctica" : "Practice Quiz",
    discoverLabel: language === "es" ? "1. Selecciona una Categoría" : "1. Select a Category",
    discoverBtn: language === "es" ? "Generar Vocabulario" : "Generate Vocabulary",
    loadingText: language === "es" ? "Compilando glosario inteligente..." : "Assembling smart vocabulary list...",
    saveBtn: language === "es" ? "Guardar en Biblioteca" : "Save to Library",
    savedBtn: language === "es" ? "Guardado" : "Saved",
    emptyFlashcards: language === "es" ? "Aún no tienes palabras guardadas en tu biblioteca." : "You don't have any words saved in your library yet.",
    emptyFlashcardsSub: language === "es" ? "Explora y guarda palabras en la pestaña 'Descubrir Vocabulario' o en el Reading Lab." : "Discover and save words in the 'Discover Words' tab or the Reading Lab.",
    goToDiscover: language === "es" ? "Ir a Descubrir" : "Go to Discover",
    flipPrompt: language === "es" ? "Haz clic para girar la tarjeta" : "Click to flip card",
    learned: language === "es" ? "Marcar como Aprendido" : "Mark as Learned",
    removed: language === "es" ? "¡Palabra Aprendida!" : "Word Mastered!",
    quizTitle: language === "es" ? "Preguntas de Práctica de Vocabulario" : "Vocabulary Practice Questions",
    quizSubtitle: language === "es" ? "Encuentra la traducción al español correcta para cada palabra inglesa" : "Find the correct Spanish translation for each English word",
    submitQuiz: language === "es" ? "Calificar Prueba" : "Submit Quiz",
    scoreText: language === "es" ? "Puntuación Final" : "Final Score",
    startQuizBtn: language === "es" ? "Comenzar Prueba de Vocabulario" : "Start Vocabulary Quiz",
  };

  return (
    <div id="VocabularyCenter" className="apple-fade-in max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full hover:bg-gray-50 border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#F3EFFF] text-[#8353E2]/90 rounded-lg">
                <BookOpen size={16} />
              </span>
              <span className="text-xs font-bold text-[#8353E2]/90 tracking-wider uppercase">{t.centerTitle}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{t.centerTitle}</h1>
            <p className="text-gray-400 text-xs mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab("discover")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shrink-0 ${
            activeSubTab === "discover"
              ? "bg-[#8353E2]/5 text-[#8353E2]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Compass size={14} />
          {t.tabDiscover}
        </button>
        <button
          onClick={() => setActiveSubTab("flashcards")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shrink-0 ${
            activeSubTab === "flashcards"
              ? "bg-[#8353E2]/5 text-[#8353E2]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Layers size={14} />
          {t.tabFlashcards} ({savedVocabulary.length})
        </button>
        <button
          onClick={() => setActiveSubTab("quiz")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shrink-0 ${
            activeSubTab === "quiz"
              ? "bg-[#8353E2]/5 text-[#8353E2]"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Award size={14} />
          {t.tabQuiz}
        </button>
      </div>

      {/* Content Render */}
      {activeSubTab === "discover" && (
        <div className="space-y-8">
          <div className="bg-[#8353E2]/5 border border-[#8353E2]/10 rounded-2xl p-5 flex items-start gap-3.5">
            <AlertCircle className="text-[#8353E2] shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-bold text-[#8353E2]">{language === "es" ? "Descubrimiento Personalizado" : "Custom Discovery"}</h4>
              <p className="text-xs text-[#8353E2]/80 mt-1 leading-relaxed">
                {language === "es"
                  ? "Selecciona un tema para que la IA compile una lista de términos altamente relevantes con fonética, traducción y ejemplos cotidianos adaptados."
                  : "Choose a topic and the AI will assemble highly curated words with phonetics, Spanish translation, and real contextual examples."}
              </p>
            </div>
          </div>

          {/* Level Selector Segmented Control */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 block">
              {language === "es" ? "Nivel de Vocabulario" : "Vocabulary Level"}
            </label>
            <div className="bg-slate-100/60 p-1.5 rounded-2xl flex max-w-sm w-full gap-1 border border-slate-200/40">
              {[
                { id: "Básico", label: language === "es" ? "Básico" : "Basic" },
                { id: "Intermedio", label: language === "es" ? "Intermedio" : "Intermediate" },
                { id: "Avanzado", label: language === "es" ? "Avanzado" : "Advanced" }
              ].map(lvl => {
                const isActive = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setSelectedLevel(lvl.id as any);
                      setIsLevelChanged(true);
                    }}
                    className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#8353E2] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30"
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-3">{t.discoverLabel}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPresetPrompt(p.prompt);
                      setCustomTopic("");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      presetPrompt === p.prompt && !customTopic
                        ? "border-[#8353E2] bg-[#8353E2]/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="font-bold text-gray-900 text-sm block">
                      {language === "es" ? p.label_es : p.label_en}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block leading-relaxed">{p.prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">
                {language === "es" ? "✍️ ¿Prefieres otro tema? Proponer tema o categoría personalizada" : "✍️ Prefer another theme? Propose a custom topic or category"}
              </label>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {language === "es"
                  ? "Escribe cualquier tema específico de tu interés (ej. 'Ingeniería', 'Finanzas', 'Vocabulario para aeropuerto', 'Cocina profesional') y la IA creará un glosario a tu medida."
                  : "Type any specific topic of interest (e.g., 'Engineering', 'Finance', 'Airport Vocabulary', 'Professional Cooking') and AI will craft a custom glossary."}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={language === "es" ? "Ej. Inteligencia Artificial, Marketing, Restaurantes, Fútbol..." : "e.g., Artificial Intelligence, Marketing, Restaurants, Soccer..."}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8353E2] bg-white transition-all shadow-sm font-medium"
                />
                {customTopic && (
                  <button
                    type="button"
                    onClick={() => setCustomTopic("")}
                    className="px-3.5 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200/75 rounded-xl transition-all"
                  >
                    {language === "es" ? "Limpiar" : "Clear"}
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleDiscover}
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-md disabled:bg-gray-100 disabled:text-gray-400 relative overflow-hidden ${
                isLevelChanged && !loading
                  ? "bg-gradient-to-r from-[#8353E2] to-[#9260ee] hover:from-[#7245ca] hover:to-[#814fdb] ring-4 ring-offset-2 ring-[#8353E2]/35 animate-pulse"
                  : "bg-[#8353E2] hover:bg-[#6c3cb8] shadow-[#8353E2]/10"
              }`}
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading 
                ? t.loadingText 
                : isLevelChanged 
                  ? (language === "es" ? `🔄 Cargar Vocabulario (${selectedLevel})` : `🔄 Load ${selectedLevel} Vocabulary`) 
                  : customTopic.trim() !== ""
                    ? (language === "es" ? `Generar Vocabulario de "${customTopic.trim()}"` : `Generate "${customTopic.trim()}" Vocabulary`)
                    : t.discoverBtn
              }
              {isLevelChanged && !loading && (
                <span className="absolute top-1 right-2 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase scale-90">
                  {language === "es" ? "NUEVO" : "NEW"}
                </span>
              )}
            </button>
          </div>

          {discoveredWords.length > 0 && (
            <div className="pt-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2">
                {language === "es" ? "Palabras Recomendadas" : "Recommended Words"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveredWords.map((word, idx) => {
                  const isSaved = savedStatus.includes(word.term) || savedVocabulary.some(v => v.term === word.term);

                  return (
                    <div key={idx} className="p-5 border border-gray-100 rounded-2xl space-y-3 bg-white hover:border-[#8353E2]/20 hover:shadow-sm transition-all flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-[#8353E2] text-base">{word.term}</h4>
                          {word.ipa && (
                            <span className="text-xs font-mono text-gray-400">/{word.ipa}/</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-600 italic">"{word.translation}"</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{word.definition}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-50 space-y-3">
                        <div className="text-[11px] text-gray-400 italic font-serif leading-relaxed">
                          <span className="font-sans font-bold text-gray-500 not-italic block mb-0.5 text-[10px]">Example Context</span>
                          "{word.example}"
                        </div>

                        <button
                          onClick={() => handleSaveWord(word)}
                          disabled={isSaved}
                          className={`w-full py-2 border rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                            isSaved
                              ? "bg-green-50 border-green-100 text-green-600 cursor-default"
                              : "bg-white border-gray-200 text-gray-600 hover:text-[#8353E2] hover:border-[#8353E2]/30 active:scale-[0.98]"
                          }`}
                        >
                          <Bookmark size={11} fill={isSaved ? "currentColor" : "none"} />
                          {isSaved ? t.savedBtn : t.saveBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "flashcards" && (
        <div className="space-y-6 max-w-xl mx-auto py-4">
          {savedVocabulary.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Layers className="text-gray-300 mx-auto" size={48} />
              <div>
                <p className="font-bold text-gray-800 text-sm">{t.emptyFlashcards}</p>
                <p className="text-xs text-gray-400 mt-1">{t.emptyFlashcardsSub}</p>
              </div>
              <button
                onClick={() => setActiveSubTab("discover")}
                className="px-5 py-2.5 bg-[#8353E2]/10 text-[#8353E2] font-bold rounded-xl text-xs hover:bg-[#8353E2]/15 transition-colors"
              >
                {t.goToDiscover}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card Container with custom Perspective and transform */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-80 relative cursor-pointer select-none [perspective:1000px] group"
                >
                  <div className={`w-full h-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] relative ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                    
                    {/* Front of card */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#8353E2]/5 to-[#8353E2]/10 border-2 border-[#8353E2]/15 p-8 flex flex-col justify-between items-center text-center [backface-visibility:hidden]">
                      <span className="text-[10px] font-bold text-[#8353E2] tracking-widest uppercase">FRONT SIDE</span>
                      
                      <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                          {savedVocabulary[currentCardIdx].term}
                        </h2>
                        <span className="text-xs text-gray-400 italic block">{t.flipPrompt}</span>
                      </div>

                      <div className="text-[10px] font-semibold text-gray-400">
                        {currentCardIdx + 1} / {savedVocabulary.length}
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border-2 border-gray-100 p-8 flex flex-col justify-between items-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg">
                      <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">TRANSLATION & DETAIL</span>

                      <div className="space-y-4 max-w-sm">
                        <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                          {savedVocabulary[currentCardIdx].term}
                        </h3>
                        <p className="text-xs font-semibold text-[#8353E2] leading-relaxed">
                          {savedVocabulary[currentCardIdx].definition}
                        </p>
                        {savedVocabulary[currentCardIdx].example && (
                          <p className="text-[11px] text-gray-400 italic font-serif leading-relaxed border-t border-gray-50 pt-2.5">
                            "{savedVocabulary[currentCardIdx].example}"
                          </p>
                        )}
                      </div>

                      <div className="text-[10px] font-semibold text-gray-400">
                        {currentCardIdx + 1} / {savedVocabulary.length}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Flip control buttons */}
                <div className="flex justify-between items-center w-full mt-6 gap-4">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIdx(prev => (prev === 0 ? savedVocabulary.length - 1 : prev - 1));
                    }}
                    className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() => {
                      const term = savedVocabulary[currentCardIdx].term;
                      setIsFlipped(false);
                      onRemoveVocabulary(term);
                      if (currentCardIdx >= savedVocabulary.length - 1) {
                        setCurrentCardIdx(0);
                      }
                    }}
                    className="px-5 py-3 border border-red-100 hover:border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-bold rounded-2xl text-xs transition-all active:scale-95"
                  >
                    {t.learned}
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIdx(prev => (prev === savedVocabulary.length - 1 ? 0 : prev + 1));
                    }}
                    className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "quiz" && (
        <div className="space-y-8">
          {quizWords.length === 0 && !quizLoading ? (
            <div className="max-w-md mx-auto text-center py-10 space-y-6">
              <Award className="text-[#8353E2]/20 mx-auto" size={56} />
              <div>
                <h3 className="font-bold text-gray-900 text-base">{language === "es" ? "Pon a Prueba tu Memoria" : "Test Your Memory"}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {language === "es"
                    ? "La IA generará un cuestionario de selección múltiple interactivo y dinámico basado en tus intereses o palabras recopiladas."
                    : "The AI will generate an interactive multi-choice quiz testing translations of curated words."}
                </p>
              </div>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-[#8353E2] text-white font-bold rounded-2xl hover:bg-[#6c3cb8] transition-all text-xs flex items-center justify-center gap-2 mx-auto"
              >
                <Play size={14} />
                {t.startQuizBtn}
              </button>
            </div>
          ) : quizLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="text-[#8353E2] animate-spin mb-4" size={32} />
              <h3 className="font-bold text-gray-900 text-sm">
                {language === "es" ? "Creando preguntas para ti..." : "Formulating quiz questions..."}
              </h3>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <span className="text-xs font-bold text-[#8353E2] tracking-wider uppercase">Vocabulary Match</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{t.quizTitle}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{t.quizSubtitle}</p>
              </div>

              <div className="space-y-5">
                {quizWords.map((qWord, idx) => {
                  const correctTranslation = qWord.translation;
                  // Mix with other translations from quizWords to create fake options
                  const allTranslations = quizWords.map(qw => qw.translation);
                  const fakeOptions = Array.from(new Set([correctTranslation, ...allTranslations]))
                    .slice(0, 4)
                    .sort(() => 0.5 - Math.random());

                  const isCorrect = quizAnswers[qWord.term] === correctTranslation;

                  return (
                    <div key={idx} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/10 space-y-3.5">
                      <div className="flex gap-2 items-center">
                        <span className="w-5 h-5 rounded bg-[#8353E2]/10 text-[#8353E2] text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-gray-900 text-sm">
                          What is the translation for: <span className="text-[#8353E2] text-base font-black">"{qWord.term}"</span>?
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                        {fakeOptions.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qWord.term] === opt;
                          let optStyle = "bg-white border-gray-200 text-gray-700 hover:border-gray-300";

                          if (isSelected) {
                            if (quizSubmitted) {
                              optStyle = opt === correctTranslation
                                ? "bg-green-50 border-green-300 text-green-800"
                                : "bg-red-50 border-red-300 text-red-800";
                            } else {
                              optStyle = "bg-[#8353E2]/5 border-[#8353E2] text-[#8353E2]";
                            }
                          } else if (quizSubmitted && opt === correctTranslation) {
                            optStyle = "bg-green-50 border-green-200 text-green-700";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleAnswerQuiz(qWord.term, opt)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex justify-between items-center ${optStyle}`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < quizWords.length}
                  className="w-full py-4 bg-[#8353E2] hover:bg-[#6c3cb8] disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold rounded-2xl text-xs transition-all active:scale-[0.99]"
                >
                  {t.submitQuiz}
                </button>
              ) : (
                <div className="bg-[#8353E2]/5 border border-[#8353E2]/10 rounded-2xl p-6 text-center space-y-4">
                  <h4 className="text-base font-extrabold text-[#8353E2]">{t.scoreText}</h4>
                  <div className="text-3xl font-black text-gray-900">
                    {quizScore} / {quizWords.length}
                  </div>
                  <p className="text-xs text-gray-400">
                    {quizScore === quizWords.length
                      ? "¡Perfecto! Dominio absoluto del vocabulario."
                      : "Sigue practicando para consolidar estas palabras."}
                  </p>
                  <button
                    onClick={handleStartQuiz}
                    className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    Repetir Prueba
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
