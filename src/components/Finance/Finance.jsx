import React, { useState } from 'react';
import TDSCalculator from '../TDSCalculator';
import PFCalculator from './PFCalculator';
import GratuityCalculator from './GratuityCalculator';
import IncomeTaxCalculator from './IncomeTaxCalculator';
import HRAExemptionCalculator from './HRAExemptionCalculator';

const Finance = () => {
  const [activeCalculator, setActiveCalculator] = useState('tds');

  const calculators = [
    {
      id: 'tds',
      name: 'TDS Calculator',
      icon: '🧮',
      description: 'Calculate TDS on salary and other income',
      component: TDSCalculator,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'pf',
      name: 'PF Calculator',
      icon: '💰',
      description: 'Calculate EPF contributions and interest',
      component: PFCalculator,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'gratuity',
      name: 'Gratuity Calculator',
      icon: '🎁',
      description: 'Calculate gratuity amount based on service years',
      component: GratuityCalculator,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'income-tax',
      name: 'Income Tax Calculator',
      icon: '📊',
      description: 'Calculate income tax for FY 2024-25 & 2025-26',
      component: IncomeTaxCalculator,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'hra-exemption',
      name: 'HRA Exemption Calculator',
      icon: '🏠',
      description: 'Calculate HRA exemption as per Section 10(13A)',
      component: HRAExemptionCalculator,
      color: 'from-teal-500 to-cyan-500'
    },
  ];

  const ActiveComponent = calculators.find(calc => calc.id === activeCalculator)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Finance Sidebar */}
        <div className="w-full lg:w-80 bg-white shadow-xl border-r border-gray-200 min-h-screen lg:min-h-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Finance Tools</h1>
                <p className="text-sm text-gray-600">Professional Financial Calculators</p>
              </div>
            </div>
          </div>

          {/* Calculator Navigation */}
          <nav className="p-4 space-y-3">
            {calculators.map((calculator) => (
              <button
                key={calculator.id}
                onClick={() => setActiveCalculator(calculator.id)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 group transform hover:scale-105 ${
                  activeCalculator === calculator.id
                    ? `bg-gradient-to-r ${calculator.color} text-white shadow-xl transform scale-105`
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-lg border border-gray-100 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    activeCalculator === calculator.id ? "text-white" : "text-gray-500 group-hover:text-blue-500"
                  }`}>
                    {calculator.icon}
                  </span>
                  <div className="flex-1">
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      activeCalculator === calculator.id ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                    }`}>
                      {calculator.name}
                    </h3>
                    <p className={`text-xs transition-colors duration-300 mt-1 ${
                      activeCalculator === calculator.id ? "text-blue-100" : "text-gray-500 group-hover:text-gray-600"
                    }`}>
                      {calculator.description}
                    </p>
                  </div>
                  {activeCalculator === calculator.id && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="text-center text-xs text-gray-500">
              <p>Professional Financial Tools</p>
              <p className="mt-1">Accurate calculations for better planning</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Active Calculator Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">
                  {calculators.find(calc => calc.id === activeCalculator)?.icon}
                </span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {calculators.find(calc => calc.id === activeCalculator)?.name}
                </h2>
              </div>
              <p className="text-gray-600">
                {calculators.find(calc => calc.id === activeCalculator)?.description}
              </p>
            </div>

            {/* Calculator Component */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
