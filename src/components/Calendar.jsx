import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { MdChevronLeft, MdChevronRight, MdToday, MdEvent } from "react-icons/md";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getCalenderLogsApiAction, postApplyCompOffLeaveAction, postApplyRegularizationAction, getPunchRecordsForAttendanceAction, getAttendenceLogsOfEmploye, getAllUserDataAction } from "../store/action/userDataAction";
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



function Calendar({ employeeId, userRole, onDaySelect, calendarLogs }) {
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
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
  
  // Redux selectors - use same sources as attendance table
  const { data: dataaa } = useSelector((state) => state.calenderLogsData);
  const { data, error } = useSelector((state) => state.compoffReducer);
  const { data: dataa } = useSelector((state) => state.userData);
  const { data: data1, error: error1 } = useSelector((state) => state.regularizeReducer);
  const { data: punchRecordsData } = useSelector((state) => state.punchRecordsForAttendance);
  // Add same selectors as EmployeesAttendenceData uses
  const { loading: attendanceLoading, data: attendanceLogsData } = useSelector((state) => state.attendanceLogs);
  const { data: allAttendanceData } = useSelector((state) => state.allEmployeeAttencance);
  const { data: allUserData } = useSelector((state) => state.allUserData);

  // Helper function to convert a time string to a Date object for comparison
  const timeToDate = useCallback((timeStr, attendanceDate) => {
    if (!timeStr || !attendanceDate) return null;
    try {
      let date;
      if (timeStr.includes('T')) {
        date = new Date(timeStr);
      } else if (timeStr.includes(' ')) {
        date = new Date(timeStr);
      } else if (timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        // Parse attendanceDate to get the base date
        let baseDate;
        if (attendanceDate.includes(' ')) {
          // Format: "3 November 2025"
          const parts = attendanceDate.split(' ');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const monthName = parts[1];
            const year = parseInt(parts[2], 10);
            const monthIndex = MONTHS.indexOf(monthName);
            if (monthIndex !== -1) {
              baseDate = new Date(year, monthIndex, day);
            }
          }
        }
        if (!baseDate || isNaN(baseDate.getTime())) {
          baseDate = new Date(attendanceDate);
        }
        if (isNaN(baseDate.getTime())) return null;
        const [h, m, s] = timeStr.split(':');
        const hours = parseInt(h, 10);
        const mins = parseInt(m, 10);
        const secs = s ? parseInt(s, 10) : 0;
        if (isNaN(hours) || isNaN(mins) || hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
        date = new Date(baseDate);
        date.setHours(hours, mins, secs, 0);
      } else {
        date = new Date(timeStr);
      }
      if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        if (year < 2000 || year > 2100) return null;
        const hours = date.getHours();
        const mins = date.getMinutes();
        const secs = date.getSeconds();
        if (hours === 0 && mins === 0 && secs === 0) {
          if (timeStr.includes('00:00:00') || timeStr.match(/^0{1,2}:0{1,2}(:0{1,2})?$/)) return null;
        }
        return date;
      }
    } catch (error) {
      return null;
    }
    return null;
  }, []);

  // Helper to check if a time value is valid
  const isTimeValid = useCallback((time) => {
    if (!time) return false;
    if (time === '--' || time === null || time === '') return false;
    if (typeof time === 'string' && time.trim() === '') return false;
    if (typeof time === 'string') {
      const timeStr = time.trim();
      if (timeStr.includes('T')) {
        try {
          const date = new Date(timeStr);
          if (isNaN(date.getTime())) return false;
          const hours = date.getHours();
          const mins = date.getMinutes();
          const secs = date.getSeconds();
          if (hours === 0 && mins === 0 && secs === 0) {
            const year = date.getFullYear();
            if (year < 2000) return false;
          }
          return true;
        } catch {
          return false;
        }
      }
      if (timeStr.match(/^0{1,2}:0{1,2}(:0{1,2})?$/)) return false;
      if (timeStr.toLowerCase().includes('null') || timeStr.toLowerCase().includes('undefined')) return false;
    }
    return true;
  }, []);

  // Helper function to extract ALL IN times from PunchRecords
  const extractAllInTimes = useCallback((punchRecords, attendanceDate) => {
    const allInTimes = [];
    if (!punchRecords) return allInTimes;
    try {
      const sections = punchRecords.split('||').map(s => s.trim()).filter(s => s);
      sections.forEach(section => {
        const cleanSection = section.replace(/^OUT-DUTY:\s*/i, '').trim();
        const punches = cleanSection.split(',').map(p => p.trim()).filter(p => p && p.length > 0);
        punches.forEach(punch => {
          const lower = punch.toLowerCase();
          const hasIn = (lower.includes(':in') || lower.includes(' in') || lower.includes('in(') || lower.includes('(in') || (lower.includes('(') && lower.includes('in') && !lower.includes('out'))) && !lower.includes('out');
          if (hasIn) {
            let timeMatch = punch.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?=\s*[:]?\s*in|\(|$)/i);
            if (!timeMatch) timeMatch = punch.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (timeMatch) {
              const hours = parseInt(timeMatch[1], 10);
              const mins = parseInt(timeMatch[2], 10);
              const secs = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
              if (!isNaN(hours) && !isNaN(mins) && hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
                // Parse attendanceDate to get the base date
                let baseDate;
                if (attendanceDate.includes(' ')) {
                  const parts = attendanceDate.split(' ');
                  if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const monthName = parts[1];
                    const year = parseInt(parts[2], 10);
                    const monthIndex = MONTHS.indexOf(monthName);
                    if (monthIndex !== -1) {
                      baseDate = new Date(year, monthIndex, day);
                    }
                  }
                }
                if (!baseDate || isNaN(baseDate.getTime())) {
                  baseDate = new Date(attendanceDate);
                }
                if (!isNaN(baseDate.getTime())) {
                  const date = new Date(baseDate);
                  date.setHours(hours, mins, secs || 0, 0);
                  allInTimes.push(date);
                }
              }
            }
          }
        });
      });
    } catch (error) {
      console.error('Error extracting IN times:', error);
    }
    return allInTimes;
  }, []);

  // Helper function to extract ALL OUT times from PunchRecords
  const extractAllOutTimes = useCallback((punchRecords, attendanceDate) => {
    const allOutTimes = [];
    if (!punchRecords) return allOutTimes;
    try {
      const sections = punchRecords.split('||').map(s => s.trim()).filter(s => s);
      sections.forEach(section => {
        const cleanSection = section.replace(/^OUT-DUTY:\s*/i, '').trim();
        const punches = cleanSection.split(',').map(p => p.trim()).filter(p => p && p.length > 0);
        punches.forEach(punch => {
          const lower = punch.toLowerCase();
          const hasOut = (lower.includes(':out') || lower.includes(' out') || lower.includes('out(') || lower.includes('(out') || (lower.includes('(') && lower.includes('out') && !lower.includes('in'))) && !lower.includes('in');
          if (hasOut) {
            let timeMatch = punch.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?=\s*[:]?\s*out|\(|$)/i);
            if (!timeMatch) timeMatch = punch.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (timeMatch) {
              const hours = parseInt(timeMatch[1], 10);
              const mins = parseInt(timeMatch[2], 10);
              const secs = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
              if (!isNaN(hours) && !isNaN(mins) && hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
                // Parse attendanceDate to get the base date
                let baseDate;
                if (attendanceDate.includes(' ')) {
                  const parts = attendanceDate.split(' ');
                  if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const monthName = parts[1];
                    const year = parseInt(parts[2], 10);
                    const monthIndex = MONTHS.indexOf(monthName);
                    if (monthIndex !== -1) {
                      baseDate = new Date(year, monthIndex, day);
                    }
                  }
                }
                if (!baseDate || isNaN(baseDate.getTime())) {
                  baseDate = new Date(attendanceDate);
                }
                if (!isNaN(baseDate.getTime())) {
                  const date = new Date(baseDate);
                  date.setHours(hours, mins, secs || 0, 0);
                  allOutTimes.push(date);
                }
              }
            }
          }
        });
      });
    } catch (error) {
      console.error('Error extracting OUT times:', error);
    }
    return allOutTimes;
  }, []);

  // Helper function to resolve IN and OUT times from all sources
  const resolveTimes = useCallback((record) => {
    const allInTimes = [];
    const allOutTimes = [];
    
    // Add InTime from record if valid
    if (isTimeValid(record?.InTime)) {
      const inDate = timeToDate(record.InTime, record.AttendanceDate);
      if (inDate) allInTimes.push(inDate);
    }
    
    // Add OutTime from record if valid
    if (isTimeValid(record?.OutTime)) {
      const outDate = timeToDate(record.OutTime, record.AttendanceDate);
      if (outDate) allOutTimes.push(outDate);
    }
    
    // Extract all IN/OUT times from PunchRecords
    if (record?.PunchRecords && record.PunchRecords.trim() !== '') {
      const punchInTimes = extractAllInTimes(record.PunchRecords, record.AttendanceDate);
      const punchOutTimes = extractAllOutTimes(record.PunchRecords, record.AttendanceDate);
      allInTimes.push(...punchInTimes);
      allOutTimes.push(...punchOutTimes);
    }
    
    // Find the EARLIEST IN time
    let resolvedInTime = null;
    if (allInTimes.length > 0) {
      allInTimes.sort((a, b) => a.getTime() - b.getTime());
      resolvedInTime = allInTimes[0].toISOString();
    }
    
    // Find the LATEST OUT time
    let resolvedOutTime = null;
    if (allOutTimes.length > 0) {
      allOutTimes.sort((a, b) => b.getTime() - a.getTime());
      resolvedOutTime = allOutTimes[0].toISOString();
    }
    
    return { resolvedInTime, resolvedOutTime };
  }, [timeToDate, isTimeValid, extractAllInTimes, extractAllOutTimes]);

  // Transform punch records to calendar log format for display
  const transformedPunchRecords = useMemo(() => {
    if (!punchRecordsData?.data || punchRecordsData.data.length === 0) return null;
    
    return punchRecordsData.data.map(record => {
      // Use pre-formatted CalendarDate or format the date
      let formattedDate = record.CalendarDate;
      
      // If CalendarDate not available, parse and format
      if (!formattedDate) {
        const dateStr = record.AttendanceDate || record.attendanceDate;
        if (!dateStr) return null;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        
        const day = date.getDate();
        const monthName = MONTHS[date.getMonth()];
        const year = date.getFullYear();
        formattedDate = `${day} ${monthName} ${year}`;
      }
      
      const recordWithDate = {
        ...record,
        AttendanceDate: formattedDate,
        AttendanceStatus: record.AttendanceStatus || record.Status || 'Present',
        InTime: record.InTime,
        OutTime: record.OutTime,
        PunchRecords: record.PunchRecords,
        Duration: record.DurationString || record.Duration,
        isLeaveTaken: record.isLeaveTaken || (record.LeaveType ? true : false),
        leaveType: record.leaveType || record.LeaveType,
        workingDays: record.workingDays || "5",
      };
      
      // Resolve times from all sources
      const { resolvedInTime, resolvedOutTime } = resolveTimes(recordWithDate);
      
      return {
        ...recordWithDate,
        InTime: resolvedInTime || recordWithDate.InTime,
        OutTime: resolvedOutTime || recordWithDate.OutTime,
      };
    }).filter(Boolean);
  }, [punchRecordsData, resolveTimes]);

  // Helper function to format date for calendar display (same format as calendar expects)
  const formatDateForCalendar = useCallback((dateStr) => {
    if (!dateStr) return null;
    try {
      // If already in calendar format (e.g., "3 November 2025"), return as-is
      if (typeof dateStr === 'string' && dateStr.match(/^\d{1,2}\s+\w+\s+\d{4}$/)) {
        return dateStr;
      }
      // Parse and format to calendar format
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      const day = date.getDate();
      const monthName = MONTHS[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${monthName} ${year}`;
    } catch (error) {
      console.warn('Error formatting date for calendar:', dateStr, error);
      return null;
    }
  }, []);

  // Helper function to normalize date for comparison (same as attendance table)
  const normalizeDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    try {
      if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch (error) {
      return null;
    }
  }, []);

  // Use ref to cache processed data and prevent unnecessary recalculations
  const processedDataCacheRef = useRef(null);
  const lastDataHashRef = useRef('');
  
  // Merge attendance logs and punch records - EXACT SAME LOGIC as EmployeesAttendenceData.jsx
  // Use attendance logs as primary source, punch records fill gaps - NO FRONTEND CALCULATIONS
  const processedAttendanceData = useMemo(() => {
    // Get attendance logs data (primary source)
    const attendanceData = attendanceLogsData?.data || [];
    const allAttendanceDataFromState = allAttendanceData?.data || [];
    const punchData = punchRecordsData?.data || [];
    
    console.log('Calendar processedAttendanceData - input data:', {
      attendanceLogs: attendanceData.length,
      allAttendance: allAttendanceDataFromState.length,
      punchRecords: punchData.length
    });
    
    // Use attendance logs if available, otherwise use allAttendanceData
    const primaryAttendanceData = attendanceData.length > 0 ? attendanceData : allAttendanceDataFromState;
    
    // If no attendance data, use punch records (format date for calendar display only)
    if (primaryAttendanceData.length === 0 && punchData.length > 0) {
      console.log('Calendar: No attendance data, using punch records:', punchData.length, 'records');
      return punchData.map(record => {
        const formattedDate = formatDateForCalendar(record.AttendanceDate) || record.AttendanceDate;
        return {
          ...record,
          AttendanceDate: formattedDate,
          // Use backend InTime/OutTime directly - NO CALCULATIONS
          InTime: record.InTime,
          OutTime: record.OutTime,
        };
      });
    }
    
    // If no punch records, use attendance data (format date for calendar display only)
    if (punchData.length === 0 && primaryAttendanceData.length > 0) {
      console.log('Calendar: No punch records, using attendance data:', primaryAttendanceData.length, 'records');
      return primaryAttendanceData.map(record => {
        const formattedDate = formatDateForCalendar(record.AttendanceDate) || record.AttendanceDate;
        return {
          ...record,
          AttendanceDate: formattedDate,
          // Use backend InTime/OutTime directly - NO CALCULATIONS
          InTime: record.InTime,
          OutTime: record.OutTime,
        };
      });
    }
    
    // Merge both: attendance data takes priority, but fill missing InTime/OutTime/Duration from punch records
    if (primaryAttendanceData.length > 0 && punchData.length > 0) {
      // Helper function to normalize date for comparison (same as EmployeesAttendenceData.jsx)
      const normalizeDateForMerge = (dateStr) => {
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
        const dateKey = normalizeDateForMerge(record.AttendanceDate);
        if (dateKey) {
          // Store the record, but if multiple records exist for same date, keep the one with PunchRecords
          const existing = punchByDate.get(dateKey);
          if (!existing || (record.PunchRecords && !existing.PunchRecords)) {
            punchByDate.set(dateKey, record);
          }
        }
      });
      
      // Merge attendance data with punch records - fill missing fields from punch records
      const mergedData = primaryAttendanceData.map(attendanceRecord => {
        const dateKey = normalizeDateForMerge(attendanceRecord.AttendanceDate);
        const punchRecord = dateKey ? punchByDate.get(dateKey) : null;
        
        if (!punchRecord) {
          // No punch record for this date, use attendance data as-is (format date for calendar display)
          const formattedDate = formatDateForCalendar(attendanceRecord.AttendanceDate) || attendanceRecord.AttendanceDate;
          return {
            ...attendanceRecord,
            AttendanceDate: formattedDate,
            // Use backend InTime/OutTime directly - NO CALCULATIONS
            InTime: attendanceRecord.InTime,
            OutTime: attendanceRecord.OutTime,
          };
        }
        
        // Merge: use attendance data as base, fill missing fields from punch records
        const merged = { ...attendanceRecord };
        
        // Fill InTime if missing in attendance data
        if ((!merged.InTime || merged.InTime === '--' || merged.InTime === null) && punchRecord.InTime) {
          merged.InTime = punchRecord.InTime;
        }
        
        // Fill OutTime if missing in attendance data
        if ((!merged.OutTime || merged.OutTime === '--' || merged.OutTime === null) && punchRecord.OutTime) {
          merged.OutTime = punchRecord.OutTime;
        }
        
        // Fill Duration if missing or 0 in attendance data
        if ((!merged.Duration || merged.Duration === 0 || merged.Duration === '--') && punchRecord.Duration) {
          merged.Duration = punchRecord.Duration;
          merged.DurationString = punchRecord.DurationString || punchRecord.Duration;
        }
        
        // Always use punch record's PunchRecords if available (it's the source of truth)
        if (punchRecord.PunchRecords) {
          merged.PunchRecords = punchRecord.PunchRecords;
        }
        
        // Fill Status if missing or Absent in attendance data but punch record shows Present
        if ((!merged.Status || merged.Status === 'Absent') && punchRecord.Status && punchRecord.Status !== 'Absent') {
          merged.Status = punchRecord.Status;
        }
        
        // Format date for calendar display
        const formattedDate = formatDateForCalendar(merged.AttendanceDate) || merged.AttendanceDate;
        
        return {
          ...merged,
          AttendanceDate: formattedDate,
          // Use backend InTime/OutTime directly - NO CALCULATIONS
          InTime: merged.InTime,
          OutTime: merged.OutTime,
        };
      });
      
      // Add punch records that don't exist in attendance data
      const attendanceDates = new Set(primaryAttendanceData.map(r => normalizeDateForMerge(r.AttendanceDate)).filter(Boolean));
      punchData.forEach(punchRecord => {
        const punchDate = normalizeDateForMerge(punchRecord.AttendanceDate);
        if (punchDate && !attendanceDates.has(punchDate)) {
          const formattedDate = formatDateForCalendar(punchRecord.AttendanceDate) || punchRecord.AttendanceDate;
          mergedData.push({
            ...punchRecord,
            AttendanceDate: formattedDate,
            // Use backend InTime/OutTime directly - NO CALCULATIONS
            InTime: punchRecord.InTime,
            OutTime: punchRecord.OutTime,
          });
        }
      });
      
      console.log('Calendar processedAttendanceData - merged result:', {
        attendanceRecords: primaryAttendanceData.length,
        punchRecords: punchData.length,
        totalMerged: mergedData.length,
        uniqueDates: new Set(mergedData.map(r => normalizeDateForMerge(r.AttendanceDate)).filter(Boolean)).size
      });
      return mergedData;
    }
    
    // Fallback: if we have primaryAttendanceData but didn't match any condition above, format and return it
    if (primaryAttendanceData.length > 0) {
      return primaryAttendanceData.map(record => {
        const formattedDate = formatDateForCalendar(record.AttendanceDate) || record.AttendanceDate;
        return {
          ...record,
          AttendanceDate: formattedDate,
          // Use backend InTime/OutTime directly - NO CALCULATIONS
          InTime: record.InTime,
          OutTime: record.OutTime,
        };
      });
    }
    
    // Final fallback: return empty array
    return [];
  }, [attendanceLogsData?.data, allAttendanceData?.data, punchRecordsData?.data, formatDateForCalendar]);

  // Use processed attendance data (same as attendance table) - NO FRONTEND CALCULATIONS
  const dayLogs = useMemo(() => {
    // PRIORITY 1: Use processed attendance data (same as attendance table) if available
    if (processedAttendanceData && Array.isArray(processedAttendanceData) && processedAttendanceData.length > 0) {
      console.log('Calendar: Using processedAttendanceData (same as attendance table), count:', processedAttendanceData.length);
      return processedAttendanceData;
    }
    
    // PRIORITY 2: Fallback to calendar logs if provided as prop (use backend data directly)
    if (calendarLogs && calendarLogs.length > 0) {
      return calendarLogs.map(record => {
        // Format date for calendar display only
        const formattedDate = formatDateForCalendar(record.AttendanceDate) || record.AttendanceDate;
        return {
          ...record,
          AttendanceDate: formattedDate,
          // Use backend InTime/OutTime directly - NO CALCULATIONS
          InTime: record.InTime,
          OutTime: record.OutTime,
        };
      });
    }
    
    // PRIORITY 3: Fallback to calendar API data (legacy support) - use backend data directly
    const calendarApiData = dataaa?.data || [];
    if (calendarApiData.length > 0) {
      return calendarApiData.map(record => {
        // Format date for calendar display only
        const formattedDate = formatDateForCalendar(record.AttendanceDate) || record.AttendanceDate;
        return {
          ...record,
          AttendanceDate: formattedDate,
          // Use backend InTime/OutTime directly - NO CALCULATIONS
          InTime: record.InTime,
          OutTime: record.OutTime,
        };
      });
    }
    
    // Final fallback: return empty array
    return [];
  }, [processedAttendanceData, calendarLogs, dataaa?.data, formatDateForCalendar]);
  
  // Ensure dayLogs is always an array (never undefined or null)
  const safeDayLogs = useMemo(() => {
    const result = Array.isArray(dayLogs) ? dayLogs : [];
    console.log('Calendar safeDayLogs - result:', {
      count: result.length,
      sample: result[0],
      allDates: result.slice(0, 5).map(r => r?.AttendanceDate)
    });
    return result;
  }, [dayLogs]);
  
  const userDataList = dataa?.data || [];
  
  // Debug logging
  console.log('Calendar component - dayLogs:', safeDayLogs);
  console.log('Calendar component - calendarLogs prop:', calendarLogs);
  console.log('Calendar component - dataaa?.data:', dataaa?.data);

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
  // Use refs to track fetched data and prevent infinite loops
  const fetchedMonthYearRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastDataLengthRef = useRef({ attendance: 0, allAttendance: 0, punch: 0 });
  
  useEffect(() => {
    // If calendarLogs prop is provided, don't fetch - use the prop data
    if (calendarLogs && Array.isArray(calendarLogs) && calendarLogs.length > 0) {
      return;
    }
    
    // Don't fetch if no employeeId
    if (!employeeId) {
      return;
    }
    
    const currentMonthYear = `${monthYear}-${employeeId}`;
    
    // Check if we already have data for this month/year
    const hasAttendanceData = (attendanceLogsData?.data?.length || 0) > 0;
    const hasAllAttendanceData = (allAttendanceData?.data?.length || 0) > 0;
    const hasPunchData = (punchRecordsData?.data?.length || 0) > 0;
    
    // If we already have data, don't fetch again
    if (fetchedMonthYearRef.current === currentMonthYear && (hasAttendanceData || hasAllAttendanceData || hasPunchData)) {
      return;
    }
    
    // Only fetch if month/year changed AND we're not already fetching
    if (fetchedMonthYearRef.current === currentMonthYear) {
      return; // Already fetched for this month/year
    }
    
    if (isFetchingRef.current) {
      return; // Already fetching, don't trigger again
    }
    
    // Set flags BEFORE dispatching to prevent duplicate calls
    isFetchingRef.current = true;
    fetchedMonthYearRef.current = currentMonthYear;
    
    // Only fetch if we don't have any data at all
    // Dashboard might have already fetched attendance logs, so check first
    if (!hasAttendanceData && !hasAllAttendanceData && !hasPunchData) {
      // No data at all, fetch everything
      dispatch(getAttendenceLogsOfEmploye(employeeId, null, null, null));
      dispatch(getPunchRecordsForAttendanceAction(employeeId));
    } else if (!hasAttendanceData && !hasAllAttendanceData) {
      // Have punch data but no attendance data, fetch attendance logs
      dispatch(getAttendenceLogsOfEmploye(employeeId, null, null, null));
    } else if (!hasPunchData) {
      // Have attendance data but no punch data, fetch punch records
      dispatch(getPunchRecordsForAttendanceAction(employeeId));
    }
    // Always fetch calendar logs for the current month (needed for holidays/leaves)
    dispatch(getCalenderLogsApiAction(monthYear, employeeId));
    
    // Reset fetching flag after requests should complete
    const timeoutId = setTimeout(() => {
      isFetchingRef.current = false;
    }, 3000);
    
    // Cleanup timeout on unmount or when month/year changes
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthYear, employeeId]); // ONLY monthYear and employeeId - dispatch is stable, calendarLogs should not trigger fetch

  // Fetch all user data to get employee shift information
  useEffect(() => {
    if (employeeId) {
      dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
    }
  }, [employeeId, dispatch]);

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





  // Helper function to normalize and compare dates
  const normalizeDateForComparison = useCallback((dateStr, targetYear, targetMonth, targetDay) => {
    if (!dateStr) return false;
    try {
      // Try parsing as Date object first
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const dateDay = date.getDate();
        const dateMonth = date.getMonth();
        const dateYear = date.getFullYear();
        
        // Check if dates match
        if (dateDay === targetDay && dateMonth === targetMonth && dateYear === targetYear) {
          return true;
        }
      }
      
      // Try string matching for calendar format "3 November 2025" or "03 November 2025"
      const dateStrLower = dateStr.toString().toLowerCase().trim();
      const monthNameLower = MONTHS[targetMonth].toLowerCase();
      
      // Check if it contains the month and year first
      const hasMonth = dateStrLower.includes(monthNameLower);
      const hasYear = dateStrLower.includes(`${targetYear}`);
      
      if (hasMonth && hasYear) {
        // For day matching, use word boundary regex to avoid matching "1" in "11", "21", "31", "10", etc.
        // Match patterns like "1 November", "01 November", "1st November", etc.
        const dayPattern = `\\b${targetDay}(?:st|nd|rd|th)?\\b`;
        const dayRegex = new RegExp(dayPattern, 'i');
        const hasDay = dayRegex.test(dateStrLower);
        
        // Also check for exact day match at the start (for formats like "1 November 2025")
        // Split by spaces and check if first token is the day
        const parts = dateStrLower.split(/\s+/);
        const firstPart = parts[0];
        const isExactDayMatch = firstPart === `${targetDay}` || firstPart === `${targetDay}st` || firstPart === `${targetDay}nd` || firstPart === `${targetDay}rd` || firstPart === `${targetDay}th`;
        
        if (hasDay || isExactDayMatch) {
          return true;
        }
      }
      
      // Try ISO format "2025-11-03" or "2025-11-03T..." or "2025/11/03"
      const isoMatch = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        const parsedYear = parseInt(year, 10);
        const parsedMonth = parseInt(month, 10);
        const parsedDay = parseInt(day, 10);
        
        // ISO months are 1-based, JavaScript months are 0-based
        if (parsedYear === targetYear && 
            parsedMonth === targetMonth + 1 && 
            parsedDay === targetDay) {
          return true;
        }
      }
      
      // Try format like "11/03/2025" or "03/11/2025" (US format)
      const usFormatMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (usFormatMatch) {
        const [, monthOrDay, dayOrMonth, year] = usFormatMatch;
        const parsedYear = parseInt(year, 10);
        const parsedMonth = parseInt(monthOrDay, 10);
        const parsedDay = parseInt(dayOrMonth, 10);
        
        // Try both interpretations (MM/DD/YYYY and DD/MM/YYYY)
        if (parsedYear === targetYear) {
          // Try MM/DD/YYYY first
          if (parsedMonth === targetMonth + 1 && parsedDay === targetDay) {
            return true;
          }
          // Try DD/MM/YYYY
          if (parsedDay === targetMonth + 1 && parsedMonth === targetDay) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Error in normalizeDateForComparison:', e, dateStr);
      return false;
    }
    return false;
  }, []);

  // Memoized functions
  const getDayType = useCallback((day) => {
    const formattedDate = `${day} ${MONTHS[currentMonth]} ${currentYear}`;
    // Try to find by exact match first
    let dayOff = safeDayLogs.find((off) => off.AttendanceDate === formattedDate);
    
    // If not found, try to find by parsing and comparing dates
    if (!dayOff) {
      dayOff = safeDayLogs.find((off) => {
        return normalizeDateForComparison(off.AttendanceDate, currentYear, currentMonth, day);
      });
    }
    
    // Debug logging for first few days to see what's happening
    if (day <= 5 && safeDayLogs.length > 0) {
      // Try to find matching dates using normalization
      const matchingDates = safeDayLogs.filter(log => 
        normalizeDateForComparison(log.AttendanceDate, currentYear, currentMonth, day)
      );
      
      console.log(`Calendar getDayType for ${formattedDate}:`, {
        found: !!dayOff,
        safeDayLogsCount: safeDayLogs.length,
        sampleDates: safeDayLogs.slice(0, 5).map(log => ({
          AttendanceDate: log.AttendanceDate,
          Status: log.Status,
          AttendanceStatus: log.AttendanceStatus
        })),
        matchingDatesCount: matchingDates.length,
        matchingDates: matchingDates.map(log => ({
          AttendanceDate: log.AttendanceDate,
          Status: log.Status
        })),
        dayOffData: dayOff ? {
          AttendanceDate: dayOff.AttendanceDate,
          Status: dayOff.Status,
          AttendanceStatus: dayOff.AttendanceStatus
        } : null
      });
    }
    
    if (!dayOff) {
      return {
        AttendanceStatus: null,
        inTimeData: null,
        isLeaveTaken: null,
        Status: null,
        leaveType: null,
        workingDays: null
      };
    }

    // Extract time from InTime - handle both ISO format and space-separated format
    let inTimeData = null;
    if (dayOff?.InTime) {
      if (dayOff.InTime.includes('T')) {
        // ISO format: 2025-11-29T09:05:59.000Z
        try {
          const date = new Date(dayOff.InTime);
          inTimeData = date.toTimeString().slice(0, 5); // Get HH:MM
        } catch { inTimeData = null; }
      } else if (dayOff.InTime.includes(' ')) {
        // Space-separated format: 2025-11-29 09:05:59
        inTimeData = dayOff.InTime.split(' ')[1]?.slice(0, 5);
      }
    }
    
    return {
      AttendanceStatus: dayOff?.AttendanceStatus || dayOff?.Status || null,
      inTimeData: inTimeData || null,
      isLeaveTaken: dayOff?.isLeaveTaken || null,
      Status: dayOff?.Status || null,
      leaveType: dayOff?.leaveType || dayOff?.LeaveType || null,
      workingDays: dayOff?.workingDays || null,
      holidayName: dayOff?.holidayName || dayOff?.HolidayName || null,
      isHoliday: dayOff?.isHoliday || dayOff?.IsHoliday || false
    };
  }, [safeDayLogs, currentMonth, currentYear, normalizeDateForComparison]);

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
          const hours = parseInt(timeMatch[1], 10);
          const mins = parseInt(timeMatch[2], 10);
          const secs = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
          
          if (!isNaN(hours) && !isNaN(mins) && hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
            const totalMinutes = hours * 60 + mins;
            punchPairs.push({
              time: totalMinutes,
              type: isIn ? 'IN' : 'OUT',
              original: punch
            });
          }
        }
      }
    });
    
    // Sort by time
    punchPairs.sort((a, b) => a.time - b.time);
    
    // Calculate total hours by summing all IN-OUT pairs
    let totalMinutes = 0;
    let currentIn = null;
    
    punchPairs.forEach(punch => {
      if (punch.type === 'IN') {
        // If we already have an IN without an OUT, ignore the new IN (shouldn't happen, but handle it)
        if (currentIn === null) {
          currentIn = punch.time;
        }
      } else if (punch.type === 'OUT') {
        // If we have an IN, calculate the duration
        if (currentIn !== null) {
          const duration = punch.time - currentIn;
          if (duration > 0) {
            totalMinutes += duration;
          }
          currentIn = null; // Reset for next pair
        }
      }
    });
    
    // If there's an unmatched IN (employee still in office), don't count it
    // (currentIn will remain set, but we don't add it to total)
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, [cleanPunchRecords]);

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

  // Get employee working days configuration from allUserData (same as EmployeesAttendenceData.jsx)
  const getEmployeeWorkingDays = useCallback(() => {
    if (!employeeId) return null;
    const allUserEmployees = allUserData?.data || [];
    if (allUserEmployees.length === 0) return null;
    const employee = allUserEmployees.find(emp => emp.employeeId === employeeId);
    // Check if employee has workingDays in their data, or infer from shiftTime if available
    if (employee?.workingDays) {
      return employee.workingDays.toString();
    }
    return null;
  }, [employeeId, allUserData]);

  // Check if a day is weekend (Saturday or Sunday)
  const isWeekend = useCallback((day) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    
    // Get the working days configuration for this day
    const dayData = safeDayLogs.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
    let workingDays = dayData?.workingDays;
    
    // If no workingDays found for this specific day, try to find it from any day in the month
    if (!workingDays && safeDayLogs && safeDayLogs.length > 0) {
      const anyDayWithWorkingDays = safeDayLogs.find(log => log.workingDays);
      workingDays = anyDayWithWorkingDays?.workingDays;
    }
    
    // If still not found, try to get from allUserData
    if (!workingDays) {
      workingDays = getEmployeeWorkingDays();
    }
    
    // If workingDays is 6, then Saturday (6) is a working day, only Sunday (0) is weekend
    if (workingDays === "6") {
      return dayOfWeek === 0; // Only Sunday is weekend
    }
    // If workingDays is 5, then both Saturday (6) and Sunday (0) are weekends
    else if (workingDays === "5") {
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday and Saturday are weekends
    }
    // Default behavior for other cases (fallback to standard weekend)
    else {
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
    }
  }, [currentYear, currentMonth, dayLogs, getEmployeeWorkingDays]);

  // Check if a day is weekday (Monday to Friday)
  const isWeekday = useCallback((day) => {
    return !isWeekend(day);
  }, [isWeekend]);

  // Calculate comp-off eligibility for weekend work (excluding Saturday for 6-day employees)
  const getWeekendCompOffEligibility = useCallback((dayData) => {
    if (!dayData) return null;
    
    // Get working days configuration
    let workingDays = dayData?.workingDays;
    if (!workingDays && safeDayLogs && safeDayLogs.length > 0) {
      const anyDayWithWorkingDays = safeDayLogs.find(log => log.workingDays);
      workingDays = anyDayWithWorkingDays?.workingDays;
    }
    if (!workingDays) {
      workingDays = getEmployeeWorkingDays();
    }
    const is6DayEmployee = workingDays === "6";
    
    // Parse the date from dayData to check if it's a weekend or Saturday
    let dayDate = null;
    try {
      if (dayData.AttendanceDate) {
        // Try to parse the date string (format: "3 November 2025")
        const dateStr = dayData.AttendanceDate;
        if (dateStr.match(/^\d{1,2}\s+\w+\s+\d{4}$/)) {
          const parts = dateStr.split(' ');
          const day = parseInt(parts[0], 10);
          const monthName = parts[1];
          const year = parseInt(parts[2], 10);
          const monthIndex = MONTHS.indexOf(monthName);
          if (monthIndex !== -1) {
            dayDate = new Date(year, monthIndex, day);
          }
        } else {
          dayDate = new Date(dateStr);
        }
      }
    } catch (error) {
      console.warn('Error parsing date in getWeekendCompOffEligibility:', error);
      return null;
    }
    
    if (!dayDate || isNaN(dayDate.getTime())) return null;
    
    const dayOfWeek = dayDate.getDay();
    
    // For 6-day employees: Saturday is NOT eligible for comp-off (it's a working day)
    // Only Sunday is eligible for comp-off
    // For 5-day employees: Both Saturday and Sunday are eligible for comp-off
    if (is6DayEmployee && dayOfWeek === 6) {
      // Saturday for 6-day employees is a working day, not eligible for comp-off
      return null;
    }
    
    // Check if there are punch records (work done)
    const hasPunchRecords = dayData.PunchRecords || 
                           dayData.InTime || 
                           dayData.OutTime ||
                           (dayData.InTime && dayData.InTime !== '--' && dayData.InTime !== null) ||
                           (dayData.OutTime && dayData.OutTime !== '--' && dayData.OutTime !== null);
    
    if (!hasPunchRecords) return null;
    
    // Saturday (6) or Sunday (0) - eligible for comp-off if work was done
    // For 6-day employees: Only Sunday (0) reaches here (Saturday is excluded above)
    // For 5-day employees: Both Saturday (6) and Sunday (0) are eligible
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      const totalHours = calculateTotalHours(dayData.PunchRecords);
      if (totalHours === "00:00") return null;

      const [hours, minutes] = totalHours.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes >= 240) { // 4 hours or more
        return 'fullDay';
      } else if (totalMinutes >= 60) { // 1 hour or more
        return 'halfDay';
      }
    }

    return null;
  }, [calculateTotalHours, safeDayLogs, getEmployeeWorkingDays]);

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

    // Find dayData FIRST with improved date matching
    const formattedDate = `${day} ${MONTHS[currentMonth]} ${currentYear}`;
    let dayData = safeDayLogs.find((log) => log.AttendanceDate === formattedDate);
    
    // If not found, try to find by parsing and comparing dates
    if (!dayData) {
      dayData = safeDayLogs.find((log) => {
        return normalizeDateForComparison(log.AttendanceDate, currentYear, currentMonth, day);
      });
    }
    
    // CRITICAL: Verify that dayData actually matches this day before using it
    // Don't use dayData from frontend if it doesn't match - prevents showing wrong data on 1st
    if (dayData) {
      const dayDataMatches = normalizeDateForComparison(dayData.AttendanceDate, currentYear, currentMonth, day);
      if (!dayDataMatches) {
        // dayData doesn't match this day - don't use it, set to null
        console.warn(`[Calendar] dayData found but doesn't match day ${day}:`, {
          dayDataDate: dayData.AttendanceDate,
          targetDate: formattedDate,
          year: currentYear,
          month: currentMonth,
          day
        });
        dayData = null;
      }
    }
    
    // Get day type info - use dayData if getDayType doesn't find it
    let dayTypeInfo = getDayType(day);
    // Only use dayData if getDayType didn't find data AND dayData actually matches this day
    if ((!dayTypeInfo.AttendanceStatus && !dayTypeInfo.Status) && dayData) {
      // dayData already verified above - safe to use
      let extractedInTimeData = null;
      if (dayData.InTime) {
        try {
          if (typeof dayData.InTime === 'string') {
            if (dayData.InTime.includes('T')) {
              const date = new Date(dayData.InTime);
              if (!isNaN(date.getTime())) {
                extractedInTimeData = date.toTimeString().slice(0, 5);
              }
            } else if (dayData.InTime.includes(' ')) {
              extractedInTimeData = dayData.InTime.split(' ')[1]?.slice(0, 5);
            } else {
              extractedInTimeData = dayData.InTime.slice(0, 5);
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      dayTypeInfo = {
        AttendanceStatus: dayData.AttendanceStatus || dayData.Status || null,
        inTimeData: extractedInTimeData || dayTypeInfo.inTimeData,
        isLeaveTaken: dayData.isLeaveTaken || dayData.IsLeaveTaken || dayTypeInfo.isLeaveTaken,
        Status: dayData.Status || dayData.AttendanceStatus || dayTypeInfo.Status,
        leaveType: dayData.leaveType || dayData.LeaveType || dayTypeInfo.leaveType,
        workingDays: dayData.workingDays || dayTypeInfo.workingDays,
        holidayName: dayData.holidayName || dayData.HolidayName || dayTypeInfo.holidayName,
        isHoliday: dayData.isHoliday || dayData.IsHoliday || dayTypeInfo.isHoliday
      };
    }
    
    // Use dayData values ONLY if dayData matches this day (already verified above)
    // Don't use dayData if it doesn't match - only use dayTypeInfo
    const AttendanceStatus = dayTypeInfo.AttendanceStatus || (dayData ? (dayData?.AttendanceStatus || dayData?.Status) : null) || null;
    const inTimeData = dayTypeInfo.inTimeData || null;
    const isLeaveTaken = dayTypeInfo.isLeaveTaken || (dayData ? (dayData?.isLeaveTaken || dayData?.IsLeaveTaken) : null) || null;
    const leaveType = dayTypeInfo.leaveType || (dayData ? (dayData?.leaveType || dayData?.LeaveType) : null) || null;
    const holidayName = dayTypeInfo.holidayName || (dayData ? (dayData?.holidayName || dayData?.HolidayName) : null) || null;
    const isHoliday = dayTypeInfo.isHoliday || (dayData ? (dayData?.isHoliday || dayData?.IsHoliday) : false) || false;
    
    // Debug logging for dates that should have data but aren't getting colors
    if ((day <= 5 || day >= 25) && safeDayLogs.length > 0) {
      const matchingDates = safeDayLogs.filter(log => 
        normalizeDateForComparison(log.AttendanceDate, currentYear, currentMonth, day)
      );
      if (matchingDates.length > 0 && !dayData) {
        console.warn(`[Calendar] Found matching dates but dayData is null for day ${day}:`, {
          formattedDate,
          matchingDates: matchingDates.map(d => ({
            AttendanceDate: d.AttendanceDate,
            Status: d.Status,
            AttendanceStatus: d.AttendanceStatus
          }))
        });
      }
    }
    
    // Get working days configuration (same logic as isWeekend function)
    let workingDays = dayData?.workingDays;
    if (!workingDays && safeDayLogs && safeDayLogs.length > 0) {
      const anyDayWithWorkingDays = safeDayLogs.find(log => log.workingDays);
      workingDays = anyDayWithWorkingDays?.workingDays;
    }
    // If still not found, try to get from allUserData
    if (!workingDays) {
      workingDays = getEmployeeWorkingDays();
    }

    // Base classes for different attendance statuses
    let baseClass = "";
    
    // Check if this day has punch records - if yes, user was present (override Absent status)
    // Check multiple sources: PunchRecords, InTime, OutTime, or resolved times
    // Only check dayData if it actually matches this day (already verified above)
    const hasPunchRecords = dayData && (
      dayData.PunchRecords || 
      dayData.InTime || 
      dayData.OutTime ||
      inTimeData ||
      (dayData.InTime && dayData.InTime !== '--' && dayData.InTime !== null) ||
      (dayData.OutTime && dayData.OutTime !== '--' && dayData.OutTime !== null)
    );
    
    // Get leave type from dayData - check multiple fields
    const dayLeaveType = dayData?.leaveType || 
                        dayData?.LeaveType || 
                        leaveType ||
                        dayData?.leaveTypeName ||
                        dayData?.LeaveTypeName;
    
    // Check for approved leave - check multiple indicators
    const hasApprovedLeave = isLeaveTaken === true || 
                            dayLeaveType ||
                            dayData?.isLeaveTaken === true ||
                            dayData?.IsLeaveTaken === true ||
                            (dayData?.Status && (dayData.Status.includes("Leave") || dayData.Status.includes("leave"))) ||
                            (AttendanceStatus && (AttendanceStatus.includes("Leave") || AttendanceStatus.includes("leave")));
    
    // Debug logging for leave detection
    if (dayData && (dayLeaveType || isLeaveTaken)) {
      console.log('Leave detected for date:', `${day} ${MONTHS[currentMonth]} ${currentYear}`, {
        dayLeaveType,
        isLeaveTaken,
        dayDataLeaveType: dayData?.leaveType,
        dayDataLeaveType2: dayData?.LeaveType,
        hasApprovedLeave,
        hasPunchRecords,
        AttendanceStatus
      });
    }
    
    // Check if this is a holiday - check multiple ways
    const isHolidayDay = isHoliday || 
                        holidayName || 
                        dayData?.holidayName || 
                        dayData?.HolidayName ||
                        AttendanceStatus === "Holiday" ||
                        AttendanceStatus === "holiday" ||
                        (dayData?.Status && dayData.Status.toLowerCase() === "holiday");
    
    // Check day of week
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    const is5DayEmployee = workingDays === "5";
    const is6DayEmployee = workingDays === "6";
    
    // Priority order: Holiday > Absent (always red) > Weekend/Off Days > Approved Leave > Present > Half Day
    
    // 1. Holiday - Blue (highest priority)
    if (isHolidayDay) {
      baseClass = "bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200";
    }
    // 2. Absent - Red (ALWAYS show red if absent, regardless of day type, leave status, or punch records - highest priority after holiday)
    else if (AttendanceStatus === "Absent" || (dayData?.Status && dayData.Status === "Absent")) {
      // Only show orange if eligible for regularization AND no punch records
      const isRegularizationEligible = dayData && isRegularizationAllowed(dayData) && !hasPunchRecords;
      
      if (isRegularizationEligible) {
        baseClass = "bg-orange-100 text-orange-800 border-2 border-orange-400 hover:bg-orange-200";
      } else {
        // Always show red for absent, regardless of leave status or other conditions
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      }
    }
    // 3. Weekend/Off Days based on working days configuration
    // For 6-day employees: Saturday is NOT a weekend, so it should NOT enter this block
    // Only check weekends (Sunday for 6-day, or Saturday+Sunday for 5-day)
    else if (isWeekend(day)) {
      // For 5-day employees: Saturday and Sunday are off days (grey) unless absent (red)
      // For 6-day employees: Only Sunday is off day (grey), Saturday should NOT be here
      
      // Check if it's marked as absent on weekend - show red (highest priority for weekends)
      if (AttendanceStatus === "Absent" && !hasPunchRecords && !hasApprovedLeave) {
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      }
      // For 5-day employees: Saturday and Sunday are always off days (grey) unless absent (red) or present (green)
      // For 6-day employees: Only Sunday reaches here (Saturday is NOT a weekend for 6-day)
      else if (hasPunchRecords || AttendanceStatus === "Present" || AttendanceStatus === "Full Day") {
        // Weekend with punch records or present status - show green (user is present)
        baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
      } else if (AttendanceStatus === "Half Day") {
        // Weekend with half day - show yellow
        baseClass = "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200";
      } else {
        // Weekend with no punch records - show as off day (grey)
        baseClass = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
      }
    }
    // 3a. For 6-day employees: Saturday is a working day (NOT a weekend) - handle separately
    else if (is6DayEmployee && isSaturday) {
      // Saturday for 6-day employees is a working day - show green if present
      if (hasPunchRecords || AttendanceStatus === "Present" || AttendanceStatus === "Full Day") {
        baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
      } else if (AttendanceStatus === "Absent" && !hasApprovedLeave) {
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      } else if (AttendanceStatus === "Half Day") {
        baseClass = "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200";
      } else if (hasApprovedLeave) {
        baseClass = "bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:shadow-md";
      } else {
        // No data for Saturday (6-day employee) - show as gray (off day)
        baseClass = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
      }
    }
    // 4. Approved Leave - White with black border (only if not absent)
    else if (hasApprovedLeave && !hasPunchRecords && AttendanceStatus !== "Absent") {
      baseClass = "bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:shadow-md";
    }
    // 5. WeeklyOff - show as off day (gray)
    else if (AttendanceStatus === "WeeklyOff") {
      baseClass = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
    }
    // 5. Half Day - Yellow (use ONLY backend status - NO CALCULATIONS)
    else if ((AttendanceStatus === "Half Day") && !hasApprovedLeave) {
      baseClass = "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200";
    }
    // 6. Full Day - Green (use ONLY backend status - NO CALCULATIONS)
    else if ((AttendanceStatus === "Full Day") && !hasApprovedLeave && !baseClass) {
      baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
    }
    // 7. Present / Full Day - Green (check multiple ways, only if not already set)
    else if (!baseClass && (AttendanceStatus === "Present" || 
             AttendanceStatus === "Full Day" || 
             (hasPunchRecords && !hasApprovedLeave && AttendanceStatus !== "Absent" && AttendanceStatus !== "Half Day" && AttendanceStatus !== "WeeklyOff"))) {
      baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
    }
    // 8. Present with inTime data (fallback) - Green (only if not already set)
    else if (!baseClass && inTimeData && !hasPunchRecords && !hasApprovedLeave) {
      baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
    }
    // 9. If we have dayData but no clear status, use backend Status/AttendanceStatus
    else if (!baseClass && dayData && hasPunchRecords && !hasApprovedLeave && !AttendanceStatus) {
      // Use backend Status if available, otherwise default to Present
      const backendStatus = dayData?.Status || dayData?.AttendanceStatus;
      if (backendStatus === "Half Day") {
        baseClass = "bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200";
      } else if (backendStatus === "Full Day" || backendStatus === "Present") {
        baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
      } else {
        // Default to Present if has punch records
        baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
      }
    }
    // 12. If we have dayData with InTime/OutTime but no PunchRecords, treat as Present (only if not already set)
    else if (!baseClass && dayData && (dayData.InTime || dayData.OutTime) && !hasPunchRecords && !hasApprovedLeave) {
      baseClass = "bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200";
    }
    // 13. If we have dayData but status is null/undefined and no punch records, check if weekend
    else if (!baseClass && dayData && !hasPunchRecords && !AttendanceStatus) {
      const isWeekendDay = isWeekend(day);
      // Check if status is actually Absent but wasn't captured in AttendanceStatus
      const actualStatus = dayData?.Status || dayData?.AttendanceStatus;
      if (actualStatus === "Absent") {
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      } else if (isWeekendDay) {
        baseClass = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
      } else if (hasApprovedLeave) {
        baseClass = "bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:shadow-md";
      } else {
        // Has data but no status and no punch records - could be absent
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      }
    }
    // 13. Default - only if no data at all
    else {
      const isWeekendDay = isWeekend(day);
      // Double-check for absent status in dayData even if AttendanceStatus wasn't set
      const actualStatus = dayData?.Status || dayData?.AttendanceStatus;
      
      if (actualStatus === "Absent") {
        // Show red if status is Absent, even in default case
        baseClass = "bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200";
      } else if (isWeekendDay) {
        baseClass = "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
      } else {
        // No data at all - show as white/empty
        baseClass = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
      }
      
      // Debug: Log when falling to default to help identify issues
      if (dayData && (day <= 5 || day >= 25)) {
        console.log(`[Calendar] Default color for day ${day} (${formattedDate}):`, {
          AttendanceStatus,
          actualStatus: dayData?.Status || dayData?.AttendanceStatus,
          hasPunchRecords,
          hasApprovedLeave,
          hasInTime: !!dayData?.InTime,
          hasOutTime: !!dayData?.OutTime,
          hasPunchRecordsField: !!dayData?.PunchRecords,
          dayDataKeys: dayData ? Object.keys(dayData) : null
        });
      }
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
  }, [getDayType, isToday, clickedDay, currentYear, currentMonth, safeDayLogs, isRegularizationAllowed, isWeekend, isWeekday, getWeekendCompOffEligibility, meetsWeekdayMinimumHours, normalizeDateForComparison, calculateTotalHours, getEmployeeWorkingDays]);

  const getLeaveTypeDisplay = useCallback((leaveType) => {
    return LEAVE_TYPE_MAP[leaveType] || leaveType;
  }, []);

  // Check if comp-off is eligible for the selected day (Saturday or Sunday with work done)
  const isCompOffEligibleForSelectedDay = useCallback(() => {
    if (!selectedDay) return false;
    
    const selectedDate = new Date(currentYear, currentMonth, selectedDay);
    const dayOfWeek = selectedDate.getDay();
    
    // Comp-off is eligible for Saturday (6) or Sunday (0) if work was done
    if (dayOfWeek !== 6 && dayOfWeek !== 0) {
      return false; // Not Saturday or Sunday, not eligible for comp-off
    }
    
    // Get day data to check for punch records
    const formattedDate = `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`;
    const dayData = safeDayLogs.find((log) => log.AttendanceDate === formattedDate);
    
    // Check if there are punch records (work done on Saturday/Sunday)
    if (!dayData) return false;
    
    const hasPunchRecords = dayData.PunchRecords || 
                           dayData.InTime || 
                           dayData.OutTime ||
                           (dayData.InTime && dayData.InTime !== '--' && dayData.InTime !== null) ||
                           (dayData.OutTime && dayData.OutTime !== '--' && dayData.OutTime !== null);
    
    if (!hasPunchRecords) return false;
    
    // Check comp-off eligibility based on hours worked
    const compOffEligibility = getWeekendCompOffEligibility(dayData);
    return compOffEligibility === 'fullDay' || compOffEligibility === 'halfDay';
  }, [selectedDay, currentYear, currentMonth, safeDayLogs, getWeekendCompOffEligibility]);

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
    const selectedDayData = safeDayLogs.find((log) => log.AttendanceDate === formattedDate);
    
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
  }, [currentYear, currentMonth, safeDayLogs, onDaySelect]);

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
      // Check if comp-off is eligible for the selected day (Saturday or Sunday with work done)
      if (!isCompOffEligibleForSelectedDay()) {
        const selectedDate = new Date(currentYear, currentMonth, selectedDay);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek !== 6 && dayOfWeek !== 0) {
          safeToast.error("Comp-off is only eligible for Saturday or Sunday. Please select a weekend day.");
        } else {
          safeToast.error("Comp-off requires at least 1 hour of work. Please select a weekend day with attendance records showing work done.");
        }
        return;
      }
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
  }, [actionType, selectType, reason, selectedDay, currentMonth, currentYear, dispatch, compOffDayType, isCompOffEligibleForSelectedDay, getEmployeeWorkingDays, safeDayLogs]);

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

  // Handle day hover for tooltip
  const handleDayHover = useCallback((day, event) => {
    if (!day) return;
    
    setHoveredDay(day);
    
    // Calculate tooltip position
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipX = rect.left + rect.width / 2;
    const tooltipY = rect.top - 10; // Position above the day
    
    setTooltipPosition({ x: tooltipX, y: tooltipY });
  }, []);

  // Handle day hover end
  const handleDayHoverEnd = useCallback(() => {
    setHoveredDay(null);
  }, []);

  // Format Duration from backend - use ONLY backend data, NO CALCULATIONS
  const calculateEffectiveHours = useCallback((dayData) => {
    if (!dayData) return "00:00";
    
    const { Duration } = dayData;
    
    // Use ONLY backend Duration field - NO FRONTEND CALCULATIONS
    if (Duration && Duration !== "" && Duration !== "00:00" && Duration !== 0) {
      // Check if Duration is already in "HH:MM" format (like "08:03")
      if (typeof Duration === 'string' && Duration.includes(':')) {
        // Duration is already in correct format, use it directly
        return Duration;
      } else if (typeof Duration === 'number') {
        // Duration is in minutes, convert to HH:MM format for display only
        const hours = Math.floor(Duration / 60);
        const minutes = Duration % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else if (dayData.DurationString) {
        // Use DurationString if available
        return dayData.DurationString;
      }
    }
    
    // If no Duration from backend, return "00:00" - NO CALCULATIONS
    return "00:00";
  }, []);

  // Helper function to parse date from various formats
  const parseAttendanceDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    try {
      // If already in calendar format (e.g., "3 November 2025")
      if (typeof dateStr === 'string' && dateStr.match(/^\d{1,2}\s+\w+\s+\d{4}$/)) {
        const parts = dateStr.split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const monthName = parts[1];
          const year = parseInt(parts[2], 10);
          const monthIndex = MONTHS.indexOf(monthName);
          if (monthIndex !== -1) {
            return new Date(year, monthIndex, day);
          }
        }
      }
      // Try parsing as standard date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error);
    }
    return null;
  }, []);

  // Calculate working days for the current month
  // Working days = All weekdays (Mon-Fri for 5-day, Mon-Sat for 6-day) + Holidays
  const calculateWorkingDays = useCallback(() => {
    // Get working days configuration (5 or 6)
    let workingDaysConfig = "5"; // Default to 5
    if (safeDayLogs && safeDayLogs.length > 0) {
      const dayWithConfig = safeDayLogs.find(log => log.workingDays);
      if (dayWithConfig) {
        workingDaysConfig = dayWithConfig.workingDays.toString();
      }
    }
    
    // Get total days in the current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let workingDays = 0;
    const holidaysSet = new Set(); // Track holidays to avoid double counting
    
    // Create a map of attendance data by date for quick lookup
    const attendanceByDate = new Map();
    if (safeDayLogs && safeDayLogs.length > 0) {
      safeDayLogs.forEach(log => {
        const logDate = parseAttendanceDate(log.AttendanceDate);
        if (logDate && !isNaN(logDate.getTime()) && 
            logDate.getMonth() === currentMonth && 
            logDate.getFullYear() === currentYear) {
          const day = logDate.getDate();
          attendanceByDate.set(day, log);
          
          // Track holidays
          if (log.AttendanceStatus === "Holiday" || log.isHoliday || log.IsHoliday) {
            holidaysSet.add(day);
          }
        }
      });
    }
    
    // Loop through all days in the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Check if it's a weekday based on working days configuration
      let isWeekday = false;
      if (workingDaysConfig === "6") {
        // 6 working days: Monday to Saturday (exclude only Sunday)
        isWeekday = dayOfWeek !== 0; // Sunday = 0
      } else {
        // 5 working days: Monday to Friday (exclude Saturday and Sunday)
        isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6; // Sunday = 0, Saturday = 6
      }
      
      // Count as working day if:
      // 1. It's a weekday (Mon-Fri for 5-day, Mon-Sat for 6-day), OR
      // 2. It's a holiday (holidays count as working days even if on weekend)
      if (isWeekday || holidaysSet.has(day)) {
        workingDays++;
      }
    }
    
    return workingDays;
  }, [safeDayLogs, currentMonth, currentYear, parseAttendanceDate]);

  // Get detailed working days breakdown for debugging
  const getWorkingDaysBreakdown = useCallback(() => {
    if (!dayLogs || dayLogs.length === 0) return { total: 0, breakdown: [] };
    
    const currentMonthLogs = safeDayLogs.filter(log => {
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
      const dayDate = parseAttendanceDate(log.AttendanceDate);
      if (dayDate && !isNaN(dayDate.getTime()) && isWeekend(dayDate.getDate()) && log.PunchRecords) {
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
  }, [safeDayLogs, currentMonth, currentYear, isWeekend, getWeekendCompOffEligibility, parseAttendanceDate]);

  // Get attendance summary for selected day - use ONLY backend data
  const getAttendanceSummary = useCallback(() => {
    if (!selectedDay) return null;
    
    const formattedDate = `${selectedDay} ${MONTHS[currentMonth]} ${currentYear}`;
    const dayData = safeDayLogs?.find((log) => log.AttendanceDate === formattedDate);
    
    if (!dayData) return null;
    
    // Use ONLY backend data - NO FRONTEND CALCULATIONS
    // Format times from backend InTime/OutTime directly
    const firstIn = dayData?.InTime ? formatTime(dayData.InTime) : "--";
    const lastOut = dayData?.OutTime ? formatTime(dayData.OutTime) : "--";
    
    // Use ONLY backend Duration field - NO CALCULATIONS
    const effectiveHours = calculateEffectiveHours(dayData);
    
    // Use ONLY backend Status/AttendanceStatus - NO CALCULATIONS
    const displayStatus = dayData?.AttendanceStatus || dayData?.Status || "Absent";
    
    return {
      date: formattedDate,
      totalHours: effectiveHours,
      firstIn: firstIn,
      lastOut: lastOut,
      status: displayStatus
    };
  }, [selectedDay, currentMonth, currentYear, safeDayLogs, calculateEffectiveHours, formatTime]);

  // Get attendance summary for hovered day
  const getHoveredDaySummary = useCallback(() => {
    if (!hoveredDay) return null;
    
    const formattedDate = `${hoveredDay} ${MONTHS[currentMonth]} ${currentYear}`;
    // Try exact match first
    let dayData = safeDayLogs.find((log) => log.AttendanceDate === formattedDate);
    
    // If not found, try to find by parsing and comparing dates
    if (!dayData) {
      dayData = safeDayLogs.find((log) => {
        return normalizeDateForComparison(log.AttendanceDate, currentYear, currentMonth, hoveredDay);
      });
    }
    
    // Debug logging for dates 3 and 4
    if (hoveredDay === 3 || hoveredDay === 4) {
      console.log(`Calendar getHoveredDaySummary for ${formattedDate}:`, {
        found: !!dayData,
        safeDayLogsCount: safeDayLogs.length,
        sampleDates: safeDayLogs.slice(0, 5).map(log => ({
          AttendanceDate: log.AttendanceDate,
          Status: log.Status,
          AttendanceStatus: log.AttendanceStatus
        })),
        dayData: dayData ? {
          AttendanceDate: dayData.AttendanceDate,
          Status: dayData.Status,
          AttendanceStatus: dayData.AttendanceStatus,
          PunchRecords: dayData.PunchRecords ? 'exists' : 'none'
        } : null
      });
    }
    
    if (!dayData) {
      // Check if it's a weekend even without data
      const isWeekendDay = isWeekend(hoveredDay);
      return {
        date: formattedDate,
        totalHours: "00:00",
        firstIn: "--",
        lastOut: "--",
        status: isWeekendDay ? "Off Day" : "No Data",
        punchRecords: null
      };
    }
    
    // Use ONLY backend data - NO FRONTEND CALCULATIONS
    // Format times from backend InTime/OutTime directly
    const firstIn = dayData?.InTime ? formatTime(dayData.InTime) : "--";
    const lastOut = dayData?.OutTime ? formatTime(dayData.OutTime) : "--";
    
    // Use ONLY backend Duration field - NO CALCULATIONS
    const effectiveHours = calculateEffectiveHours(dayData);
    
    // Check if this is a holiday
    const isHolidayDay = dayData?.isHoliday || 
                        dayData?.IsHoliday ||
                        dayData?.holidayName || 
                        dayData?.HolidayName ||
                        dayData?.Status === "Holiday" ||
                        dayData?.AttendanceStatus === "Holiday" ||
                        (dayData?.Status && dayData.Status.toLowerCase() === "holiday");
    
    const holidayName = dayData?.holidayName || dayData?.HolidayName || null;
    
    // Check if this is a weekend
    const isWeekendDay = isWeekend(hoveredDay);
    
    // Use ONLY backend Status/AttendanceStatus - NO CALCULATIONS
    let displayStatus = dayData?.AttendanceStatus || dayData?.Status || "Absent";
    
    // Only override for holidays and weekends - use backend status for everything else
    if (isHolidayDay) {
      displayStatus = "Holiday";
    } else if (isWeekendDay && !dayData?.PunchRecords) {
      displayStatus = "Off Day";
    }
    
    return {
      date: formattedDate,
      totalHours: effectiveHours,
      firstIn: firstIn,
      lastOut: lastOut,
      status: displayStatus,
      punchRecords: dayData?.PunchRecords || null,
      leaveType: dayData?.leaveType || dayData?.LeaveType || null,
      isLeaveTaken: dayData?.isLeaveTaken || false,
      holidayName: holidayName,
      isHoliday: isHolidayDay
    };
  }, [hoveredDay, currentMonth, currentYear, safeDayLogs, calculateEffectiveHours, formatTime, isWeekend]);

  // Calculate total effective hours for the current month
  const calculateTotalEffectiveHours = useCallback(() => {
    if (!dayLogs || dayLogs.length === 0) return "00:00";
    
    const currentMonthLogs = safeDayLogs.filter(log => {
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
  }, [safeDayLogs, currentMonth, currentYear, calculateEffectiveHours]);

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
                  onMouseEnter={(e) => handleDayHover(day, e)}
                  onMouseLeave={handleDayHoverEnd}
                >
                  <span className="text-center font-semibold break-words">{day}</span>
                </div>
              ) : (
                <button
                  key={`day-${index}`}
                  onClick={isSelectable ? () => handleDayClick(day) : undefined}
                  disabled={!isSelectable}
                  onMouseEnter={(e) => handleDayHover(day, e)}
                  onMouseLeave={handleDayHoverEnd}
                  className={`min-h-[50px] sm:min-h-[80px] p-1 flex flex-col items-center justify-center text-xs sm:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${dayClass}`}
                  aria-label={isSelectable ? `Select ${day} ${MONTHS[currentMonth]} ${currentYear}` : `${day} ${MONTHS[currentMonth]} ${currentYear} - Not selectable`}
                  title={(() => {
                    const dayData = safeDayLogs.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
                    if (dayData && dayData.AttendanceStatus === "Absent" && isRegularizationAllowed(dayData)) {
                      return `Regularization Eligible - Punched in between 9:15-9:31 AM`;
                    }
                    return `${day} ${MONTHS[currentMonth]} ${currentYear}`;
                  })()}
                >
                  <span className="text-center font-semibold break-words">{day}</span>
                  {(() => {
                    // Get leave type from dayData for this specific day
                    const dayData = safeDayLogs.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
                    const dayLeaveType = dayData?.leaveType || dayData?.LeaveType || leaveType;
                    const dayLeaveTypeDisplay = dayLeaveType ? getLeaveTypeDisplay(dayLeaveType) : "";
                    
                    // Show leave type if it exists
                    if (dayLeaveTypeDisplay) {
                      return (
                        <span className="text-xs font-bold mt-0.5 sm:mt-1 px-1 py-0.5 bg-gray-900 text-white rounded break-words">
                          {dayLeaveTypeDisplay}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  {/* Show regularization eligibility indicator */}
                  {(() => {
                    const dayData = safeDayLogs.find((log) => log.AttendanceDate === `${day} ${MONTHS[currentMonth]} ${currentYear}`);
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
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-100 border border-gray-300 rounded flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Off Day</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1 hover:bg-gray-50 rounded transition-colors duration-150">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded shadow-lg flex-shrink-0"></div>
                          <span className="text-xs text-gray-700">Today</span>
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

      {/* Hover Tooltip */}
      {hoveredDay && getHoveredDaySummary() && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-48 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <div className="space-y-2">
            {/* Header */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-800">
                {hoveredDay} {MONTHS[currentMonth]}
              </h4>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                getHoveredDaySummary().status === 'Present' || getHoveredDaySummary().status === 'Full Day' 
                  ? 'bg-green-100 text-green-800' 
                  : getHoveredDaySummary().status === 'Half Day'
                  ? 'bg-yellow-100 text-yellow-800'
                  : getHoveredDaySummary().status === 'Absent'
                  ? 'bg-red-100 text-red-800'
                  : getHoveredDaySummary().status === 'Holiday'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getHoveredDaySummary().status}
              </span>
            </div>

            {/* Holiday Name */}
            {getHoveredDaySummary().holidayName && (
              <div className="text-center pb-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-semibold text-blue-700">
                  {getHoveredDaySummary().holidayName}
                </p>
              </div>
            )}

            {/* Key Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Hours:</span>
                <span className="font-medium text-gray-800">{getHoveredDaySummary().totalHours}</span>
              </div>
              
              {getHoveredDaySummary().firstIn && getHoveredDaySummary().firstIn !== "--" && getHoveredDaySummary().firstIn !== "00:00" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">In:</span>
                  <span className="font-medium text-gray-800">{getHoveredDaySummary().firstIn}</span>
                </div>
              )}

              {getHoveredDaySummary().lastOut && getHoveredDaySummary().lastOut !== "--" && getHoveredDaySummary().lastOut !== "00:00" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Out:</span>
                  <span className="font-medium text-gray-800">{getHoveredDaySummary().lastOut}</span>
                </div>
              )}

              {getHoveredDaySummary().leaveType && (
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span className="text-gray-600">Leave:</span>
                  <span className="font-medium text-blue-600">
                    {getLeaveTypeDisplay(getHoveredDaySummary().leaveType)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-200"></div>
        </div>
      )}

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
                  title="Raise Comp-Off"
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