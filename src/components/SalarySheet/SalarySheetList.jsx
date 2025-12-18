import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSalarySheets } from "../../hooks/useSalarySheets";
import { formatIndianRupees } from "../../utils/currencyFormatter";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaMoneyBillWave,
} from "react-icons/fa";
import SalarySheetDetail from "./SalarySheetDetail";
import EditSalarySheet from "./EditSalarySheet";
import GenerateSalarySheets from "./GenerateSalarySheets";
import { safeGetLocalStorage, safeGet } from "../../utils/safariHelpers";

const SalarySheetList = () => {
  console.log("SalarySheetList component rendering...");
  
  // Early test - if this doesn't show, component isn't rendering
  const [hasRendered, setHasRendered] = useState(false);
  
  useEffect(() => {
    console.log("SalarySheetList useEffect - component mounted successfully");
    setHasRendered(true);
  }, []);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    month: "",
    year: new Date().getFullYear(),
    employee_code: "",
    search: "",
  });

  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Get user role from Redux state (matching Sidebar pattern)
  const userDataState = useSelector((state) => state.userData);
  const userData = safeGet(userDataState, 'data', {});
  const userDataInner = safeGet(userData, 'data', {});
  const userRole = safeGet(userDataInner, 'role', null) || userData?.data?.role || userData?.role || userDataState?.data?.data?.role;
  const employeeCode = safeGetLocalStorage("employeId");
  
  console.log("SalarySheetList - User data:", { 
    userRole, 
    employeeCode, 
    userDataState,
    userData,
    userDataInner,
    fullPath: userDataState?.data?.data?.role
  });

  // Determine if user has admin access
  const isAdmin = useMemo(() => {
    const adminRoles = ["HR-Admin", "Super-Admin", "Admin"];
    const isAdminUser = adminRoles.includes(userRole);
    console.log("SalarySheetList - Admin check:", { userRole, isAdminUser });
    return isAdminUser;
  }, [userRole]);

  // Fetch salary sheets
  const { data, loading, error, refetch, pagination } = useSalarySheets(filters);
  
  console.log("SalarySheetList - API state:", { data, loading, error, pagination });

  // Filter data based on role
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // If user is not admin, filter to show only their own salary sheets
    if (!isAdmin && employeeCode) {
      return data.filter(
        (sheet) => sheet.employee_code === employeeCode || sheet.employee_id?.employeeCode === employeeCode
      );
    }

    return data;
  }, [data, isAdmin, employeeCode]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle view detail
  const handleViewDetail = (sheet) => {
    setSelectedSheet(sheet);
    setShowDetail(true);
  };

  // Handle edit
  const handleEdit = (sheet) => {
    if (sheet.is_locked) {
      alert("Cannot edit locked salary sheet. Please unlock it first.");
      return;
    }
    setSelectedSheet(sheet);
    setShowEdit(true);
  };

  // Handle delete
  const handleDelete = async (sheet) => {
    if (!isAdmin) {
      alert("You don't have permission to delete salary sheets.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete salary sheet for ${sheet.employee_id?.employeeName || sheet.employee_code}?`)) {
      try {
        const salarySheetService = (await import("../../services/salarySheetService")).default;
        await salarySheetService.deleteSalarySheet(sheet._id);
        refetch();
        setDeleteConfirm(null);
      } catch (error) {
        console.error("Error deleting salary sheet:", error);
      }
    }
  };

  // Handle lock/unlock
  const handleToggleLock = async (sheet) => {
    if (!isAdmin) {
      alert("You don't have permission to lock/unlock salary sheets.");
      return;
    }

    try {
      const salarySheetService = (await import("../../services/salarySheetService")).default;
      await salarySheetService.updateSalarySheet(sheet._id, {
        is_locked: !sheet.is_locked,
      });
      refetch();
    } catch (error) {
      console.error("Error toggling lock:", error);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      month: "",
      year: new Date().getFullYear(),
      employee_code: "",
      search: "",
    });
  };

  // Month options
  const months = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Debug: Log component render
  useEffect(() => {
    console.log("SalarySheetList component mounted/rendered", {
      userRole,
      isAdmin,
      dataLength: data?.length,
      loading,
      error
    });
  }, [userRole, isAdmin, data, loading, error]);

  // Simple test render first - if you see this, component is rendering
  if (!hasRendered) {
    return (
      <div className="p-6 bg-blue-500 text-white min-h-screen">
        <h1 className="text-2xl font-bold">Loading SalarySheetList...</h1>
        <p>Component is initializing...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ minHeight: '100vh' }}>
      {/* CRITICAL TEST - If you see this, component is rendering */}
      <div className="bg-red-500 text-white p-4 mb-4 rounded-lg font-bold text-xl">
        🚨 SALARY SHEET LIST COMPONENT IS RENDERING - IF YOU SEE THIS, IT WORKS! 🚨
      </div>
      
      {/* Debug Banner - Remove after testing */}
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4 text-sm">
        <strong>✅ Debug: SalarySheetList IS RENDERING!</strong> 
        <br />User Role: {userRole || 'Not found'}, 
        <br />Is Admin: {isAdmin ? 'Yes' : 'No'}, 
        <br />Data: {data?.length || 0} items, 
        <br />Loading: {loading ? 'Yes' : 'No'}, 
        <br />Error: {error || 'None'}
      </div>
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Salary Sheets</h1>
              <p className="text-gray-600">View and manage employee salary information</p>
            </div>
          </div>

          {/* Generate Button - Always show for HR-Admin, Super-Admin, Admin */}
          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <button
                onClick={() => {
                  console.log("Generate button clicked, opening modal");
                  setShowGenerate(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <FaCalendarAlt className="text-sm" />
                <span>Generate Salary Sheets</span>
              </button>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Admin access required to generate salary sheets
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button - Prominent placement for HR-Admin */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Generate Salary Sheets</h2>
              <p className="text-gray-600">Create salary sheets for all employees for a specific month and year</p>
            </div>
            <button
              onClick={() => {
                console.log("Generate button clicked, opening modal");
                setShowGenerate(true);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3"
            >
              <FaCalendarAlt className="text-xl" />
              <span>Generate Salary Sheets</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <FaFilter className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Code Filter (Admin only) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Code
              </label>
              <input
                type="text"
                value={filters.employee_code}
                onChange={(e) => handleFilterChange("employee_code", e.target.value)}
                placeholder="Enter employee code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Search */}
          <div className={isAdmin ? "" : "md:col-span-2"}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search by name or code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <FaTimes className="text-sm" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading salary sheets...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Salary Sheets Found</h3>
            <p className="text-gray-600">
              {filters.month || filters.employee_code || filters.search
                ? "Try adjusting your filters"
                : "No salary sheets available"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile scroll indicator */}
            <div className="md:hidden bg-blue-50 border-b border-blue-200 px-4 py-2">
              <div className="flex items-center justify-center text-blue-700 text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Scroll horizontally to view all columns
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Employee</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Month/Year</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Worked Days</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Gross Salary</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Deductions</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Net Pay</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-bold text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((sheet) => (
                    <tr key={sheet._id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {sheet.employee_id?.employeeName || sheet.employee_code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sheet.employee_id?.employeeCode || sheet.employee_code}
                          </div>
                          {sheet.employee_id?.designation && (
                            <div className="text-xs text-gray-400">{sheet.employee_id.designation}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {new Date(sheet.year, sheet.month - 1).toLocaleString("default", {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-sm">{sheet.worked_days || 0}</td>
                      <td className="py-4 px-4 text-sm font-medium">
                        {formatIndianRupees(sheet.gross_salary || sheet.adjusted_gross)}
                      </td>
                      <td className="py-4 px-4 text-sm text-red-600">
                        {formatIndianRupees(sheet.deductions?.total_deductions || 0)}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-green-600">
                        {formatIndianRupees(sheet.net_pay)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            sheet.is_locked
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {sheet.is_locked ? "Locked" : "Unlocked"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetail(sheet)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(sheet)}
                                disabled={sheet.is_locked}
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                  sheet.is_locked
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                                title={sheet.is_locked ? "Locked - Cannot Edit" : "Edit"}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleLock(sheet)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                title={sheet.is_locked ? "Unlock" : "Lock"}
                              >
                                {sheet.is_locked ? <FaUnlock /> : <FaLock />}
                              </button>
                              <button
                                onClick={() => handleDelete(sheet)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{" "}
                  {pagination.totalRecords} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors duration-200"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors duration-200"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showDetail && selectedSheet && (
        <SalarySheetDetail
          sheet={selectedSheet}
          onClose={() => {
            setShowDetail(false);
            setSelectedSheet(null);
          }}
          onUpdate={refetch}
          isAdmin={isAdmin}
        />
      )}

      {showEdit && selectedSheet && (
        <EditSalarySheet
          sheet={selectedSheet}
          onClose={() => {
            setShowEdit(false);
            setSelectedSheet(null);
          }}
          onUpdate={refetch}
        />
      )}

      {showGenerate && (
        <GenerateSalarySheets
          onClose={() => {
            setShowGenerate(false);
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default SalarySheetList;
