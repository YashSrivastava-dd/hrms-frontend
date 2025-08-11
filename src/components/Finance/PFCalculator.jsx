import React, { useState, useEffect } from 'react';

const PFCalculator = () => {
  const [basicSalary, setBasicSalary] = useState('');
  const [da, setDa] = useState('');
  const [years, setYears] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [result, setResult] = useState(null);

  const calculatePF = () => {
    const basic = parseFloat(basicSalary) || 0;
    const dearnessAllowance = parseFloat(da) || 0;
    const serviceYears = parseFloat(years) || 0;
    const existingBalance = parseFloat(currentBalance) || 0;

    // EPF calculation rules
    const wageCeiling = 15000; // Maximum wage ceiling for EPF
    const employeeContributionRate = 0.12; // 12% employee contribution
    const employerContributionRate = 0.12; // 12% employer contribution
    const employerEPSRate = 0.0833; // 8.33% goes to EPS
    const employerEPFRate = 0.0367; // 3.67% goes to EPF
    const adminCharges = 0.005; // 0.5% admin charges

    // Calculate monthly wages (Basic + DA)
    const monthlyWages = basic + dearnessAllowance;
    const wagesForPF = Math.min(monthlyWages, wageCeiling);

    // Monthly contributions
    const employeeContribution = wagesForPF * employeeContributionRate;
    const employerContribution = wagesForPF * employerContributionRate;
    const employerEPSContribution = wagesForPF * employerEPSRate;
    const employerEPFContribution = wagesForPF * employerEPFRate;
    const adminChargesAmount = wagesForPF * adminCharges;

    // Annual calculations
    const annualEmployeeContribution = employeeContribution * 12;
    const annualEmployerEPFContribution = employerEPFContribution * 12;
    const annualTotalEPFContribution = annualEmployeeContribution + annualEmployerEPFContribution;

    // Interest calculation (assuming 8.1% interest rate)
    const interestRate = 0.081;
    let totalBalance = existingBalance;
    let totalInterest = 0;

    for (let year = 1; year <= serviceYears; year++) {
      const yearContribution = annualTotalEPFContribution;
      const yearInterest = (totalBalance + yearContribution / 2) * interestRate;
      totalBalance += yearContribution + yearInterest;
      totalInterest += yearInterest;
    }

    // Final calculations
    const totalContribution = annualTotalEPFContribution * serviceYears;
    const maturityAmount = totalBalance;
    const totalInterestEarned = totalInterest;

    setResult({
      monthlyWages,
      wagesForPF,
      employeeContribution,
      employerContribution,
      employerEPSContribution,
      employerEPFContribution,
      adminChargesAmount,
      annualEmployeeContribution,
      annualEmployerEPFContribution,
      annualTotalEPFContribution,
      totalContribution,
      totalInterestEarned,
      maturityAmount,
      serviceYears
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
                <span className="text-white text-2xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">PF Calculator</h1>
                <p className="text-gray-700">Calculate EPF contributions and maturity amount</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Service
                </label>
                <input 
                  type="number" 
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Total years of EPF contribution</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current EPF Balance (₹)
                </label>
                <input 
                  type="number" 
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Existing EPF balance (optional)</p>
              </div>

              <button 
                onClick={calculatePF}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-lg"
              >
                Calculate PF
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Monthly Breakdown */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Monthly Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Wages (Basic + DA):</span>
                      <span className="font-medium">₹{result.monthlyWages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wages for PF (Capped at ₹15,000):</span>
                      <span className="font-medium">₹{result.wagesForPF.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employee Contribution (12%):</span>
                      <span className="font-medium">₹{result.employeeContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employer Contribution (12%):</span>
                      <span className="font-medium">₹{result.employerContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>→ EPS (8.33%):</span>
                      <span className="font-medium">₹{result.employerEPSContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>→ EPF (3.67%):</span>
                      <span className="font-medium">₹{result.employerEPFContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin Charges (0.5%):</span>
                      <span className="font-medium">₹{result.adminChargesAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Annual Breakdown */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Annual Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Annual Employee Contribution:</span>
                      <span className="font-medium">₹{result.annualEmployeeContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Employer EPF Contribution:</span>
                      <span className="font-medium">₹{result.annualEmployerEPFContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total Annual EPF Contribution:</span>
                      <span className="text-green-600">₹{result.annualTotalEPFContribution.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Maturity Calculation */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Maturity Calculation ({result.serviceYears} years)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Contributions:</span>
                      <span className="font-medium">₹{result.totalContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Earned (8.1% p.a.):</span>
                      <span className="font-medium">₹{result.totalInterestEarned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl border-t pt-2 text-purple-600">
                      <span>Maturity Amount:</span>
                      <span>₹{result.maturityAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Key Information</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• EPF wage ceiling: ₹15,000 per month</li>
                    <li>• Employee contribution: 12% of wages</li>
                    <li>• Employer contribution: 12% of wages</li>
                    <li>• 8.33% of employer contribution goes to EPS</li>
                    <li>• 3.67% of employer contribution goes to EPF</li>
                    <li>• Interest rate: 8.1% per annum (compounded yearly)</li>
                    <li>• Admin charges: 0.5% of wages</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">💰</div>
                <p>Enter your details and click "Calculate PF" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PFCalculator;
