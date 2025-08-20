import { useState } from "react";

const GrantCard = ({ grant }) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
    // TODO: Implement localStorage saving logic
    const savedGrants = JSON.parse(localStorage.getItem("savedGrants") || "[]");
    if (saved) {
      // Remove from saved
      const updated = savedGrants.filter((g) => g.id !== grant.id);
      localStorage.setItem("savedGrants", JSON.stringify(updated));
    } else {
      // Add to saved
      savedGrants.push(grant);
      localStorage.setItem("savedGrants", JSON.stringify(savedGrants));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header with badge and save button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {grant.country === "USA"
              ? "US NSF • SBIR Phase I"
              : grant.country === "Canada"
              ? "Startup India • SISFS Seed Fund"
              : "UNICEF • Venture Fund"}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            {grant.country}
          </span>
        </div>
        <button
          onClick={handleSave}
          className={`p-1 rounded transition-colors ${
            saved
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-400 hover:text-yellow-500"
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
      <div className="flex space-x-3">
        <a
          href={grant.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          📝 Apply Now
        </a>
        <button
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          title="Why this grant was recommended"
        >
          ℹ️ Why?
        </button>
      </div>
    </div>
  );
};

const GrantCards = ({ grants, filters }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    setSendingEmail(true);
    try {
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
        alert("✅ Grant digest sent successfully! Check your email.");
        setShowEmailForm(false);
        setEmail("");
      } else {
        alert(`❌ Failed to send email: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Failed to send email: ${error.message}`);
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {showEmailForm ? "Cancel" : "Send Digest"}
          </button>
        </div>

        {showEmailForm && (
          <form onSubmit={handleSendEmail} className="mt-4 flex space-x-3">
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
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingEmail ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </span>
              ) : (
                "Send"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Grant Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {grants.map((grant) => (
          <GrantCard key={grant.id} grant={grant} />
        ))}
      </div>
    </div>
  );
};

export default GrantCards;
