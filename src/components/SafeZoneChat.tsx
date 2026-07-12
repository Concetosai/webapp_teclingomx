import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Terminal, 
  HelpCircle, 
  Shield, 
  Bot, 
  Languages, 
  Check, 
  Sparkle,
  MessageSquare,
  Sparkles as SparklesIcon,
  Lock,
  Unlock
} from "lucide-react";
import { ChatMessage, ChatEvaluation } from "../types";
import { useGoogleTTS } from "../hooks/useGoogleTTS";

interface Props {
  onBack: () => void;
}

const PRESET_SUGGESTIONS = [
  "✈ Let's talk about travel plans.",
  "🎬 What movies do you recommend?",
  "🧁 Describe your daily routine."
];

// Local dictionary for "Traductor de Auxilio" translations
const TRANSLATION_MAP: Record<string, string> = {
  "Hello! I am Aura, your SafeZone partner. Let's practice spoken English without fear. What is on your mind today?": 
    "¡Hola! Soy Aura, tu compañera de SafeZone. Practiquemos inglés hablado sin miedo. ¿Qué tienes en mente hoy?",
  "Let's talk about travel plans.": 
    "Hablemos de planes de viaje.",
  "What movies do you recommend?": 
    "¿Qué películas me recomiendas?",
  "Describe your daily routine.": 
    "Describe tu rutina diaria."
};

