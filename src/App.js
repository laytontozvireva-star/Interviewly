import { useEffect, useRef, useState } from "react";

import {
  generateInterviewQuestion,
  generateFinalReview,
} from "./services/aiService";

import { speak, createSpeechRecognition } from "./services/voiceService";

import "./App.css";

const APP_NAME = "InterviewBuddy";
const TOTAL_QUESTIONS = 8;

// Candidate can pause for up to 5 seconds before
// InterviewBuddy automatically considers the answer finished.
const SILENCE_DELAY = 5000;

const SKIPPED_ANSWER = "(Skipped this question)";

/* =========================
   SHARED STYLES
========================= */

const fieldCls =
  "w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20";

const cardCls = "rounded-2xl border border-slate-800 bg-slate-900";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50";

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:opacity-50";

const linkBtn =
  "flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white focus:outline-none focus-visible:text-white disabled:opacity-40";

/* =========================
   ICONS
========================= */

function Icon({ className = "h-5 w-5", children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const MicIcon = (p) => (
  <Icon {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </Icon>
);

const PauseIcon = (p) => (
  <Icon {...p}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </Icon>
);

const PlayIcon = (p) => (
  <Icon {...p}>
    <polygon points="7 4 20 12 7 20 7 4" />
  </Icon>
);

const VolumeIcon = (p) => (
  <Icon {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </Icon>
);

const EditIcon = (p) => (
  <Icon {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);

const SkipIcon = (p) => (
  <Icon {...p}>
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </Icon>
);

const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

const RefreshIcon = (p) => (
  <Icon {...p}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </Icon>
);

const CheckIcon = (p) => (
  <Icon {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

const BriefcaseIcon = (p) => (
  <Icon {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

const DocumentIcon = (p) => (
  <Icon {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Icon>
);

const UserIcon = (p) => (
  <Icon {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const TrophyIcon = (p) => (
  <Icon {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </Icon>
);

const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

/* =========================
   BRAND
========================= */

function BrandLogoIcon({ className = "h-10 w-10" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#0B1329" />
      <circle cx="32" cy="32" r="22" fill="#0F3836" />
      <circle cx="32" cy="32" r="15.5" fill="none" stroke="#5EEAD4" strokeWidth="4.5" />
      <circle cx="32" cy="32" r="8" fill="#14B8A6" />
    </svg>
  );
}

function Wordmark({ large = false }) {
  return (
    <div className="flex items-center gap-3">
      <BrandLogoIcon className={large ? "h-10 w-10" : "h-7 w-7"} />
      <div className="text-left leading-tight">
        <span className={`block font-semibold tracking-tight text-white ${large ? "text-xl" : "text-sm"}`}>
          {APP_NAME}
        </span>
        {large && <span className="block text-xs text-slate-400">AI interview practice</span>}
      </div>
    </div>
  );
}

/* =========================
   JOB PRESETS FOR QUICK SETUP
========================= */

const JOB_PRESETS = [
  {
    title: "Full Stack Developer",
    description:
      "Build scalable web applications using React, Node.js, and SQL/NoSQL databases. Handle RESTful APIs and modern cloud architecture.",
    background:
      "Experienced developer with solid hands-on knowledge in React, Node.js, PostgreSQL, and Git version control.",
  },
  {
    title: "Frontend Engineer",
    description:
      "Craft responsive, accessible pixel-perfect UI components with React, TypeScript, and modern CSS design systems.",
    background:
      "Frontend specialist passionate about web accessibility, UI design, web performance optimization, and React.",
  },
  {
    title: "Product Manager",
    description:
      "Lead product strategy, user discovery, sprint planning, feature prioritization, and cross-functional team execution.",
    background:
      "Product lead skilled in user story mapping, Agile methodology, stakeholder communication, and product analytics.",
  },
  {
    title: "Data Analyst",
    description:
      "Analyze complex datasets, build business dashboards, write optimized SQL queries, and present data-driven recommendations.",
    background:
      "Analytical mindset proficient in SQL queries, Python (Pandas/NumPy), data visualization, and business analytics.",
  },
];

const INTERVIEW_TYPES = [
  { id: "General Interview", label: "General", desc: "Balanced Q&A" },
  { id: "Technical Interview", label: "Technical", desc: "Coding and architecture" },
  { id: "Behavioral Interview", label: "Behavioral", desc: "STAR method stories" },
  { id: "HR Interview", label: "HR", desc: "Background and culture" },
];

const NERVOUSNESS_LEVELS = [
  { level: "Low", label: "Confident" },
  { level: "Medium", label: "Moderate" },
  { level: "High", label: "Very nervous" },
];

/* =========================
   INTERVIEW STATUS ORB
========================= */

const ORB_STATES = {
  listening: {
    ring: "bg-teal-400/20",
    core: "bg-teal-400",
    tag: "border-teal-400/30 bg-teal-400/10 text-teal-300",
    dot: "bg-teal-400",
    label: "Listening. Speak naturally.",
  },
  speaking: {
    ring: "bg-indigo-400/20",
    core: "bg-indigo-400",
    tag: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
    dot: "bg-indigo-400",
    label: `${APP_NAME} is speaking…`,
  },
  thinking: {
    ring: "bg-slate-500/20",
    core: "bg-slate-400",
    tag: "border-slate-600 bg-slate-800 text-slate-300",
    dot: "bg-slate-400",
    label: `${APP_NAME} is thinking…`,
  },
  paused: {
    ring: "bg-amber-400/15",
    core: "bg-amber-400",
    tag: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    dot: "bg-amber-400",
    label: "Interview paused",
  },
  idle: {
    ring: "bg-slate-700/40",
    core: "bg-slate-600",
    tag: "border-slate-700 bg-slate-800 text-slate-300",
    dot: "bg-slate-500",
    label: "Ready when you are",
  },
};

function InterviewOrb({ status }) {
  const current = ORB_STATES[status] || ORB_STATES.idle;
  const showBars = status === "listening" || status === "speaking";
  const barHeights = ["h-5", "h-8", "h-11", "h-7", "h-9"];

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <span
          className={`absolute inset-0 rounded-full transition-colors duration-500 motion-reduce:animate-none ${current.ring} ${
            status === "listening" ? "animate-ping" : status === "speaking" ? "animate-pulse" : ""
          }`}
        />
        <span className="absolute inset-5 rounded-full border border-slate-800 bg-slate-900" />

        {status === "thinking" && (
          <span className="absolute inset-3 rounded-full border-2 border-slate-700 border-t-slate-300 animate-spin motion-reduce:animate-none" />
        )}

        <span className={`relative h-20 w-20 rounded-full transition-colors duration-500 ${current.core}`} />

        {showBars && (
          <span className="pointer-events-none absolute flex items-center justify-center gap-1">
            {barHeights.map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-slate-950/80 animate-bounce motion-reduce:animate-none ${h}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
      </div>

      <div
        className={`mt-4 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-300 ${current.tag}`}
        aria-live="polite"
      >
        <span className={`h-2 w-2 rounded-full ${current.dot}`} />
        {current.label}
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
  const [aiError, setAiError] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [retryAnswer, setRetryAnswer] = useState("");

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
     Speech callbacks outlive the render that created them, so anything
     they read must live in a ref, not in state.
  ========================= */

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef("");
  const shouldKeepListeningRef = useRef(false);
  const submittingAnswerRef = useRef(false);
  const pausedRef = useRef(false);
  const textModeRef = useRef(false);
  const speakTokenRef = useRef(0);

  // Always point at the newest version of these functions.
  const startListeningRef = useRef(() => {});
  const submitAnswerRef = useRef(() => {});

  pausedRef.current = isPaused;
  textModeRef.current = textMode;

  /* =========================
     COMPUTED STATUS
  ========================= */

  let interviewStatus = "idle";
  if (isPaused) interviewStatus = "paused";
  else if (isSpeaking) interviewStatus = "speaking";
  else if (isListening) interviewStatus = "listening";
  else if (isProcessingAnswer) interviewStatus = "thinking";

  const finishingInterview = isProcessingAnswer && questionNumber >= TOTAL_QUESTIONS;

  /* =========================
     CLEANUP ON UNMOUNT
  ========================= */

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {
        /* already stopped */
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* =========================
     UPDATE SETUP DATA
  ========================= */

  function handleChange(event) {
    const { name, value } = event.target;
    setInterviewData((previous) => ({ ...previous, [name]: value }));
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
     SPEECH HELPERS
  ========================= */

  function cancelSpeech() {
    speakTokenRef.current += 1; // invalidates any pending "finished speaking" callback
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  function stopListening() {
    shouldKeepListeningRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
    }

    recognitionRef.current = null;
    setIsListening(false);
  }

  function resetTranscript() {
    transcriptRef.current = "";
    setAnswer("");
  }

  /* =========================
     FINISH VOICE ANSWER
  ========================= */

  function finishVoiceAnswer() {
    if (pausedRef.current || submittingAnswerRef.current) return;

    const finalAnswer = transcriptRef.current.trim();
    stopListening();

    if (!finalAnswer) return;

    setAnswer(finalAnswer);
    submitAnswerRef.current(finalAnswer);
  }

  /* =========================
     START MICROPHONE
  ========================= */

  function startListening() {
    if (submittingAnswerRef.current || pausedRef.current || recognitionRef.current) {
      return;
    }

    setVoiceError("");
    shouldKeepListeningRef.current = true;

    let instance = null;

    const recognition = createSpeechRecognition({
      onStart: () => {
        setIsListening(true);
      },

      onResult: ({ finalTranscript, interimTranscript }) => {
        if (recognitionRef.current !== instance) return;
        if (!shouldKeepListeningRef.current || pausedRef.current) return;

        if (finalTranscript) {
          transcriptRef.current = `${transcriptRef.current} ${finalTranscript}`.trim();
        }

        setAnswer(`${transcriptRef.current} ${interimTranscript}`.trim());

        clearTimeout(silenceTimerRef.current);

        if (transcriptRef.current.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            finishVoiceAnswer();
          }, SILENCE_DELAY);
        }
      },

      onEnd: () => {
        // Ignore "end" events from a recognizer we already replaced or stopped.
        if (recognitionRef.current !== instance) return;

        recognitionRef.current = null;
        setIsListening(false);

        if (!shouldKeepListeningRef.current || pausedRef.current) return;

        // Chrome ends recognition on its own now and then; quietly restart it.
        setTimeout(() => {
          if (shouldKeepListeningRef.current && !recognitionRef.current && !pausedRef.current) {
            startListeningRef.current();
          }
        }, 300);
      },

      onError: (error) => {
        if (recognitionRef.current !== instance) return;

        console.error("Voice recognition error:", error);
        recognitionRef.current = null;
        setIsListening(false);

        if (error === "no-speech") {
          setTimeout(() => {
            if (shouldKeepListeningRef.current && !recognitionRef.current && !pausedRef.current) {
              startListeningRef.current();
            }
          }, 500);
          return;
        }

        shouldKeepListeningRef.current = false;
        clearTimeout(silenceTimerRef.current);

        if (error === "not-allowed") {
          setVoiceError("Microphone permission was denied. Allow microphone access in your browser, or type your answer.");
        } else if (error === "audio-capture") {
          setVoiceError("No microphone was detected. Check your microphone, or type your answer.");
        } else {
          setVoiceError("There was a problem with voice input. You can type your answer instead.");
        }
      },
    });

    if (!recognition) {
      shouldKeepListeningRef.current = false;
      setVoiceError("Voice input is not supported in this browser. Use Google Chrome, or type your answer instead.");
      return;
    }

    instance = recognition;
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start recognition:", error);
      recognitionRef.current = null;
      shouldKeepListeningRef.current = false;
      setIsListening(false);
    }
  }

  /* =========================
     SPEAK QUESTION
  ========================= */

  function speakQuestion(questionText) {
    setVoiceError("");
    stopListening();
    window.speechSynthesis?.cancel();

    speakTokenRef.current += 1;
    const token = speakTokenRef.current;
    setIsSpeaking(true);

    speak(questionText, () => {
      if (token !== speakTokenRef.current) return; // a newer question took over

      setIsSpeaking(false);
      setTimeout(() => {
        if (!pausedRef.current && !textModeRef.current) {
          startListeningRef.current();
        }
      }, 700);
    });
  }

  /* =========================
     PAUSE / RESUME
  ========================= */

  function pauseInterview() {
    if (pausedRef.current) return;

    pausedRef.current = true;
    setIsPaused(true);
    stopListening();
    cancelSpeech();
  }

  function resumeInterview() {
    if (!pausedRef.current) return;

    pausedRef.current = false;
    setIsPaused(false);
    setVoiceError("");

    if (!textModeRef.current) {
      setTimeout(() => startListeningRef.current(), 300);
    }
  }

  /* =========================
     REPEAT QUESTION
  ========================= */

  function repeatQuestion() {
    if (!question || pausedRef.current) return;

    stopListening();
    cancelSpeech();
    setTimeout(() => speakQuestion(question), 200);
  }

  /* =========================
     MIC BUTTON
  ========================= */

  function handleMicClick() {
    if (isListening) {
      // A second tap means "I'm done, send it".
      finishVoiceAnswer();
    } else {
      startListening();
    }
  }

  /* =========================
     START INTERVIEW
  ========================= */

  async function startInterview() {
    if (!interviewData.jobTitle.trim()) {
      setAiError("Enter the job title first.");
      return;
    }

    setAiError("");
    setVoiceError("");
    setRetryAnswer("");
    setLoadingQuestion(true);
    setQuestion("");
    setInterview([]);
    setQuestionNumber(1);
    setReview(null);
    setIsPaused(false);
    pausedRef.current = false;
    setTextMode(false);
    textModeRef.current = false;
    submittingAnswerRef.current = false;
    resetTranscript();

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

      setTimeout(() => speakQuestion(firstQuestion), 500);
    } catch (error) {
      console.error(error);
      setQuestionNumber(0);
      setAiError(error.message || "Could not start the interview.");
    } finally {
      setLoadingQuestion(false);
    }
  }

  /* =========================
     SUBMIT ANSWER
  ========================= */

  async function submitAnswer(answerText = answer) {
    const cleanAnswer = answerText?.trim();

    if (!cleanAnswer || pausedRef.current || submittingAnswerRef.current) return;

    submittingAnswerRef.current = true;
    stopListening();
    cancelSpeech();
    setIsProcessingAnswer(true);
    setAiError("");
    setVoiceError("");
    setRetryAnswer("");

    const currentInterview = [...interview, { question, answer: cleanAnswer }];
    const isLastQuestion = questionNumber >= TOTAL_QUESTIONS;

    try {
      if (isLastQuestion) {
        const finalReview = await generateFinalReview({
          jobTitle: interviewData.jobTitle,
          jobDescription: interviewData.jobDescription,
          candidateBackground: interviewData.candidateBackground,
          interviewType: interviewData.interviewType,
          interview: currentInterview,
          previousScore: previousReview?.overallScore || null,
        });

        setInterview(currentInterview);
        setReview(finalReview);
        setPreviousReview(finalReview);
        setScreen("review");

        setTimeout(() => {
          speak(`Your interview is complete. Your overall score is ${finalReview.overallScore} out of 100.`);
        }, 500);
      } else {
        const nextNumber = questionNumber + 1;
        setLoadingQuestion(true);

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

        setInterview(currentInterview);
        resetTranscript();
        setQuestion(nextQuestion);
        setQuestionNumber(nextNumber);

        setTimeout(() => speakQuestion(nextQuestion), 500);
      }
    } catch (error) {
      console.error("Submit answer error:", error);
      setRetryAnswer(cleanAnswer);
      setAiError(
        isLastQuestion
          ? `The interview finished, but ${APP_NAME} could not create your review.`
          : error.message || "Could not generate the next question."
      );
    } finally {
      setLoadingQuestion(false);
      setIsProcessingAnswer(false);
      submittingAnswerRef.current = false;
    }
  }

  startListeningRef.current = startListening;
  submitAnswerRef.current = submitAnswer;

  /* =========================
     SKIP / END / TRY AGAIN
  ========================= */

  function skipQuestion() {
    submitAnswer(SKIPPED_ANSWER);
  }

  function endInterview() {
    if (!window.confirm("End this interview? Your progress will be lost.")) return;

    stopListening();
    cancelSpeech();
    setIsPaused(false);
    pausedRef.current = false;
    setIsProcessingAnswer(false);
    setAiError("");
    setVoiceError("");
    setRetryAnswer("");
    setScreen("home");
  }

  function tryAgain() {
    stopListening();
    cancelSpeech();
    setIsProcessingAnswer(false);
    setIsPaused(false);
    pausedRef.current = false;
    setTextMode(false);
    textModeRef.current = false;
    resetTranscript();
    setQuestion("");
    setInterview([]);
    setQuestionNumber(0);
    setReview(null);
    setAiError("");
    setVoiceError("");
    setRetryAnswer("");
    submittingAnswerRef.current = false;
    setScreen("setup");
  }

  function switchToTextMode() {
    stopListening();
    cancelSpeech();
    setTextMode(true);
  }

  /* =========================
     RENDER: HOME SCREEN
  ========================= */

  if (screen === "home") {
    const features = [
      {
        icon: <LockIcon className="h-5 w-5" />,
        title: "Private and local",
        text: "Runs on Ollama on your own computer. No API keys, no subscription, and your answers stay with you.",
      },
      {
        icon: <MicIcon className="h-5 w-5" />,
        title: "Natural voice mode",
        text: "Speak like a real phone call. Your answer is sent automatically when you stop talking.",
      },
      {
        icon: <TrophyIcon className="h-5 w-5" />,
        title: "Detailed scorecard",
        text: "Get feedback on communication, technical depth, confidence, and relevance, plus a sample answer.",
      },
    ];

    return (
      <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-white selection:bg-teal-400 selection:text-slate-950">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Wordmark large />
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            Local AI · Gemma
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <InterviewOrb status="idle" />

          <h1 className="mt-10 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Master your real interview confidence
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Have a realistic voice conversation with an AI interviewer that runs privately on your computer.
          </p>

          <button
            onClick={() => {
              setScreen("setup");
              setAiError("");
            }}
            className={`${primaryBtn} mt-9 px-8 py-4 text-base`}
          >
            Start practice interview
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="mt-16 grid w-full max-w-3xl gap-4 text-left sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className={`${cardCls} p-5`}>
                <div className="mb-3 w-fit rounded-lg bg-teal-400/10 p-2.5 text-teal-300">{f.icon}</div>
                <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.text}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="mx-auto w-full max-w-6xl border-t border-slate-900 px-6 py-6 text-center text-xs text-slate-500">
          {APP_NAME} · Powered by Gemma, running locally
        </footer>
      </div>
    );
  }

  /* =========================
     RENDER: SETUP SCREEN
  ========================= */

  if (screen === "setup") {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 font-sans text-white">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => setScreen("home")}
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to home
          </button>

          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-teal-300">
              <BriefcaseIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Interview setup</h1>
              <p className="mt-1 text-sm text-slate-400">
                Tell {APP_NAME} about the role so the questions fit.
              </p>
            </div>
          </div>

          <div className={`${cardCls} space-y-7 p-8`}>
            {/* Quick presets */}
            <div>
              <p className="mb-2.5 text-sm font-medium text-slate-300">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {JOB_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-teal-400 hover:text-teal-300"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Job title */}
            <div>
              <label htmlFor="jobTitle" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <BriefcaseIcon className="h-4 w-4 text-teal-300" />
                Job title <span className="text-teal-300">*</span>
              </label>
              <input
                id="jobTitle"
                type="text"
                name="jobTitle"
                value={interviewData.jobTitle}
                onChange={handleChange}
                placeholder="Full Stack Developer"
                className={fieldCls}
              />
            </div>

            {/* Job description */}
            <div>
              <label htmlFor="jobDescription" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <DocumentIcon className="h-4 w-4 text-teal-300" />
                Job description <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={interviewData.jobDescription}
                onChange={handleChange}
                placeholder="Paste the key responsibilities or requirements from the job posting"
                rows="4"
                className={`${fieldCls} resize-none`}
              />
            </div>

            {/* Background */}
            <div>
              <label htmlFor="candidateBackground" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <UserIcon className="h-4 w-4 text-teal-300" />
                Your background <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="candidateBackground"
                name="candidateBackground"
                value={interviewData.candidateBackground}
                onChange={handleChange}
                placeholder="Your skills, projects, years of experience, or main technologies"
                rows="3"
                className={`${fieldCls} resize-none`}
              />
            </div>

            {/* Interview type */}
            <div>
              <p className="mb-3 text-sm font-medium text-slate-200">Interview type</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {INTERVIEW_TYPES.map((type) => {
                  const selected = interviewData.interviewType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setInterviewData((prev) => ({ ...prev, interviewType: type.id }))}
                      className={`rounded-xl border p-3.5 text-left transition ${
                        selected
                          ? "border-teal-400 bg-teal-400/10 text-white"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div className="mb-0.5 text-sm font-semibold text-white">{type.label}</div>
                      <div className="text-xs text-slate-400">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nervousness */}
            <div>
              <p className="mb-1 text-sm font-medium text-slate-200">How nervous are you?</p>
              <p className="mb-3 text-xs text-slate-500">{APP_NAME} adjusts its pace and tone to match.</p>
              <div className="grid grid-cols-3 gap-3">
                {NERVOUSNESS_LEVELS.map((item) => {
                  const selected = interviewData.nervousness === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setInterviewData((prev) => ({ ...prev, nervousness: item.level }))}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        selected
                          ? "border-teal-400 bg-teal-400/10 text-white"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
              <LockIcon className="h-5 w-5 shrink-0 text-teal-300" />
              <span>Your data stays on your machine. Powered by Ollama and the open-weight Gemma model.</span>
            </div>

            {/* Error */}
            {aiError && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-900 bg-red-950/60 p-4 text-sm text-red-200">
                <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <p>{aiError}</p>
              </div>
            )}

            <button onClick={startInterview} disabled={loadingQuestion} className={`${primaryBtn} w-full`}>
              {loadingQuestion ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Preparing your questions…
                </>
              ) : (
                <>
                  Begin practice session
                  <ChevronRightIcon className="h-5 w-5" />
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
    const scoreTone =
      review.overallScore >= 80
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
        : review.overallScore >= 60
        ? "border-teal-400/30 bg-teal-400/10 text-teal-300"
        : "border-amber-400/30 bg-amber-400/10 text-amber-300";

    const scoreLabel =
      review.overallScore >= 80
        ? "Exceptional performance"
        : review.overallScore >= 60
        ? "Solid performance"
        : "Great start, room to grow";

    const metrics = [
      { title: "Communication", score: review.communicationScore },
      { title: "Technical", score: review.technicalScore },
      { title: "Confidence", score: review.confidenceScore },
      { title: "Relevance", score: review.relevanceScore },
    ];

    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 font-sans text-white">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-2xl border border-slate-800 bg-slate-900 p-3 text-teal-300">
              <TrophyIcon className="h-8 w-8" />
            </div>
            <p className="mb-1 text-sm font-medium text-teal-300">Interview complete</p>
            <h1 className="text-4xl font-semibold tracking-tight">Your scorecard</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
              Your {APP_NAME} review for the <strong className="text-slate-200">{interviewData.jobTitle}</strong> practice interview.
            </p>
          </div>

          {/* Overall score */}
          <div className={`${cardCls} p-8 text-center`}>
            <p className="mb-3 text-sm text-slate-400">Overall score</p>
            <div className="inline-flex items-baseline justify-center gap-1">
              <span className="text-7xl font-semibold tracking-tight text-white">{review.overallScore}</span>
              <span className="text-2xl text-slate-500">/ 100</span>
            </div>
            <div className={`mx-auto mt-4 w-fit rounded-full border px-4 py-1.5 text-xs font-medium ${scoreTone}`}>
              {scoreLabel}
            </div>
          </div>

          {/* Category scores */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.title} className={`${cardCls} p-5 text-center`}>
                <p className="text-xs text-slate-400">{metric.title}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{metric.score}</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-400"
                    style={{ width: `${Math.min(100, Math.max(0, metric.score || 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={`${cardCls} p-6`}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <DocumentIcon className="h-5 w-5 text-teal-300" />
              Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">{review.summary}</p>
          </div>

          {/* Strengths */}
          {review.strengths?.length > 0 && (
            <div className={`${cardCls} p-6`}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-300">
                <CheckIcon className="h-5 w-5" />
                Key strengths
              </h2>
              <ul className="space-y-3">
                {review.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 rounded-full bg-emerald-400/15 p-1 text-emerald-300">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Corrections */}
          {review.corrections?.length > 0 && (
            <div className={`${cardCls} p-6`}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-300">
                <AlertIcon className="h-5 w-5" />
                Corrections and adjustments
              </h2>
              <div className="space-y-4">
                {review.corrections.map((item, index) => (
                  <div key={index} className="space-y-1 border-l-2 border-teal-400 py-1 pl-4">
                    <p className="text-xs font-medium text-red-300">Problem</p>
                    <p className="text-sm text-slate-300">{item.problem}</p>
                    <p className="mt-2 text-xs font-medium text-emerald-300">Recommended correction</p>
                    <p className="text-sm text-slate-200">{item.correction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak answers */}
          {review.weakAnswers?.length > 0 && (
            <div className={`${cardCls} p-6`}>
              <h2 className="mb-4 text-lg font-semibold text-white">Answers to refine</h2>
              <div className="space-y-4">
                {review.weakAnswers.map((item, index) => (
                  <div key={index} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-5">
                    <p className="text-sm font-semibold text-white">Q: {item.question}</p>
                    <p className="text-xs font-medium text-amber-300">
                      Why it was weak: <span className="font-normal text-slate-400">{item.whyWeak}</span>
                    </p>
                    <p className="text-xs font-medium text-emerald-300">
                      Better approach: <span className="font-normal text-slate-300">{item.betterApproach}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Better answer example */}
          {review.betterAnswerExample && (
            <div className="rounded-2xl border border-teal-400/30 bg-teal-400/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-teal-300">Sample strong answer</h2>
              <p className="text-sm italic leading-relaxed text-slate-200">"{review.betterAnswerExample}"</p>
            </div>
          )}

          {/* Next steps */}
          {review.nextInterviewTips?.length > 0 && (
            <div className={`${cardCls} p-6`}>
              <h2 className="mb-3 text-lg font-semibold text-white">Tips before your real interview</h2>
              <ol className="space-y-2 text-sm text-slate-300">
                {review.nextInterviewTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-semibold text-teal-300">{index + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Encouragement */}
          {review.encouragement && (
            <div className="rounded-2xl border border-slate-800 p-6 text-center text-sm italic text-slate-300">
              "{review.encouragement}"
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <button onClick={tryAgain} className={`${primaryBtn} flex-1`}>
              <RefreshIcon className="h-5 w-5" />
              Practice another session
            </button>
            <button onClick={() => setScreen("home")} className={`${secondaryBtn} flex-1`}>
              <HomeIcon className="h-5 w-5" />
              Return home
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
    <div className="flex min-h-screen flex-col justify-between bg-slate-950 px-6 py-6 font-sans text-white selection:bg-teal-400 selection:text-slate-950">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between border-b border-slate-800 py-2 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="text-slate-700">/</span>
          <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300">
            {interviewData.jobTitle}
          </span>
        </div>
        <span className="text-xs">
          Question <strong className="font-semibold text-white">{questionNumber}</strong> of {TOTAL_QUESTIONS}
        </span>
      </header>

      {/* Progress */}
      <div className="mx-auto mt-3 w-full max-w-4xl">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_QUESTIONS}
          aria-valuenow={questionNumber}
        >
          <div
            className="h-full rounded-full bg-teal-400 transition-all duration-500"
            style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Stage */}
      <main className="mx-auto my-auto flex w-full max-w-3xl flex-col items-center justify-center py-6">
        <InterviewOrb status={interviewStatus} />

        <div className="mt-8 w-full text-center">
          <p className="mb-3 text-xs font-medium text-slate-400">{interviewData.interviewType}</p>

          <div className={`${cardCls} p-8`}>
            <h1 className="text-xl font-medium leading-relaxed tracking-tight text-slate-100 md:text-2xl">
              {loadingQuestion ? (
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                  Generating the next question…
                </span>
              ) : finishingInterview ? (
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                  Preparing your review…
                </span>
              ) : (
                question
              )}
            </h1>
          </div>
        </div>

        {/* Live answer */}
        {answer && (
          <div className={`${cardCls} mt-6 w-full p-5`}>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-teal-300">
                <MicIcon className="h-3.5 w-3.5" />
                Your answer
              </span>
              {isListening && <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />}
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{answer}</p>
          </div>
        )}

        {isPaused && (
          <div className="mt-6 w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-center text-sm text-amber-200">
            <p className="flex items-center justify-center gap-2 font-semibold">
              <PauseIcon className="h-4 w-4" />
              Interview paused
            </p>
            <p className="mt-1 text-xs text-amber-200/80">Take your time. Resume whenever you are ready.</p>
          </div>
        )}

        {voiceError && (
          <div role="alert" className="mt-6 w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-center text-xs text-amber-200">
            <p className="font-medium">{voiceError}</p>
            <p className="mt-1 text-slate-400">Choose "Type instead" below to write your answer.</p>
          </div>
        )}

        {aiError && (
          <div role="alert" className="mt-6 flex w-full flex-col items-center gap-3 rounded-2xl border border-red-900 bg-red-950/60 p-4 text-center text-xs text-red-200">
            <p className="font-medium">{aiError}</p>
            {retryAnswer && (
              <button
                onClick={() => submitAnswer(retryAnswer)}
                disabled={isProcessingAnswer}
                className="rounded-lg border border-red-800 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-900/60 disabled:opacity-50"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </main>

      {/* Controls */}
      <footer className="mx-auto w-full max-w-2xl pb-4">
        {textMode ? (
          <div className={`${cardCls} p-4`}>
            <label htmlFor="typedAnswer" className="sr-only">
              Your answer
            </label>
            <textarea
              id="typedAnswer"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                transcriptRef.current = event.target.value;
              }}
              placeholder="Type your answer here"
              rows="4"
              disabled={isProcessingAnswer}
              className={`${fieldCls} resize-none disabled:opacity-50`}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => submitAnswer(answer)}
                disabled={!answer.trim() || isProcessingAnswer}
                className={`${primaryBtn} flex-1 py-3`}
              >
                {questionNumber === TOTAL_QUESTIONS ? "Finish and review" : "Submit answer"}
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setTextMode(false)} className={`${secondaryBtn} py-3`}>
                <MicIcon className="h-4 w-4" />
                Use voice
              </button>
              <button onClick={skipQuestion} disabled={isProcessingAnswer} className={linkBtn}>
                <SkipIcon className="h-4 w-4" />
                Skip question
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {isPaused ? (
              <button onClick={resumeInterview} className={primaryBtn}>
                <PlayIcon className="h-4 w-4" />
                Resume interview
              </button>
            ) : (
              <>
                <button
                  onClick={handleMicClick}
                  disabled={isSpeaking || isProcessingAnswer}
                  aria-label={isListening ? "Finish and send answer" : "Start answering"}
                  className={`flex h-20 w-20 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-40 ${
                    isListening
                      ? "bg-teal-400 text-slate-950 hover:bg-teal-300"
                      : "border border-slate-700 bg-slate-900 text-white hover:border-slate-500"
                  }`}
                >
                  {isListening ? <CheckIcon className="h-8 w-8" /> : <MicIcon className="h-8 w-8" />}
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  {isListening
                    ? `Tap to send your answer, or pause for ${SILENCE_DELAY / 1000} seconds.`
                    : "Tap the mic to answer."}
                </p>
              </>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button onClick={repeatQuestion} disabled={isPaused || isProcessingAnswer} className={linkBtn}>
                <VolumeIcon className="h-4 w-4" />
                Repeat question
              </button>
              <button onClick={switchToTextMode} disabled={isProcessingAnswer} className={linkBtn}>
                <EditIcon className="h-4 w-4" />
                Type instead
              </button>
              <button onClick={skipQuestion} disabled={isPaused || isProcessingAnswer} className={linkBtn}>
                <SkipIcon className="h-4 w-4" />
                Skip question
              </button>
              {!isPaused && (
                <button onClick={pauseInterview} disabled={isProcessingAnswer} className={linkBtn}>
                  <PauseIcon className="h-4 w-4" />
                  Pause
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={endInterview}
          disabled={isProcessingAnswer}
          className="mx-auto mt-5 block text-xs text-slate-500 transition hover:text-red-400 disabled:opacity-40"
        >
          End interview and return home
        </button>
      </footer>
    </div>
  );
}

export default App;