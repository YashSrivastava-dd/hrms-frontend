import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, MapPin, Calendar, User, RefreshCw, AlertCircle } from 'lucide-react';

const PunchRecords = () => {
  const [punchRecords, setPunchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data } = useSelector((state) => state.userData);
  const employeeId = data?.data?.employee_id || data?.data?.employeId || localStorage.getItem('employeId');

  useEffect(() => {
    if (employeeId) {
      fetchPunchRecords();
    } else if (data === null || (data && !data.data)) {
      // Still loading user data
    } else {
      setLoading(false);
    }
  }, [employeeId, data]);

  const fetchPunchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const baseUrl = process.env.REACT_APP_BASE_URL ;
      const url = `${baseUrl}/api/punch-records?employee_id=${employeeId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPunchRecords(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch punch records');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPunchRecords();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const calculateActualDuration = (punchInTime, punchOutTime) => {
    if (!punchInTime || !punchOutTime) return null;
    
    try {
      const punchIn = new Date(punchInTime);
      const punchOut = new Date(punchOutTime);
      const diffMs = punchOut.getTime() - punchIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      console.log('Duration calculation:', {
        punchInTime,
        punchOutTime,
        punchIn: punchIn.toISOString(),
        punchOut: punchOut.toISOString(),
        diffMs,
        diffHours
      });
      return diffHours;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return null;
    }
  };

  const formatDuration = (duration, punchInTime, punchOutTime) => {
    // Try to calculate actual duration first
    const actualDuration = calculateActualDuration(punchInTime, punchOutTime);
    const durationToUse = actualDuration !== null ? actualDuration : duration;
    
    if (!durationToUse) return 'N/A';
    
    // Convert duration string to number if it's a string
    const durationNum = typeof durationToUse === 'string' ? parseFloat(durationToUse) : durationToUse;
    
    // If duration is less than 1 hour, show in minutes
    if (durationNum < 1) {
      const minutes = Math.round(durationNum * 60);
      return `${minutes}m`;
    }
    
    // If duration is 1 hour or more, show hours and minutes
    const hours = Math.floor(durationNum);
    const minutes = Math.round((durationNum - hours) * 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const getLocationShort = (location) => {
    if (!location) return 'N/A';
    const parts = location.split(', ');
    return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : location;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Punch Records...</h2>
          <p className="text-gray-600">Please wait while we fetch your attendance data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Punch Records</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (punchRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Punch Records Found</h2>
          <p className="text-gray-600">You haven't punched in/out yet or no records are available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Punch Records</h1>
              <p className="text-gray-600">Your attendance and punch in/out history</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{punchRecords.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Punch Ins</p>
              <p className="text-2xl font-bold text-gray-900">
                {punchRecords.filter(r => r.punch_in_time).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Punch Outs</p>
              <p className="text-2xl font-bold text-gray-900">
                {punchRecords.filter(r => r.punch_out_time).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {punchRecords.map((record, index) => (
          <div key={record._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Date Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {new Date(record.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {formatDuration(record.duration, record.punch_in_time, record.punch_out_time)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Punch In Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Punch In</h4>
                  </div>
                  
                  <div className="space-y-3 pl-10">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-800">{formatTime(record.punch_in_time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Location:</span>
                      <span className="text-gray-700">{getLocationShort(record.punch_in_location)}</span>
                    </div>
                    
                    {record.punch_in_image_url && (
                      <div className="mt-3">
                        <img 
                          src={record.punch_in_image_url} 
                          alt="Punch In Image" 
                          className="w-full max-w-xs rounded-lg border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Punch Out Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Punch Out</h4>
                  </div>
                  
                  <div className="space-y-3 pl-10">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-800">{formatTime(record.punch_out_time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Location:</span>
                      <span className="text-gray-700">{getLocationShort(record.punch_out_location)}</span>
                    </div>
                    
                    {record.punch_out_image_url && (
                      <div className="mt-3">
                        <img 
                          src={record.punch_out_image_url} 
                          alt="Punch Out Image" 
                          className="w-full max-w-xs rounded-lg border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Employee ID:</span> 
                    <span>{record.employee_id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Record Key:</span> 
                    <span>{record.record_key}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Created:</span> 
                    <span>{formatTime(record.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PunchRecords;