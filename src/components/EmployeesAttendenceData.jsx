import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployeeAtendenceAction, getAttendenceLogsOfEmploye, getUserDataAction, getPunchRecordsForAttendanceAction, getAllUserDataAction } from "../store/action/userDataAction";
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
  const { loading: punchLoading, data: punchRecordsData } = useSelector((state) => state.punchRecordsForAttendance);
  const { data: allUserData } = useSelector((state) => state.allUserData);
  
  // Merge attendance logs and punch records - attendance logs take priority, punch records fill gaps
  const allEmployees = React.useMemo(() => {
    // Get attendance logs data (primary source)
    const attendanceData = data?.data || [];
    const allAttendanceData = allAttendancedata?.data || [];
    const punchData = punchRecordsData?.data || [];
    
    console.log('Attendance data sources:', {
      attendanceLogs: attendanceData.length,
      allAttendance: allAttendanceData.length,
      punchRecords: punchData.length
    });
    
    // Use attendance logs if available, otherwise use allAttendanceData
    const primaryAttendanceData = attendanceData.length > 0 ? attendanceData : allAttendanceData;
    
    // If no attendance data, use punch records
    if (primaryAttendanceData.length === 0 && punchData.length > 0) {
      console.log('No attendance data, using punch records:', punchData.length, 'records');
      return punchData;
    }
    
    // If no punch records, use attendance data
    if (punchData.length === 0 && primaryAttendanceData.length > 0) {
      console.log('No punch records, using attendance data:', primaryAttendanceData.length, 'records');
      return primaryAttendanceData;
    }
    
    // Merge both: attendance data takes priority, but fill missing InTime/OutTime/Duration from punch records
    if (primaryAttendanceData.length > 0 && punchData.length > 0) {
      // Helper function to normalize date for comparison
      const normalizeDate = (dateStr) => {
        if (!dateStr) return null;
        try {
          // Handle different date formats
          let date;
          if (typeof dateStr === 'string') {
            // If it's already in YYYY-MM-DD format, use it directly
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return dateStr;
            }
            // Try parsing as date
            date = new Date(dateStr);
          } else {
            date = new Date(dateStr);
          }
          if (isNaN(date.getTime())) return null;
          // Return YYYY-MM-DD format for comparison
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.warn('Error normalizing date:', dateStr, error);
          return null;
        }
      };
      
      // Create a map of punch records by date for quick lookup
      const punchByDate = new Map();
      punchData.forEach(record => {
        const dateKey = normalizeDate(record.AttendanceDate);
        if (dateKey) {
          // Store the record, but if multiple records exist for same date, keep the one with PunchRecords
          const existing = punchByDate.get(dateKey);
          if (!existing || (record.PunchRecords && !existing.PunchRecords)) {
            punchByDate.set(dateKey, record);
        }
        }
      });
      
      console.log('Punch records by date map:', Array.from(punchByDate.entries()).map(([date, record]) => ({
        date,
        hasPunchRecords: !!record.PunchRecords,
        hasInTime: !!record.InTime,
        hasOutTime: !!record.OutTime
      })));
      
      // Merge attendance data with punch records - fill missing fields from punch records
      const mergedData = primaryAttendanceData.map(attendanceRecord => {
        const dateKey = normalizeDate(attendanceRecord.AttendanceDate);
        const punchRecord = dateKey ? punchByDate.get(dateKey) : null;
        
        console.log('Merging data for date:', dateKey, {
          hasAttendanceData: !!attendanceRecord,
          hasPunchRecord: !!punchRecord,
          attendanceInTime: attendanceRecord?.InTime,
          attendanceOutTime: attendanceRecord?.OutTime,
          attendancePunchRecords: attendanceRecord?.PunchRecords,
          punchRecordInTime: punchRecord?.InTime,
          punchRecordOutTime: punchRecord?.OutTime,
          punchRecordPunchRecords: punchRecord?.PunchRecords
        });
        
        if (!punchRecord) {
          // No punch record for this date, use attendance data as-is
          console.log('No punch record found for date:', dateKey, 'using attendance data only');
          return attendanceRecord;
        }
        
        // Merge: use attendance data as base, fill missing fields from punch records
        const merged = { ...attendanceRecord };
        
        // Fill InTime if missing in attendance data
        if ((!merged.InTime || merged.InTime === '--' || merged.InTime === null) && punchRecord.InTime) {
          merged.InTime = punchRecord.InTime;
          console.log('Filled InTime from punch records for date:', dateKey);
        }
        
        // Fill OutTime if missing in attendance data
        if ((!merged.OutTime || merged.OutTime === '--' || merged.OutTime === null) && punchRecord.OutTime) {
          merged.OutTime = punchRecord.OutTime;
          console.log('Filled OutTime from punch records for date:', dateKey);
        }
        
        // Fill Duration if missing or 0 in attendance data
        if ((!merged.Duration || merged.Duration === 0 || merged.Duration === '--') && punchRecord.Duration) {
          merged.Duration = punchRecord.Duration;
          merged.DurationString = punchRecord.DurationString || punchRecord.Duration;
          console.log('Filled Duration from punch records for date:', dateKey, 'Duration:', punchRecord.Duration);
        }
        
        // Always use punch record's PunchRecords if available (it's the source of truth)
        // This ensures we have the most complete punch data for extraction
        if (punchRecord.PunchRecords) {
          merged.PunchRecords = punchRecord.PunchRecords;
          console.log('Using PunchRecords from punch records for date:', dateKey, 'PunchRecords:', punchRecord.PunchRecords);
        }
        
        // Fill Status if missing or Absent in attendance data but punch record shows Present
        if ((!merged.Status || merged.Status === 'Absent') && punchRecord.Status && punchRecord.Status !== 'Absent') {
          merged.Status = punchRecord.Status;
        }
        
        return merged;
      });
      
      // Add punch records that don't exist in attendance data
      const attendanceDates = new Set(primaryAttendanceData.map(r => normalizeDate(r.AttendanceDate)).filter(Boolean));
      punchData.forEach(punchRecord => {
        const punchDate = normalizeDate(punchRecord.AttendanceDate);
        if (punchDate && !attendanceDates.has(punchDate)) {
          console.log('Adding punch record for missing date:', punchDate, punchRecord);
          mergedData.push(punchRecord);
        }
      });
      
      console.log('Merged data summary:', {
        attendanceRecords: primaryAttendanceData.length,
        punchRecords: punchData.length,
        totalMerged: mergedData.length,
        uniqueDates: new Set(mergedData.map(r => normalizeDate(r.AttendanceDate)).filter(Boolean)).size
      });
      
      return mergedData;
    }
    
    return primaryAttendanceData;
  }, [punchRecordsData, data, allAttendancedata]);
  
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
    dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
  }, [dispatch])

  // Track if this is the initial mount to ensure we always fetch on page load
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    // Always fetch fresh data when component mounts or dependencies change
    const dateFrom = date.startDate?.format("YYYY-MM-DD");
    const dateTo = date.endDate?.format("YYYY-MM-DD");
    
    // Log when API calls are being made
    if (isInitialMount.current) {
      console.log('🔄 Attendance page mounted - fetching fresh data');
      isInitialMount.current = false;
    } else {
      console.log('🔄 Attendance data dependencies changed - refetching');
    }
    
    if (userDataList?.role === "HR-Admin") {
      // For HR-Admin, fetch all employee attendance
      console.log('📡 API Call: getAllEmployeeAtendenceAction', { dateFrom, dateTo, count });
      dispatch(getAllEmployeeAtendenceAction(dateFrom, dateTo, count));
      return;
    }
    else {
      // For regular employees, fetch both attendance logs and punch records
      // Always make API calls to ensure fresh data
      if (employeeId) {
        console.log('📡 API Call: getAttendenceLogsOfEmploye', { employeeId, dateFrom, dateTo, count });
        console.log('📡 API Call: getPunchRecordsForAttendanceAction', { employeeId });
      dispatch(getAttendenceLogsOfEmploye(employeeId, dateFrom, dateTo, count));
      dispatch(getPunchRecordsForAttendanceAction(employeeId));
      } else {
        console.warn('⚠️ No employeeId found - cannot fetch attendance data');
      }
      return;
    }

  }, [employeeId, date, count, dispatch, userDataList?.role]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get employee shift timing from allEmployees data
  const getEmployeeShiftTiming = useMemo(() => {
    if (!employeeId) return null;
    const allUserEmployees = allUserData?.data || [];
    if (allUserEmployees.length === 0) return null;
    const employee = allUserEmployees.find(emp => emp.employeeId === employeeId);
    return employee?.shiftTime || null;
  }, [employeeId, allUserData]);

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
                    "Shift Time",
                    "Check In",
                    "Check Out",
                    "Duration",
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
                {(loading || punchLoading)
                  ? Array(10)
                    .fill(0)
                    .map((_, idx) => <SkeletonLoader key={idx} />)
                  : !date.startDate && !date.endDate && employees.length === 0
                  ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-6xl mb-4">📅</div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h3>
                          <p className="text-gray-600 mb-4">No attendance data available for the current month.</p>
                          <p className="text-sm text-gray-500">Please select a date range to view attendance records.</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : employees.length === 0 && (date.startDate || date.endDate)
                  ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-6xl mb-4">🔍</div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h3>
                          <p className="text-gray-600 mb-4">No attendance records found for the selected date range.</p>
                          <p className="text-sm text-gray-500">Try selecting a different date range or check if data exists for the selected period.</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : employees
                    ?.map((employee, index) => {
                      // Format time from backend - supports ISO format, space-separated, or HH:MM format
                      const formatTime = (timeStr) => {
                        if (!timeStr || timeStr === '--' || timeStr === null || timeStr === '') return "--";
                        try {
                          // Handle ISO format (e.g., "2025-11-29T09:05:59.000Z")
                          if (timeStr.includes("T")) {
                            const date = new Date(timeStr);
                            if (isNaN(date.getTime())) return "--";
                            const hours = date.getHours();
                            const mins = date.getMinutes();
                            const secs = date.getSeconds();
                            // Check for invalid times
                            if (hours === 0 && mins === 0 && secs === 0) {
                              const year = date.getFullYear();
                              if (year < 2000) return "--";
                            }
                            return date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit', 
                              hour12: true 
                            });
                          }
                          // Handle space-separated format (e.g., "2025-11-29 09:05:59")
                          if (timeStr.includes(" ")) {
                            const time = timeStr.split(" ")[1];
                            if (!time || time === "00:00:00") return "--";
                            // Convert to Date object for formatting
                            const [h, m, s] = time.split(':');
                            const date = new Date();
                            date.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s || 0, 10), 0);
                            return date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit', 
                              hour12: true 
                            });
                          }
                          // Handle HH:MM or HH:MM:SS format
                          if (timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                            const [h, m, s] = timeStr.split(':');
                            if (parseInt(h, 10) === 0 && parseInt(m, 10) === 0) return "--";
                            const date = new Date();
                            date.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s || 0, 10), 0);
                            return date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit', 
                              hour12: true 
                            });
                          }
                          return timeStr || "--";
                        } catch (error) {
                          return "--";
                        }
                      };

                      // Calculate effective hours - for CEO and HR dashboards, use ONLY backend Duration
                      // For other roles, allow fallback calculations
                      const calculateEffectiveHours = () => {
                        const isCEOOrHR = userDataList?.role === "HR-Admin" || userDataList?.role === "Super-Admin";
                        
                        // For CEO and HR dashboards: Use ONLY backend Duration - NO CALCULATIONS
                        if (isCEOOrHR) {
                          // Use ONLY backend Duration field - NO FRONTEND CALCULATIONS
                          if (employee.Duration && employee.Duration !== 0 && employee.Duration !== '--' && employee.Duration !== '') {
                            // If Duration is a number (minutes), convert to display format
                            if (typeof employee.Duration === 'number') {
                              const hours = Math.floor(employee.Duration / 60);
                              const minutes = employee.Duration % 60;
                              return `${hours}h ${minutes}m`;
                            }
                            // If Duration is a string with colon (HH:MM format), format for display
                            else if (typeof employee.Duration === 'string' && employee.Duration.includes(':')) {
                              const [hours, minutes] = employee.Duration.split(':').map(Number);
                              if (!isNaN(hours) && !isNaN(minutes)) {
                                return `${hours}h ${minutes}m`;
                              }
                            }
                          }
                          
                          // If DurationString field exists from backend, use it directly
                          if (employee.DurationString) {
                            return employee.DurationString;
                          }
                          
                          // If no backend Duration available, return "--" - NO CALCULATIONS
                          return "--";
                        }
                        
                        // For other roles: Allow fallback calculations (existing logic)
                        // Priority 1: Use backend Duration field if available and valid
                        let durationInMinutes = 0;
                        
                        if (employee.Duration && employee.Duration !== 0 && employee.Duration !== '--' && employee.Duration !== '') {
                          // If Duration is a number (minutes), use it directly
                          if (typeof employee.Duration === 'number') {
                            durationInMinutes = employee.Duration;
                          }
                          // If Duration is a string with colon (HH:MM format), convert to minutes
                          else if (typeof employee.Duration === 'string' && employee.Duration.includes(':')) {
                            const [hours, minutes] = employee.Duration.split(':').map(Number);
                            if (!isNaN(hours) && !isNaN(minutes)) {
                              durationInMinutes = hours * 60 + minutes;
                            }
                          }
                        }
                        
                        // Priority 2: If Duration is missing or 0, calculate from PunchRecords (sum all IN-OUT pairs)
                        if (durationInMinutes === 0 && employee?.PunchRecords && employee.PunchRecords.trim() !== '') {
                          try {
                            const punchRecords = employee.PunchRecords;
                            // Split by comma and clean
                            const punches = punchRecords.split(',').map(p => p.trim()).filter(p => p && p.length > 0);
                            
                            // Extract all IN and OUT times with their order
                            const punchPairs = [];
                            punches.forEach(punch => {
                              const lower = punch.toLowerCase();
                              const isIn = (lower.includes(':in') || lower.includes(' in') || lower.includes('in(') || lower.includes('(in')) && !lower.includes('out');
                              const isOut = (lower.includes(':out') || lower.includes(' out') || lower.includes('out(') || lower.includes('(out')) && !lower.includes('in');
                              
                              if (isIn || isOut) {
                                // Extract time from punch record
                                let timeMatch = punch.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?=\s*[:]?\s*(in|out)|\(|$)/i);
                                if (!timeMatch) {
                                  timeMatch = punch.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
                                }
                                
                                if (timeMatch) {
                                  const h = parseInt(timeMatch[1], 10);
                                  const m = parseInt(timeMatch[2], 10);
                                  
                                  if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                                    const totalMinutes = h * 60 + m;
                                    punchPairs.push({
                                      time: totalMinutes,
                                      type: isIn ? 'IN' : 'OUT'
                                    });
                                  }
                                }
                              }
                            });
                            
                            // Sort by time
                            punchPairs.sort((a, b) => a.time - b.time);
                            
                            // Calculate total by summing all IN-OUT pairs
                            let currentIn = null;
                            punchPairs.forEach(punch => {
                              if (punch.type === 'IN') {
                                if (currentIn === null) {
                                  currentIn = punch.time;
                                }
                              } else if (punch.type === 'OUT') {
                                if (currentIn !== null) {
                                  const duration = punch.time - currentIn;
                                  if (duration > 0) {
                                    durationInMinutes += duration;
                                  }
                                  currentIn = null;
                                }
                              }
                            });
                          } catch (error) {
                            console.warn('Error calculating duration from PunchRecords:', error);
                          }
                        }
                        
                        // Priority 3: If still 0, calculate from InTime and OutTime
                        if (durationInMinutes === 0 && employee?.InTime && employee?.OutTime) {
                          try {
                            const formatTimeToMinutes = (timeStr) => {
                              if (!timeStr || timeStr === '--' || timeStr === null || timeStr === '') return null;
                              
                              let date;
                              // Handle ISO format
                              if (timeStr.includes("T")) {
                                date = new Date(timeStr);
                              }
                              // Handle space-separated format
                              else if (timeStr.includes(" ")) {
                                date = new Date(timeStr);
                              }
                              // Handle HH:MM or HH:MM:SS format
                              else if (timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                                const [h, m, s] = timeStr.split(':');
                                const baseDate = employee.AttendanceDate ? new Date(employee.AttendanceDate) : new Date();
                                date = new Date(baseDate);
                                date.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s || 0, 10), 0);
                              } else {
                                date = new Date(timeStr);
                              }
                              
                              if (date && !isNaN(date.getTime())) {
                                return date.getHours() * 60 + date.getMinutes();
                              }
                              return null;
                            };
                            
                            const inMinutes = formatTimeToMinutes(employee.InTime);
                            const outMinutes = formatTimeToMinutes(employee.OutTime);
                            
                            if (inMinutes !== null && outMinutes !== null) {
                              let diff = outMinutes - inMinutes;
                              // Handle case where out time is next day (night shift)
                              if (diff < 0) {
                                diff += 24 * 60; // Add 24 hours
                              }
                              if (diff > 0 && diff <= 24 * 60) {
                                durationInMinutes = diff;
                              }
                            }
                          } catch (error) {
                            console.warn('Error calculating duration from InTime/OutTime:', error);
                          }
                        }
                        
                        // Format the result
                        if (durationInMinutes > 0) {
                          const hours = Math.floor(durationInMinutes / 60);
                          const minutes = durationInMinutes % 60;
                          return `${hours}h ${minutes}m`;
                        }
                        
                        // If DurationString field exists, use it as fallback
                        if (employee.DurationString) {
                          return employee.DurationString;
                        }
                        
                        return "--";
                      };

                      // Get shift time from backend
                      const getShiftTime = () => {
                        // Priority 1: Use getEmployeeShiftTiming from allUserData
                        const shiftTiming = getEmployeeShiftTiming;
                        if (shiftTiming?.startAt && shiftTiming?.endAt) {
                          return `${shiftTiming.startAt} - ${shiftTiming.endAt}`;
                        }
                        // Priority 2: Check if shift timing is available in current employee record
                        if (employee?.shiftTime?.startAt && employee?.shiftTime?.endAt) {
                          return `${employee.shiftTime.startAt} - ${employee.shiftTime.endAt}`;
                        }
                        // Priority 3: Try to get from allUserData by employeeId
                        if (employee?.employeeId) {
                          const allUserEmployees = allUserData?.data || [];
                          const emp = allUserEmployees.find(e => e.employeeId === employee.employeeId);
                          if (emp?.shiftTime?.startAt && emp?.shiftTime?.endAt) {
                            return `${emp.shiftTime.startAt} - ${emp.shiftTime.endAt}`;
                          }
                        }
                        return "--";
                      };

                      // Get status from backend - use AttendanceStatus or Status field
                      const getStatus = () => {
                        return employee.AttendanceStatus || employee.Status || 'Not Available';
                      };

                      const status = getStatus();
                      const statusColor = status === 'Present' || status === 'Full Day'
                        ? 'bg-green-100 text-green-800'
                        : status === 'Absent'
                        ? 'bg-red-100 text-red-800'
                        : status === 'Half Day'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'Holiday'
                        ? 'bg-blue-100 text-blue-800'
                        : status === 'Comp-Off' || status === 'Comp Off'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800';

                      // All old calculation code removed - using only backend data now

                      return (
                        <tr
                          key={employee.id || index}
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
                              className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                            >
                              {employee.LeaveType || employee.leaveType || status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {employee?.AttendanceDate?.split("T")[0] || "--"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {getShiftTime()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {formatTime(employee.InTime)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {formatTime(employee.OutTime)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {calculateEffectiveHours()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-gray-500">
                              {employee?.LeaveType || '---'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <button
                              className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                                (!employee?.PunchRecords || employee?.PunchRecords.trim() === '')
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              }`}
                              onClick={() => handleOpenModal(employee)}
                              disabled={!employee?.PunchRecords || employee?.PunchRecords.trim() === ''}
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
        {filteredAndSortedEmployees.length > 0 && (
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
        )}
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
