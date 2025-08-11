import React, { useState, useEffect, useRef } from 'react';
import { FaSave, FaChevronDown, FaTimes } from 'react-icons/fa';

const DeclarationForm = () => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    // Personal Details
    employeeName: '',
    designation: '',
    dateOfJoining: '',
    gender: '',
    pan: '',
    contactNo: '',
    newTaxRegime: '',
    
    // Address Details
    residentialAddress: '',
    rentPerMonth: '',
    rentStartDate: '',
    rentChanges: '',
    rentedPropertyAddress: '',
    landlordPAN: '',
    
    // Deductions
    pensionFunds: [],
    medicalInsurance: [],
    handicappedDependent: '',
    medicalTreatment: '',
    educationLoan: [],
    lifeInsurance: [],
    pfContribution: '',
    fdr5Year: '',
    ppfDeposits: [],
    nscPurchased: [],
    infrastructureBonds: [],
    schoolTuitionFees: [],
    npsInvestment: '',
    section80G: '',
    
    // Housing Loan
    bankName: '',
    loanDates: '',
    interestAmount: '',
    principalAmount: '',
    possessionDate: '',
    
    // Signature
    signature: '',
    name: '',
    designation: ''
  });

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showTaxRegimeDropdown, setShowTaxRegimeDropdown] = useState(false);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGenderDropdown && !event.target.closest('.gender-dropdown')) {
        setShowGenderDropdown(false);
      }
      if (showTaxRegimeDropdown && !event.target.closest('.tax-regime-dropdown')) {
        setShowTaxRegimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGenderDropdown, showTaxRegimeDropdown]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Custom Gender Dropdown Component
  const CustomGenderDropdown = () => {
    const handleGenderSelect = (gender) => {
      handleInputChange('gender', gender);
      setShowGenderDropdown(false);
    };

    const clearGender = () => {
      handleInputChange('gender', '');
      setShowGenderDropdown(false);
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowGenderDropdown(!showGenderDropdown)}
          className={`flex items-center justify-between w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 ${
            formData.gender 
              ? 'border-blue-300 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700'
          }`}
        >
          <span className="text-gray-700">
            {formData.gender || "Select Gender"}
          </span>
          <div className="flex items-center space-x-2">
            {formData.gender && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearGender();
                }}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors duration-200"
              >
                <FaTimes className="w-3 h-3 text-blue-500" />
              </button>
            )}
            <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
              showGenderDropdown ? 'rotate-180' : ''
            } ${formData.gender ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        </button>

        {showGenderDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 gender-dropdown transition-all duration-200 ease-in-out">
            <div className="p-2">
              <button
                onClick={() => handleGenderSelect('Male')}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  formData.gender === 'Male'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.gender === 'Male' ? 'border-white bg-white' : 'border-gray-300'
                  }`}></div>
                  <span className="font-medium">Male</span>
                </div>
              </button>
              
              <button
                onClick={() => handleGenderSelect('Female')}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                  formData.gender === 'Female'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.gender === 'Female' ? 'border-white bg-white' : 'border-gray-300'
                  }`}></div>
                  <span className="font-medium">Female</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Custom Tax Regime Dropdown Component
  const CustomTaxRegimeDropdown = () => {
    const handleTaxRegimeSelect = (regime) => {
      handleInputChange('newTaxRegime', regime);
      setShowTaxRegimeDropdown(false);
    };

    const clearTaxRegime = () => {
      handleInputChange('newTaxRegime', '');
      setShowTaxRegimeDropdown(false);
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowTaxRegimeDropdown(!showTaxRegimeDropdown)}
          className={`flex items-center justify-between w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 ${
            formData.newTaxRegime 
              ? 'border-blue-300 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700'
          }`}
        >
          <span className="text-gray-700">
            {formData.newTaxRegime || "Select Option"}
          </span>
          <div className="flex items-center space-x-2">
            {formData.newTaxRegime && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearTaxRegime();
                }}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors duration-200"
              >
                <FaTimes className="w-3 h-3 text-blue-500" />
              </button>
            )}
            <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
              showTaxRegimeDropdown ? 'rotate-180' : ''
            } ${formData.newTaxRegime ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        </button>

        {showTaxRegimeDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 tax-regime-dropdown transition-all duration-200 ease-in-out">
            <div className="p-2">
              <button
                onClick={() => handleTaxRegimeSelect('Yes')}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  formData.newTaxRegime === 'Yes'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.newTaxRegime === 'Yes' ? 'border-white bg-white' : 'border-gray-300'
                  }`}></div>
                  <div>
                    <span className="font-medium">Yes</span>
                    <p className="text-xs opacity-75">New Tax Regime (Default Scheme)</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleTaxRegimeSelect('No')}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                  formData.newTaxRegime === 'No'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.newTaxRegime === 'No' ? 'border-white bg-white' : 'border-gray-300'
                  }`}></div>
                  <div>
                    <span className="font-medium">No</span>
                    <p className="text-xs opacity-75">Old Tax Regime (With Deductions)</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


    const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <div className="full-height-content bg-gray-50 py-8">
      <div ref={formRef} className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">D&D Healthcare</h1>
            <p className="text-xl">INCOME TAX INVESTMENT DECLARATION FOR THE FY 2025-26</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Tax Regime Selection - Always Visible */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Tax Regime Selection</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Whether want to opt for New Tax Regime (Default Scheme) - (Yes or No) *
                </label>
                <CustomTaxRegimeDropdown />
                {formData.newTaxRegime === "Yes" && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      ℹ️ New Tax Regime Selected:
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Under the New Tax Regime, most deductions are not applicable. Sections 5 (Deductions from Gross Income) and 6 (Housing Loan Details) have been hidden as they are not relevant for the New Tax Regime. You can proceed directly to the signature section.
                    </p>
                  </div>
                )}
                {formData.newTaxRegime === "No" && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Old Tax Regime Selected:
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Under the Old Tax Regime, you can claim various deductions under Sections 5 and 6. Please fill in all applicable deduction details to optimize your tax savings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rest of the form - Show all sections by default */}
          <>
            {/* Section 1: Personal & Company Details */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6">1. Personal & Company Details</h2>
              
              <div className="space-y-6">
                {/* Employee Details */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">1.a NAME AND DESIGNATION OF THE EMPLOYEE WITH DATE OF JOINING THE COMPANY</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name *
                      </label>
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) => handleInputChange('employeeName', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="Enter employee name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="Enter designation"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Joining *
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfJoining}
                        onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Gender Selection */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">1.b Gender</h3>
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender (Male/Female) *
                    </label>
                    <CustomGenderDropdown />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: PAN */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6">2. PERMANENT ACCOUNT NO. (PAN)</h2>
              <div className="text-sm text-gray-600 mb-2">(See Note-1)</div>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleInputChange('pan', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter PAN Number"
                maxLength="10"
              />
            </div>

            {/* Section 3: Contact Information */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6">3. Contact Information</h2>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactNo}
                    onChange={(e) => handleInputChange('contactNo', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Residential Address & Rent */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6">4. Residential Address & Rent Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4.a RESIDENTIAL ADDRESS (See Note 6)
                  </label>
                  <textarea
                    value={formData.residentialAddress}
                    onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter residential address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    b) If taken on rent, Please provide:
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={formData.rentPerMonth}
                      onChange={(e) => handleInputChange('rentPerMonth', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rent payable per month"
                    />
                    
                    <input
                      type="date"
                      value={formData.rentStartDate}
                      onChange={(e) => handleInputChange('rentStartDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Starting Date"
                    />
                    
                    <input
                      type="text"
                      value={formData.rentChanges}
                      onChange={(e) => handleInputChange('rentChanges', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Changes in rent amount, if any"
                    />
                    
                    <input
                      type="text"
                      value={formData.landlordPAN}
                      onChange={(e) => handleInputChange('landlordPAN', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="PAN OF OWNER (Mandatory if Monthly Rent > Rs 8333.00)"
                    />
                  </div>
                  
                  <textarea
                    value={formData.rentedPropertyAddress}
                    onChange={(e) => handleInputChange('rentedPropertyAddress', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                    rows="2"
                    placeholder="Complete Address of Rented Property"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Deductions */}
            {formData.newTaxRegime !== "Yes" && (
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 mb-6">5. DEDUCTION FROM GROSS INCOME</h2>
                
                {/* Pension Funds */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">a) U/s 80 CCC - Cont. to certain Pension Funds (LIC etc.)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                                       <thead>
                       <tr className="bg-gray-50">
                         <th className="border border-gray-300 p-2 text-left">S. No.</th>
                         <th className="border border-gray-300 p-2 text-left">Particulars</th>
                         <th className="border border-gray-300 p-2 text-left">Amount (Rs.) (Annual)</th>
                         <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                       </tr>
                     </thead>
                    <tbody>
                                         {formData.pensionFunds.map((item, index) => (
                       <tr key={index}>
                         <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                         <td className="border border-gray-300 p-2">
                           <input
                             type="text"
                             value={item}
                             onChange={(e) => handleArrayInputChange('pensionFunds', index, e.target.value)}
                             className="w-full p-1 border-none focus:ring-0"
                             placeholder="Enter particulars"
                           />
                         </td>
                         <td className="border border-gray-300 p-2">
                           <input
                             type="number"
                             className="w-full p-1 border-none focus:ring-0"
                             placeholder="Amount"
                           />
                         </td>
                         <td className="border border-gray-300 p-2 w-12">
                           <button
                             type="button"
                             onClick={() => removeArrayItem('pensionFunds', index)}
                             className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                           >
                             ×
                           </button>
                         </td>
                       </tr>
                     ))}
                    <tr>
                      <td className="border border-gray-300 p-2 font-semibold">Total</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          className="w-full p-1 border-none focus:ring-0 font-semibold"
                          placeholder="Total Amount"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addArrayItem('pensionFunds')}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Add Row
                </button>
              </div>
            </div>

            {/* Medical Insurance */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-3">b) U/s 80-D - Medical Insurance Premium</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">S. No.</th>
                      <th className="border border-gray-300 p-2 text-left">Particulars</th>
                      <th className="border border-gray-300 p-2 text-left">Amount (Rs.)</th>
                      <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.medicalInsurance.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayInputChange('medicalInsurance', index, e.target.value)}
                            className="w-full p-1 border-none focus:ring-0"
                            placeholder="Enter particulars"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            className="w-full p-1 border-none focus:ring-0"
                            placeholder="Amount"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 w-12">
                          <button
                            type="button"
                            onClick={() => removeArrayItem('medicalInsurance', index)}
                            className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border border-gray-300 p-2 font-semibold">Total</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          className="w-full p-1 border-none focus:ring-0 font-semibold"
                          placeholder="Total Amount"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addArrayItem('medicalInsurance')}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Add Row
                </button>
              </div>
            </div>

                         {/* Education Loan */}
             <div className="mb-6">
               <h3 className="text-md font-semibold text-gray-700 mb-3">e) U/S 80E -- For repayment of Education loan & interest on it</h3>
               <div className="overflow-x-auto">
                 <table className="w-full border border-gray-300">
                   <thead>
                     <tr className="bg-gray-50">
                       <th className="border border-gray-300 p-2 text-left">Educational institution</th>
                       <th className="border border-gray-300 p-2 text-left">Interest (Rs.)</th>
                       <th className="border border-gray-300 p-2 text-left">Principal (Rs.)</th>
                       <th className="border border-gray-300 p-2 text-left">Total (Rs.)</th>
                       <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {formData.educationLoan.map((item, index) => (
                       <tr key={index}>
                         <td className="border border-gray-300 p-2">
                           <input
                             type="text"
                             value={item.institution || ''}
                             onChange={(e) => handleArrayInputChange('educationLoan', index, { ...item, institution: e.target.value })}
                             className="w-full p-1 border-none focus:ring-0"
                             placeholder="Institution name"
                           />
                         </td>
                         <td className="border border-gray-300 p-2">
                           <input
                             type="number"
                             value={item.interest || ''}
                             onChange={(e) => handleArrayInputChange('educationLoan', index, { ...item, interest: e.target.value })}
                             className="w-full p-1 border-none focus:ring-0"
                             placeholder="Interest amount"
                           />
                         </td>
                         <td className="border border-gray-300 p-2">
                           <input
                             type="number"
                             value={item.principal || ''}
                             onChange={(e) => handleArrayInputChange('educationLoan', index, { ...item, principal: e.target.value })}
                             className="w-full p-1 border-none focus:ring-0"
                             placeholder="Principal amount"
                           />
                         </td>
                         <td className="border border-gray-300 p-2">
                           <input
                             type="number"
                             value={item.total || ''}
                             onChange={(e) => handleArrayInputChange('educationLoan', index, { ...item, total: e.target.value })}
                             className="w-full p-1 border-none focus:ring-0"
                             placeholder="Total amount"
                           />
                         </td>
                         <td className="border border-gray-300 p-2 w-12">
                           <button
                             type="button"
                             onClick={() => removeArrayItem('educationLoan', index)}
                             className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                           >
                             ×
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 <button
                   type="button"
                   onClick={() => addArrayItem('educationLoan')}
                   className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                 >
                   Add Row
                 </button>
               </div>
             </div>

             {/* Life Insurance */}
             <div className="mb-6">
               <h3 className="text-md font-semibold text-gray-700 mb-3">f) U/S 80C: DETAILS OF SAVINGS (with proof) See Note 4 & 5</h3>
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">i) Life Insurance premium paid</h4>
                 <div className="overflow-x-auto">
                   <table className="w-full border border-gray-300">
                     <thead>
                       <tr className="bg-gray-50">
                         <th className="border border-gray-300 p-2 text-left">S. No.</th>
                         <th className="border border-gray-300 p-2 text-left">Particulars</th>
                         <th className="border border-gray-300 p-2 text-left">Amount (Rs.) (Annual) & Date of Payment</th>
                         <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {formData.lifeInsurance.map((item, index) => (
                         <tr key={index}>
                           <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item}
                               onChange={(e) => handleArrayInputChange('lifeInsurance', index, e.target.value)}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Enter particulars"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="number"
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Amount"
                             />
                           </td>
                           <td className="border border-gray-300 p-2 w-12">
                             <button
                               type="button"
                               onClick={() => removeArrayItem('lifeInsurance', index)}
                               className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                             >
                               ×
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   <button
                     type="button"
                     onClick={() => addArrayItem('lifeInsurance')}
                     className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                   >
                     Add Row
                   </button>
                 </div>
               </div>

               {/* PF Contribution */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">ii) PF contribution</h4>
                 <input
                   type="number"
                   value={formData.pfContribution}
                   onChange={(e) => handleInputChange('pfContribution', e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="PF Contribution Amount"
                 />
               </div>

               {/* FDR 5 Year */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">iii) FDR's of 5 year</h4>
                 <input
                   type="number"
                   value={formData.fdr5Year}
                   onChange={(e) => handleInputChange('fdr5Year', e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="FDR 5 Year Amount"
                 />
               </div>

               {/* PPF Deposits */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">iv) PPF deposited</h4>
                 <div className="overflow-x-auto">
                   <table className="w-full border border-gray-300">
                                        <thead>
                     <tr className="bg-gray-50">
                       <th className="border border-gray-300 p-2 text-left">S. No.</th>
                       <th className="border border-gray-300 p-2 text-left">PPF</th>
                       <th className="border border-gray-300 p-2 text-left">Particulars</th>
                       <th className="border border-gray-300 p-2 text-left">Amount Deposited (Rs.)</th>
                       <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                     </tr>
                   </thead>
                     <tbody>
                                                {formData.ppfDeposits.map((item, index) => (
                           <tr key={index}>
                             <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                             <td className="border border-gray-300 p-2">
                               <input
                                 type="text"
                                 value={item.ppf || ''}
                                 onChange={(e) => handleArrayInputChange('ppfDeposits', index, { ...item, ppf: e.target.value })}
                                 className="w-full p-1 border-none focus:ring-0"
                                 placeholder="PPF"
                               />
                             </td>
                             <td className="border border-gray-300 p-2">
                               <input
                                 type="text"
                                 value={item.particulars || ''}
                                 onChange={(e) => handleArrayInputChange('ppfDeposits', index, { ...item, particulars: e.target.value })}
                                 className="w-full p-1 border-none focus:ring-0"
                                 placeholder="Particulars"
                               />
                             </td>
                             <td className="border border-gray-300 p-2">
                               <input
                                 type="number"
                                 value={item.amount || ''}
                                 onChange={(e) => handleArrayInputChange('ppfDeposits', index, { ...item, amount: e.target.value })}
                                 className="w-full p-1 border-none focus:ring-0"
                                 placeholder="Amount"
                               />
                             </td>
                             <td className="border border-gray-300 p-2 w-12">
                               <button
                                 type="button"
                                 onClick={() => removeArrayItem('ppfDeposits', index)}
                                 className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                               >
                                 ×
                               </button>
                             </td>
                           </tr>
                         ))}
                     </tbody>
                   </table>
                   <button
                     type="button"
                     onClick={() => addArrayItem('ppfDeposits')}
                     className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                   >
                     Add Row
                   </button>
                 </div>
               </div>

               {/* NSC Purchased */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">v) NSC purchased</h4>
                 <div className="overflow-x-auto">
                   <table className="w-full border border-gray-300">
                     <thead>
                       <tr className="bg-gray-50">
                         <th className="border border-gray-300 p-2 text-left">S. No.</th>
                         <th className="border border-gray-300 p-2 text-left">Particulars</th>
                         <th className="border border-gray-300 p-2 text-left">Total</th>
                         <th className="border border-gray-300 p-2 text-left">Amount (Rs.)</th>
                         <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {formData.nscPurchased.map((item, index) => (
                         <tr key={index}>
                           <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item.particulars || ''}
                               onChange={(e) => handleArrayInputChange('nscPurchased', index, { ...item, particulars: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Particulars"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item.total || ''}
                               onChange={(e) => handleArrayInputChange('nscPurchased', index, { ...item, total: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Total"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="number"
                               value={item.amount || ''}
                               onChange={(e) => handleArrayInputChange('nscPurchased', index, { ...item, amount: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Amount"
                             />
                           </td>
                           <td className="border border-gray-300 p-2 w-12">
                             <button
                               type="button"
                               onClick={() => removeArrayItem('nscPurchased', index)}
                               className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                             >
                               ×
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   <button
                     type="button"
                     onClick={() => addArrayItem('nscPurchased')}
                     className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                   >
                     Add Row
                   </button>
                 </div>
               </div>

               {/* Infrastructure Bonds */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">vi) Investment in Infrastructure Bonds</h4>
                 <div className="overflow-x-auto">
                   <table className="w-full border border-gray-300">
                     <thead>
                       <tr className="bg-gray-50">
                         <th className="border border-gray-300 p-2 text-left">S. No.</th>
                         <th className="border border-gray-300 p-2 text-left">Particulars</th>
                         <th className="border border-gray-300 p-2 text-left">Total</th>
                         <th className="border border-gray-300 p-2 text-left">Amount (Rs.)</th>
                         <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {formData.infrastructureBonds.map((item, index) => (
                         <tr key={index}>
                           <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item.particulars || ''}
                               onChange={(e) => handleArrayInputChange('infrastructureBonds', index, { ...item, particulars: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Particulars"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item.total || ''}
                               onChange={(e) => handleArrayInputChange('infrastructureBonds', index, { ...item, total: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Total"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="number"
                               value={item.amount || ''}
                               onChange={(e) => handleArrayInputChange('infrastructureBonds', index, { ...item, amount: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Amount"
                             />
                           </td>
                           <td className="border border-gray-300 p-2 w-12">
                             <button
                               type="button"
                               onClick={() => removeArrayItem('infrastructureBonds', index)}
                               className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                             >
                               ×
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   <button
                     type="button"
                     onClick={() => addArrayItem('infrastructureBonds')}
                     className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                   >
                     Add Row
                   </button>
                 </div>
               </div>

               {/* School Tuition Fees */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">vii) School tuition fee paid for two children (See Note 3)</h4>
                 <div className="overflow-x-auto">
                   <table className="w-full border border-gray-300">
                     <thead>
                       <tr className="bg-gray-50">
                         <th className="border border-gray-300 p-2 text-left">S. No.</th>
                         <th className="border border-gray-300 p-2 text-left">Name of Child</th>
                         <th className="border border-gray-300 p-2 text-left">Name of Educational Institution</th>
                         <th className="border border-gray-300 p-2 text-left">Amount paid towards Tuition Fees only</th>
                         <th className="border border-gray-300 p-2 text-center w-12">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {formData.schoolTuitionFees.map((item, index) => (
                         <tr key={index}>
                           <td className="border border-gray-300 p-2">{String.fromCharCode(97 + index)}.</td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item.childName || ''}
                               onChange={(e) => handleArrayInputChange('schoolTuitionFees', index, { ...item, childName: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Child Name"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="text"
                               value={item.institution || ''}
                               onChange={(e) => handleArrayInputChange('schoolTuitionFees', index, { ...item, institution: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Institution Name"
                             />
                           </td>
                           <td className="border border-gray-300 p-2">
                             <input
                               type="number"
                               value={item.amount || ''}
                               onChange={(e) => handleArrayInputChange('schoolTuitionFees', index, { ...item, amount: e.target.value })}
                               className="w-full p-1 border-none focus:ring-0"
                               placeholder="Tuition Fee Amount"
                             />
                           </td>
                           <td className="border border-gray-300 p-2 w-12">
                             <button
                               type="button"
                               onClick={() => removeArrayItem('schoolTuitionFees', index)}
                               className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                             >
                               ×
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   <button
                     type="button"
                     onClick={() => addArrayItem('schoolTuitionFees')}
                     className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                   >
                     Add Row
                   </button>
                 </div>
               </div>

               {/* NPS Investment */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">g) U/s 80-CCD(1) – Investment in NPS</h4>
                 <input
                   type="number"
                   value={formData.npsInvestment}
                   onChange={(e) => handleInputChange('npsInvestment', e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="NPS Investment Amount"
                 />
               </div>

               {/* Section 80G */}
               <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-600 mb-2">h) U/s 80G</h4>
                 <input
                   type="number"
                   value={formData.section80G}
                   onChange={(e) => handleInputChange('section80G', e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Section 80G Amount"
                 />
               </div>
             </div>

             {/* Other Deductions */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   c) U/s 80-DD - Expenditure on handicapped dependent relatives
                 </label>
                 <input
                   type="number"
                   value={formData.handicappedDependent}
                   onChange={(e) => handleInputChange('handicappedDependent', e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Amount"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   d) U/s 80-DDB - Medical treatment of dependent relative suffering from specified ailments
                 </label>
                 <input
                   type="number"
                   value={formData.medicalTreatment}
                   onChange={(e) => handleInputChange('medicalTreatment', e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Amount"
                 />
               </div>
             </div>
          </div>
          )}

          {/* Section 6: Housing Loan */}
          {formData.newTaxRegime !== "Yes" && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6">6. DETAILS OF HOUSING LOAN (See Note 2)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    a) Taken from (Bank Name)
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bank Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    b) Dates of taking loan and amounts
                  </label>
                  <input
                    type="text"
                    value={formData.loanDates}
                    onChange={(e) => handleInputChange('loanDates', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Loan dates and amounts"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    c) Repayment of Interest Amount
                  </label>
                  <input
                    type="number"
                    value={formData.interestAmount}
                    onChange={(e) => handleInputChange('interestAmount', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Interest Amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    d) Repayment of Principal amount
                  </label>
                  <input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => handleInputChange('principalAmount', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Principal Amount"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    e) Date of taking possession of house/flat
                  </label>
                  <input
                    type="date"
                    value={formData.possessionDate}
                    onChange={(e) => handleInputChange('possessionDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Certification */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                I certify that the particulars furnished above are correct. It is also requested that the Tax may be calculated on the basis of the above particulars and may be recovered from my salary. It is also certified that above investments or the payments have been made/will be made out of the income chargeable to tax during the Financial Year 2025-26. In case I am not able to invest/pay, the arrears of Tax will be deducted by the company from my salary effective February 2026.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature:</label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digital Signature"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation:</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Designation"
                />
              </div>
            </div>
          </div>

                     {/* Notes Section */}
           <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
             <h2 className="text-lg font-bold text-gray-800 mb-4">Important Notes</h2>
             
             <div className="space-y-4 text-sm text-gray-700">
               <div>
                 <h3 className="font-semibold text-gray-800 mb-2">Note-1: PAN Requirement</h3>
                 <p>Form 16 cannot be issued without a Permanent Account Number (PAN). Please furnish PAN with proof (copy of PAN card). If PAN has been applied for, a copy of the application made to the Income Tax department for allotment of PAN is required. Wrong quoting of PAN will incur a penalty of Rs. 10,000/-, which will be recovered from the employee.</p>
               </div>
               
               <div>
                 <h3 className="font-semibold text-gray-800 mb-2">Note-2: Housing Loan Documents</h3>
                 <p>For Housing Loan, following documents are to be attached:</p>
                 <ul className="list-disc list-inside ml-4 mt-1">
                   <li>Copy of Certificate stating amount paid towards interest & principle amount</li>
                   <li>Sanction Letter with details of property</li>
                   <li>House completion certificate from prescribed authorities</li>
                 </ul>
               </div>
               
               <div>
                 <h3 className="font-semibold text-gray-800 mb-2">Note-3: Tuition Fees Documents</h3>
                 <p>For tuition fees, following documents are to be attached:</p>
                 <ul className="list-disc list-inside ml-4 mt-1">
                   <li>Copy of receipts for payments made towards tuition fees of children</li>
                 </ul>
               </div>
               
               <div>
                 <h3 className="font-semibold text-gray-800 mb-2">Note-4: Investment Proofs</h3>
                 <p>Copies of LIC premium payment receipt, NSC purchased, Infrastructure bonds like ICICI/IDBI bonds, PPF deposit etc. should be furnished.</p>
               </div>
               
               <div>
                 <h3 className="font-semibold text-gray-800 mb-2">Note-5: Deduction Limits</h3>
                 <p>Deduction Under Section 80C and 80CCC will be limited to Rs. 1,50,000/-.</p>
               </div>
               
               <div>
                 <h3 className="font-semibold text-gray-800 mb-2">Note-6: HRA Exemption Details</h3>
                 <p>Details requirements for claiming income exemption under Section 10(13A) from House Rent Allowance (HRA) of the Income Tax Act 1961. House rent receipts are to be furnished, and such receipts may be furnished by the employee in Feb 2026.</p>
                 
                 <p className="mt-2 font-medium">Details that should be available on House Rent Receipts:</p>
                 <ul className="list-disc list-inside ml-4 mt-1">
                   <li>Name of the Employee</li>
                   <li>Name of the Landlord & Address of rented property</li>
                   <li>Amount paid to landlord with mode of payment</li>
                   <li>If paid by cash, a revenue stamp must be pasted on it</li>
                   <li>Related month & date of payment</li>
                   <li>Copy of PAN Card of Landlord if annual rent is in excess of Rs 1,00,000/-</li>
                 </ul>
                 
                 <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                   <p className="font-medium text-blue-800">Important:</p>
                   <p className="text-blue-700">There is a common perception among employees that whatever rent an employee is paying for his/her house is exempt from tax or whatever HRA Component he/she is getting as a part of Salary is exempt. However, this is incorrect. Exemption of HRA will be available up to the minimum of the following three options:</p>
                   <ol className="list-decimal list-inside ml-4 mt-2 text-blue-700">
                     <li>Actual house rent allowance received from your employer</li>
                     <li>Actual house rent paid by you minus 10% of your basic salary</li>
                     <li>50% of your basic salary if you live in a metro (Delhi, Mumbai, Chennai & Kolkata) or 40% of your basic salary if you live in other cities</li>
                   </ol>
                 </div>
               </div>
             </div>
           </div>

           {/* Form Actions */}
           <div className="flex justify-end pt-6 border-t border-gray-200">
             <button
               type="submit"
               className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
             >
               <FaSave />
               <span>Save Declaration</span>
             </button>
           </div>
         </>
       </form>
     </div>
   </div>
 );
};

export default DeclarationForm; 