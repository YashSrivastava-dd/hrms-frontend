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
                                                        Day Type
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {loading ? (
                                                    Array(5).fill(0).map((_, idx) => <SkeletonLoader key={idx} />)
                                                ) : employees?.length > 0 ? (
                                                    employees.map((employee, index) => {
                                                        // Helper function to convert a time string to a Date object for comparison
                                                        const timeToDate = (timeStr, attendanceDate) => {
                                                            if (!timeStr || !attendanceDate) return null;
                                                            try {
                                                                let date;
                                                                if (timeStr.includes('T')) {
                                                                    date = new Date(timeStr);
                                                                } else if (timeStr.includes(' ')) {
                                                                    date = new Date(timeStr);
                                                                } else if (timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                                                                    const baseDate = new Date(attendanceDate);
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
                                                        };

                                                        // Helper to check if a time value is valid
                                                        const isTimeValid = (time) => {
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
                                                        };

                                                        // Helper function to extract ALL IN times from PunchRecords
                                                        const extractAllInTimes = (punchRecords, attendanceDate) => {
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
                                                                                    if (attendanceDate) {
                                                                                        const date = new Date(attendanceDate);
                                                                                        if (!isNaN(date.getTime())) {
                                                                                            date.setHours(hours, mins, secs || 0, 0);
                                                                                            allInTimes.push(date);
                                                                                        }
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
                                                        };

                                                        // Helper function to extract ALL OUT times from PunchRecords
                                                        const extractAllOutTimes = (punchRecords, attendanceDate) => {
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
                                                                                    if (attendanceDate) {
                                                                                        const date = new Date(attendanceDate);
                                                                                        if (!isNaN(date.getTime())) {
                                                                                            date.setHours(hours, mins, secs || 0, 0);
                                                                                            allOutTimes.push(date);
                                                                                        }
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
                                                        };

                                                        // Collect ALL IN times from both InTime field and PunchRecords
                                                        const allInTimes = [];
                                                        const allOutTimes = [];
                                                        
                                                        if (isTimeValid(employee?.InTime)) {
                                                            const inDate = timeToDate(employee.InTime, employee.AttendanceDate);
                                                            if (inDate) allInTimes.push(inDate);
                                                        }
                                                        
                                                        if (isTimeValid(employee?.OutTime)) {
                                                            const outDate = timeToDate(employee.OutTime, employee.AttendanceDate);
                                                            if (outDate) allOutTimes.push(outDate);
                                                        }
                                                        
                                                        if (employee?.PunchRecords && employee.PunchRecords.trim() !== '') {
                                                            const punchInTimes = extractAllInTimes(employee.PunchRecords, employee.AttendanceDate);
                                                            const punchOutTimes = extractAllOutTimes(employee.PunchRecords, employee.AttendanceDate);
                                                            allInTimes.push(...punchInTimes);
                                                            allOutTimes.push(...punchOutTimes);
                                                        }
                                                        
                                                        // Find the EARLIEST IN time
                                                        let checkInTime = null;
                                                        if (allInTimes.length > 0) {
                                                            allInTimes.sort((a, b) => a.getTime() - b.getTime());
                                                            checkInTime = allInTimes[0].toISOString();
                                                        }
                                                        
                                                        // Find the LATEST OUT time
                                                        let checkOutTime = null;
                                                        if (allOutTimes.length > 0) {
                                                            allOutTimes.sort((a, b) => b.getTime() - a.getTime());
                                                            checkOutTime = allOutTimes[0].toISOString();
                                                        }
                                                        
                                                        // Calculate Effective Hours by summing all IN-OUT pairs (actual time in office)
                                                        // This accounts for breaks - e.g., IN 9am, OUT 1pm, IN 2pm, OUT 6pm = 4+4 = 8 hours
                                                        let hours = 0;
                                                        let minutes = 0;
                                                        let durationInMinutes = 0;
                                                        
                                                        // If we have PunchRecords, calculate from all IN-OUT pairs
                                                        if (employee?.PunchRecords && employee.PunchRecords.trim() !== '') {
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
                                                                
                                                                hours = Math.floor(durationInMinutes / 60);
                                                                minutes = durationInMinutes % 60;
                                                                
                                                                console.log('✓✓ Calculated Effective Hours from all IN-OUT pairs:', 
                                                                    `${hours}h ${minutes}m (${durationInMinutes} minutes)`, 
                                                                    `from ${punchPairs.length} punch records`);
                                                            } catch (error) {
                                                                console.warn('Error calculating duration from PunchRecords:', error);
                                                            }
                                                        }
                                                        
                                                        // Fallback: If no PunchRecords or calculation failed, use resolved times (earliest IN - latest OUT)
                                                        if (durationInMinutes === 0 && checkInTime && checkOutTime) {
                                                            try {
                                                                const inTime = new Date(checkInTime);
                                                                const outTime = new Date(checkOutTime);
                                                                if (!isNaN(inTime.getTime()) && !isNaN(outTime.getTime())) {
                                                                    const inYear = inTime.getFullYear();
                                                                    const outYear = outTime.getFullYear();
                                                                    if (inYear >= 2000 && inYear <= 2100 && outYear >= 2000 && outYear <= 2100) {
                                                                        const inHours = inTime.getHours();
                                                                        const inMins = inTime.getMinutes();
                                                                        const inSecs = inTime.getSeconds();
                                                                        const outHours = outTime.getHours();
                                                                        const outMins = outTime.getMinutes();
                                                                        const outSecs = outTime.getSeconds();
                                                                        if (!(inHours === 0 && inMins === 0 && inSecs === 0) && !(outHours === 0 && outMins === 0 && outSecs === 0)) {
                                                                            const diffMs = outTime - inTime;
                                                                            if (diffMs > 0) {
                                                                                durationInMinutes = Math.floor(diffMs / (1000 * 60));
                                                                                if (durationInMinutes <= 48 * 60) {
                                                                                    hours = Math.floor(durationInMinutes / 60);
                                                                                    minutes = durationInMinutes % 60;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            } catch (error) {
                                                                console.warn('Error calculating duration from resolved times:', error);
                                                            }
                                                        }
                                                        
                                                        // Final fallback: Use employee.Duration if available
                                                        if (durationInMinutes === 0 && employee.Duration > 0) {
                                                            durationInMinutes = employee.Duration;
                                                            hours = Math.floor(durationInMinutes / 60);
                                                            minutes = durationInMinutes % 60;
                                                        }
                                                        
                                                        // Calculate shift duration to determine Full Day vs Half Day
                                                        // Try to get shift timing from employeeShiftTiming (from allEmployees), employee record, or first employee record
                                                        let shiftDurationMinutes = 8 * 60; // Default 8 hours
                                                        let shiftStartTime = null;
                                                        let shiftEndTime = null;
                                                        
                                                        // Priority 1: Use employeeShiftTiming from allEmployees (most reliable)
                                                        if (employeeShiftTiming?.startAt && employeeShiftTiming?.endAt) {
                                                            shiftStartTime = employeeShiftTiming.startAt;
                                                            shiftEndTime = employeeShiftTiming.endAt;
                                                        }
                                                        // Priority 2: Check if shift timing is available in current employee record
                                                        else if (employee?.shiftTime?.startAt && employee?.shiftTime?.endAt) {
                                                            shiftStartTime = employee.shiftTime.startAt;
                                                            shiftEndTime = employee.shiftTime.endAt;
                                                        } 
                                                        // Priority 3: Try to get from first employee record (all records are for same employee)
                                                        else if (employees.length > 0) {
                                                            const firstEmployee = employees[0];
                                                            if (firstEmployee?.shiftTime?.startAt && firstEmployee?.shiftTime?.endAt) {
                                                                shiftStartTime = firstEmployee.shiftTime.startAt;
                                                                shiftEndTime = firstEmployee.shiftTime.endAt;
                                                            }
                                                        }
                                                        
                                                        // Calculate shift duration from start and end times
                                                        if (shiftStartTime && shiftEndTime) {
                                                            try {
                                                                // Parse shift times (format: "10:00" or "10:00 AM" or "10:00:00")
                                                                const parseTime = (timeStr) => {
                                                                    if (!timeStr) return null;
                                                                    // Remove AM/PM and extract hours:minutes
                                                                    const cleaned = timeStr.replace(/\s*(AM|PM|am|pm)\s*/i, '').trim();
                                                                    const parts = cleaned.split(':');
                                                                    if (parts.length >= 2) {
                                                                        let h = parseInt(parts[0], 10);
                                                                        const m = parseInt(parts[1], 10);
                                                                        
                                                                        // Handle 12-hour format
                                                                        if (timeStr.toLowerCase().includes('pm') && h !== 12) {
                                                                            h += 12;
                                                                        } else if (timeStr.toLowerCase().includes('am') && h === 12) {
                                                                            h = 0;
                                                                        }
                                                                        
                                                                        return { hours: h, minutes: m || 0 };
                                                                    }
                                                                    return null;
                                                                };
                                                                
                                                                const start = parseTime(shiftStartTime);
                                                                const end = parseTime(shiftEndTime);
                                                                
                                                                if (start && end) {
                                                                    const startMinutes = start.hours * 60 + start.minutes;
                                                                    let endMinutes = end.hours * 60 + end.minutes;
                                                                    
                                                                    // Handle case where end time is next day (e.g., night shift)
                                                                    if (endMinutes < startMinutes) {
                                                                        endMinutes += 24 * 60; // Add 24 hours
                                                                    }
                                                                    
                                                                    const calculatedDuration = endMinutes - startMinutes;
                                                                    
                                                                    // Validate calculated duration (should be between 1 and 24 hours)
                                                                    if (calculatedDuration >= 60 && calculatedDuration <= 24 * 60) {
                                                                        shiftDurationMinutes = calculatedDuration;
                                                                        
                                                                        console.log('Shift timing calculated:', {
                                                                            startAt: shiftStartTime,
                                                                            endAt: shiftEndTime,
                                                                            shiftDurationMinutes,
                                                                            shiftDurationHours: shiftDurationMinutes / 60
                                                                        });
                                                                    } else {
                                                                        console.warn('Invalid shift duration calculated:', calculatedDuration, 'using default 8 hours');
                                                                        shiftDurationMinutes = 8 * 60; // Fall back to default
                                                                    }
                                                                } else {
                                                                    console.warn('Failed to parse shift times, using default 8 hours');
                                                                    shiftDurationMinutes = 8 * 60; // Fall back to default
                                                                }
                                                            } catch (error) {
                                                                console.warn('Error calculating shift duration:', error);
                                                                // Fall back to default 8 hours
                                                                shiftDurationMinutes = 8 * 60;
                                                            }
                                                        }
                                                        
                                                        // Determine Full Day and Half Day thresholds based on shift duration
                                                        // Full Day = >= 80% of shift duration
                                                        // Half Day = >= 50% but < 80% of shift duration
                                                        // Ensure shiftDurationMinutes is valid (at least 1 hour)
                                                        if (shiftDurationMinutes < 60) {
                                                            shiftDurationMinutes = 8 * 60; // Default to 8 hours if invalid
                                                        }
                                                        
                                                        const fullDayThreshold = Math.floor(shiftDurationMinutes * 0.8); // 80% of shift
                                                        const halfDayThreshold = Math.floor(shiftDurationMinutes * 0.5); // 50% of shift
                                                        
                                                        let dayType = "Off Day";
                                                        let dayTypeColor = "bg-gray-100 text-gray-800";
                                                        
                                                        // Calculate duration from hours and minutes if durationInMinutes is 0 but hours/minutes are available
                                                        let effectiveDuration = durationInMinutes;
                                                        if (effectiveDuration === 0 && (hours > 0 || minutes > 0)) {
                                                            effectiveDuration = hours * 60 + minutes;
                                                        }
                                                        
                                                        // Only set day type if there are actual work hours
                                                        if (effectiveDuration > 0) {
                                                            if (effectiveDuration >= fullDayThreshold) {
                                                                dayType = "Full Day";
                                                                dayTypeColor = "bg-green-100 text-green-800";
                                                            } else if (effectiveDuration >= halfDayThreshold) {
                                                                dayType = "Half Day";
                                                                dayTypeColor = "bg-yellow-100 text-yellow-800";
                                                            } else {
                                                                // Less than half day threshold but has some hours - still mark as Half Day
                                                                dayType = "Half Day";
                                                                dayTypeColor = "bg-yellow-100 text-yellow-800";
                                                            }
                                                        }
                                                        
                                                        // Debug logging for shift-based calculation (log all records for debugging)
                                                        console.log(`Day type calculation for ${employee.AttendanceDate}:`, {
                                                            durationInMinutes,
                                                            hours,
                                                            minutes,
                                                            shiftDurationMinutes,
                                                            shiftHours: shiftDurationMinutes / 60,
                                                            fullDayThreshold,
                                                            halfDayThreshold,
                                                            dayType,
                                                            shiftStartTime,
                                                            shiftEndTime,
                                                            hasEmployeeShiftTiming: !!employeeShiftTiming,
                                                            employeeShiftTiming
                                                        });

                                                        // Format time for display
                                                        const formatTime = (timeStr) => {
                                                            if (!timeStr) return "--";
                                                            if (timeStr.includes("T")) {
                                                                try {
                                                                    const date = new Date(timeStr);
                                                                    if (isNaN(date.getTime())) return "--";
                                                                    const hours = date.getHours();
                                                                    const mins = date.getMinutes();
                                                                    const secs = date.getSeconds();
                                                                    if (hours === 0 && mins === 0 && secs === 0) return "--";
                                                                    const year = date.getFullYear();
                                                                    if (year < 2000 || year > 2100) return "--";
                                                                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                                                } catch { return "--"; }
                                                            }
                                                            if (timeStr.includes(" ")) {
                                                                const time = timeStr.split(" ")[1];
                                                                return time === "00:00:00" ? "--" : time || "--";
                                                            }
                                                            if (timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                                                                const [h, m] = timeStr.split(':');
                                                                if (parseInt(h, 10) === 0 && parseInt(m, 10) === 0) return "--";
                                                                const date = new Date();
                                                                date.setHours(parseInt(h, 10), parseInt(m, 10), timeStr.split(':')[2] ? parseInt(timeStr.split(':')[2], 10) : 0, 0);
                                                                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                                                            }
                                                            return timeStr || "--";
                                                        };

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
                                                                    {durationInMinutes > 0 ? `${hours} Hours ${minutes} Minutes` : '--'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dayTypeColor}`}>
                                                                        {dayType}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        employee.Status === 'Present' 
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : employee.Status === 'Absent'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {employee.Status || '--'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center">
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