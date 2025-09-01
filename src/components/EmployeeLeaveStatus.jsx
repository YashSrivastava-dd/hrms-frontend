import React, { useEffect, useState, useRef, useCallback } from "react";
import { FileText } from "lucide-react";
import { FiDownload } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmployeeLeaveCountAction,
  getLeaveApproveRequestAction,
  getUserDataAction,
  putApprovedLeaveByManagerAction,
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
// Component for HR Admin to view and manage employee leave requests
// Features:
// - Summary statistics (Today Presents, Planned Leaves, Unplanned Leaves, Pending Requests)
// - Employee leave table with search functionality
// - Document viewing for medical certificates and other leave documents
// - Leave approval/rejection actions
const EmployeeLeaveStatus = () => {
  const { data } = useSelector((state) => state.managerLeaveApprove);
  const employeeStatusData = data?.data || [];
  const dispatch = useDispatch();

  // Calculate summary stats from table API data (current page only)
  // Note: Since table API only returns pending leaves, summary will only show current page data
  const calculatedSummary = {
    todayPresentCount: 0, // Not available from current API
    plannedLeaveCount: employeeStatusData.filter(item => 
      item?.status === "Approved" && new Date(item?.leaveStartDate) > new Date()
    ).length,
    unplannedLeaveCount: employeeStatusData.filter(item => 
      item?.status === "Approved" && new Date(item?.leaveStartDate) <= new Date()
    ).length,
    pendingReqCount: employeeStatusData.filter(item => item?.status === "Pending").length
  };
  
  // Add server totals for more accurate display  
  const enhancedSummary = {
    ...calculatedSummary,
    totalRecordsInSystem: data?.totalRecords || 0,
    currentPagePending: calculatedSummary.pendingReqCount
  };
  
  // Use calculated summary instead of separate API
  const employeeCount = calculatedSummary;
  
  console.log('=== CALCULATED SUMMARY FROM TABLE DATA ===');
  console.log('Calculated summary:', calculatedSummary);
  console.log('Table data count:', employeeStatusData.length);
  console.log('Pending from table:', calculatedSummary.pendingReqCount);
  console.log('=== END CALCULATED SUMMARY ===');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleViewDocument = (location, documentName) => {
    console.log('=== DEBUG: handleViewDocument called ===');
    console.log('Raw location:', location);
    console.log('Document name:', documentName);
    console.log('Location type:', typeof location);
    console.log('Location length:', location ? location.length : 'N/A');
    
    if (!location || location.trim() === '') {
      console.log('❌ Document location validation failed');
      alert('Document location not available. The file may not have been uploaded properly.');
      return;
    }

    const trimmedLocation = location.trim();
    console.log('✅ Document location valid:', trimmedLocation);
    
    // Check if it's an image file
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|heic|heif|tiff|tif)$/i.test(trimmedLocation);
    console.log('Is image file?', isImage);
    
    // Skip URL accessibility test for now to avoid CORS issues
    console.log('Skipping URL accessibility test to avoid CORS issues');

    console.log('Setting document for viewing...');
    setDocumentLoading(true);
    setSelectedDocument({
      location: trimmedLocation,
      documentName: documentName || 'Medical Certificate'
    });
    console.log('=== DEBUG: handleViewDocument complete ===');
  };

  const closeDocumentViewer = () => {
    setSelectedDocument(null);
    setDocumentLoading(false);
  };

  const handleDownload = (location, documentName) => {
    if (!location) {
      alert('Download link not available');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = location;
      link.download = documentName || 'medical-certificate';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(location, '_blank');
    }
  };

  useEffect(() => {
    dispatch(getUserDataAction());
    
    // Use only the table API for consistency
    console.log('🔍 Using table API for both summary and table data');
    dispatch(getLeaveApproveRequestAction({ page: currentPage, limit: itemsPerPage }));
    // Removed getEmployeeLeaveCountAction() - we'll calculate from table data
  }, [dispatch, currentPage, itemsPerPage]);

  // Cleanup toasts on component unmount
  useEffect(() => {
    return () => {
      safeToast.dismiss();
    };
  }, []);

  const [approvalLoading, setApprovalLoading] = useState({});

  const handelChangeStatus = useCallback(async (value, id, employeeName) => {
    console.log('=== DEBUG: handelChangeStatus called ===');
    console.log('Value:', value);
    console.log('ID:', id);
    console.log('Employee Name:', employeeName);
    
    // Map the dropdown values to the correct backend status values
    const status = value === "Approved" ? "Approved" : "Rejected";
    console.log('Mapped status:', status);
    
    // Set loading state for this specific item
    setApprovalLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      console.log('Dispatching putApprovedLeaveByManagerAction...');
      const result = await dispatch(putApprovedLeaveByManagerAction({ status, id }));
      console.log('Action result:', result);
      
      // Show success notification
      safeToast.success(
        `${employeeName}'s leave request ${status.toLowerCase()} successfully!`,
        { 
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        }
      );
      
              // Refresh the data to show updated status
        console.log('Refreshing data...');
        dispatch(getLeaveApproveRequestAction({ page: currentPage, limit: itemsPerPage }));
        // Summary will be recalculated automatically from the refreshed table data
      
    } catch (error) {
      console.error('Error in handelChangeStatus:', error);
      // Show error notification
      safeToast.error(
        `Failed to ${status.toLowerCase()} leave request: ${error?.response?.data?.message || error?.message || 'Something went wrong'}`,
        { 
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        }
      );
    } finally {
      // Clear loading state
      console.log('Clearing loading state for ID:', id);
      setApprovalLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [dispatch]);

  // Get server pagination data
  const serverTotalPages = data?.totalPages || 1;
  const serverCurrentPage = data?.currentPage || 1;
  const serverTotalRecords = data?.totalRecords || 0;

  // Debug: Log the server pagination data
  console.log('=== SERVER PAGINATION DEBUG ===');
  console.log('Server data:', data);
  console.log('Server totalPages:', serverTotalPages);
  console.log('Server currentPage:', serverCurrentPage);
  console.log('Server totalRecords:', serverTotalRecords);
  console.log('Current local page state:', currentPage);
  console.log('Items per page:', itemsPerPage);

  // Client-side filtering for search and status (on current page data)
  const filteredData = employeeStatusData.filter((item) => {
    const matchesSearch = searchTerm === "" || 
                         item?.employeeInfo?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item?.employeeInfo?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item?.leaveType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || item?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  console.log('Client filtered data length:', filteredData.length);
  console.log('Client filtered data:', filteredData);

  // Use filtered data directly (no additional pagination since server handles it)
  const paginatedData = filteredData;

  // Reset to first page when filters change and reload data
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // Only reload if we're already on page 1
      dispatch(getLeaveApproveRequestAction({ page: 1, limit: itemsPerPage }));
    }
  }, [searchTerm, statusFilter, dispatch, itemsPerPage]);

  // Debug: Log the first item to see the data structure
  useEffect(() => {
    if (employeeStatusData.length > 0) {
      console.log('EmployeeLeaveStatus: Sample data structure:', employeeStatusData[0]);
    }
  }, [employeeStatusData]);

  // Simplified Custom Dropdown Component - Direct Implementation
  const CustomDropdown = ({ item }) => {
    console.log('🔄 CustomDropdown rendered for item:', item?._id, 'Status:', item?.status);
    
    const dropdownRef = useRef(null);
    const dropdownId = `leave-${item?._id}`;
    const isOpen = openDropdown === dropdownId;
    const isPending = item?.status === "Pending";
    
    console.log('Dropdown state:', { dropdownId, isOpen, isPending, openDropdown });

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Direct approve handler
    const handleApprove = async () => {
      console.log('🔥 APPROVE BUTTON CLICKED - DIRECT!');
      console.log('Item ID:', item?._id);
      console.log('Employee Name:', item?.employeeInfo?.employeeName);
      
      if (!isPending) {
        safeToast.error("This request is no longer pending and cannot be modified.");
        return;
      }
      
      try {
        console.log('Calling handelChangeStatus directly...');
        await handelChangeStatus("Approved", item?._id, item?.employeeInfo?.employeeName);
        setOpenDropdown(null);
        console.log('✅ Direct approve completed');
      } catch (error) {
        console.error('❌ Direct approve error:', error);
        safeToast.error(`Error approving leave: ${error?.message || 'Something went wrong'}`);
      }
    };

    // Direct reject handler
    const handleReject = async () => {
      console.log('🔥 REJECT BUTTON CLICKED - DIRECT!');
      console.log('Item ID:', item?._id);
      console.log('Employee Name:', item?.employeeInfo?.employeeName);
      
      if (!isPending) {
        safeToast.error("This request is no longer pending and cannot be modified.");
        return;
      }
      
      try {
        console.log('Calling handelChangeStatus directly...');
        await handelChangeStatus("Rejected", item?._id, item?.employeeInfo?.employeeName);
        setOpenDropdown(null);
        console.log('✅ Direct reject completed');
      } catch (error) {
        console.error('❌ Direct reject error:', error);
        safeToast.error(`Error rejecting leave: ${error?.message || 'Something went wrong'}`);
      }
    };

    // If not pending, show dash for completed actions
    if (!isPending) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-400">
          -
        </span>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 ACTIONS DROPDOWN CLICKED!');
            console.log('Current state - isOpen:', isOpen, 'dropdownId:', dropdownId);
            setOpenDropdown(isOpen ? null : dropdownId);
          }}
          disabled={approvalLoading[item?._id]}
          className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-200 min-w-[80px] ${
            approvalLoading[item?._id]
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
        >
          {approvalLoading[item?._id] ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-1"></div>
              Processing...
            </>
          ) : (
            <>
              Actions
              <svg className={`ml-1 h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {isOpen && !approvalLoading[item?._id] && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 APPROVE BUTTON CLICKED - SIMPLIFIED!');
                  handleApprove();
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-200 flex items-center"
              >
                <svg className="w-3 h-3 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 REJECT BUTTON CLICKED - SIMPLIFIED!');
                  handleReject();
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors duration-200 flex items-center"
              >
                <svg className="w-3 h-3 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leaves</h2>
      </div>

      {/* Summary Stats - Calculated from Table Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryBox
          title="Total Records"
          count={data?.totalRecords || 0}
          ringColor="text-white"
          colorRing="blue-500"
        />
        <SummaryBox
          title="Current Page"
          count={employeeStatusData.length || 0}
          ringColor="text-white"
          colorRing="green-500"
        />
        <SummaryBox
          title="Pending (Page)"
          count={employeeCount?.pendingReqCount || 0}
          ringColor="text-white"
          colorRing="orange-400"
        />
        <SummaryBox
          title="Approved (Page)"
          count={employeeStatusData.filter(item => item?.status === "Approved").length || 0}
          ringColor="text-white"
          colorRing="emerald-500"
        />
      </div>

      {/* Employee Leave Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Employee Leave Management</h2>
        
        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search by employee name, designation, or leave type..."
              className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm min-w-[140px]"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Results Info */}
          <div className="text-sm text-gray-600 whitespace-nowrap">
            Showing {paginatedData.length} of {serverTotalRecords} total results
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="w-full text-sm min-w-full table-fixed">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-48">Employee</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-32">Leave Type</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-24">Duration</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-40">Period</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-28">Documents</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-24">Status</th>
                <th className="px-4 py-4 font-semibold text-gray-700 text-center text-sm w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item, idx) => {
                const employeeInitial = item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "U";
                const statusClass = (() => {
                  if (item?.status === "Approved") return "bg-green-100 text-green-800";
                  if (item?.status === "Rejected") return "bg-red-100 text-red-800";
                  if (item?.status === "Pending") return "bg-yellow-100 text-yellow-800";
                  return "bg-gray-100 text-gray-800";
                })();

                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    {/* Employee Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-start max-w-[200px]">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-blue-600 font-medium text-sm">
                            {employeeInitial}
                          </span>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm truncate" title={`${item?.employeeInfo?.employeeName || "Unknown Employee"} - ${item?.employeeInfo?.designation || "No designation"}`}>
                            {item?.employeeInfo?.employeeName || "Unknown Employee"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Leave Type Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getLeaveTypeAbbreviation(item?.leaveType) || "N/A"}
                      </span>
                    </td>

                    {/* Duration Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item?.totalDays || 0} {(item?.totalDays === 1 || item?.totalDays === "1") ? "Day" : "Days"}
                      </span>
                    </td>

                    {/* Period Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        <div className="font-medium text-gray-800">{item?.leaveStartDate || "--"}</div>
                        <div className="text-gray-500 text-[10px]">to</div>
                        <div className="font-medium text-gray-800">{item?.leaveEndDate || "--"}</div>
                      </div>
                    </td>

                    {/* Documents Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {(() => {
                        const docData = getDocumentData(item);
                        if (docData) {
                          return (
                            <button
                              onClick={() => handleViewDocument(docData.location, docData.originalname)}
                              className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200"
                              title={`${docData.originalname || 'Document'} - Click to view`}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          );
                        } else if (item?.leaveType === 'medicalLeave' || item?.leaveType === 'sickLeave') {
                          return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              No Document
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              N/A
                            </span>
                          );
                        }
                      })()}
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {item?.status || "---"}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <CustomDropdown 
                        item={item} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden space-y-4">
          {paginatedData.map((item, idx) => {
            const employeeInitial = item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "U";
            const statusClass = (() => {
              if (item?.status === "Approved") return "bg-green-100 text-green-800";
              if (item?.status === "Rejected") return "bg-red-100 text-red-800";
              if (item?.status === "Pending") return "bg-yellow-100 text-yellow-800";
              return "bg-gray-100 text-gray-800";
            })();

            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {item?.status || "---"}
                  </span>
                </div>

                {/* Mobile Content Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Leave Type</div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getLeaveTypeAbbreviation(item?.leaveType) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item?.totalDays || 0} {(item?.totalDays === 1 || item?.totalDays === "1") ? "Day" : "Days"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Start Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {item?.leaveStartDate || "--"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">End Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {item?.leaveEndDate || "--"}
                    </div>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {(() => {
                      const docData = getDocumentData(item);
                      if (docData) {
                        return (
                          <button
                            onClick={() => handleViewDocument(docData.location, docData.originalname)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200"
                            title={`${docData.originalname || 'Document'} - Click to view`}
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Doc
                          </button>
                        );
                      } else if (item?.leaveType === 'medicalLeave' || item?.leaveType === 'sickLeave') {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No Document
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            N/A
                          </span>
                        );
                      }
                    })()}
                  </div>
                  
                  {/* Mobile Actions */}
                  {item?.status === "Pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('📱 MOBILE APPROVE CLICKED!');
                          handelChangeStatus("Approved", item?._id, item?.employeeInfo?.employeeName);
                        }}
                        disabled={approvalLoading[item?._id]}
                        className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {approvalLoading[item?._id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          console.log('📱 MOBILE REJECT CLICKED!');
                          handelChangeStatus("Rejected", item?._id, item?.employeeInfo?.employeeName);
                        }}
                        disabled={approvalLoading[item?._id]}
                        className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {approvalLoading[item?._id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-400">
                      -
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Server-Side Pagination Controls */}
        {serverTotalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Page {serverCurrentPage} of {serverTotalPages}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => {
                  const newPage = Math.max(currentPage - 1, 1);
                  setCurrentPage(newPage);
                }}
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

              {/* Page Numbers - Show current and nearby pages */}
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
                {Array.from({ length: 3 }, (_, i) => {
                  const pageNum = currentPage - 1 + i;
                  if (pageNum < 1 || pageNum > serverTotalPages) return null;
                  
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
                {currentPage < serverTotalPages - 2 && (
                  <>
                    {currentPage < serverTotalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(serverTotalPages)}
                      className="w-8 h-8 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    >
                      {serverTotalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  const newPage = Math.min(currentPage + 1, serverTotalPages);
                  setCurrentPage(newPage);
                }}
                disabled={currentPage === serverTotalPages}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage === serverTotalPages
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
      </div>

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
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
              
                              {/* Simple Google Docs Viewer - avoid CORS issues */}
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedDocument.location)}&embedded=true`}
                  className="w-full h-full border border-gray-300 rounded-lg"
                  frameBorder="0"
                  title="Document Preview"
                  onLoad={() => {
                    console.log('✅ Google Docs Viewer loaded successfully');
                    setDocumentLoading(false);
                  }}
                  onError={() => {
                    console.log('❌ Google Docs Viewer failed');
                    setDocumentLoading(false);
                  }}
                />
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => handleDownload(selectedDocument.location, selectedDocument.documentName)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                <FiDownload className="inline mr-2" size={16} />
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

const SummaryBox = ({ title, count, percent, ringColor, colorRing }) => (
  <div className={`border rounded-xl flex items-center p-4 gap-4 shadow-sm bg-white`}>
    <div className="flex flex-col items-start">
      <div className="text-xl font-bold text-gray-900">{count ?? "0"}</div>
      <div
        className={`text-sm font-semibold ${
          colorRing === "blue-500"
            ? "text-blue-600"
            : colorRing === "red-500"
            ? "text-red-500"
            : colorRing === "sky-400"
            ? "text-sky-400"
            : "text-orange-400"
        }`}
      >
        {title}
      </div>
    </div>
    <div className="ml-auto">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <path
            className="text-gray-200"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`stroke-current ${ringColor}`}
            strokeWidth="3"
            fill="none"
            strokeDasharray={percent}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800">
          {percent}
        </div>
      </div>
    </div>
  </div>
);

export default EmployeeLeaveStatus;
