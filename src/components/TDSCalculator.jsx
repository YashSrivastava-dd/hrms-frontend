import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

const TDSCalculator = () => {
  const [regime, setRegime] = useState('old');
  const [incomeType, setIncomeType] = useState('annual');
  const [salary, setSalary] = useState('');
  const [incomeOther, setIncomeOther] = useState('');
  const [grossIncome, setGrossIncome] = useState('');
  const [result, setResult] = useState('');
  const [showHRA, setShowHRA] = useState(false);

  // Variable monthly salary fields
  const [salaryMode, setSalaryMode] = useState('single'); // 'single' or 'variable'
  const [salary1, setSalary1] = useState('');
  const [months1, setMonths1] = useState('');
  const [salary2, setSalary2] = useState('');
  const [months2, setMonths2] = useState('');

  // Custom dropdown state
  const [showIncomeTypeDropdown, setShowIncomeTypeDropdown] = useState(false);

  // Old regime deductions
  const [ded80c, setDed80c] = useState('');
  const [ded80ccc, setDed80ccc] = useState('');
  const [ded80ccd1b, setDed80ccd1b] = useState('');
  const [ded80dSelf, setDed80dSelf] = useState('');
  const [ded80dParents, setDed80dParents] = useState('');
  const [ded80g, setDed80g] = useState('');
  const [ded80tta, setDed80tta] = useState('');
  const [dedHomeLoan, setDedHomeLoan] = useState('');

  // HRA fields
  const [hraRent, setHraRent] = useState('');
  const [hraReceived, setHraReceived] = useState('');
  const [hraBasic, setHraBasic] = useState('');
  const [hraCity, setHraCity] = useState('metro');

  // New regime deductions
  const [dedNps, setDedNps] = useState('');

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showIncomeTypeDropdown && !event.target.closest('.income-type-dropdown')) {
        setShowIncomeTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIncomeTypeDropdown]);

  // Update gross income when salary or other income changes
  useEffect(() => {
    let salaryValue = 0;
    const otherValue = parseFloat(incomeOther) || 0;
    
    if (incomeType === 'monthly') {
      if (salaryMode === 'single') {
        salaryValue = (parseFloat(salary) || 0) * 12;
      } else {
        // Variable salary calculation
        const salary1Value = parseFloat(salary1) || 0;
        const months1Value = parseInt(months1) || 0;
        const salary2Value = parseFloat(salary2) || 0;
        const months2Value = parseInt(months2) || 0;
        
        salaryValue = (salary1Value * months1Value) + (salary2Value * months2Value);
      }
    } else {
      salaryValue = parseFloat(salary) || 0;
    }
    
    const total = salaryValue + otherValue;
    setGrossIncome(total.toString());
  }, [salary, incomeOther, incomeType, salaryMode, salary1, months1, salary2, months2]);

  // Validation for variable salary periods
  const getValidationMessage = () => {
    if (incomeType === 'monthly' && salaryMode === 'variable') {
      const months1Value = parseInt(months1) || 0;
      const months2Value = parseInt(months2) || 0;
      const totalMonths = months1Value + months2Value;
      
      if (totalMonths > 12) {
        return "Total months cannot exceed 12";
      } else if (totalMonths < 12 && (months1Value > 0 || months2Value > 0)) {
        return `Total months: ${totalMonths}/12 (${12 - totalMonths} months remaining)`;
      } else if (totalMonths === 12) {
        return "✓ Total months: 12/12 (Complete)";
      }
    }
    return null;
  };

  const calculateTDS = () => {
    const mode = incomeType;
    let salaryValue = 0;
    let salaryBreakdown = '';

    if (mode === 'monthly') {
      if (salaryMode === 'single') {
        salaryValue = (parseFloat(salary) || 0) * 12;
        salaryBreakdown = `Monthly Salary: ₹${parseFloat(salary || 0).toLocaleString()} × 12 months = ₹${salaryValue.toLocaleString()}`;
      } else {
        // Variable salary calculation
        const salary1Value = parseFloat(salary1) || 0;
        const months1Value = parseInt(months1) || 0;
        const salary2Value = parseFloat(salary2) || 0;
        const months2Value = parseInt(months2) || 0;
        
        const totalBeforeChange = salary1Value * months1Value;
        const totalAfterChange = salary2Value * months2Value;
        salaryValue = totalBeforeChange + totalAfterChange;
        
        salaryBreakdown = `
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>First Period:</span>
              <span>₹${salary1Value.toLocaleString()} × ${months1Value} months = ₹${totalBeforeChange.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span>Second Period:</span>
              <span>₹${salary2Value.toLocaleString()} × ${months2Value} months = ₹${totalAfterChange.toLocaleString()}</span>
            </div>
            <div class="border-t pt-2 mt-2">
              <div class="flex justify-between font-semibold text-lg">
                <span>Annual Salary Total:</span>
                <span class="text-blue-600">₹${salaryValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      salaryValue = parseFloat(salary) || 0;
      salaryBreakdown = `Annual Salary: ₹${salaryValue.toLocaleString()}`;
    }

    let incomeOtherValue = parseFloat(incomeOther) || 0;
    incomeOtherValue = mode === 'monthly' ? incomeOtherValue * 12 : incomeOtherValue;

    let grossIncome = salaryValue;
    let totalIncome = salaryValue + incomeOtherValue;
    let taxableIncome = totalIncome;
    let standardDeduction = (regime === 'new_25_26') ? 75000 : 50000;
    taxableIncome -= standardDeduction;

    let deductions = 0;
    if (regime === 'old') {
      const ded80cValue = Math.min(parseFloat(ded80c) || 0, 150000);
      const ded80cccValue = parseFloat(ded80ccc) || 0;
      const ded80ccd1bValue = Math.min(parseFloat(ded80ccd1b) || 0, 50000);
      const ded80dSelfValue = Math.min(parseFloat(ded80dSelf) || 0, 25000);
      const ded80dParentsValue = Math.min(parseFloat(ded80dParents) || 0, 25000);
      const ded80dValue = ded80dSelfValue + ded80dParentsValue;
      const ded80gValue = parseFloat(ded80g) || 0;
      const dedHomeValue = Math.min(parseFloat(dedHomeLoan) || 0, 200000);

      const hraRentValue = parseFloat(hraRent) || 0;
      const hraReceivedValue = parseFloat(hraReceived) || 0;
      const hraBasicValue = parseFloat(hraBasic) || 0;
      const percent = hraCity === 'metro' ? 0.5 : 0.4;
      const hraExempt = Math.min(hraReceivedValue, percent * hraBasicValue, hraRentValue - 0.1 * hraBasicValue);

      deductions = ded80cValue + ded80cccValue + ded80ccd1bValue + ded80dValue + ded80gValue + dedHomeValue + Math.max(hraExempt, 0);
      taxableIncome -= deductions;
    } else if (regime.startsWith('new')) {
      const dedNpsValue = parseFloat(dedNps) || 0;
      deductions = dedNpsValue;
      taxableIncome -= deductions;
    }

    taxableIncome = Math.max(0, taxableIncome);
    let tax = 0;
    let originalTI = taxableIncome;

    if (regime === 'old') {
      if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
      if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.2;
      if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.3;
    } else if (regime === 'new_24_25') {
      const slabs = [300000, 600000, 900000, 1200000, 1500000];
      const rates = [0, 0.05, 0.1, 0.15, 0.2, 0.3];
      for (let i = slabs.length - 1; i >= 0; i--) {
        if (taxableIncome > slabs[i]) {
          tax += (taxableIncome - slabs[i]) * rates[i + 1];
          taxableIncome = slabs[i];
        }
      }
    } else if (regime === 'new_25_26') {
      const slabs = [400000, 800000, 1200000, 1600000, 2000000, 2400000];
      const rates = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
      for (let i = slabs.length - 1; i >= 0; i--) {
        if (taxableIncome > slabs[i]) {
          tax += (taxableIncome - slabs[i]) * rates[i + 1];
          taxableIncome = slabs[i];
        }
      }
    }

    tax += tax * 0.04;
    
    const resultText = `
      <div class="mb-4">
        <h4 class="font-semibold text-gray-800 mb-2">Salary Breakdown:</h4>
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
          ${salaryBreakdown}
        </div>
      </div>
      Gross Income: ₹${grossIncome.toLocaleString()}<br>
      ${incomeOtherValue > 0 ? `Income from Other Sources: ₹${incomeOtherValue.toLocaleString()}<br>` : ''}
      Total Income: ₹${totalIncome.toLocaleString()}<br>
      Standard Deduction Applied: ₹${standardDeduction.toLocaleString()}<br>
      Other Deductions (incl. HRA): ₹${deductions.toLocaleString()}<br>
      Salary After Deductions: ₹${originalTI.toLocaleString()}<br>
      Annual Tax Payable: ₹${Math.round(tax).toLocaleString()}<br>
      Monthly TDS: ₹${Math.round(tax / 12).toLocaleString()}
    `;
    
    setResult(resultText);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">TDS Calculator</h1>
                <p className="text-gray-700">Income Tax TDS Calculator (FY 2024-25 / 2025-26)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Regime:</label>
              <select 
                value={regime} 
                onChange={(e) => setRegime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="old">Old Tax Regime</option>
                <option value="new_25_26">New Tax Regime (FY 2025-26)</option>
              </select>
            </div>

            <div className="relative income-type-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-2">Income Type:</label>
              <button
                onClick={() => setShowIncomeTypeDropdown(!showIncomeTypeDropdown)}
                className={`flex items-center justify-between w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 ${
                  incomeType 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-gray-700">
                  {incomeType === 'monthly' ? 'Monthly' : incomeType === 'annual' ? 'Annual' : 'Select Income Type'}
                </span>
                <div className="flex items-center space-x-2">
                  <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    showIncomeTypeDropdown ? 'rotate-180' : ''
                  } ${incomeType ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
              </button>

              {showIncomeTypeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 income-type-dropdown transition-all duration-200 ease-in-out">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIncomeType('annual');
                        setShowIncomeTypeDropdown(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        incomeType === 'annual'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          incomeType === 'annual' ? 'border-white bg-white' : 'border-gray-300'
                        }`}></div>
                        <div>
                          <span className="font-medium">Annual</span>
                          <p className="text-xs opacity-75">Enter your annual salary</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIncomeType('monthly');
                        setShowIncomeTypeDropdown(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                        incomeType === 'monthly'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          incomeType === 'monthly' ? 'border-white bg-white' : 'border-gray-300'
                        }`}></div>
                        <div>
                          <span className="font-medium">Monthly</span>
                          <p className="text-xs opacity-75">Enter your monthly salary</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Income Details */}
          {incomeType === 'monthly' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Mode:</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value="single"
                    checked={salaryMode === 'single'}
                    onChange={(e) => setSalaryMode(e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Single monthly salary for all months</span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value="variable"
                    checked={salaryMode === 'variable'}
                    onChange={(e) => setSalaryMode(e.target.value)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Variable monthly salary periods</span>
                </label>
              </div>
            </div>
          )}

          {incomeType === 'monthly' && salaryMode === 'single' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Monthly Salary (₹):
                </label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 117500"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income from Other Sources (₹):
                </label>
                <input 
                  type="number" 
                  value={incomeOther}
                  onChange={(e) => setIncomeOther(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gross Total Income (₹):
                </label>
                <input 
                  type="number" 
                  value={grossIncome}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          )}

          {incomeType === 'monthly' && salaryMode === 'variable' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variable Monthly Salary Periods</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-800 mb-3">First Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Salary (₹):
                      </label>
                      <input 
                        type="number" 
                        value={salary1}
                        onChange={(e) => setSalary1(e.target.value)}
                        placeholder="e.g. 100000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Months (1-11):
                      </label>
                      <input 
                        type="number" 
                        value={months1}
                        onChange={(e) => setMonths1(e.target.value)}
                        min="1"
                        max="11"
                        placeholder="e.g. 6"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-gray-800 mb-3">Second Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Salary (₹):
                      </label>
                      <input 
                        type="number" 
                        value={salary2}
                        onChange={(e) => setSalary2(e.target.value)}
                        placeholder="e.g. 120000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Months:
                      </label>
                      <input 
                        type="number" 
                        value={months2}
                        onChange={(e) => setMonths2(e.target.value)}
                        min="1"
                        max="12"
                        placeholder="e.g. 6"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Message */}
              {getValidationMessage() && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  getValidationMessage().includes('✓') 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : getValidationMessage().includes('cannot exceed') 
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                }`}>
                  <div className="flex items-center">
                    {getValidationMessage().includes('✓') && (
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{getValidationMessage()}</span>
                  </div>
                </div>
              )}

              {/* Period Totals */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Period Totals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">First Period Total:</span>
                      <span className="text-lg font-bold text-blue-700">
                        ₹{((parseFloat(salary1) || 0) * (parseInt(months1) || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ₹{(parseFloat(salary1) || 0).toLocaleString()} × {(parseInt(months1) || 0)} months
                    </div>
                  </div>
                  
                  <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Second Period Total:</span>
                      <span className="text-lg font-bold text-green-700">
                        ₹{((parseFloat(salary2) || 0) * (parseInt(months2) || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ₹{(parseFloat(salary2) || 0).toLocaleString()} × {(parseInt(months2) || 0)} months
                    </div>
                  </div>
                </div>
                
                {/* Annual Total */}
                <div className="mt-4 bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-lg border border-blue-400">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Annual Salary Total:</span>
                    <span className="text-xl font-bold text-white">
                      ₹{(((parseFloat(salary1) || 0) * (parseInt(months1) || 0)) + ((parseFloat(salary2) || 0) * (parseInt(months2) || 0))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income from Other Sources (₹):
                  </label>
                  <input 
                    type="number" 
                    value={incomeOther}
                    onChange={(e) => setIncomeOther(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Total Income (₹):
                  </label>
                  <input 
                    type="number" 
                    value={grossIncome}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {incomeType === 'annual' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Annual Salary (₹):
                </label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 1410000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income from Other Sources (₹):
                </label>
                <input 
                  type="number" 
                  value={incomeOther}
                  onChange={(e) => setIncomeOther(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gross Total Income (₹):
                </label>
                <input 
                  type="number" 
                  value={grossIncome}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Old Regime Fields */}
          {regime === 'old' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Old Regime: Deductions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80C (PF, LIC, ELSS etc.)</label>
                  <p className="text-xs text-gray-500 mb-2">Maximum exemption: ₹1,50,000. Includes EPF, NSC, tax-saving FDs, tuition fees for children, home loan principal repayment.</p>
                  <input 
                    type="number" 
                    value={ded80c}
                    onChange={(e) => setDed80c(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80CCC (Pension Funds)</label>
                  <p className="text-xs text-gray-500 mb-2">Included in 80C cap of ₹1,50,000. Contribution to annuity plans of LIC or other insurer for receiving pension.</p>
                  <input 
                    type="number" 
                    value={ded80ccc}
                    onChange={(e) => setDed80ccc(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80CCD(1B) (NPS Self Contribution)</label>
                  <p className="text-xs text-gray-500 mb-2">Additional deduction up to ₹50,000 over and above 80C limit. Applicable only for National Pension Scheme (NPS).</p>
                  <input 
                    type="number" 
                    value={ded80ccd1b}
                    onChange={(e) => setDed80ccd1b(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80D (Health Insurance - Self)</label>
                  <p className="text-xs text-gray-500 mb-2">Up to ₹25,000. Preventive health check-up: within limit.</p>
                  <input 
                    type="number" 
                    value={ded80dSelf}
                    onChange={(e) => setDed80dSelf(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80D (Health Insurance - Parents)</label>
                  <p className="text-xs text-gray-500 mb-2">Up to ₹50,000 if senior citizen. Preventive health check-up: within limit.</p>
                  <input 
                    type="number" 
                    value={ded80dParents}
                    onChange={(e) => setDed80dParents(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80G (Donations)</label>
                  <p className="text-xs text-gray-500 mb-2">50% or 100% exemption with or without qualifying limit, depending on type of institution. Donation receipt is required.</p>
                  <input 
                    type="number" 
                    value={ded80g}
                    onChange={(e) => setDed80g(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">80TTA (Interest on Savings Account)</label>
                  <p className="text-xs text-gray-500 mb-2">Available to individuals (not senior citizens) and HUFs. Deduction up to ₹10,000 on interest earned from savings accounts in banks, post offices, or cooperative societies.</p>
                  <input 
                    type="number" 
                    value={ded80tta}
                    onChange={(e) => setDed80tta(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Loan Interest (Sec 24b)</label>
                  <p className="text-xs text-gray-500 mb-2">Up to ₹2,00,000 interest exemption on home loan for self-occupied property under section 24(b).</p>
                  <input 
                    type="number" 
                    value={dedHomeLoan}
                    onChange={(e) => setDedHomeLoan(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* HRA Calculation Section */}
              <div className="mt-6">
                <button 
                  onClick={() => setShowHRA(!showHRA)}
                  className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  {showHRA ? '▼' : '▶'} HRA Calculation
                </button>
                
                {showHRA && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Rent Paid</label>
                        <input 
                          type="number" 
                          value={hraRent}
                          onChange={(e) => setHraRent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">HRA Received</label>
                        <input 
                          type="number" 
                          value={hraReceived}
                          onChange={(e) => setHraReceived(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                        <p className="text-xs text-gray-500 mb-2">Least of: Actual HRA received, 50% of salary for metro cities (40% non-metro), or rent paid minus 10% of salary.</p>
                        <input 
                          type="number" 
                          value={hraBasic}
                          onChange={(e) => setHraBasic(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City Type</label>
                        <select 
                          value={hraCity}
                          onChange={(e) => setHraCity(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="metro">Metro</option>
                          <option value="non_metro">Non-Metro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Regime Fields */}
          {regime.startsWith('new') && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Regime: Permissible Deductions</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employer NPS Contribution (80CCD(2))</label>
                <input 
                  type="number" 
                  value={dedNps}
                  onChange={(e) => setDedNps(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <div className="mt-6">
            <button 
              onClick={calculateTDS}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-lg"
            >
              Compute TDS
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Result:</h3>
              <div 
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                dangerouslySetInnerHTML={{ __html: result }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TDSCalculator;
