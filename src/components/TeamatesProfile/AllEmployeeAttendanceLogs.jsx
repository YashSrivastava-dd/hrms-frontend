import { IoChevronBackOutline } from 'react-icons/io5'
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { getAttendenceLogsOfEmploye } from '../../store/action/userDataAction';
import Calendar from '../Calendar';
import { FaLongArrowAltLeft } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaCalendarAlt, FaClock, FaUserTie, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSearch, FaFilter } from 'react-icons/fa';
import dayjs from 'dayjs';

function AllEmployeeAttendanceLogs({ onBack, employeeTicket, employeeName, employeeLeaveBalance }) {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState({ 
        startDate: dayjs().startOf('month'), 
        endDate: dayjs().endOf('month') 
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [count, setCount] = useState(1); // Pagination count
    const [activeTab, setActiveTab] = useState("teamLogs"); // Track which tab is active
    const [filterStatus, setFilterStatus] = useState('all'); // Filter by attendance status
    const { data: userData } = useSelector((state) => state.userData);
    const userDataList = userData?.data?.role || [];
    const { loading, data, error } = useSelector((state) => state.attendanceLogs);
    const employees = data?.data || [];
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (employeeTicket) {
            const dateFrom = date.startDate ? date.startDate.format("YYYY-MM-DD") : dayjs().startOf('month').format("YYYY-MM-DD");
            const dateTo = date.endDate ? date.endDate.format("YYYY-MM-DD") : dayjs().endOf('month').format("YYYY-MM-DD");
            
            dispatch(getAttendenceLogsOfEmploye(employeeTicket, dateFrom, dateTo, count));
        }
    }, [employeeTicket, date.startDate, date.endDate, count, dispatch]);

    const handleOpenModal = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const handlePrevious = () => {
        if (count > 1) {
            setCount((prevCount) => prevCount - 1);
        }
    };

    const handleNext = () => {
        setCount((prevCount) => prevCount + 1);
    };

    // Filter employees based on search and status
    const filteredEmployees = React.useMemo(() => {
        if (!employees) return [];
        
        return employees.filter(employee => {
            const matchesSearch = 
                employee.EmployeeName?.toLowerCase().includes(search.toLowerCase()) ||
                employee.Status?.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = filterStatus === 'all' || employee.Status === filterStatus;
            
            return matchesSearch && matchesStatus;
        });
    }, [employees, search, filterStatus]);

    const getUniqueStatuses = () => {
        if (!employees) return [];
        const statuses = employees.map(employee => employee.Status).filter(Boolean);
        return ['all', ...Array.from(new Set(statuses))];
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
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={onBack}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <IoChevronBackOutline size={25} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">All Employee Attendance</h1>
                                <p className="text-gray-600">Comprehensive attendance monitoring for all team members</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {employeeName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
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
                                {/* Search and Filter Section */}
                                <div className="mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Search */}
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search employees..."
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>

                                        {/* Status Filter */}
                                        <div className="relative">
                                            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                            >
                                                {getUniqueStatuses().map((status) => (
                                                    <option key={status} value={status}>
                                                        {status === 'all' ? 'All Statuses' : status}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Date Range Selection */}
                                        <div className="flex items-center space-x-2">
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Start Date"
                                                    value={date.startDate}
                                                    onChange={(newValue) => setDate(prev => ({ ...prev, startDate: newValue }))}
                                                    renderInput={(params) => <input {...params} />}
                                                    className="w-full"
                                                />
                                            </LocalizationProvider>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="End Date"
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
                                                        Employee Name
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Status
                                                    </th>
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
                                                        Total Hours
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Day Type
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {loading ? (
                                                    Array(5).fill(0).map((_, idx) => <SkeletonLoader key={idx} />)
                                                ) : filteredEmployees?.length > 0 ? (
                                                    filteredEmployees.map((employee, index) => {
                                                        const hours = Math.floor(employee.Duration / 60);
                                                        const minutes = employee.Duration % 60;
                                                        let dayType = "Off Day";
                                                        let dayTypeColor = "bg-gray-100 text-gray-800";
                                                        
                                                        if (employee.Duration >= 4 * 60 + 30 && employee.Duration < 8 * 60 + 40) {
                                                            dayType = "Half Day";
                                                            dayTypeColor = "bg-yellow-100 text-yellow-800";
                                                        } else if (employee.Duration >= 8 * 60 + 40) {
                                                            dayType = "Full Day";
                                                            dayTypeColor = "bg-green-100 text-green-800";
                                                        }

                                                        return (
                                                            <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center">
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                                                            <span className="text-white font-semibold text-sm">
                                                                                {employee.EmployeeName?.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <div className="font-medium text-gray-900 truncate max-w-[150px]" title={employee.EmployeeName}>
                                                                            {employee.EmployeeName}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        employee.Status === 'Present' 
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : employee.Status === 'Absent'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {employee.Status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {employee.AttendanceDate?.split("T")[0]}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {employee.InTime.split(" ")[1] === "00:00:00" ? "--" : employee.InTime.split(" ")[1]}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {employee.OutTime.split(" ")[1] === "00:00:00" ? "--" : employee.OutTime.split(" ")[1]}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {employee.Duration > 0 ? `${hours} Hours ${minutes} Minutes` : '--'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dayTypeColor}`}>
                                                                        {dayType}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <button
                                                                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                                            employee.Duration === 0 
                                                                                ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                                                                                : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
                                                                        }`}
                                                                        onClick={() => handleOpenModal(employee)}
                                                                        disabled={employee.Duration === 0}
                                                                    >
                                                                        Punch Records
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="px-6 py-12 text-center">
                                                            <div className="text-gray-500">
                                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                    <FaClock className="w-8 h-8 text-gray-400" />
                                                                </div>
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                                                                <p className="text-gray-500">
                                                                    {search || filterStatus !== 'all' 
                                                                        ? 'Try adjusting your search or filter criteria'
                                                                        : 'No attendance records available for the selected date range'
                                                                    }
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pagination */}
                                {filteredEmployees?.length > 0 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handlePrevious}
                                                disabled={count === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <FaLongArrowAltLeft className="w-4 h-4 mr-2" />
                                                Previous
                                            </button>
                                            <span className="px-4 py-2 text-sm text-gray-700">
                                                Page {count}
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                Next
                                                <FaLongArrowAltRight className="w-4 h-4 ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "calendar" && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <Calendar employeeId={employeeTicket} userRole={userDataList} />
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
                                <h2 className="text-2xl font-bold text-gray-800">Punch Records Logs</h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {selectedEmployee?.PunchRecords
                                    ?.trim()
                                    ?.replace(/,$/, "")
                                    ?.split(",")
                                    ?.map((item, index) => {
                                        const bgColor = item.includes("in(IN 1)") ? "#DEF7EC" : "#FDE8E8";
                                        const textColor = item.includes("in(IN 1)") ? "#014737" : "#C81E1E";
                                        return (
                                            <div
                                                key={index}
                                                className="p-3 text-center rounded-lg font-medium"
                                                style={{
                                                    backgroundColor: bgColor,
                                                    color: textColor,
                                                }}
                                            >
                                                {item}
                                            </div>
                                        );
                                    })}
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>
        </div>
    );
}

export default AllEmployeeAttendanceLogs;