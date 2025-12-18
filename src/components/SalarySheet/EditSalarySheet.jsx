import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import salarySheetService from "../../services/salarySheetService";
import { formatIndianRupees } from "../../utils/currencyFormatter";

const EditSalarySheet = ({ sheet, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    employee_pf: 0,
    employee_esi: 0,
    tds: 0,
    loan_advance: 0,
    penalty: 0,
    transport_or_others: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sheet?.deductions) {
      setFormData({
        employee_pf: sheet.deductions.employee_pf || 0,
        employee_esi: sheet.deductions.employee_esi || 0,
        tds: sheet.deductions.tds || 0,
        loan_advance: sheet.deductions.loan_advance || 0,
        penalty: sheet.deductions.penalty || 0,
        transport_or_others: sheet.deductions.transport_or_others || 0,
      });
    }
  }, [sheet]);

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach((key) => {
      if (formData[key] < 0) {
        newErrors[key] = "Value cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalDeductions = () => {
    return Object.values(formData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const calculateNetPay = () => {
    const gross = sheet.gross_salary || sheet.adjusted_gross || 0;
    const totalDeductions = calculateTotalDeductions();
    return Math.max(0, gross - totalDeductions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (sheet.is_locked) {
      alert("Cannot edit locked salary sheet. Please unlock it first.");
      return;
    }

    setLoading(true);

    try {
      await salarySheetService.updateSalarySheet(sheet._id, {
        deductions: formData,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating salary sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!sheet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Salary Sheet</h2>
            <p className="text-green-100 mt-1">
              {sheet.employee_id?.employeeName || sheet.employee_code} -{" "}
              {new Date(sheet.year, sheet.month - 1).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </p>
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
          {/* Warning if locked */}
          {sheet.is_locked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">
                ⚠️ This salary sheet is locked and cannot be edited. Please unlock it first.
              </p>
            </div>
          )}

          {/* Current Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Current Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-600">Gross Salary</label>
                <p className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.gross_salary || sheet.adjusted_gross || 0)}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Current Net Pay</label>
                <p className="font-medium text-gray-900">{formatIndianRupees(sheet.net_pay)}</p>
              </div>
            </div>
          </div>

          {/* Deductions Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Deductions</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee PF
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.employee_pf}
                onChange={(e) => handleChange("employee_pf", e.target.value)}
                disabled={sheet.is_locked}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.employee_pf ? "border-red-300" : "border-gray-300"
                } ${sheet.is_locked ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.employee_pf && (
                <p className="mt-1 text-xs text-red-500">{errors.employee_pf}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ESI
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.employee_esi}
                onChange={(e) => handleChange("employee_esi", e.target.value)}
                disabled={sheet.is_locked}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.employee_esi ? "border-red-300" : "border-gray-300"
                } ${sheet.is_locked ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.employee_esi && (
                <p className="mt-1 text-xs text-red-500">{errors.employee_esi}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TDS</label>
              <input
                type="number"
                step="0.01"
                value={formData.tds}
                onChange={(e) => handleChange("tds", e.target.value)}
                disabled={sheet.is_locked}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.tds ? "border-red-300" : "border-gray-300"
                } ${sheet.is_locked ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.tds && (
                <p className="mt-1 text-xs text-red-500">{errors.tds}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan/Advance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.loan_advance}
                onChange={(e) => handleChange("loan_advance", e.target.value)}
                disabled={sheet.is_locked}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.loan_advance ? "border-red-300" : "border-gray-300"
                } ${sheet.is_locked ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.loan_advance && (
                <p className="mt-1 text-xs text-red-500">{errors.loan_advance}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penalty</label>
              <input
                type="number"
                step="0.01"
                value={formData.penalty}
                onChange={(e) => handleChange("penalty", e.target.value)}
                disabled={sheet.is_locked}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.penalty ? "border-red-300" : "border-gray-300"
                } ${sheet.is_locked ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.penalty && (
                <p className="mt-1 text-xs text-red-500">{errors.penalty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport/Others
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.transport_or_others}
                onChange={(e) => handleChange("transport_or_others", e.target.value)}
                disabled={sheet.is_locked}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.transport_or_others ? "border-red-300" : "border-gray-300"
                } ${sheet.is_locked ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.transport_or_others && (
                <p className="mt-1 text-xs text-red-500">{errors.transport_or_others}</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Deductions</span>
                <span className="font-bold text-red-600">
                  {formatIndianRupees(calculateTotalDeductions())}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="font-semibold text-gray-800">New Net Pay</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatIndianRupees(calculateNetPay())}
                </span>
              </div>
            </div>
          </div>

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
              disabled={loading || sheet.is_locked}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalarySheet;
