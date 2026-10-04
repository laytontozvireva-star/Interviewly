import { useRef, useState } from "react";

import {
  generateInterviewQuestion,
  generateFinalReview,
} from "./services/aiService";

import {
  speak,
  createSpeechRecognition,
} from "./services/voiceService";

import "./App.css";

const TOTAL_QUESTIONS = 8;

// Candidate can pause for up to 5 seconds before
// InterviewBuddy automatically considers the answer finished.
const SILENCE_DELAY = 5000;

/* =========================
   SVG ICONS
========================= */

function BrandLogoIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="18" fill="#0B1329" />
      <circle cx="32" cy="32" r="22" fill="#0F3836" />
      <circle cx="32" cy="32" r="15.5" fill="none" stroke="#5EEAD4" strokeWidth="4.5" />
      <circle cx="32" cy="32" r="8" fill="#14B8A6" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function MicIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function MicOffIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 10v-1m14 0v1a6.97 6.97 0 0 1-1.1 3.7" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function PauseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function PlayIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function VolumeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function EditIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SkipIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

function HomeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function RefreshIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6" />
      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function DocumentIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TrophyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* =========================
   JOB PRESETS FOR QUICK SETUP
========================= */

const JOB_PRESETS = [
  {
    title: "Full Stack Developer",
    description: "Build scalable web applications using React, Node.js, and SQL/NoSQL databases. Handle RESTful APIs and modern cloud architecture.",
    background: "Experienced developer with solid hands-on knowledge in React, Node.js, PostgreSQL, and Git version control.",
  },
  {
    title: "Frontend Engineer",
    description: "Craft responsive, accessible pixel-perfect UI components with React, TypeScript, and modern CSS design systems.",
    background: "Frontend specialist passionate about web accessibility, UI design, web performance optimization, and React.",
  },
  {
    title: "Product Manager",
    description: "Lead product strategy, user discovery, sprint planning, feature prioritization, and cross-functional team execution.",
    background: "Product lead skilled in user story mapping, Agile methodology, stakeholder communication, and product analytics.",
  },
  {
    title: "Data Analyst",
    description: "Analyze complex datasets, build business dashboards, write optimized SQL queries, and present data-driven recommendations.",
    background: "Analytical mindset proficient in SQL queries, Python (Pandas/NumPy), data visualization, and business analytics.",
  },
];

/* =========================
   INTERVIEW STATUS ORB
========================= */

