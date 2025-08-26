import React from 'react';
import { format } from 'date-fns';

const LogTimeline = ({ logs, loading, onLoadMore, hasMore }) => {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'LEAVE_APPLIED':
        return '📅';
      case 'LEAVE_APPROVED':
        return '✅';
      case 'LEAVE_REJECTED':
        return '❌';
      case 'PAYSLIP_VIEWED':
        return '💰';
      case 'ATTENDANCE_MARKED':
        return '⏰';
      case 'PROFILE_UPDATED':
        return '👤';
      case 'DOCUMENT_UPLOADED':
        return '📄';
      case 'TAX_DECLARATION_SUBMITTED':
        return '📊';
      case 'SALARY_PROCESSED':
        return '💳';
      case 'ANNOUNCEMENT_CREATED':
        return '📢';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
        <p className="text-gray-500">There are no activity logs to display for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Log entries */}
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={log.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute left-4 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 z-10"></div>
              
              {/* Content */}
              <div className="ml-12 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 group-hover:shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActionIcon(log.actionType)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{log.user.name}</h4>
                      <p className="text-sm text-gray-500">{log.user.role}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{formatDate(log.createdAt)}</span>
                </div>
                
                <p className="text-gray-700 mb-3">{log.description}</p>
                
                {/* Additional details */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                      {log.entityType}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.device}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </>
            ) : (
              'Load More Logs'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LogTimeline;
