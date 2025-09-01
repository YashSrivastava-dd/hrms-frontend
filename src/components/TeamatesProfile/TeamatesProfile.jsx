import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeammateDataAction, getUserDataAction, getAllUserDataAction } from "../../store/action/userDataAction";
import SingleTeamatesProfile from './SingleTeamatesProfile';
import { FaSearch, FaUsers, FaFilter, FaSort } from 'react-icons/fa';

const TeammatesProfile = ({selectedTag}) => {
  const { data: teammateData } = useSelector((state) => state.teammateData);
  const { data: allUserData } = useSelector((state) => state.allUserData);
  const { data: userData } = useSelector((state) => state.userData);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [employeeTicket, setEmployeeTicket] = useState('');
  const [employeeLeaveBalance, setemployeeLeaveBalance] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'id', 'designation'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [filterRole, setFilterRole] = useState('all');
  
  const dispatch = useDispatch();
  
  // Get user role to determine which API to use
  const userRole = userData?.data?.role;
  const isAdminUser = userRole === 'HR-Admin' || userRole === 'Super-Admin';
  
  // Use appropriate data source based on user role
  const employeeData = isAdminUser ? allUserData?.data : teammateData?.data;
  const dataLoading = useSelector((state) => 
    isAdminUser ? state.allUserData.loading : state.teammateData.loading
  );
  const dataError = useSelector((state) => 
    isAdminUser ? state.allUserData.error : state.teammateData.error
  );

  useEffect(() => {
    if (isAdminUser) {
      // For HR Admin and Super Admin, fetch all employee data
      dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
    } else {
      // For other users, fetch teammate data
      dispatch(getTeammateDataAction());
    }
    dispatch(getUserDataAction());
  }, [dispatch, isAdminUser]);
  
  // Filter and sort teammates
  const filteredAndSortedTeammates = React.useMemo(() => {
    if (!employeeData) return [];
    
    let filtered = employeeData.filter(teammate => {
      const matchesSearch = 
        teammate.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (`AgVa-${teammate.employeeId}`)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teammate.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teammate.contactNo?.includes(searchQuery);
      
      const matchesRole = filterRole === 'all' || teammate.designation?.toLowerCase().includes(filterRole.toLowerCase());
      
      return matchesSearch && matchesRole;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.employeeName?.toLowerCase() || '';
          bValue = b.employeeName?.toLowerCase() || '';
          break;
        case 'id':
          aValue = a.employeeId || 0;
          bValue = b.employeeId || 0;
          break;
        case 'designation':
          aValue = a.designation?.toLowerCase() || '';
          bValue = b.designation?.toLowerCase() || '';
          break;
        default:
          aValue = a.employeeName?.toLowerCase() || '';
          bValue = b.employeeName?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [employeeData, searchQuery, sortBy, sortOrder, filterRole]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getUniqueRoles = () => {
    if (!employeeData) return [];
    const roles = employeeData.map(teammate => teammate.designation).filter(Boolean);
    return ['all', ...Array.from(new Set(roles))];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {selectedComponent === "employee" && employeeData?.length > 0 && (
        <SingleTeamatesProfile
          onBack={() => setSelectedComponent(null)}
          employeeTicket={employeeTicket}
          employeeLeaveBalance={employeeLeaveBalance}
          employeeName={employeeData.find(teammate => teammate.employeeId === employeeTicket)?.employeeName || "Unknown"}
        />
      )}

      {!selectedComponent && (
        <div className="p-6 w-full">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
                  <p className="text-gray-600">View and manage your team profiles</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {filteredAndSortedTeammates.length} members
                </span>
                {employeeData && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Total: {employeeData.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  {getUniqueRoles().map((role) => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'All Roles' : role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="relative">
                <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="id">Sort by ID</option>
                  <option value="designation">Sort by Role</option>
                </select>
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span className="text-gray-700 font-medium">
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </span>
              </button>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Loading State */}
            {dataLoading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employee data...</p>
              </div>
            )}
            
            {/* Error State */}
            {dataError && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading employee data</h3>
                    <p className="mt-1 text-sm text-red-700">{dataError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Data Table */}
            {!dataLoading && !dataError && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Shift Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAndSortedTeammates?.map((teammate, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            AgVa-{teammate?.employeeId || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-sm">
                                {teammate?.employeeName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-[150px]" title={teammate?.employeeName || "Unknown Employee"}>
                                {teammate?.employeeName || "Unknown Employee"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 truncate max-w-[120px]" title={teammate?.designation || "No designation"}>
                            {teammate?.designation || "No designation"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">●</span>
                              <span>{teammate?.shiftTime?.startAt || '--'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-red-600">●</span>
                              <span>{teammate?.shiftTime?.endAt || '--'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{teammate?.contactNo || '--'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{teammate?.doj || '--'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedComponent("employee");
                              setEmployeeTicket(teammate?.employeeId);
                              setemployeeLeaveBalance(teammate?.leaveBalance);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredAndSortedTeammates?.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FaUsers className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                            <p className="text-gray-500">
                              {searchQuery || filterRole !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'No team members available at the moment'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeammatesProfile;
