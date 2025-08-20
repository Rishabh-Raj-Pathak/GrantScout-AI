import { useState } from "react";
import GrantFinderForm from "./components/GrantFinderForm";
import GrantCards from "./components/GrantCards";
import "./App.css";

function App() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFilters, setLastFilters] = useState(null);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);

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
      setGrants(data.grants || []);
      setLastFilters(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGrants([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚀 Startup Grant Finder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find grants tailored to your startup using AI-powered search. Get
            personalized funding opportunities based on your profile and goals.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
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
                <span className="text-gray-700">Searching for grants...</span>
              </div>
            </div>
          )}

          {grants.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Found {grants.length} Grant{grants.length !== 1 ? "s" : ""}
              </h2>
              <GrantCards grants={grants} filters={lastFilters} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
