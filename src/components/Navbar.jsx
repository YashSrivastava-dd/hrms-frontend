import React, { useEffect, useState, useRef } from "react";
import ddHealthcare from "../assets/Icon/ddHealthcare.png";
import { IoMdNotifications } from "react-icons/io";
import { FaBars } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaFingerprint } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { IoRefresh } from "react-icons/io5";
// import Webcam from "react-webcam"; // Commented out - no longer needed
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Commented out punch in/out actions - no longer needed
// import {
//   getPunchInDataAction,
//   postPunchInDataAction,
//   postPunchOutDataAction,
// } from "../store/action/userAdminAction";
import { 
  putApprovedLeaveByManagerNavbarAction, 
  getLeaveApproveRequestAction,
  getCompoffLeaveRequestAction,
  getVendorLogsAction,
  putCompOffLeaveRequestAction,
  putRevertLeaveByManagerAction,
  putVendorStatusDataAction,
  getAnnouncementDataAction
} from "../store/action/userDataAction";

import "react-toastify/dist/ReactToastify.css";
import safeToast from "../utils/safeToast";

function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const webcamRef = useRef(null); // Commented out - no longer needed

  // Commented out punch in/out related states - keeping for reference
  // const [isCameraOpen, setIsCameraOpen] = useState(false);
  // const [capturedImage, setCapturedImage] = useState(null);
  // const [showImageOptions, setShowImageOptions] = useState(false);
  // const [punchInState, setPunchInState] = useState(false);
  // const [timer, setTimer] = useState(0);
  // const [intervalId, setIntervalId] = useState(null);
  // const [locationInfo, setLocationInfo] = useState({
  //   city: "",
  //   state: "",
  //   suburb: "",
  // });

  // State for punch modal (now opens new tab instead of iframe)
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  
  // Punch status state management
  const [punchStatus, setPunchStatus] = useState(null); // null = unknown, true = punched in, false = punched out
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Timer removed: no punch state tracking in the navbar
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const punchWindowRef = useRef(null);

  // Commented out punch in/out data - keeping for reference
  // const { data: punchInDataRaw } = useSelector((state) => state.punchInDataReducer);
  // const punchInData = punchInDataRaw?.data;

  const { data: userDataRaw } = useSelector((state) => state.userData);
  const userData = userDataRaw?.data || {};
  const userType = userData?.role;

  const { data: leaveRequestData } = useSelector((state) => state?.managerLeaveApprove);
  const { data: compOffData } = useSelector((state) => state?.compoffApprove);
  const { data: vendorData } = useSelector((state) => state?.vendorLogsData);
  const { data: announcementData } = useSelector((state) => state?.announcementData);
  
  const leaveReqData = leaveRequestData?.data || [];
  const compOffReqData = compOffData?.data || [];
  const vendorReqData = vendorData?.data || [];
  const announcementDataRaw = announcementData?.data || [];
  
  // Combine all pending notifications from different approval types - for managers, super admins, and HR admins
  const pendingLeaveNotifications = (userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") ? leaveReqData?.filter((item) => item.status === "Pending") || [] : [];
  const pendingCompOffNotifications = (userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") ? compOffReqData?.filter((item) => item.status === "Pending") || [] : [];
  const pendingVendorNotifications = (userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") ? vendorReqData?.filter((item) => item.status === "Pending") || [] : [];
  const pendingRevertNotifications = (userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") ? leaveReqData?.filter((item) => item?.revertLeave?.status === "Pending") || [] : [];
  
  // Combine all notifications with type indicators and sort by most recent applied date
  const pendingNotifications = [
    ...pendingLeaveNotifications.map(item => ({ ...item, type: 'leave' })),
    ...pendingCompOffNotifications.map(item => ({ ...item, type: 'compoff' })),
    ...pendingVendorNotifications.map(item => ({ ...item, type: 'vendor' })),
    ...pendingRevertNotifications.map(item => ({ ...item, type: 'revert' }))
  ].sort((a, b) => {
    // Get the applied date for each notification type
    const getAppliedDate = (item) => {
      switch (item.type) {
        case 'leave':
          return new Date(item?.appliedDate || item?.createdAt || item?.dateTime || 0);
        case 'compoff':
          return new Date(item?.appliedDate || item?.dateTime || item?.createdAt || 0);
        case 'vendor':
          return new Date(item?.appliedDate || item?.dateTime || item?.createdAt || 0);
        case 'revert':
          return new Date(item?.revertLeave?.requestedDateTime || item?.appliedDate || item?.createdAt || 0);
        default:
          return new Date(item?.appliedDate || item?.createdAt || item?.dateTime || 0);
      }
    };

    const dateA = getAppliedDate(a);
    const dateB = getAppliedDate(b);
    
    // Sort in descending order (most recent first)
    return dateB - dateA;
  });

  // Employee notifications - announcements and warnings
  const employeeNotifications = (userType !== "Manager" && userType !== "Super-Admin" && userType !== "HR-Admin") ? 
    announcementDataRaw?.filter((item) => {
      const announcementDate = new Date(item.dateTime);
      const now = new Date();
      const diffTime = announcementDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Show active announcements (not expired) and warnings (expiring soon - within 7 days)
      return diffDays > -7; // Show announcements from last 7 days and future ones
    }).map(item => ({
      ...item,
      type: 'announcement',
      isWarning: (() => {
        const announcementDate = new Date(item.dateTime);
        const now = new Date();
        const diffTime = announcementDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7; // Warning if expiring within 7 days
      })()
    })) || [] : [];

  useEffect(() => {
    // Only dispatch API actions if we have valid authentication
    const token = localStorage.getItem("authToken");
    const employeeId = localStorage.getItem("employeId");
    
    if (token && employeeId && token !== 'null' && token !== 'undefined' && employeeId !== 'null' && employeeId !== 'undefined') {
      // dispatch(getPunchInDataAction()); // Commented out - no longer needed
      dispatch(getLeaveApproveRequestAction());
      dispatch(getCompoffLeaveRequestAction());
      dispatch(getVendorLogsAction());
      dispatch(getAnnouncementDataAction());
    } else {
      console.log('Navbar: Skipping API calls - no valid authentication');
    }
  }, []); // Only run once on mount

  // Real-time clock update
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

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
      // Close punch modal when clicking outside
      if (showPunchModal && !event.target.closest('.punch-modal') && !event.target.closest('.punch-modal-content')) {
        setShowPunchModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showNotificationDropdown, showLogoutConfirm, showPunchModal]);

  // Cleanup toasts on component unmount
  useEffect(() => {
    return () => {
      // Dismiss all toasts when component unmounts to prevent runtime errors
      safeToast.dismiss();
    };
  }, []);

  // Function to check punch status
  const checkPunchStatus = async () => {
    const employeeId = userData?.employeeId;
    if (!employeeId) {
      console.log('No employee ID available for status check');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(`https://dsrsolar.in/punch_records/checkstatus.php?employeeId=${employeeId}&v=${timestamp}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Punch status response:', data);
      
      // Assuming the API returns a boolean or status indicating if user is punched in
      // Adjust this logic based on the actual API response format
      const isPunchedIn = data?.isPunchedIn || data?.status === 'punched_in' || data?.punchedIn === true;
      setPunchStatus(isPunchedIn);
      
      // Show different colored toast notifications based on punch status
      if (isPunchedIn) {
        safeToast.success('You are already punched in!');
      } else {
        safeToast.error('Punched Out');
      }
    } catch (error) {
      console.error('Error checking punch status:', error);
      safeToast.error('Failed to check punch status');
      setPunchStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Construct dynamic URL for punch system with employee information
  useEffect(() => {
    const employeeId = userData?.employeeId || '';
    const employeeName = userData?.employeeName || '';
    
    if (employeeId || employeeName) {
      const params = new URLSearchParams({ 
        employeeId, 
        employeeName 
      });
      setIframeUrl(`https://dsrsolar.in/punch_records/index.html?${params.toString()}`);
    } else {
      setIframeUrl('https://dsrsolar.in/punch_records/index.html');
    }
  }, [userData?.employeeId, userData?.employeeName]);

  // Listen for messages from the punch system window/tab (punch in/out events)
  // 
  // EXPECTED IFRAME COMMUNICATION PROTOCOL:
  // ======================================
  // 
  // 1. When the punch window loads, parent sends 'parentReady' message with current status
  // 2. When user punches in successfully, the punch window should send:
  //    window.parent.postMessage({
  //      type: 'punchInSuccess',
  //      data: {
  //        employeeId: 'EMP123',
  //        timestamp: '2025-01-20T09:00:00Z',
  //        location: 'Office',
  //        imageUrl: 'base64_image_data'
  //      }
  //    }, 'https://your-domain.com');
  //
  // 3. When user punches out successfully, the punch window should send:
  //    window.parent.postMessage({
  //      type: 'punchOutSuccess', 
  //      data: {
  //        employeeId: 'EMP123',
  //        timestamp: '2025-01-20T18:00:00Z',
  //        totalHours: '09:00',
  //        location: 'Office'
  //      }
  //    }, 'https://your-domain.com');
  //
  // 4. Parent will automatically:
  //    - Close iframe dialog
  //    - Start/stop timer
  //    - Show success message
  //    - Save data to localStorage
  //
  useEffect(() => {
    const handleMessage = (event) => {
      // Log all messages for debugging
      console.log('Received message:', event.origin, event.data);
      
      // Ensure message is from the attendance system window/tab
      if (event.origin !== 'https://dsrsolar.in') {
        return;
      }

      const { type, data } = event.data;
      
      switch (type) {
        case 'punch-status-change':
          // Adapter for window implementation in /punch/html
          // action: 'punch-in' | 'punch-out'
          if (event?.data?.action === 'punch-in') {
            console.log('Punch In detected (adapter):', event.data);
            handlePunchInSuccess({ employeeId: event?.data?.employeeId });
          } else if (event?.data?.action === 'punch-out') {
            console.log('Punch Out detected (adapter):', event.data);
            handlePunchOutSuccess({ employeeId: event?.data?.employeeId });
          }
          break;
        case 'punchInSuccess':
          console.log('Punch In Success detected:', data);
          handlePunchInSuccess(data);
          break;
        case 'punchOutSuccess':
          console.log('Punch Out Success detected:', data);
          handlePunchOutSuccess(data);
          break;
        case 'PUNCH_IN':
          console.log('Punch In detected (legacy):', data);
          handlePunchInSuccess(data);
          break;
        case 'PUNCH_OUT':
          console.log('Punch Out detected (legacy):', data);
          handlePunchOutSuccess(data);
          break;
        case 'punch_in':
          console.log('Punch In detected (lowercase):', data);
          handlePunchInSuccess(data);
          break;
        case 'punch_out':
          console.log('Punch Out detected (lowercase):', data);
          handlePunchOutSuccess(data);
          break;
        case 'statusResponse':
          console.log('Status response received:', data);
          if (data.isPunchedOut && isPunchedIn) {
            console.log('Iframe reports user is punched out, stopping timer');
            handlePunchOutSuccess(data);
          }
          break;
        default:
          console.log('Unknown message type:', type, data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Timer removed: no persisted punch status check

  // Fallback: Check opened tab/window status (if direct communication fails)
  useEffect(() => {
    if (showPunchModal) {
      const checkIframeStatus = () => {
        try {
          const win = punchWindowRef.current;
          if (win && !win.closed) {
            console.log('Checking punch window status...');
          } else {
            console.log('Punch window is not available or was closed.');
          }
        } catch (error) {
          console.log('Cannot access punch window (expected due to cross-origin):', error.message);
        }
      };

      // Check status when modal opens
      setTimeout(checkIframeStatus, 1000);
    }
  }, [showPunchModal]);

  // Timer removed: no periodic status checks

  // Commented out punch in/out handlers - keeping for reference
  // const startTimer = () => {
  //   const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
  //   setIntervalId(id);
  // };

  // const stopTimer = () => {
  //   clearInterval(intervalId);
  //   setIntervalId(null);
  // };

  // const getLocationAndDispatch = async (image) => {
  //   const success = async ({ coords }) => {
  //     const { latitude, longitude } = coords;
  //     try {
  //       const res = await fetch(
  //         `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=d67b43154d4442638a0648615ec76cbd`
  //       );
  //       const data = await res.json();
  //       const components = data.results[0]?.components || {};

  //       const city = components.city || components.town || "Unknown city";
  //       const state = components.state || "Unknown state";
  //       const suburb = components.suburb || components.town || "Unknown suburb";

  //       setLocationInfo({ city, state, suburb });

  //       dispatch(
  //         postPunchInDataAction({
  //           location: `${city}, ${state}`,
  //           imageUrl: image,
  //         })
  //       );
  //     } catch (err) {
  //       console.error("Location fetch error:", err);
  //       setLocationInfo({ city: "Unknown", state: "Unknown", suburb: "Unknown" });
  //     }
  //   };

  //   const error = () => {
  //     setLocationInfo({ city: "Denied", state: "Unknown", suburb: "Unknown" });
  //   };

  //   navigator.geolocation?.getCurrentPosition(success, error);
  // };

  // const handleCapture = () => {
  //   const image = webcamRef.current.getScreenshot();
  //   setCapturedImage(image);
  //   setShowImageOptions(true);
  // };

  // const handleUploadImage = () => {
  //   if (capturedImage) {
  //     getLocationAndDispatch(capturedImage);
  //     setIsCameraOpen(false);
  //     setShowImageOptions(false);
  //     setPunchInState(true);
  //     startTimer();
  //   }
  // };

  // const handlePunchOut = () => {
  //   dispatch(postPunchOutDataAction({ id: punchInData?._id }));
  //   setPunchInState(false);
  //   stopTimer();
  // };

  // Timer removed: no timer utilities

  // New handler for fingerprint button
  const handleFingerprintClick = () => {
    // Open the punch system in a new tab (user gesture to avoid popup blockers)
    try {
      const newWin = window.open(iframeUrl, '_blank');
      punchWindowRef.current = newWin;
      // Do not show modal anymore
      setShowPunchModal(false);

      // Send initial message to the opened window with current status
      setTimeout(() => {
                  try {
                    if (punchWindowRef.current && !punchWindowRef.current.closed) {
                      punchWindowRef.current.postMessage({
                        type: 'parentReady',
                        data: {
                          isPunchedIn: false,
                          elapsedTime: 0,
                          employeeId: userData?.employeeId,
                          employeeName: userData?.employeeName
                        }
                      }, 'https://dsrsolar.in');

            // Also trigger a status refresh for implementations expecting it
            setTimeout(() => {
              try {
                if (punchWindowRef.current && !punchWindowRef.current.closed) {
                  punchWindowRef.current.postMessage('refresh-status', 'https://dsrsolar.in');
                }
              } catch (innerErr) {
                console.log('Cannot send refresh-status to punch window:', innerErr?.message);
              }
            }, 500);
          }
        } catch (err) {
          console.log('Cannot send message to opened window (expected):', err.message);
        }
      }, 300);
    } catch (err) {
      console.log('Failed to open punch window:', err.message);
    }
  };

  const handleClosePunchModal = () => {
    setShowPunchModal(false);
  };

  // Handle successful punch in from punch window
  const handlePunchInSuccess = (data) => {
    console.log('Processing punch in success:', data);
    
    // Close the dialog
    setShowPunchModal(false);
    localStorage.setItem('punchInData', JSON.stringify(data));

    // Update punch status
    setPunchStatus(true);

    // Show success message
    safeToast.success('Punched in successfully!');
    
  };

  // Handle successful punch out from punch window
  const handlePunchOutSuccess = (data) => {
    console.log('Processing punch out success');
    
    // Close the dialog
    setShowPunchModal(false);
    localStorage.setItem('lastPunchOutData', JSON.stringify({
      ...data,
      finalDuration: 0,
      punchInTime: null,
      punchOutTime: new Date().toISOString()
    }));

    // Update punch status
    setPunchStatus(false);

    // Show success message with duration
    safeToast.success(`Punched out successfully!`);
    
  };

  // Timer removed: no manual start

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
      
      safeToast.success(`${typeLabels[type]} ${status.toLowerCase()} successfully!`);
      
      // Close the notification dropdown
      setShowNotificationDropdown(false);
      
      // Refresh all data after a short delay
      setTimeout(() => {
        dispatch(getLeaveApproveRequestAction());
        dispatch(getCompoffLeaveRequestAction());
        dispatch(getVendorLogsAction());
      }, 1500);
    } catch (error) {
      safeToast.error("Failed to process the request. Please try again.");
    }
  };

  // Commented out punch status checks - keeping for reference
  // const isPunchedIn = punchInData?.InTime?.length > 0;
  // const isPunchedOut = punchInData?.OutTime === "NA" || punchInState;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 w-full">
      {/* Main Navbar */}
      <div className="flex items-center justify-between p-4 bg-white relative">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Mobile menu button clicked');
              onToggleSidebar();
            }} 
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden relative z-10"
            aria-label="Toggle menu"
            style={{ touchAction: 'manipulation' }}
          >
            <FaBars size={20} />
          </button>
          <img src={ddHealthcare} alt="DD Healthcare Logo" className="w-20 h-10 md:w-24 md:h-12" />
        </div>

        {/* Center Section - Real-time Clock - Hidden on Mobile */}
        <div className="hidden md:flex items-center justify-end flex-1 min-w-0 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg shadow-md min-w-0 max-w-xs">
            <div className="text-center min-w-0">
              <div className="text-base font-bold font-mono break-words leading-tight">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-xs opacity-90 break-words leading-tight mt-0.5">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          {/* Punch Controls - Refresh and Fingerprint Buttons */}
          {userType !== "HR-Admin" && userType !== "Super-Admin" && (
            <div className="flex items-center space-x-2">
              {/* Refresh Status Button */}
              <div className="flex items-center space-x-1">
                <button
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Refresh status button clicked');
                    checkPunchStatus();
                  }}
                  title="Check Punch Status"
                  disabled={isCheckingStatus}
                  style={{ touchAction: 'manipulation' }}
                >
                  <IoRefresh 
                    size={20} 
                    className={`${isCheckingStatus ? 'animate-spin' : ''}`} 
                  />
                </button>
              </div>

              {/* Fingerprint Button - Always visible */}
              <>
                {/* Mobile Fingerprint Button */}
                <div className="md:hidden flex items-center space-x-1">
                  <button
                    className="p-2 text-white rounded-full transition-colors duration-200 shadow-lg flex items-center justify-center relative z-10 bg-green-500 hover:bg-green-600 active:bg-green-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mobile fingerprint button clicked');
                      handleFingerprintClick();
                    }}
                    title="Open Punch"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <FaFingerprint size={18} />
                  </button>
                </div>

                {/* Desktop Fingerprint Button */}
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    className="px-4 py-2 text-white rounded-full text-sm flex items-center justify-center space-x-2 transition-colors duration-200 shadow-lg relative z-10 bg-green-500 hover:bg-green-600 active:bg-green-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Desktop fingerprint button clicked');
                      handleFingerprintClick();
                    }}
                  >
                    <FaFingerprint />
                    <span>Open Punch</span>
                  </button>
                </div>
              </>

              {/* Status Indicator */}
              {punchStatus !== null && (
                <div className="hidden md:flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    punchStatus ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-600">
                    {punchStatus ? 'Punched In' : 'Punched Out'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Commented out old punch controls - keeping for reference */}
          {/* Mobile Punch Controls - Positioned on the right */}
          {/* {userType !== "HR-Admin" && userType !== "Super-Admin" && (
            <div className="flex md:hidden items-center space-x-1 sm:space-x-2">
              {isPunchedOut ? (
                <button
                  className="px-2 sm:px-3 py-2 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  onClick={handlePunchOut}
                >
                  <FaRegClock className="text-white" />
                </button>
              ) : !isPunchedIn ? (
                <button
                  className="px-2 sm:px-3 py-2 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-yellow-600 transition-colors duration-200"
                  onClick={() => setIsCameraOpen(true)}
                >
                  <FaRegClock size={16} className="text-white" />
                </button>
              ) : null}
            </div>
          )} */}

          {/* Punch In Button - Desktop */}
          {/* {userType !== "HR-Admin" && userType !== "Super-Admin" && (
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
          )} */}
          
          {/* Notifications for Managers, Super-Admins, and HR-Admins */}
          {(userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Manager notification button clicked');
                  setShowNotificationDropdown(!showNotificationDropdown);
                }}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative z-10"
                aria-label="Notifications"
                style={{ touchAction: 'manipulation' }}
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[90] notification-dropdown">
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
          
          {/* Notifications for Employees */}
          {(userType !== "Manager" && userType !== "Super-Admin" && userType !== "HR-Admin") && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Employee notification button clicked');
                  setShowNotificationDropdown(!showNotificationDropdown);
                }}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative z-10"
                aria-label="Notifications"
                style={{ touchAction: 'manipulation' }}
              >
                <IoMdNotifications size={24} />
                {employeeNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {employeeNotifications.length}
                  </span>
                )}
              </button>
              
              {/* Employee Notification Dropdown */}
              {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[90] notification-dropdown">
                <div className="py-3">
                  <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100 font-bold bg-gray-50 rounded-t-xl">
                    Notifications ({employeeNotifications.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {employeeNotifications.length > 0 ? (
                      employeeNotifications.map((item, index) => {
                        const announcementDate = new Date(item.dateTime);
                        const now = new Date();
                        const diffTime = announcementDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        const getStatusColor = () => {
                          if (diffDays > 7) return 'bg-green-100 text-green-800';
                          if (diffDays > 0) return 'bg-yellow-100 text-yellow-800';
                          return 'bg-red-100 text-red-800';
                        };

                        const getStatusText = () => {
                          if (diffDays > 7) return 'Active';
                          if (diffDays > 0) return `Expires in ${diffDays} days`;
                          return 'Expired';
                        };

                        return (
                          <div key={index} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.isWarning ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {item.isWarning ? '⚠️ Warning' : '📢 Announcement'}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                                    {getStatusText()}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {item.title || 'Announcement'}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {item.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {announcementDate.toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  {item.location && ` • ${item.location}`}
                                </p>
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
                        <p className="text-sm text-gray-500">No announcements or warnings</p>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Profile button clicked');
                setShowProfileDropdown(!showProfileDropdown);
              }}
              className="bg-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold hover:bg-blue-600 transition-colors duration-200 relative z-10"
              style={{ touchAction: 'manipulation' }}
            >
              {userData?.employeeName?.charAt(0) || "?"}
            </button>
            
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-[90] profile-dropdown">
                <div className="py-3">
                  <div className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100 font-bold bg-gray-50 rounded-t-xl">
                    {userData?.employeeName || "Employee"}
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





      {/* Punch modal removed: opening occurs in a new tab directly */}

      {/* Commented out old camera modal - keeping for reference */}
      {/* Camera Modal */}
      {/* {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[95] flex items-center justify-center p-4">
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
                      className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-600 transition-colors duration-200"
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
      )} */}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[95] flex items-center justify-center p-4">
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