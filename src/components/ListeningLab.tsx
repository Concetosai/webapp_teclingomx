import React, { useState, useRef } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Square,
  Volume2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  Lock, 
  Unlock, 
  BookOpen, 
  Award, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { ListeningResult } from "../types";
import { useGoogleTTS } from "../hooks/useGoogleTTS";

interface Props {
  onBack: () => void;
  onSaveVocabulary: (term: string, definition: string, example: string) => void;
}

const SCENARIOS = [
  { id: "coffee", label: "Ordering Coffee", prompt: "At a London coffee shop ordering specialty breakfast items", icon: "☕" },
  { id: "airport", label: "Airport Boarding Gate", prompt: "Checking in with a gate agent due to delayed connection flights", icon: "✈️" },
  { id: "negotiation", label: "Salary Negotiation", prompt: "A performance review discussion asking for a 15% promotion and budget raise", icon: "💼" },
  { id: "hotel", label: "London Hotel Check-in", prompt: "Asking for a room upgrade and resolving a booking reservation mismatch", icon: "🏨" }
];

const LEVELS = ["Beginner (A2)", "Intermediate (B2)", "Proficient (C1)"];

function getEnglishVoicesPromise(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices.filter(v => v.lang.startsWith('en')));
      return;
    }
    const onChanged = () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onChanged);
      resolve(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')));
    };
    window.speechSynthesis.addEventListener?.('voiceschanged', onChanged);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', onChanged);
      resolve(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')));
    }, 3000);
  });
}

