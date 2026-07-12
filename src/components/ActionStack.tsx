import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  MessageCircle, 
  X, 
  Send, 
  ArrowRight,
  User,
  Bot,
  HelpCircle,
  ExternalLink
} from "lucide-react";

interface ActionStackProps {
  language: "es" | "en";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Simple custom component to render basic markdown elements safely (bold, lists, paragraphs)
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // Split by line
  const lines = text.split("\n");
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" />;
        
        // Bullet list item
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <ul key={index} className="list-disc pl-5 text-[12px] leading-relaxed text-gray-700">
              <li>{parseBold(content)}</li>
            </ul>
          );
        }
        
        // Ordered list item
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.\s)(.*)/);
          const num = match ? match[1] : "";
          const content = match ? match[2] : trimmed;
          return (
            <ol key={index} className="list-decimal pl-5 text-[12px] leading-relaxed text-gray-700">
              <li>
                <span className="font-bold">{num}</span>
                {parseBold(content)}
              </li>
            </ol>
          );
        }
        
        // Headings (e.g., ### Title)
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={index} className="text-sm font-black text-gray-900 mt-3 mb-1">
              {parseBold(trimmed.substring(4))}
            </h5>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={index} className="text-sm font-black text-[#0058bc] mt-4 mb-1">
              {parseBold(trimmed.substring(3))}
            </h4>
          );
        }
        
        // Default Paragraph
        return (
          <p key={index} className="text-[12px] leading-relaxed text-gray-700">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Helper function to parse **bold** text in strings
const parseBold = (text: string) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-black text-gray-950">{part}</strong>;
    }
    return part;
  });
};

