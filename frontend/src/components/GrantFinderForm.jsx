import { useState } from "react";

const GrantFinderForm = ({ onSubmit, onReset, loading }) => {
  const [formData, setFormData] = useState(() => {
    // Load saved filters from localStorage
    const saved = localStorage.getItem("grantFilters");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved filters:", e);
      }
    }
    return {
      country: "",
      sector: "",
      stage: "",
      founderType: "",
      mode: "form", // 'form' or 'chat'
    };
  });

  const [chatInput, setChatInput] = useState("");

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Australia",
    "India",
    "Singapore",
    "Netherlands",
    "Sweden",
  ];

  const sectors = [
    "Technology",
    "AI/ML",
    "Healthcare",
    "Fintech",
    "EdTech",
    "CleanTech",
    "E-commerce",
    "Biotech",
    "SaaS",
    "Hardware",
  ];

  const stages = [
    "Idea Stage",
    "Pre-Seed",
    "Seed",
    "Early Revenue",
    "Growth Stage",
  ];

  const founderTypes = [
    "Student-led",
    "Women-led",
    "Minority-led",
    "First-time founder",
    "Serial entrepreneur",
    "Academic/Research",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    // Save to localStorage
    localStorage.setItem("grantFilters", JSON.stringify(newFormData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.mode === "chat") {
      if (!chatInput.trim()) {
        alert("Please enter your grant search query");
        return;
      }
      onSubmit({
        mode: "chat",
        query: chatInput,
        timestamp: new Date().toISOString(),
      });
    } else {
      if (!formData.country || !formData.sector || !formData.stage) {
        alert("Please fill in all required fields");
        return;
      }
      onSubmit({
        ...formData,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleResetClick = () => {
    setFormData({
      country: "",
      sector: "",
      stage: "",
      founderType: "",
      mode: "form",
    });
    setChatInput("");
    onReset();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Mode Toggle - matching reference design */}
      <div className="mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, mode: "form" }))}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors ${
              formData.mode === "form"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📝 Guided Form
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, mode: "chat" }))}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors ${
              formData.mode === "chat"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ✨ Natural Language
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {formData.mode === "form" ? (
          <div>
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe what you're looking for
              </label>
              <input
                type="text"
                placeholder="Try: 'EU health grants for early-stage startups' or 'Climate grants closing this month'"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
            </div>

            {/* Countries Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Countries
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "India",
                  "United States",
                  "European Union",
                  "United Kingdom",
                  "Canada",
                  "Singapore",
                  "Australia",
                ].map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, country }))
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.country === country
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Sectors Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sectors
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "AI",
                  "Health",
                  "Climate",
                  "Education",
                  "Cybersecurity",
                  "Creative",
                ].map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, sector }))}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.sector === sector
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* Founder Criteria Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Founder Criteria
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Women-led", "LGBTQ+", "Student-led", "Nonprofit"].map(
                  (criteria) => (
                    <button
                      key={criteria}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          founderType:
                            prev.founderType === criteria ? "" : criteria,
                        }))
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.founderType === criteria
                          ? "bg-gray-900 text-white shadow-sm"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                      }`}
                    >
                      {criteria}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Stage and Date Window */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Stage
                </h3>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select stage</option>
                  <option value="Seed">Seed</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Early Revenue">Early Revenue</option>
                  <option value="Growth Stage">Growth Stage</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Date Window
                </h3>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Active now">Active now</option>
                  <option value="Closing soon">Closing soon</option>
                  <option value="Opening soon">Opening soon</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Foreign-eligible only?
                </h3>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      No
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="chatInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Describe your grant search in natural language
            </label>
            <textarea
              id="chatInput"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g., 'I'm looking for non-dilutive AI startup grants in the US and Canada for student founders under $100k'"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={handleResetClick}
            className="bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300 shadow-sm"
          >
            🗑️ Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] shadow-sm border border-gray-900"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </span>
            ) : (
              "🔍 Run Search"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrantFinderForm;
