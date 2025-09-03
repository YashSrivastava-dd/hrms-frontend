import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { MdChevronLeft, MdChevronRight, MdToday, MdEvent } from "react-icons/md";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getCalenderLogsApiAction, postApplyCompOffLeaveAction, postApplyRegularizationAction } from "../store/action/userDataAction";
import { toast } from "react-toastify";
import safeToast from "../utils/safeToast";

// Constants
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEAVE_TYPE_MAP = {
  'shortLeave': 'SL',
  'medicalLeave': 'ML',
  'casualLeave': 'CL',
  'earnedLeave': 'EL',
  'compOffLeave': 'C-Off',
  'optionalLeave': 'OL',
  'regularized': 'RL',
  'uninformedLeave': 'UL',
  'bereavementLeave': 'BL'
};



function Calendar({ employeeId, userRole, onDaySelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectDuration, setSelectDuration] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [reason, setReason] = useState("");
  const [selectType, setSelectType] = useState("");
  const [actionType, setActionType] = useState(""); // 'leave' or 'compOff'
  const [leaveType, setLeaveType] = useState(""); // For leave type selection
  const [hide, setunhide] = useState(0);
  const [clickedDay, setClickedDay] = useState(null);
  const [showAbbreviations, setShowAbbreviations] = useState(false);
  const [compOffDayType, setCompOffDayType] = useState(""); // For comp-off day type selection
  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [isCompOffDurationDropdownOpen, setIsCompOffDurationDropdownOpen] = useState(false);
  const leaveTypeDropdownRef = useRef(null);
  const compOffDurationDropdownRef = useRef(null);
  // Use localStorage to persist processed messages across component remounts
  const processedMessagesRef = useRef(new Set());
  
  // Initialize processed messages from localStorage on component mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('calendarProcessedMessages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        processedMessagesRef.current = new Set(parsedMessages);
      }
    } catch (error) {
      console.warn('Error loading processed messages from localStorage:', error);
    }
  }, []);
  
  // Save processed messages to localStorage
  const saveProcessedMessages = useCallback(() => {
    try {
      const messagesArray = Array.from(processedMessagesRef.current);
      localStorage.setItem('calendarProcessedMessages', JSON.stringify(messagesArray));
      
      // Clean up old messages if there are too many (keep only last 50)
      if (messagesArray.length > 50) {
        const recentMessages = messagesArray.slice(-50);
        processedMessagesRef.current = new Set(recentMessages);
        localStorage.setItem('calendarProcessedMessages', JSON.stringify(recentMessages));
      }
    } catch (error) {
      console.warn('Error saving processed messages to localStorage:', error);
    }
  }, []);
  
  // Validation states
  const [showLeaveTypeError, setShowLeaveTypeError] = useState(false);
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
      const leaveTypeContainer = event.target.closest('.leave-type-dropdown');
      const compOffContainer = event.target.closest('.comp-off-duration-dropdown');
      
      if (isLeaveTypeDropdownOpen && !leaveTypeContainer) {
        setIsLeaveTypeDropdownOpen(false);
      }
      if (isCompOffDurationDropdownOpen && !compOffContainer) {
        setIsCompOffDurationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLeaveTypeDropdownOpen, isCompOffDurationDropdownOpen]);

  // Handle success messages with cleanup to prevent infinite loops
  // These notifications only appear AFTER successful submission, not on user interactions
  useEffect(() => {
    let hasProcessedMessage = false;
    
    if (data?.message && !processedMessagesRef.current.has(data.message)) {
      hasProcessedMessage = true;
      processedMessagesRef.current.add(data.message);
      saveProcessedMessages(); // Save to localStorage
      safeToast.success(data.message);
      // Close modal and clear form data
      setModalOpen(false);
      // Clear form data inline to avoid dependency issues
      setSelectedDay(null);
      setReason("");
      setSelectType("");
      setActionType("");
      setLeaveType("");
      setSelectDuration(null);
      setClickedDay(null);
      setCompOffDayType("");
      setIsLeaveTypeDropdownOpen(false);
      setIsCompOffDurationDropdownOpen(false);
      setShowLeaveTypeError(false);
      setShowCompOffDurationError(false);
      setShowReasonError(false);
      return;
    }
    if (data1?.message && !processedMessagesRef.current.has(data1.message)) {
      hasProcessedMessage = true;
      processedMessagesRef.current.add(data1.message);
      saveProcessedMessages(); // Save to localStorage
      safeToast.success(data1.message);
      // Close modal and clear form data
      setModalOpen(false);
      // Clear form data inline to avoid dependency issues
      setSelectedDay(null);
      setReason("");
      setSelectType("");
      setActionType("");
      setLeaveType("");
      setSelectDuration(null);
      setClickedDay(null);
      setCompOffDayType("");
      setIsLeaveTypeDropdownOpen(false);
      setIsCompOffDurationDropdownOpen(false);
      setShowLeaveTypeError(false);
      setShowCompOffDurationError(false);
      setShowReasonError(false);
      return;
    }

  }, [data?.message, data1?.message, dispatch, employeeId, monthYear]);

  // Cleanup effect to prevent localStorage from growing indefinitely
  useEffect(() => {
    return () => {
      // Save current processed messages before unmounting
      saveProcessedMessages();
    };
  }, [saveProcessedMessages]);

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

  // Check if a day is weekend (Saturday or Sunday)
  const isWeekend = useCallback((day) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }, [currentYear, currentMonth]);

  // Check if a day is weekday (Monday to Friday)
  const isWeekday = useCallback((day) => {
    return !isWeekend(day);
  }, [isWeekend]);

  // Calculate comp-off eligibility for weekend work
  const getWeekendCompOffEligibility = useCallback((dayData) => {
    if (!dayData || !isWeekend(dayData.AttendanceDate ? new Date(dayData.AttendanceDate).getDate() : null)) {
      return null;
    }

    const totalHours = calculateTotalHours(dayData.PunchRecords);
    if (totalHours === "00:00") return null;

    const [hours, minutes] = totalHours.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 240) { // 4 hours or more
      return 'fullDay';
    } else if (totalMinutes >= 60) { // 1 hour or more
      return 'halfDay';
    }

    return null;
  }, [isWeekend, calculateTotalHours]);

  // Check if weekday work meets minimum hours requirement
  const meetsWeekdayMinimumHours = useCallback((dayData) => {
    if (!dayData || !isWeekday(dayData.AttendanceDate ? new Date(dayData.AttendanceDate).getDate() : null)) {
      return true; // Not a weekday, so no minimum requirement
    }

    const totalHours = calculateTotalHours(dayData.PunchRecords);
    if (totalHours === "00:00") return false;

    const [hours, minutes] = totalHours.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    return totalMinutes >= 240; // 4 hours minimum for weekdays
  }, [isWeekday, calculateTotalHours]);

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

    const { AttendanceStatus, inTimeData, isLeaveTaken } = getDayType(day);
    const dayData = dayLogs?.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);

    // Base classes for different attendance statuses
    let baseClass = "";
    
    // Weekend comp-off cases (check first as they have priority)
    if (isWeekend(day) && dayData && dayData.PunchRecords) {
      const compOffEligibility = getWeekendCompOffEligibility(dayData);
      if (compOffEligibility === 'fullDay') {
        baseClass = "bg-purple-100 text-purple-800 border-2 border-purple-400 hover:bg-purple-200";
      } else if (compOffEligibility === 'halfDay') {
        baseClass = "bg-indigo-100 text-indigo-800 border-2 border-indigo-400 hover:bg-indigo-200";
      }
    }
    // Weekday minimum hours check
    else if (isWeekday(day) && dayData && !meetsWeekdayMinimumHours(dayData) && dayData.PunchRecords) {
      baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
    }
    // Leave taken cases
    else if (AttendanceStatus === "Present" || isLeaveTaken === true || 
        (AttendanceStatus === "Absent" && isLeaveTaken === true)) {
      baseClass = "bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:shadow-md";
    }
    // Absent cases
    else if (AttendanceStatus === "Absent") {
      // Check if this day is eligible for regularization
      const isRegularizationEligible = dayData && isRegularizationAllowed(dayData);
      
      if (isRegularizationEligible) {
        baseClass = "bg-orange-100 text-orange-800 border-2 border-orange-400 hover:bg-orange-200";
      } else {
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      }
    }
    else if (AttendanceStatus === "WeeklyOff") {
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
  }, [getDayType, isToday, clickedDay, currentYear, currentMonth, dayLogs, isRegularizationAllowed, isWeekend, isWeekday, getWeekendCompOffEligibility, meetsWeekdayMinimumHours]);

  const getLeaveTypeDisplay = useCallback((leaveType) => {
    return LEAVE_TYPE_MAP[leaveType] || leaveType;
  }, []);

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

    // Check if date is valid for selection - current date - 35 days (for Short Leave and Regularization)
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
      setSelectedDay(day);
      setModalOpen(true);
      
      // No notifications on date click - only show them when user actually submits
    } else {
      safeToast.error(
        "You can only apply Short Leave and Regularization for dates within the last 35 days from today."
      );
    }
  }, [currentYear, currentMonth, dayLogs, onDaySelect]);

  // This function handles the actual submission of leave/comp-off requests
  // Short Leave shows immediate notification, others use Redux state to avoid duplicates
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Reset all validation errors first
    setShowLeaveTypeError(false);
    setShowCompOffDurationError(false);
    setShowReasonError(false);
    
    if (!actionType) {
      safeToast.error("Please select an action (Apply Leave or Raise Comp-Off)");
      return;
    }
    
    // Validate leave type only when submitting leave
    if (actionType === 'leave' && !selectType) {
      setShowLeaveTypeError(true);
      return;
    }
    

    
    // Validate comp-off duration only when submitting comp-off
    if (actionType === 'compOff' && !compOffDayType) {
      setShowCompOffDurationError(true);
      return;
    }
    
    // Validate reason
    if (!reason.trim()) {
      setShowReasonError(true);
      return;
    }

    const selectedDate = `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`;

    if (actionType === 'compOff') {
      // Handle Comp-Off submissions (Half Day or Full Day)
      let totalDays = 0;
      if (compOffDayType === 'halfDay') {
        totalDays = 0.5;
      } else if (compOffDayType === 'fullDay') {
        totalDays = 1;
      }
      
      dispatch(postApplyCompOffLeaveAction(selectedDate, reason, totalDays));
      closeModal(); // Close modal after CompOff submission
    } else if (actionType === 'leave') {
      // Handle Leave submissions (Short Leave, Regularization)
      const date = new Date(selectedDate + " 00:00:00");
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (selectType === 'regularized') {
        // Handle regularization submission
        dispatch(postApplyRegularizationAction(selectType, formattedDate, reason));
        // No immediate notification - let Redux state handle it
      } else if (selectType === 'shortLeave') {
        // Handle Short Leave submission
        dispatch(postApplyRegularizationAction(selectType, formattedDate, reason));
        safeToast.success("Short Leave request submitted successfully!");
      } else {
        // Handle other leave types
        dispatch(postApplyRegularizationAction(selectType, formattedDate, reason));
        // No immediate notification - let Redux state handle it
      }
    }
    
    // Don't close modal here - it will be closed by the success effect
  }, [actionType, selectType, reason, selectedDay, currentMonth, currentYear, dispatch, compOffDayType]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedDay(null);
    setReason("");
    setSelectType("");
    setActionType("");
    setLeaveType("");
    setSelectDuration(null);
    setClickedDay(null);
    setCompOffDayType("");
    setIsLeaveTypeDropdownOpen(false);
    setIsCompOffDurationDropdownOpen(false);
    setShowLeaveTypeError(false);
    setShowCompOffDurationError(false);
    setShowReasonError(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    setSelectType(e.target.value);
  }, []);

  const handleLeaveTypeSelect = useCallback((leaveType) => {
    setSelectType(leaveType);
    setIsLeaveTypeDropdownOpen(false);
    setShowLeaveTypeError(false); // Clear validation error when selection is made
    
    // No notifications on selection - only show them when user actually submits
  }, []);

  const handleCompOffDurationSelect = useCallback((duration) => {
    setCompOffDayType(duration);
    setShowCompOffDurationError(false);
    setIsCompOffDurationDropdownOpen(false);
  }, []);



  const handleDropdownToggle = useCallback((dropdownType, e) => {
    e.stopPropagation();
    
    if (dropdownType === 'leaveType') {
      setIsLeaveTypeDropdownOpen(prev => !prev);
      setIsCompOffDurationDropdownOpen(false);
    } else if (dropdownType === 'compOffDuration') {
      setIsCompOffDurationDropdownOpen(prev => !prev);
      setIsLeaveTypeDropdownOpen(false);
    }
  }, []);

  const handleReasonChange = useCallback((e) => {
    setReason(e.target.value);
    setShowReasonError(false); // Clear validation error when user starts typing
  }, []);

  // Calculate effective hours considering leave types and special cases
  const calculateEffectiveHours = useCallback((dayData) => {
    if (!dayData) return "00:00";
    
    const { AttendanceStatus, isLeaveTaken, leaveType, PunchRecords, InTime, OutTime, Duration } = dayData;
    
    // Check if this is weekend work eligible for comp-off
    const dayDate = dayData.AttendanceDate ? new Date(dayData.AttendanceDate) : null;
    if (dayDate && isWeekend(dayDate.getDate()) && PunchRecords) {
      const compOffEligibility = getWeekendCompOffEligibility(dayData);
      if (compOffEligibility === 'fullDay') {
        return "08:00"; // Full day comp-off
      } else if (compOffEligibility === 'halfDay') {
        return "04:00"; // Half day comp-off
      }
    }
    
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
    
    // 8. Present attendance status - use actual punch records
    if (AttendanceStatus === "Present") {
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
      // Default to 8 hours for present attendance status
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
  }, [calculateTotalHours, formatTime, isWeekend, getWeekendCompOffEligibility]);

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
      const { AttendanceStatus, isLeaveTaken, leaveType } = log;
      const date = log.AttendanceDate;
      
      // Debug: Log what we're processing
      debugInfo.push({
        date,
        AttendanceStatus,
        isLeaveTaken,
        leaveType,
        counted: false
      });
      
      // Count as working day if ANY of these conditions are met:
      
      // 1. Weekend comp-off work (check first as it has priority)
      const dayDate = new Date(log.AttendanceDate);
      if (isWeekend(dayDate.getDate()) && log.PunchRecords) {
        const compOffEligibility = getWeekendCompOffEligibility(log);
        if (compOffEligibility === 'fullDay') {
          workingDays++;
          debugInfo[debugInfo.length - 1].counted = true;
          debugInfo[debugInfo.length - 1].reason = "Weekend Full Day Comp-Off";
          continue;
        } else if (compOffEligibility === 'halfDay') {
          workingDays++;
          debugInfo[debugInfo.length - 1].counted = true;
          debugInfo[debugInfo.length - 1].reason = "Weekend Half Day Comp-Off";
          continue;
        }
      }
      
      // 2. Full Day or Half Day attendance (definitely working)
      if (AttendanceStatus === "Full Day" || AttendanceStatus === "Half Day") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Full/Half Day";
        continue;
      }
      
      // 3. Regularization applied (RL) - this is a working day
      if (leaveType === "regularized" || leaveType === "RL" ||
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
      
      // 6. Present attendance status
      if (AttendanceStatus === "Present") {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Attendance Present";
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
        if (isLeaveTaken === true || AttendanceStatus === "Present") {
          workingDays++;
          debugInfo[debugInfo.length - 1].counted = true;
          debugInfo[debugInfo.length - 1].reason = `Other Leave: ${leaveType}`;
          continue;
        }
      }
      
      // 9. Special case: If attendance status shows "Present" in any form
      if (AttendanceStatus && AttendanceStatus.toLowerCase().includes("present")) {
        workingDays++;
        debugInfo[debugInfo.length - 1].counted = true;
        debugInfo[debugInfo.length - 1].reason = "Attendance Present (variation)";
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
  }, [dayLogs, currentMonth, currentYear, isWeekend, getWeekendCompOffEligibility]);

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
      weekendCompOff: 0,
      otherLeaves: 0,
      presentStatus: 0,
      total: 0
    };
    
    currentMonthLogs.forEach(log => {
      const { AttendanceStatus, isLeaveTaken, leaveType } = log;
      
      // Check for weekend comp-off first
      const dayDate = new Date(log.AttendanceDate);
      if (isWeekend(dayDate.getDate()) && log.PunchRecords) {
        const compOffEligibility = getWeekendCompOffEligibility(log);
        if (compOffEligibility === 'fullDay' || compOffEligibility === 'halfDay') {
          breakdown.weekendCompOff++;
          breakdown.total++;
          return; // Skip other checks for weekend comp-off
        }
      }
      
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
      } else if (AttendanceStatus === "Present" || (isLeaveTaken === true && AttendanceStatus !== "Absent")) {
        breakdown.otherLeaves++;
        breakdown.total++;
      } else if (AttendanceStatus && AttendanceStatus.toLowerCase().includes("present")) {
        breakdown.presentStatus++;
        breakdown.total++;
      }
    });
    
    return breakdown;
  }, [dayLogs, currentMonth, currentYear, isWeekend, getWeekendCompOffEligibility]);

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
    <div className="space-y-4 sm:space-y-6 w-full">
      
      {/* Calendar Header with Stats */}
      <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-0 sm:border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <MdEvent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 break-words">Attendance Calendar</h2>
              <p className="text-xs sm:text-sm text-gray-600 break-words">Track your daily attendance and leave status</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2 relative group">
              <MdToday className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 break-words">Working Days:</span>
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
                            <p>• Weekend Comp-Off: {breakdown.weekendCompOff}</p>
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
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Previous month"
          >
            <MdChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h3 className="text-base sm:text-xl font-bold text-gray-900 text-center break-words px-2">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Next month"
          >
            <MdChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-none sm:rounded-lg border-0 sm:border border-gray-200 overflow-hidden w-full">
                      {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 w-full">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={index}
                className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide break-words"
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
              const leaveTypeDisplay = leaveType ? getLeaveTypeDisplay(leaveType) : "";

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
                  <span className="text-center font-semibold break-words">{day}</span>
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
                  <span className="text-center font-semibold break-words">{day}</span>
                  {leaveTypeDisplay && (
                    <span className="text-xs font-bold mt-0.5 sm:mt-1 px-1 py-0.5 bg-blue-100 text-blue-800 rounded break-words">
                      {leaveTypeDisplay}
                    </span>
                  )}
                  {/* Show regularization eligibility indicator */}
                  {(() => {
                    const dayData = dayLogs?.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
                    if (dayData && dayData.AttendanceStatus === "Absent" && isRegularizationAllowed(dayData)) {
                      return (
                        <span className="text-xs font-bold mt-0.5 sm:mt-1 px-1 py-0.5 bg-orange-200 text-orange-800 rounded border border-orange-300 break-words">
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

        {/* Leave Abbreviations Section */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-none sm:rounded-xl border-0 sm:border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 break-words">Leave Abbreviations</h4>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowAbbreviations(!showAbbreviations)}
                className="cursor-pointer flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm text-blue-700 hover:text-blue-800 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showAbbreviations ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                View
              </button>
              {showAbbreviations && (
                <div className="absolute bottom-full right-0 mb-2 w-56 sm:w-64 bg-white border border-blue-200 rounded-xl shadow-xl z-10 overflow-hidden">
                  <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                    {/* Calendar Day Indicators */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 pb-1 border-b border-gray-100">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full"></div>
                        <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Calendar Days</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-100 border-2 border-green-300 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Full Day</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-100 border-2 border-yellow-300 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Half Day</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-100 border-2 border-red-300 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Absent</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-100 border-2 border-blue-300 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Holiday</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white border border-gray-300 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Regular</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded shadow-lg flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Today</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-100 border-2 border-purple-400 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Weekend Full Day</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-indigo-100 border-2 border-indigo-400 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Weekend Half Day</span>
                        </div>
                        
                      </div>
                    </div>
                    
                    {/* Leave Abbreviations */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 pb-1 border-b border-gray-100">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></div>
                        <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Leave Abbreviations</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-1 py-0.5 rounded">SL</span>
                          <span className="text-xs text-gray-700">Short Leave</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-red-600 font-semibold bg-red-50 px-1 py-0.5 rounded">ML</span>
                          <span className="text-xs text-gray-700">Medical Leave</span>
                        </div>

                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">BL</span>
                          <span className="text-xs text-gray-700">Bereavement Leave</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
                  <div className="text-xs text-blue-800 min-w-0">
                    <p className="font-medium mb-1 break-words">Updated Date Selection Rules:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li className="break-words">• <strong>Short Leave:</strong> Can be applied for current month + next 5 days</li>
                      <li className="break-words">• <strong>Regularization:</strong> Can be applied for current month + next 5 days</li>
                      <li className="break-words">• <strong>Other Leave Types:</strong> Follow existing rules</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setActionType('leave')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                    actionType === 'leave' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Apply Leave
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionType('compOff');
                    setLeaveType('compOffLeave'); // Set default leave type for comp-off
                  }}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                    actionType === 'compOff' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
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
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="break-words">{actionType === 'compOff' ? "Today's Attendance Summary" : "Attendance Summary"}</span>
                    </h3>
                    <span className="text-xs text-gray-500 text-right break-words">
                      {getAttendanceSummary().date}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                      <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Effective Hours</p>
                      <p className="text-sm sm:text-base font-semibold text-blue-800 break-words">{getAttendanceSummary().totalHours}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
                      <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">First In</p>
                      <p className="text-sm sm:text-base font-semibold text-green-800 break-words">{getAttendanceSummary().firstIn}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 sm:p-3 border border-red-100">
                      <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">Last Out</p>
                      <p className="text-sm sm:text-base font-semibold text-red-800 break-words">{getAttendanceSummary().lastOut}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Type Selection */}
              {actionType === 'leave' && (
                <div className="leave-type-dropdown">
                  <label
                    htmlFor="leaveType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Leave Type<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={(e) => handleDropdownToggle('leaveType', e)}
                      className={`flex items-center justify-between w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white hover:border-gray-300 ${
                        showLeaveTypeError 
                          ? 'border-red-300 bg-red-50 text-red-700' 
                          : selectType 
                          ? 'border-blue-300 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="text-gray-700">
                        {selectType === 'shortLeave' ? 'Short Leave' : 
                         selectType === 'regularized' ? 'Regularization' : 
                         '✓ Select Leave Type'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          isLeaveTypeDropdownOpen ? 'rotate-180' : ''
                        } ${selectType ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    </button>

                    {isLeaveTypeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 leave-type-dropdown transition-all duration-200 ease-in-out">
                        <div className="p-2">
                          <button
                            onClick={() => handleLeaveTypeSelect('shortLeave')}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                              selectType === 'shortLeave'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectType === 'shortLeave' ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <div>
                                <span className="font-medium">Short Leave</span>
                                <p className="text-xs opacity-75">For early departure - can apply for last 35 days from today</p>
                              </div>
                            </div>
                          </button>
                          


                          <button
                            onClick={() => handleLeaveTypeSelect('regularized')}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                              selectType === 'regularized'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectType === 'regularized' ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <div>
                                <span className="font-medium">Regularization</span>
                                <p className="text-xs opacity-75">For attendance regularization - can apply for last 35 days from today, only if punched in between 9:15-9:31 AM</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {showLeaveTypeError && (
                    <p className="mt-1 text-sm text-red-600">Please select a leave type</p>
                  )}
                </div>
              )}

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
                        {compOffDayType === 'halfDay' ? 'Half Day' : 
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
                            onClick={() => handleCompOffDurationSelect('halfDay')}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                              compOffDayType === 'halfDay'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                compOffDayType === 'halfDay' ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <div>
                                <span className="font-medium">Half Day</span>
                                <p className="text-xs opacity-75">Half day comp-off (4 hours)</p>
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
                                <p className="text-xs opacity-75">Complete day comp-off (8 hours)</p>
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
                  {actionType === "compOff" ? "Reason for Comp-Off" : 
                   selectType === "shortLeave" ? "Reason for Short Leave" :
                   selectType === "regularized" ? "Reason for Regularization" :
                   "Enter your reason"}<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  value={reason}
                  onChange={handleReasonChange}
                  placeholder={actionType === "compOff" ? "Provide your reason for comp-off..." : 
                              selectType === "shortLeave" ? "Provide your reason for short leave..." :
                              selectType === "regularized" ? "Provide your reason for regularization..." :
                              "Provide your reason for leave/comp-off..."}
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