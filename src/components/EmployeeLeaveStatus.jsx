import React, { useEffect, useState, useRef, useCallback } from "react";
import { FileText, Calendar, Clock, Users, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { FiDownload } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmployeeLeaveCountAction,
  getLeaveApproveRequestAction,
  getUserDataAction,
  putApprovedLeaveByManagerAction,
  getCompoffLeaveRequestAction,
  putCompOffLeaveRequestAction,
  getVendorLogsAction,
  putVendorStatusDataAction,
  deleteVendorMeetingAction,
  putRevertLeaveByManagerAction,
  putRevertApprovedLeaveAction,
} from "../store/action/userDataAction";
import safeToast from "../utils/safeToast";

// Function to get leave type abbreviation
const getLeaveTypeAbbreviation = (leaveType) => {
  const abbreviations = {
    casualLeave: "CL",
    compOffLeave: "CO",
    earnedLeave: "EL", 
    optionalLeave: "OL",
    shortLeave: "SL",
    uninformedLeave: "UL",
    vendorMeeting: "VM",
    compOff: "CO",
    sickLeave: "SL",
    medicalLeave: "ML",
    // maternityLeave: "ML",
    // paternityLeave: "PL",
    bereavementLeave: "BL",
    studyLeave: "STL",
    sabbaticalLeave: "SAB"
  };
  
  return abbreviations[leaveType] || leaveType;
};

// Function to get document icon based on file type
const getDocumentIcon = (fileName) => {
  if (!fileName) return FileText;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return FileText;
    case 'doc':
    case 'docx':
      return FileText;
    default:
      return FileText;
  }
};

