import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, MapPin, Calendar, User, RefreshCw, AlertCircle, Eye, X } from 'lucide-react';

const PunchRecords = () => {
  const [punchRecords, setPunchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
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

      if (!employeeId) {
        throw new Error('Employee ID not found');
      }

      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://13.238.116.26:3001';
      const url = `${baseUrl}/api/get-all-punch-records/${employeeId}`;
      
      console.log('Fetching punch records from:', url);
      console.log('Using token:', token ? 'Token present' : 'No token');
      console.log('Employee ID:', employeeId);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // Log detailed error for 400 errors
          if (response.status === 400) {
            console.error('=== 400 Bad Request Details ===');
            console.error('Full error response:', JSON.stringify(errorData, null, 2));
            console.error('Employee ID used:', employeeId);
            console.error('Employee ID type:', typeof employeeId);
            console.error('URL:', url);
            console.error('================================');
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Punch records response:', result);
      
      if (result.statusCode === 200 && result.statusValue === 'SUCCESS' && result.data) {
        setPunchRecords(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch punch records');
      }
    } catch (err) {
      console.error('Error fetching punch records:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        employeeId: employeeId,
        url: url
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPunchRecords();
    setRefreshing(false);
  };

  const calculateDuration = (punchInTime, punchOutTime) => {
    if (!punchInTime || !punchOutTime) return '--:--';
    
    try {
      const inTime = new Date(punchInTime);
      const outTime = new Date(punchOutTime);
      const diffMs = outTime - inTime;
      
      if (diffMs < 0) return '--:--';
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '--:--';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '--:--';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '--';
    }
  };

  const handleViewImages = (record) => {
    setSelectedRecord(record);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedRecord(null);
  };

  const getEmployeeInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Punch Records...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your attendance data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Records</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punch Records</h1>
              <p className="text-gray-600">Your attendance and punch in/out history</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{punchRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Punch Ins</p>
                <p className="text-2xl font-bold text-gray-900">{punchRecords.filter(record => record.InTime).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Punch Outs</p>
                <p className="text-2xl font-bold text-gray-900">{punchRecords.filter(record => record.OutTime).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Employee</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Attendance Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Punch In Time</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Punch Out Time</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Location</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Duration</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Details</th>
                </tr>
              </thead>
              <tbody>
                {punchRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Punch Records Found</h3>
                        <p className="text-gray-500">You haven't punched in/out yet today.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  punchRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      {/* Employee Column */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-sm">
                              {getEmployeeInitials(record.employeeId)}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-sm">{record.employeeId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Attendance Date */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(record.AttendanceDate)}
                          </span>
                        </div>
                      </td>

                      {/* Punch In Time */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(record.InTime)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(record.InTime)}
                          </span>
                        </div>
                      </td>

                      {/* Punch Out Time */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(record.OutTime)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(record.OutTime)}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 max-w-32 truncate" title={record.location}>
                            {record.location ? record.location.split('||')[0] : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {record.Duration || calculateDuration(record.InTime, record.OutTime)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.Status === 'Present' ? 'bg-green-100 text-green-800' : 
                          record.Status === 'Absent' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.Status || 'Unknown'}
                        </span>
                      </td>


                      {/* Details */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleViewImages(record)}
                          className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {imageModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ paddingTop: '80px' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden sm:max-w-5xl">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Punch Details</h3>
                </div>
                <button
                  onClick={closeImageModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Punch Records Timeline */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">All Punch Records</h4>
                  </div>

                  {/* Punch Records List */}
                  <div className="space-y-3">
                    {selectedRecord.PunchRecords ? (
                      selectedRecord.PunchRecords.split(',').filter(record => record.trim()).map((punch, index) => {
                        // Parse the punch record format: "14:09:in(IN)" or "14:30:out(OUT)"
                        const trimmedPunch = punch.trim();
                        const parts = trimmedPunch.split(':');
                        
                        if (parts.length >= 3) {
                          const time = `${parts[0]}:${parts[1]}`;
                          const actionPart = parts[2];
                          const isIn = actionPart && actionPart.toLowerCase().includes('in');
                          const isOut = actionPart && actionPart.toLowerCase().includes('out');
                          
                          
                          return (
                            <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                isIn ? 'bg-green-100' : isOut ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                <Clock className={`w-6 h-6 ${
                                  isIn ? 'text-green-600' : isOut ? 'text-red-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-900">
                                      {time || '--:--'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      isIn ? 'bg-green-100 text-green-800' : 
                                      isOut ? 'bg-red-100 text-red-800' : 
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {isIn ? 'PUNCH IN' : isOut ? 'PUNCH OUT' : 'UNKNOWN'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-gray-500">
                                      #{index + 1}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-sm text-gray-600">
                                    {isIn ? 'Employee arrived' : isOut ? 'Employee left' : 'Punch event'}
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {selectedRecord.location ? selectedRecord.location.split('||')[0] : 'Location not available'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        // Fallback for malformed records
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                              <Clock className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-700">
                                  {trimmedPunch}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                  UNKNOWN
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Punch Records</h3>
                        <p className="text-sm text-gray-500">No punch records available for this attendance</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location and Image Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Location Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-blue-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-blue-700">Location Details</h4>
                    </div>

                    {/* Location Section */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Location</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedRecord.location || 'Location not available'}
                      </p>
                    </div>

                    {/* Attendance Date */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Attendance Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedRecord.AttendanceDate)}
                      </p>
                          </div>

                    {/* Status */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Status</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRecord.Status === 'Present' ? 'bg-green-100 text-green-800' : 
                        selectedRecord.Status === 'Absent' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedRecord.Status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Image Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Eye className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-purple-700">Attendance Image</h4>
                    </div>

                    {/* Image Section */}
                    <div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {selectedRecord.imageUrl ? (
                          <img
                            src={selectedRecord.imageUrl}
                            alt="Attendance"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg"
                          style={{ display: selectedRecord.imageUrl ? 'none' : 'flex' }}
                        >
                          <div className="text-center">
                            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No image available</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Duration</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedRecord.Duration || calculateDuration(selectedRecord.InTime, selectedRecord.OutTime)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Employee</p>
                    <p className="text-base font-semibold text-gray-900">
                      Employee {selectedRecord.employeeId || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {selectedRecord.employeeId || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(selectedRecord.AttendanceDate || selectedRecord.InTime || selectedRecord.OutTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={closeImageModal}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchRecords;