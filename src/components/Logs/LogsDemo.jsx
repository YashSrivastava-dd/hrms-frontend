import React, { useState } from 'react';
import LogsPage from './LogsPage';

const LogsDemo = () => {
  const [selectedRole, setSelectedRole] = useState('Employee');

  const roles = ['Employee', 'Manager', 'HR', 'CEO'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select User Role:</label>
            <div className="flex space-x-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    selectedRole === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logs Page */}
      <LogsPage userRole={selectedRole} />
    </div>
  );
};

export default LogsDemo;
