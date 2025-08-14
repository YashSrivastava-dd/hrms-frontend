import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FaUsers, 
    FaUserTimes, 
    FaBriefcase, 
    FaClock, 
    FaCalendarAlt, 
    FaChartLine,
    FaBuilding,
    FaCode,
    FaMicrochip,
    FaCog,
    FaShoppingCart,
    FaIndustry,
    FaBullhorn
} from "react-icons/fa";
import { Activity, Users, TrendingUp } from 'lucide-react';
import { 
    getUserDataAction, 
    getEmployeeDataCountAction, 
    getAllUserDataAction,
    getGraphDataForEmployeeAction,
    getAnnouncementDataAction,
    getLeaveApproveRequestAction,
    getEmployeeLeaveCountAction,
    getOnLeaveStatusAction,
    getHolidaysDataAction
} from '../store/action/userDataAction';
import OrganizationChartModal from './OrganizationChartModal';
import EmployeeGraphData from './EmployeeGraphData';
import ErrorBoundary from './ErrorBoundary';

function CeoDashboard() {
    const dispatch = useDispatch();
    const { data: userData } = useSelector((state) => state.userData);
    const { data: countData } = useSelector((state) => state.exployeeDataCountCount);
    const { data: allEmployeeData } = useSelector((state) => state.allUserData);
    const { data: graphData } = useSelector((state) => state.employeeGraphDataCount);
    const { data: announcementData } = useSelector((state) => state.announcementData);
    const { data: leaveRequestsData } = useSelector((state) => state.managerLeaveApprove);
    const { data: leaveCountData } = useSelector((state) => state.employeeLeaveCount);
    const { data: onLeaveData } = useSelector((state) => state.gertonleaveemployeedata);
    const { data: holidaysData } = useSelector((state) => state.holidaysData);
    
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);
    
    const userDataList = userData?.data || {};
    const employeeStats = countData?.data || {};
    const allEmployees = allEmployeeData?.data || [];
    
    // Filter upcoming holidays (from today onwards) - Safari-safe version
    const upcomingHolidays = useMemo(() => {
        try {
            if (!holidaysData?.data || !Array.isArray(holidaysData.data)) {
                return [];
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
            
            return holidaysData.data
                .filter(holiday => {
                    try {
                        if (!holiday || !holiday.holidayDate) return false;
                        
                        const holidayDate = new Date(holiday.holidayDate);
                        
                        // Check if date is valid
                        if (isNaN(holidayDate.getTime())) return false;
                        
                        holidayDate.setHours(0, 0, 0, 0);
                        return holidayDate >= today;
                    } catch (error) {
                        console.warn('Error processing holiday date:', error);
                        return false;
                    }
                })
                .sort((a, b) => {
                    try {
                        const dateA = new Date(a.holidayDate);
                        const dateB = new Date(b.holidayDate);
                        
                        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                        
                        return dateA - dateB;
                    } catch (error) {
                        console.warn('Error sorting holidays:', error);
                        return 0;
                    }
                })
                .slice(0, 6); // Show next 6 upcoming holidays
        } catch (error) {
            console.warn('Error filtering holidays:', error);
            return [];
        }
    }, [holidaysData?.data]);

    useEffect(() => {
        // Don't call getUserDataAction here - it's already called in App.js
        dispatch(getEmployeeDataCountAction());
        dispatch(getAllUserDataAction({ page: 1, limit: 1000 })); // Get all employees for department filtering
        dispatch(getGraphDataForEmployeeAction());
        dispatch(getAnnouncementDataAction());
        dispatch(getLeaveApproveRequestAction());
        dispatch(getEmployeeLeaveCountAction());
        dispatch(getOnLeaveStatusAction());
        dispatch(getHolidaysDataAction());
    }, [dispatch]);

    // Helper function to get greeting based on time - Safari-safe
    const getGreeting = () => {
        try {
            const hour = new Date().getHours();
            if (isNaN(hour)) return "Hello";
            
            if (hour < 12) return "Good Morning";
            if (hour < 17) return "Good Afternoon";
            return "Good Evening";
        } catch (error) {
            console.warn('Error getting greeting:', error);
            return "Hello";
        }
    };

    // Helper function to get current date - Safari-safe
    const getCurrentDate = () => {
        try {
            const date = new Date();
            if (isNaN(date.getTime())) {
                return 'Today';
            }
            
            // Safari-safe date formatting
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Error formatting date:', error);
            return 'Today';
        }
    };

    // Helper function to get department employee count
    const getDepartmentCount = (departmentName) => {
        if (!allEmployees || !Array.isArray(allEmployees)) return 0;
        
        const count = allEmployees.filter(emp => {
            if (!emp) return false;
            
            // More comprehensive matching logic
            const empDepartment = emp.departmentId || emp.department || '';
            const empDesignation = emp.designation || '';
            const empRole = emp.role || '';
            
            // Check multiple fields for department matching
            const deptMatch = empDepartment.toLowerCase().includes(departmentName.toLowerCase());
            const designationMatch = empDesignation.toLowerCase().includes(departmentName.toLowerCase());
            const roleMatch = empRole.toLowerCase().includes(departmentName.toLowerCase());
            
            // Special cases for different department names
            let specialMatch = false;
            switch (departmentName) {
                case 'software':
                    specialMatch = empDesignation.toLowerCase().includes('developer') ||
                                 empDesignation.toLowerCase().includes('programmer') ||
                                 empDesignation.toLowerCase().includes('software') ||
                                 empDesignation.toLowerCase().includes('web') ||
                                 empDesignation.toLowerCase().includes('mobile') ||
                                 empDesignation.toLowerCase().includes('frontend') ||
                                 empDesignation.toLowerCase().includes('backend') ||
                                 empDesignation.toLowerCase().includes('fullstack') ||
                                 empDesignation.toLowerCase().includes('devops') ||
                                 empDesignation.toLowerCase().includes('ui/ux') ||
                                 empDesignation.toLowerCase().includes('qa') ||
                                 empDesignation.toLowerCase().includes('testing') ||
                                 empDepartment.toLowerCase().includes('software') ||
                                 empDepartment.toLowerCase().includes('r&d') ||
                                 empRole.toLowerCase().includes('software');
                    break;
                case 'marketing':
                    specialMatch = empDesignation.toLowerCase().includes('marketing') ||
                                 empDesignation.toLowerCase().includes('sales') ||
                                 empDesignation.toLowerCase().includes('business') ||
                                 empDepartment.toLowerCase().includes('sales');
                    break;
                case 'embedded':
                    specialMatch = empDesignation.toLowerCase().includes('embedded') ||
                                 empDesignation.toLowerCase().includes('firmware') ||
                                 empDesignation.toLowerCase().includes('hardware');
                    break;
                case 'quality':
                    specialMatch = empDesignation.toLowerCase().includes('quality') ||
                                 empDesignation.toLowerCase().includes('qa') ||
                                 empDesignation.toLowerCase().includes('test') ||
                                 empDesignation.toLowerCase().includes('qc');
                    break;
                case 'procurement':
                    specialMatch = empDesignation.toLowerCase().includes('procurement') ||
                                 empDesignation.toLowerCase().includes('purchase') ||
                                 empDesignation.toLowerCase().includes('supply') ||
                                 empDesignation.toLowerCase().includes('vendor');
                    break;
                case 'production':
                    specialMatch = empDesignation.toLowerCase().includes('production') ||
                                 empDesignation.toLowerCase().includes('manufacturing') ||
                                 empDesignation.toLowerCase().includes('operations') ||
                                 empDesignation.toLowerCase().includes('assembly');
                    break;
                default:
                    specialMatch = false;
            }
            
            // Additional fallback for managers who might belong to this department
            let managerFallback = false;
            if (departmentName === 'software') {
                // Only include managers who are explicitly related to software/tech
                const isManager = empDesignation.toLowerCase().includes('manager') || 
                                empDesignation.toLowerCase().includes('lead') ||
                                empRole.toLowerCase().includes('manager');
                
                if (isManager) {
                    // Only include managers with explicit software/tech keywords
                    managerFallback = empDesignation.toLowerCase().includes('tech') ||
                                    empDesignation.toLowerCase().includes('software') ||
                                    empDesignation.toLowerCase().includes('development') ||
                                    empDesignation.toLowerCase().includes('engineering') ||
                                    empDesignation.toLowerCase().includes('it') ||
                                    empDesignation.toLowerCase().includes('technical') ||
                                    empDesignation.toLowerCase().includes('dev') ||
                                    empDesignation.toLowerCase().includes('programmer') ||
                                    empDesignation.toLowerCase().includes('architect') ||
                                    empDesignation.toLowerCase().includes('fullstack') ||
                                    empDesignation.toLowerCase().includes('frontend') ||
                                    empDesignation.toLowerCase().includes('backend');
                    
                    // Explicitly exclude non-software managers
                    if (empDesignation.toLowerCase().includes('sales') ||
                        empDesignation.toLowerCase().includes('marketing') ||
                        empDesignation.toLowerCase().includes('hr') ||
                        empDesignation.toLowerCase().includes('finance') ||
                        empDesignation.toLowerCase().includes('admin') ||
                        empDesignation.toLowerCase().includes('business') ||
                        empDesignation.toLowerCase().includes('operations')) {
                        managerFallback = false;
                    }
                }
            }
            
            return deptMatch || designationMatch || roleMatch || specialMatch || managerFallback;
        }).length;

        
        console.log(`Department ${departmentName} count:`, count);
        return count;
    };

    // Helper function to get last week in-house count (placeholder - would need API)
    const getLastWeekInHouseCount = () => {
        // This would typically come from a dedicated API
        // For now, using a calculation based on existing data
        return Math.floor((employeeStats.inHouseEmpCount || 0) * 0.85); // Assuming 85% attendance
    };

    const handleDepartmentClick = (department) => {
        setSelectedDepartment(department);
        setIsOrgChartOpen(true);
    };

    const departmentStats = [
        {
            id: 'inhouse-lastweek',
            icon: <FaUsers className="text-xl sm:text-2xl" />,
            value: getLastWeekInHouseCount(),
            label: "Employees Present Last Week - Inhouse",
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
            iconBg: "bg-blue-500",
            iconColor: "text-white",
            description: "Weekly attendance",
            isClickable: false
        },
        {
            id: 'marketing',
            icon: <FaChartLine className="text-xl sm:text-2xl" />,
            value: getDepartmentCount('marketing'),
            label: "Marketing Team",
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
            iconBg: "bg-emerald-500",
            iconColor: "text-white",
            description: "Marketing department",
            isClickable: true
        },
        {
            id: 'software',
            icon: <FaCode className="text-xl sm:text-2xl" />,
            value: getDepartmentCount('software'),
            label: "Software Department",
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
            iconBg: "bg-purple-500",
            iconColor: "text-white",
            description: "Software development",
            isClickable: true
        },
        {
            id: 'embedded',
            icon: <FaMicrochip className="text-xl sm:text-2xl" />,
            value: getDepartmentCount('embedded'),
            label: "Embedded Team",
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
            iconBg: "bg-orange-500",
            iconColor: "text-white",
            description: "Embedded systems",
            isClickable: true
        },
        {
            id: 'quality',
            icon: <FaCog className="text-xl sm:text-2xl" />,
            value: getDepartmentCount('quality'),
            label: "Quality Department",
            color: "from-red-500 to-red-600",
            bgColor: "bg-gradient-to-br from-red-50 to-red-100",
            iconBg: "bg-red-500",
            iconColor: "text-white",
            description: "Quality assurance",
            isClickable: true
        },
        {
            id: 'procurement',
            icon: <FaShoppingCart className="text-xl sm:text-2xl" />,
            value: getDepartmentCount('procurement'),
            label: "Procurement Department",
            color: "from-indigo-500 to-indigo-600",
            bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
            iconBg: "bg-indigo-500",
            iconColor: "text-white",
            description: "Procurement & sourcing",
            isClickable: true
        },
        {
            id: 'production',
            icon: <FaIndustry className="text-xl sm:text-2xl" />,
            value: getDepartmentCount('production'),
            label: "Production Department",
            color: "from-teal-500 to-teal-600",
            bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
            iconBg: "bg-teal-500",
            iconColor: "text-white",
            description: "Production & manufacturing",
            isClickable: true
        }
    ];

    const StatCard = ({ stat }) => (
        <div
            className={`
                relative overflow-hidden rounded-xl border border-gray-200 
                ${stat.bgColor} 
                ${stat.isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''} 
                transition-all duration-300 ease-in-out group
                ${stat.isClickable ? 'hover:border-gray-300' : ''}
            `}
            onClick={stat.isClickable ? () => handleDepartmentClick(stat) : undefined}
        >
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2.5 rounded-lg ${stat.iconBg} ${stat.iconColor} shadow-sm`}>
                                {stat.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.label}</h3>
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
                        {stat.isClickable && (
                            <p className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                                Click to view organization chart →
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Decorative gradient overlay */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
        </div>
    );

    return (
        <div className="full-height-content bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {getGreeting()}, {userDataList.employeeName || 'CEO'}! 
                                {userDataList.role === 'Super-Admin' && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    </span>
                                )} 
                            </h1>
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
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 space-y-6">
                
                {/* Department Statistics Grid */}
                <div>
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Organization Overview
                        </h2>
                        <p className="text-gray-600">
                            Department-wise employee distribution and attendance metrics
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {departmentStats.map((stat, index) => (
                            <StatCard key={stat.id} stat={stat} />
                        ))}
                    </div>
                </div>

                {/* Additional CEO-specific sections can be added here */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaBuilding className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
                            <p className="text-sm text-gray-600">Key organizational metrics</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <Users className="text-blue-500" size={24} />
                                <div>
                                    <p className="text-sm text-gray-600">Total Workforce</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {employeeStats.totalEmployeeCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <FaBuilding className="text-green-500" size={24} />
                                <div>
                                    <p className="text-sm text-gray-600">In-House Staff</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {employeeStats.inHouseEmpCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="text-purple-500" size={24} />
                                <div>
                                    <p className="text-sm text-gray-600">New Hires</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {employeeStats.newEmployeeCount || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Analytics Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FaChartLine className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Employee Analytics</h3>
                            <p className="text-sm text-gray-600">Attendance trends and workforce insights</p>
                        </div>
                    </div>
                    <ErrorBoundary>
                        <EmployeeGraphData />
                    </ErrorBoundary>
                </div>

                {/* Executive Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Leave Management Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FaBriefcase className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Leave Management</h3>
                                    <p className="text-sm text-gray-600">Current leave status overview</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <FaClock className="text-yellow-600" size={20} />
                                    <div>
                                        <p className="text-sm text-yellow-600">Pending Requests</p>
                                        <p className="text-xl font-bold text-yellow-800">
                                            {leaveRequestsData?.data?.filter(req => req.status === 'Pending')?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <FaUserTimes className="text-red-600" size={20} />
                                    <div>
                                        <p className="text-sm text-red-600">On Leave Today</p>
                                        <p className="text-xl font-bold text-red-800">
                                            {onLeaveData?.data?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Users className="text-blue-600" size={20} />
                                    <div>
                                        <p className="text-sm text-blue-600">Present Today</p>
                                        <p className="text-xl font-bold text-blue-800">
                                            {leaveCountData?.data?.todayPresentCount || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="text-green-600" size={20} />
                                    <div>
                                        <p className="text-sm text-green-600">Planned Leaves</p>
                                        <p className="text-xl font-bold text-green-800">
                                            {leaveCountData?.data?.plannedLeaveCount || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Announcements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaBullhorn className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
                                    <p className="text-sm text-gray-600">Latest company updates</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">
                                {announcementData?.data?.length || 0} total
                            </span>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {announcementData?.data?.slice(0, 5)?.map((announcement, index) => (
                                <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                        {announcement.title || announcement.description}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {new Date(announcement.dateTime).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )) || (
                                <div className="text-center py-4 text-gray-500">
                                    <FaBullhorn className="mx-auto mb-2" size={24} />
                                    <p className="text-sm">No recent announcements</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Holidays */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaCalendarAlt className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Holidays</h3>
                                <p className="text-sm text-gray-600">Company holiday calendar</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {upcomingHolidays.length > 0 ? upcomingHolidays.map((holiday, index) => (
                            <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h4 className="font-medium text-green-900 text-sm mb-1">
                                    {holiday.holidayName}
                                </h4>
                                <p className="text-xs text-green-700">
                                    {new Date(holiday.holidayDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center py-4 text-gray-500">
                                <FaCalendarAlt className="mx-auto mb-2" size={24} />
                                <p className="text-sm">No upcoming holidays</p>
                            </div>
                        )}
                    </div>
                </div>


            </div>

            {/* Organization Chart Modal */}
            {isOrgChartOpen && (
                <OrganizationChartModal
                    isOpen={isOrgChartOpen}
                    onClose={() => setIsOrgChartOpen(false)}
                    department={selectedDepartment}
                    employees={allEmployees}
                />
            )}
        </div>
    );
}

export default CeoDashboard;
