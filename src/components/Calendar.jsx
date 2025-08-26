import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { MdChevronLeft, MdChevronRight, MdToday, MdEvent } from "react-icons/md";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getCalenderLogsApiAction, postApplyCompOffLeaveAction } from "../store/action/userDataAction";
import { toast } from "react-toastify";
import safeToast from "../utils/safeToast";

// Constants
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];





function Calendar({ employeeId, userRole, onDaySelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState("compOff"); // Only comp-off now
  const [clickedDay, setClickedDay] = useState(null);

  const [compOffDayType, setCompOffDayType] = useState(""); // For comp-off day type selection
  const [isCompOffDurationDropdownOpen, setIsCompOffDurationDropdownOpen] = useState(false);
  const compOffDurationDropdownRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  
  // Validation states
  const [showCompOffDurationError, setShowCompOffDurationError] = useState(false);
  const [showReasonError, setShowReasonError] = useState(false);

  const dispatch = useDispatch();
  
  // Redux selectors
  const { data: dataaa } = useSelector((state) => state.calenderLogsData);
  const { data, error } = useSelector((state) => state.compoffReducer);
  const { data: dataa } = useSelector((state) => state.userData);
  const { data: data1, error: error1 } = useSelector((state) => state.regularizeReducer);



  const dayLogs = dataaa?.data;
  const userDataList = dataa?.data || [];

  // Memoized values
  const monthYear = useMemo(() => 
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`, 
    [currentYear, currentMonth]
  );

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Add the actual days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [currentYear, currentMonth]);

  const isToday = useMemo(() => {
    const today = new Date();
    return (day) => 
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();
  }, [currentMonth, currentYear]);

  // Effects
  useEffect(() => {
    if (employeeId) {
      dispatch(getCalenderLogsApiAction(monthYear, employeeId));
    }
  }, [monthYear, employeeId]);

  // Cleanup toasts on component unmount
  useEffect(() => {
    return () => {
      // Dismiss all toasts when component unmounts to prevent runtime errors
      safeToast.dismiss();
    };
  }, []);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown container
      const compOffContainer = event.target.closest('.comp-off-duration-dropdown');
      
      if (isCompOffDurationDropdownOpen && !compOffContainer) {
        setIsCompOffDurationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCompOffDurationDropdownOpen]);



  // Cleanup processed messages on component unmount
  useEffect(() => {
    return () => {
      processedMessagesRef.current.clear();
    };
  }, []);

  // Clear processed messages on component mount to prevent old messages from showing on page refresh
  useEffect(() => {
    processedMessagesRef.current.clear();
  }, []);

  useEffect(() => {
    if (error1) {
                  safeToast.error(error1);
    }
  }, [error1]);



  // Memoized functions
  const getDayType = useCallback((day) => {
    const formattedDate = `${day} ${MONTHS[currentMonth]} ${currentYear}`;
    const dayOff = dayLogs?.find((off) => off.AttendanceDate === formattedDate);
    
    if (!dayOff) {
      return {
        AttendanceStatus: null,
        inTimeData: null,
        isLeaveTaken: null,
        Status: null,
        leaveType: null
      };
    }

    const inTimeData = dayOff?.InTime?.split(' ')[1]?.slice(0, 5);
    
    return {
      AttendanceStatus: dayOff?.AttendanceStatus || null,
      inTimeData: inTimeData || null,
      isLeaveTaken: dayOff?.isLeaveTaken || null,
      Status: dayOff?.Status || null,
      leaveType: dayOff?.leaveType || null
    };
  }, [dayLogs, currentMonth, currentYear]);

  // Format time helper function
  const formatTime = useCallback((timeString) => {
    if (!timeString) return '--:--';
    // Extract time from format like "09:13 (IN 1)" or "18:31 (OUT 1)"
    const timeMatch = timeString.match(/(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeString;
  }, []);

  // Deduplicate and clean punch records
  const cleanPunchRecords = useCallback((punchRecords) => {
    if (!punchRecords) return [];
    
    // Split and clean punch records
    const punches = punchRecords
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0); // Remove empty entries
    
    // Remove duplicates while preserving order
    const uniquePunches = [];
    const seen = new Set();
    
    punches.forEach(punch => {
      // Normalize the punch record for comparison
      const normalized = punch.replace(/\s+/g, ' ').trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniquePunches.push(punch);
      }
    });
    
    return uniquePunches;
  }, []);

  // Check if regularization is allowed based on punch-in time
  const isRegularizationAllowed = useCallback((dayData) => {
    if (!dayData || !dayData.PunchRecords) return false;
    
    const punches = cleanPunchRecords(dayData.PunchRecords);
    const inTimes = punches.filter(p => p.includes("(IN")).map(p => formatTime(p));
    
    if (inTimes.length === 0) return false;
    
    // Get the first punch-in time
    const firstInTime = inTimes[0];
    if (!firstInTime || firstInTime === '--:--') return false;
    
    // Parse the time to minutes for comparison
    const [hours, minutes] = firstInTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    // Check if time is between 9:15 (555 minutes) and 9:31 (571 minutes)
    const minTime = 9 * 60 + 15; // 9:15 in minutes
    const maxTime = 9 * 60 + 31; // 9:31 in minutes
    
    return totalMinutes >= minTime && totalMinutes <= maxTime;
  }, [cleanPunchRecords, formatTime]);

  const getDayClass = useCallback((day) => {
    if (!day) return "bg-transparent";
    
    // Check if this is the clicked day
    const isClickedDay = clickedDay === day;
    
    // Check if this date is selectable (current date - 35 days, not in the future)
    const today = new Date();
    const selectedDate = new Date(currentYear, currentMonth, day);
    const thirtyFiveDaysAgo = new Date(today);
    thirtyFiveDaysAgo.setDate(today.getDate() - 35);
    
    const isSelectable = selectedDate >= thirtyFiveDaysAgo && selectedDate <= today;
    
    if (isToday(day)) {
      return isClickedDay 
        ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-4" 
        : "bg-blue-500 text-white shadow-white shadow-lg ring-2 ring-blue-300";
    }

    const { AttendanceStatus, inTimeData, isLeaveTaken, Status } = getDayType(day);

    // Base classes for different attendance statuses
    let baseClass = "";
    
    // Leave taken cases
    if (AttendanceStatus === "Present" || isLeaveTaken === true || 
        (AttendanceStatus === "Absent" && isLeaveTaken === true)) {
      baseClass = "bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:shadow-md";
    }
    // Absent cases
    else if (AttendanceStatus === "Absent" && (Status === 'Present' || Status === 'Absent')) {
      // Check if this day is eligible for regularization
      const dayData = dayLogs?.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
      const isRegularizationEligible = dayData && isRegularizationAllowed(dayData);
      
      if (isRegularizationEligible) {
        baseClass = "bg-orange-100 text-orange-800 border-2 border-orange-400 hover:bg-orange-200";
      } else {
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      }
    }
    else if (AttendanceStatus === "Absent" || Status === 'WeeklyOff') {
      baseClass = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
    }
    // Present cases
    else if (AttendanceStatus === "Full Day") {
      baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
    }
    else if (AttendanceStatus === "Half Day") {
      baseClass = "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200";
    }
    else if (AttendanceStatus === "Holiday") {
      baseClass = "bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200";
    }
    else if (inTimeData) {
      baseClass = "bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200";
    }
    else {
      baseClass = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
    }

    // Add selection indicator for clicked day
    if (isClickedDay) {
      baseClass += " ring-2 ring-purple-500 ring-offset-2 shadow-lg";
    }

    // Add visual indicator for selectable dates (current date - 35 days)
    if (isSelectable) {
      baseClass += " cursor-pointer hover:shadow-md transition-shadow duration-200";
    } else {
      baseClass += " cursor-not-allowed opacity-60";
    }

    return baseClass;
  }, [getDayType, isToday, clickedDay, currentYear, currentMonth, dayLogs, isRegularizationAllowed]);



  // Event handlers
  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(currentYear + 1);
        return 0;
      }
      return prev + 1;
    });
  }, [currentYear]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(currentYear - 1);
        return 11;
      }
      return prev - 1;
    });
  }, [currentYear]);

  const handleDayClick = useCallback((day) => {
    if (!day) return;

    const today = new Date();
    const selectedDate = new Date(currentYear, currentMonth, day);

    // Check if date is valid for selection - current date - 35 days (for Comp-Off)
    const thirtyFiveDaysAgo = new Date(today);
    thirtyFiveDaysAgo.setDate(today.getDate() - 35);
    
    const isValidDate = selectedDate >= thirtyFiveDaysAgo && selectedDate <= today;

    // Debug logging
    console.log('Date validation:', {
      selectedDate: selectedDate.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
      thirtyFiveDaysAgo: thirtyFiveDaysAgo.toISOString().split('T')[0],
      isValidDate,
      selectedMonth: selectedDate.getMonth(),
      todayMonth: today.getMonth(),
      selectedYear: selectedDate.getFullYear(),
      todayYear: today.getFullYear(),
      selectedDay: selectedDate.getDate()
    });

    // Get the selected day's data from calendar logs
    const formattedDate = `${day} ${MONTHS[currentMonth]} ${currentYear}`;
    const selectedDayData = dayLogs?.find((log) => log.AttendanceDate === formattedDate);
    
    // Call the callback to update the attendance display
    if (onDaySelect && selectedDayData) {
      onDaySelect(selectedDayData, formattedDate);
    }
    
    // Set the clicked day for visual feedback
    setClickedDay(day);

    // Allow selection for current date - 35 days (for Short Leave and Regularization)
    if (isValidDate) {
      // For regularization, check if the user's punch-in time allows it
      if (selectedDayData && selectedDayData.AttendanceStatus === "Absent") {
        // Check if regularization is allowed based on punch-in time
        if (!isRegularizationAllowed(selectedDayData)) {
          safeToast.error(
            "Regularization is only allowed if you punched in between 9:15 AM and 9:31 AM. Please check your punch-in time."
          );
          return;
        }
      }
      
      setSelectedDay(day);
      setModalOpen(true);
    } else {
      safeToast.error(
        "You can only apply Comp-Off for dates within the last 35 days from today."
      );
    }
  }, [currentYear, currentMonth, dayLogs, onDaySelect, isRegularizationAllowed]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedDay(null);
    setReason("");
    setActionType("compOff");
    setCompOffDayType("");
    setClickedDay(null);
    setIsCompOffDurationDropdownOpen(false);
    setShowCompOffDurationError(false);
    setShowReasonError(false);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Reset all validation errors first
    setShowCompOffDurationError(false);
    setShowReasonError(false);
    
    // Validate comp-off duration only when submitting comp-off
    if (!compOffDayType) {
      setShowCompOffDurationError(true);
      return;
    }
    
    // Validate reason
    if (!reason.trim()) {
      setShowReasonError(true);
      return;
    }

    const selectedDate = `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`;

    // Handle Comp-Off submissions (First Half, Second Half, or Full Day)
    let totalDays = 0;
    if (compOffDayType === 'firstHalf' || compOffDayType === 'secondHalf') {
      totalDays = 0.5;
    } else if (compOffDayType === 'fullDay') {
      totalDays = 1;
    }
    
    dispatch(postApplyCompOffLeaveAction(selectedDate, reason, totalDays));
    safeToast.success("Comp-Off request submitted successfully!");
    closeModal();
    
    // Modal is closed immediately after successful submission
  }, [reason, selectedDay, currentMonth, currentYear, dispatch, compOffDayType, closeModal]);



  const handleCompOffDurationSelect = useCallback((duration) => {
    setCompOffDayType(duration);
    setShowCompOffDurationError(false);
    setIsCompOffDurationDropdownOpen(false);
  }, []);

  const handleDropdownToggle = useCallback((dropdownType, e) => {
    e.stopPropagation();
    
    if (dropdownType === 'compOffDuration') {
      setIsCompOffDurationDropdownOpen(prev => !prev);
    }
  }, []);

  const handleReasonChange = useCallback((e) => {
    setReason(e.target.value);
    setShowReasonError(false); // Clear validation error when user starts typing
  }, []);

  // Calculate total hours from punch records
  const calculateTotalHours = useCallback((punchRecords) => {
    if (!punchRecords) return "00:00";
    
    const punches = cleanPunchRecords(punchRecords);
    const inTimes = punches.filter(p => p.includes("(IN")).map(p => formatTime(p));
    const outTimes = punches.filter(p => p.includes("(OUT")).map(p => formatTime(p));
    
    if (inTimes.length === 0 || outTimes.length === 0) return "00:00";
    
    // Calculate total hours from first in and last out
    const firstIn = inTimes[0];
    const lastOut = outTimes[outTimes.length - 1];
    
    if (!firstIn || !lastOut) return "00:00";
    
    const inMinutes = parseInt(firstIn.split(':')[0]) * 60 + parseInt(firstIn.split(':')[1]);
    const outMinutes = parseInt(lastOut.split(':')[0]) * 60 + parseInt(lastOut.split(':')[1]);
    
    const totalMinutes = outMinutes - inMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, [formatTime, cleanPunchRecords]);

  // Calculate effective hours considering leave types and special cases
  const calculateEffectiveHours = useCallback((dayData) => {
    if (!dayData) return "00:00";
    
    const { AttendanceStatus, Status, isLeaveTaken, leaveType, PunchRecords, InTime, OutTime, Duration } = dayData;
    
    // If Duration field is available and valid, use it (this might be the source of "8h3mins")
    if (Duration && Duration !== "" && Duration !== "00:00") {
      let durationResult;
      
      // Check if Duration is already in "HH:MM" format (like "08:03")
      if (typeof Duration === 'string' && Duration.includes(':')) {
        // Duration is already in correct format, use it directly
        durationResult = Duration;
      } else {
        // Duration is in minutes, convert to HH:MM format
        const hours = Math.floor(Duration / 60);
        const minutes = Duration % 60;
        durationResult = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      return durationResult;
    }
    
    // Debug logging for regularization days only
    if (leaveType === "regularized" || leaveType === "RL" || 
        (Status === "Present" && AttendanceStatus === "Absent") ||
        (isLeaveTaken === true && AttendanceStatus === "Absent") ||
        dayData?.RegularizationStatus === "Approved" ||
        dayData?.IsRegularized === true ||
        dayData?.RegularizationType === "RL") {
      // Regularization day detected - will use Duration field or fallback logic
    }
    
    // 1. Full Day attendance - use actual punch records or 8 hours
    if (AttendanceStatus === "Full Day") {
      if (PunchRecords) {
        return calculateTotalHours(PunchRecords);
      } else if (InTime && OutTime) {
        // Calculate from InTime and OutTime if no punch records
        const inTime = formatTime(InTime);
        const outTime = formatTime(OutTime);
        if (inTime !== '--:--' && outTime !== '--:--') {
          const inMinutes = parseInt(inTime.split(':')[0]) * 60 + parseInt(inTime.split(':')[1]);
          const outMinutes = parseInt(outTime.split(':')[0]) * 60 + parseInt(outTime.split(':')[1]);
          const totalMinutes = outMinutes - inMinutes;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      // Default to 8 hours for full day
      return "08:00";
    }
    
    // 2. Half Day attendance - use actual punch records or 4 hours
    if (AttendanceStatus === "Half Day") {
      if (PunchRecords) {
        return calculateTotalHours(PunchRecords);
      } else if (InTime && OutTime) {
        const inTime = formatTime(InTime);
        const outTime = formatTime(OutTime);
        if (inTime !== '--:--' && outTime !== '--:--') {
          const inMinutes = parseInt(inTime.split(':')[0]) * 60 + parseInt(inTime.split(':')[1]);
          const outMinutes = parseInt(outTime.split(':')[0]) * 60 + parseInt(outTime.split(':')[1]);
          const totalMinutes = outMinutes - inMinutes;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      // Default to 4 hours for half day
      return "04:00";
    }
    
    // 3. Regularization (RL) - calculate from actual punch records or use standard hours
    if (leaveType === "regularized" || leaveType === "RL" || 
        (Status === "Present" && AttendanceStatus === "Absent") || // Present status with absent attendance
        (isLeaveTaken === true && AttendanceStatus === "Absent") || // Leave taken but marked as absent (likely regularization)
        dayData?.RegularizationStatus === "Approved" || // Check if regularization status is approved
        dayData?.IsRegularized === true || // Check if isRegularized flag is true
        dayData?.RegularizationType === "RL") { // Check if regularization type is RL
      
      // First try to get actual hours from punch records
      if (PunchRecords) {
        const hours = calculateTotalHours(PunchRecords);
        if (hours !== "00:00") {
          return hours;
        }
      }
      
      // If no punch records, try to calculate from InTime and OutTime
      if (InTime && OutTime) {
        const inTime = formatTime(InTime);
        const outTime = formatTime(OutTime);
        if (inTime !== '--:--' && outTime !== '--:--') {
          const inMinutes = parseInt(inTime.split(':')[0]) * 60 + parseInt(inTime.split(':')[1]);
          const outMinutes = parseInt(outTime.split(':')[0]) * 60 + parseInt(outTime.split(':')[1]);
          const totalMinutes = outMinutes - inMinutes;
          
          // Validate the calculated hours (should be reasonable working hours)
          if (totalMinutes >= 0 && totalMinutes <= 24 * 60) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
        }
      }
      
      // If still no valid hours, assume it was a full working day
      return "08:00";
    }
    

    
    // 5. Short Leave (SL) - calculate actual hours worked + short leave hours
    if (leaveType === "shortLeave" || leaveType === "SL") {
      if (PunchRecords) {
        const actualHours = calculateTotalHours(PunchRecords);
        if (actualHours !== "00:00") {
          // Add short leave hours (typically 2-4 hours depending on company policy)
          const [hours, minutes] = actualHours.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + 240; // Add 4 hours for short leave
          const totalHours = Math.floor(totalMinutes / 60);
          const totalMinutesRemaining = totalMinutes % 60;
          return `${totalHours.toString().padStart(2, '0')}:${totalMinutesRemaining.toString().padStart(2, '0')}`;
        }
      }
      // If no punch records, assume 6 hours (full day minus short leave)
      return "06:00";
    }
    
    // 6. Comp-Off Leave - typically counted as full working day
    if (leaveType === "compOffLeave" || leaveType === "C-Off") {
      return "08:00";
    }
    
    // 7. Other approved leaves - calculate based on leave type
    if (isLeaveTaken === true && AttendanceStatus !== "Absent") {
      if (leaveType === "medicalLeave" || leaveType === "ML") {
        // Medical leave is typically full day
        return "08:00";
      } else if (leaveType === "casualLeave" || leaveType === "CL") {
        // Casual leave can be half or full day
        return "08:00";
      } else if (leaveType === "earnedLeave" || leaveType === "EL") {
        // Earned leave is typically full day
        return "08:00";
      } else {
        // Default for other leave types
        return "08:00";
      }
    }
    
    // 8. Present status - use actual punch records
    if (Status === "Present") {
      if (PunchRecords) {
        return calculateTotalHours(PunchRecords);
      } else if (InTime && OutTime) {
        const inTime = formatTime(InTime);
        const outTime = formatTime(OutTime);
        if (inTime !== '--:--' && outTime !== '--:--') {
          const inMinutes = parseInt(inTime.split(':')[0]) * 60 + parseInt(inTime.split(':')[1]);
          const outMinutes = parseInt(outTime.split(':')[0]) * 60 + parseInt(outTime.split(':')[1]);
          const totalMinutes = outMinutes - inMinutes;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      // Default to 8 hours for present status
      return "08:00";
    }
    
    // 9. Fallback - try to calculate from available data
    if (PunchRecords) {
      return calculateTotalHours(PunchRecords);
    } else if (InTime && OutTime) {
      const inTime = formatTime(InTime);
      const outTime = formatTime(OutTime);
      if (inTime !== '--:--' && outTime !== '--:--') {
        const inMinutes = parseInt(inTime.split(':')[0]) * 60 + parseInt(inTime.split(':')[1]);
        const outMinutes = parseInt(outTime.split(':')[0]) * 60 + parseInt(outTime.split(':')[1]);
        const totalMinutes = outMinutes - inMinutes;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // Default case - no hours
    return "00:00";
  }, [calculateTotalHours, formatTime]);

  // Calculate working days for the current month including regularization
  const calculateWorkingDays = useCallback(() => {
    if (!dayLogs || dayLogs.length === 0) return 0;
    
    const currentMonthLogs = dayLogs.filter(log => {
      // Filter logs for current month
      const logDate = new Date(log.AttendanceDate);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    
    let workingDays = 0;
    let debugInfo = []; // For debugging purposes
    
    for (let i = 0; i < currentMonthLogs.length; i++) {
      const log = currentMonthLogs[i];
      const { AttendanceStatus, Status, isLeaveTaken, leaveType } = log;
      const date = log.AttendanceDate;
      
      // Debug: Log what we're processing
      debugInfo.push({
        date,
        AttendanceStatus,
        Status,
        isLeaveTaken,
        leaveType,
        counted: false
      });
      
      // Count as working day if ANY of these conditions are met:
      
      // 1. Full Day or Half Day attendance (definitely working)
      if (AttendanceStatus === "Full Day" || AttendanceStatus === "Half Day") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Full/Half Day";
        continue;
      }
      
      // 2. Regularization applied (RL) - this is a working day
      if (leaveType === "regularized" || leaveType === "RL" ||
          (Status === "Present" && AttendanceStatus === "Absent") ||
          (isLeaveTaken === true && AttendanceStatus === "Absent") ||
          log?.RegularizationStatus === "Approved" ||
          log?.IsRegularized === true ||
          log?.RegularizationType === "RL") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Regularization";
        continue;
      }
      

      
      // 4. Short Leave (SL) - this is a working day (partial)
      if (leaveType === "shortLeave" || leaveType === "SL") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Short Leave";
        continue;
      }
      
      // 5. Comp-Off Leave - this is a working day
      if (leaveType === "compOffLeave" || leaveType === "C-Off") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Comp-Off";
        continue;
      }
      
      // 6. Present status (regardless of attendance status)
      if (Status === "Present") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Status Present";
        continue;
      }
      
      // 7. Leave taken but not marked as absent (approved leaves)
      if (isLeaveTaken === true && AttendanceStatus !== "Absent") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Approved Leave";
        continue;
      }
      
      // 8. Other approved leave types (medical, casual, earned, etc.)
      if (leaveType && leaveType !== "regularized" && leaveType !== "RL" && 
          leaveType !== "shortLeave" && leaveType !== "SL" && 
          leaveType !== "compOffLeave" && leaveType !== "C-Off") {
        // Check if this is an approved leave type
        if (isLeaveTaken === true || Status === "Present") {
          workingDays++;
          debugInfo[debugInfo.length - 1].counted = true;
          debugInfo[debugInfo.length - 1].reason = `Other Leave: ${leaveType}`;
          continue;
        }
      }
      
      // 9. Special case: If status shows "Present" in any form
      if (Status && Status.toLowerCase().includes("present")) {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Status Present (variation)";
        continue;
      }
    }
    
    // Debug logging (remove in production)
    console.log("Working Days Calculation Debug:", {
      totalLogs: currentMonthLogs.length,
      workingDays,
      debugInfo
    });
    
    return workingDays;
  }, [dayLogs, currentMonth, currentYear]);

  // Get detailed working days breakdown for debugging
  const getWorkingDaysBreakdown = useCallback(() => {
    if (!dayLogs || dayLogs.length === 0) return { total: 0, breakdown: [] };
    
    const currentMonthLogs = dayLogs.filter(log => {
      const logDate = new Date(log.AttendanceDate);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    
    const breakdown = {
      fullDay: 0,
      halfDay: 0,
      regularization: 0,
      shortLeave: 0,
      compOff: 0,
      otherLeaves: 0,
      presentStatus: 0,
      total: 0
    };
    
    currentMonthLogs.forEach(log => {
      const { AttendanceStatus, Status, isLeaveTaken, leaveType } = log;
      
      if (AttendanceStatus === "Full Day") {
        breakdown.fullDay++;
        breakdown.total++;
      } else if (AttendanceStatus === "Half Day") {
        breakdown.halfDay++;
        breakdown.total++;
            } else if (leaveType === "regularized" || leaveType === "RL") {
        breakdown.regularization++;
        breakdown.total++;
      } else if (leaveType === "shortLeave" || leaveType === "SL") {
        breakdown.shortLeave++;
        breakdown.total++;
      } else if (leaveType === "compOffLeave" || leaveType === "C-Off") {
        breakdown.compOff++;
        breakdown.total++;
      } else if (Status === "Present" || (isLeaveTaken === true && AttendanceStatus !== "Absent")) {
        breakdown.otherLeaves++;
        breakdown.total++;
      } else if (Status && Status.toLowerCase().includes("present")) {
        breakdown.presentStatus++;
        breakdown.total++;
      }
    });
    
    return breakdown;
  }, [dayLogs, currentMonth, currentYear]);

  // Get attendance summary for selected day
  const getAttendanceSummary = useCallback(() => {
    if (!selectedDay) return null;
    
    const formattedDate = `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`;
    const dayData = dayLogs?.find((log) => log.AttendanceDate === formattedDate);
    
    if (!dayData) return null;
    
    const effectiveHours = calculateEffectiveHours(dayData);
    
    return {
      date: formattedDate,
      totalHours: effectiveHours,
      firstIn: dayData?.InTime ? formatTime(dayData.InTime) : "00:00",
      lastOut: dayData?.OutTime ? formatTime(dayData.OutTime) : "00:00",
      status: dayData?.AttendanceStatus || "Absent"
    };
  }, [selectedDay, currentMonth, currentYear, dayLogs, calculateEffectiveHours, formatTime]);

  // Calculate total effective hours for the current month
  const calculateTotalEffectiveHours = useCallback(() => {
    if (!dayLogs || dayLogs.length === 0) return "00:00";
    
    const currentMonthLogs = dayLogs.filter(log => {
      const logDate = new Date(log.AttendanceDate);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    
    let totalMinutes = 0;
    
    currentMonthLogs.forEach(log => {
      const effectiveHours = calculateEffectiveHours(log);
      if (effectiveHours !== "00:00") {
        const [hours, minutes] = effectiveHours.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
      }
    });
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    return `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
  }, [dayLogs, currentMonth, currentYear, calculateEffectiveHours]);

  return (
    <div className="space-y-6">
      
      {/* Calendar Header with Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <MdEvent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-semibold text-gray-900">Attendance Calendar</h2>
              <p className="text-xs sm:text-sm text-gray-600">Track your daily attendance and leave status</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2 relative group">
              <MdToday className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-gray-700">Working Days:</span>
              <span className="font-semibold text-gray-900">{calculateWorkingDays()}</span>
              
              {/* Working Days Breakdown Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-gray-800 mb-2">Working Days Breakdown</h4>
                  {(() => {
                    const breakdown = getWorkingDaysBreakdown();
                    return (
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium text-gray-700">Attendance:</p>
                            <p>• Full Day: {breakdown.fullDay}</p>
                            <p>• Half Day: {breakdown.halfDay}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Leaves:</p>
                            <p>• Regularization: {breakdown.regularization}</p>

                            <p>• Short Leave: {breakdown.shortLeave}</p>
                            <p>• Comp-Off: {breakdown.compOff}</p>
                            <p>• Other: {breakdown.otherLeaves}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">
                            Total Working Days: {breakdown.total}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Effective Hours Note:</span><br/>
                            • Regularization: Uses actual hours or 8h default<br/>
                            • Short Leave: Actual hours + leave hours<br/>
                            • Comp-Off: Counted as 8h
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Regularization Rules:</span><br/>
                            • Can apply for last 35 days from today<br/>
                            • Only allowed if punched in between 9:15-9:31 AM<br/>
                            • Days with orange border are eligible for regularization
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Previous month"
          >
            <MdChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h3 className="text-base sm:text-xl font-bold text-gray-900">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Next month"
          >
            <MdChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={index}
                className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${index}`} 
                    className="bg-white min-h-[50px] sm:min-h-[80px] cursor-pointer" 
                    onClick={() => setClickedDay(null)}
                  />
                );
              }

              const { leaveType } = getDayType(day);
              const dayClass = getDayClass(day);

              // Check if this date is selectable (current date - 35 days, not in the future)
              const today = new Date();
              const selectedDate = new Date(currentYear, currentMonth, day);
              const thirtyFiveDaysAgo = new Date(today);
              thirtyFiveDaysAgo.setDate(today.getDate() - 35);
              
              const isSelectable = selectedDate >= thirtyFiveDaysAgo && selectedDate <= today;

              return userRole === "Super-Admin" ? (
                <div
                  key={`day-${index}`}
                  className={`min-h-[50px] sm:min-h-[80px] p-1 flex flex-col items-center justify-center text-xs sm:text-base font-medium transition-all duration-200 ${dayClass}`}
                >
                  <span className="text-center font-semibold">{day}</span>
                </div>
              ) : (
                <button
                  key={`day-${index}`}
                  onClick={isSelectable ? () => handleDayClick(day) : undefined}
                  disabled={!isSelectable}
                  className={`min-h-[50px] sm:min-h-[80px] p-1 flex flex-col items-center justify-center text-xs sm:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${dayClass}`}
                  aria-label={isSelectable ? `Select ${day} ${MONTHS[currentMonth]} ${currentYear}` : `${day} ${MONTHS[currentMonth]} ${currentYear} - Not selectable`}
                  title={(() => {
                    const dayData = dayLogs?.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
                    if (dayData && dayData.AttendanceStatus === "Absent" && isRegularizationAllowed(dayData)) {
                      return `Regularization Eligible - Punched in between 9:15-9:31 AM`;
                    }
                    return `${day} ${MONTHS[currentMonth]} ${currentYear}`;
                  })()}
                >
                  <span className="text-center font-semibold">{day}</span>
                  {/* Show regularization eligibility indicator */}
                  {(() => {
                    const dayData = dayLogs?.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
                    if (dayData && dayData.AttendanceStatus === "Absent" && isRegularizationAllowed(dayData)) {
                      return (
                        <span className="text-xs font-bold mt-0.5 sm:mt-1 px-1 py-0.5 bg-orange-200 text-orange-800 rounded border border-orange-300">
                          RL
                        </span>
                      );
                    }
                    return null;
                  })()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Date: {selectedDay} {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Date Selection Rules Info */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Comp-Off Information:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• <strong>Comp-Off:</strong> Can be applied for current month + next 5 days</li>
                      <li>• <strong>Duration:</strong> First Half, Second Half, or Full Day</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActionType('compOff');
                    setCompOffDayType('compOffLeave'); // Set default leave type for comp-off
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 bg-blue-600 text-white shadow-md"
                >
                  Raise Comp-Off
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Attendance Summary for Both Leave and Comp-Off */}
              {getAttendanceSummary() && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Today's Attendance Summary
                    </h3>
                    <span className="text-xs text-gray-500">
                      {getAttendanceSummary().date}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium mb-1">Effective Hours</p>
                      <p className="text-sm font-semibold text-blue-800">{getAttendanceSummary().totalHours}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-green-600 font-medium mb-1">First In</p>
                      <p className="text-sm font-semibold text-green-800">{getAttendanceSummary().firstIn}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-red-600 font-medium mb-1">Last Out</p>
                      <p className="text-sm font-semibold text-red-800">{getAttendanceSummary().lastOut}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Type Selection */}


              {/* Comp-Off Day Type Selection */}
              {actionType === 'compOff' && (
                <div className="comp-off-duration-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Duration<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={(e) => handleDropdownToggle('compOffDuration', e)}
                      className={`flex items-center justify-between w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white hover:border-gray-300 ${
                        showCompOffDurationError 
                          ? 'border-red-300 bg-red-50 text-red-700' 
                          : compOffDayType 
                          ? 'border-blue-300 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="text-gray-700">
                        {compOffDayType === 'firstHalf' ? 'First Half' : 
                         compOffDayType === 'secondHalf' ? 'Second Half' : 
                         compOffDayType === 'fullDay' ? 'Full Day' : 
                         'Select Duration'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          isCompOffDurationDropdownOpen ? 'rotate-180' : ''
                        } ${compOffDayType ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </button>

                    {isCompOffDurationDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 comp-off-duration-dropdown transition-all duration-200 ease-in-out">
                        <div className="p-2">
                          <button
                            onClick={() => handleCompOffDurationSelect('firstHalf')}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                              compOffDayType === 'firstHalf'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                compOffDayType === 'firstHalf' ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <div>
                                <span className="font-medium">First Half</span>
                                <p className="text-xs opacity-75">Morning shift (9 AM - 1 PM)</p>
                              </div>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => handleCompOffDurationSelect('secondHalf')}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                              compOffDayType === 'secondHalf'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                compOffDayType === 'secondHalf' ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <div>
                                <span className="font-medium">Second Half</span>
                                <p className="text-xs opacity-75">Afternoon shift (2 PM - 6 PM)</p>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleCompOffDurationSelect('fullDay')}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                              compOffDayType === 'fullDay'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                compOffDayType === 'fullDay' ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <div>
                                <span className="font-medium">Full Day</span>
                                <p className="text-xs opacity-75">Complete day (9 AM - 6 PM)</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {showCompOffDurationError && (
                    <p className="mt-1 text-sm text-red-600">Please select a duration</p>
                  )}
                </div>
              )}



              {/* Reason Field */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason for Comp-Off<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  value={reason}
                  onChange={handleReasonChange}
                  placeholder="Provide your reason for comp-off..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm sm:text-base hover:border-gray-300 ${
                    showReasonError 
                      ? 'border-red-300 bg-red-50 text-red-700' 
                      : 'border-gray-200 text-gray-900'
                  }`}
                />
                {showReasonError && (
                  <p className="mt-1 text-sm text-red-600">Please provide a reason</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;