import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
    CartesianGrid,
} from "recharts";
import { getGraphDataForEmployeeAction } from '../store/action/userDataAction';
import { 
    FaDownload, 
    FaCalendarAlt, 
    FaUsers, 
    FaMoneyBillWave, 
    FaChartBar,
    FaChartPie,
    FaEye,
    FaTrendingUp,
    FaTrendingDown,
    FaClock,
    FaUserCheck,
    FaUserTimes
} from 'react-icons/fa';

function EmployeeGraphData() {
    const { data } = useSelector((state) => state.employeeGraphDataCount);
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState(2024);
    console.log('1231231', data)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getGraphDataForEmployeeAction());
    }, [])

    // Navigation function - Using page reload to ensure Sidebar picks up changes
    const navigateToScreen = (screen) => {
        localStorage.setItem("selectedTag", screen);
        
        // Dispatch a custom event to notify the Sidebar component
        const navigationEvent = new CustomEvent('navigationChange', {
            detail: { selectedTag: screen }
        });
        window.dispatchEvent(navigationEvent);
        
        // Force a page reload to ensure the Sidebar picks up the change
        window.location.reload();
    };

    const handleDownloadReport = () => {
        console.log('Downloading report...');
        navigateToScreen('payslipAndPayRole');
    };

    const handleViewAttendance = () => {
        navigateToScreen('attendance');
    };

    const handleViewPayroll = () => {
        navigateToScreen('payslipAndPayRole');
    };

    const barData = data?.data?.map(item => ({
        month: item.duration,
        presentCount: item.presentCount,
        absentCount: item.absentCount,
        totalCount: item.presentCount + item.absentCount,
    })) || [];

    const pieData = [
        { name: "Base Salary", value: 45, color: "#6366f1", icon: "💰" },
        { name: "Performance Bonus", value: 20, color: "#06b6d4", icon: "🏆" },
        { name: "Benefits", value: 12, color: "#f59e0b", icon: "🏥" },
        { name: "Allowances", value: 8, color: "#ec4899", icon: "🎁" },
    ];

    // Enhanced tooltip with better styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xl">
                    <p className="font-bold text-gray-900 mb-2">{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ background: entry.color }}
                                ></div>
                                <span className="text-sm font-medium text-gray-700">
                                    {entry.name}:
                                </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Calculate summary statistics
    const totalPresent = barData.reduce((sum, item) => sum + item.presentCount, 0);
    const totalAbsent = barData.reduce((sum, item) => sum + item.absentCount, 0);
    const attendanceRate = totalPresent + totalAbsent > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Enhanced Bar Chart Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                    <div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Attendance Overview</h4>
                        <p className="text-sm sm:text-base text-gray-600">Monthly attendance patterns and trends</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center justify-center sm:justify-start space-x-2 bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                            <FaUserCheck className="text-green-600 text-sm sm:text-base" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">{attendanceRate}% Present</span>
                        </div>
                        <button 
                            onClick={handleViewAttendance}
                            className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm"
                        >
                            <FaEye className="text-xs sm:text-sm" />
                            <span>View Details</span>
                        </button>
                    </div>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            iconType="circle"
                            wrapperStyle={{ 
                                color: '#374151', 
                                fontSize: 14,
                                fontWeight: 600,
                                paddingBottom: 20
                            }}
                        />
                        <Bar 
                            dataKey="presentCount" 
                            fill="#06b6d4" 
                            name="Present" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                        />
                        <Bar 
                            dataKey="absentCount" 
                            fill="#f59e0b" 
                            name="Absent" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Enhanced Pay Structure Section */}
            <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 rounded-xl p-4 border border-purple-200 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">Pay Structure</h4>
                        <p className="text-sm text-gray-600">Salary distribution breakdown</p>
                    </div>
                                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                            <FaChartPie className="text-purple-600 text-sm" />
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="text-xs font-semibold text-gray-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
                            >
                                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                <option value={2024}>2024</option>
                                <option value={2023}>2023</option>
                                <option value={2022}>2022</option>
                                <option value={2021}>2021</option>
                                <option value={2020}>2020</option>
                            </select>
                        </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                    {/* Enhanced Donut Chart with Hover Effects */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <PieChart width={200} height={200}>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color}
                                            className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ background: data.color }}
                                                        ></div>
                                                        <span className="font-semibold text-gray-900">{data.name}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-900">{data.value}%</div>
                                                        <div className="text-sm text-gray-600">of total salary</div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">1,206</div>
                                    <div className="text-xs text-gray-600">Avg. Monthly</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Enhanced Legend */}
                    <div className="space-y-2">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group">
                                <div className="flex items-center space-x-2">
                                    <div 
                                        className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-200" 
                                        style={{ background: item.color }}
                                    ></div>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-sm">{item.icon}</span>
                                        <span className="text-xs font-semibold text-gray-800 truncate">
                                            {item.name}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-full">
                                    {item.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Summary Stats */}
                <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">Total Budget</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900 mt-1">14,472</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">Avg. Per Employee</span>
                            </div>
                            <div className="text-sm font-bold text-gray-900 mt-1">1,206</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeGraphData