import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getTeammateDataAction, 
  getUserDataAction, 
  getAllUserDataAction,
  deleteEmployeeAction,
  restoreEmployeeAction,
  getDeletedEmployeesAction
} from "../../store/action/userDataAction";
import SingleTeamatesProfile from './SingleTeamatesProfile';
import { FaSearch, FaUsers, FaFilter, FaChevronDown, FaTrash, FaUndo } from 'react-icons/fa';
import ConfirmationDialog from '../CommonComponent/ConfirmationDialog';
import safeToast from '../../utils/safeToast';

const TeammatesProfile = ({selectedTag}) => {
  const { data: teammateData } = useSelector((state) => state.teammateData);
  const { data: allUserData } = useSelector((state) => state.allUserData);
  const { data: userData } = useSelector((state) => state.userData);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [employeeTicket, setEmployeeTicket] = useState('');
  const [employeeLeaveBalance, setemployeeLeaveBalance] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'deleted'
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState(null);
  const [selectedEmployeeForRestore, setSelectedEmployeeForRestore] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  
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
      // Fetch deleted employees if on deleted tab
      if (activeTab === 'deleted') {
        fetchDeletedEmployees();
      }
    } else {
      // For other users, fetch teammate data
      dispatch(getTeammateDataAction());
    }
    dispatch(getUserDataAction());
  }, [dispatch, isAdminUser, activeTab]);

  // Fetch deleted employees
  const fetchDeletedEmployees = async () => {
    if (!isAdminUser) return;
    setLoadingDeleted(true);
    try {
      await dispatch(getDeletedEmployeesAction());
      // The data will be in Redux state, we'll get it from there
    } catch (error) {
      console.error('Error fetching deleted employees:', error);
    } finally {
      setLoadingDeleted(false);
    }
  };

  // Get deleted employees from Redux state
  const deletedEmployeesState = useSelector((state) => state.deletedEmployees);
  
  useEffect(() => {
    if (isAdminUser && activeTab === 'deleted' && deletedEmployeesState?.data) {
      if (deletedEmployeesState.data.data) {
        setDeletedEmployees(deletedEmployeesState.data.data);
      } else if (Array.isArray(deletedEmployeesState.data)) {
        setDeletedEmployees(deletedEmployeesState.data);
      } else {
        setDeletedEmployees([]);
      }
    }
  }, [isAdminUser, activeTab, deletedEmployeesState]);

  // Handle delete employee
  const handleDeleteClick = (employee) => {
    setSelectedEmployeeForDelete(employee);
    setDeletionReason('');
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployeeForDelete) return;
    
    setDeleting(true);
    try {
      await dispatch(deleteEmployeeAction(selectedEmployeeForDelete.employeeId, deletionReason));
      // Refresh employee list
      dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
      setDeleteModalOpen(false);
      setSelectedEmployeeForDelete(null);
      setDeletionReason('');
    } catch (error) {
      console.error('Error deleting employee:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Handle restore employee
  const handleRestoreClick = (employee) => {
    setSelectedEmployeeForRestore(employee);
    setRestoreModalOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedEmployeeForRestore) return;
    
    setRestoring(true);
    try {
      await dispatch(restoreEmployeeAction(selectedEmployeeForRestore.employeeId));
      // Refresh both lists
      dispatch(getAllUserDataAction({ page: 1, limit: 1000 }));
      fetchDeletedEmployees();
      setRestoreModalOpen(false);
      setSelectedEmployeeForRestore(null);
    } catch (error) {
      console.error('Error restoring employee:', error);
    } finally {
      setRestoring(false);
    }
  };
  
  // Filter teammates
  const filteredTeammates = React.useMemo(() => {
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

    return filtered;
  }, [employeeData, searchQuery, filterRole]);


  const getUniqueRoles = () => {
    if (!employeeData) return [];
    const roles = employeeData.map(teammate => teammate.designation).filter(Boolean);
    return ['all', ...Array.from(new Set(roles))];
  };

  const handleRoleSelect = (role) => {
    setFilterRole(role);
    setShowRoleDropdown(false);
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRoleDropdown && !event.target.closest('.role-dropdown')) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

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
                {activeTab === 'active' && (
                  <>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {filteredTeammates.length} members
                    </span>
                    {employeeData && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        Total: {employeeData.length}
                      </span>
                    )}
                  </>
                )}
                {activeTab === 'deleted' && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                    {deletedEmployees.length} deleted
                  </span>
                )}
              </div>
            </div>

            {/* Tabs for HR Admin */}
            {isAdminUser && (
              <div className="mt-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'active'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Active Employees
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('deleted');
                      fetchDeletedEmployees();
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'deleted'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Deleted Employees
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Custom Role Filter Dropdown */}
              <div className="relative role-dropdown">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center justify-between w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 ${
                    filterRole !== 'all'
                      ? 'border-blue-300 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaFilter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {filterRole === 'all' ? 'All Roles' : filterRole}
                    </span>
                  </div>
                  <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    showRoleDropdown ? 'rotate-180' : ''
                  } ${filterRole !== 'all' ? 'text-blue-500' : 'text-gray-400'}`} />
                </button>

                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: '280px' }}>
                      {getUniqueRoles().map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role)}
                          className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                            filterRole === role
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              filterRole === role ? 'border-white bg-white' : 'border-gray-300'
                            }`}></div>
                            <div>
                              <span className="font-medium">
                                {role === 'all' ? 'All Roles' : role}
                              </span>
                              <p className="text-xs opacity-75">
                                {role === 'all' ? 'Show all team members' : `Filter by ${role} role`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Active Employees Table */}
          {activeTab === 'active' && (
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
                    {filteredTeammates?.map((teammate, index) => (
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
                          <div className="flex items-center space-x-2">
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
                            {isAdminUser && (
                              <button
                                onClick={() => handleDeleteClick(teammate)}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                                title="Delete Employee"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredTeammates?.length === 0 && (
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
          )}

          {/* Deleted Employees Table (HR Admin only) */}
          {isAdminUser && activeTab === 'deleted' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Loading State */}
              {loadingDeleted && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading deleted employees...</p>
                </div>
              )}
              
              {/* Data Table */}
              {!loadingDeleted && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200">
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
                          Deleted At
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Deletion Reason
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {deletedEmployees?.length > 0 ? (
                        deletedEmployees.map((employee, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-50 transition-all duration-200 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                AgVa-{employee?.employeeId || employee?.employee_code || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white font-semibold text-sm">
                                    {employee?.employeeName?.charAt(0)?.toUpperCase() || employee?.employee_name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 truncate max-w-[150px]">
                                    {employee?.employeeName || employee?.employee_name || "Unknown Employee"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 truncate max-w-[120px]">
                                {employee?.designation || "No designation"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {employee?.deletedAt ? new Date(employee.deletedAt).toLocaleDateString() : employee?.deleted_at ? new Date(employee.deleted_at).toLocaleDateString() : '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 max-w-[200px] truncate block" title={employee?.deletionReason || employee?.deletion_reason || 'No reason provided'}>
                                {employee?.deletionReason || employee?.deletion_reason || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleRestoreClick(employee)}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                                title="Restore Employee"
                              >
                                <FaUndo className="w-4 h-4 mr-2" />
                                Restore
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUsers className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted employees found</h3>
                              <p className="text-gray-500">There are no deleted employees at the moment</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal with Reason Input */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-red-200 animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-200">
              <div className="p-3 rounded-full bg-red-100">
                <div className="text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Delete Employee</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                Are you sure you want to delete <strong>{selectedEmployeeForDelete?.employeeName || 'this employee'}</strong>? This action can be reverted.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deletion Reason (Optional)
                </label>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Enter reason for deletion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedEmployeeForDelete(null);
                  setDeletionReason('');
                }}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      <ConfirmationDialog
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setSelectedEmployeeForRestore(null);
        }}
        onConfirm={handleRestoreConfirm}
        title="Restore Employee"
        message={`Do you want to restore ${selectedEmployeeForRestore?.employeeName || selectedEmployeeForRestore?.employee_name || 'this employee'}?`}
        confirmText="Restore"
        cancelText="Cancel"
        type="success"
        isLoading={restoring}
      />
    </div>
  );
};

export default TeammatesProfile;
