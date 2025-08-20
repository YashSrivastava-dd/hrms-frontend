import React, { useEffect } from "react";
import { LiaDotCircleSolid } from "react-icons/lia";
import { useDispatch, useSelector } from "react-redux";
import { getEmployeLeaveStatusAction } from "../store/action/userDataAction";
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from 'react-toastify';

const StatusManagment = () => {
  const employeeId = localStorage.getItem("employeId");
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((state) => state.employeeLeaveStatus);
  const leaveData = data?.data || [];
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if (error !="Something went wrong") {
        toast.error(error, {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
        return;
      }
    }, 2000);

    if (error === "jwt expired") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("employeId");
      localStorage.removeItem("selectedTag");
      navigate("/");
      return;
    }
  }, [error])
  useEffect(() => {
    dispatch(getEmployeLeaveStatusAction(employeeId));
  }, [dispatch, employeeId]);

  const NoDataCard = () => (
    <div className="bg-white shadow-lg rounded-lg py-12 border border-gray-200 text-center" style={{ width: '100%' }}>
      <p className="text-sm text-gray-500 mt-2">
        No Pending Leave Data Available
      </p>
    </div>

  );

  // Filter pending leaves
  const pendingLeaves = leaveData.filter((item) => item?.status === "Pending");

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {pendingLeaves.length > 0 ? (
          pendingLeaves.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {item.status}
              </h3>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-blue-500 text-xl mr-2">
                      <LiaDotCircleSolid
                        color={
                          item?.status === "Pending"
                            ? "#F6BE00"
                            : item?.status === "Approved"
                              ? "green"
                              : "red"
                        }
                      />
                    </span>
                    {item.leaveType.toUpperCase().split("LEAVE")[0]} LEAVE
                  </span>
                  <span className="flex items-center">
                    {item.leaveStartDate}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  Contact: {item?.employeeInfo?.contactNo || "N/A"}
                </span>
                <div className="flex items-center mt-2">
                  <span className="text-gray-800 font-medium">
                    {item?.employeeName || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <NoDataCard />
        )}
      </div>
    </div>
  );
};

export default StatusManagment;
