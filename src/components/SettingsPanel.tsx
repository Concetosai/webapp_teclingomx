import React, { useState } from "react";
import { 
  User, 
  Settings, 
  Trash2, 
  Sparkles, 
  Volume2, 
  GraduationCap, 
  Clock, 
  Save, 
  CheckCircle,
  HelpCircle,
  Smartphone,
  Shield,
  RotateCcw,
  Flame,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  MessageSquare
} from "lucide-react";

interface UserStats {
  streak: number;
  lastActiveDate: string;
  totalPractices: number;
  savedWords: any[];
  grammarChecks: number;
  weeklyActivity: { [key: string]: number };
  toeflScores: { [key: string]: number };
}

interface SettingsPanelProps {
  currentUser: { name: string; email: string; role: string };
  userStats: UserStats;
  onUpdateUser: (userData: { name: string; email: string; role: string }) => void;
  onResetStats: () => void;
  language: "es" | "en";
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export default function SettingsPanel({ 
  currentUser, 
  userStats, 
  onUpdateUser, 
  onResetStats, 
  language, 
  theme,
  onThemeToggle
}: SettingsPanelProps) {
  // Input fields
  const [userName, setUserName] = useState(currentUser.name);
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem("teclingo_pref_difficulty") || "intermediate");
  const [voiceGender, setVoiceGender] = useState(() => localStorage.getItem("teclingo_pref_voice") || "female");
  const [dailyGoal, setDailyGoal] = useState(() => localStorage.getItem("teclingo_pref_goal") || "15");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("teclingo_pref_notifs") !== "false");
  
  // Status message
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Feedback feature states
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("Idea");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [savedFeedbacks, setSavedFeedbacks] = useState<Array<{ category: string; text: string; date: string }>>(() => {
    try {
      const stored = localStorage.getItem("teclingo_saved_feedback");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save preferences
    localStorage.setItem("teclingo_pref_difficulty", difficulty);
    localStorage.setItem("teclingo_pref_voice", voiceGender);
    localStorage.setItem("teclingo_pref_goal", dailyGoal);
    localStorage.setItem("teclingo_pref_notifs", String(notificationsEnabled));
    
    // Update user display name
    onUpdateUser({
      ...currentUser,
      name: userName
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleResetData = () => {
    onResetStats();
    setShowConfirmReset(false);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    setFeedbackSubmitting(true);
    setTimeout(() => {
      const newFeedback = {
        category: feedbackCategory,
        text: feedbackText.trim(),
        date: new Date().toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      const updatedList = [newFeedback, ...savedFeedbacks];
      setSavedFeedbacks(updatedList);
      localStorage.setItem("teclingo_saved_feedback", JSON.stringify(updatedList));
      setFeedbackText("");
      setFeedbackSuccess(true);
      setFeedbackSubmitting(false);
      setTimeout(() => setFeedbackSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 apple-fade-in pb-12">
      {/* Settings Header */}
      <header className="space-y-2">
        <span className="text-xs font-bold text-[#0058bc] dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/25 px-3 py-1 rounded-full border border-blue-100/30 dark:border-blue-900/30">
          {language === "es" ? "Ajustes de Cuenta" : "Account Settings"}
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-2">
          <Settings className="text-[#0058bc] dark:text-blue-400 shrink-0" size={28} />
          {language === "es" ? "Configuración" : "Settings"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm leading-relaxed">
          {language === "es" 
            ? "Personaliza tu avatar, nivel de dificultad, voces de IA y metas diarias de aprendizaje."
            : "Customize your avatar, difficulty level, AI voices, and daily study targets."}
        </p>
      </header>

      {/* Bento Statistics Grid relocated here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 apple-fade-in">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute right-2 bottom-0 opacity-15">
            <Flame size={80} />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-100">
              {language === "es" ? "Racha Diaria" : "Daily Streak"}
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
              {language === "es" ? "¡Activo!" : "Active!"}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold">
              {userStats.streak} <span className="text-xs font-normal text-orange-100">{language === "es" ? "Días" : "Days"}</span>
            </h3>
            <p className="text-[9px] text-orange-100 mt-0.5">
              {language === "es" ? "¡Sigue practicando hoy!" : "Keep learning today!"}
            </p>
          </div>
        </div>

        {/* Practices Card */}
        <div className="bg-white dark:bg-[#15161a] border border-gray-150/80 dark:border-gray-800/85 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {language === "es" ? "Prácticas Totales" : "Total Practices"}
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0058bc] dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {userStats.totalPractices}
            </h3>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
              {language === "es" ? "Sesiones de laboratorio" : "Lab practice sessions"}
            </p>
          </div>
        </div>

        {/* Vocabulary Card */}
        <div className="bg-white dark:bg-[#15161a] border border-gray-150/80 dark:border-gray-800/85 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {language === "es" ? "Vocabulario Guardado" : "Saved Vocabulary"}
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {userStats.savedWords?.length || 0}
            </h3>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
              {language === "es" ? "Términos en biblioteca" : "Terms in library"}
            </p>
          </div>
        </div>

        {/* Grammar Checks Card */}
        <div className="bg-white dark:bg-[#15161a] border border-gray-150/80 dark:border-gray-800/85 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {language === "es" ? "Chequeos de Gramática" : "Grammar Checks"}
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {userStats.grammarChecks || 0}
            </h3>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
              {language === "es" ? "Análisis de textos con IA" : "AI text analyses"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#15161a] border border-gray-150/80 dark:border-gray-800/80 rounded-[28px] p-6 shadow-sm text-center relative overflow-hidden">
            {/* Symmetrical ambient aura background for visual style */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 -z-10" />
            
            <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto overflow-hidden border-4 border-white dark:border-[#15161a] shadow-md relative group mt-4">
              <img 
                alt="Profile Avatar" 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name || "Teclingo"}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mt-4">
              {currentUser.name}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1">
              {currentUser.role === "demo_master" || currentUser.role === "demo" ? (
                <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-200/40">
                  {language === "es" ? "Rol: Estudiante Demo" : "Role: Demo Learner"}
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full border border-blue-200/40">
                  {language === "es" ? "Estudiante Teclingo" : "Teclingo Learner"}
                </span>
              )}
            </p>

            <div className="border-t border-gray-100 dark:border-gray-800 my-6 pt-4 space-y-3.5 text-left text-xs text-gray-500 dark:text-gray-400 font-semibold">
              <div className="flex justify-between">
                <span>{language === "es" ? "Correo:" : "Email:"}</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">{currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "es" ? "Racha actual:" : "Current Streak:"}</span>
                <span className="text-orange-500 dark:text-orange-400 font-extrabold flex items-center gap-0.5">
                  🔥 {userStats.streak} {language === "es" ? "Días" : "Days"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{language === "es" ? "Prácticas realizadas:" : "Practices completed:"}</span>
                <span className="text-gray-800 dark:text-gray-200 font-bold">{userStats.totalPractices}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Tip Card */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/40 rounded-[28px] p-6 space-y-3">
            <h4 className="text-xs font-black text-[#0058bc] dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} />
              {language === "es" ? "Consejo IA de hoy" : "Today's AI Tip"}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
              {language === "es"
                ? "Configurar una meta diaria de 15 a 30 minutos ayuda notablemente a consolidar la memoria muscular vocal en inglés."
                : "Setting a daily goal of 15 to 30 minutes significantly helps consolidate muscular vocal memory in English."}
            </p>
          </div>
        </div>

        {/* Right Column: Setting Sections Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Preferences Form Card */}
            <div className="bg-white dark:bg-[#15161a] border border-gray-150/80 dark:border-gray-800/80 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
              
              {/* Form Feedback Success */}
              {saveSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {language === "es" 
                      ? "¡Ajustes guardados correctamente en tu perfil!" 
                      : "Settings successfully saved to your profile!"}
                  </span>
                </div>
              )}

              {/* SECTION 1: Personal Profile Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  {language === "es" ? "Información Personal" : "Personal Information"}
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    {language === "es" ? "Nombre en Pantalla" : "Display Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800/80 rounded-2xl text-sm font-semibold outline-hidden focus:border-[#0058bc] dark:focus:border-blue-500 transition-colors"
                    placeholder="Ana Pérez"
                  />
                </div>
              </div>

              {/* SECTION 2: Study Preferences */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <GraduationCap size={16} className="text-gray-400" />
                  {language === "es" ? "Preferencia Lingüística" : "Language Preference"}
                </h3>

                {/* Difficulty level selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    {language === "es" ? "Nivel de Inglés Requerido" : "Target English Level"}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["beginner", "intermediate", "advanced"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer uppercase ${
                          difficulty === lvl
                            ? "bg-[#0058bc] text-white border-[#0058bc] shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-150 dark:border-gray-800"
                        }`}
                      >
                        {lvl === "beginner" ? (language === "es" ? "Inicial (A1-A2)" : "Beginner") :
                         lvl === "intermediate" ? (language === "es" ? "Medio (B1-B2)" : "Intermediate") :
                         (language === "es" ? "Avanzado (C1)" : "Advanced")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Learning Goal */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-1">
                    <Clock size={12} />
                    {language === "es" ? "Meta Diaria de Estudio" : "Daily Study Goal"}
                  </label>
                  <select
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800/80 rounded-2xl text-sm font-semibold outline-hidden focus:border-[#0058bc] dark:focus:border-blue-500 transition-colors"
                  >
                    <option value="5">{language === "es" ? "5 minutos / día (Casual)" : "5 minutes / day (Casual)"}</option>
                    <option value="15">{language === "es" ? "15 minutos / día (Regular)" : "15 minutes / day (Regular)"}</option>
                    <option value="30">{language === "es" ? "30 minutos / día (Serio)" : "30 minutes / day (Serious)"}</option>
                    <option value="60">{language === "es" ? "60 minutos / día (Inmersivo)" : "60 minutes / day (Intense)"}</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: Voice / AI Preferences */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <Volume2 size={16} className="text-gray-400" />
                  {language === "es" ? "Preferencia de Voces IA" : "AI Voice Preferences"}
                </h3>

                {/* Voice Gender */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    {language === "es" ? "Género de la Voz Guía" : "Guide Voice Gender"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["female", "male"].map((voice) => (
                      <button
                        key={voice}
                        type="button"
                        onClick={() => setVoiceGender(voice)}
                        className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer capitalize ${
                          voiceGender === voice
                            ? "bg-[#0058bc] text-white border-[#0058bc] shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-150 dark:border-gray-800"
                        }`}
                      >
                        {voice === "female" ? (language === "es" ? "Femenina" : "Female") : (language === "es" ? "Masculina" : "Male")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification Setting */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800/80 mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {language === "es" ? "Recordatorios Diarios" : "Daily Reminders"}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold leading-none mt-1">
                      {language === "es" ? "Notificaciones vía navegador" : "Browser push reminders"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#0058bc] cursor-pointer"
                  />
                </div>
              </div>

              {/* Form Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-tr from-[#0058bc] to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  {language === "es" ? "Guardar Cambios" : "Save Settings"}
                </button>
              </div>

            </div>

            {/* Buzón de Comentarios y Sugerencias */}
            <div className="bg-gradient-to-br from-[#0058bc]/5 via-cyan-50/20 to-blue-50/10 dark:from-blue-950/10 dark:to-[#0058bc]/5 border border-[#0058bc]/15 rounded-[28px] p-6 md:p-8 space-y-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-[#0058bc]/10 dark:bg-blue-950/40 text-[#0058bc] dark:text-blue-400 rounded-2xl shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    {language === "es" ? "💬 Buzón de Comentarios y Sugerencias" : "💬 Feedback & Suggestions Box"}
                  </h4>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    {language === "es" ? "Ayúdanos a Mejorar Teclingo" : "Help Us Improve Teclingo"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                  {language === "es"
                    ? "Teclingo es una aplicación en pleno desarrollo activo. Para nosotros es fundamental que los usuarios dejen sus comentarios, ideas, propuestas o cualquier sugerencia que consideren útil para mejorar la experiencia de aprendizaje."
                    : "Teclingo is currently an application under active development. It is absolutely essential for us that users leave their comments, ideas, proposals, or any feedback they consider useful to improve the learning experience."}
                </p>
              </div>

              {feedbackSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <p>{language === "es" ? "¡Muchísimas gracias por tu propuesta!" : "Thank you so much for your proposal!"}</p>
                    <p className="text-[10px] font-medium text-emerald-500/90 dark:text-emerald-400/80 mt-1">
                      {language === "es"
                        ? "Hemos guardado tu propuesta localmente. Tus valiosos comentarios son el motor de nuestro crecimiento."
                        : "We've saved your proposal locally. Your valuable feedback is the driver of our growth."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                      {language === "es" ? "Tipo de Aportación" : "Contribution Type"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Idea 💡", "Falla / Bug 🐞", "Contenido 📚", "Otro 💬"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackCategory(cat)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-extrabold tracking-wider uppercase transition-all border cursor-pointer ${
                            feedbackCategory === cat
                              ? "bg-[#0058bc] text-white border-[#0058bc] shadow-xs"
                              : "bg-white hover:bg-gray-50 dark:bg-gray-800/20 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-150 dark:border-gray-800"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                      {language === "es" ? "Escribe tu comentario o propuesta aquí" : "Write your comment or proposal here"}
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={language === "es" ? "Escribe aquí tus ideas, opiniones o propuestas para mejorar la app..." : "Write here your ideas, opinions or proposals to improve the app..."}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800/80 rounded-2xl text-xs font-semibold outline-hidden focus:border-[#0058bc] dark:focus:border-blue-500 transition-colors resize-none shadow-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackText.trim() || feedbackSubmitting}
                    className="w-full py-3 bg-[#0058bc] hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {feedbackSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <MessageSquare size={13} />
                    )}
                    {language === "es" ? "Enviar Comentarios y Propuestas" : "Submit Feedback & Proposals"}
                  </button>
                </div>
              )}

              {savedFeedbacks.length > 0 && (
                <div className="border-t border-gray-150 dark:border-gray-800/50 pt-4 mt-2 space-y-2.5">
                  <h5 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                    {language === "es" ? "Tus Aportaciones Enviadas" : "Your Submitted Contributions"}
                  </h5>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {savedFeedbacks.map((fb, idx) => (
                      <div key={idx} className="bg-white/60 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/60 p-3 rounded-xl text-[11px] leading-relaxed animate-fadeIn">
                        <div className="flex justify-between items-center mb-1">
                          <span className="bg-[#0058bc]/10 text-[#0058bc] dark:text-blue-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                            {fb.category}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-gray-500">
                            {fb.date}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
                          {fb.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone Storage Reset */}
            <div className="bg-red-50/20 dark:bg-red-950/5 border border-red-200/40 dark:border-red-900/40 rounded-[28px] p-6 md:p-8 space-y-4">
              <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <Shield size={14} />
                {language === "es" ? "Zona de Peligro" : "Danger Zone"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                {language === "es"
                  ? "Si tienes problemas con tus puntajes de laboratorio o deseas comenzar de cero, puedes restablecer tu racha, vocabulario guardado e historial de actividades."
                  : "If you want to start over, you can clear all your streak milestones, vocabulary list, and detailed practice scores."}
              </p>

              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="py-3 px-5 border border-dashed border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  {language === "es" ? "Reiniciar Estadísticas del Alumno" : "Reset Student Data"}
                </button>
              ) : (
                <div className="p-4 bg-white dark:bg-[#15161a] rounded-2xl border border-rose-200/50 dark:border-rose-900/50 space-y-4 animate-bounce">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Trash2 className="text-rose-500 shrink-0" size={14} />
                    {language === "es" ? "¿Seguro que quieres borrar tus estadísticas?" : "Are you sure you want to clear your statistics?"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResetData}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      {language === "es" ? "Sí, borrar todo" : "Yes, clear everything"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      {language === "es" ? "Cancelar" : "Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