function InterviewOrb({ status }) {
  const configs = {
    listening: {
      outerGlow: "bg-teal-500/30 shadow-[0_0_90px_rgba(20,184,166,0.6)]",
      pulseRing: "border-teal-400/50 animate-ping",
      core: "from-teal-400 via-cyan-500 to-emerald-400",
      statusText: "Listening... Speak naturally",
      statusTag: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    },
    speaking: {
      outerGlow: "bg-indigo-500/30 shadow-[0_0_90px_rgba(99,102,241,0.6)]",
      pulseRing: "border-indigo-400/50 animate-pulse",
      core: "from-indigo-500 via-violet-500 to-purple-500",
      statusText: "InterviewBuddy is speaking...",
      statusTag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    },
    thinking: {
      outerGlow: "bg-amber-500/30 shadow-[0_0_90px_rgba(245,158,11,0.6)]",
      pulseRing: "border-amber-400/50 animate-spin",
      core: "from-amber-400 via-orange-500 to-rose-500",
      statusText: "InterviewBuddy is thinking...",
      statusTag: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    },
    paused: {
      outerGlow: "bg-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.3)]",
      pulseRing: "border-amber-500/30",
      core: "from-amber-500 via-yellow-500 to-amber-600",
      statusText: "Interview paused",
      statusTag: "bg-amber-500/10 text-amber-200 border-amber-500/30",
    },
    idle: {
      outerGlow: "bg-indigo-600/20 shadow-[0_0_60px_rgba(99,102,241,0.3)]",
      pulseRing: "border-indigo-500/20",
      core: "from-indigo-600 via-purple-600 to-slate-700",
      statusText: "Get ready to answer",
      statusTag: "bg-slate-800 text-slate-300 border-slate-700",
    },
  };

  const current = configs[status] || configs.idle;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative flex h-52 w-52 items-center justify-center">
        {/* Ambient backdrop glow */}
        <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${current.outerGlow}`} />

        {/* Pulse Ring */}
        <div className={`absolute inset-2 rounded-full border-2 transition-all duration-700 ${current.pulseRing}`} />
        <div className="absolute inset-5 rounded-full border border-white/10 bg-slate-900/70 backdrop-blur-md shadow-2xl" />

        {/* Dynamic Equalizer Audio Wavebars (Active during Listening / Speaking) */}
        {(status === "listening" || status === "speaking") && (
          <div className="absolute flex items-center justify-center gap-1.5 z-20 pointer-events-none">
            <span className="h-6 w-1 rounded-full bg-white/90 animate-bounce" style={{ animationDelay: "100ms" }} />
            <span className="h-10 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="h-14 w-1 rounded-full bg-white/90 animate-bounce" style={{ animationDelay: "200ms" }} />
            <span className="h-8 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: "400ms" }} />
            <span className="h-12 w-1 rounded-full bg-white/90 animate-bounce" style={{ animationDelay: "150ms" }} />
          </div>
        )}

        {/* Rotating Thinking Spinner Ring */}
        {status === "thinking" && (
          <div className="absolute inset-3 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-rose-500 border-l-transparent animate-spin z-20" />
        )}

        {/* Core Animated Orb Sphere */}
        <div
          className={`relative h-28 w-28 rounded-full bg-gradient-to-tr ${current.core} shadow-2xl transition-all duration-500 flex items-center justify-center ${
            status === "thinking" ? "scale-95 opacity-90" : "scale-100"
          }`}
        >
          <div className="h-full w-full rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white/30 blur-sm" />
          </div>
        </div>
      </div>

      {/* Status Pill Badge */}
      <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all duration-300 flex items-center gap-2 ${current.statusTag}`}>
        <span className={`w-2 h-2 rounded-full ${status === "listening" ? "bg-teal-400 animate-ping" : status === "speaking" ? "bg-indigo-400 animate-pulse" : status === "thinking" ? "bg-amber-400 animate-spin" : "bg-slate-400"}`} />
        {current.statusText}
      </div>
    </div>
  );
}

/* =========================
   MAIN APP COMPONENT
========================= */

