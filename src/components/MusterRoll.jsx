import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { 
  FaFilter, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp,
  FaSearch,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaUmbrellaBeach,
  FaCalendarWeek,
  FaMoneyBillWave,
  FaRupeeSign,
  FaInfoCircle
} from 'react-icons/fa';
import { X, ChevronRight } from 'lucide-react';
import { 
  getPayrollAndPayslipAction, 
  getAllUserDataAction, 
  getUserDataAction,
  getAllEmployeeAtendenceAction 
} from '../store/action/userDataAction';
import { formatIndianRupees, formatBasicSalary } from '../utils/currencyFormatter';
import dayjs from 'dayjs';

const MusterRoll = () => {
  const dispatch = useDispatch();
  const { data: payrollData } = useSelector((state) => state.salarySlipData);
  const { data: allUserData } = useSelector((state) => state.allUserData);
  const { data: userData } = useSelector((state) => state.userData);
  const { data: attendanceData } = useSelector((state) => state.allEmployeeAttencance);

  // State management
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('All');
  const [employeeCodeFilter, setEmployeeCodeFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [payableDaysRange, setPayableDaysRange] = useState({ min: '', max: '' });
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [stickySummaryVisible, setStickySummaryVisible] = useState(true);
  const summaryRef = useRef(null);
  const [musterRollData, setMusterRollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data on mount and when month changes
  useEffect(() => {
    dispatch(getUserDataAction());
    dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
    dispatch(getPayrollAndPayslipAction());
  }, [dispatch]);

  // Fetch muster roll data from API
  const fetchMusterRollData = useCallback(async () => {
    if (!selectedMonth) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [year, month] = selectedMonth.split('-').map(Number);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = `${API_BASE_URL}/api/muster-roll?year=${year}&month=${month}&type=all`;
      
      console.log('Fetching muster roll data from:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.data) {
        setMusterRollData(response.data.data);
        console.log('Muster roll data fetched successfully:', response.data.data);
      } else {
        setMusterRollData(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching muster roll data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch muster roll data');
      setMusterRollData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Fetch muster roll data when month changes
  useEffect(() => {
    fetchMusterRollData();
  }, [fetchMusterRollData]);

  // Fetch attendance data for selected month (keeping for backward compatibility)
  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
      dispatch(getAllEmployeeAtendenceAction(startDate, endDate, 1));
    }
  }, [selectedMonth, dispatch]);

  // Load filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('musterRollFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSearchTerm(filters.searchTerm || '');
        setEmployeeTypeFilter(filters.employeeType || 'All');
        setEmployeeCodeFilter(filters.employeeCode || '');
        setDesignationFilter(filters.designation || '');
        setPayableDaysRange(filters.payableDays || { min: '', max: '' });
        setSalaryRange(filters.salaryRange || { min: '', max: '' });
        if (filters.selectedMonth) setSelectedMonth(filters.selectedMonth);
      } catch (e) {
        console.warn('Failed to load saved filters');
      }
    }
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    const filters = {
      searchTerm,
      employeeType: employeeTypeFilter,
      employeeCode: employeeCodeFilter,
      designation: designationFilter,
      payableDays: payableDaysRange,
      salaryRange,
      selectedMonth
    };
    localStorage.setItem('musterRollFilters', JSON.stringify(filters));
  }, [searchTerm, employeeTypeFilter, employeeCodeFilter, designationFilter, payableDaysRange, salaryRange, selectedMonth]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get month info
  const monthInfo = useMemo(() => {
    try {
      if (!selectedMonth) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        return { year, month, daysInMonth, monthName };
      }
      const [year, month] = selectedMonth.split('-').map(Number);
      if (isNaN(year) || isNaN(month)) {
        throw new Error('Invalid month format');
      }
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      return { year, month, daysInMonth, monthName };
    } catch (error) {
      console.error('Error calculating month info:', error);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      return { year, month, daysInMonth, monthName };
    }
  }, [selectedMonth]);

  // Process and merge data
  const processedData = useMemo(() => {
    try {
      // Use API data if available, otherwise fallback to Redux data
      const apiData = musterRollData && musterRollData.length > 0 ? musterRollData : [];
      const payroll = apiData.length > 0 ? apiData : (payrollData?.data || []);
      const employees = allUserData?.data || [];

      // If using API data, process it directly
      if (apiData.length > 0) {
        return apiData.map((item, index) => {
          // Handle different possible API response structures
          const employeeInfo = item.employeeInfo || item.employee_basic_details || item.employee || {};
          const leaveSummary = item.leave_summary || item.attendanceSummary || item.attendance_summary || {};
          const salaryDetails = item.salary_details || item.salary || item.salaryDetails || {};
          const attendanceDays = item.attendanceDays || item.attendance_days || {};

          // Process day-wise attendance if it's in a different format
          const processedAttendanceDays = {};
          if (item.dailyAttendance && Array.isArray(item.dailyAttendance)) {
            item.dailyAttendance.forEach(day => {
              const dayNum = day.day || day.date;
              const status = day.status || day.attendanceStatus || 'A';
              if (dayNum >= 1 && dayNum <= monthInfo.daysInMonth) {
                let statusCode = 'A';
                if (status === 'Present' || status === 'Full Day' || status === 'P') statusCode = 'P';
                else if (status === 'Half Day' || status === 'HD') statusCode = 'HD';
                else if (status === 'Holiday' || status === 'H') statusCode = 'H';
                else if (status === 'Week Off' || status === 'Off Day' || status === 'WO') statusCode = 'WO';
                else if (status === 'Casual Leave' || status === 'CL') statusCode = 'CL';
                else if (status === 'Earned Leave' || status === 'EL') statusCode = 'EL';
                else if (status === 'Medical Leave' || status === 'ML') statusCode = 'ML';
                else if (status === 'Absent' || status === 'A') statusCode = 'A';
                else if (status === 'Loss of Pay' || status === 'LOP') statusCode = 'LOP';
                processedAttendanceDays[dayNum] = statusCode;
              }
            });
          } else if (attendanceDays && typeof attendanceDays === 'object') {
            Object.keys(attendanceDays).forEach(key => {
              const dayNum = parseInt(key);
              if (dayNum >= 1 && dayNum <= monthInfo.daysInMonth) {
                processedAttendanceDays[dayNum] = attendanceDays[key];
              }
            });
          }

          return {
            ...item,
            employeeInfo: {
              name: employeeInfo.employee_name || employeeInfo.name || employeeInfo.employeeName || 'N/A',
              code: employeeInfo.employee_code || employeeInfo.code || employeeInfo.employeeCode || employeeInfo.employeeId || 'N/A',
              designation: employeeInfo.designation || 'N/A',
              type: employeeInfo.employeeType || employeeInfo.employee_type || employeeInfo.type || 'Permanent',
              department: employeeInfo.department || 'N/A'
            },
            attendanceDays: processedAttendanceDays,
            attendanceSummary: {
              totalPresent: parseFloat(leaveSummary.workedDays || leaveSummary.totalPresent || leaveSummary.worked_days || 0),
              halfDay: parseFloat(leaveSummary.halfDay || leaveSummary.half_day || 0),
              holiday: parseFloat(leaveSummary.holiday || 0),
              compoff: parseFloat(leaveSummary.compoff || leaveSummary.comboOff || 0),
              // Count ML, EL, CL from attendanceDays
              medicalLeave: Object.values(processedAttendanceDays).filter(status => status === 'ML').length,
              earnedLeave: Object.values(processedAttendanceDays).filter(status => status === 'EL').length,
              casualLeave: Object.values(processedAttendanceDays).filter(status => status === 'CL').length,
              adjustedLeave: parseFloat(leaveSummary.adjustedLeave || leaveSummary.adjusted_leave || 0),
              totalAbsent: parseFloat(leaveSummary.totalAbsent || leaveSummary.total_absent || 0),
              weekOff: parseFloat(leaveSummary.weekOff || leaveSummary.week_off || 0),
              payableDays: parseFloat(leaveSummary.payable_days || leaveSummary.payableDays || 0),
              monthDays: monthInfo.daysInMonth
            },
            salary: {
              gross: parseFloat(salaryDetails.total_gross_salary || salaryDetails.gross_salary || salaryDetails.gross || 0),
              actualGross: parseFloat(salaryDetails.actual_gross_salary || salaryDetails.actualGross || salaryDetails.actual_gross || salaryDetails.gross || 0),
              arrears: parseFloat(salaryDetails.arrears || 0),
              deductions: parseFloat(salaryDetails.total_deduction || salaryDetails.deductions || salaryDetails.total_deductions || 0),
              bonus: parseFloat(salaryDetails.bonus || 0),
              elStatutory: parseFloat(salaryDetails.el_statutory || salaryDetails.elStatutory || 0),
              net: parseFloat(salaryDetails.net_pay || salaryDetails.netPay || salaryDetails.net || 0)
            }
          };
        });
      }

    // Filter by selected month (fallback to old method)
    const monthFiltered = payroll.filter(emp => {
      if (!emp.pay_slip_month) return false;
      const empMonth = new Date(emp.pay_slip_month);
      return empMonth.getFullYear() === monthInfo.year && 
             empMonth.getMonth() + 1 === monthInfo.month;
    });

    // Merge with employee data
    return monthFiltered.map(payrollItem => {
      const empId = payrollItem.employee_basic_details?.employee_code || 
                    payrollItem.employee_basic_details?.employeeId;
      const employee = employees.find(emp => 
        emp.employee_code === empId || 
        emp.employeeId === empId ||
        emp._id === empId
      );

      // Generate day-wise attendance from attendance data
      const attendanceDays = {};
      const empCode = payrollItem.employee_basic_details?.employee_code || 
                      payrollItem.employee_basic_details?.employeeId;
      
      // Get attendance records for this employee
      const empAttendance = (attendanceData?.data || []).filter(att => {
        const attEmpCode = att.employee_code || att.employeeId || att.EmployeeCode;
        return attEmpCode === empCode;
      });

      // Map attendance to days
      empAttendance.forEach(att => {
        if (att.AttendanceDate) {
          const date = new Date(att.AttendanceDate);
          const day = date.getDate();
          if (day >= 1 && day <= monthInfo.daysInMonth) {
            const status = att.Status || att.AttendanceStatus || 'A';
            // Map status to short codes
            let statusCode = 'A';
            if (status === 'Present' || status === 'Full Day') statusCode = 'P';
            else if (status === 'Half Day') statusCode = 'HD';
            else if (status === 'Holiday') statusCode = 'H';
            else if (status === 'Week Off' || status === 'Off Day') statusCode = 'WO';
            else if (status === 'Casual Leave' || status === 'CL') statusCode = 'CL';
            else if (status === 'Earned Leave' || status === 'EL') statusCode = 'EL';
            else if (status === 'Medical Leave' || status === 'ML') statusCode = 'ML';
            else if (status === 'Absent') statusCode = 'A';
            else if (status === 'Loss of Pay' || status === 'LOP') statusCode = 'LOP';
            
            attendanceDays[day] = statusCode;
          }
        }
      });

      const leaveSummary = payrollItem.leave_summary || {};
      const salaryDetails = payrollItem.salary_details || {};

      // Calculate attendance summary
      const totalPresent = parseFloat(leaveSummary.workedDays || 0);
      const halfDay = parseFloat(leaveSummary.halfDay || 0);
      const holiday = parseFloat(leaveSummary.holiday || 0);
      const compoff = parseFloat(leaveSummary.compoff || 0);
      const adjustedLeave = parseFloat(leaveSummary.adjustedLeave || 0);
      const totalAbsent = parseFloat(leaveSummary.totalAbsent || 0);
      const weekOff = parseFloat(leaveSummary.weekOff || 0);
      const payableDays = parseFloat(leaveSummary.payable_days || 0);
      const monthDays = monthInfo.daysInMonth;

      return {
        ...payrollItem,
        employeeInfo: {
          name: employee?.employee_name || payrollItem.employee_basic_details?.employee_name || 'N/A',
          code: employee?.employee_code || payrollItem.employee_basic_details?.employee_code || 'N/A',
          designation: employee?.designation || payrollItem.employee_basic_details?.designation || 'N/A',
          type: employee?.employeeType || employee?.employee_type || 'Permanent',
          department: employee?.department || payrollItem.employee_basic_details?.department || 'N/A'
        },
        attendanceDays,
        attendanceSummary: {
          totalPresent,
          halfDay,
          holiday,
          compoff,
          // Count ML, EL, CL from attendanceDays
          medicalLeave: Object.values(attendanceDays).filter(status => status === 'ML').length,
          earnedLeave: Object.values(attendanceDays).filter(status => status === 'EL').length,
          casualLeave: Object.values(attendanceDays).filter(status => status === 'CL').length,
          adjustedLeave,
          totalAbsent,
          weekOff,
          payableDays,
          monthDays
        },
        salary: {
          gross: parseFloat(salaryDetails.total_gross_salary || salaryDetails.gross_salary || 0),
          actualGross: parseFloat(salaryDetails.actual_gross_salary || salaryDetails.total_gross_salary || 0),
          arrears: parseFloat(salaryDetails.arrears || 0),
          deductions: parseFloat(salaryDetails.total_deduction || 0),
          bonus: parseFloat(salaryDetails.bonus || 0),
          elStatutory: parseFloat(salaryDetails.el_statutory || 0),
          net: parseFloat(salaryDetails.net_pay || 0)
        }
      };
    });
    } catch (error) {
      console.error('Error processing data:', error);
      return [];
    }
  }, [musterRollData, payrollData, allUserData, attendanceData, monthInfo]);

  // Apply filters
  const filteredData = useMemo(() => {
    return processedData.filter(emp => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch = 
          emp.employeeInfo.name.toLowerCase().includes(searchLower) ||
          emp.employeeInfo.code.toLowerCase().includes(searchLower) ||
          emp.employeeInfo.designation.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Employee type filter
      if (employeeTypeFilter !== 'All') {
        const empType = emp.employeeInfo.type || 'Permanent';
        if (employeeTypeFilter === 'Permanent' && empType !== 'Permanent') return false;
        if (employeeTypeFilter === 'Contractual' && empType !== 'Contractual') return false;
      }

      // Employee code filter
      if (employeeCodeFilter) {
        if (!emp.employeeInfo.code.toLowerCase().includes(employeeCodeFilter.toLowerCase())) {
          return false;
        }
      }

      // Designation filter
      if (designationFilter) {
        if (!emp.employeeInfo.designation.toLowerCase().includes(designationFilter.toLowerCase())) {
          return false;
        }
      }

      // Payable days range
      if (payableDaysRange.min && emp.attendanceSummary.payableDays < parseFloat(payableDaysRange.min)) {
        return false;
      }
      if (payableDaysRange.max && emp.attendanceSummary.payableDays > parseFloat(payableDaysRange.max)) {
        return false;
      }

      // Salary range
      if (salaryRange.min && emp.salary.net < parseFloat(salaryRange.min)) {
        return false;
      }
      if (salaryRange.max && emp.salary.net > parseFloat(salaryRange.max)) {
        return false;
      }

      return true;
    });
  }, [processedData, debouncedSearch, employeeTypeFilter, employeeCodeFilter, designationFilter, payableDaysRange, salaryRange]);

  // Attendance status chip component (memoized)
  const AttendanceChip = React.memo(({ status, day }) => {
    const statusConfig = {
      'P': { color: 'bg-green-100 text-green-700 border-green-300', label: 'Present' },
      'HD': { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Half Day' },
      'H': { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Holiday' },
      'WO': { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Week Off' },
      'CL': { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Casual Leave' },
      'EL': { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Earned Leave' },
      'ML': { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Medical Leave' },
      'A': { color: 'bg-red-100 text-red-700 border-red-300', label: 'Absent' },
      'LOP': { color: 'bg-red-100 text-red-700 border-red-300', label: 'Loss of Pay' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700 border-gray-300', label: status || '-' };

    return (
      <div
        className={`inline-flex items-center justify-center w-8 h-8 text-xs font-semibold rounded border ${config.color} cursor-help`}
        title={`Day ${day}: ${config.label}`}
      >
        {status || '-'}
      </div>
    );
  });

  // Employee type badge (memoized)
  const EmployeeTypeBadge = React.memo(({ type }) => {
    const isPermanent = type === 'Permanent' || !type;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPermanent 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-orange-100 text-orange-800'
      }`}>
        {type || 'Permanent'}
      </span>
    );
  });

  // Handle row click
  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setEmployeeTypeFilter('All');
    setEmployeeCodeFilter('');
    setDesignationFilter('');
    setPayableDaysRange({ min: '', max: '' });
    setSalaryRange({ min: '', max: '' });
  };

  return (
    <div className="bg-gray-50">
      {/* Header with Month Selector */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Muster Roll</h1>
              <p className="text-sm text-gray-600 mt-1">{monthInfo.monthName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                  return (
                    <option key={`${year}-${month}`} value={`${year}-${month}`}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FaFilter className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
            {(debouncedSearch || employeeTypeFilter !== 'All' || employeeCodeFilter || designationFilter) && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          {filtersOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {filtersOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Employee Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Code
              </label>
              <input
                type="text"
                value={employeeCodeFilter}
                onChange={(e) => setEmployeeCodeFilter(e.target.value)}
                placeholder="Filter by code..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Employee Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                placeholder="Filter by designation..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Employee Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Type
              </label>
              <select
                value={employeeTypeFilter}
                onChange={(e) => setEmployeeTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="Permanent">Permanent</option>
                <option value="Contractual">Contractual</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="sticky top-0 z-30">
                  {/* Employee Info Group */}
                  {/* 5 fixed columns: S.No, Code, Name, Designation, Type */}
                  <th colSpan={5 + monthInfo.daysInMonth} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase bg-blue-50">
                    Employee Information
                  </th>
                  {/* Attendance Summary Group */}
                  <th colSpan="11" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase bg-yellow-50">
                    Attendance Summary
                  </th>
                </tr>
                <tr className="bg-gray-50 sticky top-[40px] z-20">
                  {/* Employee Info Headers */}
                  <th className="sticky left-0 top-[40px] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                    S.No
                  </th>
                  <th className="sticky left-[60px] top-[40px] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200 min-w-[120px]">
                    Code
                  </th>
                  <th className="sticky left-[180px] top-[40px] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200 min-w-[180px]">
                    Employee Name
                  </th>
                  <th className="sticky left-[360px] top-[40px] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200 min-w-[150px]">
                    Designation
                  </th>
                  <th className="sticky left-[510px] top-[40px] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200 min-w-[120px]">
                    Type
                  </th>
                  
                  {/* Day Headers */}
                  {Array.from({ length: monthInfo.daysInMonth }, (_, i) => (
                    <th key={i + 1} className="sticky top-[40px] z-20 bg-gray-50 px-1 py-3 text-center text-xs font-semibold text-gray-600 w-10">
                      {i + 1}
                    </th>
                  ))}
                  
                  {/* Attendance Summary Headers */}
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Month</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Present</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">HD</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Holiday</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Compoff</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ML</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">EL</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">CL</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Absent</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">WO</th>
                  <th className="sticky top-[40px] z-20 bg-gray-50 px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5 + monthInfo.daysInMonth + 11} className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-lg font-medium">Loading muster roll data...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5 + monthInfo.daysInMonth + 11} className="px-4 py-12 text-center">
                      <div className="text-red-500">
                        <FaInfoCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-lg font-medium">Error loading data</p>
                        <p className="text-sm mt-2">{error}</p>
                        <button
                          onClick={fetchMusterRollData}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((employee, index) => (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(employee)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {/* Employee Info */}
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="sticky left-[60px] z-10 bg-white px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                        {employee.employeeInfo.code}
                      </td>
                      <td className="sticky left-[180px] z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {employee.employeeInfo.name}
                      </td>
                      <td className="sticky left-[360px] z-10 bg-white px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                        {employee.employeeInfo.designation}
                      </td>
                      <td className="sticky left-[510px] z-10 bg-white px-4 py-3 border-r border-gray-200">
                        <EmployeeTypeBadge type={employee.employeeInfo.type} />
                      </td>
                      
                      {/* Day-wise Attendance */}
                      {Array.from({ length: monthInfo.daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const status = employee.attendanceDays[day] || '-';
                        return (
                          <td key={day} className="px-1 py-3 text-center">
                            <AttendanceChip status={status} day={day} />
                          </td>
                        );
                      })}
                      
                      {/* Attendance Summary */}
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.monthDays}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.totalPresent.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.halfDay.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.holiday.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.compoff.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.medicalLeave || 0}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.earnedLeave || 0}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.casualLeave || 0}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.totalAbsent.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-900">
                        {employee.attendanceSummary.weekOff.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-center text-sm font-semibold text-gray-900">
                        {employee.attendanceSummary.payableDays.toFixed(1)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5 + monthInfo.daysInMonth + 11} className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        <FaInfoCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No data found</p>
                        <p className="text-sm mt-2">Try adjusting your filters or select a different month</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Detail Drawer */}
      <EmployeeDetailDrawer
        employee={selectedEmployee}
        monthInfo={monthInfo}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
};

// Employee Detail Drawer Component
const EmployeeDetailDrawer = React.memo(({ employee, monthInfo, isOpen, onClose }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{employee.employeeInfo.name}</h2>
              <p className="text-sm text-gray-600">{employee.employeeInfo.code} • {employee.employeeInfo.designation}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Attendance Calendar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Calendar</h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthInfo.daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const status = employee.attendanceDays[day] || '-';
                  return (
                    <div key={day} className="aspect-square flex items-center justify-center border border-gray-200 rounded text-xs">
                      <div className="text-center">
                        <div className="font-medium">{day}</div>
                        <div className="text-xs text-gray-500">{status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Present</div>
                  <div className="text-2xl font-bold text-gray-900">{employee.attendanceSummary.totalPresent.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Half Day</div>
                  <div className="text-2xl font-bold text-gray-900">{employee.attendanceSummary.halfDay.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Holiday</div>
                  <div className="text-2xl font-bold text-gray-900">{employee.attendanceSummary.holiday.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Absent</div>
                  <div className="text-2xl font-bold text-red-600">{employee.attendanceSummary.totalAbsent.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Week Off</div>
                  <div className="text-2xl font-bold text-gray-900">{employee.attendanceSummary.weekOff.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Payable Days</div>
                  <div className="text-2xl font-bold text-green-600">{employee.attendanceSummary.payableDays.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MusterRoll;
