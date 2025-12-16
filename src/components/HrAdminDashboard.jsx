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
    FaBars,
    FaMoneyBillWave
} from "react-icons/fa";
import AddEmployeeModal from './AddEmployeeModal';
import AddAnouncementModel from './AddAnouncementModel';
import { useDispatch, useSelector } from 'react-redux';
import { getAnnouncementDataAction, getEmployeeDataCountAction, getLeaveApproveRequestAction, putApprovedLeaveByManagerAction } from '../store/action/userDataAction';
import { MoreHorizontal, TrendingUp, TrendingDown, Activity, Users, Calendar, DollarSign } from 'lucide-react';
import EmployeeGraphData from './EmployeeGraphData';
import safeToast from '../utils/safeToast';
import MusterRoll from './MusterRoll';

function HrAdminDashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAnnouncement, setIsOpenAnnouncement] = useState(false);
    const navigate = useNavigate();
    const { data } = useSelector((state) => state.announcementData);
    const { data: dataa, loading: leaveLoading, error: leaveError } = useSelector((state) => state.managerLeaveApprove);
    const { data: countData } = useSelector((state) => state.exployeeDataCountCount);
    const managerApprove = dataa?.data;
    const announcementData = data?.data;
    console.log('managerApprove', managerApprove);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(getAnnouncementDataAction())
        dispatch(getLeaveApproveRequestAction())
        dispatch(getEmployeeDataCountAction())
    }, [dispatch])
    
    // Monitor leave approval state changes
    useEffect(() => {
        if (leaveError) {
            safeToast.error(`Leave approval error: ${leaveError}`);
        }
    }, [leaveError]);
    
    // Debug state changes
    useEffect(() => {
        console.log('Leave approval state changed:', { dataa, leaveLoading, leaveError });
    }, [dataa, leaveLoading, leaveError]);

    const handelChangeStatus = async ({ value, id }) => {
        if (!value || !id) {
            safeToast.error('Invalid parameters for leave approval');
            return;
        }
        
        const status = value === "Approved" ? "Approved" : "Reject";
        
        console.log('Starting leave approval process:', { status, id });
        
        // Show loading notification
        const loadingToastId = safeToast.loading(`Processing leave ${status.toLowerCase()}...`);
        
        try {
            // Dispatch the action and wait for the result
            const result = await dispatch(putApprovedLeaveByManagerAction({ status, id }));
            
            console.log('Action result:', result);
            
            // Dismiss loading toast
            safeToast.dismiss(loadingToastId);
            
            // Check if the action was successful
            if (result?.success || result?.payload?.statusCode === 200) {
                // Show success message
                const successMessage = `Leave request ${status.toLowerCase()} successfully!`;
                safeToast.success(successMessage);
                
                // Add a small delay before refreshing to ensure backend has processed the request
                setTimeout(() => {
                    dispatch(getLeaveApproveRequestAction());
                }, 1000);
            } else {
                // Show error message if the action failed
                const errorMessage = result?.error || "Unknown error occurred";
                safeToast.error(`Failed to ${status.toLowerCase()} leave request: ${errorMessage}`);
            }
        } catch (error) {
            // Dismiss loading toast
            safeToast.dismiss(loadingToastId);
            
            // Show error message
            const errorMsg = `Failed to ${status.toLowerCase()} leave request: ${error.message || 'Unknown error'}`;
            safeToast.error(errorMsg);
            
            // Log error for debugging
            console.error('Leave approval error:', error);
            
            // Also try to refresh the data to get the latest state
            setTimeout(() => {
                dispatch(getLeaveApproveRequestAction());
            }, 1000);
        }
    };

    // Navigation functions - Using custom event to communicate with Sidebar
    const navigateToScreen = (screen) => {
        // Store the selected tag in localStorage
        localStorage.setItem("selectedTag", screen);
        
        // Dispatch a custom event to notify the Sidebar component
        const navigationEvent = new CustomEvent('navigationChange', {
            detail: { tag: screen }
        });
        window.dispatchEvent(navigationEvent);
        
        // No need to reload the page - the Sidebar will handle the navigation
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
        <div className="full-height-content bg-gradient-to-br from-gray-50 via-white to-gray-50">
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

                {/* Muster Roll Section */}
                <div className="mt-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Muster Roll</h2>
                        <p className="text-sm text-gray-600">View and manage employee attendance and payroll data</p>
                    </div>
                    <MusterRoll />
                </div>
            </div>

            {/* Modals */}
            <AddEmployeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <AddAnouncementModel isOpenAnnouncement={isOpenAnnouncement} onClose={() => setIsOpenAnnouncement(false)} />
        </div>
    )
}

export default HrAdminDashboard