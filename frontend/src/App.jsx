import { useState, useEffect } from "react";
import Home from "./components/Home";
import GrantFinderForm from "./components/GrantFinderForm";
import GrantCards from "./components/GrantCards";
import ClarificationModal from "./components/ClarificationModal";
import InterstitialQuestions from "./components/InterstitialQuestions";
import "./App.css";

function App() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFilters, setLastFilters] = useState(null);
  const [currentView, setCurrentView] = useState("home"); // 'home', 'search', 'history', 'email'
  const [agentProgress, setAgentProgress] = useState({
    currentStep: 0,
    steps: [
      "Parse Inputs",
      "Query Sources",
      "Filter Results",
      "Validate Data",
      "Rank Matches",
      "Deliver Results",
    ],
    isActive: false,
  });
  const [clarification, setClarification] = useState(null);
  const [originalQuery, setOriginalQuery] = useState(null);
  const [clarificationLoading, setClarificationLoading] = useState(false);
  const [interstitialAnswers, setInterstitialAnswers] = useState({});
  const [showInterstitialQuestions, setShowInterstitialQuestions] =
    useState(false);
  const [emailDigestSent, setEmailDigestSent] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setClarification(null);
    setOriginalQuery(formData);
    setAgentProgress((prev) => ({ ...prev, isActive: true, currentStep: 0 }));
    setShowInterstitialQuestions(true);
    setInterstitialAnswers({});
    setEmailDigestSent(false);

    // Use real agent steps from backend
    const agentSteps = [
      "Parsing user criteria",
      "Searching grant databases",
      "Filtering by eligibility",
      "Validating grant details",
      "Ranking by relevance",
      "Preparing recommendations",
    ];

    // Simulate agent progress
    const progressInterval = setInterval(() => {
      setAgentProgress((prev) => {
        if (prev.currentStep < agentSteps.length - 1) {
          return {
            ...prev,
            currentStep: prev.currentStep + 1,
            steps: agentSteps,
          };
        }
        clearInterval(progressInterval);
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch("http://localhost:5000/process-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch grants");
      }

      const data = await response.json();

      // Check if agent needs clarification
      if (data.clarification && data.clarification.needed) {
        setClarification(data.clarification);
        setGrants([]); // Clear previous results
      } else {
        setGrants(data.grants || []);
        setLastFilters(formData);

        // Save search to history
        const searchHistory = JSON.parse(
          localStorage.getItem("searchHistory") || "[]"
        );
        const newSearch = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          filters: formData,
          resultsCount: data.grants?.length || 0,
        };
        searchHistory.unshift(newSearch);
        localStorage.setItem(
          "searchHistory",
          JSON.stringify(searchHistory.slice(0, 10))
        );

        // Auto-send email digest for first successful render
        if (data.grants && data.grants.length > 0) {
          setTimeout(() => {
            sendAutoEmailDigest(data.grants, formData);
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Grant search failed:", err);
      const friendlyError = err.message.includes("fetch")
        ? "Unable to connect to our grant database. Please check your internet connection and try again."
        : err.message.includes("timeout")
        ? "The search is taking longer than expected. Please try a simpler search or try again later."
        : `Search failed: ${err.message}. Please try again or contact support if the problem persists.`;
      setError(friendlyError);
      clearInterval(progressInterval);
    } finally {
      setLoading(false);
      setShowInterstitialQuestions(false);
      setTimeout(() => {
        setAgentProgress((prev) => ({ ...prev, isActive: false }));
      }, 1000);
    }
  };

  const handleClarificationChoice = async (choice) => {
    setClarificationLoading(true);
    setClarification(null);

    try {
      const response = await fetch("http://localhost:5000/clarify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_query: originalQuery,
          clarification_choice: choice,
          mode: originalQuery?.mode || "form",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process clarification");
      }

      const data = await response.json();
      setGrants(data.grants || []);
      setLastFilters(originalQuery);

      // Save refined search to history
      const searchHistory = JSON.parse(
        localStorage.getItem("searchHistory") || "[]"
      );
      const newSearch = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filters: { ...originalQuery, clarification: choice },
        resultsCount: data.grants?.length || 0,
      };
      searchHistory.unshift(newSearch);
      localStorage.setItem(
        "searchHistory",
        JSON.stringify(searchHistory.slice(0, 10))
      );

      // Auto-send email digest for clarification results
      if (data.grants && data.grants.length > 0) {
        setTimeout(() => {
          sendAutoEmailDigest(data.grants, originalQuery);
        }, 1000);
      }
    } catch (err) {
      console.error("Clarification failed:", err);
      const friendlyError = err.message.includes("fetch")
        ? "Unable to process your clarification. Please check your connection and try again."
        : `Clarification failed: ${err.message}. Please try again.`;
      setError(friendlyError);
    } finally {
      setClarificationLoading(false);
    }
  };

  const handleClarificationCancel = () => {
    setClarification(null);
    setClarificationLoading(false);
  };

  const handleInterstitialAnswer = (questionId, answer) => {
    setInterstitialAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const sendAutoEmailDigest = async (grants, filters) => {
    if (emailDigestSent || !grants || grants.length === 0) {
      return;
    }

    // Prevent multiple sends immediately
    setEmailDigestSent(true);

    try {
      // Get email from environment or use fallback
      const recipientEmail =
        process.env.REACT_APP_DEFAULT_EMAIL || "rishabhrajpathak06@gmail.com";

      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recipientEmail,
          grants: grants,
          filters: filters,
        }),
      });

      if (response.ok) {
        console.log("📧 Email digest sent automatically");
      } else {
        // Reset flag if send failed
        setEmailDigestSent(false);
      }
    } catch (error) {
      console.error("Failed to send auto email digest:", error);
      // Reset flag if send failed
      setEmailDigestSent(false);
    }
  };

  const handleGetStarted = () => {
    setCurrentView("search");
  };

  const handleReset = () => {
    setGrants([]);
    setError(null);
    setClarification(null);
    setOriginalQuery(null);
    setAgentProgress((prev) => ({ ...prev, isActive: false, currentStep: 0 }));
  };

  const renderSavedGrants = () => {
    const savedGrants = JSON.parse(localStorage.getItem("savedGrants") || "[]");

    // Calculate deadline reminders
    const now = new Date();
    const upcomingDeadlines = savedGrants
      .filter((grant) => {
        if (!grant.deadline) return false;
        const deadline = new Date(grant.deadline);
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 30; // Next 30 days
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Saved Grants</h2>
          <div className="text-sm text-gray-500">
            ⭐ {savedGrants.length} saved grant
            {savedGrants.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Deadline Reminders */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800 mb-3 flex items-center">
              ⚠️ Upcoming Deadlines
            </h3>
            <div className="space-y-2">
              {upcomingDeadlines.map((grant) => {
                const deadline = new Date(grant.deadline);
                const daysUntil = Math.ceil(
                  (deadline - now) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={grant.id}
                    className="flex items-center justify-between p-3 bg-white rounded border border-yellow-300"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{grant.title}</p>
                      <p className="text-sm text-gray-600">
                        Deadline: {deadline.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          daysUntil <= 7
                            ? "bg-red-100 text-red-800"
                            : daysUntil <= 14
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {daysUntil} day{daysUntil !== 1 ? "s" : ""} left
                      </span>
                      <a
                        href={grant.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Apply →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {savedGrants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-lg mb-2">No saved grants yet</p>
            <p className="text-sm">
              Save grants from search results to track deadlines and build your
              application list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {savedGrants.map((grant) => {
              const deadline = grant.deadline ? new Date(grant.deadline) : null;
              const daysUntil = deadline
                ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={grant.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {grant.title}
                    </h3>
                    <button
                      onClick={() => {
                        const updatedGrants = savedGrants.filter(
                          (g) => g.id !== grant.id
                        );
                        localStorage.setItem(
                          "savedGrants",
                          JSON.stringify(updatedGrants)
                        );
                        setCurrentView("saved"); // Refresh view
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Deadline Alert */}
                  {daysUntil !== null && daysUntil > 0 && (
                    <div
                      className={`mb-3 p-2 rounded-lg ${
                        daysUntil <= 7
                          ? "bg-red-50 border border-red-200"
                          : daysUntil <= 14
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          daysUntil <= 7
                            ? "text-red-800"
                            : daysUntil <= 14
                            ? "text-yellow-800"
                            : "text-blue-800"
                        }`}
                      >
                        ⏰ Deadline in {daysUntil} day
                        {daysUntil !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {grant.country}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {grant.sector}
                    </span>
                  </div>

                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {grant.amount}
                  </div>

                  <a
                    href={grant.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block"
                  >
                    📝 Apply Now
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Search History
          </h2>
          <div className="text-sm text-gray-500">
            🕒 {history.length} search{history.length !== 1 ? "es" : ""}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p>No search history yet. Start by finding some grants!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((search) => (
              <div
                key={search.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      {new Date(search.timestamp).toLocaleString()}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {search.filters.country && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          📍 {search.filters.country}
                        </span>
                      )}
                      {search.filters.sector && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          🏭 {search.filters.sector}
                        </span>
                      )}
                      {search.filters.stage && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          🚀 {search.filters.stage}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {search.resultsCount} grant
                      {search.resultsCount !== 1 ? "s" : ""} found
                      {search.emailSent && (
                        <span className="ml-2 text-green-600">
                          📧 Email sent to {search.emailSentTo}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Re-run this search
                      handleFormSubmit(search.filters);
                      setCurrentView("search");
                    }}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔄 Re-run
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Navigation - Hidden on home view */}
      {currentView !== "home" && (
        <header className="bg-slate-950/90 backdrop-blur-sm shadow-xl border-b border-slate-800/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView("home")}
                  className="flex items-center space-x-3 text-white hover:text-indigo-300 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm tracking-tight">
                      SG
                    </span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    Grant Finder
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setCurrentView("home")}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 tracking-tight ${
                    currentView === "home"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className="sm:hidden">🏠</span>
                  <span className="hidden sm:inline">🏠 Home</span>
                </button>

                <button
                  onClick={() => setCurrentView("search")}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 tracking-tight ${
                    currentView === "search"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className="sm:hidden">🔍</span>
                  <span className="hidden sm:inline">🔍 Search</span>
                </button>

                <button
                  onClick={() => setCurrentView("email")}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 tracking-tight ${
                    currentView === "email"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className="sm:hidden">📧</span>
                  <span className="hidden sm:inline">📧 Email</span>
                </button>

                <button
                  onClick={() => setCurrentView("history")}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 tracking-tight ${
                    currentView === "history"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className="sm:hidden">🕒</span>
                  <span className="hidden sm:inline">🕒 History</span>
                </button>

                <button
                  onClick={() => setCurrentView("saved")}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 tracking-tight ${
                    currentView === "saved"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className="sm:hidden">⭐</span>
                  <span className="hidden sm:inline">⭐ Saved</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Agent Progress Sidebar */}
        {(agentProgress.isActive || loading) && currentView !== "home" && (
          <div className="hidden lg:block w-80 bg-gradient-to-br from-slate-900/95 to-indigo-900/90 backdrop-blur-sm border-r border-slate-700/50 min-h-screen shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  🤖 Agent Progress
                </h3>
                <button
                  onClick={() =>
                    setAgentProgress((prev) => ({ ...prev, isActive: false }))
                  }
                  className="text-slate-400 hover:text-white transition-colors text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {agentProgress.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        index < agentProgress.currentStep
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                          : index === agentProgress.currentStep
                          ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg animate-pulse"
                          : "bg-slate-700/60 text-slate-400 border border-slate-600/50"
                      }`}
                    >
                      {index < agentProgress.currentStep ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium transition-colors ${
                          index <= agentProgress.currentStep
                            ? "text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {step}
                      </div>
                      {index === agentProgress.currentStep && (
                        <div className="text-xs text-indigo-300 mt-2 leading-relaxed">
                          {step === "Parsing user criteria" &&
                            "Analyzing your founder profile and search preferences"}
                          {step === "Searching grant databases" &&
                            "Searching government, foundation, and organization databases"}
                          {step === "Filtering by eligibility" &&
                            "Applying eligibility criteria and founder type filters"}
                          {step === "Validating grant details" &&
                            "Verifying grant details, deadlines, and application links"}
                          {step === "Ranking by relevance" &&
                            "Sorting by profile match and deadline proximity"}
                          {step === "Preparing recommendations" &&
                            "Generating match explanations and final results"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-slate-800/40 rounded-xl border border-slate-600/30">
                <p className="text-xs text-slate-300 text-center">
                  AI-powered search in progress...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Mobile Progress Indicator */}
          {(agentProgress.isActive || loading) && currentView !== "home" && (
            <div className="lg:hidden bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">
                    🤖 Agent Progress
                  </h3>
                  <span className="text-xs text-slate-300">
                    {agentProgress.currentStep + 1}/{agentProgress.steps.length}
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{
                      width: `${
                        ((agentProgress.currentStep + 1) /
                          agentProgress.steps.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {agentProgress.steps[agentProgress.currentStep]}
                </p>
              </div>
            </div>
          )}

          {currentView === "home" ? (
            <Home onGetStarted={handleGetStarted} />
          ) : currentView === "search" ? (
            <div>
              <GrantFinderForm
                onSubmit={handleFormSubmit}
                onReset={handleReset}
                loading={loading}
              />

              {/* Error and Results Display - with dark theme and centered content */}
              {(error || loading || grants.length > 0) && (
                <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-16">
                  <div className="max-w-[1400px] mx-auto px-6">
                    {error && (
                      <div className="mb-8 p-6 bg-gradient-to-br from-red-900/40 to-red-800/30 backdrop-blur-sm border border-red-400/30 rounded-2xl">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-red-400 text-2xl">⚠️</span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-red-200 mb-2">
                              Something went wrong
                            </h3>
                            <p className="text-red-300 mb-4">{error}</p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setError(null)}
                                className="bg-red-600/60 hover:bg-red-600/80 text-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={handleReset}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                              >
                                Try Again
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {loading && (
                      <div className="text-center">
                        <div className="inline-flex items-center px-8 py-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mr-4"></div>
                          <span className="text-white text-lg font-medium">
                            Searching for grants...
                          </span>
                        </div>
                      </div>
                    )}

                    {grants.length > 0 && (
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center tracking-tight">
                          Found {grants.length} Perfect Grant
                          {grants.length !== 1 ? "s" : ""}{" "}
                          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            For You
                          </span>
                        </h2>
                        <GrantCards
                          grants={grants}
                          filters={lastFilters}
                          userProfile={lastFilters}
                          interstitialAnswers={interstitialAnswers}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-4 py-8">
              {currentView === "history" && renderSearchHistory()}
              {currentView === "saved" && renderSavedGrants()}
              {currentView === "email" && (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    📧 Schedule Email Digest
                  </h2>
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📬</div>
                    <p className="text-lg mb-4">
                      Email digest feature coming soon!
                    </p>
                    <p className="text-sm">
                      You'll be able to schedule weekly grant updates directly
                      to your inbox.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clarification Modal */}
        <ClarificationModal
          clarification={clarification}
          onChoose={handleClarificationChoice}
          onCancel={handleClarificationCancel}
          loading={clarificationLoading}
        />

        {/* Interstitial Questions */}
        <InterstitialQuestions
          isVisible={showInterstitialQuestions && loading}
          onAnswer={handleInterstitialAnswer}
          answers={interstitialAnswers}
        />
      </div>
    </div>
  );
}

export default App;
