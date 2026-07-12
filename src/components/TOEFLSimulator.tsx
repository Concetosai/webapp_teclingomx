import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Award, 
  FileText, 
  CheckCircle, 
  Flame, 
  Star, 
  Compass, 
  PenTool, 
  Printer, 
  Shield, 
  Info, 
  TrendingUp, 
  Layers,
  X,
  Volume2,
  BookOpen,
  HelpCircle,
  Activity,
  ChevronRight,
  GraduationCap,
  Clock,
  Check,
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";
import { TOEFLResult } from "../types";

interface Props {
  onBack: () => void;
  onLogTOEFLScore: (score: number, section: string) => void;
}

const TOEFL_PROMPTS = [
  {
    id: "writing1",
    title: "✍️ Academic Discussion: Technological Growth",
    desc: "Your professor wants you to participate in an online class discussion. Writing prompt: 'Do you believe that rapid technological progress has contributed to overall human happiness, or has it isolated us from genuine social interaction? Support your views with concrete reasoning.'",
    section: "writing"
  },
  {
    id: "writing2",
    title: "✍️ Integrated Writing: Working From Home",
    desc: "Analyze the controversy regarding corporate remote work policies. Writing prompt: 'Some experts argue remote work reduces office operational cost and boosts morale. Others state it deteriorates team cohesion and output tracking. Argue whether hybrid models solve both issues.'",
    section: "writing"
  }
];

const ROADMAP_LEVELS = [
  {
    level: 1,
    code: "A1.1",
    title: "Welcome & Personal Profiles",
    status: "completado",
    mcer: "A1",
    toefl: "310 - 349 pts",
    techFocus: "Vocabulario básico de presentación personal, datos de contacto, roles de ingeniería y componentes de equipos personales.",
    grammarTrap: "Confusión entre pronombres de sujeto y objeto (ej. usar 'he wants I to design' en lugar de 'he wants me to design' en correos de equipo)."
  },
  {
    level: 2,
    code: "A1.2",
    title: "Hardware & Software Basics",
    status: "completado",
    mcer: "A1",
    toefl: "350 - 399 pts",
    techFocus: "Vocabulario de componentes de hardware internos, servidores de red, sistemas operativos e instrucciones imperativas básicas en consola.",
    grammarTrap: "Uso correcto de adjetivos antes del sustantivo en jerga técnica (ej. 'magnetic drive' en lugar de '*drive magnetic' o 'unindexed query' en lugar de '*query unindexed')."
  },
  {
    level: 3,
    code: "A2.1",
    title: "Network Essentials & Protocols",
    status: "completado",
    mcer: "A2",
    toefl: "400 - 425 pts",
    techFocus: "Topologías de red, protocolos HTTP/IP, enrutamiento, servicios DNS y puertos comunes para contenedores de software.",
    grammarTrap: "Uso correcto de comparativos irregulares en rendimiento y latencia (ej. 'better performance' en lugar de '*more good performance' para evaluar balanceadores)."
  },
  {
    level: 4,
    code: "A2.2",
    title: "Basic Database & Algorithms",
    status: "completado",
    mcer: "A2",
    toefl: "426 - 459 pts",
    techFocus: "Tablas, llaves primarias, variables, flujos condicionales condicionados e interacciones lineales de algoritmos sencillos.",
    grammarTrap: "Uso inadecuado de preposiciones temporales en planeación de sprints (ej. 'on Monday' o 'by Friday' en vez de usar incorrectamente '*in Monday' o '*to Friday')."
  },
  {
    level: 5,
    code: "B1.1",
    title: "Software Development Lifecycle",
    status: "activo",
    mcer: "B1",
    toefl: "460 - 489 pts",
    techFocus: "Fases de planeación, análisis de requerimientos, diseño lógico, pruebas de QA, despliegue continuo y mantenimiento ágil.",
    grammarTrap: "Omitir el sujeto impersonal 'It' al reportar errores del sistema (ej. '*Is necessary to run tests' en lugar del correcto 'It is necessary to run tests')."
  },
  {
    level: 6,
    code: "B1.2",
    title: "Cloud Architecture & Virtualization",
    status: "bloqueado",
    mcer: "B1",
    toefl: "490 - 519 pts",
    techFocus: "Aprovisionamiento en la nube (GCP, AWS), contenedores Docker, Kubernetes, escalabilidad horizontal y balanceo de carga.",
    grammarTrap: "Uso de verbos reflexivos inexistentes al describir procesos de escalabilidad automática (ej. '*the system scales itself' frente a 'the system scales')."
  },
  {
    level: 7,
    code: "B1.3",
    title: "Cybersecurity & Cryptography",
    status: "bloqueado",
    mcer: "B1",
    toefl: "520 - 530 pts",
    techFocus: "Algoritmos de cifrado simétrico/asimétrico, inyecciones de código SQL, firewalls perimetrales, tokens JWT y autenticación OAuth.",
    grammarTrap: "Concordancia de voz pasiva para describir brechas e incidentes de seguridad (ej. 'the logs were modified' versus el uso ambiguo '*the logs modified')."
  },
  {
    level: 8,
    code: "B1.4",
    title: "Agile Project Management",
    status: "bloqueado",
    mcer: "B1",
    toefl: "531 - 542 pts",
    techFocus: "Backlog refinement, estimación por puntos de historia, retrospectivas de sprint, KPIs de velocidad y reportes de burndown.",
    grammarTrap: "Incorrecta subordinación al dar órdenes refinadas (ej. 'The PM requested that we implement' en lugar del erróneo '*The PM requested us to implement')."
  },
  {
    level: 9,
    code: "B2.1",
    title: "Artificial Intelligence & ML",
    status: "bloqueado",
    mcer: "B2",
    toefl: "543 - 569 pts",
    techFocus: "Modelos neuronales, algoritmos de entrenamiento supervisado, redes de difusión, ajuste de hiperparámetros y optimización de tokens.",
    grammarTrap: "Sustantivación errónea de verbos técnicos durante la redacción de papers (ej. usar '*optimizating' en lugar del sustantivo formal 'optimization')."
  },
  {
    level: 10,
    code: "B2.2",
    title: "Distributed Systems Resiliency",
    status: "bloqueado",
    mcer: "B2",
    toefl: "570 - 599 pts",
    techFocus: "Mapeo de fallas en cascada, tolerancias a fallos, patrones Circuit Breaker, colas de mensajería (RabbitMQ) y concurrencia.",
    grammarTrap: "Uso del infinitivo de propósito en la descripción de patrones de diseño (ej. 'designed to prevent' en lugar del hispanismo '*designed for prevent')."
  },
  {
    level: 11,
    code: "B2.3",
    title: "DevOps Pipelines & Infrastructure",
    status: "bloqueado",
    mcer: "B2",
    toefl: "600 - 626 pts",
    techFocus: "Estructuras Terraform para IaC, scripts Bash robustos, pipelines de CI/CD automatizados, monitoreo de Grafana y telemetría de red.",
    grammarTrap: "Incorrecta concordancia de sujeto-verbo en logs condicionales automatizados (ej. 'Each of the nodes is active' frente al común '*Each of the nodes are active')."
  },
  {
    level: 12,
    code: "B2.4",
    title: "Engineering Thesis & Defense",
    status: "bloqueado",
    mcer: "B2",
    toefl: "627 - 677 pts",
    techFocus: "Presentación formal de proyectos de residencia profesional, redacción de reportes científicos indexados y defensa técnica ante jurados.",
    grammarTrap: "Uso incorrecto del subjuntivo en propuestas técnicas de investigación formal (ej. 'We recommend that the protocol be updated' en lugar del erróneo '*is updated')."
  }
];

