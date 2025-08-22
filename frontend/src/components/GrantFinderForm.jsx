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
      // New founder profile fields
      industry: "",
      region: "",
      nonDilutiveOnly: false,
      description: "",
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

    try {
      if (formData.mode === "chat") {
        if (!chatInput.trim()) {
          alert("Please enter your grant search query to continue.");
          return;
        }
        if (chatInput.trim().length < 10) {
          alert(
            "Please provide a more detailed search query (at least 10 characters)."
          );
          return;
        }
        onSubmit({
          mode: "chat",
          query: chatInput.trim(),
          timestamp: new Date().toISOString(),
        });
      } else {
        // Validate required fields
        const missingFields = [];
        if (!formData.industry) missingFields.push("Industry");
        if (!formData.region) missingFields.push("Region");
        if (!formData.stage) missingFields.push("Stage");

        if (missingFields.length > 0) {
          alert(
            `Please fill in the following required fields: ${missingFields.join(
              ", "
            )}`
          );
          return;
        }

        // Validate description length if provided
        if (formData.description && formData.description.length > 500) {
          alert(
            "Description is too long. Please keep it under 500 characters."
          );
          return;
        }

        onSubmit({
          ...formData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }
  };

  const handleResetClick = () => {
    setFormData({
      country: "",
      sector: "",
      stage: "",
      founderType: "",
      mode: "form",
      industry: "",
      region: "",
      nonDilutiveOnly: false,
      description: "",
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
            {/* Founder Profile Section */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                👤 Your Founder Profile
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (helps us find better matches)
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select your industry</option>
                    <option value="AI/ML">AI/Machine Learning</option>
                    <option value="Healthcare">Healthcare & Biotech</option>
                    <option value="Fintech">Financial Technology</option>
                    <option value="Climate">Climate & Clean Tech</option>
                    <option value="Education">Education Technology</option>
                    <option value="E-commerce">E-commerce & Retail</option>
                    <option value="SaaS">Software as a Service</option>
                    <option value="Hardware">Hardware & IoT</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Region *
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select your region</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Pacific">Asia Pacific</option>
                    <option value="India">India</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East/Africa">
                      Middle East & Africa
                    </option>
                    <option value="Global">Global (No Preference)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startup Stage *
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select stage</option>
                    <option value="Idea">Idea Stage</option>
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Early Revenue">Early Revenue</option>
                    <option value="Growth">Growth Stage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Preference
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="nonDilutiveOnly"
                      checked={formData.nonDilutiveOnly}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nonDilutiveOnly: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      💎 Non-dilutive grants only (no equity required)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your startup (e.g., 'Building AI tools for healthcare providers')"
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Search Query */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Search Terms (Optional)
              </label>
              <input
                type="text"
                name="description"
                placeholder="Try: 'EU health grants for early-stage startups' or 'Climate grants closing this month'"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
            </div>

            {/* Additional Preferences */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Founder Type (Optional)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Women-led",
                    "Student-led",
                    "Minority-led",
                    "First-time founder",
                  ].map((criteria) => (
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
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                        formData.founderType === criteria
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                      }`}
                    >
                      {criteria}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Deadline Preference
                </h3>
                <select
                  name="deadlineWindow"
                  value={formData.deadlineWindow || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any deadline</option>
                  <option value="Active now">Active now</option>
                  <option value="Closing soon">
                    Closing soon (next 30 days)
                  </option>
                  <option value="Opening soon">Opening soon</option>
                </select>
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
