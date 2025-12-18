import React from "react";
import { FaTimes, FaPrint, FaDownload, FaLock, FaUnlock, FaUser, FaBuilding, FaCalendarAlt, FaMoneyBillWave, FaCalculator } from "react-icons/fa";
import { formatIndianRupees } from "../../utils/currencyFormatter";
import salarySheetService from "../../services/salarySheetService";

const SalarySheetDetail = ({ sheet, onClose, onUpdate, isAdmin }) => {
  if (!sheet) return null;

  const handleToggleLock = async () => {
    if (!isAdmin) {
      alert("You don't have permission to lock/unlock salary sheets.");
      return;
    }

    try {
      await salarySheetService.updateSalarySheet(sheet._id, {
        is_locked: !sheet.is_locked,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error toggling lock:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const monthName = new Date(sheet.year, sheet.month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Salary Sheet Details</h2>
            <p className="text-blue-100 mt-1">{monthName}</p>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={handleToggleLock}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
                title={sheet.is_locked ? "Unlock" : "Lock"}
              >
                {sheet.is_locked ? <FaUnlock /> : <FaLock />}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
              title="Print"
            >
              <FaPrint />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <FaUser className="text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">Employee Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Employee Name</label>
                <p className="text-gray-900 font-medium">{sheet.employee_id?.employeeName || sheet.employee_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Employee Code</label>
                <p className="text-gray-900">{sheet.employee_id?.employeeCode || sheet.employee_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Designation</label>
                <p className="text-gray-900">{sheet.employee_id?.designation || "N/A"}</p>
              </div>
              {sheet.employee_id?.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{sheet.employee_id.email}</p>
                </div>
              )}
              {sheet.employee_id?.contactNo && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact</label>
                  <p className="text-gray-900">{sheet.employee_id.contactNo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Salary Period */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <FaCalendarAlt className="text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Salary Period</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Month</label>
                <p className="text-gray-900 font-medium">{monthName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payable Days</label>
                <p className="text-gray-900">{sheet.payable_days || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Worked Days</label>
                <p className="text-gray-900">{sheet.worked_days || 0}</p>
              </div>
            </div>
          </div>

          {/* Salary Components */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <FaMoneyBillWave className="text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Salary Components</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Basic Salary</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.salary_components?.basic || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">HRA</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.salary_components?.hra || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Travel Allowance</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.salary_components?.travel_allowance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Special Allowance</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.salary_components?.special_allowance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                <span className="font-semibold text-gray-800">Gross Salary</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatIndianRupees(sheet.gross_salary || sheet.adjusted_gross || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <FaCalculator className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Deductions</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Employee PF</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.deductions?.employee_pf || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Employee ESI</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.deductions?.employee_esi || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">TDS</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.deductions?.tds || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Loan/Advance</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.deductions?.loan_advance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Penalty</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.deductions?.penalty || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Transport/Others</span>
                <span className="font-medium text-gray-900">
                  {formatIndianRupees(sheet.deductions?.transport_or_others || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-red-50 rounded-lg px-3">
                <span className="font-semibold text-gray-800">Total Deductions</span>
                <span className="font-bold text-red-600 text-lg">
                  {formatIndianRupees(sheet.deductions?.total_deductions || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Net Pay</h3>
                <p className="text-sm text-gray-600">Amount to be credited</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">
                  {formatIndianRupees(sheet.net_pay)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-sm font-medium text-gray-600">Generated At</label>
                <p className="text-gray-900">
                  {sheet.generated_at
                    ? new Date(sheet.generated_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Generated By</label>
                <p className="text-gray-900">{sheet.generated_by || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Daily Rate</label>
                <p className="text-gray-900">{formatIndianRupees(sheet.daily_rate || 0)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sheet.is_locked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {sheet.is_locked ? "Locked" : "Unlocked"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalarySheetDetail;
