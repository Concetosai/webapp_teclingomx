import React, { useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, HelpCircle, Sparkles, AlertCircle, Eye, EyeOff, Type as FontIcon, Bookmark, Volume2, Loader2 } from "lucide-react";
import { ReadingResult } from "../types";
import { useGoogleTTS } from "../hooks/useGoogleTTS";

interface Props {
  onBack: () => void;
  onSaveVocabulary: (term: string, definition: string, example: string) => void;
}

const TOPICS = [
  { id: "tech", label: "🤖 Technology & AI", prompt: "Artificial Intelligence, social media impacts, and future of virtual reality" },
  { id: "business", label: "💼 Business & Economy", prompt: "Modern remote work trends, start-up ecosystems, and international trade basics" },
  { id: "science", label: "🧪 Science & Space", prompt: "Space exploration, renewable energy solutions, and ocean depths biodiversity" },
  { id: "culture", label: "🌎 Culture & Tourism", prompt: "Traditional culinary festivals, architectural wonders of Rome, and eco-travel habits" },
  { id: "literature", label: "📚 Literature & Philosophy", prompt: "Short summary analysis of Shakespearean themes, and modern stoicism philosophy" }
];

const LEVELS = ["Beginner (A1/A2)", "Intermediate (B1/B2)", "Advanced (C1/C2)"];

