import React, { useState } from 'react';

const IncomeTaxCalculator = () => {
  const [regime, setRegime] = useState('old');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [incomeType, setIncomeType] = useState('annual');
  const [salary, setSalary] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [result, setResult] = useState(null);

  const calculateTax = () => {
    const annualSalary = incomeType === 'monthly' ? (parseFloat(salary) || 0) * 12 : (parseFloat(salary) || 0);
    const otherIncomeAmount = incomeType === 'monthly' ? (parseFloat(otherIncome) || 0) * 12 : (parseFloat(otherIncome) || 0);
    const totalDeductions = parseFloat(deductions) || 0;

    let grossIncome = annualSalary + otherIncomeAmount;
    let taxableIncome = grossIncome;
    let standardDeduction = 0;
    let finalDeductions = 0;

    // Standard deduction based on regime and year
    if (regime === 'old') {
      standardDeduction = 50000;
    } else if (regime === 'new') {
      if (financialYear === '2024-25') {
        standardDeduction = 50000;
      } else {
        standardDeduction = 75000;
      }
    }

    // Apply deductions
    if (regime === 'old') {
      finalDeductions = Math.min(totalDeductions, 150000) + standardDeduction; // 80C limit
    } else {
      finalDeductions = standardDeduction; // New regime has limited deductions
    }

    taxableIncome = Math.max(0, grossIncome - finalDeductions);

    let tax = 0;
    let cess = 0;
    let totalTax = 0;
    let slabBreakdown = [];

    if (regime === 'old') {
      // Old regime tax slabs
      const slabs = [
        { limit: 250000, rate: 0, description: 'Up to ₹2.5 Lakhs' },
        { limit: 500000, rate: 0.05, description: '₹2.5 Lakhs to ₹5 Lakhs' },
        { limit: 1000000, rate: 0.2, description: '₹5 Lakhs to ₹10 Lakhs' },
        { limit: Infinity, rate: 0.3, description: 'Above ₹10 Lakhs' }
      ];

      let remainingIncome = taxableIncome;
      let previousLimit = 0;

      for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        const slabAmount = Math.min(remainingIncome, slab.limit - previousLimit);
        
        if (slabAmount > 0) {
          const slabTax = slabAmount * slab.rate;
          tax += slabTax;
          
          slabBreakdown.push({
            slab: slab.description,
            amount: slabAmount,
            rate: slab.rate * 100,
            tax: slabTax
          });
        }
        
        remainingIncome -= slabAmount;
        previousLimit = slab.limit;
        
        if (remainingIncome <= 0) break;
      }
    } else {
      // New regime tax slabs
      let slabs = [];
      
      if (financialYear === '2024-25') {
        slabs = [
          { limit: 300000, rate: 0, description: 'Up to ₹3 Lakhs' },
          { limit: 600000, rate: 0.05, description: '₹3 Lakhs to ₹6 Lakhs' },
          { limit: 900000, rate: 0.1, description: '₹6 Lakhs to ₹9 Lakhs' },
          { limit: 1200000, rate: 0.15, description: '₹9 Lakhs to ₹12 Lakhs' },
          { limit: 1500000, rate: 0.2, description: '₹12 Lakhs to ₹15 Lakhs' },
          { limit: Infinity, rate: 0.3, description: 'Above ₹15 Lakhs' }
        ];
      } else {
        slabs = [
          { limit: 400000, rate: 0, description: 'Up to ₹4 Lakhs' },
          { limit: 800000, rate: 0.05, description: '₹4 Lakhs to ₹8 Lakhs' },
          { limit: 1200000, rate: 0.1, description: '₹8 Lakhs to ₹12 Lakhs' },
          { limit: 1600000, rate: 0.15, description: '₹12 Lakhs to ₹16 Lakhs' },
          { limit: 2000000, rate: 0.2, description: '₹16 Lakhs to ₹20 Lakhs' },
          { limit: 2400000, rate: 0.25, description: '₹20 Lakhs to ₹24 Lakhs' },
          { limit: Infinity, rate: 0.3, description: 'Above ₹24 Lakhs' }
        ];
      }

      let remainingIncome = taxableIncome;
      let previousLimit = 0;

      for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        const slabAmount = Math.min(remainingIncome, slab.limit - previousLimit);
        
        if (slabAmount > 0) {
          const slabTax = slabAmount * slab.rate;
          tax += slabTax;
          
          slabBreakdown.push({
            slab: slab.description,
            amount: slabAmount,
            rate: slab.rate * 100,
            tax: slabTax
          });
        }
        
        remainingIncome -= slabAmount;
        previousLimit = slab.limit;
        
        if (remainingIncome <= 0) break;
      }
    }

    // Calculate cess (4% of tax)
    cess = tax * 0.04;
    totalTax = tax + cess;

    // Monthly tax
    const monthlyTax = totalTax / 12;

    setResult({
      grossIncome,
      standardDeduction,
      finalDeductions,
      taxableIncome,
      tax,
      cess,
      totalTax,
      monthlyTax,
      slabBreakdown,
      regime,
      financialYear
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
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Income Tax Calculator</h1>
                <p className="text-gray-700">Calculate income tax for FY 2024-25 & 2025-26</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Regime
                  </label>
                  <select 
                    value={regime} 
                    onChange={(e) => setRegime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="old">Old Regime</option>
                    <option value="new">New Regime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Financial Year
                  </label>
                  <select 
                    value={financialYear} 
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="annual"
                      checked={incomeType === 'annual'}
                      onChange={(e) => setIncomeType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Annual</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="monthly"
                      checked={incomeType === 'monthly'}
                      onChange={(e) => setIncomeType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Monthly</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {incomeType === 'monthly' ? 'Monthly' : 'Annual'} Salary (₹)
                </label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder={incomeType === 'monthly' ? "e.g. 50000" : "e.g. 600000"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {incomeType === 'monthly' ? 'Monthly' : 'Annual'} Other Income (₹)
                </label>
                <input 
                  type="number" 
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Interest, rental income, etc.</p>
              </div>

              {regime === 'old' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductions (80C, 80D, etc.) (₹)
                  </label>
                  <input 
                    type="number" 
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum ₹1.5 lakhs under 80C</p>
                </div>
              )}

              <button 
                onClick={calculateTax}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-lg"
              >
                Calculate Tax
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Income Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Income Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Income:</span>
                      <span className="font-medium">₹{result.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Deduction:</span>
                      <span className="font-medium">-₹{result.standardDeduction.toLocaleString()}</span>
                    </div>
                    {result.regime === 'old' && (
                      <div className="flex justify-between">
                        <span>Other Deductions:</span>
                        <span className="font-medium">-₹{(result.finalDeductions - result.standardDeduction).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Taxable Income:</span>
                      <span className="text-blue-600">₹{result.taxableIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Calculation */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Tax Calculation ({result.regime === 'old' ? 'Old' : 'New'} Regime - FY {result.financialYear})
                  </h3>
                  
                  {/* Slab Breakdown */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Slab-wise Breakdown:</h4>
                    <div className="space-y-2">
                      {result.slabBreakdown.map((slab, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{slab.slab} ({slab.rate}%):</span>
                          <span>₹{slab.tax.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Tax:</span>
                      <span className="font-medium">₹{result.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Health & Education Cess (4%):</span>
                      <span className="font-medium">₹{result.cess.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total Tax:</span>
                      <span className="text-green-600">₹{result.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Monthly Tax:</span>
                      <span className="text-green-600">₹{result.monthlyTax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Slabs Info */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Tax Slabs - FY {result.financialYear}
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    {result.regime === 'old' ? (
                      <>
                        <div>• Up to ₹2.5 Lakhs: Nil</div>
                        <div>• ₹2.5 Lakhs to ₹5 Lakhs: 5%</div>
                        <div>• ₹5 Lakhs to ₹10 Lakhs: 20%</div>
                        <div>• Above ₹10 Lakhs: 30%</div>
                        <div className="mt-2">• Standard Deduction: ₹50,000</div>
                        <div>• 80C Deductions: Up to ₹1.5 Lakhs</div>
                      </>
                    ) : (
                      <>
                        {result.financialYear === '2024-25' ? (
                          <>
                            <div>• Up to ₹3 Lakhs: Nil</div>
                            <div>• ₹3 Lakhs to ₹6 Lakhs: 5%</div>
                            <div>• ₹6 Lakhs to ₹9 Lakhs: 10%</div>
                            <div>• ₹9 Lakhs to ₹12 Lakhs: 15%</div>
                            <div>• ₹12 Lakhs to ₹15 Lakhs: 20%</div>
                            <div>• Above ₹15 Lakhs: 30%</div>
                          </>
                        ) : (
                          <>
                            <div>• Up to ₹4 Lakhs: Nil</div>
                            <div>• ₹4 Lakhs to ₹8 Lakhs: 5%</div>
                            <div>• ₹8 Lakhs to ₹12 Lakhs: 10%</div>
                            <div>• ₹12 Lakhs to ₹16 Lakhs: 15%</div>
                            <div>• ₹16 Lakhs to ₹20 Lakhs: 20%</div>
                            <div>• ₹20 Lakhs to ₹24 Lakhs: 25%</div>
                            <div>• Above ₹24 Lakhs: 30%</div>
                          </>
                        )}
                        <div className="mt-2">• Standard Deduction: ₹{result.financialYear === '2024-25' ? '50,000' : '75,000'}</div>
                        <div>• Limited deductions available</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">📊</div>
                <p>Enter your details and click "Calculate Tax" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeTaxCalculator;
