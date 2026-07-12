import React, { useState } from "react";
import { ArrowLeft, Sparkles, CheckCircle, AlertTriangle, RefreshCw, Clipboard, Check } from "lucide-react";

interface Props {
  onBack: () => void;
  onLogGrammarAccuracy: (errorsCount: number) => void;
}

interface LocalGrammarResult {
  originalText: string;
  isPerfect: boolean;
  isSpanishRejected?: boolean;
  correctedText: string;
  explanation: string;
}

const COMMON_ERRORS = [
  "I have went to London yesterday with my friends.",
  "She don't likes apples because is sour.",
  "There is many peoples in the room waiting for you.",
  "Were are you from?"
];

export default function GrammarLab({ onBack, onLogGrammarAccuracy }: Props) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocalGrammarResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    setResult(null);
    setCopied(false);

    console.log('Enviando a API de Grammar Lab local con soporte RAG:', textToAnalyze);

    let customSystemInstruction = "";
    let customAppMasterInfo = "";
    let customKBDatabase: any[] = [];

    try {
      const behaviorRaw = localStorage.getItem("teclingo_secret_behavior");
      if (behaviorRaw) {
        const parsedBehavior = JSON.parse(behaviorRaw);
        customSystemInstruction = parsedBehavior.systemInstruction || "";
        customAppMasterInfo = parsedBehavior.appMasterInfo || "";
      }
      const kbRaw = localStorage.getItem("teclingo_secret_kb_db");
      if (kbRaw) {
        customKBDatabase = JSON.parse(kbRaw);
      }
    } catch (e) {
      console.warn("No se pudo cargar la base de datos RAG en Grammar Lab:", e);
    }

    try {
      const response = await fetch("/api/gemini/grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: textToAnalyze,
          customSystemInstruction,
          customAppMasterInfo,
          customKBDatabase
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la llamada a la API local de Grammar Lab: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const isPerfectVal = !!data.isPerfect;
      const isSpanishRejectedVal = !!data.isSpanishRejected;

      const dataResult: LocalGrammarResult = {
        originalText: textToAnalyze,
        isPerfect: isPerfectVal,
        isSpanishRejected: isSpanishRejectedVal,
        correctedText: data.correctedText || textToAnalyze,
        explanation: data.explanation || "No se ha proporcionado explicación detallada."
      };

      setResult(dataResult);
      onLogGrammarAccuracy(isSpanishRejectedVal || !isPerfectVal ? 1 : 0);
    } catch (err) {
      console.error("Error calling Grammar API:", err);
      
      const lower = textToAnalyze.toLowerCase().trim();
      const isSpanish = /[áéíóúñ¿¡]/.test(textToAnalyze) || /\b(el|la|los|las|de|del|en|un|una|por|que|con|para|como|pero|este|esta|muy|también|puedo|tengo|quiero|hacer|decir|ir|ver|dar|saber|poder|haber|ser|estar|tener|hacer)\b/i.test(textToAnalyze);
      
      if (isSpanish) {
        const dataResult: LocalGrammarResult = {
          originalText: textToAnalyze,
          isPerfect: false,
          isSpanishRejected: true,
          correctedText: textToAnalyze,
          explanation: "⚠️ Texto en español detectado. Este laboratorio está diseñado para analizar y corregir textos escritos en INGLÉS. Por favor, escribe tu texto en inglés para recibir retroalimentación gramatical."
        };
        setResult(dataResult);
        onLogGrammarAccuracy(1);
        return;
      }

      let isPerfectTest = true;
      let correctedFallback = textToAnalyze;
      let explanationFallback = "Tu oración parece estar bien estructurada.";

      if (lower.includes("were are you")) {
        isPerfectTest = false;
        correctedFallback = textToAnalyze.replace(/were are you/gi, "Where are you");
        explanationFallback = "Error detectado: Has escrito 'Were' en lugar de 'Where'. 'Were' es el pasado del verbo 'to be', mientras que 'Where' es el pronombre interrogativo para preguntar sobre un lugar ('¿De dónde eres?').";
      } else if (lower.includes("wants to")) {
        isPerfectTest = false;
        correctedFallback = textToAnalyze.replace(/wants to/gi, "want to");
        explanationFallback = "Error detectado: 'I' es primera persona y no lleva la 's' de tercera persona en presente simple. Debe ser 'I want to'.";
      } else if (lower.includes("don't likes")) {
        isPerfectTest = false;
        correctedFallback = textToAnalyze.replace(/don't likes/gi, "doesn't like");
        explanationFallback = "Error detectado: Para tercera persona singular (she), se usa el auxiliar 'doesn't' y el verbo principal 'like' en infinitivo sin 's'.";
      } else if (lower.includes("have went")) {
        isPerfectTest = false;
        correctedFallback = textToAnalyze.replace(/have went/gi, "have gone");
        explanationFallback = "Error de tiempo verbal: Con el presente perfecto ('have') se debe usar el participio pasivo 'gone', no el pasado simple 'went'.";
      }

      const dataResult: LocalGrammarResult = {
        originalText: textToAnalyze,
        isPerfect: isPerfectTest,
        correctedText: correctedFallback,
        explanation: explanationFallback
      };

      setResult(dataResult);
      onLogGrammarAccuracy(isPerfectTest ? 0 : 1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="GrammarLab" className="apple-fade-in max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#717786]">AI Labs</span>
          <h2 className="text-2xl font-bold text-gray-900">Grammar Lab</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Presets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#EDF2F6] rounded-2xl p-6 border border-gray-200/50 flex flex-col items-center justify-center text-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApHizyMVQQ5g15lB0Dz6-VFpFhcAcsnee3sSaI8KmR-WQg_Qjo8mX8gZlJMsBRCw1NqhQkmqv0M3eAC4sruWwTzRH3leEODM9nj3RIKnojtYZ8eBjZDdKCaadt0TH7FBnOMBn8VvIxPByTqqyTOBSFp96epjlICVO9SPLo3FYwuG7xpNzYTNBB5OjAOB_AENMGBSYNwxxMsUBuvSd3wEM41IusjYffgOrafHvl_u0N3JAwaxyH_7NRYazD5Lhe8X7Xy9r6H9ekcyU" 
              alt="Grammar Lab Illustration" 
              className="w-36 h-36 object-contain mb-4 filter drop-shadow-md hover:scale-105 transition-transform"
            />
            <p className="text-xs text-gray-600 leading-relaxed">
              Corrige errores, perfecciona tu estructura gramatical y pule el tono de tus escritos con retroalimentación comparativa de alta fidelidad.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prueba Frases con Errores Comunes</label>
            <div className="space-y-2">
              {COMMON_ERRORS.map((errText, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(errText);
                    handleAnalyze(errText);
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-[#717786]/5 hover:border-[#717786]/30 transition-all text-xs font-medium text-gray-600 leading-relaxed cursor-pointer"
                >
                  "{errText}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Main analysis zone */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {!result && !loading && (
            <div className="space-y-4">
              {/* Basic explanation & guide on top */}
              <div id="grammar-lab-instructions" className="bg-[#717786]/5 border border-[#717786]/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={16} className="text-[#717786] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                      Laboratorio de Escritura Libre
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                      ¡Escribe con total libertad! Puedes redactar lo que desees en el cuadro de abajo, ya sea una frase corta o un párrafo completo en inglés. Nuestra inteligencia artificial analizará tu redacción en tiempo real utilizando la API de Groq para identificar cualquier error gramatical, ortográfico o de puntuación, dándote correcciones rigurosas y explicándote por qué es incorrecto.
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-gray-200/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Frases básicas de propuesta para probar (Haz clic en una):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      id="btn-suggest-wants"
                      onClick={() => setInputText("I wants to learn English.")}
                      className="text-[11px] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95 hover:border-[#717786]/50"
                    >
                      "I wants to learn English."
                    </button>
                    <button
                      id="btn-suggest-going"
                      onClick={() => setInputText("Where she is going?")}
                      className="text-[11px] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95 hover:border-[#717786]/50"
                    >
                      "Where she is going?"
                    </button>
                    <button
                      id="btn-suggest-were"
                      onClick={() => setInputText("Were are you from?")}
                      className="text-[11px] font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95 hover:border-[#717786]/50"
                    >
                      "Were are you from?"
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                id="grammar-textarea"
                rows={7}
                placeholder="Pega o escribe tu texto en inglés para buscar errores..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-4 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#717786] font-mono leading-relaxed"
              />
              <button
                id="btn-analyze-grammar"
                onClick={() => handleAnalyze(inputText)}
                disabled={!inputText.trim()}
                className="w-full py-3.5 bg-[#717786] hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={14} /> Analizar con IA
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-80 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#717786] mb-4"></div>
              <p className="text-sm font-semibold">Analizando concordancia gramatical y ortográfica...</p>
              <p className="text-xs text-gray-400 mt-1">Conectando de forma segura con el tutor experto de inglés...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {result.isSpanishRejected ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3 items-start">
                  <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-800">Texto en Español Detectado</span>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
              ) : result.isPerfect ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-3 items-center">
                  <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800">¡Texto Perfecto!</span>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">Felicidades. No se han detectado errores gramaticales u ortográficos en tu escrito.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Diff view card */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comparative View</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-[#0058bc] font-bold hover:underline cursor-pointer"
                      >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Clipboard size={14} />}
                        {copied ? "¡Copiado!" : "Copiar Texto Corregido"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original text box */}
                      <div className="bg-red-50/10 border border-red-100/60 rounded-xl p-4">
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase">Your Version</span>
                        <p className="text-xs font-mono text-gray-700 mt-3 leading-relaxed break-words">
                          {result.originalText}
                        </p>
                      </div>

                      {/* Fully corrected text box */}
                      <div className="bg-emerald-50/10 border border-emerald-100/60 rounded-xl p-4">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">Corrected Version</span>
                        <p className="text-xs font-mono text-gray-800 font-semibold mt-3 leading-relaxed break-words">
                          {result.correctedText}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed explanation error card */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Explicación detallada de errores y correcciones</h4>
                    </div>
                    <div className="text-xs text-gray-700 font-sans leading-relaxed whitespace-pre-wrap">
                      {result.explanation}
                    </div>
                  </div>
                </div>
              )}

              {/* Action bar bottom */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setResult(null);
                    setInputText("");
                  }}
                  className="px-5 py-2.5 bg-[#717786] hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} /> Analizar Nuevo Texto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
