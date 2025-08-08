import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import anouncementavatar from "../assets/Icon/anouncement.jpg"
import { 
    FaUsers, 
    FaUserPlus, 
    FaUserTimes, 
    FaBriefcase, 
    FaClock, 
    FaArrowUp, 
    FaArrowDown, 
    FaPlus, 
    FaBell, 
    FaCalendarAlt, 
    FaSearch,
    FaChartLine,
    FaChartBar,
    FaEye,
    FaDownload,
    FaCog,
    FaCheckCircle,
    FaExclamationTriangle,
    FaClock as FaClockIcon,
    FaBars
} from "react-icons/fa";
import AddEmployeeModal from './AddEmployeeModal';
import AddAnouncementModel from './AddAnouncementModel';
import { useDispatch, useSelector } from 'react-redux';
import { getAnnouncementDataAction, getEmployeeDataCountAction, getLeaveApproveRequestAction, putApprovedLeaveByManagerAction } from '../store/action/userDataAction';
import { MoreHorizontal, TrendingUp, TrendingDown, Activity, Users, Calendar, DollarSign } from 'lucide-react';
import EmployeeGraphData from './EmployeeGraphData';

function HrAdminDashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAnnouncement, setIsOpenAnnouncement] = useState(false);
    const navigate = useNavigate();
    const { data } = useSelector((state) => state.announcementData);
    const { data: dataa } = useSelector((state) => state.managerLeaveApprove);
    const { data: countData } = useSelector((state) => state.exployeeDataCountCount);
    const managerApprove = dataa?.data;
    const announcementData = data?.data;
    console.log('managerApprove', managerApprove);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAnnouncementDataAction())
        dispatch(getLeaveApproveRequestAction());
        dispatch(getEmployeeDataCountAction())
    }, [])

    const handelChangeStatus = ({ value, id }) => {
        const status = value === "Approved" ? "Approved" : "Reject";
        dispatch(putApprovedLeaveByManagerAction({ status, id }));
    };

    // Navigation functions - Using custom event to communicate with Sidebar
    const navigateToScreen = (screen) => {
        // Store the selected tag in localStorage
        localStorage.setItem("selectedTag", screen);
        
        // Dispatch a custom event to notify the Sidebar component
        const navigationEvent = new CustomEvent('navigationChange', {
            detail: { selectedTag: screen }
        });
        window.dispatchEvent(navigationEvent);
        
        // Force a page reload to ensure the Sidebar picks up the change
        window.location.reload();
    };

    const handleAddEmployee = () => {
        setIsOpen(true);
    };

    const handleCreateAnnouncement = () => {
        setIsOpenAnnouncement(true);
    };

    const handleViewAllAnnouncements = () => {
        navigateToScreen('anouncment');
    };

    const handleViewAllLeaveRequests = () => {
        navigateToScreen('employeeLeaveStatus');
    };

    const handleViewAllEmployees = () => {
        navigateToScreen('allEmployees');
    };

    const handleViewAttendance = () => {
        navigateToScreen('attendance');
    };

    const handleViewPayroll = () => {
        navigateToScreen('payslipAndPayRole');
    };

    const handleViewHolidays = () => {
        navigateToScreen('employeeHolidays');
    };

    console.log('12', countData)
    const stats = [
        {
            icon: <Users className="text-xl sm:text-2xl" />,
            value: countData?.data?.totalEmployeeCount || 0,
            label: "Total Employees",
            change: "+5.2%",
            trend: "up",
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
            iconBg: "bg-blue-500",
            iconColor: "text-white",
            description: "Active workforce",
            onClick: handleViewAllEmployees,
        },
        {
            icon: <FaUserPlus className="text-xl sm:text-2xl" />,
            value: countData?.data?.newEmployeeCount || 0,
            label: "New Hires",
            change: "+12.8%",
            trend: "up",
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
            iconBg: "bg-emerald-500",
            iconColor: "text-white",
            description: "This month",
            onClick: handleViewAllEmployees,
        },
        {
            icon: <FaUserTimes className="text-xl sm:text-2xl" />,
            value: countData?.data?.inHouseEmpCount || 0,
            label: "In-House Staff",
            change: "-2.1%",
            trend: "down",
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
            iconBg: "bg-purple-500",
            iconColor: "text-white",
            description: "Office based",
            onClick: handleViewAllEmployees,
        },
        {
            icon: <FaBriefcase className="text-xl sm:text-2xl" />,
            value: countData?.data?.fieldEmpCount || 0,
            label: "Field Workers",
            change: "+8.5%",
            trend: "up",
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
            iconBg: "bg-orange-500",
            iconColor: "text-white",
            description: "Remote staff",
            onClick: handleViewAllEmployees,
        },
        {
            icon: <FaClock className="text-xl sm:text-2xl" />,
            value: countData?.data?.employeeOnNoticePeriod || 0,
            label: "Notice Period",
            change: "-15.3%",
            trend: "down",
            color: "from-red-500 to-red-600",
            bgColor: "bg-gradient-to-br from-red-50 to-red-100",
            iconBg: "bg-red-500",
            iconColor: "text-white",
            description: "Pending exits",
            onClick: handleViewAllEmployees,
        },
    ];

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const options = { day: "2-digit", month: "long" };
        return date.toLocaleDateString("en-GB", options);
    };

    const getCurrentDate = () => {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return now.toLocaleDateString('en-US', options);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Compact Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{getGreeting()}! 👋</h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <FaCalendarAlt className="text-purple-500" />
                                    <span className="font-medium">{getCurrentDate()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Activity className="text-green-500" />
                                    <span className="font-medium">System Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={handleAddEmployee}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                            >
                                <FaPlus className="text-sm" />
                                <span>Add Employee</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
                {/* Compact Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                    {stats.map((item, idx) => (
                        <div 
                            key={idx} 
                            className={`${item.bgColor} rounded-xl p-4 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1`} 
                            style={{animationDelay: `${idx * 0.1}s`}}
                            onClick={item.onClick}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`${item.iconBg} p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200`}>
                                    <div className={item.iconColor}>
                                        {item.icon}
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-1 text-xs font-semibold ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                                    {item.trend === "up" ? <TrendingUp className="text-xs" /> : <TrendingDown className="text-xs" />}
                                    <span>{item.change}</span>
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                            <div className="text-sm font-semibold text-gray-800 mb-1">{item.label}</div>
                            <div className="text-xs text-gray-600">{item.description}</div>
                        </div>
                    ))}
                </div>

                {/* Optimized Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                    {/* Employee Analytics - Takes more space */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 h-full">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Employee Analytics</h3>
                                    <p className="text-sm text-gray-600">Workforce insights and trends</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                                        <FaChartLine className="text-purple-600 text-sm" />
                                        <span className="text-xs font-medium text-purple-700">Live Data</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-full">
                                <EmployeeGraphData />
                            </div>
                        </div>
                    </div>

                    {/* Unified Quick Actions */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                            <FaBell className="text-purple-600 text-lg" />
                        </div>
                        
                        {/* Create Announcement */}
                        <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 rounded-lg p-3 mb-4 border border-purple-200">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-2 rounded-lg shadow-lg">
                                    <FaBell className="text-white text-sm" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Create Announcement</h4>
                                    <p className="text-xs text-gray-600">Share updates</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCreateAnnouncement} 
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs"
                            >
                                Create Now
                            </button>
                        </div>

                        {/* HR Operations */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 mb-4 border border-emerald-200">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-2 rounded-lg shadow-lg">
                                    <FaChartBar className="text-white text-sm" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">HR Operations</h4>
                                    <p className="text-xs text-gray-600">Manage operations</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <button 
                                    onClick={handleViewAttendance}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs flex items-center justify-center space-x-2"
                                >
                                    <FaEye className="text-xs" />
                                    <span>View Attendance</span>
                                </button>
                                <button 
                                    onClick={handleViewPayroll}
                                    className="w-full bg-white hover:bg-gray-50 text-emerald-600 border border-emerald-600 py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs flex items-center justify-center space-x-2"
                                >
                                    <FaDownload className="text-xs" />
                                    <span>View Payroll</span>
                                </button>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 mb-4 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg shadow-lg">
                                    <FaCog className="text-white text-sm" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">System Status</h4>
                                    <p className="text-xs text-gray-600">System health</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Status:</span>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-green-600 font-medium">Active</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Last Sync:</span>
                                    <span className="text-xs text-gray-700">2 min ago</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Data Points:</span>
                                    <span className="text-xs text-gray-700">16 records</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        {announcementData && announcementData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h4>
                                <div className="space-y-2">
                                    {announcementData.slice(0, Math.min(3, announcementData.length)).map((announcement, index) => (
                                        <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 group-hover:scale-150 transition-transform duration-200"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 mb-0.5 text-xs truncate">{announcement.title}</p>
                                                <p className="text-xs text-gray-500">{formatDate(announcement.dateTime)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compact Bottom Section - Side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Compact Announcements */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Recent Announcements</h3>
                                <p className="text-sm text-gray-600">Latest updates</p>
                            </div>
                            <button 
                                onClick={handleViewAllAnnouncements}
                                className="text-purple-600 font-semibold hover:text-purple-700 cursor-pointer transition-colors duration-200 flex items-center space-x-1 text-sm"
                            >
                                <span>View All</span>
                                <FaEye className="text-sm" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {announcementData?.slice(0, 3)?.map((note, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group border border-gray-200">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                        <img src={note?.imageUrl} alt="announcement" className="w-6 h-6 rounded object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 mb-1 truncate">{note.title}</h4>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{note.description}</p>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                            <span className="flex items-center space-x-1">
                                                <FaCalendarAlt className="text-purple-500" />
                                                <span>{formatDate(note.dateTime)}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <FaClockIcon className="text-purple-500" />
                                                <span>{note.dateTime.split('T')[1]}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compact Employee Leave Requests */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Leave Requests</h3>
                                <p className="text-sm text-gray-600">Pending approvals</p>
                            </div>
                            <button 
                                onClick={handleViewAllLeaveRequests}
                                className="text-purple-600 font-semibold hover:text-purple-700 cursor-pointer transition-colors duration-200 flex items-center space-x-1 text-sm"
                            >
                                <span>View All</span>
                                <FaEye className="text-sm" />
                            </button>
                        </div>
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg">
                            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <table className="w-full min-w-[800px]">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-1/4 bg-white">Employee</th>
                                            <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-1/5 bg-white">Department</th>
                                            <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-1/6 bg-white">Days</th>
                                            <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-1/6 bg-white">Date</th>
                                            <th className="text-left py-2 px-3 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap w-1/5 bg-white">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {managerApprove?.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-all duration-200 group">
                                                <td className="py-2 px-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                                                            <span className="text-white font-bold text-sm">
                                                                {item.employeeInfo.employeeName?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-gray-900 text-xs whitespace-nowrap">
                                                                {item.employeeInfo.employeeName}
                                                            </div>
                                                            <div className="text-xs text-gray-500 whitespace-nowrap">
                                                                {item.employeeInfo.designation}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-3 text-gray-700 font-medium text-xs whitespace-nowrap">
                                                    {item.employeeInfo.designation}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                                        {item.totalDays} days
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-gray-700 text-xs whitespace-nowrap">
                                                    {item.dateTime.split(' ')[0]}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                    {item.status === "Approved" ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 whitespace-nowrap">
                                                            <FaCheckCircle className="mr-1 text-xs" />
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <select
                                                            defaultValue=""
                                                            onChange={(e) =>
                                                                handelChangeStatus({
                                                                    value: e.target.value,
                                                                    id: item._id,
                                                                })
                                                            }
                                                            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white whitespace-nowrap"
                                                        >
                                                            <option value="" disabled>Select</option>
                                                            <option value="Approved">Approve</option>
                                                            <option value="Rejected">Reject</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddEmployeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <AddAnouncementModel isOpenAnnouncement={isOpenAnnouncement} onClose={() => setIsOpenAnnouncement(false)} />
        </div>
    )
}

export default HrAdminDashboard