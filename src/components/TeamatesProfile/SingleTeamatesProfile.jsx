import { IoChevronBackOutline } from 'react-icons/io5'
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { getAttendenceLogsOfEmploye, getAllUserDataAction } from '../../store/action/userDataAction';
import Calendar from '../Calendar';
import { FaCalendarAlt, FaClock, FaUserTie, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import dayjs from 'dayjs';

function SingleTeamatesProfile({ onBack, employeeTicket, employeeName, employeeLeaveBalance }) {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState({ 
        startDate: dayjs().subtract(30, 'day'), 
        endDate: dayjs() 
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [activeTab, setActiveTab] = useState("teamLogs"); // Track which tab is active
    const { data: userData } = useSelector((state) => state.userData);
    const userDataList = userData?.data?.role || [];
    const { loading, data, error } = useSelector((state) => state.attendanceLogs);
    const employees = data?.data || [];
    // Get employee data to access shift timing
    const { data: allUserData } = useSelector((state) => state.allUserData);
    const allEmployees = allUserData?.data || [];
    // Note: Calendar component handles its own data fetching and state management
    const dispatch = useDispatch();
    
    // Fetch employee data to get shift timing
    useEffect(() => {
        dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
    }, [dispatch]);
    
    useEffect(() => {
        if (employeeTicket) {
            const dateFrom = date.startDate ? date.startDate.format("YYYY-MM-DD") : dayjs().subtract(30, 'day').format("YYYY-MM-DD");
            const dateTo = date.endDate ? date.endDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
            
            dispatch(getAttendenceLogsOfEmploye(employeeTicket, dateFrom, dateTo, null));
        }
    }, [employeeTicket, date.startDate, date.endDate, dispatch]);
    
    // Get employee shift timing from allEmployees data
    const employeeShiftTiming = useMemo(() => {
        if (!employeeTicket || !allEmployees || allEmployees.length === 0) return null;
        const employee = allEmployees.find(emp => emp.employeeId === employeeTicket);
        return employee?.shiftTime || null;
    }, [employeeTicket, allEmployees]);

    // Note: Calendar component now handles its own data fetching

    const handleOpenModal = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const SkeletonLoader = () => (
        <tr className="animate-pulse">
            {Array(6)
                .fill(0)
                .map((_, idx) => (
                    <td key={idx} className="p-5 text-center">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    </td>
                ))}
        </tr>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header Section */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="w-full px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={onBack}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <IoChevronBackOutline size={25} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{employeeName}</h1>
                                <p className="text-gray-600">Employee Profile & Attendance Details</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {employeeName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-6 py-6">
                {/* Leave Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800">Casual Leave</h3>
                                <p className="text-3xl font-bold text-yellow-900">{employeeLeaveBalance?.casualLeave || 0}</p>
                                <p className="text-sm text-yellow-700">Available</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">🎯</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800">Earned Leave</h3>
                                <p className="text-3xl font-bold text-blue-900">{employeeLeaveBalance?.earnedLeave || 0}</p>
                                <p className="text-sm text-blue-700">Available</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">⭐</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-purple-800">Medical Leave</h3>
                                <p className="text-3xl font-bold text-purple-900">{employeeLeaveBalance?.medicalLeave || 0}</p>
                                <p className="text-sm text-purple-700">Available</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">🏥</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">Comp Off</h3>
                                <p className="text-3xl font-bold text-green-900">{employeeLeaveBalance?.compOffLeave || 0}</p>
                                <p className="text-sm text-green-700">Available</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">🎁</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab("teamLogs")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === "teamLogs"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FaClock className="w-4 h-4" />
                                    <span>Attendance Logs</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("calendar")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === "calendar"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FaCalendarAlt className="w-4 h-4" />
                                    <span>Calendar View</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === "teamLogs" && (
                            <div>
                                {/* Date Range Selection */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                                        <div className="flex items-center space-x-4">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="From Date (Last 30 days by default)"
                                                    value={date.startDate}
                                                    onChange={(newValue) => setDate(prev => ({ ...prev, startDate: newValue }))}
                                                    renderInput={(params) => <input {...params} />}
                                                    className="w-full"
                                                />
                                            </LocalizationProvider>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="To Date (Today by default)"
                                                    value={date.endDate}
                                                    onChange={(newValue) => setDate(prev => ({ ...prev, endDate: newValue }))}
                                                    renderInput={(params) => <input {...params} />}
                                                    className="w-full"
                                                />
                                            </LocalizationProvider>
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Check In
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Check Out
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Effective Hours
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {loading ? (
                                                    Array(5).fill(0).map((_, idx) => <SkeletonLoader key={idx} />)
                                                ) : employees?.length > 0 ? (
                                                    employees.map((employee, index) => {
                                                        // Format time from backend ONLY - supports ISO format, space-separated, or HH:MM format
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

                                                        // Format Duration from backend ONLY - NO FRONTEND CALCULATIONS
                                                        const formatDuration = (duration) => {
                                                            // Use ONLY backend Duration field - NO CALCULATIONS
                                                            if (!duration || duration === 0 || duration === '--' || duration === '') return "--";
                                                            
                                                            // If it's a string with colon (HH:MM format), format for display
                                                            if (typeof duration === 'string' && duration.includes(':')) {
                                                                const [hours, minutes] = duration.split(':').map(Number);
                                                                if (isNaN(hours) || isNaN(minutes)) return "--";
                                                                return `${hours} Hours ${minutes} Minutes`;
                                                            }
                                                            
                                                            // If it's a number (minutes), convert to hours and minutes for display
                                                            if (typeof duration === 'number') {
                                                                const hours = Math.floor(duration / 60);
                                                                const minutes = duration % 60;
                                                                return `${hours} Hours ${minutes} Minutes`;
                                                            }
                                                            
                                                            // If DurationString field exists from backend, use it directly
                                                            if (employee.DurationString) {
                                                                return employee.DurationString;
                                                            }
                                                            
                                                            // If no backend Duration available, return "--" - NO CALCULATIONS
                                                            return "--";
                                                        };

                                                        // Use ONLY backend data - NO CALCULATIONS
                                                        // Check In: Use employee.InTime from backend
                                                        const checkInTime = employee?.InTime || null;
                                                        
                                                        // Check Out: Use employee.OutTime from backend
                                                        const checkOutTime = employee?.OutTime || null;
                                                        
                                                        // Effective Hours: Use employee.Duration from backend
                                                        const effectiveHours = formatDuration(employee?.Duration);

                                                        return (
                                                            <tr key={employee.id || index} className="hover:bg-gray-50 transition-colors duration-200">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {employee.AttendanceDate?.split("T")[0] || '--'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatTime(checkInTime)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatTime(checkOutTime)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {effectiveHours}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        employee.Status === 'Present' || employee.AttendanceStatus === 'Present'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : employee.Status === 'Absent' || employee.AttendanceStatus === 'Absent'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {employee.AttendanceStatus || employee.Status || '--'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-12 text-center">
                                                            <div className="text-gray-500">
                                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                    <FaClock className="w-8 h-8 text-gray-400" />
                                                                </div>
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                                                                <p className="text-gray-500">Try selecting a different date range</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "calendar" && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <Calendar 
                                    employeeId={employeeTicket} 
                                    userRole={userDataList}
                                    onDaySelect={(dayData, selectedDate) => {
                                        // Handle day selection if needed
                                        console.log('Selected day:', dayData, selectedDate);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Employee Details Modal */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="employee-details-modal"
                aria-describedby="employee-details-description"
            >
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
                    {selectedEmployee && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Employee Details</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <FaIdCard className="w-5 h-5 text-blue-500" />
                                    <span className="text-gray-700">ID: {selectedEmployee.employeeId}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaUserTie className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">Name: {selectedEmployee.employeeName}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaPhone className="w-5 h-5 text-purple-500" />
                                    <span className="text-gray-700">Contact: {selectedEmployee.contactNo}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaEnvelope className="w-5 h-5 text-orange-500" />
                                    <span className="text-gray-700">Email: {selectedEmployee.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaMapMarkerAlt className="w-5 h-5 text-red-500" />
                                    <span className="text-gray-700">Location: {selectedEmployee.location || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>
        </div>
    );
}

export default SingleTeamatesProfile;