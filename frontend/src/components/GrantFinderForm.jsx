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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Find Your Perfect Grant
        </h2>

        {/* Mode Toggle */}
        <div className="flex space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, mode: "form" }))}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              formData.mode === "form"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📝 Form Mode
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, mode: "chat" }))}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              formData.mode === "chat"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            💬 Chat Mode
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {formData.mode === "form" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country/Region *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector */}
            <div>
              <label
                htmlFor="sector"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sector *
              </label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label
                htmlFor="stage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Stage *
              </label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select stage</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Founder Type */}
            <div>
              <label
                htmlFor="founderType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Founder Profile
              </label>
              <select
                id="founderType"
                name="founderType"
                value={formData.founderType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select founder type (optional)</option>
                {founderTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
        <div className="flex space-x-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </span>
            ) : (
              "🔍 Find Grants"
            )}
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrantFinderForm;
