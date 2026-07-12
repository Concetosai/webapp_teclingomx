import React, { useState } from "react";
import { ArrowLeft, Sparkles, HelpCircle, CheckCircle2, XCircle, Lightbulb, BookOpen, ChevronRight } from "lucide-react";
import { TutorResult } from "../types";

interface Props {
  onBack: () => void;
}

const PRESET_TOPICS = [
  { title: "Present Perfect vs Past Simple", desc: "Understand when to use 'have done' vs simple 'did'." },
  { title: "How to use the verb 'GET'", desc: "Master the most versatile verb in spoken English with its many colloquial structures." },
  { title: "Mastering the 3rd Conditional", desc: "Talk about hypothetical regrets or situations in the past safely." },
  { title: "Prepositions: IN, ON, AT", desc: "Stop mixing up time and location preposition boundaries." }
];

export default function AITutor({ onBack }: Props) {
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TutorResult | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const customBehaviorRaw = localStorage.getItem("teclingo_secret_behavior");
      let customSystemInstruction = "";
      let customAppMasterInfo = "";
      
      if (customBehaviorRaw) {
        try {
          const parsed = JSON.parse(customBehaviorRaw);
          customSystemInstruction = parsed.systemInstruction || "";
          customAppMasterInfo = parsed.appMasterInfo || "";
        } catch (e) {
          console.error("Failed to parse custom behavior in AI Tutor", e);
        }
      }

      const response = await fetch("/api/gemini/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: queryText, 
          level: "Intermediate (B2)",
          customSystemInstruction,
          customAppMasterInfo
        })
      });
      if (!response.ok) throw new Error("Tutor unavailable");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: number, oIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: oIdx }));
  };

  return (
    <div id="AITutor" className="apple-fade-in max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0058bc]">AI Labs</span>
          <h2 className="text-2xl font-bold text-gray-900">AI Tutor</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Topics selection */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#F5F5F7] rounded-2xl p-6 border border-gray-200/50 flex flex-col items-center justify-center text-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjcGBhnAytyblJdeQJfZ0832VcvVzSIaUXrjX2pSdG_9ypws2IYEaU7T5jtJm7MyWTaQzc2iE_pZTOgm8phcQ-M6Lt-sFBo3O7tJdI3y6RulYQI6IGNlLgg4W7TXC3JXnDyMXTXhnY5bGH40TFyNIEUcVkiqFcgECKIMZrAoEpmeD8XsGqBNrr10xZVMCa8z4-g6IDCToDhFdavGIWZgRImXnr_XwhpADDQz4BZ1rzuORJdUqxWDFUE7ynDn3oh0hB2caDpmqpCbU" 
              alt="AI Tutor Robot" 
              className="w-36 h-36 object-contain mb-4 filter drop-shadow-md hover:scale-105 transition-transform"
            />
            <p className="text-xs text-gray-600 leading-relaxed">
              Tu profesor personal disponible las 24 horas. Resuelve dudas gramaticales complejas, pide explicaciones y practica con cuestionarios interactivos.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Temas Populares</label>
            <div className="space-y-2">
              {PRESET_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomQuery(topic.title);
                    handleQuery(topic.title);
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-[#0058bc]/5 hover:border-[#0058bc]/30 transition-all flex items-center justify-between group"
                >
                  <div className="max-w-[90%]">
                    <span className="font-bold text-xs text-gray-800 group-hover:text-[#0058bc]">{topic.title}</span>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">{topic.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Answers and interactive Quiz */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {/* Custom query input */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-6">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">¿Qué te gustaría aprender o consultar hoy?</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. ¿Cuál es la diferencia entre standard y criteria?..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery(customQuery)}
                className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0058bc]"
              />
              <button
                onClick={() => handleQuery(customQuery)}
                disabled={loading || !customQuery.trim()}
                className="px-4 bg-[#0058bc] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                <Sparkles size={14} /> Preguntar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#0058bc] mb-4"></div>
              <p className="text-sm">Consultando bases gramaticales del Tutor...</p>
            </div>
          ) : result ? (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Main explanation box */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold text-[#0058bc] uppercase tracking-wider mb-2 block">Tutor's Lecture</span>
                <div className="prose prose-sm text-gray-700 leading-relaxed text-sm">
                  {result.explanation.split('\n').map((para, i) => (
                    <p key={i} className="mb-3">{para}</p>
                  ))}
                </div>
              </div>

              {/* Side by side examples */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Model Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.examples.map((ex, idx) => (
                    <div key={idx} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4">
                      <span className="text-xs font-bold text-[#0058bc] block">"{ex.sentence}"</span>
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{ex.concept}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutor tips */}
              <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
                <Lightbulb size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Tutor Strategy Tips</h4>
                  <ul className="space-y-1.5">
                    {result.tutorTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-gray-600 list-disc list-inside">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instant Tutor Quiz */}
              <div className="border-t border-gray-100 pt-6">
                <div className="bg-[#0058bc]/5 border border-[#0058bc]/10 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Interactive Learning Check</h4>
                  <p className="text-xs text-gray-500 mb-4">Comprueba si has asimilado la explicación con esta breve autoevaluación.</p>

                  <div className="space-y-4">
                    {result.quickQuiz.map((q, qidx) => (
                      <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-800 mb-2">{qidx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, oidx) => {
                            const isSelected = selectedAnswers[q.id] === oidx;
                            const isCorrect = oidx === q.correctIndex;
                            let btnStyle = "border-gray-200 text-gray-600 hover:bg-gray-50";

                            if (isSelected) {
                              btnStyle = "border-[#0058bc] bg-[#0058bc]/5 text-[#0058bc] font-semibold";
                            }

                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                              } else if (isSelected) {
                                btnStyle = "border-red-500 bg-red-50 text-red-800";
                              } else {
                                btnStyle = "border-gray-100 text-gray-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={oidx}
                                onClick={() => handleSelectOption(q.id, oidx)}
                                className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <CheckCircle2 size={12} className="text-emerald-600" />}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="mt-2 text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    {quizSubmitted ? (
                      <button
                        onClick={() => {
                          setSelectedAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="text-xs font-bold text-[#0058bc] hover:underline"
                      >
                        Reintentar Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(selectedAnswers).length < result.quickQuiz.length}
                        className="px-5 py-2 bg-[#0058bc] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
                      >
                        Enviar Cuestionario
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 border border-dashed border-gray-200 rounded-2xl p-8 text-gray-400 bg-slate-50/50">
              <BookOpen size={40} className="text-[#0058bc]/30 mb-3" />
              <p className="text-sm font-medium text-gray-700">Tu lección interactiva de gramática</p>
              <p className="text-xs text-gray-500 text-center max-w-xs mt-1">
                Escribe una pregunta arriba o elige uno de los temas populares de la izquierda para comenzar de inmediato.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
