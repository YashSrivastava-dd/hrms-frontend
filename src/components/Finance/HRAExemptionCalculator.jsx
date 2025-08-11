import React, { useState } from 'react';
import { FaCalculator, FaInfoCircle, FaHome, FaCity, FaMoneyBillWave } from 'react-icons/fa';

const HRAExemptionCalculator = () => {
  const [formData, setFormData] = useState({
    basicSalary: '',
    hraReceived: '',
    rentPaid: '',
    isMetro: false
  });

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  /**
   * Calculates HRA exemption as per Section 10(13A) of the Indian Income Tax Act
   * @param {number} basicSalary - Monthly basic salary
   * @param {number} hraReceived - Monthly HRA received
   * @param {number} rentPaid - Monthly rent paid
   * @param {boolean} isMetro - Whether living in metro city (true) or non-metro (false)
   * @returns {Object} Object containing all calculated values and final exemption
   */
  const calculateHRAExemption = (basicSalary, hraReceived, rentPaid, isMetro) => {
    // Convert monthly values to annual
    const annualBasicSalary = basicSalary * 12;
    const annualHRAReceived = hraReceived * 12;
    const annualRentPaid = rentPaid * 12;

    // Step 1: Actual HRA received annually
    const actualHRAReceived = annualHRAReceived;

    // Step 2: 50% of basic salary for metro cities, 40% for non-metro cities
    const metroPercentage = isMetro ? 0.5 : 0.4;
    const percentOfBasic = metroPercentage * annualBasicSalary;

    // Step 3: Rent paid minus 10% of basic salary
    const tenPercentOfBasic = 0.1 * annualBasicSalary;
    const rentMinusTenPercentBasic = annualRentPaid - tenPercentOfBasic;

    // Step 4: HRA exemption is the minimum of the three values, but not less than 0
    const hraExemption = Math.max(0, Math.min(actualHRAReceived, percentOfBasic, rentMinusTenPercentBasic));

    return {
      actualHRAReceived,
      percentOfBasic,
      rentMinusTenPercentBasic,
      hraExemption,
      // Additional details for better understanding
      annualBasicSalary,
      annualHRAReceived,
      annualRentPaid,
      tenPercentOfBasic,
      metroPercentage: metroPercentage * 100
    };
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!formData.basicSalary || formData.basicSalary <= 0) {
      newErrors.basicSalary = 'Basic salary must be greater than 0';
    }
    
    if (!formData.hraReceived || formData.hraReceived < 0) {
      newErrors.hraReceived = 'HRA received cannot be negative';
    }
    
    if (!formData.rentPaid || formData.rentPaid < 0) {
      newErrors.rentPaid = 'Rent paid cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (validateInputs()) {
      const calculation = calculateHRAExemption(
        parseFloat(formData.basicSalary),
        parseFloat(formData.hraReceived),
        parseFloat(formData.rentPaid),
        formData.isMetro
      );
      setResult(calculation);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      basicSalary: '',
      hraReceived: '',
      rentPaid: '',
      isMetro: false
    });
    setResult(null);
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaHome className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">HRA Exemption Calculator</h1>
        <p className="text-gray-600">Calculate HRA exemption as per Section 10(13A) of the Indian Income Tax Act</p>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h3 className="font-semibold mb-2">How HRA Exemption is Calculated:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Actual HRA Received:</strong> Total HRA received annually</li>
              <li><strong>50% of Basic Salary:</strong> For metro cities (Delhi, Mumbai, Kolkata, Chennai)</li>
              <li><strong>40% of Basic Salary:</strong> For non-metro cities</li>
              <li><strong>Rent Paid - 10% of Basic:</strong> Actual rent paid minus 10% of basic salary</li>
              <li><strong>Final Exemption:</strong> Minimum of the above three values</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaCalculator className="w-5 h-5 mr-2 text-green-500" />
          Enter Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Basic Salary *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleInputChange}
                placeholder="25000"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  errors.basicSalary ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.basicSalary && (
              <p className="text-red-600 text-sm mt-1">{errors.basicSalary}</p>
            )}
          </div>

          {/* HRA Received */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly HRA Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="hraReceived"
                value={formData.hraReceived}
                onChange={handleInputChange}
                placeholder="12000"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  errors.hraReceived ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.hraReceived && (
              <p className="text-red-600 text-sm mt-1">{errors.hraReceived}</p>
            )}
          </div>

          {/* Rent Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Rent Paid
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="rentPaid"
                value={formData.rentPaid}
                onChange={handleInputChange}
                placeholder="15000"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  errors.rentPaid ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.rentPaid && (
              <p className="text-red-600 text-sm mt-1">{errors.rentPaid}</p>
            )}
          </div>

          {/* Metro City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City Type
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isMetro"
                  checked={formData.isMetro === true}
                  onChange={() => setFormData(prev => ({ ...prev, isMetro: true }))}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Metro City (50%)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isMetro"
                  checked={formData.isMetro === false}
                  onChange={() => setFormData(prev => ({ ...prev, isMetro: false }))}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Non-Metro (40%)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Metro cities: Delhi, Mumbai, Kolkata, Chennai
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Calculate HRA Exemption
          </button>
          <button
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaMoneyBillWave className="w-5 h-5 mr-2 text-green-500" />
            Calculation Results
          </h2>

          {/* Final Result */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-green-800 mb-2">HRA Exemption Amount</h3>
              <p className="text-4xl font-bold text-green-600">{formatCurrency(result.hraExemption)}</p>
              <p className="text-sm text-green-700 mt-1">per annum</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Annual Calculations</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Basic Salary (Annual)</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(result.annualBasicSalary)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">HRA Received (Annual)</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(result.annualHRAReceived)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Rent Paid (Annual)</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(result.annualRentPaid)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Exemption Components</h3>
              
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blue-700">1. Actual HRA Received</span>
                    <span className="text-sm font-semibold text-blue-800">{formatCurrency(result.actualHRAReceived)}</span>
                  </div>
                  <p className="text-xs text-blue-600">Total HRA received annually</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-purple-700">2. {result.metroPercentage}% of Basic</span>
                    <span className="text-sm font-semibold text-purple-800">{formatCurrency(result.percentOfBasic)}</span>
                  </div>
                  <p className="text-xs text-purple-600">{formData.isMetro ? 'Metro city' : 'Non-metro city'} calculation</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-orange-700">3. Rent - 10% of Basic</span>
                    <span className="text-sm font-semibold text-orange-800">{formatCurrency(result.rentMinusTenPercentBasic)}</span>
                  </div>
                  <p className="text-xs text-orange-600">Rent paid minus 10% of basic salary</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Savings Info */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <FaInfoCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <h4 className="font-semibold mb-1">Tax Savings Information:</h4>
                <p>With an HRA exemption of {formatCurrency(result.hraExemption)} per annum, you can save up to {formatCurrency(result.hraExemption * 0.3)} in taxes (assuming 30% tax bracket).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAExemptionCalculator;
