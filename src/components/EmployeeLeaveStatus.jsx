import React, { useEffect, useState } from "react";
import { MoreHorizontal, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmployeeLeaveCountAction,
  getLeaveApproveRequestAction,
  getUserDataAction,
  putApprovedLeaveByManagerAction,
} from "../store/action/userDataAction";
import safeToast from "../utils/safeToast";

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
  // Check if item has a direct location field (for medical certificates)
  if (item?.location) {
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
  if (nestedDoc) {
    console.log('getDocumentData: Found nested document:', nestedDoc);
  }
  return nestedDoc;
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

  const { data:leaveCountData } = useSelector((state) => state.employeeLeaveCount);
  const employeeCount = leaveCountData?.data || [];
console.log('employeeCount',employeeCount)
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getUserDataAction());
    dispatch(getLeaveApproveRequestAction());
    dispatch(getEmployeeLeaveCountAction())
  }, [dispatch]);

  // Cleanup toasts on component unmount
  useEffect(() => {
    return () => {
      safeToast.dismiss();
    };
  }, []);

  const [approvalLoading, setApprovalLoading] = useState({});

  const handelChangeStatus = async ({ value, id, employeeName }) => {
    // Map the dropdown values to the correct backend status values
    const status = value === "Approved" ? "Approved" : "Rejected";
    
    // Set loading state for this specific item
    setApprovalLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const result = await dispatch(putApprovedLeaveByManagerAction({ status, id }));
      
      if (result?.success) {
        // Show success notification
        safeToast.success(
          `${employeeName}'s leave request ${status.toLowerCase()} successfully!`,
          { autoClose: 3000 }
        );
        
        // Refresh the data to show updated status
        dispatch(getLeaveApproveRequestAction());
        dispatch(getEmployeeLeaveCountAction());
      } else {
        // Show error notification
        safeToast.error(
          result?.error || `Failed to ${status.toLowerCase()} leave request. Please try again.`,
          { autoClose: 4000 }
        );
      }
    } catch (error) {
      // Show error notification
      safeToast.error(
        `Error: ${error?.message || 'Something went wrong'}`,
        { autoClose: 4000 }
      );
    } finally {
      // Clear loading state
      setApprovalLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredData = employeeStatusData.filter((item) =>
    item?.employeeInfo?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Log the first item to see the data structure
  useEffect(() => {
    if (employeeStatusData.length > 0) {
      console.log('EmployeeLeaveStatus: Sample data structure:', employeeStatusData[0]);
    }
  }, [employeeStatusData]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leaves</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryBox
          title="Today Presents"
          count={employeeCount?.todayPresentCount || 0}
          // percent="120%"
          ringColor="text-white"
          colorRing="blue-500"
        />
        <SummaryBox
          title="Planned Leaves"
          count={employeeCount?.plannedLeaveCount || 0}
          // percent="100%"
          ringColor="text-white"
          colorRing="red-500"
        />
        <SummaryBox
          title="Unplanned Leaves"
          count={employeeCount?.unplannedLeaveCount || 0}
          // percent="49%"
          ringColor="text-white"
          colorRing="sky-400"
        />
        <SummaryBox
          title="Pending Requests"
          count={employeeCount?.pendingReqCount || 0}
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
          <table className="w-full text-sm table-fixed">
            <thead className="text-left bg-gray-50">
              <tr className="text-gray-500">
                <th className="px-4 py-3 font-medium w-32">Name</th>
                <th className="px-4 py-3 font-medium w-24">Leave Type</th>
                <th className="px-4 py-3 font-medium w-28">Designation</th>
                <th className="px-4 py-3 font-medium w-20">Days</th>
                <th className="px-4 py-3 font-medium w-24">Start</th>
                <th className="px-4 py-3 font-medium w-24">End</th>
                <th className="px-4 py-3 font-medium w-24">Documents</th>
                <th className="px-4 py-3 font-medium w-20">Status</th>
                <th className="px-4 py-3 font-medium w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 flex items-center gap-3 whitespace-nowrap w-32">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-800 truncate max-w-[120px]" title={item?.employeeInfo?.employeeName || "Unknown Employee"}>
                      {item?.employeeInfo?.employeeName || "Unknown Employee"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap w-24">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getLeaveTypeAbbreviation(item?.leaveType) || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap truncate max-w-[100px] w-28" title={item?.employeeInfo?.designation || "No designation"}>
                    {item?.employeeInfo?.designation || "No designation"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap w-20">{item?.totalDays || 0} Days</td>
                  <td className="px-4 py-3 whitespace-nowrap w-24">{item?.leaveStartDate || "--"}</td>
                  <td className="px-4 py-3 whitespace-nowrap w-24">{item?.leaveEndDate || "--"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(() => {
                      const docData = getDocumentData(item);
                      if (docData) {
                        return (
                          <div className="flex items-center gap-2">
                            {React.createElement(getDocumentIcon(docData.originalname), {
                              className: "h-4 w-4 text-green-600 flex-shrink-0"
                            })}
                            <button
                              onClick={() => {
                                if (docData.location) {
                                  window.open(docData.location, '_blank');
                                }
                              }}
                              className="text-green-600 hover:text-green-800 text-xs underline font-medium truncate max-w-[60px]"
                              title={`${docData.originalname || 'Document'} - Click to view`}
                            >
                              View
                            </button>
                          </div>
                        );
                      } else if (item?.leaveType === 'medicalLeave' || item?.leaveType === 'sickLeave') {
                        return (
                          <span className="text-red-500 text-xs">No Doc</span>
                        );
                      } else {
                        return (
                          <span className="text-gray-400 text-xs">N/A</span>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap w-20">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[item?.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {item?.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap w-24">
                    {item?.status === "Approved" ? (
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    ) : (
                      <div className="flex items-center gap-2">
                        {approvalLoading[item?._id] && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue) {
                              handelChangeStatus({
                                value: selectedValue,
                                id: item?._id,
                                employeeName: item?.employeeInfo?.employeeName || 'Employee',
                              });
                              // Reset to default after selection
                              e.target.value = "";
                            }
                          }}
                          disabled={approvalLoading[item?._id]}
                          className={`border px-2 py-1 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                            approvalLoading[item?._id] 
                              ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <option value="" disabled>
                            {approvalLoading[item?._id] ? 'Processing...' : 'Select'}
                          </option>
                          <option value="Approved">Approve</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </div>
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
