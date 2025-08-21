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
      setError(err.message);
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
      setError(err.message);
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
      <header className="bg-white shadow-sm border-b border-gray-200">
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

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView("search")}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "search"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                🔍 Search
              </button>

              <button
                onClick={() => setCurrentView("email")}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "email"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                📧 Email Digest
              </button>

              <button
                onClick={() => setCurrentView("history")}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "history"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                🕒 History
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Agent Progress Sidebar */}
        {(agentProgress.isActive || loading) && (
          <div className="w-80 bg-white shadow-lg border-r border-gray-200 min-h-screen">
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
                          {step === "Parse Inputs" &&
                            "Analyzing search criteria and preferences"}
                          {step === "Query Sources" &&
                            "Searching government and organization databases"}
                          {step === "Filter Results" &&
                            "Applying eligibility and criteria filters"}
                          {step === "Validate Data" &&
                            "Checking grant details and deadlines"}
                          {step === "Rank Matches" &&
                            "Sorting by relevance and deadline proximity"}
                          {step === "Deliver Results" &&
                            "Preparing final grant recommendations"}
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
          <div className="max-w-6xl mx-auto px-4 py-8">
            {currentView === "search" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Find Global Startup Grants
                  </h1>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
                  <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                    <p>
                      <strong>Error:</strong> {error}
                    </p>
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
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                      Found {grants.length} Grant
                      {grants.length !== 1 ? "s" : ""}
                    </h2>
                    <GrantCards grants={grants} filters={lastFilters} />
                  </div>
                )}
              </>
            )}

            {currentView === "history" && renderSearchHistory()}

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
