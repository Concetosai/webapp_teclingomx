import React from "react";
import { Award, Flame, CheckCircle, TrendingUp, Star, BookOpen } from "lucide-react";

interface Props {
  userStats: {
    streak: number;
    totalPractices: number;
    savedWords: any[];
    grammarChecks: number;
    weeklyActivity: { [key: string]: number };
    toeflScores: { [key: string]: number };
  };
}

export default function ProgressPanel({ userStats }: Props) {
  const streak = userStats.streak ?? 5;
  const totalCompleted = userStats.totalPractices ?? 14;
  const vocabularyCount = userStats.savedWords?.length ?? 0;
  const grammarChecksCount = userStats.grammarChecks ?? 0;
  const toeflScores = userStats.toeflScores ?? {};

  // Weekly data for SVG Chart
  const weeklyActivity = [
    { day: "Lunes", count: userStats.weeklyActivity?.Mon ?? 2 },
    { day: "Martes", count: userStats.weeklyActivity?.Tue ?? 4 },
    { day: "Miércoles", count: userStats.weeklyActivity?.Wed ?? 1 },
    { day: "Jueves", count: userStats.weeklyActivity?.Thu ?? 5 },
    { day: "Viernes", count: userStats.weeklyActivity?.Fri ?? 3 },
    { day: "Sábado", count: userStats.weeklyActivity?.Sat ?? 2 },
    { day: "Domingo", count: userStats.weeklyActivity?.Sun ?? 3 }
  ];

  const maxActivity = Math.max(...weeklyActivity.map(w => w.count), 1);

  return (
    <div id="ProgressPanel" className="apple-fade-in max-w-5xl mx-auto space-y-8">
      {/* Title Header */}
      <div>
        <span className="text-xs font-bold text-[#0058bc] uppercase tracking-wider">Tu Rendimiento</span>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Estadísticas de Aprendizaje</h2>
        <p className="text-sm text-gray-500 mt-1">Sigue de cerca tu constancia y las habilidades que has perfeccionado con IA.</p>
      </div>

      {/* Grid: Bento metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Streak card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute right-2 bottom-0 opacity-15">
            <Flame size={120} />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Daily Streak</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">¡Activo!</span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold">{streak} <span className="text-lg font-normal text-orange-100">Días</span></h3>
            <p className="text-[11px] text-orange-100 mt-1">¡Mantén la llama encendida mañana!</p>
          </div>
        </div>

        {/* Total Labs Practiced */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prácticas Totales</span>
            <div className="w-8 h-8 rounded-full bg-[#0058bc]/10 text-[#0058bc] flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-gray-900">{totalCompleted}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Ejercicios de laboratorio iniciados</p>
          </div>
        </div>

        {/* Vocabulary Saved */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vocabulario Guardado</span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-gray-900">{vocabularyCount}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Términos guardados en tu Library</p>
          </div>
        </div>

        {/* Grammar Accuracy Index */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chequeos de Gramática</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-gray-900">{grammarChecksCount}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Análisis ejecutados en Grammar Lab</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly activity SVG chart */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Frecuencia Semanal</h4>
              <p className="text-xs text-gray-400">Labs completados de lunes a domingo</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">
              Última actualización: hoy
            </span>
          </div>

          {/* Render clean, pixel perfect SVG charts */}
          <div className="h-48 flex items-end justify-between gap-2 pt-4">
            {weeklyActivity.map((w, idx) => {
              const heightPercent = (w.count / maxActivity) * 100;
              return (
                <div key={idx} className="flex-grow flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {w.count} completados
                    </div>
                    {/* Chart column bar */}
                    <div 
                      style={{ height: `${heightPercent || 10}%` }} 
                      className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer ${
                        w.count > 0 
                          ? "bg-[#0058bc] hover:bg-blue-700" 
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{w.day.substring(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOEFL Score distribution */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
            <Star size={16} className="text-amber-500 fill-amber-500" /> TOEFL Sections Scorecard
          </h4>
          
          {Object.keys(toeflScores).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(toeflScores).map(([sectionName, score]) => {
                const percent = (score / 30) * 100;
                return (
                  <div key={sectionName} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700">{sectionName}</span>
                      <span className="font-bold text-gray-900">{score} / 30</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="h-full bg-[#001E41] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400">
              <Award size={32} className="text-gray-300 mb-2" />
              <p className="text-xs font-semibold">No hay puntajes logueados</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Ve al TOEFL Simulator, completa un ensayo y haz clic en evaluar para ver tu score aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
