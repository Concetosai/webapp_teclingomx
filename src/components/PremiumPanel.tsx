import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  HelpCircle, 
  Upload, 
  X, 
  Award, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  FileText, 
  School, 
  CheckCircle, 
  Mail, 
  Info,
  ChevronRight,
  CreditCard,
  ShieldCheck
} from "lucide-react";

interface PremiumPanelProps {
  language: "es" | "en";
}

interface PlanConfig {
  id: "basico" | "pro" | "master";
  name: { es: string; en: string };
  badge?: { es: string; en: string };
  tagline: { es: string; en: string };
  price: {
    MXN: { amount: number; period: string };
    USD: { amount: number; period: string };
  };
  features: {
    es: string[];
    en: string[];
  };
  popular: boolean;
  buttonText: { es: string; en: string };
}

export default function PremiumPanel({ language }: PremiumPanelProps) {
  const [currency, setCurrency] = useState<"MXN" | "USD">("MXN");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseSuccessPlan, setPurchaseSuccessPlan] = useState<string | null>(null);
  
  // Academic Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [justification, setJustification] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load request from localStorage if exists
  const [submittedRequests, setSubmittedRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("teclingo_academic_requests");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Secure Checkout State
  const [checkoutPlanId, setCheckoutPlanId] = useState<"basico" | "pro" | "master">("pro");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");
  
  // PayPal checkout state
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");

  // Card checkout state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Common payment status states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const plans: PlanConfig[] = [
    {
      id: "basico",
      name: { es: "Básico", en: "Basic" },
      tagline: { es: "Para estudiantes independientes", en: "For self-driven learners" },
      price: {
        MXN: { amount: 149, period: "/ mes" },
        USD: { amount: 8, period: "/ mo" }
      },
      features: {
        es: [
          "Acceso a 3 laboratorios interactivos básicos",
          "Hasta 10 revisiones gramaticales diarias",
          "Soporte comunitario de Teclingo",
          "Historial de puntuaciones local",
          "Estadísticas básicas de progreso"
        ],
        en: [
          "Access to 3 basic interactive labs",
          "Up to 10 grammar reviews daily",
          "Teclingo community support",
          "Local score history logs",
          "Basic progress statistics"
        ]
      },
      popular: false,
      buttonText: { es: "Comenzar Básico", en: "Start Basic" }
    },
    {
      id: "pro",
      name: { es: "Pro", en: "Pro" },
      badge: { es: "Más Popular", en: "Most Popular" },
      tagline: { es: "El estándar bilingüe para ingenieros", en: "The bilingual standard for engineers" },
      price: {
        MXN: { amount: 299, period: "/ mes" },
        USD: { amount: 15, period: "/ mo" }
      },
      features: {
        es: [
          "Acceso ilimitado a los 8 laboratorios de IA",
          "Simulador TOEFL predictivo ilimitado",
          "Retroalimentación profunda de Gemini 3.5-Flash",
          "Pronunciación inteligente con feedback de acento",
          "Guardado ilimitado de vocabulario favorito",
          "Soporte rápido vía correo (Conceptos AI MX)"
        ],
        en: [
          "Unlimited access to all 8 AI labs",
          "Unlimited predictive TOEFL Simulators",
          "Deep diagnostics powered by Gemini 3.5-Flash",
          "Smart pronunciation with accent feedback",
          "Unlimited saved custom vocabulary book",
          "Fast email support (Conceptos AI MX)"
        ]
      },
      popular: true,
      buttonText: { es: "Obtener Pro", en: "Get Pro" }
    },
    {
      id: "master",
      name: { es: "Master", en: "Master" },
      tagline: { es: "Preparación académica definitiva", en: "Ultimate academic preparation" },
      price: {
        MXN: { amount: 499, period: "/ mes" },
        USD: { amount: 25, period: "/ mo" }
      },
      features: {
        es: [
          "Todo lo incluido en el plan Pro",
          "Asesoría de IA extendida 1-on-1 sin límites",
          "Soporte prioritario de Conceptos AI MX",
          "Certificados bilingües firmados digitalmente",
          "Clave única de validación institucional",
          "Acceso preferente a nuevos labs piloto"
        ],
        en: [
          "Everything in Pro plan included",
          "Unlimited 1-on-1 extended AI tutoring",
          "Priority support from Conceptos AI MX",
          "Digitally signed bilingual certificates",
          "Unique institutional validation key",
          "Early access to new pilot laboratories"
        ]
      },
      popular: false,
      buttonText: { es: "Obtener Master", en: "Get Master" }
    }
  ];

  // Drag and Drop files handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
    }
  };

  const handleSubmitAcademicRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !school || !justification) return;

    setIsLoading(true);

    // Simulate sending to "Conceptos AI MX" admin dashboard
    setTimeout(() => {
      const newRequest = {
        id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
        fullName,
        email,
        school,
        justification,
        fileName: uploadedFileName || "credencial_estudiante.pdf",
        status: "Pendiente",
        date: new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })
      };

      const updated = [newRequest, ...submittedRequests];
      setSubmittedRequests(updated);
      localStorage.setItem("teclingo_academic_requests", JSON.stringify(updated));

      setIsLoading(false);
      setFormSubmitted(true);
    }, 1500);
  };

  const handleBuyPlan = (planId: "basico" | "pro" | "master") => {
    setCheckoutPlanId(planId);
    setTimeout(() => {
      const element = document.getElementById("secure-checkout-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleResetForm = () => {
    setFullName("");
    setEmail("");
    setSchool("");
    setJustification("");
    setUploadedFile(null);
    setUploadedFileName(null);
    setFormSubmitted(false);
  };

  const getCardIssuer = (num: string) => {
    const cleanNum = num.replace(/\s/g, "");
    if (cleanNum.startsWith("4")) return "Visa";
    if (cleanNum.startsWith("5")) return "Mastercard";
    if (cleanNum.startsWith("3")) return "Amex";
    return "";
  };

  const handleResetPayment = () => {
    setPaymentSuccess(false);
    setActivatedPlan(null);
    setPaypalEmail("");
    setPaypalPassword("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setPaymentError(null);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (paymentMethod === "paypal") {
      if (!paypalEmail || !paypalEmail.includes("@")) {
        setPaymentError(language === "es" ? "Por favor, introduce un correo de PayPal válido." : "Please enter a valid PayPal email address.");
        return;
      }
      if (!paypalPassword || paypalPassword.length < 4) {
        setPaymentError(language === "es" ? "Por favor, introduce tu contraseña de PayPal." : "Please enter your PayPal password.");
        return;
      }
    } else {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 16) {
        setPaymentError(language === "es" ? "El número de tarjeta debe tener 16 dígitos." : "Card number must contain 16 digits.");
        return;
      }
      if (!cardExpiry || !cardExpiry.includes("/")) {
        setPaymentError(language === "es" ? "Formato de fecha de vencimiento inválido (MM/AA)." : "Invalid expiration date format (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setPaymentError(language === "es" ? "El código de seguridad CVV debe tener al menos 3 dígitos." : "CVV must be at least 3 digits.");
        return;
      }
      if (cardName.trim().length < 3) {
        setPaymentError(language === "es" ? "Por favor, introduce el nombre completo del titular." : "Please enter the cardholder's full name.");
        return;
      }
    }

    setPaymentLoading(true);

    // Simulate payment processing delay (2 seconds)
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
      const selectedPlanObj = plans.find(p => p.id === checkoutPlanId);
      const selectedPlanName = selectedPlanObj 
        ? (language === "es" ? selectedPlanObj.name.es : selectedPlanObj.name.en) 
        : checkoutPlanId;
      setActivatedPlan(selectedPlanName);
      
      // Store locally
      localStorage.setItem("teclingo_premium_plan", checkoutPlanId);
      localStorage.setItem("teclingo_premium_active", "true");
      localStorage.setItem("teclingo_premium_date", new Date().toISOString());

      // Trigger standard buy success banner for the header as well
      setPurchaseSuccessPlan(selectedPlanName);
    }, 2000);
  };

  return (
    <div className="space-y-16 py-4 animate-fadeIn max-w-6xl mx-auto px-4">
      {/* Premium Redesign Header */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/60 rounded-full text-[11px] font-bold text-[#0058bc] uppercase tracking-wider">
          <Sparkles size={12} className="text-[#0058bc]" />
          <span>{language === "es" ? "Suscripción Premium" : "Premium Subscription"}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
          {language === "es" ? "Invierte en tu Futuro Profesional" : "Invest in Your Professional Future"}
        </h2>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          {language === "es" 
            ? "Elige el plan ideal para desbloquear simuladores oficiales de TOEFL, laboratorios interactivos bilingües de IA y acompañamiento de Conceptos AI MX."
            : "Choose the perfect plan to unlock official TOEFL simulators, interactive AI labs, and guidance from Conceptos AI MX."}
        </p>

        {/* Apple Style Moneda Dual Toggle */}
        <div className="pt-6 flex justify-center">
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setCurrency("MXN")}
              className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                currency === "MXN"
                  ? "bg-white text-[#0058bc] shadow-sm font-black"
                  : "text-gray-400 hover:text-gray-800"
              }`}
            >
              MXN ($)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                currency === "USD"
                  ? "bg-white text-[#0058bc] shadow-sm font-black"
                  : "text-gray-400 hover:text-gray-800"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </header>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {purchaseSuccessPlan && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-6 py-4 rounded-3xl flex items-center justify-between shadow-sm max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check size={16} />
              </div>
              <div>
                <p className="text-xs font-bold font-sans">
                  {language === "es" ? "¡Suscripción Simulada con Éxito!" : "Subscription Successfully Simulated!"}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {language === "es" 
                    ? `Has seleccionado el plan ${purchaseSuccessPlan}. Tu acceso premium ha sido activado de forma local.`
                    : `You have selected the ${purchaseSuccessPlan} plan. Your local premium access is now active.`}
                </p>
              </div>
            </div>
            <button onClick={() => setPurchaseSuccessPlan(null)} className="text-emerald-500 hover:text-emerald-800 p-1">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => {
          const currentPrice = plan.price[currency];
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-[32px] border ${
                plan.popular 
                  ? "border-[#0058bc] shadow-md ring-1 ring-[#0058bc]/20 scale-102" 
                  : "border-gray-150 shadow-sm"
              } p-8 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 min-h-[580px]`}
            >
              {plan.popular && plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0058bc] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                  {language === "es" ? plan.badge.es : plan.badge.en}
                </span>
              )}

              <div className="space-y-6">
                {/* Plan Header */}
                <div>
                  <h3 className="text-xl font-extrabold text-gray-950 font-sans tracking-tight">
                    {language === "es" ? plan.name.es : plan.name.en}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {language === "es" ? plan.tagline.es : plan.tagline.en}
                  </p>
                </div>

                {/* Pricing Block with dual currency transition */}
                <div className="flex items-baseline py-2">
                  <span className="text-4xl font-extrabold text-gray-950 tracking-tight font-sans">
                    ${currentPrice.amount}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 ml-1.5">
                    {currency} {plan.price[currency].period}
                  </span>
                </div>

                <div className="border-b border-gray-100 pb-2" />

                {/* Benefits List */}
                <ul className="space-y-4 py-2">
                  {(language === "es" ? plan.features.es : plan.features.en).map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium leading-relaxed">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? "bg-blue-50 text-[#0058bc]" : "bg-gray-50 text-gray-500"
                      }`}>
                        <Check size={11} className="stroke-[3]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase Trigger (Apple style solid, polished, elegant button) */}
              <div className="pt-8">
                <button
                  onClick={() => handleBuyPlan(plan.id)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold tracking-wide uppercase transition-all duration-300 active:scale-98 cursor-pointer ${
                    plan.popular
                      ? "bg-[#0058bc] text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                      : "bg-gray-950 text-white hover:bg-gray-900 shadow-sm"
                  }`}
                >
                  {language === "es" ? plan.buttonText.es : plan.buttonText.en}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURE CHECKOUT GATEWAY */}
      <div 
        id="secure-checkout-section" 
        className="max-w-4xl mx-auto bg-white border border-gray-150 rounded-[40px] p-6 md:p-10 space-y-8 shadow-sm"
      >
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              <ShieldCheck size={12} />
              <span>{language === "es" ? "Pasarela de Pago Certificada" : "Certified Payment Gateway"}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-950 tracking-tight leading-tight">
              {language === "es" ? "Finalizar tu Adquisición" : "Complete Your Checkout"}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {language === "es" 
                ? "Transacciones encriptadas de extremo a extremo bajo estándares de Conceptos AI MX."
                : "Transactions encrypted end-to-end under Conceptos AI MX framework standards."}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-bold text-gray-400 shrink-0">
            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs">
              <Lock size={12} className="text-emerald-500" />
              SSL SECURE
            </span>
          </div>
        </header>

        {paymentSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-6 max-w-md mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-extrabold text-gray-950 tracking-tight">
                {language === "es" ? "¡Pago Confirmado Exitosamente!" : "Payment Successfully Confirmed!"}
              </h4>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                {language === "es"
                  ? `Se ha activado tu suscripción al plan ${activatedPlan}. Las funciones premium de Teclingo ahora están desbloqueadas en este dispositivo.`
                  : `Your subscription to ${activatedPlan} plan is active. Premium features on Teclingo have been unlocked on this device.`}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 text-[11px] text-gray-500 space-y-1.5 text-left font-mono">
              <div className="flex justify-between">
                <span>{language === "es" ? "Estado:" : "Status:"}</span>
                <span className="text-emerald-500 font-bold">{language === "es" ? "ACTIVO" : "ACTIVE"}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "es" ? "Transacción:" : "Transaction ID:"}</span>
                <span className="font-semibold text-gray-800">TXN-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === "es" ? "Método de Pago:" : "Payment Method:"}</span>
                <span className="font-semibold text-gray-800 uppercase">{paymentMethod === "paypal" ? "PayPal Smart Button" : "Credit/Debit Card"}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                <span>{language === "es" ? "Monto Activado:" : "Activated Price:"}</span>
                <span className="font-bold text-indigo-600">
                  ${plans.find(p => p.id === checkoutPlanId)?.price[currency].amount} {currency}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetPayment}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 font-bold text-xs transition-all cursor-pointer bg-white"
            >
              {language === "es" ? "Realizar otra transacción" : "Perform another transaction"}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Plan selection / info */}
            <div className="lg:col-span-5 space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {language === "es" ? "1. Resumen de Suscripción" : "1. Subscription Summary"}
              </h4>

              <div className="bg-gray-50/60 border border-gray-150 rounded-3xl p-5 space-y-5 shadow-2xs">
                {/* Plan Selector Buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {language === "es" ? "Selecciona tu Plan:" : "Choose your Plan:"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["basico", "pro", "master"] as const).map((pid) => (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setCheckoutPlanId(pid)}
                        className={`py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          checkoutPlanId === pid
                            ? "bg-[#0058bc] text-white border-transparent shadow-sm"
                            : "bg-white text-gray-400 border-gray-200 hover:text-gray-700"
                        }`}
                      >
                        {pid === "basico" ? (language === "es" ? "Básico" : "Basic") : pid === "pro" ? "Pro" : "Master"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-150 my-1" />

                {/* Displaying Currently Selected Plan details */}
                {(() => {
                  const selectedPlanObj = plans.find(p => p.id === checkoutPlanId);
                  if (!selectedPlanObj) return null;
                  const priceObj = selectedPlanObj.price[currency];
                  return (
                    <div className="space-y-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-50 text-indigo-600">
                          {language === "es" ? "Plan Seleccionado" : "Selected Plan"}
                        </span>
                        <h5 className="font-extrabold text-base text-gray-950 tracking-tight mt-1">
                          {language === "es" ? selectedPlanObj.name.es : selectedPlanObj.name.en}
                        </h5>
                        <p className="text-[11px] text-gray-400 leading-normal font-medium italic mt-0.5">
                          "{language === "es" ? selectedPlanObj.tagline.es : selectedPlanObj.tagline.en}"
                        </p>
                      </div>

                      <div className="flex items-baseline py-1 justify-between bg-white p-3 rounded-xl border border-gray-150">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">{language === "es" ? "Precio a Pagar:" : "Price to Pay:"}</span>
                        <span className="text-xl font-extrabold text-gray-950 font-mono">
                          ${priceObj.amount} <span className="text-[10px] text-gray-400">{currency}{priceObj.period}</span>
                        </span>
                      </div>

                      {/* Micro benefit summary */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{language === "es" ? "Incluye:" : "Includes:"}</span>
                        <ul className="space-y-1.5">
                          {(language === "es" ? selectedPlanObj.features.es : selectedPlanObj.features.en).slice(0, 3).map((feat, fidx) => (
                            <li key={fidx} className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                              <Check size={10} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                          {selectedPlanObj.features.es.length > 3 && (
                            <li className="text-[9px] text-indigo-500 font-bold font-sans pl-3.5">
                              + {selectedPlanObj.features.es.length - 3} {language === "es" ? "beneficios más..." : "more benefits..."}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right side: Interactive Checkout Form */}
            <div className="lg:col-span-7 space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {language === "es" ? "2. Método de Pago Seguro" : "2. Secure Payment Method"}
              </h4>

              <div className="space-y-6">
                {/* Payment Method Selector (Tab style) */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-gray-50 border border-gray-150 rounded-2xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod("paypal"); setPaymentError(null); }}
                    className={`py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === "paypal"
                        ? "bg-[#ffc439]/10 text-amber-700 border border-[#ffc439]/30 font-black"
                        : "text-gray-400 hover:text-gray-700 border border-transparent"
                    }`}
                  >
                    <span className="font-bold text-[13px] tracking-tighter italic">
                      <span className="text-[#003087]">Pay</span>
                      <span className="text-[#0079c1]">Pal</span>
                    </span>
                    <span className="text-[10px] font-black lowercase text-[#0079c1] bg-[#0079c1]/10 px-1.5 py-0.2 rounded font-sans">primordial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod("card"); setPaymentError(null); }}
                    className={`py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMethod === "card"
                        ? "bg-white text-gray-800 border border-gray-200 font-black shadow-2xs"
                        : "text-gray-400 hover:text-gray-700 border border-transparent"
                    }`}
                  >
                    <CreditCard size={13} />
                    <span>{language === "es" ? "Tarjeta de Crédito" : "Credit Card"}</span>
                  </button>
                </div>

                {/* Form Inputs Container */}
                <div className="bg-gray-50/40 border border-gray-150 rounded-3xl p-5 shadow-2xs space-y-4">
                  {paymentMethod === "paypal" ? (
                    <div className="space-y-4 animate-fadeIn">
                      {/* PayPal Smart Form Block */}
                      <div className="text-center py-2 border-b border-gray-150 pb-4">
                        <div className="text-2xl font-black italic select-none">
                          <span className="text-[#003087]">Pay</span>
                          <span className="text-[#0079c1]">Pal</span>
                          <span className="text-[10px] uppercase tracking-widest text-[#003087] ml-1 bg-blue-50 px-2 py-0.5 rounded-md font-sans font-black">Checkout</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          {language === "es" 
                            ? "Paga rápido y seguro utilizando tu cuenta asociada a PayPal." 
                            : "Pay fast and securely using your linked PayPal account."}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {language === "es" ? "Correo de PayPal" : "PayPal Email"}
                          </label>
                          <input
                            type="email"
                            placeholder="usuario@sandbox-paypal.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058bc] text-gray-800 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {language === "es" ? "Contraseña" : "Password"}
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••••••"
                            value={paypalPassword}
                            onChange={(e) => setPaypalPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058bc] text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] text-amber-600 bg-amber-50/50 p-2 rounded-lg leading-relaxed border border-amber-100/30 font-medium">
                        <Info size={11} className="shrink-0 text-amber-500" />
                        <span>
                          {language === "es"
                            ? "Serás logueado instantáneamente a través de nuestra API segura simulada."
                            : "You will be logged in instantly through our secure simulated API."}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Credit Card Interactive Form Block */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {language === "es" ? "Nombre en la Tarjeta" : "Cardholder Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="ING. CARLOS SANCHEZ"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 bg-white border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 font-bold tracking-wide placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {language === "es" ? "Número de Tarjeta" : "Card Number"}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                              setCardNumber(formatted);
                            }}
                            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 font-mono font-bold tracking-widest"
                          />
                          {/* Real-time brand badge */}
                          {(() => {
                            const issuer = getCardIssuer(cardNumber);
                            if (!issuer) return <CreditCard size={16} className="absolute right-4 top-3 text-gray-400" />;
                            return (
                              <span className="absolute right-3 top-2.5 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-gray-950 text-white font-sans tracking-wide">
                                {issuer}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {language === "es" ? "Vencimiento (MM/AA)" : "Expiry (MM/YY)"}
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 2) {
                                val = val.slice(0, 2) + "/" + val.slice(2, 4);
                              }
                              setCardExpiry(val);
                            }}
                            className="w-full px-4 py-3 bg-white border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="***"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-4 py-3 bg-white border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-800 font-mono font-bold tracking-widest"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {paymentError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl leading-relaxed font-semibold">
                    ⚠️ {paymentError}
                  </div>
                )}

                {/* Main Purchase Action button */}
                <button
                  onClick={handleProcessPayment}
                  type="button"
                  disabled={paymentLoading}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === "paypal"
                      ? "bg-[#ffc439] hover:bg-[#f2b21b] text-gray-900 border border-amber-300"
                      : "bg-[#0058bc] hover:bg-blue-700 text-white shadow-blue-500/10"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {paymentLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>{language === "es" ? "PROCESANDO TRANSACCIÓN..." : "PROCESSING TRANSACTION..."}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      <span>
                        {language === "es" 
                          ? `Pagar Seguro $${plans.find(p => p.id === checkoutPlanId)?.price[currency].amount} ${currency}` 
                          : `Secure Checkout $${plans.find(p => p.id === checkoutPlanId)?.price[currency].amount} ${currency}`}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed font-medium">
                  🔒 {language === "es" 
                    ? "Tus datos personales y financieros están protegidos mediante tokens seguros. Al pagar, aceptas los términos de servicio de Teclingo y de Conceptos AI MX." 
                    : "Your personal and financial data is guarded using secure tokens. By checking out, you accept Teclingo & Conceptos AI MX Terms."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discrete Academic Support Toggle (Negotiable/Beca) */}
      <div className="text-center pt-8 space-y-4">
        <div className="max-w-md mx-auto p-6 bg-[#f4f7fc]/40 border border-gray-100 rounded-[28px] space-y-4">
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            {language === "es"
              ? "¿Eres estudiante o docente del TecNM / escuela pública y requieres apoyo económico?"
              : "Are you a student or teacher from TecNM or a public school and require academic aid?"}
          </p>
          <button
            onClick={() => { setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-400 font-bold text-xs rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <School size={13} className="text-gray-500" />
            <span>{language === "es" ? "¿Requieres apoyo académico?" : "Request Academic Support?"}</span>
          </button>
        </div>
      </div>

      {/* Academic Support Submissions list inside the page (simulation of Conceptos AI MX response) */}
      {submittedRequests.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
          <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest font-mono border-b border-gray-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{language === "es" ? "Historial de Solicitudes (Conceptos AI MX)" : "Request Logs (Conceptos AI MX)"}</span>
          </h4>
          <div className="space-y-3">
            {submittedRequests.map((req, index) => (
              <div key={req.id || index} className="p-4 bg-gray-50/60 rounded-2xl border border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-950 font-sans">{req.fullName}</span>
                    <span className="text-[10px] bg-blue-50 border border-blue-100 text-[#0058bc] px-2 py-0.5 rounded font-mono">{req.id}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Escuela: <span className="text-gray-600">{req.school}</span> • Correo: <span className="text-gray-600">{req.email}</span></p>
                  <p className="text-[11px] text-gray-500 italic">" {req.justification} "</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1 font-mono">
                    <FileText size={10} />
                    <span>{req.fileName}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end justify-between shrink-0 h-full gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    req.status === "Pendiente" 
                      ? "bg-amber-100/60 text-amber-800 border border-amber-200/50" 
                      : "bg-emerald-100/60 text-emerald-800 border border-emerald-200/50"
                  }`}>
                    {req.status === "Pendiente" ? "Pendiente de Autorización" : "Aprobado - 50% Beca"}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">{req.date}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            * Las solicitudes son procesadas manualmente por el departamento de becas de <b>Conceptos AI MX</b>. Recibirás tu código de descuento en el correo institucional provisto.
          </p>
        </div>
      )}

      {/* Apple Style Academic Support Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-md"
            />

            {/* Modal Body container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
            >
              {/* Header and Close Button */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0058bc]/10 text-[#0058bc] rounded-xl flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-950 tracking-tight">
                      {language === "es" ? "Solicitud de Apoyo Académico" : "Academic Support Request"}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {language === "es" ? "Procesado por Conceptos AI MX" : "Processed by Conceptos AI MX"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto space-y-6">
                {!formSubmitted ? (
                  <form onSubmit={handleSubmitAcademicRequest} className="space-y-5">
                    {/* Warning Notice */}
                    <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/50 flex gap-3 text-xs text-blue-950 leading-relaxed">
                      <Info size={16} className="text-[#0058bc] shrink-0 mt-0.5" />
                      <div>
                        <b>{language === "es" ? "Apoyo Social Bilingüe" : "Social Bilingual Support"}</b>: 
                        {language === "es" 
                          ? " Ofrecemos subsidios de hasta el 50% de descuento en el plan Pro o Master para estudiantes matriculados en escuelas públicas, tecnológicos y universidades."
                          : " We offer grants up to 50% off on Pro or Master plans for students registered in public tech universities or institutions."}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {language === "es" ? "Nombre Completo" : "Full Name"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Elena Rosales"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058bc] focus:bg-white transition-all text-gray-800 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {language === "es" ? "Correo Electrónico" : "Institutional Email"}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="elena.rosales@itver.edu.mx"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058bc] focus:bg-white transition-all text-gray-800 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {language === "es" ? "Instituto o Universidad" : "Institution / University"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Instituto Tecnológico de Veracruz (TecNM)"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058bc] focus:bg-white transition-all text-gray-800 font-semibold"
                      />
                    </div>

                    {/* Drag and Drop Custom File Upload Area */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {language === "es" ? "Comprobación de Estudios (Identificación o Constancia)" : "Academic Proof (Student ID or Tuition Receipt)"}
                      </label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                          isDragOver 
                            ? "border-[#0058bc] bg-blue-50/40" 
                            : "border-gray-200 hover:border-gray-400 bg-gray-50/50"
                        }`}
                      >
                        <input
                          type="file"
                          id="academic-file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="academic-file" className="cursor-pointer flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-150 shadow-xs text-gray-400">
                            <Upload size={16} />
                          </div>
                          <p className="text-xs font-bold text-gray-700">
                            {language === "es" ? "Arrastra y suelta tu archivo o búscalo" : "Drag and drop your file or browse"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {language === "es" ? "Soporta PDF, PNG, JPG hasta 5MB" : "Supports PDF, PNG, JPG up to 5MB"}
                          </p>
                        </label>
                      </div>

                      {/* Uploaded File Indicator */}
                      {uploadedFileName && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <div className="flex items-center gap-2 text-xs text-gray-700">
                            <FileText size={14} className="text-gray-400" />
                            <span className="font-semibold truncate max-w-[200px]">{uploadedFileName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setUploadedFile(null); setUploadedFileName(null); }}
                            className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {language === "es" ? "Justificación Breve (Beca)" : "Brief Justification"}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder={language === "es" 
                          ? "Cuéntanos por qué consideras que calificas para el apoyo y cómo el inglés potenciará tus estudios..."
                          : "Tell us why you deserve the scholarship and how English will leverage your academic goals..."}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0058bc] focus:bg-white transition-all text-gray-800 font-medium resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        {language === "es" ? "Cancelar" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-gray-950 text-white hover:bg-gray-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{language === "es" ? "Enviar Solicitud" : "Submit Request"}</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-6 animate-fadeIn">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                      <CheckCircle size={28} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-extrabold text-gray-950 tracking-tight">
                        {language === "es" ? "¡Solicitud Registrada con Éxito!" : "Request Registered Successfully!"}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                        {language === "es" 
                          ? "Tu documentación de estudios ha sido recibida y enviada al panel de administración de Conceptos AI MX."
                          : "Your academic proof has been received and routed to the Conceptos AI MX administration portal."}
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/50 max-w-xs mx-auto text-[11px] text-emerald-950">
                      <b>{language === "es" ? "Notificación Programada" : "Scheduled Notification"}</b>: 
                      {language === "es" 
                        ? " Nuestro comité revisará tu caso manualmente. Recibirás tu descuento exclusivo vía email en menos de 24 horas."
                        : " Our committee will inspect your proof. Your discount code will be delivered to your inbox within 24 hours."}
                    </div>

                    <div className="pt-4 flex justify-center gap-3">
                      <button
                        onClick={handleResetForm}
                        className="px-5 py-2.5 rounded-xl border border-gray-100 text-gray-500 hover:text-gray-700 hover:border-gray-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        {language === "es" ? "Enviar Otra" : "Submit Another"}
                      </button>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl bg-gray-950 text-white hover:bg-gray-900 text-xs font-bold transition-all cursor-pointer"
                      >
                        {language === "es" ? "Entendido" : "Got it"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
