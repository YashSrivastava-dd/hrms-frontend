import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useGenerateSalarySheets } from "../../hooks/useSalarySheets";
import { safeGetLocalStorage } from "../../utils/safariHelpers";

const GenerateSalarySheets = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [result, setResult] = useState(null);
  const { generate, loading, error } = useGenerateSalarySheets();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const generated_by = safeGetLocalStorage("employeId") || "system";

    try {
      const response = await generate(formData.year, formData.month, generated_by);
      setResult(response?.data || response);
      
      // Call onSuccess after a short delay to allow user to see the result
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error("Error generating salary sheets:", err);
    }
  };

  // Month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Generate Salary Sheets</h2>
            <p className="text-blue-100 mt-1">Generate salary sheets for all employees</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!result ? (
            <>
              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FaExclamationCircle className="text-yellow-600 mt-1" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">Important</p>
                    <p className="text-yellow-700 text-sm">
                      This will generate salary sheets for all active employees for the selected month and year.
                      Make sure all attendance and leave data is up to date before generating.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleChange("year", parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => handleChange("month", parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Period Display */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Selected Period</p>
                    <p className="font-semibold text-gray-900">
                      {months.find((m) => m.value === formData.month)?.label} {formData.year}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FaExclamationCircle className="text-red-600 mt-1" />
                    <div>
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FaCalendarAlt />
                      <span>Generate Salary Sheets</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Results Display */
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                  <h3 className="text-lg font-semibold text-green-800">Generation Complete</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Employees</span>
                    <span className="font-bold text-gray-900">{result.totalEmployees || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Processed</span>
                    <span className="font-bold text-green-600">{result.processed || 0}</span>
                  </div>
                  {result.skipped > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Skipped</span>
                      <span className="font-bold text-yellow-600">{result.skipped || 0}</span>
                    </div>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <ul className="text-sm text-red-700 space-y-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default GenerateSalarySheets;
