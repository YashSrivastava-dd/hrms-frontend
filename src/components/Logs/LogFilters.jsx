import React, { useState } from 'react';
import { format } from 'date-fns';

const LogFilters = ({ onApplyFilters, loading }) => {
  const [filters, setFilters] = useState({
    actionType: '',
    startDate: '',
    endDate: '',
    entityType: ''
  });

  const actionTypes = [
    'LEAVE_APPLIED',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'PAYSLIP_VIEWED',
    'ATTENDANCE_MARKED',
    'PROFILE_UPDATED',
    'DOCUMENT_UPLOADED',
    'TAX_DECLARATION_SUBMITTED',
    'SALARY_PROCESSED',
    'ANNOUNCEMENT_CREATED'
  ];

  const entityTypes = [
    'LEAVE',
    'PAYSLIP',
    'ATTENDANCE',
    'PROFILE',
    'DOCUMENT',
    'TAX_DECLARATION',
    'SALARY',
    'ANNOUNCEMENT'
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      actionType: '',
      startDate: '',
      endDate: '',
      entityType: ''
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Logs</h3>
        <button
          onClick={handleResetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action Type Filter */}
        <div>
          <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-2">
            Action Type
          </label>
          <select
            id="actionType"
            value={filters.actionType}
            onChange={(e) => handleFilterChange('actionType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Type Filter */}
        <div>
          <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-2">
            Entity Type
          </label>
          <select
            id="entityType"
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Entities</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Filter */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleApplyFilters}
          disabled={loading}
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Applying...
            </>
          ) : (
            'Apply Filters'
          )}
        </button>
      </div>
    </div>
  );
};

export default LogFilters;
