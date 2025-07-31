import React, { useEffect, useState, useRef } from "react";
import ddHealthcare from "../assets/Icon/ddHealthcare.png";
import { IoMdNotifications } from "react-icons/io";
import { FaBars } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import Notifications from "../notification/Notification";
import {
  getPunchInDataAction,
  postPunchInDataAction,
  postPunchOutDataAction,
} from "../store/action/userAdminAction";

function Navbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const webcamRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [punchInState, setPunchInState] = useState(false);

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

  useEffect(() => {
    dispatch(getPunchInDataAction());
  }, [timer, locationInfo.state]);

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

  const isPunchedIn = punchInData?.InTime?.length > 0;
  const isPunchedOut = punchInData?.OutTime === "NA" || punchInState;

  return (
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
          <div className="relative">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <IoMdNotifications size={24} />
              {userDataRaw?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {userDataRaw.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]">
              {userData.employeeName}
            </span>
          </div>
          
          <div className="bg-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold">
            {userData.employeeName?.charAt(0)}
          </div>
        </div>
      </div>

      {/* Punch Controls Section (Desktop) */}
      {userType !== "HR-Admin" && userType !== "Super-Admin" && (
        <div className="hidden md:flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <div className="flex items-center space-x-4">
            {isPunchedOut ? (
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm flex items-center space-x-2 hover:bg-red-600 transition-colors duration-200"
                onClick={handlePunchOut}
              >
                <FaRegClock />
                <span>Punch Out</span>
              </button>
            ) : !isPunchedIn ? (
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm flex items-center space-x-2 hover:bg-yellow-600 transition-colors duration-200"
                onClick={() => setIsCameraOpen(true)}
              >
                <FaRegClock />
                <span>Punch In</span>
              </button>
            ) : null}

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

      {/* Notification Modal */}
      {isModalOpen && (
        <Notifications
          closeModal={(e) => {
            if (e.target.id === "modal-overlay") setIsModalOpen(false);
          }}
          sendDataToParent={(data) => {
            console.log("Notification data:", data?.length?.toString(2));
          }}
        />
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
    </div>
  );
}

export default Navbar;