export default function ActionStack({ language }: ActionStackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick-reply questions
  const SUGGESTED_QUESTIONS = language === "es" ? [
    "¿Qué es Teclingo?",
    "¿Tiene validez oficial?",
    "¿Cómo funciona la IA?",
    "Ver costos y planes"
  ] : [
    "What is Teclingo?",
    "Is it officially certified?",
    "How does the AI work?",
    "View pricing and plans"
  ];

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  // Set initial welcome message
  useEffect(() => {
    const welcomeText = language === "es" 
      ? "¡Hola! Soy tu asistente de soporte Teclingo IA. 🚀\n\nPregúntame lo que gustes sobre nuestra plataforma: nuestros 12 niveles de inglés, el Motor de Auditoría, los simuladores TOEFL, la certificación en Blockchain o cómo nos alineamos al TecNM."
      : "Hello! I am your Teclingo AI support assistant. 🚀\n\nFeel free to ask me anything about our platform: our 12 English levels, the Audit Engine, TOEFL simulators, Blockchain certification, or our alignment with the TecNM curriculum.";
    
    setMessages([{ role: "assistant", content: welcomeText }]);
  }, [language]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const customBehaviorRaw = localStorage.getItem("teclingo_secret_behavior");
      const customKBRaw = localStorage.getItem("teclingo_secret_kb_db");
      
      let customSystemInstruction = "";
      let customKBDatabase = [];
      let customAppMasterInfo = "";
      
      if (customBehaviorRaw) {
        try {
          const parsed = JSON.parse(customBehaviorRaw);
          customSystemInstruction = parsed.systemInstruction || "";
          customAppMasterInfo = parsed.appMasterInfo || "";
        } catch (e) {
          console.error("Failed to parse custom behavior", e);
        }
      }
      
      if (customKBRaw) {
        try {
          customKBDatabase = JSON.parse(customKBRaw) || [];
        } catch (e) {
          console.error("Failed to parse custom knowledge base", e);
        }
      }

      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          customSystemInstruction,
          customKBDatabase,
          customAppMasterInfo
        })
      });

      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Support chat error:", error);
      const errorMsg = language === "es" 
        ? "Lo siento, ha ocurrido un error al conectar con el servidor. ¿Deseas contactar a un profesor directamente por WhatsApp?"
        : "Sorry, an error occurred while connecting to the server. Would you like to reach out to a teacher directly via WhatsApp?";
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp connection link
  const whatsappUrl = `https://wa.me/528332892730?text=${encodeURIComponent(
    language === "es" 
      ? "Hola, me interesa información sobre clases de inglés personalizadas." 
      : "Hello, I am interested in information about personalized English classes."
  )}`;

  return (
    <>
      {/* FLOATING ACTION STACK CONTAINER - z-index high, 15px gap between items */}
      <div 
        className="fixed bottom-6 right-6 flex flex-col items-end gap-[15px] z-50 pointer-events-auto select-none"
        id="floating-action-stack"
      >
        <AnimatePresence mode="wait">
          {isMinimized ? (
            /* MINIMIZED STATE: Small elegant circular badge */
            <motion.button
              key="minimized-bubble"
              initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 15 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMinimized(false)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0058bc] to-[#007bf2] text-white flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border border-white/20 relative group transition-shadow"
              aria-label={language === "es" ? "Abrir asistentes" : "Open Assistants"}
              title={language === "es" ? "Abrir Asistentes Teclingo" : "Open Teclingo Assistants"}
            >
              {/* Premium pulsing aura */}
              <span className="absolute inset-0 rounded-full bg-[#0058bc]/30 animate-ping opacity-75 -z-10 group-hover:bg-[#0058bc]/45" />
              
              <MessageCircle size={24} className="fill-white stroke-none drop-shadow-sm" />
              
              {/* Symmetrical premium notification badge */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1013] text-[9px] font-bold text-white flex items-center justify-center shadow-md animate-bounce">
                1
              </span>
            </motion.button>
          ) : (
            /* MAXIMIZED STATE: Unified Glassmorphic Dock Card */
            <motion.div
              key="maximized-dock"
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.85 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/95 dark:bg-[#15161a]/95 backdrop-blur-xl border border-gray-150/90 dark:border-gray-800/80 rounded-[28px] p-5 shadow-2xl w-[230px] md:w-[250px] flex flex-col gap-3.5"
            >
              {/* Dock Header */}
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <span className="text-[10px] font-extrabold text-[#0058bc] dark:text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ✦ {language === "es" ? "Asistentes" : "Assistants"}
                </span>
                
                {/* Minimize Button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800/80 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all cursor-pointer"
                  aria-label={language === "es" ? "Minimizar" : "Minimize"}
                  title={language === "es" ? "Minimizar" : "Minimize"}
                >
                  <X size={13} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Dock Actions List */}
              <div className="flex flex-col gap-2.5">
                {/* Item 1: Asistente AI Button */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="w-full flex items-center gap-3 bg-gray-50/50 hover:bg-blue-50/40 dark:bg-gray-800/40 dark:hover:bg-blue-950/20 border border-gray-100 dark:border-gray-800/80 hover:border-blue-100/50 dark:hover:border-blue-900/40 rounded-2xl p-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0058bc] dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-gray-900 dark:text-gray-100 group-hover:text-[#0058bc] dark:group-hover:text-blue-400 transition-colors truncate">
                      {language === "es" ? "Asistente AI" : "AI Assistant"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold leading-none mt-0.5 truncate">
                      {language === "es" ? "Chat Inteligente" : "Smart Chat"}
                    </p>
                  </div>
                </button>

                {/* Item 2: Docente Online (WhatsApp) */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 bg-gray-50/50 hover:bg-emerald-50/40 dark:bg-gray-800/40 dark:hover:bg-emerald-950/20 border border-gray-100 dark:border-gray-800/80 hover:border-emerald-100/50 dark:hover:border-emerald-900/40 rounded-2xl p-2.5 transition-all cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <MessageCircle size={18} className="fill-emerald-600 dark:fill-emerald-400 stroke-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {language === "es" ? "Docente Online" : "Teacher Online"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold leading-none mt-0.5 truncate">
                      {language === "es" ? "Clase en Vivo" : "Live Session"}
                    </p>
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CHAT IA SUPPORT OVERLAY MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[380px] h-[520px] bg-white border border-gray-150/90 rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Top Header (Apple style) */}
            <div className="bg-[#f4f7fc]/85 border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
                  <Sparkles size={16} className="text-[#0058bc]" />
                </div>
                <div>
                  <h4 className="text-gray-950 font-black text-sm tracking-tight leading-tight">
                    {language === "es" ? "Teclingo Soporte IA" : "Teclingo AI Support"}
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {language === "es" ? "Online e Interactivo" : "Online & Interactive"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                    msg.role === "user" 
                      ? "bg-gray-150 text-gray-700 border-gray-200" 
                      : "bg-blue-50 text-[#0058bc] border-blue-100"
                  }`}>
                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-3xl text-xs shadow-xs relative ${
                    msg.role === "user"
                      ? "bg-[#0058bc] text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-150 rounded-tl-none"
                  }`}>
                    {msg.role === "user" ? (
                      <p className="leading-relaxed font-medium">{msg.content}</p>
                    ) : (
                      <SimpleMarkdown text={msg.content} />
                    )}
                  </div>
                </div>
              ))}

              {/* Loader Typing animation */}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0058bc] border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white border border-gray-150 p-4 rounded-3xl rounded-tl-none shadow-xs">
                    <div className="flex gap-1 items-center py-1">
                      <span className="w-2 h-2 bg-[#0058bc]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-[#0058bc]/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-[#0058bc] rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Anchor to scroll */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Section */}
            <div className="px-5 py-3 border-t border-gray-100 bg-white/95 shrink-0">
              <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block mb-2">
                {language === "es" ? "Preguntas sugeridas" : "Suggested questions"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSendMessage(q)}
                    className="text-[10px] font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-50 hover:text-[#0058bc] border border-blue-100/60 rounded-xl px-3 py-1.5 transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Input Area & WhatsApp fallback button */}
            <div className="p-4 bg-[#f4f7fc]/50 border-t border-gray-100 shrink-0 space-y-3">
              {/* Message Input Field */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="flex items-center gap-2 bg-white border border-gray-150 rounded-2xl px-3 py-1.5 shadow-xs focus-within:border-blue-300 transition-all"
              >
                <input
                  type="text"
                  value={inputValue}
                  disabled={isLoading}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === "es" ? "Escribe tu duda aquí..." : "Type your question here..."}
                  className="flex-1 text-xs text-gray-800 bg-transparent outline-none py-1 px-1"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-8 h-8 rounded-xl bg-[#0058bc] hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={14} className="stroke-[2.5]" />
                </button>
              </form>

              {/* Direct Link to WhatsApp Teachers */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="fill-white stroke-[#25D366]" />
                  <span>{language === "es" ? "Hablar con un Profesor" : "Talk to a Teacher"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>WhatsApp</span>
                  <ExternalLink size={10} />
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
