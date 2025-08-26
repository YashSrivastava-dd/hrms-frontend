import React, { useState, useEffect, useCallback } from 'react';
import LogFilters from './LogFilters';
import LogTimeline from './LogTimeline';

const LogsPage = ({ userRole }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has access to view logs (all users can view logs, but with different scopes)
  const hasAccess = userRole && userRole !== 'undefined';

  // Determine scope based on user role
  const getScope = () => {
    switch (userRole) {
      case 'Employee':
        return 'me';
      case 'Manager':
        return 'team';
      case 'HR-Admin':
      case 'Super-Admin':
        return 'all';
      default:
        return 'me'; // Default to 'me' for any other roles
    }
  };

  // Build query parameters
  const buildQueryParams = (filters, pageNum = 1) => {
    const params = new URLSearchParams();
    params.append('scope', getScope());
    params.append('page', pageNum.toString());
    params.append('limit', '20');

    if (filters.actionType) {
      params.append('actionType', filters.actionType);
    }
    if (filters.entityType) {
      params.append('entityType', filters.entityType);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    return params.toString();
  };

  // Fetch logs from API
  const fetchLogs = useCallback(async (filtersData, pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      // For development, use mock data instead of API calls
      // TODO: Replace this with actual API call when backend is ready
      // To switch to production mode, change NODE_ENV to 'production' or comment out this block
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use filtered mock data
        const mockData = getFilteredMockLogs();
        
        if (append) {
          setLogs(prev => [...prev, ...mockData]);
        } else {
          setLogs(mockData);
        }
        
        setHasMore(false); // No pagination for mock data
        setPage(pageNum);
        return;
      }

      // Production API call (uncomment when backend is ready)
      /*
      const queryParams = buildQueryParams(filtersData, pageNum);
      const response = await fetch(`/api/logs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers here
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (append) {
        setLogs(prev => [...prev, ...data]);
      } else {
        setLogs(data);
      }

      // Check if there are more logs to load
      setHasMore(data.length === 20); // Assuming 20 is the page size
      setPage(pageNum);
      */
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  // Load more logs
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchLogs(filters, page + 1, true);
    }
  }, [loading, hasMore, filters, page, fetchLogs]);

  // Apply filters
  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setHasMore(true);
    fetchLogs(newFilters, 1, false);
  }, [fetchLogs]);

  // Initial load
  useEffect(() => {
    fetchLogs({}, 1, false);
  }, [fetchLogs]);

  // Mock data for development (remove this in production)
  const mockLogs = [
    {
      id: 101,
      user: { id: 12, name: "John Doe", role: "Employee" },
      actionType: "LEAVE_APPLIED",
      description: "Applied for Casual Leave (2025-08-22 to 2025-08-25)",
      entityType: "LEAVE",
      entityId: 55,
      ipAddress: "192.168.1.12",
      device: "Chrome on Windows",
      createdAt: "2025-08-21T10:32:00Z"
    },
    {
      id: 102,
      user: { id: 15, name: "Sarah Manager", role: "Manager" },
      actionType: "LEAVE_APPROVED",
      description: "Approved Casual Leave for John Doe",
      entityType: "LEAVE",
      entityId: 55,
      ipAddress: "192.168.1.15",
      device: "Safari on Mac",
      createdAt: "2025-08-21T11:15:00Z"
    },
    {
      id: 103,
      user: { id: 12, name: "John Doe", role: "Employee" },
      actionType: "PAYSLIP_VIEWED",
      description: "Viewed payslip for August 2025",
      entityType: "PAYSLIP",
      entityId: 78,
      ipAddress: "192.168.1.12",
      device: "Chrome on Windows",
      createdAt: "2025-08-21T14:20:00Z"
    },
    {
      id: 104,
      user: { id: 12, name: "John Doe", role: "Employee" },
      actionType: "ATTENDANCE_MARKED",
      description: "Marked attendance - Punch In at 9:00 AM",
      entityType: "ATTENDANCE",
      entityId: 89,
      ipAddress: "192.168.1.12",
      device: "Chrome on Windows",
      createdAt: "2025-08-21T09:00:00Z"
    },
    {
      id: 105,
      user: { id: 12, name: "John Doe", role: "Employee" },
      actionType: "PROFILE_UPDATED",
      description: "Updated contact information in profile",
      entityType: "PROFILE",
      entityId: 12,
      ipAddress: "192.168.1.12",
      device: "Chrome on Windows",
      createdAt: "2025-08-20T16:45:00Z"
    },
    {
      id: 106,
      user: { id: 15, name: "Sarah Manager", role: "Manager" },
      actionType: "DOCUMENT_UPLOADED",
      description: "Uploaded team performance report",
      entityType: "DOCUMENT",
      entityId: 34,
      ipAddress: "192.168.1.15",
      device: "Safari on Mac",
      createdAt: "2025-08-20T14:30:00Z"
    },
    {
      id: 107,
      user: { id: 18, name: "HR Admin", role: "HR-Admin" },
      actionType: "ANNOUNCEMENT_CREATED",
      description: "Created company-wide announcement about new policies",
      entityType: "ANNOUNCEMENT",
      entityId: 23,
      ipAddress: "192.168.1.18",
      device: "Firefox on Mac",
      createdAt: "2025-08-20T11:00:00Z"
    }
  ];

  // Filter mock data based on user role for development
  const getFilteredMockLogs = () => {
    if (userRole === 'Employee') {
      // Employee only sees their own logs
      return mockLogs.filter(log => log.user.role === 'Employee');
    } else if (userRole === 'Manager') {
      // Manager sees team logs (Employee + Manager)
      return mockLogs.filter(log => ['Employee', 'Manager'].includes(log.user.role));
    } else {
      // HR-Admin and Super-Admin see all logs
      return mockLogs;
    }
  };

    // Use mock data if no real logs (for development)
  const displayLogs = logs.length > 0 ? logs : getFilteredMockLogs();

  // Render access denied if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">
              You need to be logged in to view activity logs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-2 text-gray-600">
            {userRole === 'Employee' ? 'View your personal activity logs' : 
             userRole === 'Manager' ? 'View your team\'s activity logs' : 
             userRole === 'HR-Admin' || userRole === 'Super-Admin' ? 'View all system activity logs' : 
             'View activity logs'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading logs</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <LogFilters 
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
            <div className="text-sm text-gray-500">
              Showing {displayLogs.length} logs
            </div>
          </div>
          
          <LogTimeline
            logs={displayLogs}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </div>

        {/* Development Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Development Mode</h3>
              <p className="mt-1 text-sm text-blue-700">
                Currently showing mock data filtered by your role ({userRole}). 
                The component is configured to use mock data in development and will automatically switch to API calls when you're ready.
              </p>
              <div className="mt-2 text-xs text-blue-600">
                <strong>API Endpoint:</strong> <code>/api/logs</code> (not yet implemented)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
