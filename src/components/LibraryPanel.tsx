import React, { useState } from "react";
import { BookOpen, Search, Trash2, Tag, Bookmark, Heart, Sparkles, MessageSquare } from "lucide-react";

interface SavedVocab {
  term: string;
  definition: string;
  example: string;
}

interface Props {
  savedVocabulary: SavedVocab[];
  onRemoveVocabulary: (term: string) => void;
}

const DEFAULT_IDIOMS = [
  { term: "Break a leg", definition: "A colloquial way to wish someone good luck, especially before a performance.", example: "Break a leg at your presentation today!" },
  { term: "Bite the bullet", definition: "To face a difficult situation with courage and get it over with.", example: "I decided to bite the bullet and ask for a raise." },
  { term: "Spill the beans", definition: "To reveal secret information, often unintentionally.", example: "Don't spill the beans about the surprise party." },
  { term: "Under the weather", definition: "Feeling slightly sick or unwell.", example: "I am feeling a bit under the weather today." },
  { term: "Piece of cake", definition: "Something that is very easy to do.", example: "Don't worry about the exam, it's a piece of cake." }
];

export default function LibraryPanel({ savedVocabulary, onRemoveVocabulary }: Props) {
  const [filter, setFilter] = useState<"all" | "saved" | "idioms">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeVocabulary = filter === "saved" 
    ? savedVocabulary 
    : filter === "idioms" 
      ? DEFAULT_IDIOMS 
      : [...DEFAULT_IDIOMS, ...savedVocabulary];

  const filteredVocabulary = activeVocabulary.filter(v => 
    v.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="LibraryPanel" className="apple-fade-in max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0058bc] uppercase tracking-wider">Tu Repositorio</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Biblioteca Personal</h2>
          <p className="text-sm text-gray-500 mt-1">Diccionario inteligente con términos guardados de tus laboratorios y modismos populares.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/40 text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === "all" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("saved")}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === "saved" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            Mis Guardados ({savedVocabulary.length})
          </button>
          <button
            onClick={() => setFilter("idioms")}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === "idioms" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
          >
            Modismos
          </button>
        </div>
      </div>

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
    </div>
  );
}
