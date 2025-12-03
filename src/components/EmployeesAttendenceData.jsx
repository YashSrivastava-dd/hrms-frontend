import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployeeAtendenceAction, getAttendenceLogsOfEmploye, getUserDataAction, getPunchRecordsForAttendanceAction } from "../store/action/userDataAction";
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
  }, [dispatch])

  useEffect(() => {
    const dateFrom = date.startDate?.format("YYYY-MM-DD");
    const dateTo = date.endDate?.format("YYYY-MM-DD");
    if (userDataList?.role === "HR-Admin") {
      dispatch(getAllEmployeeAtendenceAction(dateFrom, dateTo, count))
      return;
    }
    else {
      // Fetch both attendance logs and punch records for employee
      dispatch(getAttendenceLogsOfEmploye(employeeId, dateFrom, dateTo, count));
      // Also fetch punch records as fallback/primary source
      dispatch(getPunchRecordsForAttendanceAction(employeeId));
      return;
    }

  }, [employeeId, date, count, dispatch, userDataList?.role]);

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
                      // Helper function to extract check-in time from PunchRecords
                      const extractCheckInTime = (punchRecords) => {
                        if (!punchRecords) return null;
                        try {
                          console.log('Extracting check-in from PunchRecords:', punchRecords);
                          const punches = punchRecords.split(',').map(p => p.trim()).filter(p => p);
                          console.log('Split punches:', punches);
                          
                          const checkInPunches = [];
                          
                          punches.forEach(punch => {
                            const lower = punch.toLowerCase();
                            // Match patterns like "09:11:in(IN)", "09:11:in (IN)", "#1 + 09:11:in (IN)", "09:11:59:in(IN)", "09:11 in", "09:11 (IN 1)"
                            // Check if it contains 'in' but not 'out' (to avoid matching "out" in "checkout")
                            // Also handle formats like "09:11 (IN 1)" where IN is in parentheses
                            const hasIn = (lower.includes(':in') || 
                                         lower.includes(' in') || 
                                         lower.includes('in(') ||
                                         lower.includes('(in') ||
                                         (lower.includes('(') && lower.includes('in') && !lower.includes('out'))) && 
                                         !lower.includes('out');
                            
                            if (hasIn) {
                              checkInPunches.push(punch);
                            }
                          });
                          
                          console.log('Check-in punches found:', checkInPunches);
                          
                          if (checkInPunches.length === 0) return null;
                          
                          // Get the first check-in time (earliest) - sort by time to ensure we get the earliest
                          const sortedCheckIns = checkInPunches.sort((a, b) => {
                            const timeA = a.match(/(\d{1,2}):(\d{2})/);
                            const timeB = b.match(/(\d{1,2}):(\d{2})/);
                            if (!timeA || !timeB) return 0;
                            const minutesA = parseInt(timeA[1], 10) * 60 + parseInt(timeA[2], 10);
                            const minutesB = parseInt(timeB[1], 10) * 60 + parseInt(timeB[2], 10);
                            return minutesA - minutesB;
                          });
                          
                          const firstCheckIn = sortedCheckIns[0];
                          console.log('Processing first check-in (earliest):', firstCheckIn);
                          
                          // Extract time using regex - handles multiple formats
                          // Try to match time before "in", ":", or parentheses
                          let timeMatch = firstCheckIn.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?=\s*[:]?\s*in|\(|$)/i);
                          if (!timeMatch) {
                            // Fallback: match any HH:MM or HH:MM:SS pattern at the start
                            timeMatch = firstCheckIn.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
                          }
                          
                          if (timeMatch) {
                            const hours = parseInt(timeMatch[1], 10);
                            const mins = parseInt(timeMatch[2], 10);
                            const secs = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
                            
                            console.log('Extracted time from:', firstCheckIn, '->', { hours, mins, secs });
                            
                            if (isNaN(hours) || isNaN(mins)) {
                              console.warn('Invalid hours or minutes:', { hours, mins });
                              return null;
                            }
                            
                            // Validate hours and minutes
                            if (hours < 0 || hours > 23 || mins < 0 || mins > 59) {
                              console.warn('Time out of range:', { hours, mins });
                              return null;
                            }
                            
                            // Create a date object for the attendance date with this time
                            if (employee.AttendanceDate) {
                              try {
                                const attendanceDate = new Date(employee.AttendanceDate);
                                if (!isNaN(attendanceDate.getTime())) {
                                  attendanceDate.setHours(hours, mins, secs || 0, 0);
                                  const isoString = attendanceDate.toISOString();
                                  console.log('Created ISO date:', isoString, 'from date:', employee.AttendanceDate, 'and time:', `${hours}:${mins}:${secs}`);
                                  return isoString;
                                } else {
                                  console.warn('Invalid attendance date:', employee.AttendanceDate);
                                }
                              } catch (error) {
                                console.warn('Error creating date:', error);
                              }
                            }
                            
                            // Format as HH:MM:SS if we can't create a date
                            const formattedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                            console.log('Formatted time string (fallback):', formattedTime);
                            return formattedTime;
                          }
                          
                          console.warn('No time match found in:', firstCheckIn);
                        } catch (error) {
                          console.error('Error extracting check-in time from PunchRecords:', error, punchRecords);
                        }
                        return null;
                      };
                      
                      // Helper function to extract check-out time from PunchRecords
                      const extractCheckOutTime = (punchRecords) => {
                        if (!punchRecords) return null;
                        try {
                          console.log('Extracting check-out from PunchRecords:', punchRecords);
                          const punches = punchRecords.split(',').map(p => p.trim()).filter(p => p);
                          console.log('Split punches:', punches);
                          
                          const checkOutPunches = [];
                          
                          punches.forEach(punch => {
                            const lower = punch.toLowerCase();
                            // Match patterns like "18:24:out(OUT)", "18:24:out (OUT)", "#2 - 18:24:out (OUT)", "18:24:59:out(OUT)", "18:24 out", "18:24 (OUT 1)"
                            // Check if it contains 'out' but not 'in' (to avoid matching "in" in "checkin")
                            // Also handle formats like "18:24 (OUT 1)" where OUT is in parentheses
                            const hasOut = (lower.includes(':out') || 
                                          lower.includes(' out') || 
                                          lower.includes('out(') ||
                                          lower.includes('(out') ||
                                          (lower.includes('(') && lower.includes('out') && !lower.includes('in'))) && 
                                          !lower.includes('in');
                            
                            if (hasOut) {
                              checkOutPunches.push(punch);
                            }
                          });
                          
                          console.log('Check-out punches found:', checkOutPunches);
                          
                          if (checkOutPunches.length === 0) return null;
                          
                          // Get the last check-out time (latest) - sort by time to ensure we get the latest
                          const sortedCheckOuts = checkOutPunches.sort((a, b) => {
                            const timeA = a.match(/(\d{1,2}):(\d{2})/);
                            const timeB = b.match(/(\d{1,2}):(\d{2})/);
                            if (!timeA || !timeB) return 0;
                            const minutesA = parseInt(timeA[1], 10) * 60 + parseInt(timeA[2], 10);
                            const minutesB = parseInt(timeB[1], 10) * 60 + parseInt(timeB[2], 10);
                            return minutesB - minutesA; // Sort descending to get latest
                          });
                          
                          const lastCheckOut = sortedCheckOuts[0];
                          console.log('Processing last check-out (latest):', lastCheckOut);
                          
                          // Extract time using regex - handles multiple formats
                          // Try to match time before "out", ":", or parentheses
                          let timeMatch = lastCheckOut.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?=\s*[:]?\s*out|\(|$)/i);
                          if (!timeMatch) {
                            // Fallback: match any HH:MM or HH:MM:SS pattern at the start
                            timeMatch = lastCheckOut.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
                          }
                          
                          if (timeMatch) {
                            const hours = parseInt(timeMatch[1], 10);
                            const mins = parseInt(timeMatch[2], 10);
                            const secs = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
                            
                            console.log('Extracted time from:', lastCheckOut, '->', { hours, mins, secs });
                            
                            if (isNaN(hours) || isNaN(mins)) {
                              console.warn('Invalid hours or minutes:', { hours, mins });
                              return null;
                            }
                            
                            // Validate hours and minutes
                            if (hours < 0 || hours > 23 || mins < 0 || mins > 59) {
                              console.warn('Time out of range:', { hours, mins });
                              return null;
                            }
                            
                            // Create a date object for the attendance date with this time
                            if (employee.AttendanceDate) {
                              try {
                                const attendanceDate = new Date(employee.AttendanceDate);
                                if (!isNaN(attendanceDate.getTime())) {
                                  attendanceDate.setHours(hours, mins, secs || 0, 0);
                                  const isoString = attendanceDate.toISOString();
                                  console.log('Created ISO date:', isoString, 'from date:', employee.AttendanceDate, 'and time:', `${hours}:${mins}:${secs}`);
                                  return isoString;
                                } else {
                                  console.warn('Invalid attendance date:', employee.AttendanceDate);
                                }
                              } catch (error) {
                                console.warn('Error creating date:', error);
                              }
                            }
                            
                            // Format as HH:MM:SS if we can't create a date
                            const formattedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                            console.log('Formatted time string (fallback):', formattedTime);
                            return formattedTime;
                          }
                          
                          console.warn('No time match found in:', lastCheckOut);
                        } catch (error) {
                          console.error('Error extracting check-out time from PunchRecords:', error, punchRecords);
                        }
                        return null;
                      };
                      
                      // Extract check-in and check-out from PunchRecords if InTime/OutTime are missing
                      let checkInTime = employee?.InTime;
                      let checkOutTime = employee?.OutTime;
                      
                      // Helper to check if a time value is actually valid/meaningful
                      const isTimeValid = (time) => {
                        if (!time) return false;
                        if (time === '--' || time === null || time === '') return false;
                        if (typeof time === 'string' && time.trim() === '') return false;
                        // Check if it's a valid time format (not just "00:00:00" or similar invalid times)
                        if (typeof time === 'string') {
                          const timeStr = time.trim();
                          // If it's an ISO date, check if it's valid
                          if (timeStr.includes('T')) {
                            try {
                              const date = new Date(timeStr);
                              if (isNaN(date.getTime())) return false;
                              // Check if time part is not midnight (which might indicate missing data)
                              const hours = date.getHours();
                              const mins = date.getMinutes();
                              const secs = date.getSeconds();
                              // If it's exactly midnight with no seconds, it might be a placeholder
                              if (hours === 0 && mins === 0 && secs === 0) {
                                // Check if the date part is valid (not 1970-01-01 which is epoch)
                                const year = date.getFullYear();
                                if (year < 2000) return false; // Likely a placeholder/invalid date
                              }
                              return true;
                            } catch {
                              return false;
                            }
                          }
                          // If it's just a time string like "00:00:00", it's likely invalid
                          if (timeStr.match(/^0{1,2}:0{1,2}(:0{1,2})?$/)) return false;
                          // Check for other placeholder patterns
                          if (timeStr.toLowerCase().includes('null') || timeStr.toLowerCase().includes('undefined')) return false;
                        }
                        return true;
                      };
                      
                      // Check if InTime is missing or invalid
                      const isInTimeMissing = !isTimeValid(checkInTime);
                      
                      // Check if OutTime is missing or invalid
                      const isOutTimeMissing = !isTimeValid(checkOutTime);
                      
                      // Always try to extract from PunchRecords if available
                      // Priority: If InTime/OutTime are missing or invalid, extract from PunchRecords
                      // This ensures we show times from punch records even if attendance data doesn't have them
                      if (employee?.PunchRecords && employee.PunchRecords.trim() !== '') {
                        console.log('✓ PunchRecords available for date:', employee.AttendanceDate, 'Value:', employee.PunchRecords);
                        
                        // Always try to extract check-in time if missing or invalid
                        if (isInTimeMissing) {
                          console.log('→ InTime is missing/invalid, attempting extraction from PunchRecords');
                          const extractedInTime = extractCheckInTime(employee.PunchRecords);
                          if (extractedInTime) {
                            checkInTime = extractedInTime;
                            console.log('✓✓ Successfully extracted check-in time:', extractedInTime);
                          } else {
                            console.log('✗✗ Failed to extract check-in time from PunchRecords');
                          }
                        } else {
                          // Even if InTime exists, check if it's a placeholder and try to extract from PunchRecords
                          if (checkInTime && typeof checkInTime === 'string') {
                            const timeStr = checkInTime.trim();
                            // Check for placeholder patterns
                            if (timeStr.includes('00:00:00') || 
                                timeStr === '--' || 
                                timeStr === '' ||
                                timeStr.toLowerCase().includes('null')) {
                              console.log('→ InTime appears to be placeholder, attempting extraction from PunchRecords');
                              const extractedInTime = extractCheckInTime(employee.PunchRecords);
                              if (extractedInTime) {
                                checkInTime = extractedInTime;
                                console.log('✓✓ Replaced placeholder with extracted check-in time:', extractedInTime);
                              }
                            } else {
                              console.log('→ InTime exists and appears valid:', checkInTime);
                            }
                          }
                        }
                        
                        // Always try to extract check-out time if missing or invalid
                        if (isOutTimeMissing) {
                          console.log('→ OutTime is missing/invalid, attempting extraction from PunchRecords');
                          const extractedOutTime = extractCheckOutTime(employee.PunchRecords);
                          if (extractedOutTime) {
                            checkOutTime = extractedOutTime;
                            console.log('✓✓ Successfully extracted check-out time:', extractedOutTime);
                          } else {
                            console.log('✗✗ Failed to extract check-out time from PunchRecords');
                          }
                        } else {
                          // Even if OutTime exists, check if it's a placeholder and try to extract from PunchRecords
                          if (checkOutTime && typeof checkOutTime === 'string') {
                            const timeStr = checkOutTime.trim();
                            // Check for placeholder patterns
                            if (timeStr.includes('00:00:00') || 
                                timeStr === '--' || 
                                timeStr === '' ||
                                timeStr.toLowerCase().includes('null')) {
                              console.log('→ OutTime appears to be placeholder, attempting extraction from PunchRecords');
                              const extractedOutTime = extractCheckOutTime(employee.PunchRecords);
                              if (extractedOutTime) {
                                checkOutTime = extractedOutTime;
                                console.log('✓✓ Replaced placeholder with extracted check-out time:', extractedOutTime);
                              }
                            } else {
                              console.log('→ OutTime exists and appears valid:', checkOutTime);
                            }
                          }
                        }
                      } else {
                        console.log('⚠⚠ No PunchRecords available for date:', employee.AttendanceDate, 'Employee:', employee?.EmployeeName);
                        // Log what data we do have
                        console.log('Available data:', {
                          InTime: employee?.InTime,
                          OutTime: employee?.OutTime,
                          Duration: employee?.Duration,
                          Status: employee?.Status,
                          hasPunchRecords: !!employee?.PunchRecords,
                          PunchRecordsValue: employee?.PunchRecords
                        });
                      }
                      
                      // Handle Duration - can be number (minutes) or string ("08:34")
                      let hours = 0;
                      let minutes = 0;
                      let durationInMinutes = 0;
                      
                      // First, try to get duration from Duration field
                      if (typeof employee.Duration === 'number' && employee.Duration > 0) {
                        durationInMinutes = employee.Duration;
                        hours = Math.floor(durationInMinutes / 60);
                        minutes = durationInMinutes % 60;
                      } else if (typeof employee.Duration === 'string' && employee.Duration.includes(':')) {
                        const [h, m] = employee.Duration.split(':').map(Number);
                        hours = isNaN(h) ? 0 : h;
                        minutes = isNaN(m) ? 0 : m;
                        durationInMinutes = hours * 60 + minutes;
                      } else if (employee.DurationString && employee.DurationString.includes(':')) {
                        const [h, m] = employee.DurationString.split(':').map(Number);
                        hours = isNaN(h) ? 0 : h;
                        minutes = isNaN(m) ? 0 : m;
                        durationInMinutes = hours * 60 + minutes;
                      }
                      
                      // If duration is still 0, calculate from checkInTime and checkOutTime (which may be extracted from PunchRecords)
                      if (durationInMinutes === 0 && checkInTime && checkOutTime) {
                        try {
                          // Handle ISO format (2025-11-29T09:05:59.000Z)
                          let inTime, outTime;
                          if (checkInTime.includes('T')) {
                            inTime = new Date(checkInTime);
                            outTime = new Date(checkOutTime);
                          } else if (checkInTime.includes(' ')) {
                            // Space-separated format (2025-11-29 09:05:59)
                            inTime = new Date(checkInTime);
                            outTime = new Date(checkOutTime);
                          } else if (checkInTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                            // Time-only format (09:11:59) - need to combine with attendance date
                            if (employee.AttendanceDate) {
                              const attendanceDate = new Date(employee.AttendanceDate);
                              const [h1, m1, s1] = checkInTime.split(':');
                              const [h2, m2, s2] = checkOutTime.split(':');
                              inTime = new Date(attendanceDate);
                              inTime.setHours(parseInt(h1, 10), parseInt(m1, 10), s1 ? parseInt(s1, 10) : 0, 0);
                              outTime = new Date(attendanceDate);
                              outTime.setHours(parseInt(h2, 10), parseInt(m2, 10), s2 ? parseInt(s2, 10) : 0, 0);
                              // If check-out is earlier than check-in, assume it's the next day
                              if (outTime < inTime) {
                                outTime.setDate(outTime.getDate() + 1);
                              }
                            } else {
                              // Can't calculate without date
                              inTime = null;
                              outTime = null;
                            }
                          } else {
                            // Try parsing as-is
                            inTime = new Date(checkInTime);
                            outTime = new Date(checkOutTime);
                          }
                          
                          if (inTime && outTime && !isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
                            const diffMs = outTime - inTime;
                            if (diffMs > 0) {
                              durationInMinutes = Math.floor(diffMs / (1000 * 60));
                              hours = Math.floor(durationInMinutes / 60);
                              minutes = durationInMinutes % 60;
                            }
                          }
                        } catch (error) {
                          console.warn('Error calculating duration from checkInTime/checkOutTime:', error);
                        }
                      }
                      
                      // Final summary log (after duration calculation)
                      console.log('=== FINAL TIMES SUMMARY for', employee.AttendanceDate, '===');
                      console.log('Employee:', employee?.EmployeeName);
                      console.log('Check In Time:', checkInTime, '(was missing:', isInTimeMissing, ')');
                      console.log('Check Out Time:', checkOutTime, '(was missing:', isOutTimeMissing, ')');
                      console.log('Has PunchRecords:', !!employee?.PunchRecords);
                      console.log('PunchRecords value:', employee?.PunchRecords);
                      console.log('Effective Hours:', hours, 'h', minutes, 'm');
                      console.log('==========================================');
                      
                      const hasPunchRecords = !!(checkInTime || employee.PunchRecords);
                      const hasApprovedLeave = !!(employee.LeaveType || employee.leaveType);
                      
                      // Check if this is a weekend based on working days configuration
                      let isWeekendDay = false;
                      if (employee.AttendanceDate) {
                        try {
                          const attendanceDate = new Date(employee.AttendanceDate);
                          if (!isNaN(attendanceDate.getTime())) {
                            const dayOfWeek = attendanceDate.getDay(); // 0 = Sunday, 6 = Saturday
                            
                            // Get working days configuration - check from employee or find from other employees
                            let workingDays = employee.workingDays;
                            if (!workingDays && employees && employees.length > 0) {
                              const employeeWithWorkingDays = employees.find(e => e.workingDays);
                              workingDays = employeeWithWorkingDays?.workingDays;
                            }
                            // Default to 5 if not found
                            workingDays = workingDays || "5";
                            
                            // If workingDays is 6, then Saturday (6) is a working day, only Sunday (0) is weekend
                            if (workingDays === "6" || workingDays === 6) {
                              isWeekendDay = dayOfWeek === 0; // Only Sunday is weekend
                            }
                            // If workingDays is 5, then both Saturday (6) and Sunday (0) are weekends
                            else if (workingDays === "5" || workingDays === 5) {
                              isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6; // Sunday and Saturday are weekends
                            }
                            // Default: both Saturday and Sunday are weekends
                            else {
                              isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                            }
                          }
                        } catch (error) {
                          console.warn('Error checking weekend:', error);
                        }
                      }
                      
                      // Helper function to get day type and colors with inline styles
                      const getDayTypeStyle = (durationMinutes, status, hasPunchRecords, hasApprovedLeave, isWeekend) => {
                        // Check for Holiday first - Blue
                        if (status === "Holiday") {
                          return {
                            type: "Holiday",
                            style: {
                              backgroundColor: "#dbeafe",
                              color: "#1e40af"
                            }
                          };
                        }
                        
                        // Check for weekend - Off Day (gray) - unless there's comp-off work
                        if (isWeekend && !hasPunchRecords) {
                          return {
                            type: "Off Day",
                            style: {
                              backgroundColor: "#e5e7eb",
                              color: "#374151"
                            }
                          };
                        }
                        
                        // Weekend with punch records might be comp-off, but still show as off day if no comp-off
                        if (isWeekend && hasPunchRecords) {
                          // Check if it's a valid comp-off (4+ hours)
                          if (durationMinutes >= 4 * 60) {
                            return {
                              type: "Comp-Off",
                              style: {
                                backgroundColor: "#e9d5ff",
                                color: "#7c3aed"
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
                        }
                        
                        // Check for approved leave - White
                        if (hasApprovedLeave && !hasPunchRecords) {
                          const leaveTypeDisplay = employee.LeaveType || employee.leaveType || 'Leave';
                          return {
                            type: leaveTypeDisplay,
                            style: {
                              backgroundColor: "#ffffff",
                              color: "#111827",
                              border: "2px solid #111827"
                            }
                          };
                        }
                        
                        // If has punch records but duration is 0, it might be an active punch (no check-out yet)
                        if (hasPunchRecords && durationMinutes === 0 && checkInTime && !checkOutTime) {
                          return {
                            type: "Present",
                            style: {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            }
                          };
                        }

                        // Full Day - Green
                        if (durationMinutes >= 8 * 60 + 20) {
                          return {
                            type: "Full Day",
                            style: {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            }
                          };
                        } 
                        // Half Day - Yellow
                        else if (durationMinutes >= 4 * 60 && durationMinutes < 8 * 60 + 20) {
                          return {
                            type: "Half Day",
                            style: {
                              backgroundColor: "#fef3c7",
                              color: "#92400e"
                            }
                          };
                        } 
                        // Present with some hours
                        else if (durationMinutes > 0) {
                          return {
                            type: "Present",
                            style: {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            }
                          };
                        } 
                        // Absent - Red (only if not a weekend)
                        else if (status === "Absent" && !hasPunchRecords && !hasApprovedLeave && !isWeekend) {
                          return {
                            type: "Absent",
                            style: {
                              backgroundColor: "#fecaca",
                              color: "#b91c1c"
                            }
                          };
                        } 
                        // Has punch records but duration is 0 - show as present
                        else if (hasPunchRecords) {
                          return {
                            type: "Present",
                            style: {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            }
                          };
                        } 
                        // Default - Off Day
                        else {
                          return {
                            type: "Off Day",
                            style: {
                              backgroundColor: "#e5e7eb",
                              color: "#374151"
                            }
                          };
                        }
                      };

                      const dayTypeInfo = getDayTypeStyle(durationInMinutes, employee.Status, hasPunchRecords, hasApprovedLeave, isWeekendDay);
                      const dayType = dayTypeInfo.type;
                      const dayTypeStyle = dayTypeInfo.style;

                      // Helper function to get status colors with inline styles (like days column)
                      const getStatusStyle = (status, hasApprovedLeave, isWeekend) => {
                        console.log('getStatusStyle called with:', status, 'hasApprovedLeave:', hasApprovedLeave, 'isWeekend:', isWeekend);
                        
                        // Normalize the status string to handle case and whitespace
                        const normalizedStatus = status?.trim() || '';
                        console.log('Normalized status:', normalizedStatus);
                        
                        // Weekend - Off Day (gray)
                        if (isWeekend) {
                          return {
                            backgroundColor: "#e5e7eb",
                            color: "#374151"
                          };
                        }
                        
                        // Approved Leave - White with black border
                        if (hasApprovedLeave && !hasPunchRecords) {
                          return {
                            backgroundColor: "#ffffff",
                            color: "#111827",
                            border: "2px solid #111827"
                          };
                        }
                        
                        switch (normalizedStatus) {
                          case "Present":
                          case "Full Day":
                            return {
                              backgroundColor: "#bbf7d0",
                              color: "#15803d"
                            };
                          case "1/2 Present":
                          case "½Present":
                          case "Half Day":
                            return {
                              backgroundColor: "#fef3c7",
                              color: "#92400e"
                            };
                          case "Absent":
                            return {
                              backgroundColor: "#fecaca",
                              color: "#b91c1c"
                            };
                          case "Holiday":
                            return {
                              backgroundColor: "#dbeafe",
                              color: "#1e40af"
                            };
                          case "Weekly Off":
                          case "WeeklyOff":
                          case "Off Day":
                          case "Comp-Off":
                          default:
                            return {
                              backgroundColor: "#e5e7eb",
                              color: "#374151"
                            };
                        }
                      };

                      // Calculate actual status based on duration and punch records
                      let actualStatus = employee.Status || 'Absent';
                      
                      // Check for Holiday first
                      if (actualStatus === 'Holiday') {
                        actualStatus = 'Holiday';
                      }
                      // Check for weekend - show as Off Day
                      else if (isWeekendDay) {
                        if (hasPunchRecords && durationInMinutes >= 4 * 60) {
                          actualStatus = 'Comp-Off';
                        } else {
                          actualStatus = 'Off Day';
                        }
                      }
                      // Check for approved leave
                      else if (hasApprovedLeave && !hasPunchRecords) {
                        actualStatus = 'Leave';
                      }
                      // Check for punch records
                      else if (hasPunchRecords) {
                        if (durationInMinutes >= 8 * 60) {
                          actualStatus = 'Full Day';
                        } else if (durationInMinutes >= 4 * 60) {
                          actualStatus = 'Half Day';
                        } else if (durationInMinutes > 0 || checkInTime) {
                          actualStatus = 'Present';
                        }
                      }
                      
                      const statusStyle = getStatusStyle(actualStatus, hasApprovedLeave, isWeekendDay);
                      console.log('Status Debug:', {
                        originalStatus: employee.Status,
                        actualStatus: actualStatus,
                        durationInMinutes: durationInMinutes,
                        hasPunchRecords: hasPunchRecords,
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
                              {hasApprovedLeave && !hasPunchRecords 
                                ? (employee.LeaveType || employee.leaveType || 'Leave')
                                : (actualStatus || "Unknown")}
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
                                {(() => {
                                  if (!checkInTime) return "--";
                                  // Handle ISO format (2025-11-29T09:05:59.000Z)
                                  if (checkInTime.includes("T")) {
                                    try {
                                      const date = new Date(checkInTime);
                                      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                    } catch { return "--"; }
                                  }
                                  // Handle space-separated format (2025-11-29 09:05:59)
                                  if (checkInTime.includes(" ")) {
                                    const time = checkInTime.split(" ")[1];
                                    return time === "00:00:00" ? "--" : time || "--";
                                  }
                                  // Handle time-only format (09:11:59)
                                  if (checkInTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                                    const [h, m, s] = checkInTime.split(':');
                                    const date = new Date();
                                    date.setHours(parseInt(h, 10), parseInt(m, 10), s ? parseInt(s, 10) : 0, 0);
                                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                  }
                                  return checkInTime || "--";
                                })()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {(() => {
                                  if (!checkOutTime) return "--";
                                  // Handle ISO format (2025-11-29T18:05:59.000Z)
                                  if (checkOutTime.includes("T")) {
                                    try {
                                      const date = new Date(checkOutTime);
                                      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                    } catch { return "--"; }
                                  }
                                  // Handle space-separated format (2025-11-29 18:05:59)
                                  if (checkOutTime.includes(" ")) {
                                    const time = checkOutTime.split(" ")[1];
                                    return time === "00:00:00" ? "--" : time || "--";
                                  }
                                  // Handle time-only format (18:24:59)
                                  if (checkOutTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                                    const [h, m, s] = checkOutTime.split(':');
                                    const date = new Date();
                                    date.setHours(parseInt(h, 10), parseInt(m, 10), s ? parseInt(s, 10) : 0, 0);
                                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                  }
                                  return checkOutTime || "--";
                                })()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {hours > 0 || minutes > 0 ? `${hours}h ${minutes}m` : '--'}
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
