import { useState } from "react";
import GrantFinderForm from "./components/GrantFinderForm";
import GrantCards from "./components/GrantCards";
import ClarificationModal from "./components/ClarificationModal";
import "./App.css";

function App() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFilters, setLastFilters] = useState(null);
  const [currentView, setCurrentView] = useState("search"); // 'search', 'history', 'email'
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

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setClarification(null);
    setOriginalQuery(formData);
    setAgentProgress((prev) => ({ ...prev, isActive: true, currentStep: 0 }));

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView("search")}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                ✨ GrantFinder
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setCurrentView("search")}
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${
                  currentView === "search"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="sm:hidden">🔍</span>
                <span className="hidden sm:inline">🔍 Search</span>
              </button>

              <button
                onClick={() => setCurrentView("email")}
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${
                  currentView === "email"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="sm:hidden">📧</span>
                <span className="hidden sm:inline">📧 Email Digest</span>
              </button>

              <button
                onClick={() => setCurrentView("history")}
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${
                  currentView === "history"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="sm:hidden">🕒</span>
                <span className="hidden sm:inline">🕒 History</span>
              </button>

              <button
                onClick={() => setCurrentView("saved")}
                className={`flex items-center px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${
                  currentView === "saved"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="sm:hidden">⭐</span>
                <span className="hidden sm:inline">⭐ Saved</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Agent Progress Sidebar */}
        {(agentProgress.isActive || loading) && (
          <div className="hidden lg:block w-80 bg-white shadow-lg border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agent Progress
                </h3>
                <button
                  onClick={() =>
                    setAgentProgress((prev) => ({ ...prev, isActive: false }))
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {agentProgress.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index < agentProgress.currentStep
                          ? "bg-green-500 text-white"
                          : index === agentProgress.currentStep
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index < agentProgress.currentStep ? "✓" : index + 1}
                    </div>
                    <div
                      className={`text-sm ${
                        index <= agentProgress.currentStep
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step}
                      {index === agentProgress.currentStep && (
                        <div className="text-xs text-blue-600 mt-1">
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

              <div className="mt-6 text-xs text-gray-500">
                Click "Run Search" to start finding grants
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Mobile Progress Indicator */}
          {(agentProgress.isActive || loading) && (
            <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Agent Progress
                  </h3>
                  <span className="text-xs text-gray-500">
                    {agentProgress.currentStep + 1}/{agentProgress.steps.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((agentProgress.currentStep + 1) /
                          agentProgress.steps.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {agentProgress.steps[agentProgress.currentStep]}
                </p>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto px-4 py-8">
            {currentView === "search" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Find Global Startup Grants
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                    Discover funding opportunities tailored to your startup
                    using AI-powered search. Get personalized grant
                    recommendations based on your profile and goals.
                  </p>
                </div>

                <GrantFinderForm
                  onSubmit={handleFormSubmit}
                  onReset={handleReset}
                  loading={loading}
                />

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-red-400 text-xl">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Something went wrong
                        </h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <div className="mt-4">
                          <button
                            onClick={() => setError(null)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={handleReset}
                            className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-md">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                      <span className="text-gray-700">
                        Searching for grants...
                      </span>
                    </div>
                  </div>
                )}

                {grants.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                      Found {grants.length} Grant
                      {grants.length !== 1 ? "s" : ""}
                    </h2>
                    <GrantCards
                      grants={grants}
                      filters={lastFilters}
                      userProfile={lastFilters}
                    />
                  </div>
                )}
              </>
            )}

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
                    You'll be able to schedule weekly grant updates directly to
                    your inbox.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clarification Modal */}
        <ClarificationModal
          clarification={clarification}
          onChoose={handleClarificationChoice}
          onCancel={handleClarificationCancel}
          loading={clarificationLoading}
        />
      </div>
    </div>
  );
}

export default App;
