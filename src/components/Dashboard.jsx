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

// Memoized SkeletonCard component
const SkeletonCard = React.memo(({ height = "h-20", width = "w-full" }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${height} ${width}`} aria-hidden="true"></div>
));

const LeaveCard = React.memo(({ title, value, bgColor, textColor, borderColor }) => (
  <div className={`p-4 sm:p-6 rounded-lg bg-gray-50 border-2 ${borderColor} hover:shadow-md transition-all duration-200`} role="region" aria-label={`${title} Leave`}>
    <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} mb-2`}>{value}</p>
    <h3 className="text-sm sm:text-base font-medium text-gray-700">{title}</h3>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaBullhorn className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Announcements</h3>
        </div>
        <div className="text-center py-8">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
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
                Show All ({displayAnnouncements.length})
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayedAnnouncements.map((announcement, index) => (
          <div
            key={index}
            className={`border border-gray-200 rounded-lg transition-all duration-200 ${
              expandedAnnouncement === index ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
            }`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleAnnouncement(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {announcement.description}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(announcement.dateTime)}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {announcement.imageUrl && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <img 
                        src={announcement.imageUrl} 
                        alt="Announcement" 
                        className="w-6 h-6 rounded object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    {expandedAnnouncement === index ? (
                      <FaChevronUp className="w-4 h-4" />
                    ) : (
                      <FaChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedAnnouncement === index && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <div className="pt-4">
                  <div className="space-y-3">
                    {announcement.title && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Title</h5>
                        <p className="text-sm text-gray-900">{announcement.title}</p>
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{announcement.description}</p>
                    </div>
                    {announcement.location && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Location</h5>
                        <p className="text-sm text-gray-900">{announcement.location}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        Published: {formatDate(announcement.dateTime)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAnnouncement(index);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Modal */}
      {showAllAnnouncements && hasMoreAnnouncements && (
        <div className="mt-6 pt-4 border-t border-gray-200">
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

  const calculateTotalHours = (punchRecords) => {
    if (!punchRecords) return "00:00";
    
    const punches = punchRecords.split(",").map(p => p.trim());
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center py-6">
          <FaClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No attendance data available</p>
        </div>
      </div>
    );
  }

  const totalHours = calculateTotalHours(attendanceData.PunchRecords);
  const punchRecords = attendanceData.PunchRecords ? attendanceData.PunchRecords.split(",").map(p => p.trim()) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-4">
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
            <p className="text-xs text-gray-500 mt-1">Total Hours</p>
          </div>
        </div>

                 {/* Status and Times */}
         <div className="grid grid-cols-3 gap-3 mb-3">
           <div className="bg-blue-50 rounded-lg p-3">
             <p className="text-xs text-blue-600 font-medium mb-1">Status</p>
             <p className="text-sm font-semibold text-blue-800">
               {attendanceData.AttendanceStatus || 'Not Available'}
             </p>
           </div>
           <div className="bg-green-50 rounded-lg p-3">
             <p className="text-xs text-green-600 font-medium mb-1">First In</p>
             <p className="text-sm font-semibold text-green-800">
               {attendanceData.InTime ? formatTime(attendanceData.InTime) : '--:--'}
             </p>
           </div>
           <div className="bg-red-50 rounded-lg p-3">
             <p className="text-xs text-red-600 font-medium mb-1">Last Out</p>
             <p className="text-sm font-semibold text-red-800">
               {attendanceData.OutTime ? formatTime(attendanceData.OutTime) : '--:--'}
             </p>
           </div>
         </div>

        {/* Expandable Punch Records */}
        {punchRecords.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
            >
              <span className="flex items-center gap-2">
                <FaClockIcon className="w-4 h-4 text-gray-500" />
                Punch Records ({punchRecords.length})
              </span>
              {isExpanded ? (
                <FaCompressAlt className="w-4 h-4 text-gray-500" />
              ) : (
                <FaExpandAlt className="w-4 h-4 text-gray-500" />
              )}
            </button>

                         {/* Dropdown Content */}
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
               isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
             }`}>
               <div className="mt-3 max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                 {punchRecords.map((punch, index) => {
                   const punchType = getPunchType(punch);
                   const time = formatTime(punch);
                   const isIn = punchType === "IN";
                   
                   return (
                     <div
                       key={index}
                       className={`flex items-center justify-between p-3 rounded-lg border ${
                         isIn 
                           ? 'bg-green-50 border-green-200' 
                           : 'bg-red-50 border-red-200'
                       }`}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${
                           isIn ? 'bg-green-500' : 'bg-red-500'
                         }`}></div>
                         <div>
                           <p className={`text-sm font-medium ${
                             isIn ? 'text-green-700' : 'text-red-700'
                           }`}>
                             {isIn ? 'Check In' : 'Check Out'}
                           </p>
                           <p className="text-xs text-gray-500">
                             Record #{index + 1}
                           </p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-semibold text-gray-900">{time}</p>
                         <p className={`text-xs font-medium ${
                           isIn ? 'text-green-600' : 'text-red-600'
                         }`}>
                           {punchType}
                         </p>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
});

const Dashboard = ({ reloadHandel }) => {
  const dispatch = useDispatch();
  console.log('reload', reloadHandel)
  const { loading, data } = useSelector((state) => state.userData);
  // Announcemnet
  const { data: announcementData } = useSelector((state) => state.announcementData);
  const pieData = [
    { name: "Salary", value: 15, color: "#f43f5e" },
    { name: "Bonus", value: 8, color: "#10b981" },
    { name: "Commission", value: 20, color: "#3b82f6" },
    { name: "Overtime", value: 11, color: "#f97316" },
    { name: "Reimbursement", value: 28, color: "#6366f1" },
    { name: "Benefits", value: 18, color: "#facc15" },
];

  const userDataList = data?.data || [];
  const { data: attendanceData, loading: attendanceLoading } = useSelector((state) => state.attendanceLogs);
  const { data: attendanceLogs } = useSelector((state) => state.attendanceLogsDayWise);

  const employeeId = useMemo(() => localStorage.getItem("employeId"), []);
  const latestData = attendanceData?.data?.map((item) => item.PunchRecords) || [];
  const punchDate = attendanceData?.data?.[0]?.AttendanceDate?.split("T")[0] || "No Date Available";

  // State to track selected day for attendance display
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  useEffect(() => {
    dispatch(getAttendanceLogsDayWise());
    dispatch(getOnLeaveStatusAction());
    if (employeeId) {
      dispatch(getAttendenceLogsOfEmploye(employeeId));
    }
  }, [dispatch, employeeId]);
  const onClick = () => {
    toast.dismiss()
  }
  
  // Callback function to handle selected day from calendar
  const handleDaySelection = useCallback((dayData, selectedDate) => {
    setSelectedDayData(dayData);
    setSelectedDayDate(selectedDate);
  }, []);
  
  useEffect(() => {
    dispatch(getUserDataAction());
    dispatch(getAnnouncementDataAction())
  }, []);

  return (
    <div className="w-full flex flex-col min-h-full overflow-x-hidden">
      <main className="space-y-6 flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-base sm:text-lg text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {userDataList?.role !== "Super-Admin" && userDataList?.role !== "HR-Admin" ? (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
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
            ) : userDataList?.role !== "HR-Admin" ? (
              <>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6">Employee's</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-700">Total Employees</h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-600">{attendanceLogs?.totalEmployees}</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-700">Present Employees</h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-green-600">{attendanceLogs?.totalPresent}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {/* Announcements Section - Moved Above Monthly Attendance */}
            {userDataList?.role !== "HR-Admin" && (
              <AnnouncementsSection announcements={announcementData?.data || []} />
            )}

            {userDataList?.role !== "HR-Admin" && (
              <>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">Monthly Attendance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-gray-800">Calendar</h3>
                    {/* <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      {[
                        ['bg-lime-400', 'Full Day'],
                        ['bg-amber-300', 'Half Day'],
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
                  <div className="lg:col-span-1">
                    <div className="h-full">
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

            {userDataList?.role === "HR-Admin" && (
              <>
                <HrAdminDashboard />
              </>
            )}

            {/* Footer - Responsive positioning */}
            {!loading && !attendanceLoading && (
              <div className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="flex flex-col items-center justify-center lg:-ml-56">
                  <div className="text-center px-4 sm:px-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                      © 2025 All Rights Reserved
                    </p>
                    <p className="text-xs text-gray-500">
                      Designed and Developed by{" "}
                      <span className="font-semibold text-gray-700">D&D Healthcare</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    
  );
};


export default Dashboard;
