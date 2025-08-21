import { useState } from "react";

const ClarificationModal = ({ clarification, onChoose, onCancel, loading }) => {
  const [selectedChoice, setSelectedChoice] = useState("");

  const handleSubmit = () => {
    if (selectedChoice) {
      onChoose(selectedChoice);
    }
  };

  if (!clarification || !clarification.needed) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Agent Avatar and Header */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mr-4">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Grant Agent</h3>
            <p className="text-sm text-gray-500">Needs clarification</p>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">{clarification.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {clarification.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedChoice === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="clarification"
                value={option}
                checked={selectedChoice === option}
                onChange={(e) => setSelectedChoice(e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedChoice === option
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedChoice === option && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedChoice || loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </span>
            ) : (
              "Continue Search"
            )}
          </button>
        </div>

        {/* Typing indicator for agent thinking */}
        {loading && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            Agent is refining search...
          </div>
        )}
      </div>
    </div>
  );
};

export default ClarificationModal;