// Function to extract document data from item
const getDocumentData = (item) => {
  // Check if item has a valid direct location field (for medical certificates)
  if (item?.location && item.location.trim() !== '') {
    const docData = {
      location: item.location,
      originalname: item.reason ? 'Medical Certificate' : 'Document',
      mimetype: 'application/pdf' // Default to PDF since most medical certs are PDFs
    };
    console.log('getDocumentData: Found document at root level:', docData);
    return docData;
  }
  
  // Check for nested document fields
  const nestedDoc = item?.medicalCertificate || item?.document || item?.file;
  if (nestedDoc && nestedDoc.location && nestedDoc.location.trim() !== '') {
    console.log('getDocumentData: Found nested document:', nestedDoc);
    return nestedDoc;
  }
  
  console.log('getDocumentData: No valid document found for item:', item);
  return null;
};
// api/common/get-emp-leaves-count
// Tab component
const Tab = ({ active, onClick, children, icon: Icon, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group relative flex items-center gap-3 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 transform ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 scale-105'
        : disabled
        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:scale-105'
    }`}
  >
    {Icon && (
      <Icon className={`w-5 h-5 transition-all duration-300 ${
        active ? 'text-white' : disabled ? 'text-gray-400' : 'text-gray-500 group-hover:text-gray-700'
      }`} />
    )}
    <span className="relative">
      {children}
      {active && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></div>
      )}
    </span>
  </button>
);

// Custom dropdown component
const CustomDropdown = ({ value, onChange, options, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm min-w-[160px]"
      >
        <span className="text-left">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-base hover:bg-gray-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status, type = "default" }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "Approved":
        return { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle };
      case "Rejected":
        return { bg: "bg-red-100", text: "text-red-800", icon: XCircle };
      case "Pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: Clock };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

// Action buttons component
const ActionButtons = ({ item, onApprove, onReject, onDelete, onRevert, loading, type = "leave" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const isPending = item?.status === "Pending";
  const isApproved = item?.status === "Approved";

  if (!isPending) {
    if (isApproved) {
      // Show revert button for approved leaves
      if (onRevert && type === "leave") {
        return (
          <div className="flex gap-1">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Approved
            </span>
            <button
              onClick={() => onRevert(item)}
              disabled={loading}
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800'
              }`}
              title="Revert this approved leave"
            >
              <span className="text-orange-600 mr-1">↶</span>
              Revert
            </button>
          </div>
        );
      }
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-400">
        -
      </span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-200 min-w-[80px] ${
          loading
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-1"></div>
            Processing...
          </>
        ) : (
          <>
            Actions
            <svg className={`ml-1 h-3 w-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showDropdown && !loading && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                onApprove(item);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-200 flex items-center"
            >
              <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
              Approve
            </button>
            <button
              onClick={() => {
                onReject(item);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors duration-200 flex items-center"
            >
              <XCircle className="w-3 h-3 mr-2 text-red-600" />
              Reject
            </button>
            {type === "vendor" && onDelete && (
              <button
                onClick={() => {
                  onDelete(item);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                <XCircle className="w-3 h-3 mr-2 text-red-600" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
const EmployeeLeaveStatus = () => {
  const dispatch = useDispatch();
  
  // Redux selectors with better error handling
  const leaveState = useSelector((state) => state.managerLeaveApprove) || {};
  const compOffState = useSelector((state) => state.compoffApprove) || {};
  const vendorState = useSelector((state) => state.vendorLogsData) || {};
  const userState = useSelector((state) => state.userData) || {};
  
  const leaveData = leaveState?.data || {};
  const compOffData = compOffState?.data || {};
  const vendorData = vendorState?.data || {};
  const userData = userState?.data || {};

  // State
  const [activeTab, setActiveTab] = useState("leave");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show more items per page for better UX
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState({
    compOff: false,
    vendor: false
  });
  const [viewMode, setViewMode] = useState("pending"); // "pending", "approved", or "rejected"

  // Status filter options
  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" }
  ];

  // Data with safe fallbacks
  const leaveRequests = Array.isArray(leaveData?.data) ? leaveData.data : [];
  const compOffRequests = Array.isArray(compOffData?.data) ? compOffData.data : [];
  const vendorMeetings = Array.isArray(vendorData?.data) ? vendorData.data : [];


  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Load essential data first - fetch all data without pagination
        await dispatch(getUserDataAction());
        await dispatch(getLeaveApproveRequestAction({ page: 1, limit: 1000 })); // Fetch all data
        
        // Load optional data with error handling
        try {
          await dispatch(getCompoffLeaveRequestAction({ page: 1, limit: 10000 })); // Fetch all data
          setAvailableFeatures(prev => ({ ...prev, compOff: true }));
        } catch (error) {
          console.warn('Comp-off API not available:', error);
          setAvailableFeatures(prev => ({ ...prev, compOff: false }));
        }
        
        try {
          await dispatch(getVendorLogsAction({ page: 1, limit: 1000 })); // Fetch all data
          setAvailableFeatures(prev => ({ ...prev, vendor: true }));
        } catch (error) {
          console.warn('Vendor logs API not available:', error);
          setAvailableFeatures(prev => ({ ...prev, vendor: false }));
        }
        
      } catch (error) {
        console.error('Error loading essential data:', error);
        setHasError(true);
        safeToast.error('Failed to load essential data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]); // Remove currentPage and itemsPerPage since we fetch all data

  // Cleanup toasts on component unmount
  useEffect(() => {
    return () => {
      safeToast.dismiss();
    };
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    // Check if the tab is available
    if (tab === "compOff" && !availableFeatures.compOff) return;
    if (tab === "vendor" && !availableFeatures.vendor) return;
    
    setActiveTab(tab);
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // Auto-switch to available tab if current tab is not available
  useEffect(() => {
    if (activeTab === "compOff" && !availableFeatures.compOff) {
      setActiveTab("leave");
    }
    if (activeTab === "vendor" && !availableFeatures.vendor) {
      setActiveTab("leave");
    }
  }, [activeTab, availableFeatures]);

  // Handle document viewing
  const handleViewDocument = (location, documentName) => {
    if (!location || location.trim() === '') {
      safeToast.error('Document location not available. The file may not have been uploaded properly.');
      return;
    }

    setDocumentLoading(true);
    setSelectedDocument({
      location: location.trim(),
      documentName: documentName || 'Document'
    });
  };

  const closeDocumentViewer = () => {
    setSelectedDocument(null);
    setDocumentLoading(false);
  };

  const handleDownload = (location, documentName) => {
    if (!location) {
      safeToast.error('Download link not available');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = location;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      window.open(location, '_blank');
    }
  };

  // Handle leave approval/rejection
  const handleLeaveAction = useCallback(async (action, item) => {
    const status = action === "approve" ? "Approved" : "Rejected";
    setApprovalLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      await dispatch(putApprovedLeaveByManagerAction({ status, id: item._id }));
      safeToast.success(`Leave request ${status.toLowerCase()} successfully!`);
    dispatch(getLeaveApproveRequestAction({ page: 1, limit: 1000 }));
    } catch (error) {
      safeToast.error(`Failed to ${status.toLowerCase()} leave request: ${error?.message || 'Something went wrong'}`);
    } finally {
      setApprovalLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }, [dispatch, currentPage, itemsPerPage]);

  // Handle comp-off approval/rejection
  const handleCompOffAction = useCallback(async (action, item) => {
    const status = action === "approve" ? "Approved" : "Rejected";
    setApprovalLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      await dispatch(putCompOffLeaveRequestAction({ status, id: item._id }));
      safeToast.success(`Comp-off request ${status.toLowerCase()} successfully!`);
      dispatch(getCompoffLeaveRequestAction({ page: 1, limit: 10000 }));
    } catch (error) {
      safeToast.error(`Failed to ${status.toLowerCase()} comp-off request: ${error?.message || 'Something went wrong'}`);
    } finally {
      setApprovalLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }, [dispatch, currentPage, itemsPerPage]);

  // Handle vendor meeting approval/rejection
  const handleVendorAction = useCallback(async (action, item) => {
    const status = action === "approve" ? "Approved" : "Rejected";
    setApprovalLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      await dispatch(putVendorStatusDataAction({ status, id: item._id }));
      safeToast.success(`Vendor meeting ${status.toLowerCase()} successfully!`);
      dispatch(getVendorLogsAction({ page: 1, limit: 1000 }));
    } catch (error) {
      safeToast.error(`Failed to ${status.toLowerCase()} vendor meeting: ${error?.message || 'Something went wrong'}`);
    } finally {
      setApprovalLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }, [dispatch]);

  // Handle vendor meeting deletion
  const handleVendorDelete = useCallback(async (item) => {
    if (!window.confirm('Are you sure you want to delete this vendor meeting request?')) {
      return;
    }

    setApprovalLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      await dispatch(deleteVendorMeetingAction({ id: item._id }));
      safeToast.success('Vendor meeting deleted successfully!');
      dispatch(getVendorLogsAction({ page: 1, limit: 1000 }));
    } catch (error) {
      safeToast.error(`Failed to delete vendor meeting: ${error?.message || 'Something went wrong'}`);
    } finally {
      setApprovalLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }, [dispatch]);

  // Handle reverting approved leaves
  const handleRevertApprovedLeave = useCallback(async (item) => {
    if (!item?._id) {
      safeToast.error("Invalid item selected for revert action.");
      return;
    }

    // Confirm the revert action
    const confirmRevert = window.confirm(
      `Are you sure you want to revert the approved leave for ${item?.employeeInfo?.employeeName}? This action cannot be undone.`
    );

    if (!confirmRevert) {
      return;
    }

    setApprovalLoading(prev => ({ ...prev, [item._id]: true }));

    try {
      // Call the revert API
      const result = await dispatch(putRevertApprovedLeaveAction({ 
        id: item._id,
        remarks: `Leave reverted by manager on ${new Date().toLocaleDateString()}`
      }));

      if (result?.success) {
        safeToast.success("Approved leave reverted successfully!");
        
        // Refresh the data to reflect the changes
        dispatch(getLeaveApproveRequestAction({ page: 1, limit: 1000 }));
      } else {
        safeToast.error(`Failed to revert leave: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      safeToast.error(`Failed to revert leave: ${error?.message || 'Something went wrong'}`);
    } finally {
      setApprovalLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }, [dispatch]);

  // Filter data based on search and status
  const getFilteredData = (data) => {
    try {
      if (!Array.isArray(data)) return [];
      
      return data.filter((item) => {
        if (!item || typeof item !== 'object') return false;
        
    const matchesSearch = searchTerm === "" || 
                         item?.employeeInfo?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item?.employeeInfo?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (activeTab === "compOff" && item?.compOffDate?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        let matchesStatus;
        if (viewMode === "approved") {
          matchesStatus = item?.status === "Approved";
        } else if (viewMode === "rejected") {
          matchesStatus = item?.status === "Rejected";
        } else {
          matchesStatus = statusFilter === "All" || item?.status === statusFilter;
        }
    
    return matchesSearch && matchesStatus;
  });
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "leave":
        return getFilteredData(leaveRequests);
      case "compOff":
        if (!availableFeatures.compOff) return [];
        return getFilteredData(compOffRequests);
      case "vendor":
        if (!availableFeatures.vendor) return [];
        return getFilteredData(vendorMeetings);
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  
  // Pagination logic
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode, activeTab]);

  // Render table based on active tab
  const renderTable = () => {
    if (currentData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {viewMode} {activeTab} requests found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
    }

  return (
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Employee</th>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Type</th>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Duration</th>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Period</th>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Documents</th>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Status</th>
              <th className="px-4 py-4 font-semibold text-gray-700 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item, idx) => {
                const employeeInitial = item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "U";
              const docData = getDocumentData(item);

                return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* Employee Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {employeeInitial}
                          </span>
                        </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                            {item?.employeeInfo?.employeeName || "Unknown Employee"}
                          </div>
                        <div className="text-xs text-gray-500">
                          {item?.employeeInfo?.designation || "No designation"}
                          </div>
                        </div>
                      </div>
                    </td>

                  {/* Type Column */}
                  <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getLeaveTypeAbbreviation(item?.leaveType) || "N/A"}
                      </span>
                    </td>

                    {/* Duration Column */}
                  <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item?.totalDays || 0} {(item?.totalDays === 1 || item?.totalDays === "1") ? "Day" : "Days"}
                      </span>
                    </td>

                    {/* Period Column */}
                  <td className="px-4 py-4">
                      <div className="text-xs text-gray-900">
                        {activeTab === "compOff" ? (
                          // For comp-off requests, show compOffDate
                          <div className="font-medium text-gray-800">
                            {item?.compOffDate ? (() => {
                              try {
                                const date = new Date(item.compOffDate);
                                if (!isNaN(date.getTime())) {
                                  const day = String(date.getDate()).padStart(2, '0');
                                  const month = String(date.getMonth() + 1).padStart(2, '0');
                                  const year = date.getFullYear();
                                  return `${day}-${month}-${year}`;
                                }
                                return item.compOffDate;
                              } catch (error) {
                                console.warn('Error formatting compOffDate:', error);
                                return item.compOffDate || "--";
                              }
                            })() : "--"}
                          </div>
                        ) : (
                          // For regular leave requests, show start and end dates
                          <>
                            <div className="font-medium text-gray-800">{item?.leaveStartDate || "--"}</div>
                            <div className="text-gray-500 text-[10px]">to</div>
                            <div className="font-medium text-gray-800">{item?.leaveEndDate || "--"}</div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Documents Column */}
                  <td className="px-4 py-4">
                    {docData ? (
                            <button
                              onClick={() => handleViewDocument(docData.location, docData.originalname)}
                              className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200"
                              title={`${docData.originalname || 'Document'} - Click to view`}
                            >
                        <Eye className="w-3 h-3 mr-1" />
                              View
                            </button>
                    ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              N/A
                            </span>
                    )}
                    </td>

                    {/* Status Column */}
                  <td className="px-4 py-4">
                    <StatusBadge status={item?.status} />
                    </td>

                    {/* Actions Column */}
                  <td className="px-4 py-4">
                    <ActionButtons
                        item={item} 
                      onApprove={(item) => {
                        if (activeTab === "leave") handleLeaveAction("approve", item);
                        else if (activeTab === "compOff") handleCompOffAction("approve", item);
                        else if (activeTab === "vendor") handleVendorAction("approve", item);
                      }}
                      onReject={(item) => {
                        if (activeTab === "leave") handleLeaveAction("reject", item);
                        else if (activeTab === "compOff") handleCompOffAction("reject", item);
                        else if (activeTab === "vendor") handleVendorAction("reject", item);
                      }}
                      onDelete={activeTab === "vendor" ? handleVendorDelete : null}
                      onRevert={activeTab === "leave" ? handleRevertApprovedLeave : null}
                      loading={approvalLoading[item?._id]}
                      type={activeTab}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    );
  };

  // Show loading state
  if (isLoading) {
            return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Employee Leave Data</h2>
          <p className="text-gray-600">Please wait while we fetch the latest information...</p>
                      </div>
                      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
                    </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">There was an error loading the leave management data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh Page
          </button>
                  </div>
                </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
            <h1 className="text-3xl font-bold text-gray-800">Employee Leave Management</h1>
            <p className="text-gray-600">Manage leave requests, comp-off approvals, and vendor meetings</p>
                  </div>
                    </div>
                  </div>

      {/* Enhanced Tabs */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex flex-wrap gap-1">
            <Tab
              active={activeTab === "leave"}
              onClick={() => handleTabChange("leave")}
              icon={Calendar}
            >
              Leave Requests
            </Tab>
            {availableFeatures.compOff && (
              <Tab
                active={activeTab === "compOff"}
                onClick={() => handleTabChange("compOff")}
                icon={Clock}
              >
                Comp-Off Approvals
              </Tab>
            )}
            {availableFeatures.vendor && (
              <Tab
                active={activeTab === "vendor"}
                onClick={() => handleTabChange("vendor")}
                icon={Users}
              >
                Vendor Meetings
              </Tab>
            )}
                    </div>
                  </div>
                </div>

      {/* Enhanced Search and Filter */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder={activeTab === "compOff" 
                  ? `Search ${viewMode} comp-off requests by employee, date, or reason...` 
                  : `Search ${viewMode} ${activeTab} requests...`}
                className="w-full pl-12 pr-4 py-4 text-base text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
                  
            {viewMode === "pending" && (
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Select Status"
                className="min-w-[160px]"
              />
            )}
                  
        {/* Enhanced View Mode Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex items-center gap-2">
                      <button
              onClick={() => setViewMode("pending")}
              className={`group relative flex items-center gap-3 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                viewMode === "pending"
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:scale-105'
              }`}
            >
              <Clock className={`w-4 h-4 transition-all duration-300 ${
                viewMode === "pending" ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              <span className="relative">
                Pending
                {viewMode === "pending" && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></div>
                )}
              </span>
                      </button>
                      <button
              onClick={() => setViewMode("approved")}
              className={`group relative flex items-center gap-3 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                viewMode === "approved"
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:scale-105'
              }`}
            >
              <CheckCircle className={`w-4 h-4 transition-all duration-300 ${
                viewMode === "approved" ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              <span className="relative">
                Approved
                {viewMode === "approved" && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></div>
                )}
              </span>
                      </button>
                      <button
              onClick={() => setViewMode("rejected")}
              className={`group relative flex items-center gap-3 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                viewMode === "rejected"
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:scale-105'
              }`}
            >
              <XCircle className={`w-4 h-4 transition-all duration-300 ${
                viewMode === "rejected" ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              <span className="relative">
                Rejected
                {viewMode === "rejected" && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></div>
                )}
              </span>
                      </button>
                    </div>
                </div>

              </div>
        </div>
        </div>

      {/* Table */}
      {renderTable()}

      {/* Pagination Navigation */}
      {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalItems} total {viewMode} {activeTab} requests)
            </div>

          {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

            {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="w-8 h-8 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                  </>
                )}

                {/* Current page and neighbors */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 1 + i));
                if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  const isCurrentPage = pageNum === currentPage;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isCurrentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Last page */}
              {currentPage < totalPages - 2 && (
                  <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                    <button
                    onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                    {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {selectedDocument.documentName || "Medical Certificate"}
              </h3>
              <button
                onClick={closeDocumentViewer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-hidden relative">
              {documentLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-3 text-gray-600 font-medium">Loading document preview...</p>
                  </div>
                </div>
              )}
              
              {/* Universal document viewer with multiple fallbacks */}
              <div className="w-full h-full relative">
                {/* Try direct image first for common formats */}
                {(() => {
                  const isCommonImage = selectedDocument.location && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedDocument.location);
                  console.log('=== MODAL DEBUG ===');
                  console.log('Selected document:', selectedDocument);
                  console.log('Is common image format?', isCommonImage);
                  console.log('Image URL for direct display:', selectedDocument.location);
                  
                  if (isCommonImage) {
                    return (
                      <img
                        src={selectedDocument.location}
                        alt="Medical Certificate"
                        className="direct-image w-full h-full object-contain rounded-lg"
                        onLoad={(e) => {
                          console.log('✅ Image loaded successfully');
                          console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                          setDocumentLoading(false);
                        }}
                        onError={(e) => {
                          console.log('❌ Direct image loading failed');
                          console.log('Image error event:', e);
                          console.log('Image src that failed:', e.target.src);
                          // Hide the image and show iframe instead
                          const iframe = document.querySelector('.fallback-iframe');
                          const image = document.querySelector('.direct-image');
                          if (iframe) iframe.style.display = 'block';
                          if (image) image.style.display = 'none';
                        }}
                      />
                    );
                  }
                  return null;
                })()}
                
                {/* Google Docs Viewer for documents and .heic files */}
                <iframe
                  src={(() => {
                    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(selectedDocument.location)}&embedded=true`;
                    console.log('🔍 Google Docs Viewer URL:', googleDocsUrl);
                    return googleDocsUrl;
                  })()}
                  className={`fallback-iframe w-full h-full border border-gray-300 rounded-lg ${
                    selectedDocument.location && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedDocument.location) 
                      ? 'hidden' : 'block'
                  }`}
                  frameBorder="0"
                  title="Document Preview"
                  onLoad={(e) => {
                    console.log('✅ Google Docs Viewer loaded successfully');
                    console.log('Iframe content window:', e.target.contentWindow);
                    setDocumentLoading(false);
                  }}
                  onError={(e) => {
                    console.log('❌ Google Docs Viewer failed');
                    console.log('Iframe error event:', e);
                    console.log('Failed iframe src:', e.target.src);
                    setDocumentLoading(false);
                    // Show error message
                    const errorDiv = document.querySelector('.preview-error');
                    const iframe = document.querySelector('.fallback-iframe');
                    if (errorDiv) errorDiv.style.display = 'flex';
                    if (iframe) iframe.style.display = 'none';
                  }}
                />
                
                {/* Error fallback - download option */}
                <div className="preview-error absolute inset-0 hidden flex-col items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center p-8">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                    <p className="text-gray-600 mb-6">This file format cannot be previewed in the browser.</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open(selectedDocument.location, '_blank')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Open in New Tab
                      </button>
                      <a
                        href={selectedDocument.location}
                        download
                        className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        Download File
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => handleDownload(selectedDocument.location, selectedDocument.documentName)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={closeDocumentViewer}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaveStatus;
