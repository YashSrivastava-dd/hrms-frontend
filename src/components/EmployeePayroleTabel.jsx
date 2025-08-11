import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPayrollAndPayslipAction, getUserDataAction } from "../store/action/userDataAction";
import NewPaySlip from "./NewPaySlip";
import { FaFilter, FaTimes } from "react-icons/fa";

const EmployeePayroleTable = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [payslipModel, setPayslipModel] = useState(false);
  const [payslipModelData, setPayslipModelData] = useState("");
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserDataAction());
    dispatch(getPayrollAndPayslipAction());
  }, [dispatch]);

  // Handle clicking outside the month filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMonthFilter && !event.target.closest('.month-filter-dropdown')) {
        setShowMonthFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthFilter]);

  const { data } = useSelector((state) => state.salarySlipData);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 🔍 Utility to convert "2024-01", "2024-01-01", or similar to "January"
  const getMonthName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Invalid date
    return date.toLocaleString("default", { month: "long" });
  };

  // ✅ Filter logic with month conversion
  const filteredData = data?.data?.filter((employee) => {
    const paySlipMonth = getMonthName(employee?.pay_slip_month);
    const monthMatch = selectedMonth
      ? paySlipMonth.toLowerCase() === selectedMonth.toLowerCase()
      : true;

    return monthMatch;
  });

  // Custom Month Filter Component
  const CustomMonthFilter = () => {
    const handleMonthSelect = (month) => {
      setSelectedMonth(selectedMonth === month ? "" : month);
      setShowMonthFilter(false);
    };

    const clearFilter = () => {
      setSelectedMonth("");
      setShowMonthFilter(false);
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowMonthFilter(!showMonthFilter)}
          className={`flex items-center space-x-2 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-48 hover:bg-gray-50 transition-colors duration-200 ${
            selectedMonth 
              ? 'border-blue-300 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700'
          }`}
        >
          <FaFilter className={`absolute left-3 w-4 h-4 ${
            selectedMonth ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <span className="text-gray-700">
            {selectedMonth || "All Months"}
          </span>
          {selectedMonth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilter();
              }}
              className="ml-2 p-1 rounded-full hover:bg-blue-200 transition-colors duration-200"
            >
              <FaTimes className="w-3 h-3 text-blue-500" />
            </button>
          )}
        </button>

        {showMonthFilter && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto month-filter-dropdown transition-all duration-200 ease-in-out min-w-[280px]">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Select Month</h3>
                {selectedMonth && (
                  <button
                    onClick={clearFilter}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-100 px-2 py-1 rounded transition-colors duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => {
                  const isSelected = selectedMonth === month;
                  const isCurrentMonth = index === currentMonth;
                  const hasPayslips = data?.data?.some(employee => 
                    getMonthName(employee?.pay_slip_month) === month
                  );
                  const payslipCount = data?.data?.filter(employee => 
                    getMonthName(employee?.pay_slip_month) === month
                  ).length || 0;

                  return (
                    <button
                      key={index}
                      onClick={() => handleMonthSelect(month)}
                      className={`p-3 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                          : isCurrentMonth
                          ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300 shadow-md'
                          : hasPayslips
                          ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-sm'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 hover:from-gray-100 hover:to-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">{month.slice(0, 3)}</span>
                        {isCurrentMonth && !isSelected && (
                          <span className="text-xs text-blue-600 font-semibold mt-1">Current</span>
                        )}
                        {hasPayslips && (
                          <span className={`text-xs mt-1 font-medium ${
                            isSelected ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {payslipCount} {payslipCount === 1 ? 'payslip' : 'payslips'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 full-height-content">
      {payslipModel ? (
        <NewPaySlip
          setPayslipModel={setPayslipModel}
          payslipModelData={payslipModelData}
        />
      ) : (
        <div>
          {/* Month Filter */}
          <div className="flex justify-end items-center mb-4">
            <CustomMonthFilter />
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">Employee ID</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">Employee Name</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">Designation</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">Month</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">Paid Days</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">LOP</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-bold">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map((employee, index) => (
                    <tr key={index} className="border-t hover:bg-gray-100 transition-colors duration-200">
                      <td className="py-4 px-4 whitespace-nowrap">{employee?.employee_basic_details?.employee_code}</td>
                      <td className="py-4 px-4 whitespace-nowrap truncate max-w-[150px]" title={employee?.employee_basic_details?.employee_name}>{employee?.employee_basic_details?.employee_name}</td>
                      <td className="py-4 px-4 whitespace-nowrap truncate max-w-[120px]" title={employee?.employee_basic_details?.department || employee?.employee_basic_details?.designation}>{employee?.employee_basic_details?.department || employee?.employee_basic_details?.designation}</td>
                      <td className="py-4 px-4 whitespace-nowrap">{employee.pay_slip_month}</td>
                      <td className="py-4 px-4 whitespace-nowrap">{employee.leave_summary?.payable_days || employee.leave_summary?.workedDays}</td>
                      <td className="py-4 px-4 whitespace-nowrap">{employee.leave_summary?.unpaid_days || employee.leave_summary?.absent}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPayslipModel(true);
                            setPayslipModelData(employee);
                          }}
                          className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12">
                      <div className="text-center">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Payroll Data Found</h3>
                        <p className="text-gray-600 mb-4">
                          {selectedMonth 
                            ? `No payroll data available for ${selectedMonth}`
                            : "No payroll data available at the moment"
                          }
                        </p>
                        <div className="text-sm text-gray-500">
                          {selectedMonth 
                            ? "Try selecting a different month or check back later"
                            : "Payroll data will appear here once it's generated"
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroleTable;
