import React, { useState } from 'react';

const GratuityCalculator = () => {
  const [basicSalary, setBasicSalary] = useState('');
  const [da, setDa] = useState('');
  const [yearsOfService, setYearsOfService] = useState('');
  const [monthsOfService, setMonthsOfService] = useState('');
  const [daysOfService, setDaysOfService] = useState('');
  const [result, setResult] = useState(null);

  const calculateGratuity = () => {
    const basic = parseFloat(basicSalary) || 0;
    const dearnessAllowance = parseFloat(da) || 0;
    const years = parseFloat(yearsOfService) || 0;
    const months = parseFloat(monthsOfService) || 0;
    const days = parseFloat(daysOfService) || 0;

    // Calculate total service period
    const totalYears = years + (months / 12) + (days / 365);
    const totalMonths = Math.floor(totalYears * 12);
    const totalDays = Math.floor(totalYears * 365);

    // Basic salary + DA
    const monthlyWages = basic + dearnessAllowance;
    const dailyWages = monthlyWages / 26; // 26 working days per month

    let gratuityAmount = 0;
    let calculationMethod = '';
    let breakdown = '';

    if (totalYears >= 5) {
      // For 5 or more years of service
      const completedYears = Math.floor(totalYears);
      const remainingMonths = totalMonths % 12;
      const remainingDays = totalDays % 365;

      gratuityAmount = (monthlyWages * 15 * completedYears) / 26;
      
      // Add partial year calculation
      if (remainingMonths > 0 || remainingDays > 0) {
        const partialYear = (remainingMonths / 12) + (remainingDays / 365);
        gratuityAmount += (monthlyWages * 15 * partialYear) / 26;
      }

      calculationMethod = 'Standard Formula';
      breakdown = `
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Completed Years:</span>
            <span>${completedYears} years</span>
          </div>
          <div class="flex justify-between">
            <span>Remaining Period:</span>
            <span>${remainingMonths} months, ${remainingDays} days</span>
          </div>
          <div class="flex justify-between">
            <span>Total Service:</span>
            <span>${totalYears.toFixed(2)} years</span>
          </div>
          <div class="flex justify-between">
            <span>Daily Wages:</span>
            <span>₹${dailyWages.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>Formula:</span>
            <span>(₹${monthlyWages.toLocaleString()} × 15 × ${totalYears.toFixed(2)}) ÷ 26</span>
          </div>
        </div>
      `;
    } else if (totalYears >= 1) {
      // For 1 to 5 years of service
      gratuityAmount = (monthlyWages * 15 * totalYears) / 26;
      
      calculationMethod = 'Proportional Formula';
      breakdown = `
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Service Period:</span>
            <span>${totalYears.toFixed(2)} years</span>
          </div>
          <div class="flex justify-between">
            <span>Daily Wages:</span>
            <span>₹${dailyWages.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>Formula:</span>
            <span>(₹${monthlyWages.toLocaleString()} × 15 × ${totalYears.toFixed(2)}) ÷ 26</span>
          </div>
        </div>
      `;
    } else {
      // For less than 1 year
      gratuityAmount = 0;
      calculationMethod = 'No Gratuity';
      breakdown = `
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Service Period:</span>
            <span>${totalYears.toFixed(2)} years</span>
          </div>
          <div class="text-red-600">
            Gratuity is not applicable for service less than 1 year
          </div>
        </div>
      `;
    }

    // Maximum gratuity limit check
    const maxGratuity = 2000000; // ₹20 lakhs
    const isCapped = gratuityAmount > maxGratuity;
    const finalGratuity = isCapped ? maxGratuity : gratuityAmount;

    setResult({
      totalYears,
      totalMonths,
      totalDays,
      monthlyWages,
      dailyWages,
      gratuityAmount,
      finalGratuity,
      calculationMethod,
      breakdown,
      isCapped,
      maxGratuity
    });
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🎁</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gratuity Calculator</h1>
                <p className="text-gray-700">Calculate gratuity amount based on service years</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Salary (₹)
                </label>
                <input 
                  type="number" 
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Basic salary component</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dearness Allowance (₹)
                </label>
                <input 
                  type="number" 
                  value={da}
                  onChange={(e) => setDa(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">DA component (if applicable)</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years
                  </label>
                  <input 
                    type="number" 
                    value={yearsOfService}
                    onChange={(e) => setYearsOfService(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Months
                  </label>
                  <input 
                    type="number" 
                    value={monthsOfService}
                    onChange={(e) => setMonthsOfService(e.target.value)}
                    placeholder="e.g. 6"
                    min="0"
                    max="11"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days
                  </label>
                  <input 
                    type="number" 
                    value={daysOfService}
                    onChange={(e) => setDaysOfService(e.target.value)}
                    placeholder="e.g. 15"
                    min="0"
                    max="30"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button 
                onClick={calculateGratuity}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-lg"
              >
                Calculate Gratuity
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Service Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Service Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Service Period:</span>
                      <span className="font-medium">{result.totalYears.toFixed(2)} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Months:</span>
                      <span className="font-medium">{result.totalMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Days:</span>
                      <span className="font-medium">{result.totalDays} days</span>
                    </div>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Salary Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Wages (Basic + DA):</span>
                      <span className="font-medium">₹{result.monthlyWages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Wages:</span>
                      <span className="font-medium">₹{result.dailyWages.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculation Method:</span>
                      <span className="font-medium">{result.calculationMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Gratuity Calculation */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Gratuity Calculation</h3>
                  <div 
                    className="space-y-2 text-sm mb-4"
                    dangerouslySetInnerHTML={{ __html: result.breakdown }}
                  />
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Calculated Gratuity:</span>
                      <span className="text-purple-600">₹{result.gratuityAmount.toLocaleString()}</span>
                    </div>
                    
                    {result.isCapped && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                        <div className="flex justify-between text-sm">
                          <span>Maximum Limit:</span>
                          <span className="font-medium">₹{result.maxGratuity.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          Gratuity is capped at ₹20 lakhs as per law
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-xl border-t pt-2 mt-3">
                      <span>Final Gratuity Amount:</span>
                      <span className="text-green-600">₹{result.finalGratuity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Key Information</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Gratuity is calculated as: (Basic + DA) × 15 × Years of Service ÷ 26</li>
                    <li>• Minimum 5 years of service required for full gratuity</li>
                    <li>• For service less than 5 years: proportional calculation</li>
                    <li>• Maximum gratuity limit: ₹20 lakhs</li>
                    <li>• 26 working days considered per month</li>
                    <li>• Applicable to employees covered under Payment of Gratuity Act, 1972</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">🎁</div>
                <p>Enter your details and click "Calculate Gratuity" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GratuityCalculator;
