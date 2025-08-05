import React, { useEffect, useState, useRef } from "react";
import ddHealthcare from "../assets/Icon/ddHealthcare.png";
import { IoMdNotifications } from "react-icons/io";
import { FaBars } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  getPunchInDataAction,
  postPunchInDataAction,
  postPunchOutDataAction,
} from "../store/action/userAdminAction";
import { 
  putApprovedLeaveByManagerNavbarAction, 
  getLeaveApproveRequestAction,
  getCompoffLeaveRequestAction,
  getVendorLogsAction,
  putCompOffLeaveRequestAction,
  putRevertLeaveByManagerAction,
  putVendorStatusDataAction
} from "../store/action/userDataAction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const webcamRef = useRef(null);


  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [punchInState, setPunchInState] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const [locationInfo, setLocationInfo] = useState({
    city: "",
    state: "",
    suburb: "",
  });

  const { data: punchInDataRaw } = useSelector((state) => state.punchInDataReducer);
  const punchInData = punchInDataRaw?.data;

  const { data: userDataRaw } = useSelector((state) => state.userData);
  const userData = userDataRaw?.data || {};
  const userType = userData?.role;

  const { data: leaveRequestData } = useSelector((state) => state?.managerLeaveApprove);
  const { data: compOffData } = useSelector((state) => state?.compoffApprove);
  const { data: vendorData } = useSelector((state) => state?.vendorLogsData);
  
  const leaveReqData = leaveRequestData?.data || [];
  const compOffReqData = compOffData?.data || [];
  const vendorReqData = vendorData?.data || [];
  
  // Combine all pending notifications from different approval types - for managers and super admins
  const pendingLeaveNotifications = (userType === "Manager" || userType === "Super-Admin") ? leaveReqData?.filter((item) => item.status === "Pending") || [] : [];
  const pendingCompOffNotifications = (userType === "Manager" || userType === "Super-Admin") ? compOffReqData?.filter((item) => item.status === "Pending") || [] : [];
  const pendingVendorNotifications = (userType === "Manager" || userType === "Super-Admin") ? vendorReqData?.filter((item) => item.status === "Pending") || [] : [];
  const pendingRevertNotifications = (userType === "Manager" || userType === "Super-Admin") ? leaveReqData?.filter((item) => item?.revertLeave?.status === "Pending") || [] : [];
  
  // Combine all notifications with type indicators
  const pendingNotifications = [
    ...pendingLeaveNotifications.map(item => ({ ...item, type: 'leave' })),
    ...pendingCompOffNotifications.map(item => ({ ...item, type: 'compoff' })),
    ...pendingVendorNotifications.map(item => ({ ...item, type: 'vendor' })),
    ...pendingRevertNotifications.map(item => ({ ...item, type: 'revert' }))
  ];

  useEffect(() => {
    dispatch(getPunchInDataAction());
    dispatch(getLeaveApproveRequestAction());
    dispatch(getCompoffLeaveRequestAction());
    dispatch(getVendorLogsAction());
  }, []); // Only run once on mount

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      // Show custom confirmation popup when back button is clicked
      event.preventDefault();
      setShowLogoutConfirm(true);
      // Push the current state back to prevent navigation
      window.history.pushState(null, null, window.location.pathname);
    };

    const handleKeyDown = (event) => {
      // Close popup with Escape key
      if (event.key === 'Escape' && showLogoutConfirm) {
        setShowLogoutConfirm(false);
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);
    
    // Push initial state to enable popstate detection
    window.history.pushState(null, null, window.location.pathname);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLogoutConfirm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
      if (showNotificationDropdown && !event.target.closest('.notification-dropdown')) {
        setShowNotificationDropdown(false);
      }
      // Close logout confirmation popup when clicking outside
      if (showLogoutConfirm && !event.target.closest('.logout-confirm-modal')) {
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showNotificationDropdown, showLogoutConfirm]);

  const startTimer = () => {
    const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const getLocationAndDispatch = async (image) => {
    const success = async ({ coords }) => {
      const { latitude, longitude } = coords;
      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=d67b43154d4442638a0648615ec76cbd`
        );
        const data = await res.json();
        const components = data.results[0]?.components || {};

        const city = components.city || components.town || "Unknown city";
        const state = components.state || "Unknown state";
        const suburb = components.suburb || components.town || "Unknown suburb";

        setLocationInfo({ city, state, suburb });

        dispatch(
          postPunchInDataAction({
            location: `${city}, ${state}`,
            imageUrl: image,
          })
        );
      } catch (err) {
        console.error("Location fetch error:", err);
        setLocationInfo({ city: "Unknown", state: "Unknown", suburb: "Unknown" });
      }
    };

    const error = () => {
      setLocationInfo({ city: "Denied", state: "Unknown", suburb: "Unknown" });
    };

    navigator.geolocation?.getCurrentPosition(success, error);
  };

  const handleCapture = () => {
    const image = webcamRef.current.getScreenshot();
    setCapturedImage(image);
    setShowImageOptions(true);
  };

  const handleUploadImage = () => {
    if (capturedImage) {
      getLocationAndDispatch(capturedImage);
      setIsCameraOpen(false);
      setShowImageOptions(false);
      setPunchInState(true);
      startTimer();
    }
  };

  const handlePunchOut = () => {
    dispatch(postPunchOutDataAction({ id: punchInData?._id }));
    setPunchInState(false);
    stopTimer();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("employeId");
    localStorage.removeItem("selectedTag");
    navigate("/");
  };

  const handleViewProfile = () => {
    localStorage.setItem("selectedTag", "profile");
    window.location.reload();
    setShowProfileDropdown(false);
  };

  const handleNotificationAction = async (status, id, type = 'leave') => {
    try {
      let action;
      
      // Choose the appropriate action based on notification type
      switch (type) {
        case 'leave':
          action = putApprovedLeaveByManagerNavbarAction({ status, id });
          break;
        case 'compoff':
          action = putCompOffLeaveRequestAction({ status, id });
          break;
        case 'vendor':
          action = putVendorStatusDataAction({ status, id });
          break;
        case 'revert':
          action = putRevertLeaveByManagerAction({ status, id });
          break;
        default:
          action = putApprovedLeaveByManagerNavbarAction({ status, id });
      }
      
      await dispatch(action);
      
      // Show specific success message based on type
      const typeLabels = {
        'leave': 'Leave request',
        'compoff': 'Comp-Off request',
        'vendor': 'Vendor meeting request',
        'revert': 'Revert request'
      };
      
      toast.success(`${typeLabels[type]} ${status.toLowerCase()} successfully!`);
      
      // Close the notification dropdown
      setShowNotificationDropdown(false);
      
      // Refresh all data after a short delay
      setTimeout(() => {
        dispatch(getLeaveApproveRequestAction());
        dispatch(getCompoffLeaveRequestAction());
        dispatch(getVendorLogsAction());
      }, 1500);
    } catch (error) {
      toast.error("Failed to process the request. Please try again.");
    }
  };

  const isPunchedIn = punchInData?.InTime?.length > 0;
  const isPunchedOut = punchInData?.OutTime === "NA" || punchInState;

  return (
    <>
      <ToastContainer />
      <div className="bg-white shadow-md w-full">
      {/* Main Navbar */}
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleSidebar} 
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden"
            aria-label="Toggle menu"
          >
            <FaBars size={20} />
          </button>
          <img src={ddHealthcare} alt="DD Healthcare Logo" className="w-20 h-10 md:w-24 md:h-12" />
        </div>

        {/* Center Section - Punch Controls (Mobile) */}
        <div className="flex items-center space-x-2 md:hidden">
          {userType !== "HR-Admin" && userType !== "Super-Admin" && (
            <>
              {isPunchedOut ? (
                <button
                  className="px-3 py-2 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  onClick={handlePunchOut}
                >
                  <FaRegClock className="text-white" />
                </button>
              ) : !isPunchedIn ? (
                <button
                  className="px-3 py-2 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-yellow-600 transition-colors duration-200"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <FaRegClock size={16} className="text-white" />
                </button>
              ) : null}
            </>
          )}
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center space-x-3">
          {/* Punch In Button - Desktop */}
          {userType !== "HR-Admin" && userType !== "Super-Admin" && (
            <div className="hidden md:block">
              {isPunchedOut ? (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-full text-sm flex items-center space-x-2 hover:bg-red-600 transition-colors duration-200"
                  onClick={handlePunchOut}
                >
                  <FaRegClock />
                  <span>Punch Out</span>
                </button>
              ) : !isPunchedIn ? (
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm flex items-center space-x-2 hover:bg-yellow-600 transition-colors duration-200"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <FaRegClock />
                  <span>Punch In</span>
                </button>
              ) : null}
            </div>
          )}
          
          {(userType === "Manager" || userType === "Super-Admin") && (
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
                aria-label="Notifications"
              >
                <IoMdNotifications size={24} />
                {pendingNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {pendingNotifications.length}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 notification-dropdown">
                <div className="py-3">
                  <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100 font-bold bg-gray-50 rounded-t-xl">
                    Notifications ({pendingNotifications.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {pendingNotifications.length > 0 ? (
                      pendingNotifications.map((item, index) => {
                        // Get appropriate labels based on notification type
                        const getTypeLabel = (type) => {
                          switch (type) {
                            case 'leave':
                              return item?.leaveType || 'Leave';
                            case 'compoff':
                              return 'Comp-Off';
                            case 'vendor':
                              return 'Vendor Meeting';
                            case 'revert':
                              return 'Revert Leave';
                            default:
                              return 'Request';
                          }
                        };

                        const getDateLabel = (type) => {
                          switch (type) {
                            case 'leave':
                              return item?.leaveStartDate;
                            case 'compoff':
                            case 'vendor':
                              return item?.dateTime?.split(' ')[0] || item?.appliedDate?.split(' ')[0];
                            case 'revert':
                              return item?.revertLeave?.requestedDateTime?.split(' ')[0];
                            default:
                              return '';
                          }
                        };

                        return (
                          <div key={index} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.type === 'leave' ? 'bg-blue-100 text-blue-800' :
                                    item.type === 'compoff' ? 'bg-green-100 text-green-800' :
                                    item.type === 'revert' ? 'bg-orange-100 text-orange-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {getTypeLabel(item.type)}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  <strong>{item?.employeeInfo?.employeeName}</strong> {item.type === 'revert' ? 'requesting to revert' : 'applying'} {getTypeLabel(item.type)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.type === 'revert' 
                                    ? `${item?.revertLeave?.revertedDays || "---"} days to revert • ${getDateLabel(item.type)}`
                                    : `${item?.totalDays && item?.totalDays !== "undefined" ? `${item?.totalDays} days` : "---"} • ${getDateLabel(item.type)}`
                                  }
                                </p>
                              </div>
                              <div className="flex space-x-2 ml-3">
                                <button
                                  onClick={() => handleNotificationAction("Approved", item?._id, item.type)}
                                  className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-500 hover:text-white text-xs font-medium transition-colors duration-200"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleNotificationAction("Rejected", item?._id, item.type)}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white text-xs font-medium transition-colors duration-200"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <IoMdNotifications className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No pending notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="bg-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-600 transition-colors duration-200"
            >
              {userData.employeeName?.charAt(0)}
            </button>
            
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 profile-dropdown">
                <div className="py-3">
                  <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100 font-bold bg-gray-50 rounded-t-xl">
                    {userData.employeeName}
                  </div>
                  <div className="p-3 space-y-3">
                    <button
                      onClick={handleViewProfile}
                      className="w-full px-4 py-3 text-sm text-gray-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center space-x-3 transition-all duration-200 rounded-lg border border-blue-100 shadow-sm"
                    >
                      <CgProfile size={18} />
                      <span className="font-medium">View Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-sm text-white bg-red-500 hover:bg-red-600 flex items-center justify-center space-x-2 rounded-lg transition-colors duration-200 font-medium shadow-sm"
                    >
                      <IoLogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location and Punch Time Info */}
      {userType !== "HR-Admin" && userType !== "Super-Admin" && (
        <div className="hidden md:flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <div className="flex items-center space-x-4">
            {locationInfo.city && (
              <span className="text-sm text-gray-700">
                📍 {locationInfo.suburb}, {locationInfo.city}, {locationInfo.state}
              </span>
            )}
          </div>

          {isPunchedIn && (
            <span className="text-sm text-gray-700">
              ⏰ Punch In Time: {punchInData?.InTime?.split(" ")[1]}
            </span>
          )}
        </div>
      )}



      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-xl flex flex-col items-center gap-4">
            {!capturedImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg w-full"
                />
                <button
                  onClick={handleCapture}
                  className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  Capture Image
                </button>
              </>
            ) : (
              <>
                <img src={capturedImage} alt="Captured" className="rounded w-full object-cover" />
                {showImageOptions && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setShowImageOptions(false);
                      }}
                      className="bg-yellow-500 text-white w-full py-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                    >
                      Retry Image
                    </button>
                    <button
                      onClick={handleUploadImage}
                      className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition-colors duration-200"
                    >
                      Upload Image
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => {
                setIsCameraOpen(false);
                setCapturedImage(null);
                setShowImageOptions(false);
              }}
              className="text-red-500 hover:underline text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl logout-confirm-modal">
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure you want to leave?
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-600 mb-6">
                You have unsaved changes. If you leave now, you will be logged out of the application.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Stay Here
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                >
                 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default Navbar;
