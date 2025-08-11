import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLeaveRequestAction, getCompoffDataAction, getEmployeLeaveStatusAction, getUserDataAction, getVendorSingleLogsAction, postrevertLeaveRequest } from "../store/action/userDataAction";
import AddEmployee from "./AddEmployee";
import { Link } from "react-router-dom";
import { Bounce, ToastContainer } from 'react-toastify';
import { RxCross2 } from "react-icons/rx";
import safeToast from "../utils/safeToast";

const EmployessLeave = () => {
    const employeeId = localStorage.getItem('employeId');
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.employeeLeaveStatus);
    const { data: dataa1 } = useSelector((state) => state.compoffData);
    const { data: vendorData } = useSelector((state) => state.singleVendorLogsData);
    console.log('vendorData', vendorData);
    const { data: dataa } = useSelector((state) => state.deleteLeaveByEmoployee);
    const { data: revertLeaveData, error: revertLeaveError } = useSelector((state) => state.revertLeaveReducer);
    const { data: userDataRaw } = useSelector((state) => state.userData);
    const userData = userDataRaw?.data || {};
    const userType = userData?.role;
    const [selectDays, setLeaveDays] = useState('');
    const leaveData = data?.data;
    const [filterStatus, setFilterStatus] = useState('All'); // Default is 'All'
    const [selectedTab, setSelectedTab] = useState('leave'); // Track the selected tab
    const [currentPage, setCurrentPage] = useState(1); // Start on page 1
    const [itemsPerPage, setItemsPerPage] = useState(10); // Show 10 items per page

    const filteredLeaveData = leaveData?.filter(leave => {
        if (filterStatus === 'All') return true;
        return leave.status === filterStatus;
    });
    const filteredCompoffData = dataa1?.data?.filter(leave => {
        if (filterStatus === 'All') return true;
        return leave.status === filterStatus;
    });

    const filterVendorData = vendorData?.data?.filter(vendor => {
        if (filterStatus === 'All') return true;
        return vendor.status === filterStatus;
    });

    // Get current data slice based on the page
    const currentLeaveData = filteredLeaveData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const currentCompoffData = filteredCompoffData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const currentVendorData = filterVendorData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate total pages based on selected tab
    const getTotalPages = () => {
        if (selectedTab === 'leave') {
            return Math.ceil(filteredLeaveData?.length / itemsPerPage);
        } else if (selectedTab === 'compoff') {
            return Math.ceil(filteredCompoffData?.length / itemsPerPage);
        } else if (selectedTab === 'vendor') {
            return Math.ceil(filterVendorData?.length / itemsPerPage);
        }
        return 1;
    };

    const totalPages = getTotalPages();
    const [openUndoModel, setOpenUndoModel] = useState(false);
    const [userId, setUserId] = useState('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    const closeModal = () => setOpenUndoModel(false);
    const handelOpenModel = () => setOpenUndoModel(true);

    useEffect(() => {
        if (dataa) {
            safeToast.success(dataa?.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            
            // Refresh data after successful delete operation
            setTimeout(() => {
                dispatch(getEmployeLeaveStatusAction(employeeId));
                dispatch(getCompoffDataAction());
                dispatch(getVendorSingleLogsAction());
            }, 1000);
            
            return;
        }
    }, [dataa, dispatch, employeeId]);

    // Handle revert leave success response
    useEffect(() => {
        if (revertLeaveData) {
            safeToast.success(revertLeaveData?.message || "Revert request submitted successfully!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            
            // Clear the form
            setLeaveDays('');
            
            // Refresh data after successful revert operation
            setTimeout(() => {
                dispatch(getEmployeLeaveStatusAction(employeeId));
                dispatch(getCompoffDataAction());
                dispatch(getVendorSingleLogsAction());
            }, 1000);
            
            return;
        }
    }, [revertLeaveData, dispatch, employeeId]);

    // Handle revert leave error response
    useEffect(() => {
        if (revertLeaveError) {
            safeToast.error(revertLeaveError || "Failed to submit revert request", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        }
    }, [revertLeaveError]);

    useEffect(() => {
        dispatch(getEmployeLeaveStatusAction(employeeId));
        dispatch(getCompoffDataAction());
        dispatch(getVendorSingleLogsAction());
        dispatch(getUserDataAction());
    }, [dispatch, employeeId]);

    // Cleanup toasts on component unmount
    useEffect(() => {
        return () => {
            // Dismiss all toasts when component unmounts to prevent runtime errors
            safeToast.dismiss();
        };
    }, []);

    // Handle clicking outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFilterDropdownOpen && !event.target.closest('.custom-dropdown')) {
                setIsFilterDropdownOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (isFilterDropdownOpen) {
                if (event.key === 'Escape') {
                    setIsFilterDropdownOpen(false);
                } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFilterDropdownOpen]);

    const getLeaveTypeStyle = (type) => {
        switch (type) {
            case "Annual":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "Unpaid":
                return "bg-red-100 text-red-700 border-red-200";
            case "Medical":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "Emergency":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Approved":
                return "bg-green-100 text-green-700 border-green-200";
            case "Rejected":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    // Function to get leave type abbreviation
    const getLeaveTypeAbbreviation = (leaveType) => {
        if (!leaveType) return "---";
        
        // Normalize the leave type to handle different formats
        const normalizedType = leaveType.toLowerCase().replace(/[-\s_]/g, '');
        
        const abbreviations = {
            casualleave: "CL",
            earnedleave: "EL", 
            optionalleave: "OL",
            shortleave: "SL",
            uninformedleave: "UL",
            vendormeeting: "VM",
            "vendor-meeting": "VM",
            "vendor_meeting": "VM",
            compoff: "CO",
            "comp-off": "CO",
            "comp_off": "CO",
            sickleave: "SL",
            maternityleave: "ML",
            paternityleave: "PL",
            bereavementleave: "BL",
            studyleave: "STL",
            sabbaticalleave: "SAB",
            medicalleave: "ML",
            regularizedleave: "RL",
            regularized: "RL",
            "regularized-leave": "RL",
            "regularized_leave": "RL"
        };
        
        // First try exact match
        if (abbreviations[leaveType]) {
            return abbreviations[leaveType];
        }
        
        // Then try normalized match
        if (abbreviations[normalizedType]) {
            return abbreviations[normalizedType];
        }
        
        // If no match found, return the original with some basic formatting
        return leaveType.toUpperCase().substring(0, 3);
    };

    // Function to format days for display (Half Day/Full Day)
    const formatDays = (totalDays) => {
        if (totalDays === 0.5) return 'Half Day';
        if (totalDays === 1) return 'Full Day';
        return totalDays;
    };

    // Function to get first word of reason
    const getFirstWord = (reason) => {
        if (!reason) return '---';
        const firstWord = reason.split(' ')[0];
        return firstWord.length > 15 ? firstWord.substring(0, 15) + '...' : firstWord;
    };

    // State for reason dropdown
    const [reasonDropdown, setReasonDropdown] = useState({});

    const toggleReasonDropdown = (index) => {
        setReasonDropdown(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Function to render Leave Status table
    const renderLeaveTable = (leaveData) => {
        // Check if there's no leave data
        if (!leaveData || leaveData.length === 0) {
            return (
                <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-4xl mb-4">📅</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Data Available</h3>
                            <p className="text-gray-600 mb-4">No leave requests found at the moment.</p>
                            <div className="text-sm text-gray-500">
                                Leave requests will appear here once they are submitted
                            </div>
                        </div>
                    </td>
                </tr>
            );
        }

        return leaveData?.map((leave, index) => (
            <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[120px]" title={leave?.employeeInfo?.employeeName}>{leave?.employeeInfo?.employeeName}</div>
                    <div className="text-xs text-gray-500 hidden sm:block truncate max-w-[120px]" title={leave?.employeeInfo?.designation}>{leave?.employeeInfo?.designation}</div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{leave.leaveStartDate}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{leave.leaveEndDate}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap">{formatDays(leave.totalDays)}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLeaveTypeStyle(leave.leaveType)}`} title={leave?.leaveType}>
                        {getLeaveTypeAbbreviation(leave.leaveType)}
                    </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    {leave.leaveType === "medicalLeave" ? (
                        <Link to={leave?.location} className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors">
                            <span className="hidden sm:inline">View File</span>
                            <span className="sm:hidden">File</span>
                        </Link>
                    ) : (
                        <span className="text-gray-400 text-xs">--</span>
                    )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 relative">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors duration-200" onClick={() => toggleReasonDropdown(index)}>
                        <span className="truncate max-w-[120px]" title={leave?.reason}>
                            {getFirstWord(leave?.reason)}
                        </span>
                        {leave?.reason && leave?.reason.split(' ').length > 1 && (
                            <span className="text-gray-400 text-xs">
                                ▼
                            </span>
                        )}
                    </div>
                    {reasonDropdown[index] && leave?.reason && (
                        <div className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 max-w-[300px] min-w-[200px]">
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-normal">
                                {leave?.reason}
                            </div>
                            <div className="flex justify-end items-center mt-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => toggleReasonDropdown(index)}
                                    className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell whitespace-nowrap truncate max-w-[100px]" title={leave?.remarks || "---"}>{leave?.remarks || "---"}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(leave.status)}`}>
                        {leave.status}
                    </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                    {leave.status === 'Pending' ? (
                        <button
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                            onClick={() => dispatch(deleteLeaveRequestAction({ id: leave?._id }))}
                        >
                            Delete
                        </button>
                    ) : leave.status === 'Approved' ? (
                        // Only show undo button for managers
                        (userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") ? (
                            leave?.leaveType === 'UL' ||
                                leave?.leaveType === 'optionalLeave' ||
                                leave?.leaveType === 'shortLeave' ? (
                                <span className="text-gray-400 text-xs">--</span>
                            ) : leave?.revertLeave?.requestedDateTime === "" ? (
                                <button
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
                                    onClick={() => {
                                        setOpenUndoModel(true);
                                        setUserId(leave?._id);
                                    }}
                                >
                                    UNDO
                                </button>
                            ) : (
                                <button
                                    className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        leave.revertLeave.status === 'Pending'
                                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                            : leave.revertLeave.status === 'Rejected'
                                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                    onClick={() => {
                                        setOpenUndoModel(true);
                                        setUserId(leave?._id);
                                    }}
                                    disabled={leave.revertLeave.status !== 'Pending'}
                                >
                                    {leave.revertLeave.status === 'Pending' ? 'Pending' : leave.revertLeave.status === 'Rejected' ? 'Rejected' : 'Approved'}
                                </button>
                            )
                        ) : (
                            <span className="text-gray-400 text-xs">--</span>
                        )
                    ) : (
                        <span className="text-gray-400 text-xs">--</span>
                    )}
                </td>
            </tr>
        ));
    };

    // Function to render Compoff Status table
    const renderCompoffTable = (compoffData) => {
        // Check if there's no compoff data
        if (!compoffData || compoffData.length === 0) {
            return (
                <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-4xl mb-4">🔄</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Comp-Off Data Available</h3>
                            <p className="text-gray-600 mb-4">No comp-off requests found at the moment.</p>
                            <div className="text-sm text-gray-500">
                                Comp-off requests will appear here once they are submitted
                            </div>
                        </div>
                    </td>
                </tr>
            );
        }

        return compoffData?.map((item, index1) => (
            <tr key={index1} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index1 % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[120px]" title={item?.employeeInfo?.employeeName}>{item?.employeeInfo?.employeeName}</div>
                    <div className="text-xs text-gray-500 hidden sm:block truncate max-w-[120px]" title={item?.employeeInfo?.designation || '---'}>{item?.employeeInfo?.designation || '---'}</div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{item.compOffDate || '---'}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{item.compOffDate || '---'}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap">{formatDays(item.totalDays)}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200" title="Comp-Off">
                        CO
                    </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 relative">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors duration-200" onClick={() => toggleReasonDropdown(`compoff-${index1}`)}>
                        <span className="truncate max-w-[120px]" title={item?.reason}>
                            {getFirstWord(item?.reason)}
                        </span>
                        {item?.reason && item?.reason.split(' ').length > 1 && (
                            <span className="text-gray-400 text-xs">
                                ▼
                            </span>
                        )}
                    </div>
                    {reasonDropdown[`compoff-${index1}`] && item?.reason && (
                        <div className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 max-w-[300px] min-w-[200px]">
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-normal">
                                {item?.reason}
                            </div>
                            <div className="flex justify-end items-center mt-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => toggleReasonDropdown(`compoff-${index1}`)}
                                    className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{item?.comments || '---'}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                        {item?.status}
                    </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className="text-gray-400 text-xs">--</span>
                </td>
            </tr>
        ));
    };

    const renderVendorTable = (filterVendorData) => {
        // Check if there's no vendor data
        if (!filterVendorData || filterVendorData.length === 0) {
            return (
                <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Vendor Data Available</h3>
                            <p className="text-gray-600 mb-4">No vendor meeting requests found at the moment.</p>
                            <div className="text-sm text-gray-500">
                                Vendor meeting requests will appear here once they are submitted
                            </div>
                        </div>
                    </td>
                </tr>
            );
        }

        return filterVendorData?.map((item, index1) => (
            <tr key={index1} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index1 % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm">
                    <div className="font-medium text-gray-900 text-xs sm:text-sm">{item?.employeeInfo?.employeeName}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">{item?.employeeInfo?.contactNo || '---'}</div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{item.dateTime?.split(' ')[0] || '---'}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{item.dateTime?.split(' ')[0] || '---'}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">{item.totalDays}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLeaveTypeStyle(item.leaveType)}`} title={item?.leaveType}>
                        {getLeaveTypeAbbreviation(item.leaveType)}
                    </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className="text-gray-400 text-xs">---</span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 relative">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors duration-200" onClick={() => toggleReasonDropdown(`vendor-${index1}`)}>
                        <span className="truncate max-w-[120px]" title={item?.reason}>
                            {getFirstWord(item?.reason)}
                        </span>
                        {item?.reason && item?.reason.split(' ').length > 1 && (
                            <span className="text-gray-400 text-xs">
                                ▼
                            </span>
                        )}
                    </div>
                    {reasonDropdown[`vendor-${index1}`] && item?.reason && (
                        <div className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 max-w-[300px] min-w-[200px]">
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-normal">
                                {item?.reason}
                            </div>
                            <div className="flex justify-end items-center mt-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => toggleReasonDropdown(`vendor-${index1}`)}
                                    className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{item?.remarks || '---'}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                        {item?.status}
                    </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className="text-gray-400 text-xs">---</span>
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-3 sm:p-6 bg-gray-50 full-height-content flex flex-col">
            <ToastContainer />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <AddEmployee tittleBtn="+ Create Leave Request" />
            </div>

            {/* Status Tabs - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                <button
                    onClick={() => {
                        setSelectedTab('leave');
                        setCurrentPage(1);
                    }}
                    className={`p-3 sm:p-4 rounded-lg shadow-sm transition-all duration-200 ${
                        selectedTab === 'leave' 
                            ? 'bg-white shadow-md border-2 border-blue-500' 
                            : 'bg-white hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-center w-full sm:w-64 h-16 sm:h-20">
                        <h2 className={`text-lg sm:text-xl font-semibold ${
                            selectedTab === 'leave' ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                            Leave Status
                        </h2>
                    </div>
                </button>
                <button
                    onClick={() => {
                        setSelectedTab('compoff');
                        setCurrentPage(1);
                    }}
                    className={`p-3 sm:p-4 rounded-lg shadow-sm transition-all duration-200 ${
                        selectedTab === 'compoff' 
                            ? 'bg-white shadow-md border-2 border-gray-900' 
                            : 'bg-white hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-center w-full sm:w-64 h-16 sm:h-20">
                        <h2 className={`text-lg sm:text-xl font-semibold ${
                            selectedTab === 'compoff' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                            Compoff Status
                        </h2>
                    </div>
                </button>
                <button
                    onClick={() => {
                        setSelectedTab('vendor');
                        setCurrentPage(1);
                    }}
                    className={`p-3 sm:p-4 rounded-lg shadow-sm transition-all duration-200 ${
                        selectedTab === 'vendor' 
                            ? 'bg-white shadow-md border-2 border-blue-500' 
                            : 'bg-white hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-center w-full sm:w-64 h-16 sm:h-20">
                        <h2 className={`text-lg sm:text-xl font-semibold ${
                            selectedTab === 'vendor' ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                            Vendor Status
                        </h2>
                    </div>
                </button>
            </div>

            {/* Filter Dropdown */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                
                {/* Custom Dropdown */}
                <div className="relative w-full sm:w-auto custom-dropdown">
                    <button
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="flex items-center justify-between w-full sm:w-36 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            filterStatus === 'All' ? 'bg-gray-100 text-gray-700' :
                            filterStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                            filterStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {filterStatus}
                        </span>
                        <svg 
                            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isFilterDropdownOpen && (
                        <div className="absolute z-50 w-full sm:w-36 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                            <button
                                onClick={() => {
                                    setFilterStatus('All');
                                    setCurrentPage(1);
                                    setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 ${
                                    filterStatus === 'All' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    All
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setFilterStatus('Approved');
                                    setCurrentPage(1);
                                    setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 ${
                                    filterStatus === 'Approved' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Approved
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setFilterStatus('Pending');
                                    setCurrentPage(1);
                                    setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 ${
                                    filterStatus === 'Pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                    Pending
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setFilterStatus('Rejected');
                                    setCurrentPage(1);
                                    setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 ${
                                    filterStatus === 'Rejected' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Rejected
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name & Position</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Date</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">End Date</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Day Count</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Leave Type</th>
                                {selectedTab !== "compoff" && (
                                    <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Attachment</th>
                                )}
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Reason</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell whitespace-nowrap">Remarks</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-2 sm:px-4 py-3 sm:py-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedTab === 'leave' ? renderLeaveTable(currentLeaveData) : 
                             selectedTab === "compoff" ? renderCompoffTable(currentCompoffData) : 
                             renderVendorTable(currentVendorData)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 sm:mt-6">
                <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Previous
                        </button>
                    )}
                    {currentPage < totalPages && (
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>

            {/* Undo Modal */}
            {openUndoModel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10 p-4 sm:p-6">
                        <button onClick={closeModal} className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-600">
                            <RxCross2 size={20} />
                        </button>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Revert Leave</h2>
                        <div className="flex flex-col gap-4">
                            <input
                                type="number"
                                id="days"
                                name="days"
                                placeholder="How many days?"
                                value={selectDays}
                                onChange={(e) => setLeaveDays(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={() => {
                                    const id = userId;
                                    const revertedDays = selectDays;
                                    dispatch(postrevertLeaveRequest(revertedDays, id));
                                    closeModal();
                                }}
                                className="w-full text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-3 transition-colors"
                            >
                                Revert Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployessLeave;