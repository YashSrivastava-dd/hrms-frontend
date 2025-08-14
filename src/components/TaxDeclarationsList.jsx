import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaDownload, FaPlus, FaCalendarAlt, FaUser, FaFileAlt, FaFilter, FaSearch } from 'react-icons/fa';
import { getTaxDeclarationsAction } from '../store/action/userDataAction';
import { safeGet } from '../utils/safariHelpers';
import safeToast from '../utils/safeToast';

const TaxDeclarationsList = ({ onViewDeclaration, onCreateNew }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.taxDeclarationsList);
  const { data: userData } = useSelector(state => state.userData);
  const [declarations, setDeclarations] = useState([]);
  const [filteredDeclarations, setFilteredDeclarations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTaxRegime, setSelectedTaxRegime] = useState('');
  
  // Get user role
  const userRole = safeGet(userData, 'data.role', null);
  const currentEmployeeId = safeGet(userData, 'data.employeeId', null);

  useEffect(() => {
    if (userRole) {
      fetchDeclarations();
    }
  }, [userRole]);

  useEffect(() => {
    if (data && data.data) {
      console.log('TaxDeclarationsList: Received data:', data.data);
      console.log('User role:', userRole, 'Current employee ID:', currentEmployeeId);
      
      // Log each declaration to see what we're getting
      data.data.forEach((decl, index) => {
        console.log(`Declaration ${index}:`, {
          employeeId: decl.employeeId,
          employeeName: decl.employeeName,
          taxRegime: decl.taxRegime
        });
      });
      
      setDeclarations(data.data);
      setFilteredDeclarations(data.data);
    }
  }, [data, userRole, currentEmployeeId]);

  // Filter declarations based on search and filters
  useEffect(() => {
    let filtered = declarations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(declaration => 
        declaration.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        declaration.employeeId?.toString().includes(searchTerm) ||
        declaration.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Employee filter (for HR/Manager)
    if (selectedEmployee) {
      filtered = filtered.filter(declaration => declaration.employeeId === selectedEmployee);
    }

    // Tax regime filter
    if (selectedTaxRegime) {
      filtered = filtered.filter(declaration => declaration.taxRegime === selectedTaxRegime);
    }

    setFilteredDeclarations(filtered);
  }, [declarations, searchTerm, selectedEmployee, selectedTaxRegime]);

  const fetchDeclarations = async () => {
    try {
      console.log('TaxDeclarationsList: Fetching declarations for user role:', userRole);
      console.log('Current employee ID:', currentEmployeeId);
      
      const filterParams = selectedEmployee ? { employeeId: selectedEmployee } : {};
      const result = await dispatch(getTaxDeclarationsAction(filterParams));
      
      console.log('Fetch result:', result);
      
      if (!result.success) {
        safeToast.error(result.error || 'Failed to fetch declarations');
      } else {
        console.log('Successfully fetched declarations, count:', result.data?.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching declarations:', error);
      safeToast.error('An error occurred while fetching declarations');
    }
  };

  // Get unique employees for filter dropdown
  const getUniqueEmployees = () => {
    const employees = declarations.map(d => ({
      id: d.employeeId,
      name: d.employeeName
    }));
    return employees.filter((emp, index, arr) => 
      arr.findIndex(e => e.id === emp.id) === index
    );
  };

  const handleEmployeeFilterChange = (employeeId) => {
    setSelectedEmployee(employeeId);
    // Refetch data with new filter for managers
    if (userRole === "Manager" && employeeId) {
      dispatch(getTaxDeclarationsAction({ employeeId }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getTaxRegimeBadge = (regime) => {
    const isNew = regime === 'New';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        isNew 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {regime} Tax Regime
      </span>
    );
  };

  const handleViewDeclaration = (declaration) => {
    if (onViewDeclaration) {
      onViewDeclaration(declaration);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading declarations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <FaFileAlt className="mx-auto h-12 w-12 mb-2" />
          <h3 className="text-lg font-medium">Error Loading Declarations</h3>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <button
          onClick={fetchDeclarations}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

      const getHeaderText = () => {
      switch (userRole) {
        case "HR-Admin":
        case "Super-Admin":
          return {
            title: "All Tax Declarations",
            subtitle: "View and manage all employee tax declarations"
          };
        case "Manager":
          return {
            title: "Team Tax Declarations", 
            subtitle: "View your team's tax declarations"
          };
        default:
          return {
            title: "My Tax Declarations",
            subtitle: "Manage your income tax investment declarations"
          };
      }
    };

    const headerText = getHeaderText();

    return (
    <div className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">{headerText.title}</h1>
            <p className="text-blue-100">{headerText.subtitle}</p>
            {userRole && (
              <span className="inline-block bg-blue-700 text-blue-100 px-3 py-1 rounded-full text-xs font-medium mt-2">
                {userRole} View
              </span>
            )}
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
          >
            <FaPlus />
            <span>New Declaration</span>
          </button>
        </div>
      </div>

      {/* Filters Section - Only for HR and Managers */}
      {(userRole === "HR-Admin" || userRole === "Super-Admin" || userRole === "Manager") && (
        <div className="bg-gray-50 border-b p-4">
          <div className="flex flex-wrap items-center space-x-4 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Search */}
            <div className="flex items-center space-x-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Employee Filter - Only for HR */}
            {(userRole === "HR-Admin" || userRole === "Super-Admin") && (
              <select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeFilterChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {getUniqueEmployees().map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
            )}

            {/* Tax Regime Filter */}
            <select
              value={selectedTaxRegime}
              onChange={(e) => setSelectedTaxRegime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tax Regimes</option>
              <option value="New">New Tax Regime</option>
              <option value="Old">Old Tax Regime</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedEmployee || selectedTaxRegime) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedEmployee('');
                  setSelectedTaxRegime('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Results Summary */}
        {(userRole === "HR-Admin" || userRole === "Super-Admin" || userRole === "Manager") && declarations.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredDeclarations.length} of {declarations.length} declarations
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedEmployee && ` for employee ${selectedEmployee}`}
            {selectedTaxRegime && ` with ${selectedTaxRegime} tax regime`}
          </div>
        )}

        {filteredDeclarations.length === 0 && declarations.length > 0 ? (
          <div className="text-center py-12">
            <FaSearch className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Matching Declarations</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEmployee('');
                setSelectedTaxRegime('');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : filteredDeclarations.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {userRole === "HR-Admin" || userRole === "Super-Admin" 
                ? "No Tax Declarations Found" 
                : userRole === "Manager" 
                ? "No Team Declarations Found" 
                : "No Declarations Found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {userRole === "HR-Admin" || userRole === "Super-Admin" 
                ? "No employees have submitted tax declarations yet." 
                : userRole === "Manager" 
                ? "Your team members haven't submitted any tax declarations yet." 
                : "You haven't created any tax declarations yet."}
            </p>
            {(userRole !== "Manager") && (
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <FaPlus />
                <span>Create Your First Declaration</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeclarations.map((declaration, index) => (
              <div key={declaration._id || index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <FaUser className="text-blue-600" />
                        <span>{declaration.employeeName}</span>
                      </h3>
                      {getTaxRegimeBadge(declaration.taxRegime)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-gray-400" />
                        <span>ID: {declaration.employeeId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaFileAlt className="text-gray-400" />
                        <span>{declaration.designation}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Joined: {formatDate(declaration.dateOfJoining)}</span>
                      </div>
                    </div>

                    {declaration.createdAt && (
                      <div className="mt-2 text-xs text-gray-500">
                        Submitted: {formatDate(declaration.createdAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDeclaration(declaration)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <FaEye />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleViewDeclaration(declaration)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <FaDownload />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxDeclarationsList;
