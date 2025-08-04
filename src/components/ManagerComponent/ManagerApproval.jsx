import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCompoffLeaveRequestAction,
  getLeaveApproveRequestAction,
  getUserDataAction,
  getVendorLogsAction,
  postrevertLeaveRequest,
  postVendorMeetingAction,
  putApprovedLeaveByManagerAction,
  putCompOffLeaveRequestAction,
  putRevertLeaveByManagerAction,
  putVendorStatusDataAction,
} from "../../store/action/userDataAction";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";

const ManagerApproval = () => {
  const dispatch = useDispatch();
  const { loading, data, error: leaveError } = useSelector((state) => state.managerLeaveApprove);
  const { data: compOff, error: compOffError } = useSelector((state) => state.compoffApprove);
  const { data: vendorData, error: vendorError } = useSelector((state) => state.vendorLogsData);
  const vendorDataa = vendorData?.data || [];
  const leaveReqData = data?.data || [];
  const compOffData = compOff?.data || [];
  
  // Get total records from API response for proper pagination
  const totalLeaveRecords = data?.totalRecords || 0;
  const totalCompOffRecords = compOff?.totalRecords || 0;
  const totalVendorRecords = vendorData?.totalRecords || 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leave");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { data: dataa } = useSelector((state) => state.userData);
  const userDataList = dataa?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentRejectItem, setCurrentRejectItem] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [statusFilterDropdownOpen, setStatusFilterDropdownOpen] = useState(false);
  const [goToPage, setGoToPage] = useState("");
  const [reasonPopup, setReasonPopup] = useState({ isOpen: false, reason: "", title: "" });
  
  // Track which APIs have been loaded to avoid unnecessary calls
  const [loadedAPIs, setLoadedAPIs] = useState({
    leave: false,
    compOff: false,
    vendor: false,
    userData: false
  });

  // Custom Dropdown Component
  // Custom Status Filter Dropdown Component
  const StatusFilterDropdown = ({ value, onChange }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setStatusFilterDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const statusOptions = [
      { value: "", label: "All Status" },
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
      { value: "Rejected", label: "Rejected" }
    ];

    const selectedOption = statusOptions.find(option => option.value === value) || statusOptions[0];

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setStatusFilterDropdownOpen(!statusFilterDropdownOpen)}
          className="px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center justify-between min-w-[140px]"
        >
          <span className={value === "" ? "text-gray-500" : "text-gray-900"}>
            {selectedOption.label}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              statusFilterDropdownOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {statusFilterDropdownOpen && (
          <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setStatusFilterDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-200 ${
                  value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } ${option.value === "" ? 'border-b border-gray-100' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CustomDropdown = ({ item, isCompOff = false, actionType = "leave", onAction, onRejectClick, onDispatch }) => {
    const dropdownRef = useRef(null);
    const dropdownId = `${actionType}-${item?._id}`;
    const isOpen = openDropdown === dropdownId;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDropdownAction = (action) => {
      console.log('Dropdown action clicked:', { action, actionType, itemId: item?._id, isCompOff });
      
      if (action === "approve") {
        if (actionType === "leave") {
          onAction("Approved", item?._id, isCompOff);
        } else if (actionType === "revert") {
          onAction("Approved", item?._id);
        } else if (actionType === "vendor") {
          onAction("Approved", item?._id);
        }
      } else if (action === "reject") {
        if (actionType === "leave") {
          if (isCompOff) {
            onAction("Rejected", item?._id, true);
          } else {
            onRejectClick(item);
          }
        } else if (actionType === "revert") {
          onAction("Rejected", item?._id);
        } else if (actionType === "vendor") {
          onAction("Rejected", item?._id);
        }
      }
      setOpenDropdown(null);
    };

    return (
      <div className="relative inline-block w-full" ref={dropdownRef}>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : dropdownId)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center justify-between"
        >
          <span className="text-gray-600 truncate">Select Action</span>
          <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
            <div className="py-1">
              <button
                onClick={() => handleDropdownAction("approve")}
                className="w-full px-3 py-2 text-xs text-left hover:bg-green-50 transition-colors duration-200 flex items-center text-green-600 font-medium"
              >
                <span className="mr-2 text-green-500">✓</span>
                Approve
              </button>
              <button
                onClick={() => handleDropdownAction("reject")}
                className="w-full px-3 py-2 text-xs text-left hover:bg-red-50 transition-colors duration-200 flex items-center text-red-600 font-medium"
              >
                <span className="mr-2 text-red-500">✗</span>
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter data based on the active tab
  const filteredData = activeTab === "leave" ? leaveReqData : activeTab === "revert" ? leaveReqData : activeTab === 'vendor' ? vendorDataa : compOffData;
  console.log('filteredData', filteredData)
  console.log('loading state:', loading)
  console.log('data state:', data)
  console.log('compOff state:', compOff)
  console.log('vendorData state:', vendorData)
  console.log('userData state:', dataa)
  
  // Debug: Log the first few items to see their structure
  if (activeTab === "revert" && leaveReqData && leaveReqData.length > 0) {
    console.log('Sample leave request data for revert tab:', leaveReqData.slice(0, 3));
    console.log('Items with revertLeave:', leaveReqData.filter(item => item?.revertLeave));
    
    // Count items with empty revert data
    const itemsWithEmptyRevert = leaveReqData.filter(item => 
      item?.revertLeave && 
      typeof item.revertLeave === 'object' && 
      (!item.revertLeave.revertedDays || item.revertLeave.revertedDays === '')
    );
    console.log('Items with empty revert data:', itemsWithEmptyRevert.length, 'out of', leaveReqData.length);
  }
  
  // Check if data is still loading
  const isLoading = loading;
  
  // Check if we have data for the current tab - add null checks
  const hasData = filteredData && Array.isArray(filteredData) && filteredData.length > 0;
  
  // For revert tab, check if there are revert requests that need approval
  const hasRevertData = activeTab === "revert" && hasData 
    ? filteredData.filter(item => item?.revertLeave && item?.revertLeave?.status === "Pending").length > 0
    : hasData;
  
  // Check if there are total records for the current tab
  const hasTotalRecords = () => {
    // First check if there's actual data to display
    if (activeTab === "revert") {
      if (!hasRevertData) {
        return false;
      }
    } else {
      if (!hasData) {
        return false;
      }
    }
    
    // Then check the total records count
    if (activeTab === "leave") {
      return totalLeaveRecords > 0;
    } else if (activeTab === "compoff") {
      return totalCompOffRecords > 0;
    } else if (activeTab === "revert") {
      return totalLeaveRecords > 0;
    } else if (activeTab === "vendor") {
      return totalVendorRecords > 0;
    }
    return false;
  };
  
  // Apply search filter only if data exists with proper null checks
  const filteredBySearch = hasData ? filteredData.filter(item =>
    (item?.employeeInfo?.employeeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item?.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : [];

  // Apply status filter
  const filteredByStatus = filterStatus && hasData
    ? filteredBySearch?.filter(item => item?.status === filterStatus)
    : filteredBySearch;

  // Apply leave type filter
  const filteredByLeaveType = filterLeaveType && hasData
    ? filteredByStatus.filter(item => item?.leaveType?.toLowerCase() === filterLeaveType.toLowerCase())
    : filteredByStatus;

  // Filter comp-off data
  const filteredCompoffData = activeTab === "compoff" && hasData ? filteredByLeaveType : [];

  // Use data directly since API returns paginated data
  // The API already handles pagination, so we use the data as-is
  const currentData = filteredByLeaveType;

  // Calculate total pages based on active tab using API total records
  const getTotalPages = () => {
    // If itemsPerPage is -1 (Show All), return 1 page
    if (itemsPerPage === -1) {
      return 1;
    }
    
    if (activeTab === "leave") {
      return Math.ceil(totalLeaveRecords / itemsPerPage) || 1;
    } else if (activeTab === "compoff") {
      return Math.ceil(totalCompOffRecords / itemsPerPage) || 1;
    } else if (activeTab === "revert") {
      return Math.ceil(totalLeaveRecords / itemsPerPage) || 1;
    } else if (activeTab === "vendor") {
      return Math.ceil(totalVendorRecords / itemsPerPage) || 1;
    }
    return 1;
  };

  const totalPages = getTotalPages();
  console.log('totalPages', totalPages, 'totalLeaveRecords', totalLeaveRecords, 'itemsPerPage', itemsPerPage);
  // Pagination Handlers
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const closeModal = () => setIsModalOpen(false);

  const openReasonPopup = (reason, title = "Reason Details") => {
    setReasonPopup({ isOpen: true, reason, title });
  };

  const closeReasonPopup = () => {
    setReasonPopup({ isOpen: false, reason: "", title: "" });
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
    } else {
      toast.error(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };

  // Load user data on component mount (needed for all tabs)
  useEffect(() => {
    if (!loadedAPIs.userData) {
      console.log('ManagerApproval: Loading user data...');
      dispatch(getUserDataAction());
      setLoadedAPIs(prev => ({ ...prev, userData: true }));
    }
  }, [dispatch, loadedAPIs.userData]);

  // Load data based on active tab
  useEffect(() => {
    const limit = itemsPerPage === -1 ? undefined : itemsPerPage;
    
    if (activeTab === "leave" && !loadedAPIs.leave) {
      console.log('ManagerApproval: Loading leave data...');
      dispatch(getLeaveApproveRequestAction({ page: currentPage, limit }));
      setLoadedAPIs(prev => ({ ...prev, leave: true }));
    }
    
    if (activeTab === "compoff" && !loadedAPIs.compOff) {
      console.log('ManagerApproval: Loading comp-off data...');
      dispatch(getCompoffLeaveRequestAction({ page: currentPage, limit }));
      setLoadedAPIs(prev => ({ ...prev, compOff: true }));
    }
    
    if (activeTab === "vendor" && !loadedAPIs.vendor) {
      console.log('ManagerApproval: Loading vendor data...');
      dispatch(getVendorLogsAction({ page: currentPage, limit }));
      setLoadedAPIs(prev => ({ ...prev, vendor: true }));
    }
    
    // Revert tab uses the same data as leave tab, so no additional API call needed
  }, [dispatch, activeTab, currentPage, itemsPerPage, loadedAPIs]);

  // Handle pagination changes for the active tab
  useEffect(() => {
    const limit = itemsPerPage === -1 ? undefined : itemsPerPage;
    
    if (activeTab === "leave" && loadedAPIs.leave) {
      dispatch(getLeaveApproveRequestAction({ page: currentPage, limit }));
    }
    
    if (activeTab === "compoff" && loadedAPIs.compOff) {
      dispatch(getCompoffLeaveRequestAction({ page: currentPage, limit }));
    }
    
    if (activeTab === "vendor" && loadedAPIs.vendor) {
      dispatch(getVendorLogsAction({ page: currentPage, limit }));
    }
  }, [dispatch, currentPage, itemsPerPage, activeTab, loadedAPIs]);

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1); // Reset to first page when switching tabs
    setSearchTerm("");
    setFilterStatus("");
    setFilterLeaveType("");
  };

  // Reset search and filters when switching tabs
  useEffect(() => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterLeaveType("");
  }, [activeTab]);

  // Listen for error states and show notifications
  useEffect(() => {
    // Only show error notification for actual API errors, not empty data states
    if (leaveError && 
        typeof leaveError === 'string' && 
        leaveError.length > 0 && 
        !leaveError.includes('No data') && 
        !leaveError.includes('empty') &&
        leaveError !== 'null' &&
        leaveError !== 'undefined') {
      toast.error(`Leave approval error: ${leaveError}`);
    }
  }, [leaveError]);

  useEffect(() => {
    // Only show error notification for actual API errors, not empty data states
    if (compOffError && 
        typeof compOffError === 'string' && 
        compOffError.length > 0 && 
        !compOffError.includes('No data') && 
        !compOffError.includes('empty') &&
        compOffError !== 'null' &&
        compOffError !== 'undefined') {
      toast.error(`Comp-Off approval error: ${compOffError}`);
    }
  }, [compOffError]);

  useEffect(() => {
    console.log('Vendor error state:', vendorError, typeof vendorError);
    // Only show error notification for actual API errors, not empty data states
    if (vendorError && 
        typeof vendorError === 'string' && 
        vendorError.length > 0 && 
        !vendorError.includes('No data') && 
        !vendorError.includes('empty') &&
        vendorError !== 'null' &&
        vendorError !== 'undefined') {
      toast.error(`Vendor meeting approval error: ${vendorError}`);
    }
  }, [vendorError]);

  const handleRejectClick = (item) => {
    if (item && item._id) {
      setCurrentRejectItem(item);
      setIsModalOpen(true);
    } else {
      toast.error("Invalid item selected for rejection.");
    }
  };

  const handleSubmitRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    
    if (!currentRejectItem?._id) {
      toast.error("Invalid item selected for rejection.");
      return;
    }
    
    dispatch(
      putApprovedLeaveByManagerAction({
        status: "Rejected",
        id: currentRejectItem._id,
        remarks: rejectionReason,
      })
    );
    
    // Show success notification
    toast.success("Leave request rejected successfully!");
    
    setRejectionReason("");
    setIsModalOpen(false);
  };

  const handleRevertAction = (item) => {
    console.log('handleRevertAction called with:', item);
    
    if (!item?._id) {
      toast.error("Invalid item selected for revert action.");
      return;
    }
    
    // Open a modal or prompt to get the number of days to revert
    const revertedDays = prompt(`Enter the number of days to revert for ${item?.employeeInfo?.employeeName}'s leave (${item?.totalDays} total days):`);
    
    if (revertedDays === null) {
      return; // User cancelled
    }
    
    const days = parseFloat(revertedDays);
    if (isNaN(days) || days <= 0 || days > item?.totalDays) {
      toast.error(`Please enter a valid number of days (1 to ${item?.totalDays})`);
      return;
    }
    
    // Call the revert API - convert days to string as required by API
    dispatch(postrevertLeaveRequest(days.toString(), item._id));
    toast.success(`Revert request submitted for ${days} days`);
  };

  const handleRevertApprovalAction = (status, id) => {
    console.log('handleRevertApprovalAction called with:', { status, id });
    
    if (!id) {
      toast.error("Invalid item selected for revert approval action.");
      return;
    }
    
    // Call the revert approval API
    dispatch(putRevertLeaveByManagerAction({ status, id }));
    toast.success(`Revert request ${status.toLowerCase()} successfully!`);
  };

  const handleAction = (status, id, isCompOff = false) => {
    console.log('handleAction called with:', { status, id, isCompOff });
    
    if (!id) {
      toast.error("Invalid item selected for action.");
      return;
    }
    
    console.log('Handling action:', { status, id, isCompOff });
    
    // Show loading notification
    if (isCompOff) {
      toast.info(`Processing Comp-Off ${status.toLowerCase()}...`);
    } else {
      toast.info(`Processing leave ${status.toLowerCase()}...`);
    }
    
    const action = isCompOff ? putCompOffLeaveRequestAction : putApprovedLeaveByManagerAction;
    console.log('Dispatching action:', action.name, { status, id });
    dispatch(action({ status, id }));
    
    // Show specific success message based on approval type
    if (isCompOff) {
      toast.success(`Comp-Off request ${status.toLowerCase()} successfully!`);
    } else {
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
    }
    
    // Refresh data after action (instead of page reload)
    setTimeout(() => {
      const limit = itemsPerPage === -1 ? undefined : itemsPerPage;
      console.log('Refreshing data with:', { page: currentPage, limit });
      dispatch(getLeaveApproveRequestAction({ page: currentPage, limit }));
      dispatch(getCompoffLeaveRequestAction({ page: currentPage, limit }));
      dispatch(getVendorLogsAction({ page: currentPage, limit }));
    }, 1500);
  };

  const SkeletonLoader = () => (
    <>
      {Array(5).fill(0).map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-gray-100 hover:bg-gray-50 transition-colors">
          {Array(9).fill(0).map((_, cellIndex) => (
            <td key={cellIndex} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const NoDataMessage = ({ colSpan = 10 }) => (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">No data available</p>
          <p className="text-gray-400 text-sm mt-1">There are no pending approvals at the moment</p>
        </div>
      </td>
    </tr>
  );

  // Reason Cell Component with dropdown functionality
  const ReasonCell = ({ reason, className = "" }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setIsDropdownOpen(!isDropdownOpen);
    };

    // Get first word of the reason
    const getFirstWord = (text) => {
      if (!text) return "---";
      const words = text.trim().split(' ');
      return words[0] || "---";
    };

    const firstWord = getFirstWord(reason);

    return (
      <div className="relative" ref={dropdownRef}>
        <div 
          className={`text-xs text-gray-700 ${className} cursor-pointer hover:text-blue-600 transition-colors duration-200 flex items-center gap-1`}
          title={reason || "---"}
          onClick={toggleDropdown}
        >
          <span className="text-gray-700">{firstWord}</span>
          {reason && reason.split(' ').length > 1 && (
            <span className="text-gray-400 text-xs">
              ▼
            </span>
          )}
        </div>
        
        {isDropdownOpen && reason && (
          <div className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 max-w-[300px] min-w-[200px]">
            <div className="text-gray-800 text-sm leading-relaxed whitespace-normal">
              {reason}
            </div>
            <div className="flex justify-end items-center mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={toggleDropdown}
                className="text-gray-500 hover:text-gray-700 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTableRows = (data, isCompOff = false) => {
    if (!data || data.length === 0) {
      return <NoDataMessage colSpan={9} />;
    }
    
    return data.map((item, index) => (
      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-600 font-medium text-xs">
                {item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900 text-sm truncate max-w-[120px]" title={item?.employeeInfo?.employeeName || "---"}>
              {item?.employeeInfo?.employeeName || "---"}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {item?.dateTime?.split(" ")[0] || item?.appliedDate?.split(" ")[0] || "---"}
          </span>
        </td>
        {!isCompOff && (
          <>
            <td className="px-4 py-3 text-center whitespace-nowrap">
              <span className="text-xs text-gray-700">{item?.leaveStartDate || "---"}</span>
            </td>
            <td className="px-4 py-3 text-center whitespace-nowrap">
              <span className="text-xs text-gray-700">{item?.leaveEndDate || "---"}</span>
            </td>
          </>
        )}
        {activeTab === "leave" ?
          <td className="px-4 py-3 text-center whitespace-nowrap">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item?.leaveType ? item.leaveType.toUpperCase().split("LEAVE")[0] + " LEAVE" : "---"}
            </span>
          </td>
          : ''}
        <td className="px-4 py-3 text-center">
          <ReasonCell reason={item?.reason} />
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {(() => {
              const totalDays = item?.totalDays;
              if (totalDays === 0.5) return 'Half Day';
              if (totalDays === 1) return 'Full Day';
              return totalDays && totalDays !== "undefined" ? `${totalDays} days` : "---";
            })()}
          </span>
        </td>
        {activeTab === "leave" ?
          <td className="px-4 py-3 text-center whitespace-nowrap">
            {item?.location ? (
              <Link className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors duration-200" to={item?.location}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </Link>
            ) : (
              <span className="text-gray-400 text-xs">---</span>
            )}
          </td>
          : ''}
        <td className="px-4 py-3 text-center whitespace-nowrap">
          {item?.status === "Pending" ? (
            <CustomDropdown 
              item={item} 
              isCompOff={isCompOff} 
              actionType="leave" 
              onAction={handleAction} 
              onRejectClick={handleRejectClick}
              onDispatch={dispatch}
            />
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item?.status === "Approved" ? "bg-green-100 text-green-800" :
              item?.status === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {item?.status || "---"}
            </span>
          )}
        </td>
      </tr>
    ));
  };

  const renderRevertTableRow = (data) => {
    console.log('renderRevertTableRow called with data:', data);
    
    if (!data || data.length === 0) {
      console.log('No data provided to renderRevertTableRow');
      return <NoDataMessage colSpan={5} />;
    }
    
    // Filter data to show pending revert requests
    const pendingRevertRequests = data?.filter(item => 
      item?.revertLeave && 
      item?.revertLeave?.status === "Pending"
    );
    
    console.log('Pending revert requests:', pendingRevertRequests);
    
    if (!pendingRevertRequests || pendingRevertRequests.length === 0) {
      console.log('No pending revert requests found');
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Revert Requests</h3>
              <p className="text-gray-500 mb-4">There are currently no pending revert leave requests.</p>
              <div className="text-sm text-gray-400">
                <p>Revert approvals appear when employees submit requests to revert their approved leave.</p>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    
    // Render rows based on the pending revert requests data
    return pendingRevertRequests?.map((item, index) => (
      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-medium text-sm">
                {item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900 truncate max-w-[150px]" title={item?.employeeInfo?.employeeName || "---"}>
              {item?.employeeInfo?.employeeName || "---"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {item?.revertLeave?.requestedDateTime?.split(' ')[0] || "---"}
          </span>
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {item?.revertLeave?.revertedDays || "---"} days
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <ReasonCell reason={item?.revertLeave?.reason || "Revert request"} className="text-sm" />
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <CustomDropdown 
            item={item} 
            actionType="revert" 
            onAction={handleRevertApprovalAction} 
            onRejectClick={handleRejectClick}
            onDispatch={dispatch}
          />
        </td>
      </tr>
    ));
  };

  const vendorMeetingTable = (data) => {
    console.log('data', data)
    if (!data || data.length === 0) {
      return <NoDataMessage colSpan={5} />;
    }
    
    // Filter data where revertLeave.revertedDays exists and is not an empty string
    const filteredData = data
    // Render rows based on the filtered data
    return filteredData?.map((item, index) => (
      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-medium text-sm">
                {item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900 truncate max-w-[150px]" title={item?.employeeInfo?.employeeName || "---"}>
              {item?.employeeInfo?.employeeName || "---"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {item?.dateTime?.split(' ')[0] || "---"}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <ReasonCell reason={item?.reason} className="text-sm" />
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {item?.totalDays && item?.totalDays !== "undefined" ? `${item?.totalDays} days` : "---"}
          </span>
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          {item?.status === "Pending" ? (
            <CustomDropdown 
              item={item} 
              actionType="vendor" 
              onAction={handleAction} 
              onRejectClick={handleRejectClick}
              onDispatch={dispatch}
            />
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item?.status === "Approved" ? "bg-green-100 text-green-800" :
              item?.status === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {item?.status || "---"}
            </span>
          )}
        </td>
      </tr>
    ));
  };

  // Show loading screen only if data is still loading
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Team Approvals...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <ToastContainer />

        {/* Tabs */}
        {userDataList && userDataList?.role !== "HR-Admin" ?
          <div className="p-6 flex gap-2">
            <button
              className={`p-5 rounded text-white ${activeTab === "leave" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "leave" ? { color: 'white' } : { color: 'black' }}
              onClick={() => handleTabChange("leave")}
            >
              Leave Approvals
            </button>
            <button
              className={`p-3 rounded text-white ${activeTab === "compoff" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "compoff" ? { color: 'white' } : { color: 'black' }}
              onClick={() => handleTabChange("compoff")}
            >
              Comp-Off Approvals
            </button>
            <button
              className={`p-3 rounded text-white ${activeTab === "revert" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "revert" ? { color: 'white' } : { color: 'black' }}
              onClick={() => handleTabChange("revert")}
            >
              Revert Approvals
            </button>
            <button
              className={`p-3 rounded text-white ${activeTab === "vendor" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "vendor" ? { color: 'white' } : { color: 'black' }}
              onClick={() => handleTabChange("vendor")}
            >
              Vendor Meetings
            </button>
          </div>
          : ''}

        {/* Content */}
        <div className="p-6">
          {activeTab === "leave" ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Leave Approvals</h2>
              <div className="py-6 flex gap-4 items-center">
                <div className="relative w-full grow">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="search"
                    className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Search by employee name or reason..." />
                </div>
                
                <StatusFilterDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Employee Name</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Request Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Start Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">End Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Leave Type</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Reason</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Total Days</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Document</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">{loading ? <SkeletonLoader /> : renderTableRows(currentData)}</tbody>
                </table>
              </div>
            </>
          ) : activeTab === "revert" ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Revert Approvals</h2>
              <div className="py-6 flex gap-4 items-center">
                <div className="relative w-full grow">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="search"
                    className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Search by employee name or reason..." />
                </div>
                
                <StatusFilterDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Employee Name</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Request Date</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Revert Days</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Reason</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">{loading ? <SkeletonLoader /> : renderRevertTableRow(currentData)}</tbody>
                </table>
              </div>
            </>
          ) : activeTab === "vendor" ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Vendor Meetings</h2>
              <div className="py-6 flex gap-4 items-center">
                <div className="relative w-full grow">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="search"
                    className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Search by employee name or reason..." />
                </div>
                
                <StatusFilterDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Employee Name</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Request Date</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Reason</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Total Days</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">{loading ? <SkeletonLoader /> : vendorMeetingTable(currentData)}</tbody>
              </table>
            </div>
          </>) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Comp-Off Approvals</h2>
              <div className="py-6 flex gap-4 items-center">
                <div className="relative w-full grow">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="search"
                    className="w-full pl-12 pr-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Search by employee name or reason..." />
                </div>
                
                <StatusFilterDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Employee Name</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Request Date</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Reason</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Total Days</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">{loading ? <SkeletonLoader /> : renderTableRows(currentData, true)}</tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination Info - Only show when there's data */}
        {hasTotalRecords() && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {activeTab === "leave" && (itemsPerPage === -1 
                ? `Showing all ${totalLeaveRecords} items` 
                : `Showing ${currentData?.length || 0} of ${totalLeaveRecords} items (Page ${currentPage} of ${totalPages})`)}
              {activeTab === "compoff" && (itemsPerPage === -1 
                ? `Showing all ${totalCompOffRecords} items` 
                : `Showing ${currentData?.length || 0} of ${totalCompOffRecords} items (Page ${currentPage} of ${totalPages})`)}
              {activeTab === "revert" && (itemsPerPage === -1 
                ? `Showing all ${totalLeaveRecords} items` 
                : `Showing ${currentData?.length || 0} of ${totalLeaveRecords} items (Page ${currentPage} of ${totalPages})`)}
              {activeTab === "vendor" && (itemsPerPage === -1 
                ? `Showing all ${totalVendorRecords} items` 
                : `Showing ${currentData?.length || 0} of ${totalVendorRecords} items (Page ${currentPage} of ${totalPages})`)}
            </div>
          </div>
        )}

        {/* Pagination Controls - Only show when there's data and multiple pages */}
        {hasTotalRecords() && totalPages > 1 && itemsPerPage !== -1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={-1}>Show All</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
              
              {/* Go to page input */}
              {totalPages > 5 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Page"
                  />
                  <button
                    onClick={handleGoToPage}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                  >
                    Go
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Page numbers around current page */}
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      const shouldShow = 
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                      
                      if (!shouldShow) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                )}
                
                <button
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    currentPage === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Reject Leave Request</h3>
                <button 
                  onClick={closeModal} 
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <RxCross2 className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  rows="4"
                  placeholder="Please provide a detailed reason for rejecting this leave request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
                ></textarea>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleSubmitRejection} 
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
                  >
                    Submit Rejection
                  </button>
                  <button 
                    onClick={closeModal} 
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reason Popup Modal */}
        {reasonPopup.isOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{reasonPopup.title}</h3>
                <button 
                  onClick={closeReasonPopup} 
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {reasonPopup.reason || "No reason provided"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t border-gray-200">
                <button 
                  onClick={closeReasonPopup} 
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagerApproval;