export default function TOEFLSimulator({ onBack, onLogTOEFLScore }: Props) {
  // Current active main tab
  const [activeTab, setActiveTab] = useState<"mcer" | "simulators" | "guias">("mcer");

  // Subsections inside "simulators" tab
  const [activeSimSubView, setActiveSimSubView] = useState<"list" | "section_select" | "quiz" | "writing_workspace">("list");
  const [selectedSimType, setSelectedSimType] = useState<string>("ITP_COMPLETE");
  
  // Section index in Image 3 selection
  const [activeQuizSection, setActiveQuizSection] = useState<"listening" | "structure" | "reading">("listening");

  // Interactive Level Explorer State (Image 1)
  const [showRoadmapEngine, setShowRoadmapEngine] = useState(false);
  const [selectedRoadmapLevel, setSelectedRoadmapLevel] = useState(ROADMAP_LEVELS[1]); // Level 2 defaults

  // Main global score states
  const [toeflScore, setToeflScore] = useState(515);
  const [mcerLevel, setMcerLevel] = useState("B1");
  const [listeningScore, setListeningScore] = useState(82);
  const [structureScore, setStructureScore] = useState(74);
  const [readingScore, setReadingScore] = useState(88);
  const [writingScoreState, setWritingScoreState] = useState(72);
  
  // Custom states
  const [customName, setCustomName] = useState("Alonso Martínez");
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);

  // Active Writing simulator states
  const [activePrompt, setActivePrompt] = useState(TOEFL_PROMPTS[0]);
  const [submissionText, setSubmissionText] = useState("");
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingResult, setWritingResult] = useState<TOEFLResult | null>(null);

  // QUIZ ENGINE STATES
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [quizTimer, setQuizTimer] = useState(600); // 10 minutes in seconds

  React.useEffect(() => {
    if (activeSimSubView !== "quiz" || quizFinished) return;
    const interval = setInterval(() => {
      setQuizTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSimSubView, quizFinished]);

  // 5 deterministic question sets
  const listeningQuizQuestions = [
    {
      question: "What is the primary cause of the CPU saturation mentioned by the engineers in the log?",
      options: [
        "A hardware motherboard failure in the primary rack",
        "Complex SQL JOIN queries executing without proper database indices",
        "An automated backup script deleting index files during production hours",
        "Excessive websocket client connections on port 3000"
      ],
      correctIndex: 1,
      explanation: "The engineers discussed CPU saturation caused specifically by massive, unindexed JOIN queries traversing production records entirely, resulting in slow execution times."
    },
    {
      question: "Which database solution is recommended immediately to mitigate the query latency?",
      options: [
        "Re-indexing the active tables and writing a compound index matching the JOIN conditions",
        "Migrating the entire production relational schema over to Firestore cloud collections",
        "Terminating the server process in the terminal without warning",
        "Modifying package.json scripts to bypass Vite's HMR websocket"
      ],
      correctIndex: 0,
      explanation: "Applying a targeted compound index directly matching the database filter and join columns prevents a full-table scan, restoring nominal CPU limits."
    },
    {
      question: "How did the DevOps team detect the sudden database query latency spike?",
      options: [
        "From an automated alert triggered via Prometheus metric logs",
        "A notification from the support desk receiving customer complaints",
        "A linting error displaying during compilation of the Applet",
        "A custom system credit warning in the browser margin"
      ],
      correctIndex: 0,
      explanation: "Distributed tracking platforms (like Prometheus and Grafana) capture query runtimes and trigger server-side warnings when metrics cross latency bounds."
    },
    {
      question: "In technical databases, what is the term used to describe a query searching every single row?",
      options: [
        "Full Table Scan",
        "Linear Array Traversal",
        "Direct Index Mapping",
        "Database Column Clustering"
      ],
      correctIndex: 0,
      explanation: "A 'Full Table Scan' occurs when the database engine is forced to scan every record because no index was declared to isolate matching keys directly."
    },
    {
      question: "What is the engineering team's long-term policy to prevent this specific recurrence?",
      options: [
        "Enforcing strict automated query optimization reviews prior to merging pull requests",
        "Completely removing JOIN queries from the server backend architecture",
        "Restarting the dev containers every 24 hours to clear active memory leaks",
        "Instructing administrators to run manual queries only outside business hours"
      ],
      correctIndex: 0,
      explanation: "Automated verification pipelines and structural peer reviews ensure optimized execution paths are audited before database schemas migrate to production."
    }
  ];

  const structureQuizQuestions = [
    {
      question: "If our development team ______ the microservices earlier, we would not have experienced this cascading failure last night.",
      options: [
        "migrated",
        "had migrated",
        "has migrated",
        "would migrate"
      ],
      correctIndex: 1,
      explanation: "This is a third conditional sentence referring to an unreal past event and its past result. The 'if' clause requires the past perfect form ('had migrated') to express this past counterfactual condition."
    },
    {
      question: "Select the sentence that is grammatically correct and appropriate for a technical engineering report:",
      options: [
        "The cloud architecture scales automatically when load increases, which prevents server crashes.",
        "Scaling automatically when load increases, server crashes are prevented by the cloud architecture.",
        "The cloud architecture scales itself automatic to prevent server crash.",
        "Automatically scaling when load increase, the server will not crash because of the architecture."
      ],
      correctIndex: 0,
      explanation: "The first sentence has clear modifier placement and subject-verb agreement. In the second, 'server crashes' is a dangling modifier because server crashes themselves don't scale automatically."
    },
    {
      question: "The lead systems engineer requested that the production container _______ restarted immediately to clear the memory leaks.",
      options: [
        "be",
        "is",
        "was",
        "being"
      ],
      correctIndex: 0,
      explanation: "This is a subjunctive mood sentence triggered by the verb 'request' followed by a 'that' clause. The subjunctive uses the bare base form of the verb, which is 'be'."
    },
    {
      question: "Identify the grammatically incorrect section of the sentence: 'The database administrator [A], along with three senior software architects [B], are [C] reviewing the deployment logs for anomalies [D].'",
      options: [
        "[A] (The database administrator)",
        "[B] (along with three senior software architects)",
        "[C] (are)",
        "[D] (for anomalies)"
      ],
      correctIndex: 2,
      explanation: "The singular subject is 'The database administrator'. The intervening phrase 'along with...' does not change the number of the subject. Therefore, the verb must be singular: 'is reviewing' instead of 'are reviewing'."
    },
    {
      question: "Choose the correct transitional connector: 'The microservice migration was completed ahead of schedule; _______, the system throughput increased by 40%.'",
      options: [
        "consequently",
        "whereas",
        "nevertheless",
        "on the contrary"
      ],
      correctIndex: 0,
      explanation: "'Consequently' indicates a logical result or effect of the preceding independent clause, matching the context of performance improvement."
    }
  ];

  const readingQuizQuestions = [
    {
      question: "What is the primary purpose of implementing the 'Circuit Breaker' pattern in distributed systems?",
      options: [
        "To prevent cascading failures from collapsing the entire network infrastructure",
        "To physically disconnect server racks during planned maintenance cycles",
        "To double the parsing throughput of incoming JSON payloads",
        "To compile Node.js scripts into CommonJS server bundles automatically"
      ],
      correctIndex: 0,
      explanation: "The article explains that the Circuit Breaker pattern temporarily stops executing requests to failing downstream resources, preventing cascade crashes and preserving global system resilience."
    },
    {
      question: "The word 'transient' in the reading passage is closest in meaning to:",
      options: [
        "Temporary",
        "Severe",
        "Permanent",
        "Unpredictable"
      ],
      correctIndex: 0,
      explanation: "'Transient' refers to an issue or latency that is short-lived or temporary, occurring briefly before returning to normal operations."
    },
    {
      question: "According to the text, what does a system do when the Circuit Breaker is active?",
      options: [
        "It temporarily halts requests to the failing service and serves predefined fallback data",
        "It automatically purges database records to free CPU cores",
        "It triggers a linter script in the local development repository",
        "It switches the application interface to a terminal layout"
      ],
      correctIndex: 0,
      explanation: "The text states that the pattern 'temporarily stops executing requests to a failing resource, allowing it to recover while immediately serving predefined fallback payloads to the user'."
    },
    {
      question: "What underlying condition can trigger a cascading failure across microservices?",
      options: [
        "Transient latency in a downstream database dependency",
        "Editing variables in a global CSS configuration file",
        "Opening the development browser in a mobile viewport resolution",
        "Adding a security certificate inside the blockchain verification modal"
      ],
      correctIndex: 0,
      explanation: "The passage notes: 'When a downstream database dependency encounters transient latency, cascading failures can rapidly propagate across upstream services.'"
    },
    {
      question: "What is the ultimate outcome of high resiliency as described in the technical article?",
      options: [
        "Localized outages do not compromise the integrity of the entire digital infrastructure",
        "Developers are completely relieved from having to write automated unit tests",
        "SQL indices are created dynamically by the database query coordinator",
        "The web application automatically updates its own styling and layout files"
      ],
      correctIndex: 0,
      explanation: "The article states: 'Consequently, system resiliency is maintained, and individual localized outages do not bring down the entire digital infrastructure.'"
    }
  ];

  const getActiveQuizQuestions = () => {
    if (activeQuizSection === "listening") return listeningQuizQuestions;
    if (activeQuizSection === "structure") return structureQuizQuestions;
    return readingQuizQuestions;
  };

  const handleSelectQuizAnswer = (optionIdx: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizQuestionIndex] = optionIdx;
    setQuizAnswers(newAnswers);
  };

  const handleQuizNext = () => {
    const questions = getActiveQuizQuestions();
    if (currentQuizQuestionIndex < questions.length - 1) {
      setCurrentQuizQuestionIndex(currentQuizQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      // Calculate grade and log
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (quizAnswers[idx] === q.correctIndex) correctCount++;
      });
      
      // Update score visually
      const pct = (correctCount / questions.length) * 100;
      if (activeQuizSection === "listening") {
        setListeningScore(Math.round(pct));
      } else if (activeQuizSection === "structure") {
        setStructureScore(Math.round(pct));
      } else {
        setReadingScore(Math.round(pct));
      }

      // Re-calculate estimated TOEFL score
      const totalPct = (listeningScore + structureScore + readingScore + writingScoreState) / 4;
      const computedTOEFL = Math.min(677, 310 + Math.round((totalPct / 100) * 367));
      setToeflScore(computedTOEFL);
      setMcerLevel(computedTOEFL >= 543 ? "B2" : "B1");

      // Log to parent app
      onLogTOEFLScore(Math.round((correctCount / questions.length) * 30), `Simulador ${activeQuizSection.toUpperCase()}`);
    }
  };

  const handleQuizReset = () => {
    setCurrentQuizQuestionIndex(0);
    setQuizAnswers([]);
    setQuizFinished(false);
    setQuizTimer(600);
  };

  // Profile Analysis Scanner simulation
  const handleAnalyzeProfile = () => {
    setIsAnalyzingProfile(true);
    setDiagnosticLogs(["INICIALIZANDO MOTOR DE CÓMPUTO IA COMPLIANT...", "CONECTANDO CON EL LAB CONVERSACIONAL..."]);
    
    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "OBTENIENDO HISTORIAL DE PRÁCTICA CON LITTLE TEC..."]);
    }, 600);
    
    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "PROCESANDO FONEMAS Y ACENTO AMERICANO (AUDIO END)..."]);
    }, 1200);
    
    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "EVALUANDO LOGS DEL GRAMMAR LAB..."]);
    }, 1800);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "CALIBRANDO EQUIVALENCIAS BAJO ESTÁNDAR MCER/TecNM..."]);
    }, 2400);

    setTimeout(() => {
      const addedScore = Math.floor(Math.random() * 20) + 15;
      const newScore = Math.min(677, toeflScore + addedScore);
      const newMcer = newScore >= 543 ? "B2" : "B1";
      const newListening = Math.min(99, listeningScore + Math.floor(Math.random() * 5) + 2);
      const newStructure = Math.min(99, structureScore + Math.floor(Math.random() * 7) + 3);
      const newReading = Math.min(99, readingScore + Math.floor(Math.random() * 4) + 2);
      
      setToeflScore(newScore);
      setMcerLevel(newMcer);
      setListeningScore(newListening);
      setStructureScore(newStructure);
      setReadingScore(newReading);
      
      setDiagnosticLogs(prev => [...prev, `¡CÓMPUTO COMPLETADO! Nuevo Score TOEFL Est.: ${newScore} (${newMcer}).`]);
      setIsAnalyzingProfile(false);
    }, 3200);
  };

  const handleGrade = async () => {
    if (!submissionText.trim()) return;
    setWritingLoading(true);
    setWritingResult(null);

    try {
      const response = await fetch("/api/gemini/toefl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activePrompt.section,
          prompt: activePrompt.desc,
          submission: submissionText
        })
      });
      if (!response.ok) throw new Error("Grading service unavailable");
      const data = await response.json();
      setWritingResult(data);
      
      // Update writing score internally
      const newWritingPct = Math.round((data.score / 30) * 100);
      setWritingScoreState(newWritingPct);

      // Update diagnostic score based on graded essay
      const gradeScoreToToefl = Math.min(677, 330 + Math.round(data.score * 11.5));
      setToeflScore(gradeScoreToToefl);
      if (gradeScoreToToefl >= 543) setMcerLevel("B2");

      onLogTOEFLScore(data.score, activePrompt.title.split(" ")[1]);
    } catch (err) {
      console.error(err);
    } finally {
      setWritingLoading(false);
    }
  };

  const triggerCertificatePrint = () => {
    window.print();
  };

  return (
    <div id="TOEFLSimulator" className="apple-fade-in max-w-6xl mx-auto bg-[#09090b] rounded-3xl overflow-hidden shadow-2xl border border-zinc-900 p-6 md:p-8 text-white relative">
      
      {/* 1. MASTER HEADER WITH INSTITUTIONAL EMBLEMS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
            title="Volver al menú principal"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-lime-400 text-zinc-950">ALINEACIÓN SEP</span>
              <span className="text-[10px] font-mono text-zinc-500">TEC_COMPLIANT V3.4</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ruta de Certificación TOEFL & MCER</h2>
            <p className="text-xs text-zinc-400 leading-tight">Módulo oficial de cumplimiento académico para la validación de competencias, acreditación bilingüe y titulación institucional ante el TecNM.</p>
          </div>
        </div>

        {/* Institution Shield Indicator */}
        <div className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-3">
          <div className="w-9 h-9 rounded-xl bg-lime-950/40 border border-lime-500/25 flex items-center justify-center text-lime-400">
            <GraduationCap size={20} />
          </div>
          <div className="text-left">
            <span className="text-[8px] uppercase tracking-widest text-zinc-500 block font-black">Acreditación Oficial</span>
            <span className="text-[10px] font-extrabold text-white block uppercase tracking-tight">VÍA DE TITULACIÓN TECNM</span>
          </div>
        </div>
      </div>

      {/* 2. TAB MENU SWITCHER */}
      {!showRoadmapEngine && (
        <div className="flex border-b border-zinc-900 mb-8 scrollbar-hide overflow-x-auto">
          {[
            { id: "mcer", label: "Progreso y Estatus MCER" },
            { id: "simulators", label: "Simuladores de Examen ITP" },
            { id: "guias", label: "Guías y Requisitos TecNM" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === "simulators") {
                  setActiveSimSubView("list");
                }
              }}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-lime-400 text-lime-400 bg-lime-950/5 font-black" 
                  : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* =======================================================
          SCREEN 1: HOJA DE RUTA DE TITULACIÓN OFICIAL (IMAGE 1)
          ======================================================= */}
      {showRoadmapEngine ? (
        <div className="bg-[#09090b] rounded-3xl p-6 border border-zinc-900 animate-fadeIn">
          {/* Engine Header */}
          <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime-950 border border-lime-500/20 flex items-center justify-center text-lime-400">
                <Layers size={16} />
              </div>
              <div>
                <span className="text-[9px] font-mono font-black text-lime-400 tracking-widest block uppercase">ROUTING_ENGINE V2.6</span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">HOJA DE RUTA DE TITULACIÓN OFICIAL</h3>
              </div>
            </div>
            <button 
              onClick={() => setShowRoadmapEngine(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-zinc-800"
            >
              [VOLVER]
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-3xl">
            Haz clic en cualquiera de los 12 niveles obligatorios para calibrar los requerimientos bilingües de software e ingeniería que audita nuestro motor de IA.
          </p>

          {/* Grid of 12 Level Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {ROADMAP_LEVELS.map((lvl) => {
              const isSelected = selectedRoadmapLevel.level === lvl.level;
              return (
                <button
                  key={lvl.level}
                  onClick={() => setSelectedRoadmapLevel(lvl)}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                    isSelected 
                      ? "bg-lime-950/20 border-lime-500 shadow-lg shadow-lime-500/5 ring-2 ring-lime-500/20" 
                      : lvl.status === "completado"
                        ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        : lvl.status === "activo"
                          ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                          : "bg-zinc-950/40 border-zinc-900 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Top indicators */}
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">LVL</span>
                    {lvl.status === "completado" && (
                      <div className="w-4 h-4 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check size={10} />
                      </div>
                    )}
                    {lvl.status === "activo" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse border border-zinc-950" />
                    )}
                  </div>

                  {/* Number */}
                  <div className={`text-4xl font-black font-sans leading-none tracking-tight ${
                    isSelected ? "text-lime-400" : "text-white"
                  }`}>
                    {lvl.level}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Level Details Panel */}
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 rounded-full blur-3xl" />
            
            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                  Nivel {selectedRoadmapLevel.level}: DETALLES DEL NÚCLEO
                </h4>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded font-mono ${
                selectedRoadmapLevel.status === "completado"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                  : selectedRoadmapLevel.status === "activo"
                    ? "bg-amber-950 text-amber-400 border border-amber-500/20"
                    : "bg-zinc-900 text-zinc-500"
              }`}>
                {selectedRoadmapLevel.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Unidad Curricular</span>
                <p className="text-lg font-black text-white">{selectedRoadmapLevel.code} - {selectedRoadmapLevel.title}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Equivalente MCER</span>
                  <span className="text-lg font-black text-lime-400 block font-mono">{selectedRoadmapLevel.mcer}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Puntaje TOEFL Est.</span>
                  <span className="text-lg font-black text-white block font-mono">{selectedRoadmapLevel.toefl}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Enfoque de Ingeniería (Tech Focus)</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedRoadmapLevel.techFocus}</p>
              </div>

              {/* Grammar Trap Warn */}
              <div className="bg-amber-950/15 border border-amber-500/20 rounded-xl p-4 flex gap-3.5 items-start">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-mono">Trampa Gramatical Crítica (Auditoría IA)</h5>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedRoadmapLevel.grammarTrap}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* =======================================================
              MAIN TAB Content: PROGRESO Y ESTATUS MCER
              ======================================================= */}
          {activeTab === "mcer" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Welcome Hero Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Hero Card */}
                <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-950/50 border border-lime-500/20 text-lime-400 text-[10px] font-black tracking-wider uppercase mb-5">
                      <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" />
                      Suficiencia de Idioma Obligatoria
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase leading-none mb-4">
                      Tu camino al título <br />
                      <span className="text-lime-400 font-sans">inicia aquí</span>
                    </h3>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-6">
                      En <span className="text-white font-semibold">TecLingo</span> comprendemos que dominar el inglés va más allá de un pasatiempo: es la clave jurídica indispensable para tu egreso profesional. Sincronizamos tu desarrollo bilingüe de ingeniería con las mallas del Tecnológico Nacional de México.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-900">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Calibración MCER IA</h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Nuestra Inteligencia Artificial calibra tu nivel al estándar del Marco Común Europeo de Referencia (MCER B1/B2), garantizando un aprendizaje preciso y adaptativo en cada lección.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Alineación TecNM</h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Ofrecemos preparación integral para certificación TOEFL, perfectamente validada para cumplir con los requisitos obligatorios de titulación ante el TecNM.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Action Callout */}
                <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-lime-950/60 text-lime-400 border border-lime-500/30">
                        Simuladores Activos
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        TECNM COMPLIANT
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">
                      Exámenes de Ensayo TOEFL ITP
                    </h4>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Prueba tus competencias de Listening, Structure y Reading con reactivos técnicos calibrados y obtén reportes analíticos oficiales emitidos por Athena IA.
                    </p>
                  </div>
                  
                  <div className="pt-6">
                    <button 
                      onClick={() => {
                        setActiveTab("simulators");
                        setActiveSimSubView("list");
                      }}
                      className="w-full py-3.5 px-4 bg-lime-500 hover:bg-lime-400 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-500/10"
                    >
                      <span>Ir a Simuladores</span>
                      <span className="text-sm font-bold">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actionable level map banner */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-lime-950/40 border border-lime-500/20 rounded-lg">
                      <Compass size={16} className="text-lime-400" />
                    </div>
                    <h3 className="text-sm font-black text-white tracking-widest uppercase">
                      Ruta de Titulación IA [Roadmap]
                    </h3>
                  </div>
                  <span className="text-[8px] font-black tracking-widest uppercase bg-lime-500 text-zinc-950 px-2 py-0.5 rounded font-mono">
                    Interactive Engine
                  </span>
                </div>
                
                <p className="text-xs text-zinc-400 max-w-2xl mb-5 leading-relaxed">
                  Inicializa el motor bilingüe de TecLingo para mapear los 12 niveles obligatorios de suficiencia de idioma del TecNM alineados al MCER. Podrás estudiar objetivos específicos de ingeniería en software por nivel.
                </p>
                
                <button 
                  onClick={() => setShowRoadmapEngine(true)}
                  className="inline-flex items-center gap-2 py-3 px-6 bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/30 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                >
                  <span className="text-xs">▶</span> INICIALIZAR HOJA DE RUTA INTERACTIVA
                </button>
              </div>

              {/* Side by side diagnostic and certificate */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Nivel Diagnóstico Estimado */}
                <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                        <h3 className="text-sm font-black text-white tracking-widest uppercase">
                          Nivel Diagnóstico Estimado
                        </h3>
                      </div>
                      <span className="text-[8px] font-black tracking-widest uppercase bg-lime-950 text-lime-400 border border-lime-500/30 px-2 py-0.5 rounded font-mono">
                        Vigente
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      Basado en tu volumen de práctica conversacional, exámenes resueltos y el análisis fonético con Little Tec en el AI Pronunciation Lab.
                    </p>

                    {/* Stats Box */}
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center justify-around mb-6 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Puntaje TOEFL Est.</span>
                        <div className="text-3xl font-black text-white tracking-tight">
                          {toeflScore} <span className="text-xs font-normal text-zinc-500">/ 677 pts ITP</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-10 bg-zinc-850" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nivel MCER</span>
                        <div className="text-3xl font-black text-lime-400 tracking-tight flex items-center justify-center gap-1 font-mono">
                          {mcerLevel}
                        </div>
                        <span className="text-[8px] font-black bg-lime-950 text-lime-400 px-2 py-0.2 rounded uppercase">
                          {mcerLevel === "B2" ? "Avanzado" : "Intermedio"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4 mb-6">
                      {[
                        { label: "Listening Comprehension", value: listeningScore, mcer: listeningScore >= 80 ? "MCER B2" : "MCER B1" },
                        { label: "Structure & Written Expression", value: structureScore, mcer: structureScore >= 80 ? "MCER B2" : "MCER B1" },
                        { label: "Reading Comprehension", value: readingScore, mcer: readingScore >= 80 ? "MCER B2" : "MCER B1" },
                        { label: "Writing Skills", value: writingScoreState, mcer: writingScoreState >= 80 ? "MCER B2" : "MCER B1" }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                            <span className="uppercase tracking-wide">{bar.label}</span>
                            <span className="text-white">{bar.value}% <span className="text-lime-400 font-normal font-mono">({bar.mcer})</span></span>
                          </div>
                          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                            <div 
                              className="h-full bg-lime-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${bar.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostics triggers and log dashboard */}
                  <div>
                    <button 
                      onClick={handleAnalyzeProfile}
                      disabled={isAnalyzingProfile}
                      className={`w-full py-3 px-4 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isAnalyzingProfile
                          ? "bg-zinc-900 border-zinc-800 text-zinc-500"
                          : "bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border-lime-500/30 active:scale-95"
                      }`}
                    >
                      <Sparkles size={14} className={isAnalyzingProfile ? "animate-spin" : ""} />
                      {isAnalyzingProfile ? "Analizando perfil de egreso..." : "¿Quieres actualizar tu estatus? Analizar Perfil IA"}
                    </button>

                    {diagnosticLogs.length > 0 && (
                      <div className="mt-3 bg-[#070709] border border-zinc-900 rounded-xl p-3 font-mono text-[9px] text-zinc-500 max-h-24 overflow-y-auto space-y-1">
                        {diagnosticLogs.map((log, index) => (
                          <div key={index} className="flex gap-1.5 items-start">
                            <span className="text-lime-500 flex-shrink-0">›</span>
                            <span className={log.includes("COMPLETADO") || log.includes("CÓMPUTO") ? "text-lime-400 font-extrabold" : ""}>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Constancia Digital blockchain verified */}
                <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">Blockchain Verified ID</span>
                        <span className="text-[10px] font-bold text-lime-400 font-mono tracking-tight">TX-TOEFL-882X-B2</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-lime-950/60 border border-lime-500/30 flex items-center justify-center text-lime-400">
                        <Award size={18} />
                      </div>
                    </div>

                    {/* Visual certificate preview */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4 text-center relative overflow-hidden select-none hover:border-lime-500/30 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-full h-1 bg-lime-500/60" />
                      <span className="text-[8px] font-mono font-black text-zinc-500 tracking-widest block uppercase">TecLingo English Academy</span>
                      <span className="text-[6px] font-mono text-zinc-600 block mb-4 uppercase">Folio: TX882-B2</span>
                      
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">Constancia Oficial de Nivel</span>
                      
                      {/* Personalized dynamic input */}
                      <div className="my-2.5">
                        <input 
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="bg-transparent border-b border-zinc-800 focus:border-lime-500 focus:outline-none text-center text-lg font-black text-white tracking-wide font-sans w-full"
                          title="Haz clic para personalizar tu nombre"
                          placeholder="Introduce tu nombre"
                        />
                        <span className="text-[7px] text-zinc-500 font-sans block mt-1">(Haz clic arriba para editar nombre)</span>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans max-w-xs mx-auto mb-4">
                        Acreditó de forma sobresaliente el nivel <span className="text-lime-400 font-bold">{mcerLevel}</span> alineado al estándar de la Universidad de Cambridge.
                      </p>

                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-zinc-800/60 font-mono text-[7px] text-zinc-600">
                        <div className="text-left">
                          <span className="block">Sello Digital</span>
                          <span className="text-zinc-500 block">0x82f4...6681</span>
                        </div>
                        <div className="text-right">
                          <span className="block">Fecha de Emisión</span>
                          <span className="text-zinc-500 block">11/07/2026</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-500 leading-normal text-center mb-6">
                      Esta constancia digital cumple con el marco oficial y puede presentarse ante servicios escolares para revalidar créditos obligatorios.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <button 
                      onClick={() => setShowCertModal(true)}
                      className="w-full py-3.5 px-4 bg-lime-500 hover:bg-lime-400 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-lime-500/10"
                    >
                      <FileText size={14} />
                      Descargar Constancia Oficial (PDF)
                    </button>
                  </div>
                </div>
              </div>

              {/* Equivalencies Table */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-lime-950/40 border border-lime-500/20 rounded-lg">
                    <Award size={16} className="text-lime-400" />
                  </div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase">
                    Tabla de Equivalencias Oficiales
                  </h3>
                </div>
                
                <p className="text-xs text-zinc-400 max-w-2xl mb-6">
                  Comparativa de niveles bajo el estándar del Marco Común Europeo de Referencia (MCER) y los puntajes del examen internacional TOEFL ITP:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="pb-3 pr-4 font-black">Nivel MCER</th>
                        <th className="pb-3 px-4 font-black">Puntos TOEFL</th>
                        <th className="pb-3 pl-4 font-black text-right">Equivalencia SEP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 font-semibold">
                      {[
                        { level: "B2 (Avanzado)", score: "543 - 626 pts", sep: "CENNI Nivel 11-12", isHighlight: true, isThisLvl: mcerLevel === "B2" },
                        { level: "B1 (Intermedio)", score: "460 - 542 pts", sep: "CENNI Nivel 9-10", isActive: true, isThisLvl: mcerLevel === "B1" },
                        { level: "A2 (Básico Superior)", score: "337 - 459 pts", sep: "CENNI Nivel 5-8" },
                        { level: "A1 (Básico Inicial)", score: "120 - 336 pts", sep: "CENNI Nivel 1-4" }
                      ].map((row, idx) => (
                        <tr 
                          key={idx} 
                          className={`transition-colors ${
                            row.isThisLvl 
                              ? "text-lime-400 bg-lime-950/10 font-bold" 
                              : row.isHighlight 
                                ? "text-white hover:bg-zinc-900/40" 
                                : "text-zinc-400 hover:bg-zinc-900/40"
                          }`}
                        >
                          <td className="py-3.5 pr-4">
                            <span className={row.isThisLvl ? "text-lime-400 font-extrabold" : ""}>{row.level}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">{row.score}</td>
                          <td className="py-3.5 pl-4 text-right font-mono text-zinc-400">{row.sep}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              MAIN TAB Content: SIMULADORES DE EXAMEN ITP
              ======================================================= */}
          {activeTab === "simulators" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* SUBVIEW A: LIST OF EXAMS (IMAGE 2) */}
              {activeSimSubView === "list" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-lime-950/40 border border-lime-500/20 rounded-lg">
                        <BookOpen size={16} className="text-lime-400" />
                      </div>
                      <h3 className="text-sm font-black text-white tracking-widest uppercase">
                        PRUEBAS DIAGNÓSTICAS Y EXÁMENES TOEFL ITP
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-4xl leading-relaxed">
                      Nuestros simuladores replican fielmente la rúbrica internacional oficial de la prueba TOEFL ITP, calibrando tiempos, niveles de complejidad de textos y trampas gramaticales comunes de omisión de sujeto.
                    </p>
                  </div>

                  {/* 4 Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: COMPLETO */}
                    <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black tracking-widest uppercase bg-lime-500 text-zinc-950 px-2 py-0.5 rounded font-mono">
                            DISPONIBLE
                          </span>
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono">
                            <Clock size={12} />
                            <span>115 min</span>
                            <span>•</span>
                            <span>140 reactivos</span>
                          </div>
                        </div>
                        <h4 className="text-base font-extrabold text-white uppercase tracking-tight mb-2">SIMULADOR TOEFL ITP - COMPLETO</h4>
                        <p className="text-xs text-zinc-500 mb-6 font-medium">Simulador Certificado que reúne las tres competencias clásicas en una sola sesión de alta exigencia académica.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedSimType("ITP_COMPLETE");
                          setActiveSimSubView("section_select");
                        }}
                        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Arrancar</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Card 2: LISTENING */}
                    <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black tracking-widest uppercase bg-lime-950 text-lime-400 border border-lime-500/20 px-2 py-0.5 rounded font-mono">
                            RECOMENDADO
                          </span>
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono">
                            <Clock size={12} />
                            <span>35 min</span>
                            <span>•</span>
                            <span>50 reactivos</span>
                          </div>
                        </div>
                        <h4 className="text-base font-extrabold text-white uppercase tracking-tight mb-2">SECCIÓN 1: COMPRENSIÓN AUDITIVA (LISTENING)</h4>
                        <p className="text-xs text-zinc-500 mb-6 font-medium">Entrenamiento auditivo enfocado en diálogos casuales de campus y ponencias de ciencias de la computación.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedSimType("SECTION_LISTENING");
                          setActiveQuizSection("listening");
                          setActiveSimSubView("section_select");
                        }}
                        className="w-full py-2.5 bg-[#09090b] border border-zinc-850 hover:border-zinc-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Arrancar</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Card 3: STRUCTURE */}
                    <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black tracking-widest uppercase bg-lime-950/50 text-lime-400 border border-lime-500/10 px-2 py-0.5 rounded font-mono">
                            COMPLETADO
                          </span>
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono">
                            <Clock size={12} />
                            <span>25 min</span>
                            <span>•</span>
                            <span>40 reactivos</span>
                          </div>
                        </div>
                        <h4 className="text-base font-extrabold text-white uppercase tracking-tight mb-2">SECCIÓN 2: ESTRUCTURA Y EXPRESIÓN ESCRITA</h4>
                        <p className="text-xs text-zinc-500 mb-6 font-medium">Evaluación objetiva de gramática estructural, concordancias complejas, condicionales invertidas e identificación de errores.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedSimType("SECTION_STRUCTURE");
                          setActiveQuizSection("structure");
                          setActiveSimSubView("section_select");
                        }}
                        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Arrancar</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Card 4: READING */}
                    <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black tracking-widest uppercase bg-lime-500 text-zinc-950 px-2 py-0.5 rounded font-mono">
                            DISPONIBLE
                          </span>
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono">
                            <Clock size={12} />
                            <span>55 min</span>
                            <span>•</span>
                            <span>50 reactivos</span>
                          </div>
                        </div>
                        <h4 className="text-base font-extrabold text-white uppercase tracking-tight mb-2">SECCIÓN 3: COMPRENSIÓN LECTORA (READING)</h4>
                        <p className="text-xs text-zinc-500 mb-6 font-medium">Lectura de papers formales, artículos técnicos de arquitectura y documentación de ingeniería en inglés.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedSimType("SECTION_READING");
                          setActiveQuizSection("reading");
                          setActiveSimSubView("section_select");
                        }}
                        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Arrancar</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Redirection to Original Writing simulator */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-lime-950/40 border border-lime-500/20 rounded-xl text-lime-400">
                        <PenTool size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">¿Deseas practicar escritura libre académica?</h4>
                        <p className="text-xs text-zinc-400">Nuestro simulador de Writing iBT califica ensayos con Inteligencia Artificial y te otorga feedback en tiempo real.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setWritingResult(null);
                        setSubmissionText("");
                        setActiveSimSubView("writing_workspace");
                      }}
                      className="px-5 py-2.5 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      Abrir Writing Lab
                    </button>
                  </div>
                </div>
              )}

              {/* SUBVIEW B: CHOOSE SECTION SELECTOR (IMAGE 3) */}
              {activeSimSubView === "section_select" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Volver y Tag Bar */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <button 
                      onClick={() => setActiveSimSubView("list")}
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                    >
                      ← [VOLVER A LA LISTA DE SIMULADORES]
                    </button>
                    <span className="text-[9px] font-mono font-black text-lime-400 tracking-widest px-2.5 py-1 rounded bg-lime-950/40 border border-lime-500/25">
                      TEST_ENGINE_ACTIVE
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">TOEFL SIMULATOR CORE</span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">SELECCIONA UNA SECCIÓN DE EXAMEN</h3>
                    </div>
                    <span className="text-[9px] font-mono font-black bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full">
                      5 REACTIVOS CALIBRADOS POR SECCIÓN
                    </span>
                  </div>

                  {/* 3 Columns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Section 1: Listening */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-80 hover:border-zinc-800/80 transition-all">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-5">
                          <Volume2 size={20} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3">SECCIÓN 1: LISTENING COMPREHENSION (B2)</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          Escucha a dos ingenieros senior analizando la saturación de CPU debido a consultas JOIN sin índices en producción.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveQuizSection("listening");
                          handleQuizReset();
                          setActiveSimSubView("quiz");
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        ARRANCAR →
                      </button>
                    </div>

                    {/* Section 2: Structure */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-80 hover:border-zinc-800/80 transition-all">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-5">
                          <HelpCircle size={20} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3 font-sans">SECCIÓN 2: STRUCTURE & WRITTEN EXPRESSION (B2)</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Completa la sintaxis técnica de oraciones complejas y condicionales de nivel avanzado con alta precisión académica.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveQuizSection("structure");
                          handleQuizReset();
                          setActiveSimSubView("quiz");
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        ARRANCAR →
                      </button>
                    </div>

                    {/* Section 3: Reading */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-80 hover:border-zinc-800/80 transition-all">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-5">
                          <BookOpen size={20} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3">SECCIÓN 3: READING COMPREHENSION (B2)</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Analiza el artículo técnico sobre la transición y resiliencia en arquitecturas distribuidas y responde 5 preguntas de opción múltiple.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveQuizSection("reading");
                          handleQuizReset();
                          setActiveSimSubView("quiz");
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        ARRANCAR →
                      </button>
                    </div>
                  </div>

                  {/* Footnote Warning Box */}
                  <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-4 flex gap-3.5 items-start mt-6 text-zinc-500 font-sans">
                    <Info size={16} className="text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[11px] leading-relaxed">
                      Cada micro-simulacro contiene un set de 5 reactivos técnicos de opción múltiple deterministas. Al terminar, la auditora académica Athena IA generará tu reporte final con desgloses específicos de conceptos y fórmulas gramaticales.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBVIEW C: RUNNING QUIZ SYSTEM */}
              {activeSimSubView === "quiz" && (
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6 md:p-8 animate-fadeIn space-y-6">
                  
                  {/* Quiz header */}
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 font-mono">
                        {activeQuizSection === "listening" 
                          ? "SECCIÓN 1: LISTENING COMPREHENSION (B2)" 
                          : activeQuizSection === "structure" 
                            ? "SECCIÓN 2: STRUCTURE & WRITTEN EXPRESSION (B2)" 
                            : "SECCIÓN 3: READING COMPREHENSION (B2)"}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-500/10">
                        <Clock size={11} className="animate-pulse text-red-400" />
                        {Math.floor(quizTimer / 60)}:{(quizTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">
                      Pregunta {currentQuizQuestionIndex + 1} de 5
                    </span>
                  </div>

                  {!quizFinished ? (
                    <div className="space-y-6">
                      
                      {/* Active section context graphics / players */}
                      {activeQuizSection === "listening" && (
                        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 justify-between">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => {
                                setAudioPlaying(!audioPlaying);
                                if (!audioPlaying) {
                                  setTimeout(() => setAudioPlaying(false), 8000);
                                }
                              }}
                              className={`px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                audioPlaying 
                                  ? "bg-lime-500 text-zinc-950 animate-pulse scale-105" 
                                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
                              }`}
                            >
                              <Play size={14} className={audioPlaying ? "fill-zinc-950" : "fill-white"} />
                              <span>{audioPlaying ? "REPRODUCIENDO..." : "ESCUCHAR"}</span>
                            </button>
                            <div>
                              <span className="text-[9px] font-mono text-lime-400 block tracking-widest uppercase font-black">TOEFL DICTATION AUDIO STREAM</span>
                              <h5 className="text-xs font-black text-zinc-100 uppercase tracking-tight mt-0.5">Diálogo: CPU Latency Spike Analysis</h5>
                              <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Elena (DevOps) & Alonso (DB Admin) analizan consultas lentas.</p>
                            </div>
                          </div>
                          
                          {/* Audio transcript snippet */}
                          <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl max-w-md w-full">
                            <span className="text-[8px] font-mono text-zinc-600 block uppercase mb-1 font-black">Transcripción Oficial (Soporte Visual)</span>
                            <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                              Elena: 'Alonso, database metrics report our CPU at 99%. Did we push the migrations?' ... Alonso: 'We did, but we forgot to index the JOIN parameters.'
                            </p>
                          </div>
                        </div>
                      )}

                      {activeQuizSection === "structure" && (
                        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-850 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                              <HelpCircle size={22} />
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-indigo-400 block tracking-widest uppercase font-black">GRAMMAR STRUCTURE ENGINE</span>
                              <h5 className="text-xs font-black text-zinc-100 uppercase tracking-tight mt-0.5">Evaluación de Sintaxis y Expresión Escrita</h5>
                              <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug font-medium">Análisis objetivo de sujeto, verbo, concordancias y condicionales invertidos.</p>
                            </div>
                          </div>
                          
                          {/* Structural helper block */}
                          <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl max-w-md w-full text-[10px] text-zinc-400 leading-relaxed">
                            <span className="text-[8px] font-mono text-zinc-600 block uppercase mb-1 font-black">Guía de la Sección (Soporte Sintáctico)</span>
                            Identifica el segmento o palabra que complete gramaticalmente la oración técnica. Presta especial atención a la omisión del pronombre de sujeto impersonal o neutro.
                          </div>
                        </div>
                      )}

                      {activeQuizSection === "reading" && (
                        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                            <BookOpen size={14} className="text-lime-400" />
                            <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">TEXTO ACADÉMICO: THE RISE AND RESILIENCE OF DISTRIBUTED CLOUD SYSTEMS</h5>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                            <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                              "In highly distributed systems, microservice architectures require strict self-healing mechanisms to ensure continuous availability. When a downstream database dependency encounters transient latency, cascading failures can rapidly propagate across upstream services. To avoid a catastrophic network collapse, systems engineers implement the Circuit Breaker pattern. This pattern temporarily stops executing requests to a failing resource, allowing it to recover while immediately serving predefined fallback payloads to the user. Consequently, system resiliency is maintained, and individual localized outages do not bring down the entire digital infrastructure."
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Question Container */}
                      <div className="bg-[#0b0c0e] border border-zinc-900 rounded-2xl p-6">
                        <h4 className="text-sm font-extrabold text-white leading-relaxed mb-5">
                          {getActiveQuizQuestions()[currentQuizQuestionIndex].question}
                        </h4>

                        {/* Options */}
                        <div className="space-y-2.5">
                          {getActiveQuizQuestions()[currentQuizQuestionIndex].options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[currentQuizQuestionIndex] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectQuizAnswer(oIdx)}
                                className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex justify-between items-center cursor-pointer ${
                                  isSelected 
                                    ? "bg-indigo-950/40 border-indigo-500 text-white font-black" 
                                    : "bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }`}
                              >
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-indigo-400 bg-indigo-500 text-white" : "border-zinc-800"
                                }`}>
                                  {isSelected && <Check size={10} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex justify-between items-center pt-4">
                        <button 
                          onClick={() => {
                            if (confirm("¿Estás seguro de que quieres abandonar este simulacro?")) {
                              setActiveSimSubView("section_select");
                            }
                          }}
                          className="px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs uppercase tracking-wider font-bold"
                        >
                          Abandonar Simulacro
                        </button>
                        <button
                          onClick={handleQuizNext}
                          disabled={quizAnswers[currentQuizQuestionIndex] === undefined}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{currentQuizQuestionIndex === 4 ? "Finalizar y Evaluar" : "Siguiente Pregunta"}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ATHENA IA REPORT VIEW */
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Score Badge */}
                      {(() => {
                        const questions = getActiveQuizQuestions();
                        let correctCount = 0;
                        questions.forEach((q, idx) => {
                          if (quizAnswers[idx] === q.correctIndex) correctCount++;
                        });
                        const computedQuizScore = Math.round((correctCount / questions.length) * 30);
                        return (
                          <div className="bg-gradient-to-r from-indigo-950/40 to-[#09090b] rounded-3xl p-6 border border-zinc-850 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-wider uppercase mb-3">
                                <Sparkles size={12} />
                                reporte académico de athena ia
                              </div>
                              <h4 className="text-2xl font-black text-white uppercase tracking-tight">Evaluación Completada</h4>
                              <p className="text-xs text-zinc-400 leading-relaxed mt-1 max-w-md">
                                Excelente práctica. Las respuestas han sido validadas contra la clave determinista oficial para brindarte retroalimentación inmediata.
                              </p>
                            </div>

                            <div className="text-center bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl min-w-44">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">PUNTOS TOEFL ITP EST.</span>
                              <div className="text-4xl font-black text-lime-400 tracking-tight font-mono mt-1">
                                {computedQuizScore} <span className="text-xs font-normal text-zinc-500">/ 30 pts</span>
                              </div>
                              <span className="text-[8px] font-black px-2.5 py-0.5 rounded uppercase bg-indigo-950 text-indigo-400 font-mono inline-block mt-2">
                                {computedQuizScore >= 24 ? "MCER B2 (Avanzado)" : "MCER B1 (Intermedio)"}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Question Breakdown Checklist */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">Desglose de Reactivos Evaluados</h5>
                        <div className="space-y-3">
                          {getActiveQuizQuestions().map((q, idx) => {
                            const isCorrect = quizAnswers[idx] === q.correctIndex;
                            return (
                              <div 
                                key={idx} 
                                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                                  isCorrect 
                                    ? "bg-emerald-950/15 border-emerald-500/20 text-zinc-100" 
                                    : "bg-red-950/15 border-red-500/20 text-zinc-100"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-3 mb-2">
                                  <h6 className="font-bold text-[13px]">{idx + 1}. {q.question}</h6>
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded font-mono flex-shrink-0 ${
                                    isCorrect ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                                  }`}>
                                    {isCorrect ? "✓ CORRECTO" : "✗ INCORRECTO"}
                                  </span>
                                </div>
                                <div className="space-y-1 text-zinc-400 text-xs">
                                  <p>Tu respuesta: <span className={isCorrect ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>{q.options[quizAnswers[idx]]}</span></p>
                                  {!isCorrect && <p className="text-zinc-500">Respuesta correcta: <span className="text-emerald-400 font-semibold">{q.options[q.correctIndex]}</span></p>}
                                  <div className="mt-2 text-zinc-500 italic bg-zinc-950/40 p-2.5 rounded border border-zinc-900 text-[11px] leading-relaxed">
                                    <span className="text-zinc-400 font-bold font-mono uppercase not-italic block mb-0.5">Grammar & Concept Guide:</span>
                                    {q.explanation}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Diagnostic recommendation block */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
                        <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">CONSEJO DE BOOSTER ACADÉMICO</h5>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          Sigue acumulando práctica bilingüe conversando con Little Tec y participando en los módulos del Roadmap interactivo. Cada simulador retroalimentado suma puntos estimados a tu perfil de egreso.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900">
                        <button 
                          onClick={handleQuizReset}
                          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-zinc-800"
                        >
                          Volver a Intentar
                        </button>
                        <button 
                          onClick={() => setActiveSimSubView("section_select")}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Volver a Secciones
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW D: ORIGINAL WRITING SIMULATOR WORKSPACE */}
              {activeSimSubView === "writing_workspace" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
                  {/* Left Side: Prompts selector & guidelines */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <button 
                      onClick={() => setActiveSimSubView("list")}
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-left inline-flex items-center gap-2 max-w-fit"
                    >
                      ← Volver a Simuladores
                    </button>

                    <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-900 flex flex-col items-center justify-center text-center">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWG8AE4uZY286OUl9yOBa2yBbCn0t_EdWxuW0bF5Xs1C2NvfKw7Kn5re2eIZ43uQpS07GJjjqOe6hDdPA86_WNBbeGYr9Eg7YHmLct5WHkXKNKhkSN2tcWwsJS1z3PAu351nAI2_ni-WFogqHwhP9qItg1pZRUypbAfr77jYeoF1-aj_zrcNxVhjpgYEqq55euf2L2gbTEjoMxHegUovgdPzVMpt8ssVVQUvxY0tUoGntXKqiLRGPBnaDE6qIN5_fFB-uIa07Z-sA" 
                        alt="TOEFL Simulator Tablet" 
                        className="w-36 h-36 object-contain mb-4 filter drop-shadow-md hover:scale-105 transition-transform"
                      />
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Evalúa tus respuestas de producción escrita con rúbricas oficiales del TOEFL iBT (escala 0-30). Obtén retroalimentación de gramática, léxico y un ensayo ejemplar de muestra.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Simulación de Tarea</label>
                      <div className="space-y-2">
                        {TOEFL_PROMPTS.map((pr) => (
                          <button
                            key={pr.id}
                            onClick={() => {
                              setActivePrompt(pr);
                              setWritingResult(null);
                              setSubmissionText("");
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                              activePrompt.id === pr.id
                                ? "bg-lime-950/20 border-lime-500 text-white"
                                : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900"
                            }`}
                          >
                            <span className="font-bold text-xs">{pr.title}</span>
                            <span className="text-[10px] opacity-80 leading-snug truncate">{pr.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guidelines info */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-[11px] text-zinc-400 space-y-1.5">
                      <span className="font-bold text-white uppercase flex items-center gap-1">
                        <Info size={12} className="text-lime-400" />
                        Tip TOEFL iBT:
                      </span>
                      <p>1. Escribe al menos 150-220 palabras para obtener suficiente profundidad argumentativa.</p>
                      <p>2. Estructura tu respuesta con Introducción, 2 Párrafos de Desarrollo y Conclusión.</p>
                      <p>3. Utiliza conectores lógicos de transición (Furthermore, However, Consequently).</p>
                    </div>
                  </div>

                  {/* Right Side: Workspace & Grading report */}
                  <div className="lg:col-span-8 flex flex-col justify-between">
                    {/* Active Prompt Question Banner */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <PenTool size={14} className="text-lime-400" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Essay Prompt Description</span>
                      </div>
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed bg-zinc-900 p-3 rounded-xl border border-zinc-800/40 font-sans">
                        {activePrompt.desc}
                      </p>
                    </div>

                    {/* Submission Input text area */}
                    {!writingResult && !writingLoading && (
                      <div className="space-y-4">
                        <div className="relative">
                          <textarea
                            rows={10}
                            placeholder="Comienza a redactar tu ensayo en inglés aquí..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            className="w-full p-4 rounded-2xl border border-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-lime-500 font-mono leading-relaxed bg-zinc-950 text-white"
                          />
                          <span className="absolute bottom-3 right-4 text-[10px] font-bold text-zinc-500 font-mono">
                            Palabras: {submissionText.trim() === "" ? 0 : submissionText.trim().split(/\s+/).length}
                          </span>
                        </div>
                        <button
                          onClick={handleGrade}
                          disabled={!submissionText.trim()}
                          className="w-full py-3.5 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors shadow disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles size={14} /> Evaluar Ensayo y Obtener Score
                        </button>
                      </div>
                    )}

                    {writingLoading && (
                      <div className="flex flex-col items-center justify-center h-96 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-lime-400 mb-4"></div>
                        <p className="text-sm font-semibold text-white font-sans">Analizando estructuras gramaticales y vocabulario TOEFL...</p>
                        <p className="text-xs text-zinc-500 mt-1">Computando score en base a los criterios de ETS (0-30)...</p>
                      </div>
                    )}

                    {/* Real TOEFL Score report dashboard */}
                    {writingResult && (
                      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                        {/* Score header badge */}
                        <div className="bg-gradient-to-r from-zinc-900 to-black rounded-2xl p-6 text-white flex items-center justify-between border border-zinc-800 shadow-md">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Official Simulated Score</span>
                            <h4 className="text-3xl font-extrabold mt-1 text-lime-400">{writingResult.score} <span className="text-lg font-normal text-zinc-500">/ 30</span></h4>
                            <p className="text-xs text-zinc-400 mt-1 font-mono">Section: {activePrompt.title}</p>
                          </div>
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-lime-950/40 border border-lime-500/25">
                            <Award size={36} className="text-lime-400 animate-pulse" />
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
                            <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths (Fortalezas)</h5>
                            <ul className="space-y-1.5">
                              {writingResult.strengths.map((str, i) => (
                                <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed font-sans">
                                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
                            <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Areas for Improvement</h5>
                            <ul className="space-y-1.5">
                              {writingResult.weaknesses.map((wk, i) => (
                                <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed font-sans">
                                  <Flame size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{wk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Technical Evaluations */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-sm space-y-4">
                          <div>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Grammar & Syntactic Complexity</h5>
                            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed bg-zinc-900 p-3 rounded-xl border border-zinc-800/40 font-sans">
                              {writingResult.grammarEvaluation}
                            </p>
                          </div>

                          <div>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Lexical Resource & Vocabulary Range</h5>
                            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed bg-zinc-900 p-3 rounded-xl border border-zinc-800/40 font-sans">
                              {writingResult.vocabularyEvaluation}
                            </p>
                          </div>
                        </div>

                        {/* Exemplar perfect response (Score 30) */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Star size={14} className="text-lime-400 fill-lime-400" />
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Exemplar perfect Response (Score 30)</h5>
                          </div>
                          <div className="text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-900 p-4 rounded-xl border border-zinc-800/40">
                            {writingResult.exemplarResponse.split('\n').map((line, i) => (
                              <p key={i} className="mb-2">{line}</p>
                            ))}
                          </div>
                        </div>

                        {/* Tips for action plan */}
                        <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-4">
                          <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">Score Booster Checklist</h5>
                          <ul className="space-y-1.5">
                            {writingResult.tipsToImprove.map((tip, i) => (
                              <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed font-sans">
                                <Compass size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action bar bottom */}
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => {
                              setWritingResult(null);
                              setSubmissionText("");
                            }}
                            className="px-5 py-2.5 bg-lime-500 text-zinc-950 font-black text-xs rounded-xl hover:bg-lime-400 cursor-pointer transition-all uppercase tracking-wider"
                          >
                            Intentar Otra Simulación
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              MAIN TAB Content: GUÍAS Y REQUISITOS TECNM
              ======================================================= */}
          {activeTab === "guias" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header section with Shield and subtitled metadata */}
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                <div className="p-2 bg-lime-950/40 border border-lime-500/20 rounded-xl">
                  <Shield size={20} className="text-lime-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">NORMATIVIDAD INSTITUCIONAL</span>
                  <h3 className="text-base font-black text-white tracking-wide uppercase">
                    DIRECTRICES DEL REQUISITO DE INGLÉS TECNM
                  </h3>
                </div>
              </div>

              {/* Two Column Grid layout to match Image 4 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side: Technical and academic guidelines (Col-span-7) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Card 1: NIVEL OBLIGATORIO ACREDITADO */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-lime-950/20 border border-lime-500/20 flex items-center justify-center text-lime-400">
                        <GraduationCap size={13} />
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">NIVEL OBLIGATORIO ACREDITADO</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      El egresado debe acreditar la comprensión de textos y expresión oral de un nivel mínimo de **MCER B1 (460+ puntos TOEFL ITP)** o en algunos casos B2, de acuerdo a la dirección académica de cada instituto tecnológico.
                    </p>
                  </div>

                  {/* Card 2: VALIDEZ Y CONSTANCIAS LOCALES */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-lime-950/20 border border-lime-500/20 flex items-center justify-center text-lime-400">
                        <FileText size={13} />
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">VALIDEZ Y CONSTANCIAS LOCALES</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      El expediente digital generado en **TecLingo** es compatible con las rúbricas institucionales del Marco Común Europeo de Referencia, facilitando el dictamen favorable de liberación de inglés por parte del Comité Académico.
                    </p>
                  </div>

                  {/* Card 3: EXPLICACIÓN DE GRAMÁTICA TÉCNICA PARA EL TECNM */}
                  <div className="bg-indigo-950/10 border border-indigo-950/40 rounded-2xl p-5 hover:border-indigo-900/20 transition-all space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Info size={13} />
                      </div>
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider font-mono">EXPLICACIÓN DE GRAMÁTICA TÉCNICA PARA EL TECNM</h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      En el inglés de ingeniería, la omisión del pronombre de sujeto neutral <code className="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-rose-400 text-[11px]">"It"</code> (ejemplo: escribir <code className="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-zinc-400 text-[11px]">"Is necessary to install"</code> en lugar de <code className="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-emerald-400 text-[11px]">"It is necessary to install"</code>) representa el error de sintaxis más común en las evaluaciones. Nuestra IA de TecLingo asiste con rigurosidad matemática en erradicar esta tendencia de omisión.
                    </p>
                  </div>

                </div>

                {/* Right side: Ruta de Trámite SEP & Unique Code (Col-span-5) */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-5 bg-gradient-to-b from-zinc-950/80 to-zinc-950/40 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                      <div className="w-7 h-7 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-400">
                        <Compass size={15} />
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                        RUTA DE TRÁMITE SEP
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Completa la totalidad del temario curricular interactivo bilingüe (unidades A1, A2 y B1).",
                        "Realiza al menos un simulador predictivo TOEFL completo con una calificación estimada superior a 460 puntos.",
                        "Descarga tu Constancia de Nivel Oficial firmada criptográficamente por Blockchain en el panel principal.",
                        "Entrega el folio de tu constancia al Coordinador de Lenguas Extranjeras de tu plantel para validación del dictamen."
                      ].map((step, sIdx) => (
                        <div key={sIdx} className="flex gap-3 items-start text-xs text-zinc-400 font-sans">
                          <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-bold text-lime-400 flex-shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <p className="leading-relaxed font-sans">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEP Unique Academic Key */}
                  <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-4 text-center mt-4">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">REGISTRO SIVAL DE VALIDEZ OFICIAL</span>
                    <span className="text-[11px] font-mono font-bold text-lime-400 tracking-tight">
                      CLAVE ÚNICA ACADÉMICA SEP: SEP-MCER-TECLINGO-2026
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}
        </>
      )}

      {/* BLOCKCHAIN CERTIFICATE PRINT / EXPORT MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 text-center relative overflow-hidden shadow-2xl">
            <button 
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 bg-zinc-900 rounded-full border border-zinc-800 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="academy uppercase text-[12px] font-mono tracking-widest text-zinc-500 mb-1">TecLingo English Academy</div>
            <div className="folio font-mono text-[9px] text-zinc-600 mb-6">FOLIO VERIFICADO: TX882-B2</div>

            {/* Official Looking Certificate Mockup */}
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-8 md:p-12 mb-6 font-serif relative overflow-hidden shadow-lg select-none">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-lime-500" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <span className="text-[10px] uppercase tracking-widest text-lime-400 font-mono font-black block mb-2">Constancia Oficial de Suficiencia</span>
              <h1 className="text-3xl font-extrabold text-white font-sans tracking-wide mb-6 uppercase">CERTIFICATE</h1>

              <p className="text-[11px] text-zinc-500 font-sans uppercase tracking-wider mb-1">Se otorga la presente constancia a:</p>
              <p className="text-2xl font-black text-white font-sans tracking-tight border-b border-zinc-800 pb-2 max-w-sm mx-auto mb-6">
                {customName}
              </p>

              <p className="text-xs text-zinc-300 font-sans max-w-md mx-auto leading-relaxed mb-6">
                Por haber completado satisfactoriamente la evaluación global de habilidades lingüísticas en inglés, alcanzando un puntaje equivalente de <span className="text-lime-400 font-bold">{toeflScore} Puntos TOEFL ITP</span> correspondiente al nivel <span className="text-lime-400 font-bold">{mcerLevel} (MCER)</span>, de acuerdo con las especificaciones del Tecnológico Nacional de México (TecNM).
              </p>

              <div className="flex justify-between items-end mt-12 pt-6 border-t border-zinc-800/80 font-mono text-[9px] text-zinc-600 text-left">
                <div>
                  <span className="block font-bold text-zinc-500 font-mono">Sello Digital Blockchain</span>
                  <span className="text-zinc-400 block font-mono">0x82f4df6d8e87668172da73e90</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-zinc-500 font-mono">Fecha de Emisión</span>
                  <span className="text-zinc-400 block font-mono">11/07/2026</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={triggerCertificatePrint}
                className="px-6 py-3 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-lime-500/10"
              >
                <Printer size={14} /> Imprimir / Guardar como PDF
              </button>
              <button 
                onClick={() => setShowCertModal(false)}
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
