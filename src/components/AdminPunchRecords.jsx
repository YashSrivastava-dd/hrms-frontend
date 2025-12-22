import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, User, RefreshCw, AlertCircle, Eye, X, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AdminPunchRecords = () => {
  const [punchRecords, setPunchRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageModalOpen,	setImageModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(25); // Show 50 records per page
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [punchCounts, setPunchCounts] = useState({ totalPunchIns: 0, totalPunchOuts: 0 });

  // Function to calculate total punch ins and outs from PunchRecords
  const calculatePunchCounts = (records) => {
    let totalPunchIns = 0;
    let totalPunchOuts = 0;

    records.forEach(record => {
      if (record.PunchRecords) {
        // Split by comma to get individual punch records
        const punches = record.PunchRecords.split(',').filter(punch => punch.trim());
        
        punches.forEach(punch => {
          const trimmedPunch = punch.trim();
          if (trimmedPunch.toLowerCase().includes('in') && trimmedPunch.includes(':')) {
            totalPunchIns++;
          } else if (trimmedPunch.toLowerCase().includes('out') && trimmedPunch.includes(':')) {
            totalPunchOuts++;
          }
        });
      }
    });

    return { totalPunchIns, totalPunchOuts };
  };

  useEffect(() => {
    console.log('AdminPunchRecords: Component mounted, fetching data...');
    fetchPunchRecords();
  }, [currentPage]);

  useEffect(() => {
    // Filter records based on search term
    if (searchTerm.trim() === '') {
      setFilteredRecords(punchRecords);
      // Calculate punch counts for all records
      setPunchCounts(calculatePunchCounts(punchRecords));
      // Reset to page 1 when clearing search
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    } else {
      const filtered = punchRecords.filter(record => 
        record.employeeId && record.employeeId.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
      // Calculate punch counts for filtered records
      setPunchCounts(calculatePunchCounts(filtered));
    }
  }, [searchTerm, punchRecords]);

  // Debounced search to avoid too many API calls
  const debouncedSearch = (searchValue) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      handleSearch(searchValue);
    }, 500); // Wait 500ms after user stops typing
    
    setSearchTimeout(timeout);
  };

  // Enhanced search function that searches across all records
  const handleSearch = async (searchValue) => {
    if (!searchValue.trim()) {
      // Reset to page 1 and reload all records
      setCurrentPage(1);
      setSearchTerm('');
      return;
    }

    setSearchTerm(searchValue);
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Search across all records by fetching all pages
      const searchUrl = `${API_BASE_URL}/api/get-all-out-duty-records?limit=1000`; // Get all records for search
      
      const response = await fetch(searchUrl, {
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
      
      if (result.statusCode === 200 && result.statusValue === 'SUCCESS' && result.data) {
        // Filter by employee ID across all records
        const filtered = result.data.filter(record => 
          record.employeeId && record.employeeId.toString().toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredRecords(filtered);
        
        // Calculate punch counts for search results
        setPunchCounts(calculatePunchCounts(filtered));
        
        console.log(`Search for "${searchValue}" found ${filtered.length} records`);
      }
    } catch (err) {
      console.error('Error searching records:', err);
      // Fallback to local search if API fails
      const filtered = punchRecords.filter(record => 
        record.employeeId && record.employeeId.toString().toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredRecords(filtered);
    } finally {
      setLoading(false);
    }
  };

  const fetchPunchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${API_BASE_URL}/api/get-all-out-duty-records?page=${currentPage}&limit=${limit}`;
      
      console.log('Fetching admin punch records from:', url);
      console.log('Using token:', token ? 'Token present' : 'No token');
      
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
      console.log('Admin punch records response:', result);
      
      if (result.statusCode === 200 && result.statusValue === 'SUCCESS' && result.data) {
        setPunchRecords(result.data);
        setFilteredRecords(result.data);
        
        // Calculate punch counts for the loaded records
        setPunchCounts(calculatePunchCounts(result.data));
        
        // Extract pagination info
        if (result.pagination) {
          setCurrentPage(result.pagination.currentPage);
          setTotalPages(result.pagination.totalPages);
          setTotalRecords(result.pagination.totalRecords);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch punch records');
      }
    } catch (err) {
      console.error('Error fetching admin punch records:', err);
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
    if (!punchInTime || !punchOutTime || punchOutTime === 'null' || punchOutTime === null) return 'Still Working';
    
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
    if (!dateTimeString || dateTimeString === 'null' || dateTimeString === null) return 'Still Working';
    
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

  const handleViewDetails = (record) => {
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
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch attendance data</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Punch Records</h1>
              <p className="text-gray-600">All employee attendance and punch in/out history</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
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
                <p className="text-2xl font-bold text-gray-900">{punchCounts.totalPunchIns}</p>
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
                <p className="text-2xl font-bold text-gray-900">{punchCounts.totalPunchOuts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Search className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Employee ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleSearch(''); // Reset search
                }}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Employee ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Attendance Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">In Time</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Out Time</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Duration</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ? 'No Records Found' : 'No Punch Records Found'}
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm ? `No records found for Employee ID: ${searchTerm}` : 'No attendance records available.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      {/* Employee ID */}
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

                      {/* In Time */}
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

                      {/* Out Time */}
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

                      {/* Duration */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {(() => {
                          const duration = record.Duration?.trim() || calculateDuration(record.InTime, record.OutTime);
                          const isStillWorking = duration === 'Still Working' || !record.OutTime;
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isStillWorking ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {duration}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(record)}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-1 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
                      {selectedRecord.Duration?.trim() || calculateDuration(selectedRecord.InTime, selectedRecord.OutTime)}
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

export default AdminPunchRecords;
