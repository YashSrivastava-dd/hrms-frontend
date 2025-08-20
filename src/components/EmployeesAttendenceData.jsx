import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployeeAtendenceAction, getAttendenceLogsOfEmploye, getUserDataAction } from "../store/action/userDataAction";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const EmployeesAttendanceData = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState({ startDate: null, endDate: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [count, setCount] = useState(1); // Pagination count
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for 1-30, 'desc' for 30-1
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { data: dataa } = useSelector((state) => state.userData);
  const userDataList = dataa?.data
  const { loading, data } = useSelector((state) => state.attendanceLogs);
  const { data: allAttendancedata } = useSelector((state) => state.allEmployeeAttencance);
  const allEmployees = data?.data? data?.data:allAttendancedata?.data || [];
  
  // Filter data for current month first, then sort
  const currentMonthEmployees = React.useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];
    
    const currentMonthNum = currentMonth.month(); // 0-11
    const currentYearNum = currentMonth.year();
    
    return allEmployees.filter(employee => {
      if (!employee.AttendanceDate) return false;
      
      const attendanceDate = new Date(employee.AttendanceDate);
      const employeeMonth = attendanceDate.getMonth();
      const employeeYear = attendanceDate.getFullYear();
      
      return employeeMonth === currentMonthNum && employeeYear === currentYearNum;
    });
  }, [allEmployees, currentMonth]);
  
  // Sort the current month data
  const sortedEmployees = React.useMemo(() => {
    if (!currentMonthEmployees || currentMonthEmployees.length === 0) return [];
    
    return [...currentMonthEmployees].sort((a, b) => {
      const dateA = new Date(a.AttendanceDate);
      const dateB = new Date(b.AttendanceDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [currentMonthEmployees, sortOrder]);

  // Apply search filter to the current month sorted dataset
  const filteredAndSortedEmployees = React.useMemo(() => {
    if (!sortedEmployees || sortedEmployees.length === 0) return [];
    
    return sortedEmployees.filter((employee) =>
      employee?.EmployeeName?.toLowerCase().includes(
        search.toLowerCase()
      )
    );
  }, [sortedEmployees, search]);
  
  // Client-side pagination to show only 10 items from filtered and sorted current month data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const employees = filteredAndSortedEmployees.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);
  console.log('allAttendancedata', allAttendancedata)

  const employeeId = localStorage.getItem("employeId");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserDataAction());
  }, [dispatch])

  useEffect(() => {
    const dateFrom = date.startDate?.format("YYYY-MM-DD");
    const dateTo = date.endDate?.format("YYYY-MM-DD");
    if (userDataList?.role === "HR-Admin") {
      dispatch(getAllEmployeeAtendenceAction(dateFrom, dateTo, count))
      return;
    }
    else {
      dispatch(getAttendenceLogsOfEmploye(employeeId, dateFrom, dateTo, count));
      return;
    }

  }, [employeeId, date, count, dispatch]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Sort function to toggle between ascending and descending order
  const handleSort = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Calendar functions
  const openCalendar = () => {
    setCalendarOpen(true);
    setSelectedStartDate(date.startDate);
    setSelectedEndDate(date.endDate);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
  };

  const applyDateRange = () => {
    setDate({
      startDate: selectedStartDate,
      endDate: selectedEndDate
    });
    setCurrentPage(1); // Reset to first page when date range changes
    setCalendarOpen(false);
  };

  const selectDate = (selectedDate) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null);
    } else {
      // Complete the range
      if (selectedDate.isBefore(selectedStartDate)) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(selectedDate);
      } else {
        setSelectedEndDate(selectedDate);
      }
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const isDateInRange = (date) => {
    if (!selectedStartDate) return false;
    if (!selectedEndDate) return date.isSame(selectedStartDate, 'day');
    return date.isSameOrAfter(selectedStartDate, 'day') && date.isSameOrBefore(selectedEndDate, 'day');
  };

  const isDateSelected = (date) => {
    return date.isSame(selectedStartDate, 'day') || date.isSame(selectedEndDate, 'day');
  };

  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');
    
    const days = [];
    let day = startOfWeek;
    
    while (day.isBefore(endOfWeek) || day.isSame(endOfWeek, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }
    
    return days;
  };

  const SkeletonLoader = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 hidden sm:table-cell">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      </td>
      <td className="px-4 py-4 sm:px-6">
        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <div className="h-8 bg-gray-300 rounded-lg w-20"></div>
      </td>
    </tr>
  );

  return (
    <div className="p-6 bg-gray-50 full-height-content flex flex-col">
      <div className="w-full flex-1">
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={handleSort}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              title={`Sort current month by date: ${sortOrder === 'asc' ? 'Oldest first (1-31)' : 'Newest first (31-1)'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={openCalendar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date.startDate && date.endDate 
                ? `${date.startDate.format('MMM DD')} - ${date.endDate.format('MMM DD, YYYY')}`
                : 'Select Date Range'
              }
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Table with Horizontal Scroll for Mobile */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  {[
                    "Employee Name",
                    "Status",
                    "Date",
                    "Check In",
                    "Check Out",
                    "Effective Hours",
                    "Days",
                    "Leave type",
                    "Records",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading
                  ? Array(10)
                    .fill(0)
                    .map((_, idx) => <SkeletonLoader key={idx} />)
                  : employees
                    ?.map((employee, index) => {
                      const hours = Math.floor(employee.Duration / 60);
                      const minutes = employee.Duration % 60;
                      // Helper function to get day type and colors with inline styles
                      const getDayTypeStyle = (duration, status) => {
                        if (duration >= 8 * 60 + 20) {
                          return {
                            type: "Full Day",
                            style: {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            }
                          };
                        } else if (duration >= 4 * 60 && duration < 8 * 60 + 20) {
                          return {
                            type: "Half Day",
                            style: {
                              backgroundColor: "#fed7aa",
                              color: "#c2410c"
                            }
                          };
                        } else if (status === "Absent") {
                          return {
                            type: "Off Day",
                            style: {
                              backgroundColor: "#fecaca",
                              color: "#b91c1c"
                            }
                          };
                        } else {
                          return {
                            type: "Off Day",
                            style: {
                              backgroundColor: "#e5e7eb",
                              color: "#374151"
                            }
                          };
                        }
                      };

                      const dayTypeInfo = getDayTypeStyle(employee.Duration, employee.Status);
                      const dayType = dayTypeInfo.type;
                      const dayTypeStyle = dayTypeInfo.style;

                      // Helper function to get status colors with inline styles (like days column)
                      const getStatusStyle = (status) => {
                        console.log('getStatusStyle called with:', status);
                        
                        // Normalize the status string to handle case and whitespace
                        const normalizedStatus = status?.trim() || '';
                        console.log('Normalized status:', normalizedStatus);
                        
                        switch (normalizedStatus) {
                          case "Present":
                            return {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            };
                          case "1/2 Present":
                          case "½Present":
                          case "Half Day":
                            return {
                              backgroundColor: "#fed7aa",
                              color: "#c2410c"
                            };
                          case "Absent":
                            return {
                              backgroundColor: "#fecaca",
                              color: "#b91c1c"
                            };
                          case "Weekly Off":
                          case "WeeklyOff":
                          case "Holiday":
                          case "Off Day":
                          default:
                            return {
                              backgroundColor: "#e5e7eb",
                              color: "#374151"
                            };
                        }
                      };

                      const statusStyle = getStatusStyle(employee.Status);
                      console.log('Status Debug:', {
                        status: employee.Status,
                        statusStyle: statusStyle,
                        hasStyle: !!statusStyle
                      });

                      return (
                        <tr
                          key={employee.id}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                                  {employee?.EmployeeName?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]" title={employee?.EmployeeName || "Unknown Employee"}>{employee?.EmployeeName || "Unknown Employee"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span 
                              className="inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border shadow-sm"
                              style={statusStyle}
                            >
                              {employee?.Status || "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {employee?.AttendanceDate?.split("T")[0] || "--"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {employee?.InTime?.split(" ")[1] === "00:00:00"
                                  ? "--"
                                  : employee?.InTime?.split(" ")[1] || "--"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {employee?.OutTime?.split(" ")[1] === "00:00:00"
                                  ? "--"
                                  : employee?.OutTime?.split(" ")[1] || "--"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {hours}h {minutes}m
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span 
                              className="inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border shadow-sm"
                              style={dayTypeStyle}
                            >
                              {dayType}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-gray-500">
                              {employee?.LeaveType || '---'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <button
                              className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                                (employee?.Duration === 0 || !employee?.Duration)
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              }`}
                              onClick={() => handleOpenModal(employee)}
                              disabled={employee?.Duration === 0 || !employee?.Duration}
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="hidden sm:inline">Records</span>
                              <span className="sm:hidden">View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center sm:justify-end mt-4 gap-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedEmployees.length)} of {filteredAndSortedEmployees.length} items
          </div>
          {currentPage === 1 ? "" :
          <button
            onClick={handlePrevious}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Previous
          </button>}
          <button
            onClick={handleNext}
            className={`px-6 py-2 rounded-lg ${
              currentPage >= totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Records Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box className="bg-white rounded-xl shadow-2xl mx-auto my-10 max-w-2xl border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-xl border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Punch Records</h2>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee?.EmployeeName} • {selectedEmployee?.AttendanceDate?.split("T")[0]}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {selectedEmployee?.PunchRecords ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Punch Records Timeline</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    // Clean and deduplicate punch records
                    const cleanPunchRecords = (punchRecords) => {
                      if (!punchRecords) return [];
                      
                      const punches = punchRecords
                        .split(",")
                        .map(p => p.trim())
                        .filter(p => p.length > 0);
                      
                      const uniquePunches = [];
                      const seen = new Set();
                      
                      punches.forEach(punch => {
                        const normalized = punch.replace(/\s+/g, ' ').trim();
                        if (!seen.has(normalized)) {
                          seen.add(normalized);
                          uniquePunches.push(punch);
                        }
                      });
                      
                      return uniquePunches;
                    };
                    
                    const cleanedRecords = cleanPunchRecords(selectedEmployee.PunchRecords);
                    
                    return cleanedRecords.map((item, index) => {
                      const isCheckIn = item.includes("in(IN") || item.includes(":in(");
                      
                      // Debug: log the punch record text
                      console.log('Punch record:', item.trim(), 'isCheckIn:', isCheckIn);
                      
                      // Only make punch-in records green, keep punch-out as original
                      const bgColor = isCheckIn ? "#dcfce7" : "#fee2e2";
                      const textColor = isCheckIn ? "#166534" : "#991b1b";
                      const borderColor = isCheckIn ? "#22c55e" : "#fca5a5";
                      
                      const icon = isCheckIn ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      );
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            borderColor: borderColor
                          }}
                        >
                          <div className="text-xs text-gray-500 font-medium">
                            #{index + 1}
                          </div>
                          <div className="flex-shrink-0">
                            {icon}
                          </div>
                          <span className="text-sm font-medium flex-1">
                            {item.trim()}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Punch Records</h3>
                <p className="text-gray-500">No punch records available for this entry.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Calendar Modal */}
      <Modal open={calendarOpen} onClose={closeCalendar}>
        <Box className="bg-white rounded-lg p-6 mx-auto my-10 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Date Range</h2>
            <button
              onClick={closeCalendar}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {currentMonth.format('MMMM YYYY')}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => {
                const isCurrentMonth = day.month() === currentMonth.month();
                const isToday = day.isSame(dayjs(), 'day');
                const isInRange = isDateInRange(day);
                const isSelected = isDateSelected(day);
                
                return (
                  <button
                    key={index}
                    onClick={() => selectDate(day)}
                    disabled={!isCurrentMonth}
                    className={`
                      p-2 text-sm rounded-lg transition-colors duration-200
                      ${!isCurrentMonth ? 'text-gray-300 cursor-default' : 'hover:bg-blue-50 cursor-pointer'}
                      ${isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                      ${isInRange ? 'bg-blue-200' : ''}
                      ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                      ${isCurrentMonth ? 'text-gray-900' : ''}
                    `}
                  >
                    {day.date()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Range Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Selected Range:</div>
            <div className="text-sm font-medium">
              {selectedStartDate ? (
                selectedEndDate ? (
                  `${selectedStartDate.format('MMM DD, YYYY')} - ${selectedEndDate.format('MMM DD, YYYY')}`
                ) : (
                  `${selectedStartDate.format('MMM DD, YYYY')} - Select end date`
                )
              ) : (
                'No date selected'
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={closeCalendar}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={applyDateRange}
              disabled={!selectedStartDate || !selectedEndDate}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                selectedStartDate && selectedEndDate
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Apply
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EmployeesAttendanceData;
