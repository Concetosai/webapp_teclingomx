import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Send,
  Search,
  BookOpen,
  Brain,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MessageCircle,
  Dumbbell,
  Library,
  Sparkles,
  RefreshCw,
  Tag,
  AlertTriangle,
} from "lucide-react";
import {
  KNOWLEDGE_BASE,
  KB_CATEGORIES,
  searchKnowledgeBase,
  getConceptById,
  getConceptsByCategory,
  type KnowledgeConcept,
} from "../lib/knowledgeBase";

interface Props {
  onBack: () => void;
  language?: "es" | "en";
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Exercise {
  type: string;
  sentence: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type TutorView = "chat" | "browse" | "concept" | "exercise" | "search";

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your **TECLINGO AI Tutor**. I can help you with English grammar, vocabulary, pronunciation, and usage.\n\nYou can:\n- **Ask me anything** about English\n- **Browse** our knowledge base of grammar concepts\n- **Practice** with generated exercises\n- **Search** for specific topics\n\nWhat would you like to learn today?",
    timestamp: Date.now(),
  },
];

export default function ChatTutor({ onBack, language = "es" }: Props) {
  const [view, setView] = useState<TutorView>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<KnowledgeConcept | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseAnswers, setExerciseAnswers] = useState<{ [key: number]: number }>({});
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendChat = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: q, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Search knowledge base for relevant context
    const kbResults = searchKnowledgeBase(q);
    let knowledgeContext = "";
    if (kbResults.length > 0) {
      knowledgeContext = kbResults
        .slice(0, 3)
        .map(
          (c) =>
            `## ${c.title} (${c.titleEs}) — Level: ${c.level}\nFormula: ${c.formula}\n${c.summary}\nExamples:\n${c.examples.map((e) => `  ✓ ${e.correct} — ${e.explanation}`).join("\n")}`
        )
        .join("\n\n");
    }

    try {
      const customBehaviorRaw = localStorage.getItem("teclingo_secret_behavior");
      let systemInstruction = "";
      let customAppMasterInfo = "";
      if (customBehaviorRaw) {
        try {
          const parsed = JSON.parse(customBehaviorRaw);
          systemInstruction = parsed.systemInstruction || "";
          customAppMasterInfo = parsed.appMasterInfo || "";
        } catch {}
      }

      const res = await fetch("/api/tutor/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })), knowledgeContext, systemInstruction, customAppMasterInfo }),
      });

      if (!res.ok) throw new Error("Tutor API failed");
      const data = await res.json();
      const assistantMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble connecting right now. Please try again.", timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleSearch = async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const results = searchKnowledgeBase(q);
    setSearchResults(results);
  };

  const loadExercises = async (concept?: KnowledgeConcept) => {
    setExerciseLoading(true);
    setExercises([]);
    setExerciseAnswers({});
    setExerciseSubmitted(false);

    try {
      const res = await fetch("/api/tutor/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptTitle: concept?.title || selectedConcept?.title || "English grammar",
          level: concept?.level || selectedConcept?.level || "B1",
          exerciseType: "fill_blank",
        }),
      });
      const data = await res.json();
      setExercises(data.exercises || []);
      setView("exercise");
    } catch {
      setExercises([]);
    } finally {
      setExerciseLoading(false);
    }
  };

  const loadQuiz = async (concept?: KnowledgeConcept) => {
    setExerciseLoading(true);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await fetch("/api/tutor/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptTitle: concept?.title || selectedConcept?.title || "English grammar",
          level: concept?.level || selectedConcept?.level || "B1",
        }),
      });
      const data = await res.json();
      setQuizQuestions(data.quiz || []);
      setView("exercise");
    } catch {
      setQuizQuestions([]);
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  const suggestedTopics = ["Present Perfect vs Past Simple", "When to use 'the'?", "Phrasal verbs with 'get'", "Second conditional examples"];

  // ─── SIDEBAR TABS ────────────────────────────────────────
  const sidebarTabs = [
    { id: "chat" as const, icon: MessageCircle, label: "Chat" },
    { id: "browse" as const, icon: Library, label: "Browse" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "exercise" as const, icon: Dumbbell, label: "Practice" },
  ];

  // ─── RENDER: CHAT VIEW ───────────────────────────────────
  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#0058bc] text-white rounded-br-md"
                  : "bg-gray-100 dark:bg-[#1a1b20] text-gray-800 dark:text-gray-200 rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-[#1a1b20] px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((t) => (
              <button
                key={t}
                onClick={() => { setInput(t); setTimeout(sendChat, 100); }}
                className="text-[11px] font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 dark:border-gray-800/80">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-[#0e0f12] rounded-2xl border border-gray-200 dark:border-gray-800 p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "es" ? "Pregúntale al tutor..." : "Ask the tutor..."}
            rows={1}
            className="flex-1 bg-transparent text-[13px] text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-hidden px-2 py-1.5 max-h-[80px]"
          />
          <button
            onClick={sendChat}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-[#0058bc] text-white hover:bg-[#004a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: BROWSE VIEW ─────────────────────────────────
  const renderBrowse = () => (
    <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-thin">
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
          {language === "es" ? "Categorías" : "Categories"}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {KB_CATEGORIES.filter((cat) => KNOWLEDGE_BASE.some((c) => c.category === cat.id)).map((cat) => {
            const count = KNOWLEDGE_BASE.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50"
                    : "bg-white dark:bg-[#121316] border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/40"
                }`}
              >
                <span className="text-lg block mb-1">{cat.icon}</span>
                <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 block">{language === "es" ? cat.labelEs : cat.label}</span>
                <span className="text-[9px] text-gray-400">{count} {language === "es" ? "conceptos" : "concepts"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {selectedCategory
            ? KB_CATEGORIES.find((c) => c.id === selectedCategory)?.[language === "es" ? "labelEs" : "label"]
            : language === "es"
            ? "Todos los Conceptos"
            : "All Concepts"}
        </h3>
        {(selectedCategory ? getConceptsByCategory(selectedCategory as any) : KNOWLEDGE_BASE).map((concept) => (
          <button
            key={concept.id}
            onClick={() => { setSelectedConcept(concept); setView("concept"); }}
            className="w-full text-left p-3 bg-white dark:bg-[#121316] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 block truncate">
                  {language === "es" ? concept.titleEs : concept.title}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">{concept.summary}</span>
              </div>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 shrink-0 transition-colors" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[8px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                {concept.level}
              </span>
              <span className="text-[8px] font-bold bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                {KB_CATEGORIES.find((c) => c.id === concept.category)?.icon} {KB_CATEGORIES.find((c) => c.id === concept.category)?.[language === "es" ? "labelEs" : "label"]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── RENDER: CONCEPT DETAIL VIEW ─────────────────────────
  const renderConcept = () => {
    if (!selectedConcept) return null;
    const c = selectedConcept;
    return (
      <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-thin">
        <button onClick={() => setView("browse")} className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer">
          <ArrowLeft size={14} /> {language === "es" ? "Volver" : "Back"}
        </button>

        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{language === "es" ? c.titleEs : c.title}</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{language === "es" ? c.summaryEs : c.summary}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{c.level}</span>
            <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {KB_CATEGORIES.find((cat) => cat.id === c.category)?.icon} {KB_CATEGORIES.find((cat) => cat.id === c.category)?.[language === "es" ? "labelEs" : "label"]}
            </span>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 block mb-1">{language === "es" ? "Fórmula / Estructura" : "Formula / Structure"}</span>
          <code className="text-[12px] font-mono text-gray-900 dark:text-gray-100">{c.formula}</code>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-2">{language === "es" ? "Ejemplos" : "Examples"}</span>
          <div className="space-y-2">
            {c.examples.map((ex, i) => (
              <div key={i} className="p-3 bg-white dark:bg-[#121316] border border-gray-100 dark:border-gray-800 rounded-xl space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[12px] text-gray-800 dark:text-gray-200 font-semibold">{ex.correct}</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-[12px] text-red-500 line-through">{ex.wrong}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6 italic">{ex.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => loadExercises(c)}
            disabled={exerciseLoading}
            className="flex-1 py-2.5 bg-[#0058bc] text-white rounded-xl text-[11px] font-bold hover:bg-[#004a9e] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {exerciseLoading ? <RefreshCw size={13} className="animate-spin" /> : <Dumbbell size={13} />}
            {language === "es" ? "Practicar" : "Practice"}
          </button>
          <button
            onClick={() => loadQuiz(c)}
            disabled={exerciseLoading}
            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {exerciseLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {language === "es" ? "Quiz" : "Quiz"}
          </button>
          <button
            onClick={() => { setInput(`Tell me more about ${c.title}`); setView("chat"); }}
            className="py-2.5 px-4 bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 rounded-xl text-[11px] font-bold hover:bg-gray-200 dark:hover:bg-gray-700/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <MessageCircle size={13} />
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER: SEARCH VIEW ─────────────────────────────────
  const renderSearch = () => (
    <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-thin">
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          {language === "es" ? "Buscar en la Base de Conocimiento" : "Search Knowledge Base"}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#121316] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={language === "es" ? "Ej: conditionals, past perfect..." : "E.g.: conditionals, past perfect..."}
              className="flex-1 bg-transparent text-[12px] text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-hidden"
            />
          </div>
          <button onClick={handleSearch} className="p-2 bg-[#0058bc] text-white rounded-xl hover:bg-[#004a9e] transition-colors cursor-pointer">
            <Search size={14} />
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-gray-500">{searchResults.length} {language === "es" ? "resultados" : "results"}</span>
          {searchResults.map((concept) => (
            <button
              key={concept.id}
              onClick={() => { setSelectedConcept(concept); setView("concept"); }}
              className="w-full text-left p-3 bg-white dark:bg-[#121316] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 block truncate">
                    {language === "es" ? concept.titleEs : concept.title}
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">{concept.summary}</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[8px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">{concept.level}</span>
                {concept.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[8px] font-bold bg-gray-50 dark:bg-gray-900/40 text-gray-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Tag size={8} /> {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertTriangle size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-[12px] text-gray-400">{language === "es" ? "No se encontraron resultados" : "No results found"}</p>
        </div>
      )}
    </div>
  );

  // ─── RENDER: EXERCISE VIEW ───────────────────────────────
  const renderExercise = () => (
    <div className="p-4 space-y-4 overflow-y-auto h-full scrollbar-thin">
      <button onClick={() => setView("browse")} className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer">
        <ArrowLeft size={14} /> {language === "es" ? "Volver" : "Back"}
      </button>

      {exerciseLoading && (
        <div className="text-center py-12">
          <RefreshCw size={24} className="text-indigo-500 mx-auto mb-3 animate-spin" />
          <p className="text-[12px] text-gray-400">{language === "es" ? "Generando ejercicios..." : "Generating exercises..."}</p>
        </div>
      )}

      {!exerciseLoading && exercises.length > 0 && (
        <>
          <h3 className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {language === "es" ? "Ejercicios de Práctica" : "Practice Exercises"}
          </h3>
          {exercises.map((ex, i) => (
            <div key={i} className="p-4 bg-white dark:bg-[#121316] border border-gray-100 dark:border-gray-800 rounded-xl space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-[13px] text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
                  {ex.sentence.replace(/__BLANK__/g, "_____")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-1.5 pl-8">
                {ex.options.map((opt, oIdx) => {
                  const isSelected = exerciseAnswers[i] === oIdx;
                  const isCorrect = exerciseSubmitted && oIdx === ex.correctIndex;
                  const isWrongSelected = exerciseSubmitted && isSelected && oIdx !== ex.correctIndex;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => !exerciseSubmitted && setExerciseAnswers((prev) => ({ ...prev, [i]: oIdx }))}
                      disabled={exerciseSubmitted}
                      className={`text-left p-2.5 rounded-lg text-[12px] border transition-all cursor-pointer ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                          : isWrongSelected
                          ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                          : isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                          : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {exerciseSubmitted && (
                <div className="pl-8 mt-2">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 italic flex items-start gap-1.5">
                    <Lightbulb size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    {ex.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
          {!exerciseSubmitted ? (
            <button
              onClick={() => setExerciseSubmitted(true)}
              disabled={Object.keys(exerciseAnswers).length < exercises.length}
              className="w-full py-2.5 bg-[#0058bc] text-white rounded-xl text-[12px] font-bold hover:bg-[#004a9e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {language === "es" ? "Verificar Respuestas" : "Check Answers"}
            </button>
          ) : (
            <button
              onClick={() => { setExercises([]); setExerciseAnswers({}); setExerciseSubmitted(false); }}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-[12px] font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} /> {language === "es" ? "Más Ejercicios" : "More Exercises"}
            </button>
          )}
        </>
      )}

      {/* QUIZ VIEW */}
      {!exerciseLoading && quizQuestions.length > 0 && (
        <>
          <h3 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {language === "es" ? "Quiz Rápido" : "Quick Quiz"}
          </h3>
          {quizQuestions.map((q) => (
            <div key={q.id} className="p-4 bg-white dark:bg-[#121316] border border-gray-100 dark:border-gray-800 rounded-xl space-y-3">
              <p className="text-[13px] text-gray-800 dark:text-gray-200 font-semibold">{q.question}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[q.id] === oIdx;
                  const isCorrect = quizSubmitted && oIdx === q.correctIndex;
                  const isWrongSelected = quizSubmitted && isSelected && oIdx !== q.correctIndex;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                      disabled={quizSubmitted}
                      className={`text-left p-2.5 rounded-lg text-[12px] border transition-all cursor-pointer ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                          : isWrongSelected
                          ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                          : isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                          : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {quizSubmitted && (
                <div className="mt-2">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 italic flex items-start gap-1.5">
                    <Lightbulb size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
          {!quizSubmitted ? (
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={Object.keys(quizAnswers).length < quizQuestions.length}
              className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {language === "es" ? "Verificar Quiz" : "Check Quiz"}
            </button>
          ) : (
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
              <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">
                {Object.keys(quizAnswers).filter((k) => quizAnswers[Number(k)] === quizQuestions.find((q) => q.id === Number(k))?.correctIndex).length} / {quizQuestions.length} {language === "es" ? "correctas" : "correct"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ─── MAIN RENDER ─────────────────────────────────────────
  return (
    <div className="apple-fade-in h-full flex flex-col bg-white dark:bg-[#0b0c0e] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800/80 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
          <Brain size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-extrabold text-gray-900 dark:text-gray-100">{language === "es" ? "Tutor IA TECLINGO" : "TECLINGO AI Tutor"}</h2>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
            {language === "es" ? "Base de Conocimiento + Chat + Ejercicios" : "Knowledge Base + Chat + Exercises"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-14 md:w-16 border-r border-gray-100 dark:border-gray-800/80 flex flex-col items-center py-3 gap-2 shrink-0 bg-gray-50/50 dark:bg-[#0a0b0d]">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setView(tab.id); if (tab.id === "browse") setSelectedCategory(null); }}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                view === tab.id || (view === "concept" && tab.id === "browse") || (view === "exercise" && tab.id === "exercise")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              title={tab.label}
            >
              <tab.icon size={18} />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {view === "chat" && renderChat()}
          {view === "browse" && renderBrowse()}
          {view === "concept" && renderConcept()}
          {view === "search" && renderSearch()}
          {view === "exercise" && renderExercise()}
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[12px] font-mono">$1</code>')
    .replace(/\n/g, "<br/>");
}
