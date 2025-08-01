import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCompoffLeaveRequestAction,
  getLeaveApproveRequestAction,
  getUserDataAction,
  getVendorLogsAction,
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
  const { loading, data } = useSelector((state) => state.managerLeaveApprove);
  const { data: compOff } = useSelector((state) => state.compoffApprove);
  const { data: vendorData } = useSelector((state) => state.vendorLogsData);
  const vendorDataa = vendorData?.data || [];
  const leaveReqData = data?.data || [];
  const compOffData = compOff?.data || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leave");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data: dataa } = useSelector((state) => state.userData);
  const userDataList = dataa?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentRejectItem, setCurrentRejectItem] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Custom Dropdown Component
  const CustomDropdown = ({ item, isCompOff = false, actionType = "leave" }) => {
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

    const handleAction = (action) => {
      if (action === "approve") {
        if (actionType === "leave") {
          handleAction("Approved", item?._id, isCompOff);
        } else if (actionType === "revert") {
          dispatch(putRevertLeaveByManagerAction({ status: "Approved", id: item?._id }));
        } else if (actionType === "vendor") {
          dispatch(putVendorStatusDataAction({ status: "Approved", id: item?._id }));
        }
      } else if (action === "reject") {
        if (actionType === "leave") {
          if (isCompOff) {
            handleAction("Rejected", item?._id, true);
          } else {
            handleRejectClick(item);
          }
        } else if (actionType === "revert") {
          dispatch(putRevertLeaveByManagerAction({ status: "Rejected", id: item?._id }));
        } else if (actionType === "vendor") {
          dispatch(putVendorStatusDataAction({ status: "Rejected", id: item?._id }));
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
                onClick={() => handleAction("approve")}
                className="w-full px-3 py-2 text-xs text-left hover:bg-green-50 transition-colors duration-200 flex items-center text-green-600 font-medium"
              >
                <span className="mr-2 text-green-500">✓</span>
                Approve
              </button>
              <button
                onClick={() => handleAction("reject")}
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
  
  // Check if data is still loading
  const isLoading = loading;
  
  // Check if we have data for the current tab - add null checks
  const hasData = filteredData && Array.isArray(filteredData) && filteredData.length > 0;
  
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

  // Paginate the filtered data
  const currentData = filteredByLeaveType.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Total pages calculation
  const totalPages = Math.ceil(filteredByLeaveType.length / itemsPerPage);
  console.log('totalPages', totalPages, filteredByLeaveType?.length)
  // Pagination Handlers
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    console.log('ManagerApproval: Dispatching actions to fetch data...');
    dispatch(getLeaveApproveRequestAction());
    dispatch(getCompoffLeaveRequestAction());
    dispatch(getUserDataAction());
    dispatch(getVendorLogsAction());
  }, [dispatch]);

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
    setRejectionReason("");
    setIsModalOpen(false);
  };

  const handleAction = (status, id, isCompOff = false) => {
    if (!id) {
      toast.error("Invalid item selected for action.");
      return;
    }
    
    const action = isCompOff ? putCompOffLeaveRequestAction : putApprovedLeaveByManagerAction;
    dispatch(action({ status, id }));
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

  const renderTableRows = (data, isCompOff = false) => {
    if (!data || data.length === 0) {
      return <NoDataMessage colSpan={9} />;
    }
    
    return data.map((item, index) => (
      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-600 font-medium text-xs">
                {item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900 text-sm truncate">{item?.employeeInfo?.employeeName || "---"}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
            {item?.dateTime?.split(" ")[0] || item?.appliedDate?.split(" ")[0] || "---"}
          </span>
        </td>
        {!isCompOff && (
          <>
            <td className="px-4 py-3 text-center">
              <span className="text-xs text-gray-700 whitespace-nowrap">{item?.leaveStartDate || "---"}</span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="text-xs text-gray-700 whitespace-nowrap">{item?.leaveEndDate || "---"}</span>
            </td>
          </>
        )}
        {activeTab === "leave" ?
          <td className="px-4 py-3 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
              {item?.leaveType ? item.leaveType.toUpperCase().split("LEAVE")[0] + " LEAVE" : "---"}
            </span>
          </td>
          : ''}
        <td className="px-4 py-3 text-center">
          <div className="text-xs text-gray-700 truncate whitespace-nowrap" title={item?.reason || "---"}>
            {item?.reason || "---"}
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
            {item?.totalDays || "---"} days
          </span>
        </td>
        {activeTab === "leave" ?
          <td className="px-4 py-3 text-center">
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
        <td className="px-4 py-3 text-center">
          {item?.status === "Pending" ? (
            <CustomDropdown item={item} isCompOff={isCompOff} actionType="leave" />
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
    if (!data || data.length === 0) {
      return <NoDataMessage colSpan={4} />;
    }
    
    // Filter data where revertLeave.revertedDays exists and is not an empty string
    const filteredData = data?.filter(item => item?.revertLeave?.revertedDays);
    
    if (!filteredData || filteredData.length === 0) {
      return <NoDataMessage colSpan={4} />;
    }
    
    // Render rows based on the filtered data
    return filteredData?.map((item, index) => (
      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-medium text-sm">
                {item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900">{item?.employeeInfo?.employeeName || "---"}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {item?.revertLeave?.requestedDateTime?.split(' ')[0] || "---"}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {item?.revertLeave?.revertedDays || "---"} days
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {item?.revertLeave?.status === "Pending" ? (
            <CustomDropdown item={item} actionType="revert" />
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item?.revertLeave?.status === "Approved" ? "bg-green-100 text-green-800" :
              item?.revertLeave?.status === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {item?.revertLeave?.status || "---"}
            </span>
          )}
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
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-medium text-sm">
                {item?.employeeInfo?.employeeName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900">{item?.employeeInfo?.employeeName || "---"}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {item?.dateTime?.split(' ')[0] || "---"}
          </span>
        </td>
        <td className="px-6 py-4 text-center max-w-xs">
          <div className="text-sm text-gray-700 truncate" title={item?.reason || "---"}>
            {item?.reason || "---"}
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {item?.totalDays || "---"} days
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {item?.status === "Pending" ? (
            <CustomDropdown item={item} actionType="vendor" />
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
              onClick={() => setActiveTab("leave")}
            >
              Leave Approvals
            </button>
            <button
              className={`p-3 rounded text-white ${activeTab === "compoff" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "compoff" ? { color: 'white' } : { color: 'black' }}
              onClick={() => setActiveTab("compoff")}
            >
              Comp-Off Approvals
            </button>
            <button
              className={`p-3 rounded text-white ${activeTab === "revert" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "revert" ? { color: 'white' } : { color: 'black' }}
              onClick={() => setActiveTab("revert")}
            >
              Revert Approvals
            </button>
            <button
              className={`p-3 rounded text-white ${activeTab === "vendor" ? "bg-blue-500" : "bg-white text-blue-300 shadow"
                }`}
              style={activeTab === "vendor" ? { color: 'white' } : { color: 'black' }}
              onClick={() => setActiveTab("vendor")}
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
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
              <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Employee Name</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Request Date</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Total Days</th>
                      <th className="px-6 py-4 font-semibold text-gray-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">{loading ? <SkeletonLoader /> : renderRevertTableRow(currentData)}</tbody>
                </table>
              </div>
            </>
          ) : activeTab === "vendor" ? (<>
            <h2 className="text-2xl font-bold mb-4">Vendor Meetings</h2>
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
                <tbody className="divide-y divide-gray-100">{loading ? <SkeletonLoader /> : vendorMeetingTable(currentData, true)}</tbody>
              </table>
            </div>
          </>) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Comp-Off Approvals</h2>
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

        {/* Pagination Controls */}
        {activeTab === "leave" && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({filteredByLeaveType.length} total items)
            </div>
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
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
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
              </div>
              
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
      </div>
    </>
  );
};

export default ManagerApproval;