export default function ListeningLab({ onBack, onSaveVocabulary }: Props) {
  const [scenario, setScenario] = useState(SCENARIOS[0].prompt);
  const [level, setLevel] = useState(LEVELS[1]);
  const [customInput, setCustomInput] = useState("");

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const wordCount = getWordCount(customInput);
  const isCustomInputInvalid = customInput.trim().length > 0 && (wordCount < 2 || wordCount > 3);

  const handleSetCustomScenario = () => {
    if (wordCount >= 2 && wordCount <= 3 && !isCustomInputInvalid) {
      setScenario(customInput.trim());
    }
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListeningResult | null>(null);

  // Active Tab state for horizontal navigation ("dialogo" | "dictado" | "completado")
  const [activeTab, setActiveTab] = useState<"dialogo" | "dictado" | "completado">("dialogo");

  // Fill in the blanks (Desafío de Llenado) states
  const [userBlanks, setUserBlanks] = useState<string[]>([]);
  const [blanksChecked, setBlanksChecked] = useState(false);
  const [selectedCompIndex, setSelectedCompIndex] = useState<number | null>(null);

  // Core Interaction States based on redesigned mockup
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [responseLanguage, setResponseLanguage] = useState<"en" | "es">("en");
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<{ score: number; feedback: string; keyCorrections: string } | null>(null);

  // Show detailed panel toggle (transcript & quiz)
  const [showDeepStudy, setShowDeepStudy] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Individual lines playback
  const [playingLineIndex, setPlayingLineIndex] = useState<number | null>(null);
  const [savedTerms, setSavedTerms] = useState<string[]>([]);
  const [isPlayingFullDialogue, setIsPlayingFullDialogue] = useState(false);

  // Sentence selector for dictado
  const [selectedDictationIndex, setSelectedDictationIndex] = useState<number>(0);

  // Dictado states: single line dictation + comprehension questions
  const [dictadoLineIndex, setDictadoLineIndex] = useState<number>(0);
  const [dictadoPlaying, setDictadoPlaying] = useState(false);
  const [dictadoAnswer, setDictadoAnswer] = useState("");
  const [dictadoPhase, setDictadoPhase] = useState<"listen" | "grade" | "quiz">("listen");
  const [dictadoGrading, setDictadoGrading] = useState(false);
  const [dictadoGradeResult, setDictadoGradeResult] = useState<{ score: number; feedback: string; keyCorrections: string } | null>(null);
  const [dictadoQuestions, setDictadoQuestions] = useState<{ question: string; options: string[]; correctIndex: number }[]>([]);
  const [dictadoQuizAnswers, setDictadoQuizAnswers] = useState<{ [key: number]: number }>({});
  const [dictadoQuizSubmitted, setDictadoQuizSubmitted] = useState(false);
  const [dictadoQuizScore, setDictadoQuizScore] = useState(0);
  const [dictadoQuizLoading, setDictadoQuizLoading] = useState(false);

  // Google TTS Hook
  const { speak: ttsSpeak, stop: ttsStop } = useGoogleTTS();

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setAudioPlayed(false);
    setUserAnswer("");
    setGradeResult(null);
    setShowDeepStudy(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setActiveTab("dialogo");
    setUserBlanks([]);
    setBlanksChecked(false);
    setSelectedCompIndex(null);
    setDictadoPhase("listen");
    setDictadoAnswer("");
    setDictadoGradeResult(null);
    setDictadoQuestions([]);
    setDictadoQuizAnswers({});
    setDictadoQuizSubmitted(false);
    setDictadoQuizScore(0);
    setSelectedDictationIndex(0);

    try {
      const response = await fetch("/api/gemini/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, level }),
      });
      if (!response.ok) throw new Error("Failed to generate dialogue");
      const data = await response.json();
      setResult(data);
      if (data && data.fillBlank && data.fillBlank.blanks) {
        setUserBlanks(new Array(data.fillBlank.blanks.length).fill(""));
      }
      // Init dictado with random line
      if (data && data.dialogue && data.dialogue.length > 0) {
        setDictadoLineIndex(Math.floor(Math.random() * data.dialogue.length));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Speak line individually using Google TTS
  const handleSpeakLine = (text: string, index: number) => {
    ttsStop();
    window.speechSynthesis.cancel();
    const voiceName = index % 2 === 0 ? 'en-US-Neural2-J' : 'en-US-Neural2-D';
    ttsSpeak({
      text,
      voiceName,
      speakingRate: 0.9,
      onStart: () => setPlayingLineIndex(index),
      onEnd: () => setPlayingLineIndex(null),
      onError: () => setPlayingLineIndex(null),
    });
  };

  // Self-contained full dialogue player — manages its own audio chain
  const fullDialogueRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const handleSpeakFullDialogue = () => {
    if (!result) return;
    ttsStop();
    window.speechSynthesis.cancel();
    fullDialogueRef.current = { cancelled: false };
    setAudioPlayed(true);
    setIsPlayingFullDialogue(true);

    let currentLine = 0;

    const playLineAtIndex = (idx: number) => {
      if (fullDialogueRef.current.cancelled || idx >= result.dialogue.length) {
        setPlayingLineIndex(null);
        setIsPlayingFullDialogue(false);
        return;
      }

      const line = result.dialogue[idx];
      const isMale = idx % 2 !== 0;

      setPlayingLineIndex(idx);

      if (isMale) {
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;

        getEnglishVoicesPromise().then(voices => {
          if (fullDialogueRef.current.cancelled) return;
          const maleVoice = voices.find(v =>
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('daniel') ||
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('mark') ||
            v.name.toLowerCase().includes('guy')
          ) || voices[0];
          if (maleVoice) utterance.voice = maleVoice;

          utterance.onend = () => {
            currentLine++;
            playLineAtIndex(currentLine);
          };
          utterance.onerror = () => {
            currentLine++;
            playLineAtIndex(currentLine);
          };
          window.speechSynthesis.speak(utterance);
        }).catch(() => {
          utterance.onend = () => { currentLine++; playLineAtIndex(currentLine); };
          utterance.onerror = () => { currentLine++; playLineAtIndex(currentLine); };
          window.speechSynthesis.speak(utterance);
        });
      } else {
        // Female voice: use server TTS
        fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: line.text, voiceName: 'en-US-Neural2-J', speakingRate: 0.9 }),
        })
          .then(res => {
            if (fullDialogueRef.current.cancelled || !res.ok) {
              currentLine++;
              playLineAtIndex(currentLine);
              return;
            }
            return res.blob();
          })
          .then(blob => {
            if (fullDialogueRef.current.cancelled || !blob) return;
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.playbackRate = 0.9;
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              currentLine++;
              playLineAtIndex(currentLine);
            };
            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              currentLine++;
              playLineAtIndex(currentLine);
            };
            audio.play().catch(() => {
              URL.revokeObjectURL(audioUrl);
              currentLine++;
              playLineAtIndex(currentLine);
            });
          })
          .catch(() => {
            currentLine++;
            playLineAtIndex(currentLine);
          });
      }
    };

    playLineAtIndex(0);
  };

  const handleGradeAnswer = async () => {
    if (!userAnswer.trim() || !result) return;
    setGrading(true);
    try {
      const response = await fetch("/api/gemini/listening/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer,
          languageMode: responseLanguage,
          dialogue: result.dialogue
        })
      });
      if (!response.ok) throw new Error("Failed to grade answer");
      const data = await response.json();
      setGradeResult(data);
      // Automatically unlock/reveal deep study material to enrich learning
      setShowDeepStudy(true);
    } catch (err) {
      console.error(err);
    } finally {
      setGrading(false);
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

  const handleToggleSpeakFullDialogue = () => {
    if (isPlayingFullDialogue) {
      fullDialogueRef.current.cancelled = true;
      ttsStop();
      window.speechSynthesis.cancel();
      setIsPlayingFullDialogue(false);
      setPlayingLineIndex(null);
    } else {
      handleSpeakFullDialogue();
    }
  };

  // ---- Dictado: Play single random line ----
  const initDictado = () => {
    if (!result || result.dialogue.length === 0) return;
    const randomIdx = Math.floor(Math.random() * result.dialogue.length);
    setDictadoLineIndex(randomIdx);
    setDictadoPhase("listen");
    setDictadoAnswer("");
    setDictadoGradeResult(null);
    setDictadoGrading(false);
    setDictadoQuestions([]);
    setDictadoQuizAnswers({});
    setDictadoQuizSubmitted(false);
    setDictadoQuizScore(0);
    setDictadoQuizLoading(false);
  };

  const playDictadoLine = () => {
    if (!result) return;
    window.speechSynthesis.cancel();
    ttsStop();
    const idx = dictadoLineIndex;
    const line = result.dialogue[idx];
    const isMale = idx % 2 !== 0;
    setDictadoPlaying(true);

    if (isMale) {
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      getEnglishVoicesPromise().then(voices => {
        const maleVoice = voices.find(v =>
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('male')
        ) || voices[0];
        if (maleVoice) utterance.voice = maleVoice;
        utterance.onend = () => setDictadoPlaying(false);
        utterance.onerror = () => setDictadoPlaying(false);
        window.speechSynthesis.speak(utterance);
      }).catch(() => {
        utterance.onend = () => setDictadoPlaying(false);
        window.speechSynthesis.speak(utterance);
      });
    } else {
      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: line.text, voiceName: 'en-US-Neural2-J', speakingRate: 0.85 }),
      })
        .then(res => {
          if (!res.ok) throw new Error('TTS failed');
          return res.blob();
        })
        .then(blob => {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.playbackRate = 0.85;
          audio.onended = () => { URL.revokeObjectURL(audioUrl); setDictadoPlaying(false); };
          audio.onerror = () => { URL.revokeObjectURL(audioUrl); setDictadoPlaying(false); };
          audio.play();
        })
        .catch(() => setDictadoPlaying(false));
    }
  };

  const handleGradeDictado = async () => {
    if (!dictadoAnswer.trim() || !result) return;
    setDictadoGrading(true);
    try {
      const response = await fetch("/api/gemini/listening/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: dictadoAnswer,
          languageMode: responseLanguage,
          dialogue: [result.dialogue[selectedDictationIndex]],
          targetLine: result.dialogue[selectedDictationIndex]?.text,
          targetTranslation: result.dialogue[selectedDictationIndex]?.spanishTranslation
        })
      });
      if (!response.ok) throw new Error("Failed to grade");
      const data = await response.json();
      setDictadoGradeResult(data);
      setDictadoPhase("grade");
    } catch (err) {
      console.error(err);
    } finally {
      setDictadoGrading(false);
    }
  };

  const handleLoadDictadoQuiz = async () => {
    if (!result) return;
    setDictadoQuizLoading(true);
    try {
      const response = await fetch("/api/gemini/listening/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dialogue: result.dialogue, scenario })
      });
      if (!response.ok) throw new Error("Failed to generate questions");
      const data = await response.json();
      setDictadoQuestions(data.questions || []);
      setDictadoPhase("quiz");
    } catch (err) {
      console.error(err);
    } finally {
      setDictadoQuizLoading(false);
    }
  };

  const handleDictadoQuizSubmit = () => {
    if (!result) return;
    let score = 0;
    dictadoQuestions.forEach((q, idx) => {
      if (dictadoQuizAnswers[idx] === q.correctIndex) score++;
    });
    setDictadoQuizScore(score);
    setDictadoQuizSubmitted(true);
  };

  const handleResetFillBlank = () => {
    if (result && result.fillBlank) {
      setUserBlanks(new Array(result.fillBlank.blanks.length).fill(""));
    } else {
      setUserBlanks([]);
    }
    setBlanksChecked(false);
    setSelectedCompIndex(null);
  };

  const renderSentenceWithBlanks = () => {
    if (!result || !result.fillBlank) return null;
    const parts = result.fillBlank.sentence.split(/\[blank\]/i);
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3.5 text-base sm:text-lg font-medium text-gray-800 whitespace-normal break-words leading-relaxed w-full">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <input
                type="text"
                placeholder="..."
                value={userBlanks[index] || ""}
                onChange={(e) => {
                  const newBlanks = [...userBlanks];
                  newBlanks[index] = e.target.value;
                  setUserBlanks(newBlanks);
                }}
                disabled={blanksChecked}
                className={`w-28 px-3 py-1 text-center font-bold text-sm border rounded-full transition-all bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4c4aca] inline-block ${
                  blanksChecked
                    ? (userBlanks[index] || "").trim().toLowerCase() === (result.fillBlank.blanks[index] || "").trim().toLowerCase()
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm font-bold"
                      : "border-red-500 bg-red-50 text-red-800 shadow-sm font-bold"
                    : "border-gray-200 text-gray-800 hover:border-gray-300 focus:border-[#4c4aca]"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div id="ListeningLab" className="apple-fade-in w-full max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4c4aca]">IA Labs</span>
          <h2 className="text-2xl font-bold text-gray-900">AI Listening Lab</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Immersive Welcome Card */}
          <div className="bg-gradient-to-br from-[#F3EFFF] to-[#E8F1FF] p-6 rounded-3xl border border-[#F3EFFF] text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-purple-100">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5_Di8cj8qA-Fag-Z5TSk4Y23h5nEMSyDUNMu4mCWoIabp4K6_Uv2V_YjRJoIA1L8gN4S3_4-7Np7dlYDXWV_3R_mf4yb7jBIo4rTNBX-Q3tORro1E7DNZPsiIL7KaBPm-xAZRs7u9swsGslkB9XOmuxT_8YGi71cJW_3-8euOtoZV88TS5DI40he_N6HMUIVIgidbf92Ryyw-f4gcYbbccHQv6GApr4-aPzM-zOcZ4d9TSm3ZTxilsvaxv0GdlZh7zLcienRqCXA" 
                alt="AI Listening Headphones" 
                className="w-24 h-24 object-contain filter drop-shadow-md hover:scale-105 transition-transform"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              Entrena tu comprensión auditiva con diálogos personalizados generados por IA. Escucha e interactúa en tiempo real.
            </p>
          </div>

          {/* Scenario Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Selecciona un escenario
            </label>
            <div className="flex flex-col gap-2">
              {SCENARIOS.map((scen) => {
                const isActive = scenario === scen.prompt;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setScenario(scen.prompt);
                      setAudioPlayed(false);
                      setUserAnswer("");
                      setGradeResult(null);
                      setShowDeepStudy(false);
                      setActiveTab("dialogo");
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-[#E8F1FF] border-[#4c4aca] text-[#4c4aca] shadow-sm font-semibold"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50/80"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">{scen.icon}</span>
                      <span>{scen.label}</span>
                    </span>
                    {isActive ? (
                      <span className="w-5 h-5 rounded-full border-2 border-[#4c4aca] flex items-center justify-center bg-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4c4aca]"></span>
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-gray-300 bg-white"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Scenario Container right under the presets */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-[#4c4aca] uppercase tracking-wider mb-2">
                ✍️ Propón tu propio escenario
              </label>
              <div className="flex gap-2 w-full items-center">
                <input
                  type="text"
                  placeholder="Propón tu propio escenario..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCustomInputInvalid && wordCount >= 2 && wordCount <= 3) {
                      e.preventDefault();
                      handleSetCustomScenario();
                    }
                  }}
                  className="flex-1 min-w-0 px-3.5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4c4aca] focus:bg-white transition-all w-full"
                />
                <button
                  type="button"
                  onClick={handleSetCustomScenario}
                  disabled={isCustomInputInvalid || wordCount < 2 || wordCount > 3}
                  className={`p-3 rounded-2xl border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                    wordCount >= 2 && wordCount <= 3 && !isCustomInputInvalid
                      ? "bg-[#4c4aca] border-transparent text-white hover:bg-purple-700 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
                  title="Activar escenario"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              
              {isCustomInputInvalid && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  Usa entre 2 y 3 palabras (ej. 'Buying a ticket')
                </p>
              )}

              {scenario && !SCENARIOS.some(sc => sc.prompt === scenario) && (
                <div className="mt-3 p-3 bg-[#4c4aca]/5 border border-[#4c4aca]/20 rounded-2xl flex items-center justify-between animate-fadeIn">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[#4c4aca] font-bold uppercase tracking-wider">Escenario Activo</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">✨ "{scenario}"</p>
                  </div>
                  <button 
                    onClick={() => {
                      setScenario(SCENARIOS[0].prompt);
                    }}
                    className="text-[10px] text-gray-400 hover:text-red-500 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Language Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((lvl) => {
                const isActive = level === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      setLevel(lvl);
                      setAudioPlayed(false);
                      setUserAnswer("");
                      setGradeResult(null);
                      setShowDeepStudy(false);
                      setActiveTab("dialogo");
                    }}
                    className={`py-2.5 text-xs font-semibold rounded-2xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#4c4aca] border-transparent text-white shadow-sm font-bold"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50/80"
                    }`}
                  >
                    {lvl.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-[#4c4aca] hover:bg-purple-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={16} />
            {loading ? "Generando Laboratorio..." : "Generar Ejercicio"}
          </button>
        </div>

        {/* Right Column (Redesigned Main Exercise Window with Tabs) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Scenario Title Header block - Always Visible, adjusts when result is loaded */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#4c4aca]/10 text-[#4c4aca] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                {result ? level : "LABORATORIO"}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {result ? `Practical English: ${scenario}` : "AI Listening Practice & Evaluation"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {result 
                ? `An interactive conversational scenario about: "${scenario}". Designed for ${level} level.`
                : "Elige un escenario de la izquierda y haz clic en 'Generar Ejercicio' para comenzar."}
            </p>
          </div>

          {/* horizontal Tab selector for content restructuration - ALWAYS VISIBLE */}
          <div className="border-b border-gray-200 w-full">
            <nav className="flex space-x-6 w-full" aria-label="Tabs">
              <button
                id="tab-dialogo"
                onClick={() => setActiveTab("dialogo")}
                className={`flex-1 sm:flex-initial pb-4 px-1 text-center border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "dialogo"
                    ? "border-[#4c4aca] text-[#4c4aca] font-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                💬 Diálogo & Vocabulario
              </button>
              <button
                id="tab-dictado"
                onClick={() => { setActiveTab("dictado"); if (result && dictadoPhase === "listen" && !dictadoGradeResult) initDictado(); }}
                className={`flex-1 sm:flex-initial pb-4 px-1 text-center border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "dictado"
                    ? "border-[#4c4aca] text-[#4c4aca] font-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ✍️ Dictado y Escritura Activa
              </button>
              <button
                id="tab-completado"
                onClick={() => setActiveTab("completado")}
                className={`flex-1 sm:flex-initial pb-4 px-1 text-center border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "completado"
                    ? "border-[#4c4aca] text-[#4c4aca] font-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🎯 Desafío de Llenado
              </button>
            </nav>
          </div>

          {/* Tab Content Rendering */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 border border-dashed border-gray-200 rounded-3xl p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-[#4c4aca] mb-4"></div>
              <p className="text-sm font-bold text-gray-700">Creando simulación auditiva...</p>
              <p className="text-xs text-gray-400 mt-1">Nuestra IA de Gemini está preparando el escenario idóneo para ti.</p>
            </div>
          ) : activeTab === "dialogo" ? (
            result ? (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Interactive Dialogue Script */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#4c4aca]/10 text-[#4c4aca]">
                        AUDIO PLAYBACK & SCRIPT
                      </span>
                      <h4 className="text-lg font-extrabold text-gray-900 mt-1">Guión del Diálogo Interactivo</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleSpeakFullDialogue}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          isPlayingFullDialogue
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-[#4c4aca] hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isPlayingFullDialogue ? (
                          <>
                            <Pause size={14} fill="currentColor" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play size={14} fill="currentColor" />
                            <span>Reproducir</span>
                          </>
                        )}
                      </button>
                      {isPlayingFullDialogue && (
                        <button
                          onClick={() => { fullDialogueRef.current.cancelled = true; ttsStop(); window.speechSynthesis.cancel(); setIsPlayingFullDialogue(false); setPlayingLineIndex(null); }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Square size={12} fill="currentColor" />
                          <span>Detener</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {result.dialogue.map((line, idx) => (
                      <div 
                        key={idx} 
                        className={`group p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                          playingLineIndex === idx 
                            ? "bg-purple-50/50 border-purple-200 shadow-xs" 
                            : "bg-gray-50/50 hover:bg-gray-50 border-gray-100"
                        }`}
                      >
                        <button
                          onClick={() => handleSpeakLine(line.text, idx)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                            playingLineIndex === idx
                              ? "bg-[#4c4aca] text-white animate-pulse shadow"
                              : "bg-white text-[#4c4aca] border border-gray-200 hover:bg-[#4c4aca] hover:text-white"
                          }`}
                        >
                          <Volume2 size={15} />
                        </button>

                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-800">{line.speaker}</span>
                            <span className="text-[9px] text-gray-400 bg-gray-200/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Voz #{idx % 2 + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed font-semibold">{line.text}</p>
                          
                          {/* Mobile translation is shown underneath, and desktop shown on hover/touch */}
                          <p className="text-xs text-[#4c4aca] mt-1.5 font-medium sm:hidden">
                            Trad: {line.spanishTranslation}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 italic hidden sm:group-hover:block transition-all duration-300">
                            {line.spanishTranslation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vocabulary Terms */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-sm">
                  <h4 className="text-base font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span>📚 Vocabulario Clave del Escenario</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {result.vocabulary.map((vocab, idx) => (
                      <div key={idx} className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                        <div>
                          <span className="font-extrabold text-gray-900 text-sm">{vocab.term}</span>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">{vocab.definition}</p>
                        </div>
                        <div className="border-t border-gray-200/60 mt-3 pt-2.5">
                          <p className="text-[10px] text-gray-400 italic">Example: "{vocab.example}"</p>
                          {savedTerms.includes(vocab.term) ? (
                            <span className="text-[10px] text-emerald-600 font-bold mt-2 block flex items-center gap-1">
                              ✓ Guardado en Biblioteca
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onSaveVocabulary(vocab.term, vocab.definition, vocab.example);
                                setSavedTerms(prev => [...prev, vocab.term]);
                              }}
                              className="text-[10px] text-[#4c4aca] font-black mt-2 block hover:underline cursor-pointer text-left"
                            >
                              + Guardar en Biblioteca
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comprehension Quiz */}
                <div className="bg-gradient-to-br from-[#4c4aca]/5 to-purple-50 rounded-3xl p-6 sm:p-8 border border-[#4c4aca]/10 space-y-6">
                  <div>
                    <h4 className="text-lg font-extrabold text-[#4c4aca]">Desafío: Cuestionario de Comprensión</h4>
                    <p className="text-xs text-gray-500 mt-1">Pon a prueba tu comprensión auditiva de los detalles del diálogo.</p>
                  </div>

                  <div className="space-y-4">
                    {result.questions.map((q, qidx) => (
                      <div key={q.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
                        <p className="text-sm font-extrabold text-gray-900 mb-3">{qidx + 1}. {q.questionText}</p>
                        
                        <div className="space-y-2">
                          {q.options.map((opt, oidx) => {
                            const isSelected = selectedAnswers[q.id] === oidx;
                            const isCorrect = oidx === q.correctOptionIndex;
                            let btnStyle = "border-gray-200 hover:bg-gray-50/80 text-gray-700 font-medium";

                            if (isSelected) {
                              btnStyle = "border-[#4c4aca] bg-[#4c4aca]/5 text-[#4c4aca] font-bold";
                            }

                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                              } else if (isSelected) {
                                btnStyle = "border-red-500 bg-red-50 text-red-800 font-medium";
                              } else {
                                btnStyle = "border-gray-100 text-gray-400 opacity-60 cursor-not-allowed";
                              }
                            }

                            return (
                              <button
                                key={oidx}
                                onClick={() => handleAnswerSelect(q.id, oidx)}
                                disabled={quizSubmitted}
                                className={`w-full text-left px-4 py-3 text-xs rounded-xl border transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />}
                                {quizSubmitted && isSelected && !isCorrect && <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="mt-3 bg-slate-50 rounded-xl p-3 text-xs text-gray-500 flex items-start gap-1.5 border border-gray-100">
                            <HelpCircle size={14} className="text-[#4c4aca] mt-0.5 flex-shrink-0" />
                            <p className="font-medium leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit / Results footer */}
                  <div className="flex items-center justify-between border-t border-gray-200/60 pt-4">
                    {quizSubmitted ? (
                      <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                          quizScore === result.questions.length
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          Puntuación: {quizScore} / {result.questions.length} Correctas
                        </span>
                        <button
                          onClick={() => {
                            setSelectedAnswers({});
                            setQuizSubmitted(false);
                            setQuizScore(0);
                          }}
                          className="text-xs text-[#4c4aca] font-black uppercase tracking-wider hover:underline cursor-pointer"
                        >
                          Reintentar Cuestionario
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length < result.questions.length}
                        className="px-6 py-3 bg-[#4c4aca] hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        Enviar Cuestionario
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* Blank Slate for Tab 1 */
              <div className="flex flex-col items-center justify-center min-h-[350px] text-gray-400 border border-dashed border-gray-200 bg-slate-50/50 rounded-3xl p-8 text-center animate-fadeIn">
                <div className="bg-purple-50 rounded-full p-4 mb-4 text-[#4c4aca]/80">
                  <BookOpen size={36} />
                </div>
                <h3 className="text-base font-extrabold text-gray-700 uppercase tracking-wider">Diálogo & Vocabulario</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed font-semibold">
                  Elige un escenario del panel izquierdo (o propón uno propio) y haz clic en <span className="text-[#4c4aca]">"Generar Ejercicio"</span> para cargar el guión interactivo, audio por oraciones y vocabulario clave.
                </p>
              </div>
            )
          ) : activeTab === "dictado" ? (
            /* activeTab === "dictado" - Single Line Dictation + Comprehension Quiz */
            <div className="space-y-6 animate-fadeIn w-full">
              
              {/* Sentence Selector */}
              {result && (
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#4c4aca] tracking-widest">Paso A: Elige una Frase</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-gray-800 mt-0.5">Selecciona del diálogo la frase que deseas transcribir o traducir:</h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {result.dialogue.map((line, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDictationIndex(idx);
                            setDictadoLineIndex(idx);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center border ${
                            selectedDictationIndex === idx
                              ? "bg-[#4c4aca] border-transparent text-white shadow-xs"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                          title={`Frase ${idx + 1} (${line.speaker})`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 1: Dictation — Listen & Transcribe ONE line */}
              <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm w-full">
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="bg-[#4c4aca]/10 text-[#4c4aca] px-2.5 py-1 rounded-lg text-xs font-black">PASO 1 & 2</span>
                  Comprensión de Audio y Escritura Activa
                </h3>

                {result ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full">
                    
                    {/* Left: Single Line Play Button */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-6 rounded-2xl border border-gray-100 shadow-xs text-center space-y-3 min-h-[180px]">
                      <button
                        onClick={() => {
                          if (result) {
                            handleSpeakLine(result.dialogue[selectedDictationIndex]?.text || "", selectedDictationIndex);
                          }
                        }}
                        disabled={!result}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                          playingLineIndex === selectedDictationIndex
                            ? "bg-red-500 text-white animate-pulse cursor-pointer"
                            : "bg-[#4c4aca] text-white hover:bg-[#3b3a9e] hover:scale-105 cursor-pointer"
                        }`}
                        title="Reproducir frase seleccionada"
                      >
                        <Volume2 size={28} className={playingLineIndex === selectedDictationIndex ? "animate-bounce" : ""} />
                      </button>
                      
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">REPRODUCIR FRASE {selectedDictationIndex + 1}</p>
                        <p className="text-xs font-black text-[#4c4aca] mt-1">
                          {result ? result.dialogue[selectedDictationIndex]?.speaker || "Speaker" : "Speaker"} — Línea {selectedDictationIndex + 1} de {result ? result.dialogue.length : 0}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const randomIdx = Math.floor(Math.random() * (result?.dialogue.length || 1));
                          setDictadoLineIndex(randomIdx);
                          setSelectedDictationIndex(randomIdx);
                        }}
                        className="text-[10px] text-gray-400 hover:text-[#4c4aca] font-bold transition-colors cursor-pointer"
                      >
                        ↻ Otra frase aleatoria
                      </button>
                    </div>

                    {/* Right: Textarea + controls */}
                    <div className="md:col-span-8 flex flex-col space-y-3 w-full">
                      <div className="relative flex w-full items-center justify-center p-1 bg-gray-100 rounded-full border border-gray-200">
                        <button
                          onClick={() => setResponseLanguage("en")}
                          disabled={dictadoPhase !== "listen"}
                          className={`flex-1 py-2 text-[10px] font-black rounded-full transition-all text-center uppercase tracking-wider cursor-pointer ${
                            dictadoPhase !== "listen"
                              ? "text-gray-400 cursor-not-allowed"
                              : responseLanguage === "en"
                                ? "bg-white text-[#4c4aca] shadow-xs font-black"
                                : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          INGLÉS (Transcribir)
                        </button>
                        <div className="absolute z-10 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                          <Unlock size={13} className="text-[#4c4aca]" />
                        </div>
                        <button
                          onClick={() => setResponseLanguage("es")}
                          disabled={dictadoPhase !== "listen"}
                          className={`flex-1 py-2 text-[10px] font-black rounded-full transition-all text-center uppercase tracking-wider cursor-pointer ${
                            dictadoPhase !== "listen"
                              ? "text-gray-400 cursor-not-allowed"
                              : responseLanguage === "es"
                                ? "bg-white text-[#4c4aca] shadow-xs font-black"
                                : "text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          ESPAÑOL (Traducir)
                        </button>
                      </div>

                      <div className="relative flex-grow">
                        <textarea
                          value={dictadoAnswer}
                          onChange={(e) => setDictadoAnswer(e.target.value)}
                          disabled={dictadoPhase !== "listen" || dictadoGrading}
                          placeholder="Escucha la frase y escribe exactamente lo que escuchas (en inglés) o lo que entendiste (en español)."
                          className={`w-full min-h-[120px] p-4 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4c4aca] resize-y ${
                            dictadoPhase !== "listen"
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-200 text-gray-800 shadow-2xs"
                          }`}
                        />
                      </div>

                      {dictadoPhase === "listen" && (
                        <div className="flex justify-end">
                          <button
                            onClick={handleGradeDictado}
                            disabled={dictadoGrading || !dictadoAnswer.trim()}
                            className="px-5 py-2.5 bg-[#4c4aca] hover:bg-[#3b3a9e] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {dictadoGrading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-white"></div>
                                <span>Calificando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={13} />
                                <span>Calificar Dictado</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                    <Lock size={24} className="mb-2" />
                    <p className="text-xs font-bold">Genera un ejercicio primero para habilitar el dictado.</p>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200/60 w-full">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Frase Escogida</span>
                    <div className="mt-1 text-2xl font-black text-gray-800">
                      {result ? `${dictadoLineIndex + 1} / ${result.dialogue.length}` : "-- / --"}
                    </div>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1">Línea aleatoria</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dictado</span>
                    <div className={`mt-1 text-2xl font-black ${
                      dictadoGradeResult
                        ? dictadoGradeResult.score >= 80 ? "text-emerald-600" : dictadoGradeResult.score >= 50 ? "text-amber-500" : "text-red-500"
                        : "text-gray-400"
                    }`}>
                      {dictadoGradeResult ? `${dictadoGradeResult.score}%` : "0%"}
                    </div>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1">Precisión auditiva</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Cuestionario</span>
                    <div className="mt-1 text-2xl font-black text-gray-800">
                      {dictadoQuizSubmitted ? `${dictadoQuizScore} / ${dictadoQuestions.length}` : "— / —"}
                    </div>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1">Preguntas correctas</p>
                  </div>
                </div>
              </div>

              {/* PHASE 2: Dictation Results + Transition to Quiz */}
              {result && dictadoGradeResult && dictadoPhase === "grade" && (
                <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-fadeIn w-full">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={16} className="text-[#4c4aca]" />
                      Resultado del Dictado
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      dictadoGradeResult.score >= 80
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : dictadoGradeResult.score >= 50
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      ★ {dictadoGradeResult.score}/100
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50">
                    <p className="font-bold text-emerald-800 uppercase tracking-widest text-[9px] mb-1">Tu desempeño</p>
                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm font-semibold">{dictadoGradeResult.feedback}</p>
                  </div>

                  <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100/50">
                    <p className="font-bold text-purple-800 uppercase tracking-widest text-[9px] mb-1">Correcciones Clave</p>
                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-semibold">{dictadoGradeResult.keyCorrections}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => { initDictado(); }}
                      className="px-4 py-2 border border-gray-200 hover:bg-white text-gray-600 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      Reintentar Dictado
                    </button>
                    <button
                      onClick={handleLoadDictadoQuiz}
                      disabled={dictadoQuizLoading}
                      className="px-5 py-2 bg-[#4c4aca] hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {dictadoQuizLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-t-transparent border-white"></div>
                          <span>Generando Preguntas...</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle size={13} />
                          <span>Siguiente: Cuestionario de Comprensión</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 3: Comprehension Quiz (5-10 questions) */}
              {dictadoPhase === "quiz" && dictadoQuestions.length > 0 && (
                <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn w-full">
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <span className="bg-[#4c4aca]/10 text-[#4c4aca] px-2.5 py-1 rounded-lg text-xs font-black">PASO 3</span>
                    Cuestionario de Comprensión Auditiva
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">{dictadoQuestions.length} preguntas sobre el diálogo generado por IA.</p>

                  <div className="space-y-5">
                    {dictadoQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
                        <p className="text-sm font-bold text-gray-800">
                          <span className="text-[#4c4aca] font-black mr-1">#{qIdx + 1}</span>
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = dictadoQuizAnswers[qIdx] === oIdx;
                            const isCorrect = dictadoQuizSubmitted && oIdx === q.correctIndex;
                            const isWrong = dictadoQuizSubmitted && isSelected && oIdx !== q.correctIndex;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  if (!dictadoQuizSubmitted) {
                                    setDictadoQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                                  }
                                }}
                                disabled={dictadoQuizSubmitted}
                                className={`text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  isCorrect
                                    ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                    : isWrong
                                      ? "bg-red-50 border-red-400 text-red-800"
                                      : isSelected
                                        ? "bg-[#4c4aca]/10 border-[#4c4aca] text-[#4c4aca]"
                                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <span className="font-black mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!dictadoQuizSubmitted ? (
                    <div className="flex justify-end">
                      <button
                        onClick={handleDictadoQuizSubmit}
                        disabled={Object.keys(dictadoQuizAnswers).length < dictadoQuestions.length}
                        className="px-6 py-3 bg-[#4c4aca] hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        Enviar Cuestionario
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs text-center space-y-3">
                      <p className="text-3xl font-black text-[#4c4aca]">{dictadoQuizScore} / {dictadoQuestions.length}</p>
                      <p className="text-xs font-bold text-gray-500">
                        {dictadoQuizScore === dictadoQuestions.length
                          ? "¡Perfecto! Comprensión auditiva al 100%."
                          : dictadoQuizScore >= dictadoQuestions.length * 0.7
                            ? "¡Muy bien! Comprensión sólida."
                            : "Sigue practicando. Reproduce el audio y vuelve a intentarlo."}
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          onClick={() => { initDictado(); }}
                          className="px-4 py-2 border border-gray-200 hover:bg-white text-gray-600 hover:text-gray-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          Otra Frase
                        </button>
                        <button
                          onClick={() => { setDictadoPhase("listen"); setDictadoGradeResult(null); setDictadoQuizSubmitted(false); setDictadoQuizAnswers({}); setDictadoQuizScore(0); }}
                          className="px-4 py-2 bg-[#4c4aca] hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle size={13} />
                          Repetir Cuestionario
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* activeTab === "completado" (Desafío de Llenado) */
            result ? (
              <div className="space-y-6 animate-fadeIn w-full">
                
                {/* 1. Mini Reproductor de Audio */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={handleToggleSpeakFullDialogue}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isPlayingFullDialogue
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-[#4c4aca] text-white hover:bg-[#3b3a9e] hover:scale-105"
                      } cursor-pointer`}
                      title={isPlayingFullDialogue ? "Pausar audio completo" : "Reproducir audio completo"}
                    >
                      {isPlayingFullDialogue ? (
                        <Volume2 size={20} className="animate-bounce" />
                      ) : (
                        <Play size={20} className="ml-1" />
                      )}
                    </button>
                    
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 leading-tight">
                        Audio: "{result.title || scenario}" · Nivel {level.replace("Beginner (A2)", "Principiante").replace("Intermediate (B2)", "Intermedio").replace("Proficient (C1)", "Avanzado")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Escucha completa para resolver los ejercicios.</p>
                    </div>
                  </div>

                  {/* Dynamic Progress Bar detail inside mini player */}
                  <div className="hidden md:block flex-1 mx-6 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full bg-gradient-to-r from-[#4c4aca] to-purple-500 rounded-full transition-all duration-300 ${
                        isPlayingFullDialogue ? "w-2/3 animate-pulse" : "w-0"
                      }`} 
                    />
                  </div>

                  {/* Reset/Restart arrow button at the end of the line */}
                  <button
                    onClick={handleResetFillBlank}
                    className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    title="Reiniciar ejercicio"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                {/* 2. Bloque "Completa las palabras que faltan" */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Completa las palabras que faltan
                  </h4>

                  <div className="pt-2">
                    {renderSentenceWithBlanks()}
                  </div>

                  {/* Comprobar Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">
                    <button
                      onClick={() => setBlanksChecked(true)}
                      disabled={blanksChecked || userBlanks.some(b => !b || !b.trim())}
                      className="px-6 py-2.5 bg-[#4c4aca] hover:bg-[#3b3a9e] text-white text-sm font-bold rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Comprobar
                    </button>

                    {blanksChecked && (
                      <div className="flex items-center gap-2">
                        {userBlanks.every((b, idx) => (b || "").trim().toLowerCase() === (result.fillBlank?.blanks[idx] || "").trim().toLowerCase()) ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full animate-bounce shadow-2xs">
                            <CheckCircle2 size={13} />
                            ¡Excelente! Todo correcto.
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full shadow-2xs">
                            <XCircle size={13} />
                            Hay algunos errores. Haz clic en el botón de reinicio para volver a intentar.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Bloque "Comprensión" */}
                {result.fillBlank && (
                  <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Comprensión
                      </h4>
                      <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {result.fillBlank.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {result.fillBlank.options.map((opt, idx) => {
                        const isSelected = selectedCompIndex === idx;
                        const isCorrect = idx === result.fillBlank.correctOptionIndex;
                        let btnClass = "border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold";

                        if (isSelected) {
                          btnClass = "border-[#4c4aca] bg-[#4c4aca]/5 text-[#4c4aca] font-bold";
                        }

                        if (blanksChecked) {
                          if (isCorrect) {
                            btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                          } else if (isSelected) {
                            btnClass = "border-red-500 bg-red-50 text-red-800 font-bold";
                          } else {
                            btnClass = "border-gray-100 text-gray-400 opacity-60 cursor-not-allowed";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={blanksChecked}
                            onClick={() => setSelectedCompIndex(idx)}
                            className={`w-full text-left px-6 py-4 text-xs sm:text-sm rounded-full border transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                          >
                            <span>{opt}</span>
                            {blanksChecked && isCorrect && <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />}
                            {blanksChecked && isSelected && !isCorrect && <XCircle size={15} className="text-red-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Blank Slate for Tab 3 */
              <div className="flex flex-col items-center justify-center min-h-[350px] text-gray-400 border border-dashed border-gray-200 bg-slate-50/50 rounded-3xl p-8 text-center animate-fadeIn">
                <div className="bg-purple-50 rounded-full p-4 mb-4 text-[#4c4aca]/80">
                  <Award size={36} />
                </div>
                <h3 className="text-base font-extrabold text-gray-700 uppercase tracking-wider">Desafío de Llenado</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed font-semibold">
                  Genera un ejercicio para iniciar el desafío de completado.
                </p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
