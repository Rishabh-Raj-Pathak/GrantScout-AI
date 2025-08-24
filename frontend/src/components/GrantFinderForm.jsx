import { useState, useEffect } from "react";

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-r from-cyan-600/15 to-blue-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-24">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Grant Match
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Tell us about your startup, and we'll find the most relevant funding
            opportunities tailored to your profile
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12 hover:border-indigo-400/40 transition-all duration-500 shadow-2xl">
          {/* Mode Toggle - matching dark theme */}
          <div className="mb-12">
            <div className="flex bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 max-w-lg mx-auto border border-slate-600/30">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, mode: "form" }))
                }
                className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-all duration-300 tracking-tight ${
                  formData.mode === "form"
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xl transform scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/40"
                }`}
              >
                📝 Guided Form
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, mode: "chat" }))
                }
                className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-all duration-300 tracking-tight ${
                  formData.mode === "chat"
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xl transform scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/40"
                }`}
              >
                ✨ Natural Language
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {formData.mode === "form" ? (
              <div className="animate-fade-in-up">
                {/* Founder Profile Section */}
                <div className="mb-12 p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/30 backdrop-blur-sm rounded-2xl border border-indigo-400/30 hover:border-indigo-400/50 transition-all duration-500">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center tracking-tight">
                    👤 Your Founder Profile
                    <span className="ml-3 text-base font-normal text-slate-300">
                      (helps us find better matches)
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-slate-200 mb-3 transition-colors group-focus-within:text-indigo-300">
                        Primary Industry *
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70 appearance-none cursor-pointer"
                        required
                      >
                        <option
                          value=""
                          className="bg-slate-800 text-slate-400"
                        >
                          Select your industry
                        </option>
                        <option
                          value="AI/ML"
                          className="bg-slate-800 text-white"
                        >
                          AI/Machine Learning
                        </option>
                        <option
                          value="Healthcare"
                          className="bg-slate-800 text-white"
                        >
                          Healthcare & Biotech
                        </option>
                        <option
                          value="Fintech"
                          className="bg-slate-800 text-white"
                        >
                          Financial Technology
                        </option>
                        <option
                          value="Climate"
                          className="bg-slate-800 text-white"
                        >
                          Climate & Clean Tech
                        </option>
                        <option
                          value="Education"
                          className="bg-slate-800 text-white"
                        >
                          Education Technology
                        </option>
                        <option
                          value="E-commerce"
                          className="bg-slate-800 text-white"
                        >
                          E-commerce & Retail
                        </option>
                        <option
                          value="SaaS"
                          className="bg-slate-800 text-white"
                        >
                          Software as a Service
                        </option>
                        <option
                          value="Hardware"
                          className="bg-slate-800 text-white"
                        >
                          Hardware & IoT
                        </option>
                        <option
                          value="Cybersecurity"
                          className="bg-slate-800 text-white"
                        >
                          Cybersecurity
                        </option>
                        <option
                          value="Other"
                          className="bg-slate-800 text-white"
                        >
                          Other
                        </option>
                      </select>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-slate-200 mb-3 transition-colors group-focus-within:text-indigo-300">
                        Primary Region *
                      </label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70 appearance-none cursor-pointer"
                        required
                      >
                        <option
                          value=""
                          className="bg-slate-800 text-slate-400"
                        >
                          Select your region
                        </option>
                        <option
                          value="North America"
                          className="bg-slate-800 text-white"
                        >
                          North America
                        </option>
                        <option
                          value="Europe"
                          className="bg-slate-800 text-white"
                        >
                          Europe
                        </option>
                        <option
                          value="Asia Pacific"
                          className="bg-slate-800 text-white"
                        >
                          Asia Pacific
                        </option>
                        <option
                          value="India"
                          className="bg-slate-800 text-white"
                        >
                          India
                        </option>
                        <option
                          value="Latin America"
                          className="bg-slate-800 text-white"
                        >
                          Latin America
                        </option>
                        <option
                          value="Middle East/Africa"
                          className="bg-slate-800 text-white"
                        >
                          Middle East & Africa
                        </option>
                        <option
                          value="Global"
                          className="bg-slate-800 text-white"
                        >
                          Global (No Preference)
                        </option>
                      </select>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="relative group">
                      <label className="block text-sm font-semibold text-slate-200 mb-3 transition-colors group-focus-within:text-indigo-300">
                        Startup Stage *
                      </label>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70 appearance-none cursor-pointer"
                        required
                      >
                        <option
                          value=""
                          className="bg-slate-800 text-slate-400"
                        >
                          Select stage
                        </option>
                        <option
                          value="Idea"
                          className="bg-slate-800 text-white"
                        >
                          Idea Stage
                        </option>
                        <option
                          value="Pre-Seed"
                          className="bg-slate-800 text-white"
                        >
                          Pre-Seed
                        </option>
                        <option
                          value="Seed"
                          className="bg-slate-800 text-white"
                        >
                          Seed
                        </option>
                        <option
                          value="Early Revenue"
                          className="bg-slate-800 text-white"
                        >
                          Early Revenue
                        </option>
                        <option
                          value="Growth"
                          className="bg-slate-800 text-white"
                        >
                          Growth Stage
                        </option>
                      </select>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Funding Preference
                      </label>
                      <label className="flex items-center p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl cursor-pointer hover:bg-slate-800/80 hover:border-slate-500/70 transition-all duration-300 group-hover:shadow-lg">
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
                          className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-indigo-500 focus:ring-indigo-400/60 focus:ring-2 transition-all duration-300"
                        />
                        <span className="ml-4 text-sm font-medium text-slate-200">
                          💎 Non-dilutive grants only (no equity required)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-semibold text-slate-200 mb-3 transition-colors group-focus-within:text-indigo-300">
                      Brief Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your startup (e.g., 'Building AI tools for healthcare providers')"
                      rows={3}
                      className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70 resize-none"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Search Query */}
                <div className="mb-12 p-8 bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-sm rounded-2xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500">
                  <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                    🔍 Additional Search Terms
                  </h3>
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-slate-200 mb-3 transition-colors group-focus-within:text-cyan-300">
                      Custom Keywords (Optional)
                    </label>
                    <input
                      type="text"
                      name="searchTerms"
                      placeholder="Try: 'EU health grants for early-stage startups' or 'Climate grants closing this month'"
                      className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Additional Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-2xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500">
                    <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                      👥 Founder Type (Optional)
                    </h3>
                    <div className="flex flex-wrap gap-3">
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
                          className={`px-4 py-3 text-sm rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                            formData.founderType === criteria
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105"
                              : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-600/50 hover:border-slate-500/70"
                          }`}
                        >
                          {criteria}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-sm rounded-2xl border border-green-400/20 hover:border-green-400/40 transition-all duration-500">
                    <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                      ⏰ Deadline Preference
                    </h3>
                    <div className="relative group">
                      <select
                        name="deadlineWindow"
                        value={formData.deadlineWindow || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-green-400/60 focus:border-green-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70 appearance-none cursor-pointer"
                      >
                        <option
                          value=""
                          className="bg-slate-800 text-slate-400"
                        >
                          Any deadline
                        </option>
                        <option
                          value="Active now"
                          className="bg-slate-800 text-white"
                        >
                          Active now
                        </option>
                        <option
                          value="Closing soon"
                          className="bg-slate-800 text-white"
                        >
                          Closing soon (next 30 days)
                        </option>
                        <option
                          value="Opening soon"
                          className="bg-slate-800 text-white"
                        >
                          Opening soon
                        </option>
                      </select>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    ✨ Describe your ideal grant in your own words
                  </h2>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Our AI agent will understand your needs and find the perfect
                    matches
                  </p>
                </div>

                <div className="relative group">
                  <label
                    htmlFor="chatInput"
                    className="block text-lg font-semibold text-slate-200 mb-4 transition-colors group-focus-within:text-indigo-300"
                  >
                    Tell us what you're looking for
                  </label>
                  <textarea
                    id="chatInput"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="e.g., 'I'm looking for non-dilutive AI startup grants in the US and Canada for student founders under $100k'"
                    rows={6}
                    className="w-full p-6 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 focus:bg-slate-800/80 transition-all duration-300 hover:border-slate-500/70 resize-none text-lg leading-relaxed"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                <div className="mt-6 p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-600/30">
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">
                    💡 Pro Tips:
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Include your industry, stage, and location</li>
                    <li>• Mention if you prefer non-dilutive funding</li>
                    <li>
                      • Specify any founder demographics (student, women-led,
                      etc.)
                    </li>
                    <li>• Add funding amount ranges if relevant</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12 pt-8 border-t border-slate-600/30">
              <button
                type="button"
                onClick={handleResetClick}
                className="bg-slate-800/60 backdrop-blur-sm text-slate-300 py-4 px-8 rounded-xl font-semibold hover:bg-slate-700/80 hover:text-white transition-all duration-300 border border-slate-600/50 hover:border-slate-500/70 transform hover:-translate-y-0.5 tracking-tight"
              >
                🗑️ Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white py-4 px-12 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[240px] shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 hover:scale-105 tracking-tight text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Searching Grants...
                  </span>
                ) : (
                  "🔍 Find Perfect Grants"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .font-sans {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GrantFinderForm;