function App() {
  /* =========================
     SCREEN STATE
  ========================= */

  const [screen, setScreen] = useState("home");

  /* =========================
     INTERVIEW SETUP DATA
  ========================= */

  const [interviewData, setInterviewData] = useState({
    jobTitle: "",
    jobDescription: "",
    candidateBackground: "",
    interviewType: "General Interview",
    nervousness: "Medium",
  });

  /* =========================
     INTERVIEW SESSION STATE
  ========================= */

  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answer, setAnswer] = useState("");
  const [interview, setInterview] = useState([]);
  const [review, setReview] = useState(null);
  const [previousReview, setPreviousReview] = useState(null);

  /* =========================
     LOADING & ERRORS
  ========================= */

  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [, setLoadingReview] = useState(false);
  const [aiError, setAiError] = useState("");
  const [voiceError, setVoiceError] = useState("");

  /* =========================
     VOICE / PAUSE CONTROL
  ========================= */

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [textMode, setTextMode] = useState(false);

  /* =========================
     REFS
  ========================= */

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const shouldKeepListeningRef = useRef(false);
  const submittingAnswerRef = useRef(false);

  /* =========================
     COMPUTED STATUS
  ========================= */

  let interviewStatus = "idle";
  if (isPaused) {
    interviewStatus = "paused";
  } else if (isSpeaking) {
    interviewStatus = "speaking";
  } else if (isListening) {
    interviewStatus = "listening";
  } else if (isProcessingAnswer) {
    interviewStatus = "thinking";
  }

  /* =========================
     UPDATE SETUP DATA
  ========================= */

  function handleChange(event) {
    const { name, value } = event.target;
    setInterviewData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function applyPreset(preset) {
    setInterviewData((prev) => ({
      ...prev,
      jobTitle: preset.title,
      jobDescription: preset.description,
      candidateBackground: preset.background,
    }));
  }

  /* =========================
     STOP LISTENING
  ========================= */

  function stopListening() {
    shouldKeepListeningRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    }

    recognitionRef.current = null;
    setIsListening(false);
  }

  /* =========================
     FINISH VOICE ANSWER
  ========================= */

  function finishVoiceAnswer() {
    if (isPaused) {
      return;
    }

    if (submittingAnswerRef.current) {
      return;
    }

    const finalAnswer = transcriptRef.current.trim();

    if (!finalAnswer) {
      return;
    }

    submittingAnswerRef.current = true;
    shouldKeepListeningRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    }

    recognitionRef.current = null;
    setIsListening(false);
    setAnswer(finalAnswer);

    setTimeout(() => {
      submitAnswer(finalAnswer);
    }, 200);
  }

  /* =========================
     START MICROPHONE
  ========================= */

  function startListening() {
    if (isProcessingAnswer) {
      return;
    }

    if (isPaused) {
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    setVoiceError("");
    transcriptRef.current = answer.trim();
    interimTranscriptRef.current = "";
    shouldKeepListeningRef.current = true;

    const recognition = createSpeechRecognition({
      onStart: () => {
        setIsListening(true);
      },

      onResult: ({ finalTranscript, interimTranscript }) => {
        if (!shouldKeepListeningRef.current || isPaused) {
          return;
        }

        if (finalTranscript) {
          transcriptRef.current = `${transcriptRef.current} ${finalTranscript}`.trim();
        }

        interimTranscriptRef.current = interimTranscript;
        const displayText = `${transcriptRef.current} ${interimTranscript}`.trim();
        setAnswer(displayText);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        if (transcriptRef.current.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            if (!isPaused) {
              finishVoiceAnswer();
            }
          }, SILENCE_DELAY);
        }
      },

      onEnd: () => {
        setIsListening(false);

        if (!shouldKeepListeningRef.current) {
          return;
        }

        if (isPaused) {
          return;
        }

        recognitionRef.current = null;

        setTimeout(() => {
          if (shouldKeepListeningRef.current && !recognitionRef.current && !isPaused) {
            startListening();
          }
        }, 300);
      },

      onError: (error) => {
        console.error("Voice recognition error:", error);

        if (error === "no-speech") {
          setIsListening(false);
          recognitionRef.current = null;

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }

          setTimeout(() => {
            if (shouldKeepListeningRef.current && !recognitionRef.current && !isPaused) {
              startListening();
            }
          }, 500);

          return;
        }

        shouldKeepListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;

        if (error === "not-allowed") {
          setVoiceError("Microphone permission was denied. Please allow microphone access in your browser.");
        } else if (error === "audio-capture") {
          setVoiceError("No microphone was detected. Please check your microphone.");
        } else {
          setVoiceError("There was a problem with voice input. You can type your answer instead.");
        }
      },
    });

    if (!recognition) {
      shouldKeepListeningRef.current = false;
      setVoiceError("Voice input is not supported in this browser. Please use Google Chrome or type your answer instead.");
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start recognition:", error);
      recognitionRef.current = null;
      setIsListening(false);
    }
  }

  /* =========================
     SPEAK QUESTION
  ========================= */

  function speakQuestion(questionText) {
    setVoiceError("");
    setIsSpeaking(true);
    setIsListening(false);
    stopListening();

    speak(questionText, () => {
      setIsSpeaking(false);
      setTimeout(() => {
        if (!isPaused) {
          startListening();
        }
      }, 700);
    });
  }

  /* =========================
     PAUSE INTERVIEW
  ========================= */

  function pauseInterview() {
    if (isPaused) {
      return;
    }

    stopListening();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsPaused(true);
  }

  /* =========================
     RESUME INTERVIEW
  ========================= */

  function resumeInterview() {
    if (!isPaused) {
      return;
    }

    setIsPaused(false);
    setVoiceError("");

    setTimeout(() => {
      startListening();
    }, 300);
  }

  /* =========================
     REPEAT QUESTION
  ========================= */

  function repeatQuestion() {
    if (!question) {
      return;
    }

    if (isPaused) {
      return;
    }

    stopListening();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    setTimeout(() => {
      speakQuestion(question);
    }, 200);
  }

  /* =========================
     START INTERVIEW
  ========================= */

  async function startInterview() {
    if (!interviewData.jobTitle.trim()) {
      setAiError("Please enter the job title first.");
      return;
    }

    setAiError("");
    setVoiceError("");
    setLoadingQuestion(true);
    setQuestion("");
    setAnswer("");
    setInterview([]);
    setQuestionNumber(1);
    setReview(null);
    setIsPaused(false);
    setTextMode(false);
    submittingAnswerRef.current = false;
    transcriptRef.current = "";
    interimTranscriptRef.current = "";

    try {
      const firstQuestion = await generateInterviewQuestion({
        jobTitle: interviewData.jobTitle,
        jobDescription: interviewData.jobDescription,
        candidateBackground: interviewData.candidateBackground,
        interviewType: interviewData.interviewType,
        nervousness: interviewData.nervousness,
        previousQuestion: "",
        previousAnswer: "",
        questionNumber: 1,
        totalQuestions: TOTAL_QUESTIONS,
        previousAttemptFeedback: previousReview ? previousReview.summary : "",
      });

      setQuestion(firstQuestion);
      setScreen("interview");

      setTimeout(() => {
        speakQuestion(firstQuestion);
      }, 500);
    } catch (error) {
      console.error(error);
      setAiError("Could not start the interview. Make sure the InterviewBuddy AI server and Ollama are running.");
    } finally {
      setLoadingQuestion(false);
    }
  }

  /* =========================
     SUBMIT ANSWER
  ========================= */

  async function submitAnswer(answerText = answer) {
    const cleanAnswer = answerText?.trim();

    if (!cleanAnswer) {
      return;
    }

    if (isPaused) {
      return;
    }

    if (submittingAnswerRef.current === false) {
      submittingAnswerRef.current = true;
    }

    stopListening();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsProcessingAnswer(true);

    const currentInterview = [
      ...interview,
      {
        question,
        answer: cleanAnswer,
      },
    ];

    setInterview(currentInterview);

    /* =========================
       LAST QUESTION
    ========================= */

    if (questionNumber >= TOTAL_QUESTIONS) {
      setLoadingReview(true);
      setAiError("");

      try {
        const finalReview = await generateFinalReview({
          jobTitle: interviewData.jobTitle,
          jobDescription: interviewData.jobDescription,
          candidateBackground: interviewData.candidateBackground,
          interviewType: interviewData.interviewType,
          interview: currentInterview,
          previousScore: previousReview?.overallScore || null,
        });

        setReview(finalReview);
        setPreviousReview(finalReview);
        setScreen("review");

        setTimeout(() => {
          speak(`Your interview is complete. Your overall score is ${finalReview.overallScore} out of 100.`);
        }, 500);
      } catch (error) {
        console.error("Final review error:", error);
        setAiError("The interview finished, but InterviewBuddy could not create the final review.");
      } finally {
        setLoadingReview(false);
        setIsProcessingAnswer(false);
        submittingAnswerRef.current = false;
      }

      return;
    }

    /* =========================
       NEXT QUESTION
    ========================= */

    const nextNumber = questionNumber + 1;
    setLoadingQuestion(true);
    setAnswer("");
    setAiError("");
    transcriptRef.current = "";
    interimTranscriptRef.current = "";

    try {
      const nextQuestion = await generateInterviewQuestion({
        jobTitle: interviewData.jobTitle,
        jobDescription: interviewData.jobDescription,
        candidateBackground: interviewData.candidateBackground,
        interviewType: interviewData.interviewType,
        nervousness: interviewData.nervousness,
        previousQuestion: question,
        previousAnswer: cleanAnswer,
        questionNumber: nextNumber,
        totalQuestions: TOTAL_QUESTIONS,
        previousAttemptFeedback: previousReview ? previousReview.summary : "",
      });

      setQuestion(nextQuestion);
      setQuestionNumber(nextNumber);

      setTimeout(() => {
        speakQuestion(nextQuestion);
      }, 500);
    } catch (error) {
      console.error("Next question error:", error);
      setAiError("Could not generate the next interview question.");
    } finally {
      setLoadingQuestion(false);
      setIsProcessingAnswer(false);
      submittingAnswerRef.current = false;
    }
  }

  /* =========================
     TRY AGAIN
  ========================= */

  function tryAgain() {
    stopListening();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsProcessingAnswer(false);
    setIsPaused(false);
    setTextMode(false);
    setAnswer("");
    setQuestion("");
    setInterview([]);
    setQuestionNumber(0);
    setReview(null);
    setAiError("");
    setVoiceError("");
    submittingAnswerRef.current = false;
    transcriptRef.current = "";
    interimTranscriptRef.current = "";
    setScreen("setup");
  }

  /* =========================
     RENDER: HOME SCREEN
  ========================= */

  if (screen === "home") {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-500/10 blur-[150px] pointer-events-none rounded-full" />

        {/* Top Navbar */}
        <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogoIcon className="w-10 h-10 shadow-lg shadow-teal-500/20" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                Interviewly
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">AI interview practice</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">100% Local AI • Gemma</span>
          </div>
        </header>

        {/* Main Hero Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center flex-1 flex flex-col items-center justify-center">
          <div className="mb-6 flex justify-center transform hover:scale-105 transition-transform duration-500">
            <InterviewOrb status="idle" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs tracking-wider uppercase mb-6 backdrop-blur-md">
            <SparklesIcon className="w-4 h-4" />
            AI-Powered Voice Interview Practice
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Master your real <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              interview confidence.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Have a realistic voice conversation with an open-weight AI interviewer powered by <strong className="text-white">Gemma</strong> running privately on your computer.
          </p>

          {/* Action Button */}
          <button
            onClick={() => {
              setScreen("setup");
              setAiError("");
            }}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-9 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
          >
            <span>Start Practice Interview</span>
            <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Feature Highlights Cards */}
          <div className="grid sm:grid-cols-3 gap-5 mt-16 text-left w-full max-w-3xl">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl hover:border-indigo-500/40 transition-colors">
              <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
                <LockIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">100% Private & Local</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Runs on Ollama locally. Zero API keys, zero subscription fees, complete data privacy.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl hover:border-purple-500/40 transition-colors">
              <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-3">
                <MicIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">Natural Voice Mode</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Speak naturally like a real phone call. Automatic silence detection and instant voice feedback.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl hover:border-pink-500/40 transition-colors">
              <div className="p-2.5 w-fit rounded-xl bg-pink-500/10 text-pink-400 mb-3">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">In-Depth AI Scorecard</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Receive instant feedback on technical accuracy, communication, confidence, and sample answers.</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
          InterviewBuddy • Powered by Gemma AI Local Model
        </footer>
      </div>
    );
  }

  /* =========================
     RENDER: SETUP SCREEN
  ========================= */

  if (screen === "setup") {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-10 relative overflow-hidden font-sans">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Back button & Header */}
          <div className="mb-8">
            <button
              onClick={() => setScreen("home")}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              ← Back to Home
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BriefcaseIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Interview Setup</h1>
                <p className="text-slate-400 text-sm mt-1">Configure your mock interview context for personalized AI questions.</p>
              </div>
            </div>
          </div>

          {/* Setup Form Container */}
          <div className="space-y-6 bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                ⚡ Quick Presets (Click to Auto-fill)
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* JOB TITLE */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
                <BriefcaseIcon className="w-4 h-4 text-indigo-400" />
                Job Title <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={interviewData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer, Product Manager, Data Scientist"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* JOB DESCRIPTION */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
                <DocumentIcon className="w-4 h-4 text-indigo-400" />
                Job Description (Optional)
              </label>
              <textarea
                name="jobDescription"
                value={interviewData.jobDescription}
                onChange={handleChange}
                placeholder="Paste key responsibilities or requirements from the job posting..."
                rows="4"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition"
              />
            </div>

            {/* CANDIDATE BACKGROUND */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                Your Background & Experience (Optional)
              </label>
              <textarea
                name="candidateBackground"
                value={interviewData.candidateBackground}
                onChange={handleChange}
                placeholder="Briefly describe your skills, projects, years of experience, or main technologies..."
                rows="3"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition"
              />
            </div>

            {/* INTERVIEW TYPE */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Interview Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "General Interview", label: "General", desc: "Balanced standard Q&A" },
                  { id: "Technical Interview", label: "Technical", desc: "Coding & architecture" },
                  { id: "Behavioral Interview", label: "Behavioral", desc: "STAR method stories" },
                  { id: "HR Interview", label: "HR Culture", desc: "Background & salary" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setInterviewData((prev) => ({ ...prev, interviewType: type.id }))}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      interviewData.interviewType === type.id
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-sm text-white mb-0.5">{type.label}</div>
                    <div className="text-xs text-slate-400">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* NERVOUSNESS LEVEL */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Nervousness Level (Adjusts AI Pace)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: "Low", emoji: "😊", label: "Confident" },
                  { level: "Medium", emoji: "😐", label: "Moderate" },
                  { level: "High", emoji: "😰", label: "Very Nervous" },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setInterviewData((prev) => ({ ...prev, nervousness: item.level }))}
                    className={`py-3 px-4 rounded-xl border text-center font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      interviewData.nervousness === item.level
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PRIVACY BADGE */}
            <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-900/60 rounded-2xl p-4 text-indigo-300 text-xs">
              <LockIcon className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                Your data stays 100% local on your machine. Powered by Ollama & open-weight Gemma model.
              </span>
            </div>

            {/* ERROR ALERT */}
            {aiError && (
              <div className="flex items-start gap-3 bg-red-950/60 border border-red-800/80 text-red-200 rounded-2xl p-4 text-sm">
                <AlertIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Connection Issue</p>
                  <p className="text-xs text-red-300">{aiError}</p>
                </div>
              </div>
            )}

            {/* START BUTTON */}
            <button
              onClick={startInterview}
              disabled={loadingQuestion}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 px-6 py-4 rounded-2xl font-bold text-base transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {loadingQuestion ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Interview Questions...</span>
                </>
              ) : (
                <>
                  <span>Begin AI Practice Session</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER: REVIEW SCREEN
  ========================= */

  if (screen === "review" && review) {
    const scoreColor =
      review.overallScore >= 80
        ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
        : review.overallScore >= 60
        ? "text-indigo-400 border-indigo-500/40 bg-indigo-500/10"
        : "text-amber-400 border-amber-500/40 bg-amber-500/10";

    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-12 relative overflow-hidden font-sans">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <p className="text-indigo-400 font-semibold tracking-widest text-xs uppercase mb-1">
              Interview Complete
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight">Performance Scorecard</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
              Here is your AI review for the <strong className="text-slate-200">{interviewData.jobTitle}</strong> practice interview.
            </p>
          </div>

          {/* OVERALL SCORE CARD */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
            
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Overall Performance Score</p>
            <div className="inline-flex items-baseline justify-center gap-1">
              <span className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                {review.overallScore}
              </span>
              <span className="text-2xl text-slate-500 font-medium">/ 100</span>
            </div>

            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${scoreColor}`}>
              <SparklesIcon className="w-4 h-4" />
              {review.overallScore >= 80 ? "Exceptional Performance" : review.overallScore >= 60 ? "Solid Performance" : "Great Start - Room for Growth"}
            </div>
          </div>

          {/* CATEGORY METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: "Communication", score: review.communicationScore, color: "from-blue-500 to-indigo-500" },
              { title: "Technical", score: review.technicalScore, color: "from-purple-500 to-pink-500" },
              { title: "Confidence", score: review.confidenceScore, color: "from-teal-500 to-emerald-500" },
              { title: "Relevance", score: review.relevanceScore, color: "from-amber-500 to-orange-500" },
            ].map((metric, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.title}</p>
                <p className="text-3xl font-extrabold mt-2 text-white">{metric.score}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${metric.color}`} style={{ width: `${metric.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* OVERALL SUMMARY */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-300">
              <DocumentIcon className="w-5 h-5 text-indigo-400" />
              Executive Summary
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">{review.summary}</p>
          </div>

          {/* STRENGTHS */}
          {review.strengths?.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
                <CheckIcon className="w-5 h-5" />
                Key Strengths
              </h2>
              <ul className="space-y-3">
                {review.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CORRECTIONS */}
          {review.corrections?.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
                <AlertIcon className="w-5 h-5" />
                Key Corrections & Adjustments
              </h2>
              <div className="space-y-4">
                {review.corrections.map((item, index) => (
                  <div key={index} className="border-l-2 border-indigo-500 pl-4 py-1 space-y-1">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Problem</p>
                    <p className="text-slate-300 text-sm">{item.problem}</p>
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-2">Recommended Correction</p>
                    <p className="text-slate-200 text-sm">{item.correction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WEAK ANSWERS */}
          {review.weakAnswers?.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-300">
                🎯 Answers to Refine
              </h2>
              <div className="space-y-4">
                {review.weakAnswers.map((item, index) => (
                  <div key={index} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                    <p className="font-semibold text-white text-sm">Q: {item.question}</p>
                    <p className="text-xs text-amber-400 font-medium">Why it was weak: <span className="text-slate-400 font-normal">{item.whyWeak}</span></p>
                    <p className="text-xs text-emerald-400 font-medium">Better approach: <span className="text-slate-300 font-normal">{item.betterApproach}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BETTER ANSWER EXAMPLE */}
          {review.betterAnswerExample && (
            <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-800/60 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-300">
                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                Sample Outstanding Answer
              </h2>
              <p className="text-slate-200 leading-relaxed text-sm italic">"{review.betterAnswerExample}"</p>
            </div>
          )}

          {/* NEXT STEPS */}
          {review.nextInterviewTips?.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold mb-3 text-white">🚀 Actionable Tips Before Your Real Interview</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {review.nextInterviewTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-semibold text-indigo-400">{index + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ENCOURAGEMENT */}
          {review.encouragement && (
            <div className="text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-slate-300 text-sm italic">
              "{review.encouragement}"
            </div>
          )}

          {/* BOTTOM BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={tryAgain}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshIcon className="w-5 h-5" />
              <span>Practice Another Session</span>
            </button>
            <button
              onClick={() => setScreen("home")}
              className="flex-1 bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-2xl font-bold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER: INTERVIEW SCREEN
  ========================= */

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-6 relative overflow-hidden font-sans flex flex-col justify-between selection:bg-indigo-500">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[160px] pointer-events-none rounded-full" />

      {/* TOP STATUS BAR */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-2 text-sm text-slate-400 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <BrandLogoIcon className="w-7 h-7" />
          <span className="font-bold text-white tracking-tight text-sm">Interviewly</span>
          <span className="text-slate-600">•</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-medium">
            {interviewData.jobTitle}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Question <strong className="text-white font-semibold">{questionNumber}</strong> of {TOTAL_QUESTIONS}
          </span>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mt-3">
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* MAIN CENTER INTERVIEW STAGE */}
      <main className="relative z-10 max-w-3xl mx-auto w-full my-auto flex flex-col items-center justify-center py-6">
        {/* INTERVIEW ORB */}
        <InterviewOrb status={interviewStatus} />

        {/* QUESTION DISPLAY CARD */}
        <div className="mt-8 text-center w-full">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">
            {interviewData.interviewType}
          </span>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-100 tracking-tight">
              {loadingQuestion ? (
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Generating interview question...
                </span>
              ) : (
                question
              )}
            </h1>
          </div>
        </div>

        {/* TRANSCRIPT CARD */}
        {answer && (
          <div className="mt-6 w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <MicIcon className="w-3.5 h-3.5" />
                Live Candidate Answer
              </span>
              {isListening && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{answer}</p>
          </div>
        )}

        {/* PAUSED BANNER */}
        {isPaused && (
          <div className="mt-6 w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-amber-200 text-sm backdrop-blur-md">
            <p className="font-semibold flex items-center justify-center gap-2">
              <PauseIcon className="w-4 h-4 text-amber-400" />
              Interview Paused
            </p>
            <p className="text-xs text-amber-300/80 mt-1">Take your time. Click continue whenever you're ready.</p>
          </div>
        )}

        {/* VOICE ERROR BANNER */}
        {voiceError && (
          <div className="mt-6 w-full rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-amber-200 text-xs backdrop-blur-md">
            <p className="font-semibold">⚠️ {voiceError}</p>
            <p className="text-slate-400 mt-1">You can click "Type instead" below to submit written answers.</p>
          </div>
        )}

        {/* AI ERROR BANNER */}
        {aiError && (
          <div className="mt-6 w-full rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-200 text-xs backdrop-blur-md">
            <p className="font-semibold">{aiError}</p>
          </div>
        )}
      </main>

      {/* BOTTOM CONTROLS DOCK */}
      <footer className="relative z-10 max-w-2xl mx-auto w-full pb-4">
        {textMode ? (
          /* TEXT MODE INPUT */
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-2xl">
            <textarea
              value={answer}
              onChange={(event) => {
                const value = event.target.value;
                setAnswer(value);
                transcriptRef.current = value;
              }}
              placeholder="Type your detailed answer here..."
              rows="4"
              disabled={isProcessingAnswer || isPaused}
              className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => submitAnswer(answer)}
                disabled={!answer.trim() || isProcessingAnswer || isSpeaking || isPaused}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-40 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>{questionNumber === TOTAL_QUESTIONS ? "Finish & Review" : "Submit Answer"}</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTextMode(false)}
                className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition"
              >
                Switch to Voice 🎙️
              </button>
            </div>
          </div>
        ) : (
          /* VOICE CONTROLS DOCK */
          <div className="flex flex-col items-center">
            {/* PAUSE / CONTINUE BUTTON */}
            <button
              onClick={isPaused ? resumeInterview : pauseInterview}
              disabled={isProcessingAnswer}
              className={`mb-4 px-5 py-2.5 rounded-full text-xs font-semibold transition border backdrop-blur-md flex items-center gap-2 ${
                isPaused
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30"
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800"
              } disabled:opacity-40`}
            >
              {isPaused ? (
                <>
                  <PlayIcon className="w-4 h-4 text-teal-400" />
                  <span>Resume Interview</span>
                </>
              ) : (
                <>
                  <PauseIcon className="w-4 h-4 text-amber-400" />
                  <span>Pause Interview</span>
                </>
              )}
            </button>

            {/* MAIN MIC BUTTON */}
            {!isPaused && (
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                disabled={isSpeaking || isProcessingAnswer}
                aria-label={isListening ? "Stop answering" : "Start answering"}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-2xl ${
                  isListening
                    ? "border-teal-400 bg-teal-500 text-white shadow-teal-500/40 scale-105"
                    : "border-indigo-500/40 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-indigo-600/40"
                } disabled:opacity-40`}
              >
                {isListening ? <MicOffIcon className="w-8 h-8 animate-pulse" /> : <MicIcon className="w-8 h-8" />}
              </button>
            )}

            {/* QUICK ACTIONS ROW */}
            <div className="mt-5 flex items-center justify-center gap-6 text-xs text-slate-400">
              <button
                onClick={repeatQuestion}
                disabled={isPaused || isProcessingAnswer}
                className="flex items-center gap-1.5 hover:text-white transition disabled:opacity-40"
              >
                <VolumeIcon className="w-4 h-4 text-indigo-400" />
                <span>Repeat Question</span>
              </button>

              <button
                onClick={() => {
                  stopListening();
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                  setTextMode(true);
                }}
                disabled={isPaused || isProcessingAnswer}
                className="flex items-center gap-1.5 hover:text-white transition disabled:opacity-40"
              >
                <EditIcon className="w-4 h-4 text-purple-400" />
                <span>Type Instead</span>
              </button>

              <button
                onClick={() => {
                  stopListening();
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                  setAnswer("");
                  transcriptRef.current = "";
                  setTextMode(true);
                }}
                disabled={isPaused || isProcessingAnswer}
                className="flex items-center gap-1.5 hover:text-white transition disabled:opacity-40"
              >
                <SkipIcon className="w-4 h-4 text-amber-400" />
                <span>Skip Question</span>
              </button>
            </div>
          </div>
        )}

        {/* END INTERVIEW */}
        <button
          onClick={() => {
            stopListening();
            window.speechSynthesis?.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
            setScreen("home");
          }}
          disabled={isProcessingAnswer}
          className="mx-auto mt-4 block text-xs text-slate-500 hover:text-red-400 transition disabled:opacity-40"
        >
          End Interview & Return Home
        </button>
      </footer>
    </div>
  );
}

export default App;