export default function ReadingLab({ onBack, onSaveVocabulary }: Props) {
  const [topic, setTopic] = useState(TOPICS[0].prompt);
  const [level, setLevel] = useState(LEVELS[1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);

  // Custom Topic states
  const [customTopic, setCustomTopic] = useState("");
  const [topicSource, setTopicSource] = useState<"preset" | "custom">("preset");

  const getWordCount = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };
  const customWordCount = getWordCount(customTopic);

  // Layout preference states
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [showTranslation, setShowTranslation] = useState(false);
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Saved word trackers (visual feedback)
  const [savedWords, setSavedWords] = useState<string[]>([]);
  
  // TTS for article reading
  const { speak: ttsSpeak, stop: ttsStop } = useGoogleTTS();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReadAloud = () => {
    if (!result) return;
    if (isSpeaking) {
      ttsStop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    ttsSpeak({
      text: result.articleText,
      speakingRate: 0.85,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleGenerate = async () => {
    if (topicSource === "custom" && (customTopic.trim() === "" || customWordCount > 3)) {
      return;
    }
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setSavedWords([]);

    try {
      const response = await fetch("/api/gemini/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      if (!response.ok) throw new Error("Failed to generate reading material");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!result) return;
    let score = 0;
    result.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleSaveWord = (term: string, definition: string, example: string) => {
    onSaveVocabulary(term, definition, example);
    setSavedWords(prev => [...prev, term]);
  };

  // Font class lookup
  const fontClass = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-relaxed md:text-xl md:leading-loose",
    xl: "text-xl leading-loose md:text-2xl md:leading-loose"
  }[fontSize];

  return (
    <div id="ReadingLab" className="apple-fade-in max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full hover:bg-gray-50 border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#E8F1FF] text-[#0058bc] rounded-lg">
                <BookOpen size={16} />
              </span>
              <span className="text-xs font-bold text-[#0058bc] tracking-wider uppercase">Reading Lab</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">AI Reading Comprehension</h1>
          </div>
        </div>

        {!result && !loading && (
          <button
            onClick={handleGenerate}
            disabled={topicSource === "custom" && (customTopic.trim() === "" || customWordCount > 3)}
            className="w-full md:w-auto px-6 py-3 bg-[#0058bc] text-white font-semibold rounded-2xl hover:bg-[#00479e] disabled:bg-gray-100 disabled:text-gray-400 active:scale-95 transition-all shadow-md shadow-[#0058bc]/10 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Generar Lectura
          </button>
        )}
      </div>

      {!result && !loading ? (
        <div className="space-y-8 max-w-2xl mx-auto py-8">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3.5">
            <AlertCircle className="text-[#0058bc] shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-bold text-blue-900">Lectura Inteligente y Dinámica</h4>
              <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                Nuestra IA generará un texto auténtico sobre el tema elegido, adaptado precisamente al nivel indicado. Incluye traducción instantánea, preguntas de comprensión y vocabulario clave listo para guardar.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2.5">1. Selecciona un Tema de Interés</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TOPICS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTopic(t.prompt);
                      setTopicSource("preset");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      topicSource === "preset" && topic === t.prompt
                        ? "border-[#0058bc] bg-blue-50/20 shadow-sm"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="font-bold text-gray-900 text-sm block">{t.label}</span>
                    <span className="text-[11px] text-gray-400 mt-1 block leading-relaxed">{t.prompt}</span>
                  </button>
                ))}
              </div>

              {/* Custom Topic text box requested by the user */}
              <div className="mt-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 block">
                    ✍️ O propón tu propio Tema de Interés (máximo 3 palabras)
                  </span>
                  <span className={`text-[10px] font-bold ${customWordCount > 3 ? "text-red-500 animate-pulse" : "text-gray-400"}`}>
                    {customWordCount}/3 palabras
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTopic(val);
                      setTopicSource("custom");
                      if (val.trim() !== "") {
                        setTopic(val);
                      } else {
                        setTopic(TOPICS[0].prompt);
                      }
                    }}
                    onFocus={() => {
                      setTopicSource("custom");
                      if (customTopic.trim() !== "") {
                        setTopic(customTopic);
                      }
                    }}
                    placeholder="Ej: los dinosaurios, space travel, comida típica..."
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                      topicSource === "custom"
                        ? "border-[#0058bc] ring-[#0058bc]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Puedes escribir en español o inglés. Como estás aprendiendo inglés, la Inteligencia Artificial generará y adaptará el vocabulario básico y el texto de lectura para que sea fácil de entender.
                </p>
                {customWordCount > 3 && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1 font-medium">
                    <AlertCircle size={13} />
                    <span>Por favor, limita tu propuesta a un máximo de 3 palabras.</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2.5">2. Elige tu Nivel de Inglés</label>
              <div className="flex flex-wrap gap-2.5">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
                      level === l
                        ? "bg-[#0058bc] text-white border-[#0058bc] shadow-sm"
                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={topicSource === "custom" && (customTopic.trim() === "" || customWordCount > 3)}
              className="w-full py-4 bg-[#0058bc] text-white font-bold rounded-2xl hover:bg-[#00479e] disabled:bg-gray-100 disabled:text-gray-400 active:scale-[0.99] transition-all shadow-md shadow-[#0058bc]/10 flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles size={16} /> Generar Artículo y Vocabulario Básico
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-[#0058bc] rounded-full animate-spin"></div>
            <BookOpen className="absolute inset-0 m-auto text-[#0058bc] animate-pulse" size={20} />
          </div>
          <h3 className="font-bold text-gray-900 mt-6 text-lg">Escribiendo tu artículo personalizado...</h3>
          <p className="text-gray-400 text-xs mt-1.5 text-center max-w-sm">
            La Inteligencia Artificial está estructurando un texto sobre <span className="text-[#0058bc] font-semibold">"{topic.split(",")[0]}"</span> de nivel <span className="text-[#0058bc] font-semibold">{level}</span> con preguntas analíticas.
          </p>
        </div>
      ) : result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Side */}
          <div className="lg:col-span-8 space-y-8">
            {/* Reading Card */}
            <div className="bg-[#fcfcfa] rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
              {/* Article layout controls */}
              <div className="flex justify-between items-center border-b border-gray-200/50 pb-4 mb-6">
                <span className="px-3.5 py-1 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  {level}
                </span>

                <div className="flex items-center gap-3">
                  {/* Font controls */}
                  <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl p-1 bg-white">
                    <button 
                      title="Font Size Small"
                      onClick={() => setFontSize("sm")}
                      className={`p-1.5 rounded-lg text-xs font-semibold ${fontSize === "sm" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <FontIcon size={12} />
                    </button>
                    <button 
                      title="Font Size Medium"
                      onClick={() => setFontSize("base")}
                      className={`p-1.5 rounded-lg text-sm font-semibold ${fontSize === "base" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <FontIcon size={14} />
                    </button>
                    <button 
                      title="Font Size Large"
                      onClick={() => setFontSize("lg")}
                      className={`p-1.5 rounded-lg text-base font-semibold ${fontSize === "lg" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <FontIcon size={16} />
                    </button>
                    <button 
                      title="Font Size Extra Large"
                      onClick={() => setFontSize("xl")}
                      className={`p-1.5 rounded-lg text-lg font-semibold ${fontSize === "xl" ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <FontIcon size={18} />
                    </button>
                  </div>

                  {/* Translate switch */}
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      showTranslation 
                        ? "bg-[#0058bc]/5 border-[#0058bc] text-[#0058bc]" 
                        : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {showTranslation ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showTranslation ? "Ocultar Español" : "Ver en Español"}
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <article className="prose max-w-none">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                    {result.title}
                  </h2>
                  <button
                    onClick={handleReadAloud}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSpeaking
                        ? "bg-[#0058bc] text-white border-[#0058bc] shadow-md"
                        : "bg-white border-gray-200 text-gray-600 hover:border-[#0058bc] hover:text-[#0058bc]"
                    }`}
                    title={isSpeaking ? "Detener lectura" : "Leer artículo en voz alta"}
                  >
                    {isSpeaking ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                    {isSpeaking ? "Detener" : "Escuchar"}
                  </button>
                </div>
                
                <div className={`${fontClass} text-gray-800 font-serif whitespace-pre-line antialiased`}>
                  {result.articleText}
                </div>

                {showTranslation && (
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200/60 text-gray-500 font-serif italic text-base whitespace-pre-line leading-relaxed bg-gray-50/50 p-5 rounded-2xl">
                    <span className="font-sans text-[10px] font-bold text-[#0058bc] uppercase tracking-wider block mb-2">Traducción de Referencia</span>
                    {result.translationText}
                  </div>
                )}
              </article>
            </div>

            {/* Comprehension Quiz */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#0058bc] tracking-wider uppercase">Evaluación</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Preguntas de Comprensión</h3>
                <p className="text-xs text-gray-400 mt-0.5">Responde las siguientes preguntas según la lectura para probar tu retención.</p>
              </div>

              <div className="space-y-6">
                {result.questions.map((q, idx) => {
                  const hasAnswered = selectedAnswers[q.id] !== undefined;
                  const isCorrect = selectedAnswers[q.id] === q.correctOptionIndex;

                  return (
                    <div key={q.id} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/20 space-y-4">
                      <div className="flex gap-2.5 items-start">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#0058bc] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm leading-snug">{q.questionText}</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pl-8">
                        {q.options.map((option, oIdx) => {
                          const isSelected = selectedAnswers[q.id] === oIdx;
                          let btnStyle = "border-gray-200/60 bg-white text-gray-700 hover:border-gray-300";
                          
                          if (isSelected) {
                            if (quizSubmitted) {
                              btnStyle = oIdx === q.correctOptionIndex 
                                ? "bg-green-50 border-green-300 text-green-800" 
                                : "bg-red-50 border-red-300 text-red-800";
                            } else {
                              btnStyle = "bg-[#0058bc]/5 border-[#0058bc] text-[#0058bc]";
                            }
                          } else if (quizSubmitted && oIdx === q.correctOptionIndex) {
                            btnStyle = "bg-green-50 border-green-200 text-green-700";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleAnswerSelect(q.id, oIdx)}
                              className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{option}</span>
                              {quizSubmitted && oIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="text-green-600 shrink-0" size={14} />
                              )}
                              {quizSubmitted && isSelected && oIdx !== q.correctOptionIndex && (
                                <XCircle className="text-red-500 shrink-0" size={14} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="pl-8 pt-2.5 border-t border-gray-100/50 mt-2 flex items-start gap-2">
                          <HelpCircle className="text-gray-400 shrink-0 mt-0.5" size={14} />
                          <p className="text-[11px] text-gray-500 leading-relaxed italic">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < result.questions.length}
                  className="w-full py-4 bg-[#0058bc] hover:bg-[#00479e] disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold rounded-2xl transition-all active:scale-[0.99] text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} /> Calificar Respuestas
                </button>
              ) : (
                <div className="bg-[#0058bc]/5 border border-[#0058bc]/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#0058bc]">¡Evaluación Completada!</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Has acertado <span className="font-extrabold text-gray-800">{quizScore}</span> de <span className="font-bold text-gray-800">{result.questions.length}</span> preguntas.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Nueva Lectura
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Vocabulary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-5">
              <div>
                <span className="text-xs font-bold text-[#0058bc] tracking-wider uppercase">Vocabulary</span>
                <h3 className="text-base font-extrabold text-gray-900 mt-0.5">Vocabulario Clave</h3>
                <p className="text-[11px] text-gray-400 leading-normal mt-0.5">Haz clic en el marcador para guardar cualquier palabra en tu biblioteca personal.</p>
              </div>

              <div className="space-y-4 pt-2">
                {result.vocabulary.map((vocab, index) => {
                  const isSaved = savedWords.includes(vocab.term);

                  return (
                    <div key={index} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/10 space-y-2 group transition-all hover:bg-white hover:border-gray-200/60 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-[#0058bc] text-sm">{vocab.term}</h4>
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5 italic">{vocab.translation}</span>
                        </div>
                        <button
                          onClick={() => handleSaveWord(vocab.term, vocab.definition, vocab.example)}
                          disabled={isSaved}
                          className={`p-2 rounded-xl border transition-all ${
                            isSaved 
                              ? "bg-green-50 border-green-100 text-green-600" 
                              : "bg-white border-gray-100 text-gray-400 hover:text-[#0058bc] hover:border-[#0058bc]/20 active:scale-90"
                          }`}
                        >
                          <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>
                      
                      <div className="text-[11px] text-gray-500 leading-relaxed mt-1">
                        <span className="font-bold text-gray-700">Def:</span> {vocab.definition}
                      </div>
                      <div className="text-[11px] text-gray-400 font-serif leading-relaxed italic bg-white/40 p-2 rounded-lg border border-gray-50/50">
                        <span className="font-sans font-bold text-gray-600 text-[10px] not-italic">Example:</span> "{vocab.example}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
