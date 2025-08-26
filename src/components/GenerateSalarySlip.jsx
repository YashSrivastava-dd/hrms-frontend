import React, { useState, useRef, useEffect } from 'react';
import { FaDownload, FaSave, FaUser, FaBuilding, FaCalendarAlt, FaMoneyBillWave, FaCalculator, FaFileAlt, FaSearch, FaSpinner, FaChevronDown, FaTimes } from 'react-icons/fa';

const GenerateSalarySlip = () => {
  const [formData, setFormData] = useState({
    pay_slip_month: '',
    company_address: 'A1, BLOCK A, SECTOR 83, NOIDA, UTTAR PRADESH 201301',
    employee_basic_details: {
      employee_name: '',
      employee_code: '',
      designation: '',
      date_of_joining: '',
      employee_pan: '',
      employee_aadhar: '',
      bank_name: '',
      bank_ifsc: '',
      bank_account: '',
      employee_uan: '',
      employee_esic: '',
      payment_mode: 'Bank Transfer'
    },
    leave_summary: {
      month_days: '31',
      unpaid_days: '0',
      payable_days: '31',
      absent: 0.0,
      workedDays: 31.0
    },
    salary_details: {
      gross_salary: '',
      basic_salary: '',
      hra: '',
      travel_allowances: '',
      special_allowances: '',
      arrears: '0',
      bonus_or_others: '0',
      total_gross_salary: '',
      employee_pf: '',
      employee_esi: '',
      tds: '',
      loan_advance: '0',
      penalty: '0',
      transport_or_others: '0',
      total_deduction: '',
      net_pay: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [employeeSearchId, setEmployeeSearchId] = useState('');
  const [searchingEmployee, setSearchingEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showWorkingDaysBreakdown, setShowWorkingDaysBreakdown] = useState(false);
  const monthDropdownRef = useRef(null);

  // Custom scrollbar styles for dropdown
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }
  `;

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    const basic = parseFloat(formData.salary_details.basic_salary) || 0;
    const hra = parseFloat(formData.salary_details.hra) || 0;
    const travel = parseFloat(formData.salary_details.travel_allowances) || 0;
    const special = parseFloat(formData.salary_details.special_allowances) || 0;
    const arrears = parseFloat(formData.salary_details.arrears) || 0;
    const bonus = parseFloat(formData.salary_details.bonus_or_others) || 0;

    const gross = basic + hra + travel + special + arrears + bonus;

    const pf = parseFloat(formData.salary_details.employee_pf) || 0;
    const esi = parseFloat(formData.salary_details.employee_esi) || 0;
    const tds = parseFloat(formData.salary_details.tds) || 0;
    const loan = parseFloat(formData.salary_details.loan_advance) || 0;
    const penalty = parseFloat(formData.salary_details.penalty) || 0;
    const transport = parseFloat(formData.salary_details.transport_or_others) || 0;

    const deductions = pf + esi + tds + loan + penalty + transport;
    const net = gross - deductions;

    return { gross, deductions, net };
  };

  // Automatic salary calculation based on gross salary and employee type
  const calculateSalaryComponents = (grossSalary) => {
    if (!grossSalary || grossSalary <= 0) {
      // Reset all calculated fields if gross salary is invalid
      setFormData(prev => ({
        ...prev,
        salary_details: {
          ...prev.salary_details,
          basic_salary: '',
          hra: '',
          employee_pf: '',
          employee_esi: '',
          tds: ''
        }
      }));
      return;
    }

    const gross = parseFloat(grossSalary);
    const isPermanent = employeeData?.employmentType === 'Permanent';
    
    // 1. Basic Salary = 50% of Gross Salary
    const basicSalary = Math.round(gross * 0.5);
    
    // 2. HRA = 40% of Basic Salary
    const hra = Math.round(basicSalary * 0.4);
    
    let pf = 0;
    let esi = 0;
    let tds = 0;
    
    if (isPermanent) {
      // 3. For Permanent employees: ESI and PF rules apply
      
      // ESI calculation
      if (gross > 21000) {
        esi = 0; // No ESI if gross salary > ₹21,000
      } else {
        esi = Math.round(gross * 0.0075); // 0.75% of gross salary
      }
      
      // PF calculation
      const grossMinusHRA = gross - hra;
      if (grossMinusHRA >= 15000) {
        pf = 1800; // Fixed PF if (Gross - HRA) >= ₹15,000
      } else {
        pf = Math.round(grossMinusHRA * 0.12); // 12% of (Gross - HRA)
      }
    } else {
      // 4. For Non-permanent employees: No PF/ESI, but 1% TDS
      pf = 0;
      esi = 0;
      tds = Math.round(gross * 0.01); // 1% of gross salary
    }
    
    // Update form data with calculated values
    setFormData(prev => ({
      ...prev,
      salary_details: {
        ...prev.salary_details,
        basic_salary: basicSalary.toString(),
        hra: hra.toString(),
        employee_pf: pf.toString(),
        employee_esi: esi.toString(),
        tds: tds.toString()
      }
    }));
    
    console.log('Salary calculation details:', {
      grossSalary: gross,
      isPermanent,
      basicSalary,
      hra,
      pf,
      esi,
      tds,
      grossMinusHRA: gross - hra
    });
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'main') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
      
      // Auto-calculate salary components when gross salary changes
      if (section === 'salary_details' && field === 'gross_salary') {
        calculateSalaryComponents(value);
      }
    }
  };

  // Handle month selection
  const handleMonthSelect = (month) => {
    handleInputChange('main', 'pay_slip_month', month);
    setShowMonthDropdown(false);
    
    // Auto-calculate working days if employee data is available
    if (employeeData?.workingDays) {
      updatePayableDays(month, parseInt(employeeData.workingDays));
    }
  };

  const clearMonth = () => {
    handleInputChange('main', 'pay_slip_month', '');
    setShowMonthDropdown(false);
    
    // Reset working days calculation
    setFormData(prev => ({
      ...prev,
      leave_summary: {
        ...prev.leave_summary,
        month_days: '31',
        payable_days: '31',
        workedDays: 31.0
      }
    }));
  };

  // Month options for dropdown
  const monthOptions = [
    'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025',
    'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025',
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  // Calculate working days for the selected month based on employee's working schedule
  const calculateWorkingDaysForMonth = (monthYear, workingDaysPerWeek) => {
    if (!monthYear || !workingDaysPerWeek) return 0;
    
    // Parse month and year from the month string (e.g., "January 2025")
    const [monthName, yearStr] = monthYear.split(' ');
    const year = parseInt(yearStr);
    
    // Month names to month numbers (0-11)
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.indexOf(monthName);
    
    if (monthIndex === -1) return 0;
    
    // Get the first day of the month
    const firstDay = new Date(year, monthIndex, 1);
    // Get the last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    let workingDays = 0;
    const currentDate = new Date(firstDay);
    const totalDaysInMonth = lastDay.getDate();
    
    // Log calculation details for debugging
    console.log(`Calculating working days for ${monthYear}:`, {
      year,
      monthIndex,
      monthName,
      firstDay: firstDay.toDateString(),
      lastDay: lastDay.toDateString(),
      totalDaysInMonth,
      workingDaysPerWeek
    });
    
    // Iterate through each day of the month
    while (currentDate <= lastDay) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const currentDateStr = currentDate.toDateString();
      
      let isWorkingDay = false;
      
      if (workingDaysPerWeek === 5) {
        // Monday to Friday (Monday = 1, Tuesday = 2, ..., Friday = 5)
        isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5;
      } else if (workingDaysPerWeek === 6) {
        // Monday to Saturday (Monday = 1, Tuesday = 2, ..., Saturday = 6)
        isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 6;
      } else if (workingDaysPerWeek === 7) {
        // Monday to Sunday (all days)
        isWorkingDay = true;
      }
      
      if (isWorkingDay) {
        workingDays++;
        console.log(`${currentDateStr} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}) - Working Day`);
      } else {
        console.log(`${currentDateStr} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}) - Weekend/Non-working Day`);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Total working days calculated for ${monthYear}: ${workingDays}`);
    return workingDays;
  };

  // Update payable days when month or working days change
  const updatePayableDays = (monthYear, workingDaysPerWeek) => {
    if (monthYear && workingDaysPerWeek) {
      const workingDays = calculateWorkingDaysForMonth(monthYear, workingDaysPerWeek);
      const monthDays = workingDays; // Set month days to working days
      
      setFormData(prev => ({
        ...prev,
        leave_summary: {
          ...prev.leave_summary,
          month_days: monthDays.toString(),
          payable_days: workingDays.toString(),
          workedDays: workingDays
        }
      }));
    }
  };

  // Get detailed working days breakdown for the selected month
  const getWorkingDaysBreakdown = (monthYear, workingDaysPerWeek) => {
    if (!monthYear || !workingDaysPerWeek) return null;
    
    const [monthName, yearStr] = monthYear.split(' ');
    const year = parseInt(yearStr);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.indexOf(monthName);
    
    if (monthIndex === -1) return null;
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    const breakdown = {
      month: monthName,
      year: year,
      totalDays: lastDay.getDate(),
      workingDays: 0,
      weekendDays: 0,
      workingDayDetails: [],
      weekendDayDetails: []
    };
    
    const currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toDateString();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
      let isWorkingDay = false;
      if (workingDaysPerWeek === 5) {
        isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5;
      } else if (workingDaysPerWeek === 6) {
        isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 6;
      } else if (workingDaysPerWeek === 7) {
        isWorkingDay = true;
      }
      
      if (isWorkingDay) {
        breakdown.workingDays++;
        breakdown.workingDayDetails.push({ date: dateStr, day: dayName });
      } else {
        breakdown.weekendDays++;
        breakdown.weekendDayDetails.push({ date: dateStr, day: dayName });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return breakdown;
  };

  // Auto-calculate working days when month or employee working days change
  useEffect(() => {
    if (formData.pay_slip_month && employeeData?.workingDays) {
      updatePayableDays(formData.pay_slip_month, parseInt(employeeData.workingDays));
    }
  }, [formData.pay_slip_month, employeeData?.workingDays]);

  // Fetch employee data by ID
  const fetchEmployeeData = async (employeeId) => {
    if (!employeeId.trim()) {
      setMessage({ type: 'error', text: 'Please enter an employee ID' });
      return;
    }

    setSearchingEmployee(true);
    setMessage({ type: '', text: '' });

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:3001'}/api/employee/get-employee-details/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data) {
          setEmployeeData(result.data);
          
          // Auto-populate form with employee data
          setFormData(prev => ({
            ...prev,
            employee_basic_details: {
              ...prev.employee_basic_details,
              employee_name: result.data.employeeName || '',
              employee_code: result.data.employeeId || '',
              designation: result.data.designation || '',
              date_of_joining: result.data.doj ? result.data.doj.split('T')[0] : '',
              employee_pan: result.data.pancardNo || '',
              employee_aadhar: result.data.aadhaarNumber || '',
              bank_name: result.data.employee_basic_details?.bank_name || '',
              bank_ifsc: result.data.employee_basic_details?.bank_ifsc || '',
              bank_account: result.data.employee_basic_details?.bank_account || '',
              employee_uan: result.data.employee_basic_details?.employee_uan || '',
              employee_esic: result.data.employee_basic_details?.employee_esic || '',
              payment_mode: result.data.employee_basic_details?.payment_mode || 'Bank Transfer'
            },
            salary_details: {
              ...prev.salary_details,
              gross_salary: result.data.salary_details?.gross_salary || '',
              basic_salary: result.data.salary_details?.basic_salary || '',
              hra: result.data.salary_details?.hra || '',
              travel_allowances: result.data.salary_details?.travel_allowances || '',
              special_allowances: result.data.salary_details?.special_allowances || '',
              arrears: result.data.salary_details?.arrears || '0',
              bonus_or_others: result.data.salary_details?.bonus_or_others || '0',
              employee_pf: result.data.salary_details?.employee_pf || '',
              employee_esi: result.data.salary_details?.employee_esi || '',
              tds: result.data.salary_details?.tds || '',
              loan_advance: result.data.salary_details?.loan_advance || '0',
              penalty: result.data.salary_details?.penalty || '0',
              transport_or_others: result.data.salary_details?.transport_or_others || '0'
            }
          }));
          
          setMessage({ type: 'success', text: `Employee data loaded successfully for ${result.data.employeeName}` });
          
          // Auto-calculate working days if month is already selected
          if (formData.pay_slip_month && result.data.workingDays) {
            updatePayableDays(formData.pay_slip_month, parseInt(result.data.workingDays));
          }
          
          // Auto-calculate salary components if gross salary is available
          if (result.data.salary_details?.gross_salary) {
            calculateSalaryComponents(result.data.salary_details.gross_salary);
          }
        } else {
          setMessage({ type: 'error', text: 'Employee data not found' });
        }
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to fetch employee data' });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSearchingEmployee(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Basic validation
    if (!formData.pay_slip_month || !formData.employee_basic_details.employee_name || 
        !formData.employee_basic_details.employee_code || !formData.employee_basic_details.designation ||
        !formData.employee_basic_details.date_of_joining || !formData.salary_details.gross_salary) {
      setMessage({ type: 'error', text: 'Please fill in all required fields marked with *' });
      setLoading(false);
      return;
    }

    try {
      // Prepare the data with calculated totals
      const { gross, deductions, net } = calculateTotals();
      const submitData = {
        ...formData,
        salary_details: {
          ...formData.salary_details,
          total_gross_salary: gross.toString(),
          total_deduction: deductions.toString(),
          net_pay: net.toString()
        }
      };

      const response = await fetch('http://172.23.103.207:3001/api/save-salary-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'Salary slip generated successfully!' });
        // Reset form after successful submission
        setFormData({
          pay_slip_month: '',
          company_address: 'A1, BLOCK A, SECTOR 83, NOIDA, UTTAR PRADESH 201301',
          employee_basic_details: {
            employee_name: '',
            employee_code: '',
            designation: '',
            date_of_joining: '',
            employee_pan: '',
            employee_aadhar: '',
            bank_name: '',
            bank_ifsc: '',
            bank_account: '',
            employee_uan: '',
            employee_esic: '',
            payment_mode: 'Bank Transfer'
          },
          leave_summary: {
            month_days: '31',
            unpaid_days: '0',
            payable_days: '31',
            absent: 0.0,
            workedDays: 31.0
          },
          salary_details: {
            gross_salary: '',
            basic_salary: '',
            hra: '',
            travel_allowances: '',
            special_allowances: '',
            arrears: '0',
            bonus_or_others: '0',
            total_gross_salary: '',
            employee_pf: '',
            employee_esi: '',
            tds: '',
            loan_advance: '0',
            penalty: '0',
            transport_or_others: '0',
            total_deduction: '',
            net_pay: ''
          }
        });
        // Clear employee search data
        setEmployeeSearchId('');
        setEmployeeData(null);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to generate salary slip' });
      }
    } catch (error) {
      console.error('Error submitting salary slip:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const { gross, deductions, net } = calculateTotals();

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <FaMoneyBillWave className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Generate Salary Slip</h1>
                <p className="text-gray-600">Create and manage employee salary slips</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setFormData({
                    pay_slip_month: 'March 2025',
                    company_address: 'A1, BLOCK A, SECTOR 83, NOIDA, UTTAR PRADESH 201301',
                    employee_basic_details: {
                      employee_name: 'Test User',
                      employee_code: '495',
                      designation: 'Software Engineer',
                      date_of_joining: '2021-07-15',
                      employee_pan: 'ABCPR1234D',
                      employee_aadhar: '1234-5678-9123',
                      bank_name: 'HDFC Bank',
                      bank_ifsc: 'HDFC0001234',
                      bank_account: '123456789012',
                      employee_uan: '100200300400',
                      employee_esic: 'ESIC1234567',
                      payment_mode: 'Bank Transfer'
                    },
                    leave_summary: {
                      month_days: '31',
                      unpaid_days: '1',
                      payable_days: '30',
                      absent: 10.0,
                      workedDays: 7.5
                    },
                    salary_details: {
                      gross_salary: '30000',
                      basic_salary: '20000',
                      hra: '5000',
                      travel_allowances: '1000',
                      special_allowances: '2000',
                      arrears: '0',
                      bonus_or_others: '1000',
                      total_gross_salary: '',
                      employee_pf: '1500',
                      employee_esi: '500',
                      tds: '1000',
                      loan_advance: '0',
                      penalty: '0',
                      transport_or_others: '200',
                      total_deduction: '',
                      net_pay: ''
                    }
                  });
                  // Clear employee search data
                  setEmployeeSearchId('');
                  setEmployeeData(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <FaUser className="text-sm" />
                <span>Load Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <FaSave className="h-5 w-5 text-green-400" />
                ) : (
                  <FaFileAlt className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Employee Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <FaSearch className="text-white text-lg" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Search Employee</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={employeeSearchId}
                  onChange={(e) => setEmployeeSearchId(e.target.value)}
                  placeholder="Enter Employee ID (e.g., 495)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && fetchEmployeeData(employeeSearchId)}
                />
                <button
                  onClick={() => fetchEmployeeData(employeeSearchId)}
                  disabled={searchingEmployee || !employeeSearchId.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                >
                  {searchingEmployee ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch className="text-sm" />
                      <span>Search</span>
                    </>
                  )}
                </button>
                {employeeData && (
                  <button
                    onClick={() => {
                      setEmployeeSearchId('');
                      setEmployeeData(null);
                      setFormData(prev => ({
                        ...prev,
                        employee_basic_details: {
                          ...prev.employee_basic_details,
                          employee_name: '',
                          employee_code: '',
                          designation: '',
                          date_of_joining: '',
                          employee_pan: '',
                          bank_name: '',
                          bank_ifsc: '',
                          bank_account: '',
                          employee_uan: '',
                          employee_esic: '',
                          payment_mode: 'Bank Transfer'
                        },
                        salary_details: {
                          ...prev.salary_details,
                          gross_salary: '',
                          basic_salary: '',
                          hra: '',
                          travel_allowances: '',
                          special_allowances: '',
                          arrears: '0',
                          bonus_or_others: '0',
                          employee_pf: '',
                          employee_esi: '',
                          tds: '',
                          loan_advance: '0',
                          penalty: '0',
                          transport_or_others: '0'
                        }
                      }));
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap"
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the employee ID to auto-populate employee details from the system
              </p>
            </div>
          </div>

          {/* Employee Info Display */}
          {employeeData && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {employeeData.employeeName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{employeeData.employeeName}</h3>
                    <p className="text-sm text-gray-600">
                      {employeeData.designation} • {employeeData.departmentId}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {employeeData.employeeId} • Joined: {employeeData.doj ? new Date(employeeData.doj).toLocaleDateString() : 'N/A'}
                    </p>
                    {employeeData.shiftTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        Shift: {employeeData.shiftTime.startAt} - {employeeData.shiftTime.endAt}
                      </p>
                    )}
                    {employeeData.leaveBalance && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p className="font-medium text-gray-600 mb-1">Leave Balance:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <span>CL: {employeeData.leaveBalance.casualLeave || '0'}</span>
                          <span>ML: {employeeData.leaveBalance.medicalLeave || '0'}</span>
                          <span>EL: {employeeData.leaveBalance.earnedLeave || '0'}</span>
                          <span>Comp-off: {employeeData.leaveBalance.compOffLeave || '0'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Data Loaded
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                <FaBuilding className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Slip Month *
                </label>
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    className={`flex items-center justify-between w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors duration-200 ${
                      formData.pay_slip_month 
                        ? 'border-green-300 bg-green-50 text-green-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-gray-700">
                      {formData.pay_slip_month || "Select Month"}
                    </span>
                    <div className="flex items-center space-x-2">
                      {formData.pay_slip_month && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            clearMonth();
                          }}
                          className="p-1 rounded-full hover:bg-green-200 transition-colors duration-200 cursor-pointer"
                        >
                          <FaTimes className="w-3 h-3 text-green-500" />
                        </span>
                      )}
                      <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        showMonthDropdown ? 'rotate-180' : ''
                      } ${formData.pay_slip_month ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                  </button>

                  {showMonthDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="p-2">
                        {monthOptions.map((month, index) => (
                          <button
                            key={index}
                            onClick={() => handleMonthSelect(month)}
                            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                              formData.pay_slip_month === month
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                formData.pay_slip_month === month ? 'border-white bg-white' : 'border-gray-300'
                              }`}></div>
                              <span className="font-medium">{month}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <textarea
                  value={formData.company_address}
                  onChange={(e) => handleInputChange('main', 'company_address', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
                <FaUser className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.employee_name}
                  onChange={(e) => handleInputChange('employee_basic_details', 'employee_name', e.target.value)}
                  placeholder="Employee Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Code *
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.employee_code}
                  onChange={(e) => handleInputChange('employee_basic_details', 'employee_code', e.target.value)}
                  placeholder="Employee Code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation *
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.designation}
                  onChange={(e) => handleInputChange('employee_basic_details', 'designation', e.target.value)}
                  placeholder="Designation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  value={formData.employee_basic_details.date_of_joining}
                  onChange={(e) => handleInputChange('employee_basic_details', 'date_of_joining', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.employee_pan}
                  onChange={(e) => handleInputChange('employee_basic_details', 'employee_pan', e.target.value)}
                  placeholder="PAN Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.employee_aadhar}
                  onChange={(e) => handleInputChange('employee_basic_details', 'employee_aadhar', e.target.value)}
                  placeholder="Aadhar Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.bank_name}
                  onChange={(e) => handleInputChange('employee_basic_details', 'bank_name', e.target.value)}
                  placeholder="Bank Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank IFSC
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.bank_ifsc}
                  onChange={(e) => handleInputChange('employee_basic_details', 'bank_ifsc', e.target.value)}
                  placeholder="Bank IFSC"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.bank_account}
                  onChange={(e) => handleInputChange('employee_basic_details', 'bank_account', e.target.value)}
                  placeholder="Bank Account"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UAN Number
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.employee_uan}
                  onChange={(e) => handleInputChange('employee_basic_details', 'employee_uan', e.target.value)}
                  placeholder="UAN Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ESIC Number
                </label>
                <input
                  type="text"
                  value={formData.employee_basic_details.employee_esic}
                  onChange={(e) => handleInputChange('employee_basic_details', 'employee_esic', e.target.value)}
                  placeholder="ESIC Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <select
                  value={formData.employee_basic_details.payment_mode}
                  onChange={(e) => handleInputChange('employee_basic_details', 'payment_mode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leave Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Leave Summary</h2>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Working Days Calculation:</span> The system automatically calculates payable days based on your working schedule and selected month. 
                {employeeData?.workingDays === 5 && ' Monday to Friday workers have 5 working days per week.'}
                {employeeData?.workingDays === 6 && ' Monday to Saturday workers have 6 working days per week.'}
                {employeeData?.workingDays === 7 && ' Monday to Sunday workers have 7 working days per week.'}
                <br />
                <span className="text-xs text-blue-600 mt-1 block">
                  Note: This calculation excludes holidays and public holidays. You may need to manually adjust for specific holidays in your region.
                </span>
              </p>
            </div>

            {employeeData?.workingDays && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
                  <span className="font-medium">Working Days per Week:</span> {employeeData.workingDays} days
                </p>
                {formData.pay_slip_month && (
                  <>
                    <button
                      type="button"
                      onClick={() => updatePayableDays(formData.pay_slip_month, parseInt(employeeData.workingDays))}
                      className="mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 transition-colors duration-200"
                    >
                      Recalculate Working Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWorkingDaysBreakdown(!showWorkingDaysBreakdown)}
                      className="mt-2 ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      {showWorkingDaysBreakdown ? 'Hide' : 'Show'} Breakdown
                    </button>
                    <div className="mt-2 text-xs text-orange-600">
                      <p><span className="font-medium">Selected Month:</span> {formData.pay_slip_month}</p>
                      <p><span className="font-medium">Calculated Working Days:</span> {formData.leave_summary.payable_days} days</p>
                      <p><span className="font-medium">Schedule:</span> {employeeData.workingDays === 5 ? 'Monday to Friday' : employeeData.workingDays === 6 ? 'Monday to Saturday' : 'Monday to Sunday'}</p>
                    </div>
                    
                    {/* Working Days Breakdown */}
                    {showWorkingDaysBreakdown && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-orange-300">
                        <h4 className="font-medium text-orange-800 mb-2">Working Days Breakdown for {formData.pay_slip_month}</h4>
                        {(() => {
                          const breakdown = getWorkingDaysBreakdown(formData.pay_slip_month, parseInt(employeeData.workingDays));
                          if (!breakdown) return <p className="text-red-600">Unable to calculate breakdown</p>;
                          
                          return (
                            <div className="text-xs text-orange-700">
                              <p><span className="font-medium">Total Days:</span> {breakdown.totalDays}</p>
                              <p><span className="font-medium">Working Days:</span> {breakdown.workingDays}</p>
                              <p><span className="font-medium">Weekend/Non-working Days:</span> {breakdown.weekendDays}</p>
                              <div className="mt-2">
                                <p className="font-medium">Working Days:</p>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {breakdown.workingDayDetails.map((day, index) => (
                                    <span key={index} className="bg-green-100 px-1 py-0.5 rounded">
                                      {day.date.split(' ').slice(1, 3).join(' ')} ({day.day.slice(0, 3)})
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="font-medium">Weekend/Non-working Days:</p>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {breakdown.weekendDayDetails.map((day, index) => (
                                    <span key={index} className="bg-red-100 px-1 py-0.5 rounded">
                                      {day.date.split(' ').slice(1, 3).join(' ')} ({day.day.slice(0, 3)})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month Days
                </label>
                <input
                  type="number"
                  value={formData.leave_summary.month_days}
                  onChange={(e) => handleInputChange('leave_summary', 'month_days', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center"
                  placeholder="31"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unpaid Days
                </label>
                <input
                  type="number"
                  value={formData.leave_summary.unpaid_days}
                  onChange={(e) => handleInputChange('leave_summary', 'unpaid_days', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payable Days
                </label>
                <input
                  type="number"
                  value={formData.leave_summary.payable_days}
                  onChange={(e) => handleInputChange('leave_summary', 'payable_days', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center bg-gray-50"
                  placeholder="31"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Auto-calculated based on working schedule
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Absent Days
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.leave_summary.absent}
                  onChange={(e) => handleInputChange('leave_summary', 'absent', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center"
                  placeholder="0.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Worked Days
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.leave_summary.workedDays}
                  onChange={(e) => handleInputChange('leave_summary', 'workedDays', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center"
                  placeholder="31.0"
                />
              </div>
            </div>
          </div>

          {/* Salary Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                <FaCalculator className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Salary Details</h2>
            </div>
            
            {/* Salary Calculation Rules Info */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-green-800">Automatic Salary Calculation Rules</h3>
                {formData.salary_details.gross_salary && employeeData?.employmentType && (
                  <button
                    type="button"
                    onClick={() => calculateSalaryComponents(formData.salary_details.gross_salary)}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Recalculate
                  </button>
                )}
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><span className="font-medium">• Basic Salary:</span> 50% of Gross Salary</p>
                <p><span className="font-medium">• HRA:</span> 40% of Basic Salary</p>
                {employeeData?.employmentType === 'Permanent' ? (
                  <>
                    <p><span className="font-medium">• ESI:</span> 0.75% of Gross Salary (if ≤ ₹21,000), 0 if {'>'}{'₹21,000'}</p>
                    <p><span className="font-medium">• PF:</span> ₹1,800 (if Gross-HRA ≥ ₹15,000), 12% of (Gross-HRA) otherwise</p>
                    <p><span className="font-medium">• TDS:</span> 0 (for Permanent employees)</p>
                  </>
                ) : (
                  <>
                    <p><span className="font-medium">• ESI:</span> 0 (for Non-permanent employees)</p>
                    <p><span className="font-medium">• PF:</span> 0 (for Non-permanent employees)</p>
                    <p><span className="font-medium">• TDS:</span> 1% of Gross Salary</p>
                  </>
                )}
                <p className="text-xs text-green-600 mt-2">
                  Note: Basic Salary, HRA, ESI, PF, and TDS are automatically calculated and cannot be edited.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gross Salary *
                </label>
                <input
                  type="number"
                  value={formData.salary_details.gross_salary}
                  onChange={(e) => handleInputChange('salary_details', 'gross_salary', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Salary
                </label>
                <input
                  type="number"
                  value={formData.salary_details.basic_salary}
                  onChange={(e) => handleInputChange('salary_details', 'basic_salary', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Auto-calculated (50% of Gross)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HRA
                </label>
                <input
                  type="number"
                  value={formData.salary_details.hra}
                  onChange={(e) => handleInputChange('salary_details', 'hra', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Auto-calculated (40% of Basic)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Allowances
                </label>
                <input
                  type="number"
                  value={formData.salary_details.travel_allowances}
                  onChange={(e) => handleInputChange('salary_details', 'travel_allowances', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Allowances
                </label>
                <input
                  type="number"
                  value={formData.salary_details.special_allowances}
                  onChange={(e) => handleInputChange('salary_details', 'special_allowances', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrears
                </label>
                <input
                  type="number"
                  value={formData.salary_details.arrears}
                  onChange={(e) => handleInputChange('salary_details', 'arrears', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus/Others
                </label>
                <input
                  type="number"
                  value={formData.salary_details.bonus_or_others}
                  onChange={(e) => handleInputChange('salary_details', 'bonus_or_others', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee PF
                </label>
                <input
                  type="number"
                  value={formData.salary_details.employee_pf}
                  onChange={(e) => handleInputChange('salary_details', 'employee_pf', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {employeeData?.employmentType === 'Permanent' ? 'Auto-calculated based on rules' : '0 for non-permanent'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ESI
                </label>
                <input
                  type="number"
                  value={formData.salary_details.employee_esi}
                  onChange={(e) => handleInputChange('salary_details', 'employee_esi', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {employeeData?.employmentType === 'Permanent' ? 'Auto-calculated (0.75% if ≤ ₹21,000)' : '0 for non-permanent'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TDS
                </label>
                <input
                  type="number"
                  value={formData.salary_details.tds}
                  onChange={(e) => handleInputChange('salary_details', 'tds', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {employeeData?.employmentType === 'Permanent' ? '0 for permanent employees' : 'Auto-calculated (1% of Gross)'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan/Advance
                </label>
                <input
                  type="number"
                  value={formData.salary_details.loan_advance}
                  onChange={(e) => handleInputChange('salary_details', 'loan_advance', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty
                </label>
                <input
                  type="number"
                  value={formData.salary_details.penalty}
                  onChange={(e) => handleInputChange('salary_details', 'penalty', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport/Others
                </label>
                <input
                  type="number"
                  value={formData.salary_details.transport_or_others}
                  onChange={(e) => handleInputChange('salary_details', 'transport_or_others', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  readOnly
                />
              </div>
            </div>
            
            {/* Salary Calculation Summary */}
            {formData.salary_details.gross_salary && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">Current Calculation Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-blue-600 font-medium">Gross Salary</p>
                    <p className="text-lg font-bold text-blue-800">₹{parseInt(formData.salary_details.gross_salary).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-medium">Basic (50%)</p>
                    <p className="text-lg font-bold text-blue-800">₹{parseInt(formData.salary_details.basic_salary || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-medium">HRA (40% of Basic)</p>
                    <p className="text-lg font-bold text-blue-800">₹{parseInt(formData.salary_details.hra || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-medium">Total Deductions</p>
                    <p className="text-lg font-bold text-blue-800">₹{parseInt(formData.salary_details.employee_pf || 0) + parseInt(formData.salary_details.employee_esi || 0) + parseInt(formData.salary_details.tds || 0)}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-600 text-center">
                  <p><span className="font-medium">Employee Type:</span> {employeeData?.employmentType || 'Not specified'}</p>
                  <p><span className="font-medium">Calculation Status:</span> {formData.salary_details.basic_salary ? 'Completed' : 'Pending - Enter Gross Salary'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg border border-green-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                <FaCalculator className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Salary Summary</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Gross Salary</h3>
                <p className="text-2xl font-bold text-green-600">₹{gross.toLocaleString()}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Deductions</h3>
                <p className="text-2xl font-bold text-red-600">₹{deductions.toLocaleString()}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Net Pay</h3>
                <p className="text-2xl font-bold text-blue-600">₹{net.toLocaleString()}</p>
                {employeeData?.salary_details?.net_pay && (
                  <p className="text-sm text-gray-500 mt-1">
                    API: ₹{parseFloat(employeeData.salary_details.net_pay).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            {employeeData?.salary_details?.net_pay && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> The net pay shown above is calculated based on the form inputs. 
                  The API-provided net pay is ₹{parseFloat(employeeData.salary_details.net_pay).toLocaleString()}.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Generating Salary Slip...</span>
                </>
              ) : (
                <>
                  <FaDownload className="text-xl" />
                  <span>Generate Salary Slip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default GenerateSalarySlip;

