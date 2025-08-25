import { useState, useEffect, useRef } from "react";

const AGENT_QUESTIONS = [
  {
    id: "preference",
    question: "Government vs private grants — any preference?",
    options: ["Government grants", "Private grants", "No preference"],
  },
  {
    id: "deadline",
    question: "Earliest acceptable deadline?",
    options: [
      "Within 1 month",
      "Within 3 months",
      "Within 6 months",
      "No rush",
    ],
  },
  {
    id: "eligibility",
    question: "Nonprofit or for-profit eligibility?",
    options: ["Nonprofit only", "For-profit only", "Either works"],
  },
];

export default function InterstitialQuestions({
  isVisible,
  onAnswer,
  answers = {},
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);

  const timersRef = useRef({
    typing: null,
    question: null,
    autoAdvance: null,
    nextQuestion: null,
  });

  const firstButtonRef = useRef(null);

  // Cleanup all timers
  const cleanupTimers = () => {
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = {
      typing: null,
      question: null,
      autoAdvance: null,
      nextQuestion: null,
    };
  };

  // Start the question sequence
  const startQuestionSequence = (questionIndex) => {
    if (!isVisible || questionIndex >= AGENT_QUESTIONS.length) return;

    setCurrentQuestionIndex(questionIndex);
    setShowQuestion(false);
    setWaitingForInput(false);

    // Show typing indicator
    setShowTyping(true);
    timersRef.current.typing = setTimeout(() => {
      setShowTyping(false);
      setShowQuestion(true);
      setWaitingForInput(true);

      // Auto-advance after 12s if no input
      timersRef.current.autoAdvance = setTimeout(() => {
        handleSkip();
      }, 12000);

      // Focus first button for accessibility
      setTimeout(() => {
        if (firstButtonRef.current) {
          firstButtonRef.current.focus();
        }
      }, 100);
    }, Math.random() * 300 + 600); // 600-900ms
  };

  useEffect(() => {
    if (!isVisible) {
      cleanupTimers();
      setCurrentQuestionIndex(-1);
      setShowQuestion(false);
      setShowTyping(false);
      setWaitingForInput(false);
      return;
    }

    // Start first question after initial delay
    timersRef.current.question = setTimeout(() => {
      startQuestionSequence(0);
    }, 1500);

    return cleanupTimers;
  }, [isVisible]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    if (!waitingForInput) return;

    // Clear auto-advance timer
    if (timersRef.current.autoAdvance) {
      clearTimeout(timersRef.current.autoAdvance);
      timersRef.current.autoAdvance = null;
    }

    setWaitingForInput(false);
    onAnswer(AGENT_QUESTIONS[currentQuestionIndex].id, answer);

    // Hide current question and start 5s delay for next
    setShowQuestion(false);

    if (currentQuestionIndex < AGENT_QUESTIONS.length - 1) {
      timersRef.current.nextQuestion = setTimeout(() => {
        startQuestionSequence(currentQuestionIndex + 1);
      }, 5000);
    }
  };

  // Handle skip
  const handleSkip = () => {
    if (!waitingForInput) return;

    // Clear auto-advance timer
    if (timersRef.current.autoAdvance) {
      clearTimeout(timersRef.current.autoAdvance);
      timersRef.current.autoAdvance = null;
    }

    setWaitingForInput(false);
    setShowQuestion(false);

    if (currentQuestionIndex < AGENT_QUESTIONS.length - 1) {
      timersRef.current.nextQuestion = setTimeout(() => {
        startQuestionSequence(currentQuestionIndex + 1);
      }, 5000);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  // Show typing indicator
  if (showTyping) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes typing-dots {
            0%,
            20% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }

          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }

          .typing-dots span {
            animation: typing-dots 1.4s infinite;
          }

          .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }

          .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }
        `}</style>
        <div className="bg-gradient-to-br from-slate-900/95 to-indigo-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">🤖</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Grant Finder Agent</h3>
              <p className="text-slate-400 text-sm typing-dots">
                thinking<span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showQuestion || currentQuestionIndex === -1) {
    return null;
  }

  const currentQuestion = AGENT_QUESTIONS[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <div className="bg-gradient-to-br from-slate-900/95 to-indigo-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
        {/* Agent avatar and header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">🤖</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Grant Finder Agent</h3>
              <p className="text-slate-400 text-sm">Quick clarification...</p>
            </div>
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            onKeyDown={(e) => handleKeyDown(e, handleSkip)}
            className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-slate-700/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            tabIndex={currentQuestion.options.length + 1}
          >
            Skip
          </button>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-white text-lg font-medium mb-4">
            {currentQuestion.question}
          </p>

          {/* Answer options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                ref={index === 0 ? firstButtonRef : null}
                onClick={() => handleAnswer(option)}
                onKeyDown={(e) => handleKeyDown(e, () => handleAnswer(option))}
                className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/30 hover:border-indigo-400/40 text-slate-200 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/60"
                tabIndex={index + 1}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Progress indicator and timing info */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {AGENT_QUESTIONS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentQuestionIndex
                    ? "bg-indigo-400 shadow-lg shadow-indigo-400/50"
                    : index < currentQuestionIndex
                    ? "bg-green-400"
                    : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <span className="text-slate-500 text-xs">
            {currentQuestionIndex + 1} of {AGENT_QUESTIONS.length}
          </span>
        </div>

        {/* Show current answers as small badges */}
        {Object.keys(answers).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-slate-400 text-xs mb-2">Your preferences:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(answers).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-400/30"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
