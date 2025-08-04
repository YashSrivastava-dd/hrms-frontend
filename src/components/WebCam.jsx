import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import {
    getPunchInDataAction,
    postPunchInDataAction,
    postPunchOutDataAction,
    getPnchInPunchOutLogsAction,
    postUpdateLocationAction,
} from "../store/action/userAdminAction";
import { getUserDataAction } from "../store/action/userDataAction";

function Navbar() {
    const [location, setLocation] = useState("");
    const [state, setState] = useState("");
    const [subState, setSubState] = useState("");
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    const { data: getPunchInData = null } = useSelector(
        (state) => state?.punchInDataReducer || {}
    );

    const { data: outsideLogs } = useSelector(
        (state) => state.punchINPunchOutLogs || {}
    );

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPunchInDataAction());
        dispatch(getUserDataAction());
        dispatch(getPnchInPunchOutLogsAction());
    }, []);


    const getLocationAndDispatch = async (id) => {
        if (!navigator.geolocation) {
          console.error("Geolocation not supported");
          setLocation("Geolocation not supported");
          setState("Unknown state");
          return;
        }
      
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=d67b43154d4442638a0648615ec76cbd`
              );
              const data = await response.json();
      
              if (!data.results || data.results.length === 0) {
                throw new Error("Invalid location data");
              }
      
              const components = data.results[0].components;
      
              const city = components.city || components.town || "Unknown city";
              const stateName = components.state || "Unknown state";
              const suburbName = components.suburb || components.town || "Unknown suburb";
      
              setLocation(city);
              setState(stateName);
              setSubState(suburbName);
      
              if (city) {
                dispatch(
                  postUpdateLocationAction({
                    id: id,
                    location: `${city}, ${suburbName}, ${stateName}`,
                  })
                )
                  .then(() => {
                    console.log("Location update dispatched successfully");
                  })
                  .catch((err) => {
                    console.error("Location update failed", err);
                  });
              }
            } catch (error) {
              console.error("Error fetching location:", error);
              alert("Failed to retrieve location data. Try again.");
              setLocation("Unknown location");
              setState("Unknown state");
              setSubState("Unknown SubState");
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            alert(`Location error: ${error.message}`);
            setLocation("Geolocation Denied");
            setState("Unknown state");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      };
      
    return (
        <div className="flex flex-col p-4 bg-white shadow-md">
            <div className="w-full mt-8 overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 border">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Punch In</th>
                            <th className="px-4 py-3">Punch Out</th>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {outsideLogs?.data?.map((entry, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-4 py-2 whitespace-nowrap">{entry.createdAt.split("T")[0]}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{entry.duration || "--"}</td>
                                <td className="px-4 py-2 text-green-600 font-medium whitespace-nowrap">
                                    {entry.InTime.split(" ")[1]}
                                </td>
                                <td className="px-4 py-2 text-red-500 font-medium whitespace-nowrap">
                                    {entry.OutTime.split(" ")[1] || "--"}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {entry.imageUrl && (
                                        <div className="flex flex-col gap-1">
                                            <img
                                                src={entry.imageUrl}
                                                alt="Captured"
                                                className="w-16 h-16 rounded object-cover border"
                                            />
                                            <a
                                                href={entry.imageUrl}
                                                download={`Punch-${entry.date}-${entry.time}.jpg`}
                                                className="text-blue-500 text-xs hover:underline"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap truncate max-w-[150px]" title={entry.location}>{entry.location}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <button
                                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                                        onClick={() => getLocationAndDispatch(entry?._id)}
                                    >
                                        Update Locaiton
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Navbar;