export default function SafeZoneChat({ onBack }: Props) {
  // Chat core state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am Aura, your SafeZone partner. Let's practice spoken English without fear. What is on your mind today?",
      timestamp: "08:45 PM"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Custom states for cockpit simulation
  const [confidence, setConfidence] = useState<number>(50); // range 0-100
  const [isLocked, setIsLocked] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<"normal" | "lenta">("normal");
  const [mutesAggressive, setMutesAggressive] = useState(true);
  const [empatheticMotor, setEmpatheticMotor] = useState(true);
  const [softSuggestions, setSoftSuggestions] = useState(true);
  
  // Translation toggle states for each message ID
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, boolean>>({});
  
  // Terminal logs simulation - Styled elegantly in a light tone
  const [hudLogs, setHudLogs] = useState<string[]>([
    "SYSTEM_BOOT: SAFEZONE COGNITIVE PILOT ONLINE",
    "COGNITIVE_CONSTRUCT_READY: AURA MODEL v1.2",
    "JUDGMENT_MUTED: 100% ACTIVE",
    "EMPATHY_ENGINE: CALIBRATED AND ACTIVE"
  ]);

  // Voice recording and speech recognition state & refs
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Google TTS Hook
  const { speak: ttsSpeak, stop: ttsStop } = useGoogleTTS();

  // Evaluation & Bridge Score state
  const [evaluation, setEvaluation] = useState<ChatEvaluation | null>(null);
  const [accentMatchScore, setAccentMatchScore] = useState<number>(75); // dynamic american accent match
  const [showCorrectedTranslation, setShowCorrectedTranslation] = useState(false);

  useEffect(() => {
    setShowCorrectedTranslation(false);
  }, [evaluation]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognitionObj = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionObj) {
      const rec = new SpeechRecognitionObj();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        addHudLog("VOICE_INPUT: Speech recognition engine active.");
      };

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setUserInput(transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        addHudLog(`VOICE_INPUT_ERR: Error: ${event.error}`);
      };

      rec.onend = () => {
        addHudLog("VOICE_INPUT: Speech recognition finalized.");
      };

      recognitionRef.current = rec;
    } else {
      addHudLog("SYS_INFO: Web Speech Recognition API not supported in this browser. Fallback simulator will run.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Handle logging to HUD
  const addHudLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHudLogs(prev => [...prev, `[${timestamp}] ${msg}`].slice(-10)); // keep last 10
  };

  // Speaks aloud the last AI reply using Google TTS
  const speakText = (text: string, isSlow: boolean = false) => {
    ttsSpeak({
      text,
      speakingRate: isSlow ? 0.75 : 1.0,
      onStart: () => addHudLog(`VOICE_SYNTH: Speaking ("${text.substring(0, 15)}...")`),
      onEnd: () => addHudLog("VOICE_SYNTH: Finished"),
      onError: () => addHudLog("SYS_WARN: TTS playback error"),
    });
  };

  // Re-read last bot message
  const handleRespeakLastBotMessage = () => {
    const lastBotMsg = [...messages].reverse().find(m => m.role === "model");
    if (lastBotMsg) {
      speakText(lastBotMsg.content, voiceSpeed === "lenta");
    } else {
      addHudLog("SYS_WARN: No Aura dialogue to speak");
    }
  };

  // Handle voice speed changes
  const toggleVoiceSpeed = () => {
    const newSpeed = voiceSpeed === "normal" ? "lenta" : "normal";
    setVoiceSpeed(newSpeed);
    addHudLog(`CONFIG: Voice speed set to ${newSpeed.toUpperCase()}`);
    
    const lastBotMsg = [...messages].reverse().find(m => m.role === "model");
    if (lastBotMsg) {
      speakText(lastBotMsg.content, newSpeed === "lenta");
    }
  };

  // Custom simulation for sliders & toggles
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setConfidence(val);
    setAccentMatchScore(val); // Synchronize directly with American Accent Match Score
    setIsLocked(true); // Lock manual configuration
    let levelLabel = "NEUTRAL";
    if (val < 25) levelLabel = "NERVIOSO";
    else if (val >= 25 && val < 60) levelLabel = "NEUTRAL";
    else if (val >= 60 && val < 85) levelLabel = "FLUIDO";
    else levelLabel = "NATIVO";
    addHudLog(`SLIDER: Dialogue confidence manually locked to ${val}% (${levelLabel}).`);
  };

  const handleToggleFilter = (filterName: string, state: boolean, setter: (val: boolean) => void) => {
    setter(!state);
    addHudLog(`FILTER: ${filterName} turned ${!state ? "ON" : "OFF"}`);
  };

  // Handles sending to Groq/Gemini API
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setLoading(true);
    addHudLog(`USER: "${text.substring(0, 25)}${text.length > 25 ? "..." : ""}"`);

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
          console.error("Failed to parse custom behavior in SafeZoneChat", e);
        }
      }

      const currentHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentHistory,
          scenario: "Casual conversational sandbox cockpit with friendly AI Aura. Supportive and constructive feedback.",
          customSystemInstruction,
          customAppMasterInfo
        })
      });

      if (!response.ok) throw new Error("Connection failed");
      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.reply || data.response || data.text || "I'm right here listening to you! Let's keep talking.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
      
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        addHudLog(`COACH: Text response grammar analyzed successfully.`);
      }

      // Speak answer
      speakText(modelMsg.content, voiceSpeed === "lenta");

    } catch (err) {
      console.error(err);
      addHudLog("SYS_ERR: Connection timed out. Running simulation model fallback.");
      
      // Fallback
      setTimeout(() => {
        const dummyReply = "That sounds lovely! We should explore more of that topic together. What else makes you feel inspired?";
        const modelMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "model",
          content: dummyReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, modelMsg]);
        speakText(dummyReply, voiceSpeed === "lenta");
        
        setEvaluation({
          isCorrect: true,
          correctedText: text,
          detectedErrors: "",
          explanation: "Perfect sentence structure! Your speech pattern sounds highly fluent and appropriate for standard conversational English."
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Toggles translation helper
  const handleToggleTranslation = (msgId: string, englishText: string) => {
    const isNowTranslated = !translatedMessages[msgId];
    setTranslatedMessages(prev => ({ ...prev, [msgId]: isNowTranslated }));
    addHudLog(`TRANSLATION: ${isNowTranslated ? "Shown" : "Hidden"} helper translation`);
    
    if (isNowTranslated && !TRANSLATION_MAP[englishText]) {
      // Lazy mock translation
      TRANSLATION_MAP[englishText] = `Traducción sugerida: "${englishText}"`;
    }
  };

  // Active microphone operations: captures real audio and transcribes in real-time
  const startRecording = async () => {
    audioChunksRef.current = [];
    setUserInput("");
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech recognition already running:", err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        addHudLog("VOICE_INPUT: Audio recording captured. Querying Gemini phonetic analyzer...");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Read Blob as base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          const textToEvaluate = userInput.trim() || "I think English is very fun and interactive when practicing with you.";
          
          try {
            const res = await fetch("/api/gemini/pronunciation-feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: textToEvaluate,
                audio: base64Audio,
                mimeType: "audio/webm"
              })
            });

            if (!res.ok) throw new Error("Pronunciation feedback API error");
            const data = await res.json();
            
            // Sync both the Accent Match Score and the Dialog Confidence slider!
            const newScore = data.score || 78;
            setAccentMatchScore(newScore);
            if (!isLocked) {
              setConfidence(newScore);
              addHudLog(`BRIDGE: Pronunciation score: ${newScore}%. Synced Dialog Confidence slider.`);
            } else {
              addHudLog(`BRIDGE: Pronunciation score: ${newScore}%. Slider is locked manually (value kept at ${confidence}%).`);
            }

            setEvaluation({
              isCorrect: newScore >= 80,
              correctedText: data.transcription || textToEvaluate,
              detectedErrors: data.tips || "",
              explanation: `${data.feedback || "¡Excelente pronunciación!"} \n\n💡 Tip de acento: ${data.tips || ""}`
            });
          } catch (err: any) {
            console.error("Pronunciation API failed:", err);
            addHudLog("SYS_WARN: Pronunciation API failed. Running phonetic simulation fallback.");
            
            // High-quality fallback
            const simulatedScore = Math.floor(75 + Math.random() * 20);
            setAccentMatchScore(simulatedScore);
            if (!isLocked) {
              setConfidence(simulatedScore);
              addHudLog(`BRIDGE_SIM: Score: ${simulatedScore}%. Synced Dialog Confidence slider.`);
            } else {
              addHudLog(`BRIDGE_SIM: Score: ${simulatedScore}%. Slider is locked manually (value kept at ${confidence}%).`);
            }

            setEvaluation({
              isCorrect: simulatedScore >= 82,
              correctedText: textToEvaluate,
              detectedErrors: "Ligeros desfases de entonación.",
              explanation: `¡Gran esfuerzo! Tu pronunciación de "${textToEvaluate}" es bastante fluida y natural. \n\n💡 Tip de acento: Intenta modular las sílabas acentuadas con mayor fuerza.`
            });
          }
        };

        // Release the mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      addHudLog("VOICE_INPUT: Recording real audio. Speak in English now...");
    } catch (err: any) {
      console.warn("Media capture failed, launching simulation timer:", err);
      addHudLog("SYS_WARN: Microphone permission denied or unsupported. Running voice simulation...");
      
      // Visual simulation timer
      setTimeout(() => {
        setIsRecording(false);
        const speechSamples = [
          "I think English is very fun and interactive when practicing with you.",
          "I want to order a hot chocolate and a piece of strawberry cake, please.",
          "Let's practice the vocabulary about hotel reservations."
        ];
        const resultText = speechSamples[Math.floor(Math.random() * speechSamples.length)];
        setUserInput(resultText);
        addHudLog(`VOICE_INPUT_SIM: Transcribed text: "${resultText}"`);

        const simulatedScore = Math.floor(74 + Math.random() * 21);
        setAccentMatchScore(simulatedScore);
        if (!isLocked) {
          setConfidence(simulatedScore);
          addHudLog(`BRIDGE_SIM: Accent Match Score: ${simulatedScore}%. Synced Dialog Confidence slider.`);
        } else {
          addHudLog(`BRIDGE_SIM: Accent Match Score: ${simulatedScore}%. Slider is locked manually (value kept at ${confidence}%).`);
        }

        setEvaluation({
          isCorrect: simulatedScore >= 80,
          correctedText: resultText,
          detectedErrors: "Ligeros desfases de entonación.",
          explanation: `¡Tu voz de "${resultText}" suena muy natural! Buen progreso con tu acento americano. \n\n💡 Tip de acento: Mantén la fluidez constante sin pausas intermedias.`
        });
      }, 3500);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleToggleMicrophone = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Suggestion chip clicked: Injects directly into text input value
  const handleSuggestionClick = (phrase: string) => {
    // Remove emojis and leading/trailing spaces for input
    const cleanPhrase = phrase.replace(/[^\w\s'.?,!]/g, "").trim();
    setUserInput(cleanPhrase);
    addHudLog(`SUGGESTION: Selected suggestion "${cleanPhrase}"`);
  };

  return (
    <div 
      id="SafeZoneChat" 
      className="w-full max-w-full bg-slate-50 text-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xl font-sans antialiased min-h-screen lg:min-h-0 relative"
    >
      {/* Decorative corporate light grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none rounded-3xl" />

      {/* Corporate Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-[#4c4aca] hover:bg-slate-50 text-slate-600 hover:text-[#4c4aca] transition-all cursor-pointer shadow-xs"
            title="Volver al Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Búnker Seguro Activo
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-850 mt-1 uppercase">
              SafeZone Pilot <span className="text-slate-400 text-xs font-semibold lowercase tracking-normal">consola cognitiva bilingüe</span>
            </h2>
          </div>
        </div>

        {/* VOICE CONFIGURATION HUD CONTROLS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-xs">
            <button
              onClick={toggleVoiceSpeed}
              className="text-[11px] font-bold uppercase text-slate-600 hover:text-[#4c4aca] px-3.5 py-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 size={13} className="text-[#4c4aca]" />
              VOZ: VELOCIDAD {voiceSpeed.toUpperCase()}
            </button>
            <button
              onClick={handleRespeakLastBotMessage}
              className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer ml-1"
              title="Volver a reproducir diálogo de Aura"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout (Desktop 4 Columns, Mobile stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 items-stretch">
        
        {/* ================================= COL 1: DIAGNOSTICS HUD (Left) ================================= */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <span className="text-xs font-black tracking-widest text-[#4c4aca] uppercase flex items-center gap-1.5">
                <Shield size={13} />
                DIAGNOSTICS HUD
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SYS_CONF</span>
            </div>

            {/* Slider control: Confidence range */}
            <div className="space-y-2.5 mb-6">
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 uppercase tracking-wide">CONFIANZA DE DIÁLOGO</span>
                  <button 
                    onClick={() => {
                      setIsLocked(!isLocked);
                      addHudLog(`SLIDER: Dialogue confidence mode toggled to ${!isLocked ? "MANUAL (LOCKED)" : "AUTOMATIC"}`);
                    }}
                    className={`p-1 rounded-md transition-colors cursor-pointer flex items-center justify-center border ${
                      isLocked 
                        ? "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" 
                        : "text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                    title={isLocked ? "Manual (Haz clic para volver a modo automático)" : "Automático (Haz clic para bloquear manualmente)"}
                  >
                    {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                  </button>
                </div>
                <span className="text-[#4c4aca] font-extrabold flex items-center gap-1">
                  {confidence}%
                  {isLocked && <span className="text-[9px] text-amber-500 font-extrabold tracking-wider uppercase">(FIJADO)</span>}
                </span>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={confidence} 
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-slate-100 rounded-lg cursor-pointer accent-[#4c4aca] transition-all"
              />
              
              <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1">
                <span className={confidence < 25 ? "text-amber-500 font-extrabold" : ""}>NERVIOSO</span>
                <span className={(confidence >= 25 && confidence < 60) ? "text-yellow-600 font-extrabold" : ""}>NEUTRAL</span>
                <span className={(confidence >= 60 && confidence < 85) ? "text-emerald-600 font-extrabold" : ""}>FLUIDO</span>
                <span className={confidence >= 85 ? "text-blue-600 font-extrabold" : ""}>NATIVO</span>
              </div>
            </div>

            {/* Micro accent visual box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center mb-6 space-y-2">
              <span className="text-[10px] text-slate-500 font-extrabold tracking-wider block uppercase">
                🎙️ THE BRIDGE: AMERICAN ACCENT
              </span>
              <button
                id="btn-bridge-mic"
                onClick={handleToggleMicrophone}
                className={`w-10 h-10 rounded-full bg-white border flex items-center justify-center mx-auto shadow-xs cursor-pointer hover:border-[#4c4aca] transition-all hover:scale-105 ${
                  isRecording ? "border-red-300 text-red-500 animate-pulse bg-red-50" : "border-slate-200 text-[#4c4aca]"
                }`}
                title={isRecording ? "Detener grabación de voz" : "Iniciar grabación para analizar tu acento"}
              >
                <Mic size={16} className={isRecording ? "animate-bounce" : ""} />
              </button>
              <p className="text-[10px] text-slate-400 font-medium leading-normal">
                USE VOICE MIC TO TEST<br />AMERICAN ACCENT MATCH
              </p>
            </div>

            {/* Filter controls with toggle buttons */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 font-black tracking-wider block uppercase border-b border-slate-50 pb-1.5">
                ⚡ ESTADO DEL FILTRO
              </span>

              {/* Filter 1 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Mutador de Juicio</span>
                <button
                  onClick={() => handleToggleFilter("Mutador de Juicio", mutesAggressive, setMutesAggressive)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer"
                >
                  <span className={`text-[10px] font-bold tracking-wide ${mutesAggressive ? "text-emerald-600" : "text-slate-400"}`}>
                    {mutesAggressive ? "MUTADO (100%)" : "APAGADO"}
                  </span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${mutesAggressive ? "bg-emerald-500" : "bg-slate-200"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 transform ${mutesAggressive ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>
              </div>

              {/* Filter 2 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Motor Empático</span>
                <button
                  onClick={() => handleToggleFilter("Motor Empático", empatheticMotor, setEmpatheticMotor)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer"
                >
                  <span className={`text-[10px] font-bold tracking-wide ${empatheticMotor ? "text-emerald-600" : "text-slate-400"}`}>
                    {empatheticMotor ? "MÁXIMO" : "OFF"}
                  </span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${empatheticMotor ? "bg-emerald-500" : "bg-slate-200"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 transform ${empatheticMotor ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>
              </div>

              {/* Filter 3 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Corrector Sutil</span>
                <button
                  onClick={() => handleToggleFilter("Corrector Sutil", softSuggestions, setSoftSuggestions)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer"
                >
                  <span className={`text-[10px] font-bold tracking-wide ${softSuggestions ? "text-emerald-600" : "text-slate-400"}`}>
                    {softSuggestions ? "ACTIVO" : "INACTIVO"}
                  </span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${softSuggestions ? "bg-emerald-500" : "bg-slate-200"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 transform ${softSuggestions ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Clean HUD Log output */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold tracking-wider block uppercase mb-1.5 flex items-center gap-1">
              <Terminal size={10} /> TECNOLINGÜÍSTICA HUD
            </span>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 h-24 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1 scrollbar-thin">
              {hudLogs.map((log, idx) => (
                <div key={idx} className="leading-tight select-none break-all whitespace-normal">
                  <span className="text-slate-300">●</span> {log}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

        </div>

        {/* ================================= COL 2 & 3: CENTRO DE DIÁLOGO (Middle Chat) ================================= */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[680px] relative overflow-hidden">
          
          {/* Top Chat Header */}
          <div className="bg-slate-50/80 border-b border-slate-150 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-[#4c4aca] shadow-xs">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 tracking-wide">Aura Partner</span>
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping inline-block" />
                    SafeZone Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">EMPATHY DEEP LEARNING MODEL v1.2</p>
              </div>
            </div>
          </div>

          {/* Dialog Bubble Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.role === "user";
              const showTranslation = translatedMessages[m.id];
              const translationText = TRANSLATION_MAP[m.content] || `Traducción aproximada: "${m.content}"`;

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}>
                  <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase px-1">
                    {isUser ? "TÚ (PILOTO)" : "AURA CO-PILOT"}
                  </span>

                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-xs border relative transition-all ${
                    isUser 
                      ? "bg-[#4c4aca] border-[#3b3a9e] text-white rounded-tr-none" 
                      : "bg-slate-50 border-slate-200 text-slate-800 rounded-tl-none"
                  }`}>
                    
                    <p className="text-sm font-medium leading-relaxed font-sans select-text">
                      {m.content}
                    </p>

                    {showTranslation && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-[#4c4aca] font-sans italic leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                        {translationText}
                      </div>
                    )}

                    {!isUser && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTranslation(m.id, m.content)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-[#4c4aca] bg-white hover:bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 cursor-pointer transition-colors"
                        >
                          <Languages size={11} />
                          {showTranslation ? "Ocultar Auxilio" : "TRADUCTOR DE AUXILIO"}
                        </button>
                      </div>
                    )}

                    <span className={`text-[9px] font-mono mt-1 block text-right ${isUser ? "text-slate-200" : "text-slate-400"}`}>
                      {m.timestamp || "08:45 PM"}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase px-1">AURA CO-PILOT</span>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-xs text-xs text-[#4c4aca] flex items-center gap-2 animate-pulse font-bold">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4c4aca] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4c4aca] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4c4aca] animate-bounce"></span>
                  </div>
                  <span>PROCESANDO TRANSMISIÓN...</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Bar */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-150 space-y-4">
            
            {/* Suggestion Quick Chips - ALWAYS ACTIVE / INJECTS DIRECTLY TO INPUT VALUE */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {PRESET_SUGGESTIONS.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(scen)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-[#4c4aca] hover:bg-slate-50 text-slate-700 rounded-full transition-all cursor-pointer truncate max-w-full hover:scale-105"
                >
                  {scen}
                </button>
              ))}
            </div>

            {/* Input keyboard and mic */}
            <div className="relative flex items-center gap-2">
              
              {/* Mic Icon on the Left */}
              <button
                onClick={handleToggleMicrophone}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  isRecording 
                    ? "bg-red-50 border-red-300 text-red-500 animate-pulse shadow-xs" 
                    : "bg-white border-slate-200 hover:border-[#4c4aca] text-slate-500 hover:text-[#4c4aca] shadow-xs"
                }`}
                title={isRecording ? "Escuchando... clic para detener" : "Entrada por voz (Dictado)"}
              >
                <Mic size={18} className={isRecording ? "animate-bounce text-red-500" : ""} />
              </button>

              {/* Text Field */}
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(userInput)}
                disabled={loading}
                placeholder={isRecording ? "Escuchando voz..." : "Práctica bilingüe sin miedo, exprésate libremente aquí..."}
                className="flex-grow px-4 py-3 bg-white border border-slate-200 focus:border-[#4c4aca] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-slate-800 shadow-xs"
              />

              {/* Send Button on the Right */}
              <button
                onClick={() => handleSendMessage(userInput)}
                disabled={loading || !userInput.trim()}
                className="px-4 py-3 rounded-xl bg-[#4c4aca] hover:bg-[#3b3a9e] text-white border-transparent flex items-center gap-2 text-xs font-bold tracking-wider transition-all disabled:opacity-40 cursor-pointer uppercase shadow-md hover:scale-105"
              >
                <span>ENVIAR</span>
                <Send size={13} />
              </button>
            </div>
            
          </div>

        </div>

        {/* ================================= COL 4: EVALUATION & COACHING HUD (Right) ================================= */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <span className="text-xs font-black tracking-widest text-[#4c4aca] uppercase flex items-center gap-1.5">
                <Activity size={13} className="text-[#4c4aca]" />
                EVALUATION & COACHING
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">SYS_COACH</span>
            </div>

            {/* THE BRIDGE SCORE circular progression */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-center space-y-4 mb-6">
              <span className="text-xs text-slate-600 font-extrabold tracking-wider block uppercase">
                ⭐ THE BRIDGE SCORE
              </span>

              {/* Circular progress SVG */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-slate-200 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-emerald-500 fill-none transition-all duration-1000"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - accentMatchScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{accentMatchScore}%</span>
                  <span className="text-[8px] text-emerald-600 font-extrabold tracking-widest">ACCENT MATCH</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Nivel de adaptación con acento e inglés natural americano.
              </p>
            </div>

            {/* Detailed Original vs Correction block */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 font-black tracking-wider block uppercase border-b border-slate-100 pb-1.5">
                🔍 ANÁLISIS DE CORRECCIÓN
              </span>

              {evaluation ? (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {evaluation.isCorrect ? (
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                        <Check size={12} /> Gramática Correcta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase">
                        <AlertCircle size={12} /> Corrección Sugerida
                      </span>
                    )}
                  </div>

                  {/* Original text spoken */}
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase">Texto Original escrito/hablado:</h5>
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/60 mt-1">
                      <p className="text-xs text-slate-750 font-medium leading-relaxed">
                        "{messages[messages.length - 2]?.role === "user" ? messages[messages.length - 2].content : messages[messages.length - 1]?.content}"
                      </p>
                    </div>
                  </div>

                  {/* Suggested Recommended Phrasing */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase">Sugerencia Recomendada:</h5>
                      {evaluation.correctedText && (
                        <button
                          onClick={() => setShowCorrectedTranslation(!showCorrectedTranslation)}
                          className="flex items-center gap-1.5 text-[9px] font-black tracking-wider text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/70 px-2 py-1 rounded-md border border-emerald-200 cursor-pointer transition-all uppercase"
                        >
                          <Languages size={10} />
                          {showCorrectedTranslation ? "Ocultar" : "Traducción"}
                        </button>
                      )}
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-200/50 mt-1">
                      <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                        {evaluation.correctedText || "Perfect phrasing!"}
                      </p>
                      {showCorrectedTranslation && (
                        <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-slate-700 font-sans italic leading-relaxed bg-white/80 p-2.5 rounded-md border border-emerald-100">
                          {evaluation.correctedTextTranslation || `Traducción sugerida: "${evaluation.correctedText}"`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coach Explanation */}
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase">Explicación del Coach:</h5>
                    <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                      {evaluation.explanation || "Your grammar looks solid! No sutil errors found."}
                    </p>
                  </div>

                </div>
              ) : (
                /* Empty state wait placeholder */
                <div className="text-center py-6 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                    <Sparkle size={14} className="animate-spin" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-600">ESPERANDO MENSAJE</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Escribe tu mensaje o haz clic en un tema recomendado para recibir análisis gramatical y feedback de acento en tiempo real.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Secure encryption watermark */}
          <div className="text-center pt-2">
            <span className="text-[9px] text-slate-400 font-bold tracking-widest block uppercase">
              🔐 SECURE COGNITIVE CHAT SANDBOX
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
