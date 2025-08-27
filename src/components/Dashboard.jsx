import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Calendar from "./Calendar";
import AddEmployee from "./AddEmployee";
import { getAnnouncementDataAction, getAttendenceLogsOfEmploye, getOnLeaveStatusAction, getUserDataAction } from "../store/action/userDataAction";
import { getAttendanceLogsDayWise } from "../store/action/userAdminAction";
import { toast } from "react-toastify";
import {
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { FaUsers, FaUserPlus, FaUserTimes, FaBriefcase, FaClock, FaBullhorn, FaChevronDown, FaChevronUp, FaTimes, FaExpandAlt, FaCompressAlt, FaClock as FaClockIcon } from "react-icons/fa";
import HrAdminDashboard from "./HrAdminDashboard";
import CeoDashboard from "./CeoDashboard";
import safeToast from "../utils/safeToast";

// Memoized SkeletonCard component
const SkeletonCard = React.memo(({ height = "h-20", width = "w-full" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${height} ${width}`} aria-hidden="true"></div>
));

const LeaveCard = React.memo(({ title, value, bgColor, textColor, borderColor }) => (
  <div className={`p-3 sm:p-4 md:p-6 rounded-lg bg-gray-50 border-2 ${borderColor} hover:shadow-md transition-all duration-200`} role="region" aria-label={`${title} Leave`}>
    <p className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${textColor} mb-1 sm:mb-2`}>{value}</p>
    <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-700">{title}</h3>
  </div>
));

// Announcements Component
const AnnouncementsSection = ({ announcements }) => {
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  // Use real announcements data
  const displayAnnouncements = announcements || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleAnnouncement = (index) => {
    setExpandedAnnouncement(expandedAnnouncement === index ? null : index);
  };

  const toggleShowAll = () => {
    setShowAllAnnouncements(!showAllAnnouncements);
  };

  if (!displayAnnouncements || displayAnnouncements.length === 0) {
    return (
      <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-0 sm:border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaBullhorn className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="text-center py-6 sm:py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBullhorn className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Announcements</h4>
          <p className="text-gray-500">There are no announcements at the moment.</p>
        </div>
      </div>
    );
  }

  const displayedAnnouncements = showAllAnnouncements ? displayAnnouncements : displayAnnouncements.slice(0, 3);
  const hasMoreAnnouncements = displayAnnouncements.length > 3;

  return (
    <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-0 sm:border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaBullhorn className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Announcements</h3>
            <p className="text-sm text-gray-600">{displayAnnouncements.length} announcement{displayAnnouncements.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {hasMoreAnnouncements && (
          <button
            onClick={toggleShowAll}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            {showAllAnnouncements ? (
              <>
                <FaChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <FaChevronDown className="w-4 h-4" />
                Show More
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4 w-full">
        {displayedAnnouncements.map((announcement, index) => (
          <div
            key={announcement._id || index}
            className="border-0 sm:border border-gray-200 rounded-none sm:rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {announcement.title || 'No Title'}
                  </h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(announcement.dateTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {announcement.description || 'No description available'}
                </p>
                {expandedAnnouncement === index && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {announcement.description || 'No description available'}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleAnnouncement(index)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label={expandedAnnouncement === index ? "Collapse announcement" : "Expand announcement"}
              >
                {expandedAnnouncement === index ? (
                  <FaChevronUp className="w-4 h-4" />
                ) : (
                  <FaChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Modal */}
      {showAllAnnouncements && hasMoreAnnouncements && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={toggleShowAll}
            className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            Show Less Announcements
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Showing all {displayAnnouncements.length} announcements
          </p>
        </div>
      )}
    </div>
  );
};

// Attendance Card Component with Dropdown
const AttendanceCard = React.memo(({ attendanceData, date, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    // Extract time from format like "09:13 (IN 1)" or "18:31 (OUT 1)"
    const timeMatch = timeString.match(/(\d{2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeString;
  };

  const getPunchType = (punchString) => {
    if (punchString.includes("(IN")) return "IN";
    if (punchString.includes("(OUT")) return "OUT";
    return "UNKNOWN";
  };

  // Deduplicate and clean punch records
  const cleanPunchRecords = (punchRecords) => {
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
  };

  const calculateTotalHours = (punchRecords) => {
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
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border border-gray-200 p-3 sm:p-4 animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border border-gray-200 p-3 sm:p-4">
        <div className="text-center py-6">
          <FaClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No attendance data available</p>
        </div>
      </div>
    );
  }

  const totalHours = calculateTotalHours(attendanceData.PunchRecords);
  const punchRecords = cleanPunchRecords(attendanceData.PunchRecords);

  return (
    <div className="bg-white rounded-none sm:rounded-lg shadow-sm border-0 sm:border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Attendance Summary</h3>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaClockIcon className="w-4 h-4 text-blue-500" />
              <span>{totalHours}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Effective Hours</p>
          </div>
        </div>

        {/* Status and Times */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Status</p>
            <p className="text-sm font-semibold text-blue-800">
              {attendanceData.AttendanceStatus || 'Not Available'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-green-600 font-medium mb-1">First In</p>
            <p className="text-sm font-semibold text-green-800">
              {attendanceData.InTime ? formatTime(attendanceData.InTime) : '--:--'}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-red-600 font-medium mb-1">Last Out</p>
            <p className="text-sm font-semibold text-red-800">
              {attendanceData.OutTime ? formatTime(attendanceData.OutTime) : '--:--'}
            </p>
          </div>
        </div>

        {/* Expandable Punch Records */}
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={toggleExpanded}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <span>Punch Records ({punchRecords.length})</span>
            {isExpanded ? (
              <FaChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {punchRecords.map((record, index) => {
                const time = formatTime(record);
                const isIn = record.includes("(IN");
                const punchType = getPunchType(record);
                
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isIn ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className={`text-xs font-medium ${
                          isIn ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {isIn ? 'Check In' : 'Check Out'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          Record #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{time}</p>
                      <p className={`text-xs font-semibold ${
                        isIn ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {punchType}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const Dashboard = ({ reloadHandel }) => {
  try {
    const dispatch = useDispatch();
    console.log('Dashboard: Component starting, reloadHandel:', reloadHandel);
    
    const { loading, data, error, initialized } = useSelector((state) => state.userData);
    console.log('Dashboard: Redux state extracted:', { loading, hasData: !!data, error, initialized });
  
  // Announcement
  const { data: announcementData, loading: announcementLoading } = useSelector((state) => state.announcementData);
  const pieData = [
    { name: "Salary", value: 15, color: "#f43f5e" },
    { name: "Bonus", value: 8, color: "#10b981" },
    { name: "Commission", value: 20, color: "#3b82f6" },
    { name: "Overtime", value: 11, color: "#f97316" },
    { name: "Reimbursement", value: 28, color: "#6366f1" },
    { name: "Benefits", value: 18, color: "#facc15" },
];

  const { data: attendanceData, loading: attendanceLoading } = useSelector((state) => state.attendanceLogs);
  const { data: attendanceLogs } = useSelector((state) => state.attendanceLogsDayWise);

  const employeeId = useMemo(() => {
    try {
      const id = localStorage.getItem("employeId");
      const token = localStorage.getItem("authToken");
      console.log('Dashboard localStorage check:', { 
        employeeId: id, 
        hasToken: !!token,
        tokenLength: token?.length 
      });
      return id || null;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return null;
    }
  }, []); // Empty dependency array since localStorage values don't change during component lifecycle
  
  // Safe data access with fallbacks - moved to top to prevent initialization error
  const userDataList = data?.data || data || null;
  
  // Debug data structure - only log when data changes
  useEffect(() => {
    if (data && !loading) {
      console.log('Dashboard: Data structure analysis:', {
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : null,
        userDataListExists: !!userDataList,
        userDataListKeys: userDataList ? Object.keys(userDataList) : null
      });
    }
  }, [data, userDataList, loading]);
  
  // Debug logging - only log when data changes to reduce noise
  useEffect(() => {
    if (data && !loading) {
      console.log('Dashboard state:', { 
        loading, 
        hasData: !!data, 
        error, 
        initialized, 
        userDataListExists: !!userDataList,
        employeeId
      });
    }
  }, [data, loading, error, initialized, userDataList, employeeId]);
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!data && !error && !loading) {
        console.warn('Dashboard loading timeout - no data received after 10 seconds');
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [data, error, loading]);
  
  // Handle authentication errors gracefully
  useEffect(() => {
    if (error && (error.includes('Authentication') || error.includes('token') || error.includes('Employee ID'))) {
      console.warn('Authentication error detected:', error);
      // Don't show error to user, just log it
    }
  }, [error]);
  
  const latestData = attendanceData?.data?.map((item) => item.PunchRecords) || [];
  const punchDate = attendanceData?.data?.[0]?.AttendanceDate?.split("T")[0] || "No Date Available";

  // State to track selected day for attendance display
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  // Component mount effect - only log once on mount
  useEffect(() => {
    console.log('Dashboard: Component mounted', { 
      employeeId, 
      hasData: !!data
    });
  }, []); // Empty dependency array to only run once

  useEffect(() => {
    // Only fetch user data if it hasn't been fetched yet by App.js
    if (employeeId && !data && !loading) {
      console.log('Dashboard: Dispatching getUserDataAction', { employeeId, loading, hasData: !!data });
      dispatch(getUserDataAction());
    } else if (employeeId && data) {
      console.log('Dashboard: User data already available, skipping fetch');
      console.log('Dashboard: Available data:', data);
    } else if (!employeeId) {
      console.log('Dashboard: No employee ID available');
    } else {
      console.log('Dashboard: Waiting for data to load or already loading');
    }
  }, [dispatch, employeeId, data, loading]);

  // Monitor state changes - only log when loading or data changes significantly
  useEffect(() => {
    if (loading || data !== undefined) {
      console.log('Dashboard: State changed', { 
        loading, 
        hasData: !!data, 
        error, 
        initialized
      });
    }
  }, [loading, data, error, initialized]);

  useEffect(() => {
    // Only dispatch actions if we have valid data and haven't already fetched them
    if (employeeId && !loading && !attendanceData?.data) {
      dispatch(getAttendanceLogsDayWise());
      dispatch(getOnLeaveStatusAction());
      dispatch(getAttendenceLogsOfEmploye(employeeId));
    }
  }, [dispatch, employeeId, loading, attendanceData?.data]);
  const onClick = () => {
    safeToast.dismiss()
  }
  
  // Callback function to handle selected day from calendar
  const handleDaySelection = useCallback((dayData, selectedDate) => {
    setSelectedDayData(dayData);
    setSelectedDayDate(selectedDate);
  }, []);
  
  useEffect(() => {
    // Only fetch announcements if we're not loading and haven't already fetched them
    if (!loading && !announcementLoading && !announcementData?.data) {
      dispatch(getAnnouncementDataAction());
    }
  }, [dispatch, loading, announcementLoading, announcementData?.data]);

  // Cleanup toasts on component unmount
  useEffect(() => {
    return () => {
      // Dismiss all toasts when component unmounts to prevent runtime errors
      safeToast.dismiss();
    };
  }, []);

  // Only log rendering when data changes significantly
  useEffect(() => {
    if (data && !loading) {
      console.log('Dashboard: Rendering component with data:', { 
        hasData: !!data, 
        userDataListExists: !!userDataList,
        userRole: userDataList?.role 
      });
    }
  }, [data, userDataList, loading]);
  
  return (
    <div className="w-full flex flex-col min-h-full overflow-x-hidden">
      <main className="space-y-4 sm:space-y-6 flex-1 px-0 sm:px-4 lg:px-6 w-full">
        {(loading) ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {loading ? "Loading dashboard..." : "Initializing dashboard..."}
              </p>
              {!loading && !data && !error && (
                <p className="text-sm text-gray-500 mt-2">No user data available</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {!data || !userDataList ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No user data available. Please check authentication.</p>
              </div>
            ) : userDataList?.role !== "Super-Admin" && userDataList?.role !== "HR-Admin" ? (
              <>
                <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-0 sm:border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaBriefcase className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Leave Balance</h3>
                        <p className="text-sm text-gray-600">Available leave days</p>
                      </div>
                    </div>
                    {userDataList?.employmentType === "Contractual" ? null : (
                      <AddEmployee tittleBtn="Apply Leave" onClick={onClick} />
                    )}
                  </div>
                  
                  {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      <LeaveCard 
                        title="Casual" 
                        value={userDataList?.leaveBalance?.casualLeave || 0} 
                        textColor="text-green-600" 
                        borderColor="border-green-200" 
                      />
                      <LeaveCard 
                        title="Medical" 
                        value={userDataList?.leaveBalance?.medicalLeave || 0} 
                        textColor="text-blue-600" 
                        borderColor="border-blue-200" 
                      />
                      <LeaveCard 
                        title="Earned" 
                        value={userDataList?.leaveBalance?.earnedLeave || 0} 
                        textColor="text-yellow-600" 
                        borderColor="border-yellow-200" 
                      />
                      <LeaveCard 
                        title="Comp-Off" 
                        value={userDataList?.leaveBalance?.compOffLeave || 0} 
                        textColor="text-red-600" 
                        borderColor="border-red-200" 
                      />
                    </div>
                  )}
                </div>
              </>
            ) : userDataList?.role === "Super-Admin" ? (
              <>
                <CeoDashboard />
              </>
            ) : null}

            {userDataList?.role !== "HR-Admin" && userDataList?.role !== "Super-Admin" && (
              <>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 px-0">Monthly Attendance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                 <div className="bg-white p-4 sm:p-6 rounded-none sm:rounded-lg shadow-md lg:col-span-2 w-full">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-800">Calendar</h3>
                    {/* <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      {[
                        ['bg-lime-400', 'Full Day'],
                        ['bg-amber-300', 'Half Day'],F
                        ['bg-red-400', 'Absent'],
                        ['bg-blue-400', 'Holiday'],
                        ['bg-black', 'Leave Applied']
                      ].map(([bg, label], i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className={`${bg} w-3 h-3 rounded-full`}></span>
                          <p className="text-gray-700">{label}</p>
                        </div>
                      ))}
                    </div> */}
                    {attendanceLoading ? <SkeletonCard height="h-40" /> : <Calendar employeeId={employeeId} userRole={userDataList?.role} onDaySelect={handleDaySelection} />}
                  </div>
                  <div className="lg:col-span-1 w-full">
                    <div className="h-full w-full">
                      <AttendanceCard 
                        attendanceData={selectedDayData || (latestData?.length > 0 ? { 
                          AttendanceStatus: 'Present',
                          InTime: latestData[0]?.split(",").find(item => item.includes("(IN")) || null,
                          OutTime: latestData[0]?.split(",").find(item => item.includes("(OUT")) || null,
                          PunchRecords: latestData[0] || null
                        } : null)}
                        date={selectedDayDate || punchDate}
                        isLoading={attendanceLoading}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {userDataList?.role === "HR-Admin" && (   // HR-Admin Dashboard 
              <>
                <HrAdminDashboard />
              </>
            )}

            {/* Announcements Section - Moved to Bottom */}
            {userDataList?.role !== "HR-Admin" && userDataList?.role !== "Super-Admin" && (
              <AnnouncementsSection announcements={announcementData?.data || []} />
            )}


          </>
        )}
      </main>
    </div>
    
  );
  } catch (error) {
    console.error('Dashboard: Error in component:', error);
    return (
      <div className="w-full flex flex-col min-h-full overflow-x-hidden">
        <main className="space-y-4 sm:space-y-6 flex-1 px-0 sm:px-4 lg:px-6 w-full">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading dashboard. Please refresh the page.</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </main>
      </div>
    );
  }
};


export default Dashboard;
