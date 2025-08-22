import { useState, useEffect } from "react";

// Helper function to extract main domain for fallback
const extractMainDomain = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return null;
  }
};

const GrantCard = ({ grant, userProfile }) => {
  const [saved, setSaved] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedGrants = JSON.parse(localStorage.getItem("savedGrants") || "[]");
    const isCurrentGrantSaved = savedGrants.some((g) => g.id === grant.id);
    setSaved(isCurrentGrantSaved);
  }, [grant.id]);

  // Get relevance score styling
  const getRelevanceColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get deadline urgency styling
  const getDeadlineUrgencyColor = (urgency) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Get funding category icon
  const getFundingCategoryIcon = (category) => {
    switch (category) {
      case "government":
        return "🏛️";
      case "academic":
        return "🎓";
      case "corporate":
        return "🏢";
      case "foundation":
        return "🌟";
      default:
        return "💼";
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    const savedGrants = JSON.parse(localStorage.getItem("savedGrants") || "[]");
    if (saved) {
      // Remove from saved
      const updated = savedGrants.filter((g) => g.id !== grant.id);
      localStorage.setItem("savedGrants", JSON.stringify(updated));
    } else {
      // Add to saved with enhanced data for reminders
      const grantToSave = {
        ...grant,
        savedAt: new Date().toISOString(),
        // Ensure deadline is properly formatted
        deadline: grant.deadline || null,
        // Add metadata for better reminder functionality
        reminderPrefs: {
          enabled: true,
          notifyDays: [30, 14, 7, 1], // Notify 30, 14, 7, and 1 day before deadline
        },
      };
      savedGrants.push(grantToSave);
      localStorage.setItem("savedGrants", JSON.stringify(savedGrants));
    }
  };

  const getWhyGrantText = () => {
    const matches = [];

    // Use enhanced match reasons from backend if available
    if (grant.match_reasons && grant.match_reasons.length > 0) {
      matches.push(...grant.match_reasons.map((reason) => `🎯 ${reason}`));
    }

    // Profile-based matches (fallback/additional)
    if (userProfile?.industry && grant.sector) {
      matches.push(
        `🏭 Industry match: ${grant.sector} aligns with your ${userProfile.industry} focus`
      );
    }

    if (userProfile?.region && grant.country) {
      if (
        userProfile.region === "Global" ||
        grant.country.toLowerCase().includes(userProfile.region.toLowerCase())
      ) {
        matches.push(
          `🌍 Location match: ${grant.country} is in your target region`
        );
      }
    }

    // Add relevance score if available
    if (grant.relevance_score) {
      matches.push(`📊 Relevance score: ${grant.relevance_score}/100`);
    }

    // Grant-specific details
    if (grant.amount) {
      matches.push(`💰 Funding: ${grant.amount} available`);
    }

    if (grant.deadline) {
      matches.push(`⏰ Deadline: ${grant.deadline}`);
    }

    if (grant.funding_category) {
      const categoryIcon = getFundingCategoryIcon(grant.funding_category);
      matches.push(`${categoryIcon} Source: ${grant.funding_category} funding`);
    }

    if (grant.deadline_urgency && grant.deadline_urgency !== "ongoing") {
      matches.push(`⚡ Urgency: ${grant.deadline_urgency} priority`);
    }

    if (
      grant.eligibility &&
      grant.eligibility !== "Check eligibility requirements"
    ) {
      matches.push(
        `✅ Eligibility: ${grant.eligibility.substring(0, 100)}${
          grant.eligibility.length > 100 ? "..." : ""
        }`
      );
    }

    if (matches.length === 0) {
      return "This grant was included based on your search criteria.";
    }

    return `Why this grant was recommended:\n\n${matches
      .slice(0, 6)
      .join("\n")}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1">
      {/* Header with enhanced badges and save button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-wrap gap-2">
          {/* Relevance Score Badge */}
          {grant.relevance_score && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${getRelevanceColor(
                grant.relevance_score
              )}`}
            >
              {grant.relevance_score}% match
            </span>
          )}

          {/* Funding Category with Icon */}
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded flex items-center">
            {getFundingCategoryIcon(grant.funding_category)}{" "}
            {grant.source || "Funding Organization"}
          </span>

          {/* Country Badge */}
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            🌍 {grant.country}
          </span>

          {/* Deadline Urgency */}
          {grant.deadline_urgency && grant.deadline_urgency !== "ongoing" && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${getDeadlineUrgencyColor(
                grant.deadline_urgency
              )}`}
            >
              {grant.deadline_urgency === "urgent"
                ? "⚡ Urgent"
                : grant.deadline_urgency === "moderate"
                ? "⏰ Moderate"
                : "📅 Flexible"}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 ${
            saved
              ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50"
              : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
          }`}
          title={saved ? "Remove from saved" : "Save grant"}
        >
          ⭐
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {grant.title}
      </h3>

      {/* Enhanced Match Indicator */}
      {(grant.match_reasons && grant.match_reasons.length > 0) ||
      userProfile ? (
        <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">🎯</span>
            <div>
              <p className="text-sm text-green-800 font-medium mb-1">
                Perfect match for your profile:
              </p>
              <div className="text-xs text-green-700">
                {grant.match_reasons && grant.match_reasons.length > 0 ? (
                  grant.match_reasons.slice(0, 3).map((reason, index) => (
                    <span
                      key={index}
                      className="inline-block mr-2 mb-1 px-2 py-1 bg-white bg-opacity-60 rounded"
                    >
                      {reason}
                    </span>
                  ))
                ) : (
                  <>
                    {userProfile?.industry && grant.sector && (
                      <span className="inline-block mr-2 mb-1 px-2 py-1 bg-white bg-opacity-60 rounded">
                        {grant.sector}
                      </span>
                    )}
                    {userProfile?.region && grant.country && (
                      <span className="inline-block mr-2 mb-1 px-2 py-1 bg-white bg-opacity-60 rounded">
                        {grant.country}
                      </span>
                    )}
                    {userProfile?.nonDilutiveOnly && (
                      <span className="inline-block mr-2 mb-1 px-2 py-1 bg-white bg-opacity-60 rounded">
                        Non-dilutive
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          {grant.country}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          {grant.sector}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          Robotics
        </span>
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
          Foreign: No
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          Non-dilutive
        </span>
      </div>

      {/* Amount and deadline */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-900">💰</span>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {grant.amount}
            </div>
            <div className="text-sm text-gray-500">funding available</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">⏰ Rolling</div>
          <div className="text-sm font-medium text-gray-900">
            {grant.deadline}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-600 mb-4">
        <p>
          <strong>Eligibility:</strong> {grant.eligibility}
        </p>
        <p>
          <strong>Source:</strong> {grant.source}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <a
          href={grant.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            // Fallback mechanism: if URL fails, redirect to main portal
            const handleLinkFailure = () => {
              const fallbackUrl =
                grant.portal_homepage || extractMainDomain(grant.apply_link);
              if (fallbackUrl && fallbackUrl !== grant.apply_link) {
                window.open(fallbackUrl, "_blank");
              }
            };

            // Check if link is likely to fail (example.com or suspicious patterns)
            if (
              grant.apply_link &&
              (grant.apply_link.includes("example.com") ||
                grant.apply_link.includes("apply-"))
            ) {
              e.preventDefault();
              handleLinkFailure();
            }
          }}
          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 text-sm shadow-md"
          style={{ color: "white", textDecoration: "none" }}
        >
          📝 Apply Now
        </a>
        <div className="relative">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200 text-sm"
            title="Why this grant was recommended"
          >
            ℹ️ Why?
          </button>

          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10 max-w-screen-sm">
              <div className="whitespace-pre-line">{getWhyGrantText()}</div>
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GrantCards = ({ grants, filters, userProfile }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load email preferences from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const savedOptIn = localStorage.getItem("emailOptIn") === "true";

    if (savedEmail) {
      setEmail(savedEmail);
    }
    setEmailOptIn(savedOptIn);
  }, []);

  // Calculate search result statistics
  const getResultStats = () => {
    if (!grants || grants.length === 0) return null;

    const highRelevance = grants.filter((g) => g.relevance_score >= 80).length;
    const urgentDeadlines = grants.filter(
      (g) => g.deadline_urgency === "urgent"
    ).length;
    const governmentGrants = grants.filter(
      (g) => g.funding_category === "government"
    ).length;
    const averageRelevance =
      grants.reduce((sum, g) => sum + (g.relevance_score || 0), 0) /
      grants.length;

    return {
      total: grants.length,
      highRelevance,
      urgentDeadlines,
      governmentGrants,
      averageRelevance: Math.round(averageRelevance),
    };
  };

  const stats = getResultStats();

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToastMessage("❌ Please enter your email address");
      return;
    }

    setSendingEmail(true);
    try {
      // Save email preferences if opted in
      if (emailOptIn) {
        localStorage.setItem("userEmail", email.trim());
        localStorage.setItem("emailOptIn", "true");
      }

      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          grants: grants,
          filters: filters,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToastMessage(
          "✅ Grant digest sent successfully! Check your email."
        );
        setShowEmailForm(false);

        // Save search result with email sent flag
        const searchHistory = JSON.parse(
          localStorage.getItem("searchHistory") || "[]"
        );
        if (searchHistory.length > 0) {
          searchHistory[0].emailSent = true;
          searchHistory[0].emailSentTo = email.trim();
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        }
      } else {
        const errorMsg = data.error || "Unknown error occurred";
        showToastMessage(`❌ Email failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Email send failed:", error);
      const friendlyError = error.message.includes("fetch")
        ? "Unable to connect to email service. Please check your connection."
        : error.message.includes("timeout")
        ? "Email service is taking too long to respond. Please try again."
        : `Email failed: ${error.message}`;
      showToastMessage(`❌ ${friendlyError}`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!grants || grants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">
          No grants found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search criteria or use chat mode for a broader
          search.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Search Results Summary */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🎯 Enhanced Search Results
            </h2>
            <span className="px-3 py-1 bg-white bg-opacity-70 text-blue-800 text-sm font-medium rounded-full">
              Powered by AI + Web Exploration
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-xs text-gray-600">Total Grants Found</div>
            </div>
            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.highRelevance}
              </div>
              <div className="text-xs text-gray-600">High Relevance (80%+)</div>
            </div>
            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.urgentDeadlines}
              </div>
              <div className="text-xs text-gray-600">Urgent Deadlines</div>
            </div>
            <div className="text-center p-3 bg-white bg-opacity-60 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageRelevance}%
              </div>
              <div className="text-xs text-gray-600">Avg. Relevance</div>
            </div>
          </div>

          <div className="text-sm text-gray-700 bg-white bg-opacity-40 rounded p-3">
            <strong>📊 Search Quality:</strong> Our AI agent explored multiple
            grant portals, extracted detailed information, and scored each
            opportunity based on your specific criteria. Results are ranked by
            relevance and include verified application links and deadlines.
          </div>
        </div>
      )}

      {/* Email Digest Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-1">
              📧 Get these grants in your inbox
            </h3>
            <p className="text-sm text-blue-700">
              Receive a beautifully formatted email digest with all these grants
            </p>
          </div>
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105"
          >
            {showEmailForm ? "Cancel" : "Send Digest"}
          </button>
        </div>

        {showEmailForm && (
          <form onSubmit={handleSendEmail} className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={sendingEmail}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {sendingEmail ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  "📧 Send"
                )}
              </button>
            </div>

            <label className="flex items-center text-sm text-blue-700 cursor-pointer">
              <input
                type="checkbox"
                checked={emailOptIn}
                onChange={(e) => setEmailOptIn(e.target.checked)}
                className="mr-2 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              Remember my email for future grant digests
            </label>
          </form>
        )}
      </div>

      {/* Grant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {grants.map((grant) => (
          <GrantCard key={grant.id} grant={grant} userProfile={userProfile} />
        ))}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {toastMessage.includes("✅") ? (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
              ) : (
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">✕</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {toastMessage.replace(/[✅❌]/g, "").trim()}
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantCards;
