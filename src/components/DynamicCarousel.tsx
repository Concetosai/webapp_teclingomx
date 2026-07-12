import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Mic, 
  ShieldCheck, 
  Zap, 
  Binary, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Globe, 
  TrendingUp, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  Eye, 
  Heart,
  Sparkles
} from "lucide-react";

interface DynamicCarouselProps {
  language: "es" | "en";
}

interface BenefitItem {
  id: number;
  category: "tech" | "academic" | "user";
  categoryLabel: { es: string; en: string };
  title: { es: string; en: string };
  desc: { es: string; en: string };
  icon: React.ReactNode;
  iconColor: string;
}

export default function DynamicCarousel({ language }: DynamicCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);

  const benefits: BenefitItem[] = [
    // Categoría 1: Tecnología IA
    {
      id: 1,
      category: "tech",
      categoryLabel: { es: "Tecnología IA", en: "AI Tech" },
      title: { es: "Motor de Auditoría", en: "Audit Engine" },
      desc: { es: "Corrección gramatical en tiempo real.", en: "Real-time grammar correction." },
      icon: <Cpu className="w-4 h-4" />,
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      category: "tech",
      categoryLabel: { es: "Tecnología IA", en: "AI Tech" },
      title: { es: "Fonética Profunda", en: "Deep Phonetics" },
      desc: { es: "Análisis de acento y entonación nativa.", en: "Native-like accent & intonation analysis." },
      icon: <Mic className="w-4 h-4" />,
      iconColor: "text-sky-600"
    },
    {
      id: 3,
      category: "tech",
      categoryLabel: { es: "Tecnología IA", en: "AI Tech" },
      title: { es: "Integración Blockchain", en: "Blockchain Verification" },
      desc: { es: "Certificados oficiales verificables.", en: "Verifiable official certificates." },
      icon: <ShieldCheck className="w-4 h-4" />,
      iconColor: "text-indigo-600"
    },
    {
      id: 4,
      category: "tech",
      categoryLabel: { es: "Tecnología IA", en: "AI Tech" },
      title: { es: "Procesamiento Llama/Groq", en: "Llama & Groq Processing" },
      desc: { es: "Velocidad de respuesta instantánea.", en: "Instant response speed." },
      icon: <Zap className="w-4 h-4" />,
      iconColor: "text-amber-600"
    },
    {
      id: 5,
      category: "tech",
      categoryLabel: { es: "Tecnología IA", en: "AI Tech" },
      title: { es: "Auditoría de 'It'", en: "'It' Subject Audit" },
      desc: { es: "Corrección automática de omisiones de sujeto.", en: "Automated correction of subject omissions." },
      icon: <Binary className="w-4 h-4" />,
      iconColor: "text-violet-600"
    },
    // Categoría 2: Ventajas Académicas
    {
      id: 6,
      category: "academic",
      categoryLabel: { es: "Ventaja Académica", en: "Academic" },
      title: { es: "Ruta de Titulación", en: "Graduation Roadmap" },
      desc: { es: "12 niveles alineados al TecNM.", en: "12 levels aligned to TecNM." },
      icon: <GraduationCap className="w-4 h-4" />,
      iconColor: "text-purple-600"
    },
    {
      id: 7,
      category: "academic",
      categoryLabel: { es: "Ventaja Académica", en: "Academic" },
      title: { es: "Simuladores TOEFL", en: "TOEFL Simulators" },
      desc: { es: "Reactivos técnicos calibrados.", en: "Calibrated technical samples." },
      icon: <Award className="w-4 h-4" />,
      iconColor: "text-pink-600"
    },
    {
      id: 8,
      category: "academic",
      categoryLabel: { es: "Ventaja Académica", en: "Academic" },
      title: { es: "Enfoque Tech", en: "Engineering Focus" },
      desc: { es: "Vocabulario especializado para ingeniería.", en: "Tailored vocabulary for engineering." },
      icon: <BookOpen className="w-4 h-4" />,
      iconColor: "text-emerald-600"
    },
    {
      id: 9,
      category: "academic",
      categoryLabel: { es: "Ventaja Académica", en: "Academic" },
      title: { es: "Formato MCER", en: "CEFR Format" },
      desc: { es: "Preparación estándar internacional B1/B2.", en: "International standard prep B1/B2." },
      icon: <Globe className="w-4 h-4" />,
      iconColor: "text-teal-600"
    },
    {
      id: 10,
      category: "academic",
      categoryLabel: { es: "Ventaja Académica", en: "Academic" },
      title: { es: "Reportes Athena", en: "Athena Reports" },
      desc: { es: "Análisis con desgloses detallados.", en: "Analysis with detailed breakdowns." },
      icon: <TrendingUp className="w-4 h-4" />,
      iconColor: "text-rose-600"
    },
    // Categoría 3: Beneficios Usuario
    {
      id: 11,
      category: "user",
      categoryLabel: { es: "Beneficio Usuario", en: "User Benefit" },
      title: { es: "Acceso 24/7", en: "24/7 Access" },
      desc: { es: "Practica en tu ritmo y horario.", en: "Practice at your own pace and time." },
      icon: <Clock className="w-4 h-4" />,
      iconColor: "text-green-600"
    },
    {
      id: 12,
      category: "user",
      categoryLabel: { es: "Beneficio Usuario", en: "User Benefit" },
      title: { es: "Contenido Adaptativo", en: "Adaptive Content" },
      desc: { es: "Ajustado a tus necesidades reales.", en: "Tailored to your real needs." },
      icon: <Sliders className="w-4 h-4" />,
      iconColor: "text-orange-600"
    },
    {
      id: 13,
      category: "user",
      categoryLabel: { es: "Beneficio Usuario", en: "User Benefit" },
      title: { es: "Resultados Medibles", en: "Measurable Results" },
      desc: { es: "Seguimiento claro de tu progreso.", en: "Clear tracking of your progress." },
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconColor: "text-emerald-600"
    },
    {
      id: 14,
      category: "user",
      categoryLabel: { es: "Beneficio Usuario", en: "User Benefit" },
      title: { es: "Interfaz 'Aqua'", en: "Aqua Interface" },
      desc: { es: "Diseño limpio para evitar fatiga visual.", en: "Clean design to avoid eye strain." },
      icon: <Eye className="w-4 h-4" />,
      iconColor: "text-cyan-600"
    },
    {
      id: 15,
      category: "user",
      categoryLabel: { es: "Beneficio Usuario", en: "User Benefit" },
      title: { es: "Soporte con Empatía", en: "Empathetic Support" },
      desc: { es: "Modelos de aprendizaje centrados en ti.", en: "Learning models focused on you." },
      icon: <Heart className="w-4 h-4" />,
      iconColor: "text-red-600"
    }
  ];

  // Duplicate items 3 times to guarantee continuous seamless scroll
  const marqueeItems = [...benefits, ...benefits, ...benefits];

  return (
    <div 
      className="apple-fade-in bg-[#f4f7fc]/45 border border-gray-150/50 rounded-2xl h-14 overflow-hidden relative flex items-center w-full select-none"
      id="breaking-news-ticker"
    >
      {/* Inline styles for custom marquee animation */}
      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.3333%, 0, 0);
          }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          width: max-content;
          animation: ticker-scroll 55s linear infinite;
        }
      `}</style>

      {/* Static "Breaking News / Pilares" Badge on the left */}
      <div className="flex items-center gap-1.5 bg-[#0058bc] text-white px-4 h-full shrink-0 font-black text-[10px] sm:text-[11px] tracking-widest uppercase z-20 shadow-md">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span>{language === "es" ? "Beneficios" : "Benefits"}</span>
      </div>

      {/* Sliding Marquee viewport */}
      <div 
        className="flex-1 overflow-hidden h-full flex items-center relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Soft fading overlays for modern depth */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f4f7fc] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f4f7fc]/60 to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div 
          className="ticker-track"
          style={{
            animationPlayState: isPaused ? "paused" : "running"
          }}
        >
          {marqueeItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-xs font-medium"
            >
              {/* Minimal category label */}
              <span className="text-[9px] font-black tracking-widest text-[#0058bc]/70 uppercase bg-blue-50 border border-blue-100/50 px-1.5 py-0.5 rounded">
                {language === "es" ? item.categoryLabel.es : item.categoryLabel.en}
              </span>

              {/* Minimal Icon */}
              <div className={`p-1 bg-white border border-gray-100 rounded-full shadow-xs shrink-0 ${item.iconColor}`}>
                {item.icon}
              </div>

              {/* Title & Short Description */}
              <div className="flex items-center gap-1">
                <span className="text-gray-950 font-bold text-[12px]">
                  {language === "es" ? item.title.es : item.title.en}
                </span>
                <span className="text-gray-300 font-normal">|</span>
                <span className="text-gray-500 text-[11px] font-normal">
                  {language === "es" ? item.desc.es : item.desc.en}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
