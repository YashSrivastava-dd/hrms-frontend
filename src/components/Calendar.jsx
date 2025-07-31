import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MdChevronLeft, MdChevronRight, MdToday, MdEvent } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getCalenderLogsApiAction, postApplyCompOffLeaveAction, postApplyRegularizationAction, postVendorMeetingAction } from "../store/action/userDataAction";
import { Bounce, ToastContainer, toast } from "react-toastify";

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
  'vendor-meeting': 'Vendor-M',
  'regularized': 'RL',
  'uninformedLeave': 'UL',
  'bereavementLeave': 'BL'
};

const TOAST_CONFIG = {
  position: "top-center",
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Bounce,
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
  const [hide, setunhide] = useState(0);
  const [clickedDay, setClickedDay] = useState(null);
  const [showAbbreviations, setShowAbbreviations] = useState(false);

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
    dispatch(getCalenderLogsApiAction(monthYear, employeeId));
  }, [monthYear, employeeId, dispatch]);

  useEffect(() => {
    if (data?.message) {
      toast.success(data.message, TOAST_CONFIG);
      setTimeout(() => window.location.reload(), 1500);
      return;
    }
    if (data1?.message) {
      toast.success(data1.message, TOAST_CONFIG);
      setTimeout(() => window.location.reload(), 1500);
      return;
    }
  }, [data?.message, data1?.message]);

  useEffect(() => {
    if (error1) {
      toast.error(error1, TOAST_CONFIG);
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

  const getDayClass = useCallback((day) => {
    if (!day) return "bg-transparent";
    
    // Check if this is the clicked day
    const isClickedDay = clickedDay === day;
    
    if (isToday(day)) {
      return isClickedDay 
        ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-4" 
        : "bg-blue-500 text-white shadow-lg ring-2 ring-blue-300";
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
      baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
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

    return baseClass;
  }, [getDayType, isToday, clickedDay]);

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

    // Check if date is valid for selection
    const isValidCurrentMonth = 
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate <= today;

    const isValidPreviousMonth = 
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() - 1 &&
      new Date(currentYear, currentMonth, 1) - selectedDate <= 7 * 24 * 60 * 60 * 1000;

    // Get the selected day's data from calendar logs
    const formattedDate = `${day} ${MONTHS[currentMonth]} ${currentYear}`;
    const selectedDayData = dayLogs?.find((log) => log.AttendanceDate === formattedDate);
    
    // Call the callback to update the attendance display
    if (onDaySelect && selectedDayData) {
      onDaySelect(selectedDayData, formattedDate);
    }
    
    // Set the clicked day for visual feedback
    setClickedDay(day);

    if (isValidCurrentMonth || isValidPreviousMonth) {
      setSelectedDay(day);
      setModalOpen(true);
    } else {
      toast.error(
        "You can only select short leave for today or regularization for dates within the current month up to today.",
        TOAST_CONFIG
      );
    }
  }, [currentYear, currentMonth, dayLogs, onDaySelect]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!actionType) {
      toast.error("Please select an action (Apply Leave or Raise Comp-Off)", TOAST_CONFIG);
      return;
    }
    
    if (!selectType) {
      toast.error("Please select a leave type", TOAST_CONFIG);
      return;
    }
    
    if (!reason) {
      toast.error("Please provide a reason for leave", TOAST_CONFIG);
      return;
    }

    const selectedDate = `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`;

    if (actionType === 'compOff') {
      // Handle Comp-Off submissions (Half Day or Full Day)
      if (selectType === 'halfDay') {
        dispatch(postApplyCompOffLeaveAction(selectedDate, reason, 0.5));
      } else if (selectType === 'fullDay') {
        dispatch(postApplyCompOffLeaveAction(selectedDate, reason, 1));
      }
    } else if (actionType === 'leave') {
      // Handle Leave submissions (Short Leave, Vendor Meeting, Regularization)
      const date = new Date(selectedDate + " 00:00:00");
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (selectType === 'vendor-meeting') {
        dispatch(postVendorMeetingAction({ 
          leaveType: selectType, 
          leaveStartDate: formattedDate, 
          reason, 
          duration: "1" 
        }));
      } else {
        dispatch(postApplyRegularizationAction(selectType, formattedDate, reason));
      }
    }
    
    setModalOpen(false);
  }, [actionType, selectType, reason, selectedDay, currentMonth, currentYear, dispatch]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedDay(null);
    setReason("");
    setSelectType("");
    setActionType("");
    setSelectDuration(null);
    setClickedDay(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    setSelectType(e.target.value);
  }, []);

  const handleChangeDuration = useCallback((e) => {
    setSelectDuration(e.target.value);
  }, []);

  return (
    <div className="space-y-6">
      <ToastContainer />
      
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
            <div className="flex items-center gap-1 sm:gap-2">
              <MdToday className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-gray-700">Working Days:</span>
              <span className="font-semibold text-gray-900">{dataaa?.data2?.totalWorkingDays || 0}</span>
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
              const leaveTypeDisplay = leaveType ? getLeaveTypeDisplay(leaveType) : "";

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
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[50px] sm:min-h-[80px] p-1 flex flex-col items-center justify-center text-xs sm:text-base font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${dayClass}`}
                  aria-label={`Select ${day} ${MONTHS[currentMonth]} ${currentYear}`}
                >
                  <span className="text-center font-semibold">{day}</span>
                  {leaveTypeDisplay && (
                    <span className="text-xs font-bold mt-0.5 sm:mt-1 px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {leaveTypeDisplay}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leave Abbreviations Section */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800">Leave Abbreviations</h4>
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
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white border-2 border-purple-500 ring-2 ring-purple-500 ring-offset-1 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Selected</span>
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
                          <span className="text-xs text-gray-700">Short</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-red-600 font-semibold bg-red-50 px-1 py-0.5 rounded">ML</span>
                          <span className="text-xs text-gray-700">Medical</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-1 py-0.5 rounded">CL</span>
                          <span className="text-xs text-gray-700">Casual</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-1 py-0.5 rounded">EL</span>
                          <span className="text-xs text-gray-700">Earned</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-1 py-0.5 rounded">C-Off</span>
                          <span className="text-xs text-gray-700">Comp-Off</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-1 py-0.5 rounded">OL</span>
                          <span className="text-xs text-gray-700">Optional</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-1 py-0.5 rounded">VM</span>
                          <span className="text-xs text-gray-700">Vendor</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-1 py-0.5 rounded">RL</span>
                          <span className="text-xs text-gray-700">Regularized</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-pink-600 font-semibold bg-pink-50 px-1 py-0.5 rounded">UL</span>
                          <span className="text-xs text-gray-700">Uninformed</span>
                        </div>
                        <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <span className="text-xs text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">BL</span>
                          <span className="text-xs text-gray-700">Bereavement</span>
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
              
              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setActionType('leave')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 ${
                    actionType === 'leave' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Apply Leave
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('compOff')}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 ${
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
              {/* Leave Type Selection */}
              <div>
                <label
                  htmlFor="leaveType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Leave Type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="leaveType"
                    name="leaveType"
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm sm:text-base appearance-none bg-white"
                  >
                    <option value="">✓ Select Leave Type</option>
                    {actionType === 'leave' ? (
                      // Apply Leave options - exactly 3 options
                      <>
                        <option value="shortLeave">Short Leave</option>
                        <option value="vendor-meeting">Vendor Meeting</option>
                        <option value="regularized">Regularization</option>
                      </>
                    ) : actionType === 'compOff' ? (
                      // Comp-Off options - exactly 2 options
                      <>
                        <option value="halfDay">Half Day</option>
                        <option value="fullDay">Full Day</option>
                      </>
                    ) : (
                      // Default options when no action is selected
                      <>
                        <option value="shortLeave">Short Leave</option>
                        <option value="vendor-meeting">Vendor Meeting</option>
                        <option value="regularized">Regularization</option>
                      </>
                    )}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Reason Field */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter your reason<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide your reason for leave/comp-off..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none text-sm sm:text-base"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base"
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