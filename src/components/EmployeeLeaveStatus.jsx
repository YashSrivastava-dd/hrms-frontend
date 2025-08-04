import React, { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmployeeLeaveCountAction,
  getLeaveApproveRequestAction,
  getUserDataAction,
  putApprovedLeaveByManagerAction,
} from "../store/action/userDataAction";

const statusColors = {
  Approved: "bg-blue-100 text-blue-600",
  Pending: "bg-yellow-100 text-yellow-600",
  Rejected: "bg-orange-100 text-orange-600",
  New: "bg-green-100 text-green-600",
};

// Function to get leave type abbreviation
const getLeaveTypeAbbreviation = (leaveType) => {
  const abbreviations = {
    casualLeave: "CL",
    earnedLeave: "EL", 
    optionalLeave: "OL",
    shortLeave: "SL",
    uninformedLeave: "UL",
    vendorMeeting: "VM",
    compOff: "CO",
    sickLeave: "SL",
    maternityLeave: "ML",
    paternityLeave: "PL",
    bereavementLeave: "BL",
    studyLeave: "STL",
    sabbaticalLeave: "SAB"
  };
  
  return abbreviations[leaveType] || leaveType;
};
// api/common/get-emp-leaves-count
const EmployeeLeaveStatus = () => {
  const { data } = useSelector((state) => state.managerLeaveApprove);
  const employeeStatusData = data?.data || [];
  const dispatch = useDispatch();

  const { data:leaveCountData } = useSelector((state) => state.employeeLeaveCount);
  const employeeCount = leaveCountData?.data || [];
console.log('employeeCount',employeeCount)
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getUserDataAction());
    dispatch(getLeaveApproveRequestAction());
    dispatch(getEmployeeLeaveCountAction())
  }, [dispatch]);

  const handelChangeStatus = ({ value, id }) => {
    const status = value === "Approved" ? "Approved" : "Reject";
    dispatch(putApprovedLeaveByManagerAction({ status, id }));
  };

  const filteredData = employeeStatusData.filter((item) =>
    item.employeeInfo.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leaves</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryBox
          title="Today Presents"
          count={employeeCount?.todayPresentCount}
          // percent="120%"
          ringColor="text-white"
          colorRing="blue-500"
        />
        <SummaryBox
          title="Planned Leaves"
          count={employeeCount?.plannedLeaveCount}
          // percent="100%"
          ringColor="text-white"
          colorRing="red-500"
        />
        <SummaryBox
          title="Unplanned Leaves"
          count={employeeCount?.unplannedLeaveCount}
          // percent="49%"
          ringColor="text-white"
          colorRing="sky-400"
        />
        <SummaryBox
          title="Pending Requests"
          count={employeeCount?.pendingReqCount}
          // percent="68%"
          ringColor="text-white"
          colorRing="orange-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Employee’s Leave</h3>
          <input
            type="text"
            placeholder="Search by name"
            className="border rounded px-3 py-1.5 text-sm w-52"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-gray-50">
              <tr className="text-gray-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Leave Type</th>
                <th className="px-4 py-2">Designation</th>
                <th className="px-4 py-2">Days</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">End</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 flex items-center gap-3 whitespace-nowrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-800 truncate max-w-[150px]" title={item.employeeInfo.employeeName}>
                      {item.employeeInfo.employeeName}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getLeaveTypeAbbreviation(item.leaveType)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap truncate max-w-[120px]" title={item.employeeInfo.designation}>
                    {item.employeeInfo.designation}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.totalDays} Days</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.leaveStartDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.leaveEndDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.status === "Approved" ? (
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    ) : (
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          handelChangeStatus({
                            value: e.target.value,
                            id: item._id,
                          })
                        }
                        className="border px-2 py-1 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryBox = ({ title, count, percent, ringColor, colorRing }) => (
  <div className={`border rounded-xl flex items-center p-4 gap-4 shadow-sm bg-white`}>
    <div className="flex flex-col items-start">
      <div className="text-xl font-bold text-gray-900">{count}</div>
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
