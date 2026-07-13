import React, { useState } from "react";
import { BookOpen, Search, Trash2, Tag, Bookmark, Heart, Sparkles, MessageSquare, Plus, X } from "lucide-react";

interface SavedVocab {
  term: string;
  definition: string;
  example: string;
}

interface Props {
  savedVocabulary: SavedVocab[];
  onRemoveVocabulary: (term: string) => void;
  userRole?: string;
  onSaveVocabulary?: (term: string, definition: string, example: string) => void;
}

const DEFAULT_IDIOMS = [
  { term: "Break a leg", definition: "A colloquial way to wish someone good luck, especially before a performance.", example: "Break a leg at your presentation today!" },
  { term: "Bite the bullet", definition: "To face a difficult situation with courage and get it over with.", example: "I decided to bite the bullet and ask for a raise." },
  { term: "Spill the beans", definition: "To reveal secret information, often unintentionally.", example: "Don't spill the beans about the surprise party." },
  { term: "Under the weather", definition: "Feeling slightly sick or unwell.", example: "I am feeling a bit under the weather today." },
  { term: "Piece of cake", definition: "Something that is very easy to do.", example: "Don't worry about the exam, it's a piece of cake." }
];

export default function LibraryPanel({ savedVocabulary, onRemoveVocabulary, userRole, onSaveVocabulary }: Props) {
  const [filter, setFilter] = useState<"all" | "saved" | "idioms">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Add new phrase modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newExample, setNewExample] = useState("");
  const [phraseType, setPhraseType] = useState<"word" | "phrase" | "idiom">("phrase");
  const [isOptimizing, setIsOptimizing] = useState(false);

  const language = localStorage.getItem("teclingo_language") || "es";
  const isGuest = userRole === "guest" || (!userRole && JSON.parse(localStorage.getItem("teclingo_user") || "{}").role === "guest");

  const activeVocabulary = filter === "saved" 
    ? savedVocabulary 
    : filter === "idioms" 
      ? DEFAULT_IDIOMS 
      : [...DEFAULT_IDIOMS, ...savedVocabulary];


  const filteredVocabulary = activeVocabulary.filter(v => 
    v.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptimizeWithAI = async () => {
    if (!newPhrase.trim()) return;
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/library/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: newPhrase.trim(), type: phraseType })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.correctedPhrase) setNewPhrase(data.correctedPhrase);
        if (data.translation) setNewMeaning(data.translation);
        if (data.example) setNewExample(data.example);
      }
    } catch (error) {
      console.error("AI polish failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSavePhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhrase.trim() || !newMeaning.trim()) return;

    if (isGuest) {
      setShowAddModal(false);
      localStorage.removeItem("teclingo_user");
      localStorage.setItem("teclingo_initial_tab", "register");
      window.location.reload();
      return;
    }

    if (onSaveVocabulary) {
      onSaveVocabulary(
        newPhrase.trim(),
        newMeaning.trim(),
        newExample.trim() || (language === "en" ? "Custom saved word/phrase" : "Palabra o frase guardada personalizada")
      );
    }

    // Reset and close
    setNewPhrase("");
    setNewMeaning("");
    setNewExample("");
    setPhraseType("phrase");
    setShowAddModal(false);
  };

  return (
    <div id="LibraryPanel" className="apple-fade-in max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0058bc] uppercase tracking-wider">
            {language === "en" ? "Your Repository" : "Tu Repositorio"}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {language === "en" ? "Personal Library" : "Biblioteca Personal"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === "en" 
              ? "Smart dictionary with terms saved from your labs and popular idioms." 
              : "Diccionario inteligente con términos guardados de tus laboratorios y modismos populares."}
          </p>
        </div>

        {/* Filter buttons and quick actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/40 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === "all" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {language === "en" ? "All" : "Todos"}
            </button>
            <button
              onClick={() => setFilter("saved")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === "saved" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {language === "en" ? "My Saved" : "Mis Guardados"} ({savedVocabulary.length})
            </button>
            <button
              onClick={() => setFilter("idioms")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === "idioms" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {language === "en" ? "Idioms" : "Modismos"}
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0058bc] to-blue-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/10 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>{language === "en" ? "Add New Phrase" : "Agregar Nueva Frase"}</span>
          </button>
        </div>
      </div>

      {/* 🚀 NUEVA SECCIÓN: EXPLICACIÓN DE LÍMITES DE ALMACENAMIENTO (VISIBLE PARA GUEST) */}
      {isGuest && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  {language === "en" ? "Vocabulary Storage Limits" : "Almacenamiento de Vocabulario"}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl font-medium">
                {language === "en" ? (
                  <>
                    ⚠️ <strong className="text-slate-900">Demo Mode:</strong> Your saved words will be deleted when you leave. 
                    By <strong className="text-[#0058bc]">Registering for Free</strong>, you obtain a basic space to save your first terms, but it remains limited. 
                    Want infinite space? The <strong className="text-indigo-600">Full Premium</strong> version lets you save all resources, phrases, and vocabulary without limits.
                  </>
                ) : (
                  <>
                    ⚠️ <strong className="text-slate-900">Modo Demo:</strong> Tus palabras guardadas se borrarán al salir. 
                    Al <strong className="text-[#0058bc]">Registrarte Gratis</strong> obtienes un espacio básico para guardar tus primeros términos, pero sigue siendo limitado. 
                    ¿Quieres espacio infinito? La versión <strong className="text-indigo-600">Full Premium</strong> te permite guardar todos los recursos, frases y vocabulario que quieras sin límites.
                  </>
                )}
              </p>
            </div>
            
            <button
              onClick={() => {
                localStorage.removeItem("teclingo_user");
                localStorage.setItem("teclingo_initial_tab", "register");
                window.location.reload();
              }}
              className="sm:self-center text-xs bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl border border-slate-300 shadow-sm transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider"
            >
              {language === "en" ? "Secure my free space →" : "Asegurar mi Espacio Gratis →"}
            </button>
          </div>

          {/* Barra de progreso visual para simular el límite de espacio */}
          <div className="mt-4 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-1/12 rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
            <span>{language === "en" ? "Demo Mode Space: Temporary" : "Espacio Modo Demo: Temporal"}</span>
            <span>{language === "en" ? "Free Version: Max. 20 words" : "Versión Free: Máx. 20 palabras"}</span>
          </div>
        </div>
      )}

      {/* Search and action bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar término o definición..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0058bc] text-xs bg-white"
        />
        <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
      </div>

      {/* Cards list */}
      {filteredVocabulary.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVocabulary.map((v, i) => {
            const isSaved = savedVocabulary.some(sv => sv.term === v.term);
            return (
              <div 
                key={i} 
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="font-bold text-[#0058bc] text-base leading-tight">{v.term}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isSaved ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                      {isSaved ? "Saved" : "Idiom"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {v.definition}
                  </p>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
                  <p className="text-[10px] text-gray-400 italic max-w-[80%] truncate" title={`Example: "${v.example}"`}>
                    "{v.example}"
                  </p>
                  {isSaved && (
                    <button
                      onClick={() => onRemoveVocabulary(v.term)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar de biblioteca"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 bg-slate-50/50">
          <BookOpen size={48} className="text-gray-300 mb-2" />
          <p className="text-sm font-semibold">No se encontraron términos</p>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            Prueba a buscar otro término o activa "Mis Guardados" para ver las palabras que recolectaste en el Listening Lab.
          </p>
        </div>
      )}

      {/* 📋 MODAL / FORMULARIO FLOTANTE PARA AGREGAR LA FRASE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#15161a] rounded-3xl border border-gray-150 dark:border-gray-800 p-6 w-full max-w-md shadow-2xl space-y-4 relative text-left">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-[#0058bc]" size={18} />
                {language === "en" ? "Customize Your Dictionary" : "Personaliza tu Diccionario"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === "en" 
                  ? "Add words, idioms, or phrases you want to remember and practice later." 
                  : "Añade palabras, modismos o frases que quieras recordar y practicar más tarde."}
              </p>
            </div>

            <form onSubmit={handleSavePhrase} className="space-y-4">
              {/* 🆕 SELECTOR DE TIPO (Palabra, Frase, Modismo) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  {language === "en" ? "Element Type" : "Tipo de Elemento"}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                  {(['word', 'phrase', 'idiom'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPhraseType(type)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        phraseType === type 
                          ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {type === 'word' 
                        ? (language === "en" ? "Word" : "Palabra") 
                        : type === 'phrase' 
                          ? (language === "en" ? "Phrase" : "Frase") 
                          : (language === "en" ? "Idiom" : "Modismo")}
                    </button>
                  ))}
                </div>
              </div>

              {/* FRASE O EXPRESIÓN EN INGLÉS + BOTÓN DE IA */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  {language === "en" ? "Phrase or Expression in English" : "Frase o Expresión en Inglés"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder={
                      phraseType === "word" 
                        ? (language === "en" ? "e.g. Schedule" : "Ej. Schedule")
                        : phraseType === "idiom"
                          ? (language === "en" ? "e.g. Under the weather" : "Ej. Under the weather")
                          : (language === "en" ? "e.g. Break a leg" : "Ej. Break a leg")
                    }
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    className="w-full text-xs p-3.5 pr-28 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058bc] bg-slate-50 dark:bg-slate-900/40 text-gray-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    disabled={!newPhrase.trim() || isOptimizing}
                    onClick={handleOptimizeWithAI}
                    className="absolute right-2 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] tracking-wide shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                  >
                    {isOptimizing ? '🪄 ...' : (language === "en" ? '✨ Polish' : '✨ Pulir con IA')}
                  </button>
                </div>
              </div>

              {/* SIGNIFICADO O TRADUCCIÓN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  {language === "en" ? "Meaning or Translation" : "Significado o Traducción"}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={
                    phraseType === "word"
                      ? (language === "en" ? "e.g. A plan that gives expected times for different things." : "Ej. Un plan que detalla tiempos esperados.")
                      : (language === "en" ? "e.g. Feeling slightly sick or unwell." : "Ej. Sentirse un poco enfermo o indispuesto.")
                  }
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058bc] bg-slate-50 dark:bg-slate-900/40 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* EJEMPLO DE USO */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  {language === "en" ? "Usage Example (Optional)" : "Ejemplo de Uso (Opcional)"}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    language === "en" 
                      ? "e.g. I am feeling a bit under the weather today." 
                      : "Ej. I am feeling a bit under the weather today."
                  }
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058bc] bg-slate-50 dark:bg-slate-900/40 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                >
                  {language === "en" ? "Cancel" : "Cancelar"}
                </button>
                <button
                  type="submit"
                  className="py-3 px-5 rounded-xl bg-[#0058bc] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {language === "en" ? "Save Phrase" : "Guardar Frase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
