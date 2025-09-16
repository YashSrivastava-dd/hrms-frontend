import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaDownload, FaSave, FaUser, FaBuilding, FaCalendarAlt, FaMoneyBillWave, FaCalculator, FaFileAlt, FaSearch, FaSpinner, FaChevronDown, FaTimes, FaCheck, FaEye } from 'react-icons/fa';
import NewPaySlip from './NewPaySlip';

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
      EL: 0.0,
      CL: 0.0,
      ML: 0.0,
      D_EL: 0.0,
      D_CL: 0.0,
      D_ML: 0.0,
      regularisation: 0.0,
      shortLeave: 0.0,
      halfDay: 0.0,
      absent: 0.0,
      workedDays: 31.0,
      SD: 0.0
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Refs for dropdown and click outside detection
  const monthDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.pay_slip_month) errors.pay_slip_month = 'Pay slip month is required';
    if (!formData.employee_basic_details.employee_name) errors.employee_name = 'Employee name is required';
    if (!formData.employee_basic_details.employee_code) errors.employee_code = 'Employee code is required';
    if (!formData.employee_basic_details.designation) errors.designation = 'Designation is required';
    if (!formData.employee_basic_details.date_of_joining) errors.date_of_joining = 'Date of joining is required';
    if (!formData.salary_details.gross_salary) errors.gross_salary = 'Gross salary is required';
    
    // Validate numeric fields
    const numericFields = ['gross_salary', 'basic_salary', 'hra', 'travel_allowances', 'special_allowances'];
    numericFields.forEach(field => {
      const value = formData.salary_details[field];
      if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
        errors[field] = 'Please enter a valid positive number';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Enhanced form input handler with validation
  const handleInputChange = useCallback((section, field, value) => {
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
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
    }
      
      // Auto-calculate salary components when gross salary changes
      if (section === 'salary_details' && field === 'gross_salary') {
      const grossValue = parseFloat(value) || 0;
      const basicSalary = grossValue * 0.5; // 50% of gross
      const hra = basicSalary * 0.4; // 40% of basic
      const travelAllowances = basicSalary * 0.2; // 20% of basic
      const specialAllowances = basicSalary * 0.4; // 40% of basic
      
      setFormData(prev => ({
        ...prev,
        salary_details: {
          ...prev.salary_details,
          basic_salary: basicSalary.toString(),
          hra: hra.toString(),
          travel_allowances: travelAllowances.toString(),
          special_allowances: specialAllowances.toString()
        }
      }));
    }
  }, [validationErrors]);

  // Employee search functionality
  const fetchEmployeeData = useCallback(async (employeeId) => {
    if (!employeeId?.trim()) {
      setMessage({ type: 'error', text: 'Please enter an employee ID' });
      return;
    }

    setSearchingEmployee(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
        return;
      }

      // Use axios like other API calls in the codebase
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const { data: result } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/employee/get-employee-details/${employeeId}`,
        config
      );
        
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
        } else {
          setMessage({ type: 'error', text: 'Employee data not found' });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSearchingEmployee(false);
    }
  }, []);

  // Month options for dropdown
  const monthOptions = useMemo(() => [
    'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025',
    'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025',
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ], []);

  // Optimized calculations for display - moved before handleSubmit
  const { gross, deductions, net, dailyRate, adjustedSalary, calculatedComponents } = useMemo(() => {
    const grossValue = parseFloat(formData.salary_details.gross_salary) || 0;
    const deductionsValue = 
      (parseFloat(formData.salary_details.employee_pf) || 0) + 
      (parseFloat(formData.salary_details.employee_esi) || 0) + 
      (parseFloat(formData.salary_details.tds) || 0) + 
      (parseFloat(formData.salary_details.loan_advance) || 0) + 
      (parseFloat(formData.salary_details.penalty) || 0) + 
      (parseFloat(formData.salary_details.transport_or_others) || 0);
    
    // Calculate daily rate based on payable days
    const payableDays = parseFloat(formData.leave_summary.payable_days) || 0;
    const dailyRate = payableDays > 0 ? grossValue / payableDays : 0;
    
    // Calculate adjusted salary based on worked days (including half days)
    const workedDays = parseFloat(formData.leave_summary.workedDays) || 0;
    const adjustedSalary = dailyRate * workedDays;
    
    // Calculate salary components based on adjusted salary
    // Standard breakdown: Basic (50%), HRA (40% of Basic), Travel (20% of Basic), Special (40% of Basic)
    const basicSalary = adjustedSalary * 0.5; // 50% of adjusted salary
    const hra = basicSalary * 0.4; // 40% of basic
    const travelAllowances = basicSalary * 0.2; // 20% of basic
    const specialAllowances = basicSalary * 0.4; // 40% of basic
    
    const calculatedComponents = {
      basic_salary: basicSalary,
      hra: hra,
      travel_allowances: travelAllowances,
      special_allowances: specialAllowances
    };
    
    const netValue = adjustedSalary - deductionsValue;
    
    return {
      gross: grossValue,
      deductions: deductionsValue,
      net: netValue,
      dailyRate: dailyRate,
      adjustedSalary: adjustedSalary,
      calculatedComponents: calculatedComponents
    };
  }, [formData.salary_details, formData.leave_summary.payable_days, formData.leave_summary.workedDays]);

  // Auto-calculation is handled in useMemo and displayed in form fields
  // No useEffect needed to prevent infinite loops

  // Enhanced form submit handler with API integration
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the validation errors before submitting' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
        return;
      }

      // Prepare the data with calculated totals
      const submitData = {
        ...formData,
        salary_details: {
          ...formData.salary_details,
          fixed_gross_salary: formData.salary_details.gross_salary || gross.toString() || '0', // Add fixed_gross_salary field
          total_gross_salary: adjustedSalary.toString(),
          total_deduction: deductions.toString(),
          net_pay: net.toString()
        }
      };

      // Use axios like other API calls in the codebase
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const { data: result } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/save-salary-data`,
        submitData,
        config
      );

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
          EL: 0.0,
          CL: 0.0,
          ML: 0.0,
          D_EL: 0.0,
          D_CL: 0.0,
          D_ML: 0.0,
          regularisation: 0.0,
          shortLeave: 0.0,
          halfDay: 0.0,
            absent: 0.0,
          workedDays: 31.0,
          SD: 0.0
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
        setEmployeeSearchId('');
        setEmployeeData(null);
      setValidationErrors({});
    } catch (error) {
      console.error('Error submitting salary slip:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, gross, deductions, net, validateForm]);

  // Custom dropdown handlers
  const handleMonthSelect = useCallback((month) => {
    handleInputChange('main', 'pay_slip_month', month);
    setShowMonthDropdown(false);
  }, [handleInputChange]);

  const clearMonth = useCallback(() => {
    handleInputChange('main', 'pay_slip_month', '');
    setShowMonthDropdown(false);
  }, [handleInputChange]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation for dropdown
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowMonthDropdown(false);
    }
  }, []);

  // Clear employee data
  const clearEmployeeData = useCallback(() => {
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
        employee_aadhar: '',
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
    setMessage({ type: '', text: '' });
  }, []);

  // Preview handler
  const handlePreview = useCallback(() => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields before previewing' });
      return;
    }
    console.log('Form data being passed to preview:', formData);
    console.log('Gross salary from formData:', formData.salary_details.gross_salary);
    console.log('Calculated gross value:', gross);
    console.log('Complete salary_details:', formData.salary_details);
    console.log('Form data salary_details keys:', Object.keys(formData.salary_details));
    console.log('Does formData have gross_salary?', 'gross_salary' in formData.salary_details);
    console.log('Gross value being passed:', gross);
    console.log('Gross as string:', gross.toString());
    console.log('Form input gross_salary value:', formData.salary_details.gross_salary);
    console.log('Final gross_salary being passed:', formData.salary_details.gross_salary || gross.toString() || '0');
    
    // Debug the actual data being passed
    const debugData = {
      ...formData,
      salary_details: {
        ...formData.salary_details,
        gross_salary: formData.salary_details.gross_salary || gross.toString() || '0',
        fixed_gross_salary: formData.salary_details.gross_salary || gross.toString() || '0', // Same as gross_salary for now
        total_gross_salary: adjustedSalary.toString(),
        total_deduction: deductions.toString(),
        net_pay: net.toString()
      }
    };
    console.log('Debug data being passed to NewPaySlip:', debugData);
    console.log('Debug salary_details:', debugData.salary_details);
    console.log('Debug gross_salary in salary_details:', debugData.salary_details.gross_salary);
    
    // Create the actual data to pass
    const actualPayslipData = {
      ...formData,
      salary_details: {
        ...formData.salary_details,
        gross_salary: formData.salary_details.gross_salary || gross.toString() || '0',
        fixed_gross_salary: formData.salary_details.gross_salary || gross.toString() || '0', // Same as gross_salary for now
        total_gross_salary: adjustedSalary.toString(),
        total_deduction: deductions.toString(),
        net_pay: net.toString()
      }
    };
    
    console.log('Actual payslip data being passed:', actualPayslipData);
    console.log('Actual salary_details:', actualPayslipData.salary_details);
    console.log('Actual gross_salary:', actualPayslipData.salary_details.gross_salary);
    
    setShowPreview(true);
  }, [validateForm, formData]);

  return (
    <>
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
                      EL: 31.5,
                      CL: 0.0,
                      ML: 6.0,
                      D_EL: 0.0,
                      D_CL: 2.0,
                      D_ML: 0.0,
                      regularisation: 0.0,
                      shortLeave: 0.0,
                      halfDay: 11.0,
                      absent: 10.0,
                      workedDays: 7.5,
                      SD: 9.5
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
                  setMessage({ type: 'success', text: 'Demo data loaded successfully!' });
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
                  ref={searchInputRef}
                  type="text"
                  value={employeeSearchId}
                  onChange={(e) => setEmployeeSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchEmployeeData(employeeSearchId)}
                  placeholder="Enter Employee ID (e.g., 495)"
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.employee_search ? 'border-red-300' : 'border-gray-300'
                  }`}
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
                    onClick={clearEmployeeData}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap"
                  >
                    <FaTimes className="text-sm" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              {validationErrors.employee_search && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.employee_search}</p>
              )}
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 form-section">
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
                    type="button"
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    onKeyDown={handleKeyDown}
                    className={`flex items-center justify-between w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors duration-200 ${
                      formData.pay_slip_month 
                        ? 'border-green-300 bg-green-50 text-green-700' 
                        : 'border-gray-300 text-gray-700'
                    } ${validationErrors.pay_slip_month ? 'border-red-300' : ''}`}
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
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {monthOptions.map((month, index) => (
                          <button
                            key={index}
                            type="button"
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
                              }`}>
                                {formData.pay_slip_month === month && (
                                  <FaCheck className="w-2 h-2 text-green-500 m-0.5" />
                                )}
                              </div>
                              <span className="font-medium">{month}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {validationErrors.pay_slip_month && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.pay_slip_month}</p>
                )}
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 form-section">
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    validationErrors.employee_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.employee_name && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.employee_name}</p>
                )}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    validationErrors.employee_code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.employee_code && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.employee_code}</p>
                )}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    validationErrors.designation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.designation && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.designation}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Joining *
                </label>
                <input
                  type="date"
                  value={formData.employee_basic_details.date_of_joining}
                  onChange={(e) => handleInputChange('employee_basic_details', 'date_of_joining', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    validationErrors.date_of_joining ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.date_of_joining && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.date_of_joining}</p>
                )}
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 form-section">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Leave Summary</h2>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Leave Summary:</span> Enter the leave details for the selected month.
                <br />
                <span className="text-xs text-blue-600 mt-1 block">
                  Note: Salary will be calculated based on worked days (including half days like 20.5).
                </span>
              </p>
            </div>

            {/* Salary Calculation Summary */}
            {formData.salary_details.gross_salary && formData.leave_summary.payable_days && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">Salary Calculation Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-600 font-medium">Daily Rate</p>
                    <p className="text-lg font-bold text-green-800">₹{dailyRate.toFixed(2)}</p>
                    <p className="text-xs text-green-600">₹{parseFloat(formData.salary_details.gross_salary).toLocaleString()} ÷ {formData.leave_summary.payable_days} days</p>
                    </div>
                  <div className="text-center">
                    <p className="text-green-600 font-medium">Worked Days</p>
                    <p className="text-lg font-bold text-green-800">{formData.leave_summary.workedDays}</p>
                    <p className="text-xs text-green-600">Including half days (e.g., 20.5)</p>
                                </div>
                  <div className="text-center">
                    <p className="text-green-600 font-medium">Adjusted Gross</p>
                    <p className="text-lg font-bold text-green-800">₹{adjustedSalary.toFixed(2)}</p>
                    <p className="text-xs text-green-600">Daily Rate × Worked Days</p>
                              </div>
                                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center"
                  placeholder="31"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter the number of payable days
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 form-section">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                <FaCalculator className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Salary Details</h2>
            </div>
            
            {/* Salary Information */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Salary Information</h3>
              <div className="text-sm text-green-700">
                <p>Enter the salary details for the employee. All fields are manually editable.</p>
                <p className="text-xs text-green-600 mt-2">
                  <strong>Auto-calculation:</strong> Basic (50% of gross), HRA (40% of basic), Travel Allowances (20% of basic), and Special Allowances (40% of basic) are automatically calculated. You can still manually adjust these values if needed.
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    validationErrors.gross_salary ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.gross_salary && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.gross_salary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjusted Gross
                  <span className="text-xs text-green-600 ml-1">(Auto-calculated based on worked days)</span>
                </label>
                <input
                  type="number"
                  value={adjustedSalary.toFixed(2)}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-green-50 text-gray-700 cursor-not-allowed"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Based on {formData.leave_summary.workedDays} worked days
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Salary
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated: 50% of gross)</span>
                </label>
                <input
                  type="number"
                  value={calculatedComponents?.basic_salary?.toFixed(2) || formData.salary_details.basic_salary}
                  onChange={(e) => handleInputChange('salary_details', 'basic_salary', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-blue-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HRA
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated: 40% of basic)</span>
                </label>
                <input
                  type="number"
                  value={calculatedComponents?.hra?.toFixed(2) || formData.salary_details.hra}
                  onChange={(e) => handleInputChange('salary_details', 'hra', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-blue-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Allowances
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated: 20% of basic)</span>
                </label>
                <input
                  type="number"
                  value={calculatedComponents?.travel_allowances?.toFixed(2) || formData.salary_details.travel_allowances}
                  onChange={(e) => handleInputChange('salary_details', 'travel_allowances', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-blue-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Allowances
                  <span className="text-xs text-blue-600 ml-1">(Auto-calculated: 40% of basic)</span>
                </label>
                <input
                  type="number"
                  value={calculatedComponents?.special_allowances?.toFixed(2) || formData.salary_details.special_allowances}
                  onChange={(e) => handleInputChange('salary_details', 'special_allowances', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-blue-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
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
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg border border-green-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                <FaCalculator className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Salary Summary</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Original Gross</h3>
                <p className="text-2xl font-bold text-gray-600">₹{gross.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Monthly salary</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Adjusted Gross</h3>
                <p className="text-2xl font-bold text-green-600">₹{adjustedSalary.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Based on {formData.leave_summary.workedDays} worked days</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Deductions</h3>
                <p className="text-2xl font-bold text-red-600">₹{deductions.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">PF, ESI, TDS, etc.</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Net Pay</h3>
                <p className="text-2xl font-bold text-blue-600">₹{net.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Final take-home amount</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handlePreview}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
            >
              <FaEye className="text-xl" />
              <span>Preview Payslip</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-xl" />
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

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Payslip Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <NewPaySlip 
                setPayslipModel={setShowPreview} 
                payslipModelData={{
                  ...formData,
                  salary_details: {
                    ...formData.salary_details,
                    gross_salary: formData.salary_details.fixed_gross_salary || formData.salary_details.gross_salary || gross.toString() || '0',
                    total_gross_salary: adjustedSalary.toString(),
                    total_deduction: deductions.toString(),
                    net_pay: net.toString()
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateSalarySlip;


