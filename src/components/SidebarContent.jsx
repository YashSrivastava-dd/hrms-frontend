 import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Dashboard from "./Dashboard";
import Profile from "./Profile";
import EmployeeTable from "./EmployeeTabel";
import EmployeesAttendanceData from "./EmployeesAttendenceData";
import EmployessLeave from "./EmployessLeave";
import EmployeeHolidays from "./EmployeeHolidays";
import ManagerApproval from "./ManagerComponent/ManagerApproval";
import MainDocuent from "./Documents/MainDocuent";
import TeammatesProfile from "./TeamatesProfile/TeamatesProfile";
import TotalTask from "./TotalTask";
import Announcement from "./Announcement";
import EmployeePayroleTable from "./EmployeePayroleTabel";
import EmployeeLeaveStatus from "./EmployeeLeaveStatus";
import DeclarationForm from "./DeclarationForm";
import Finance from "./Finance/Finance";

const SidebarContent = ({ isSidebarOpen, onToggleSidebar }) => {
  const [reloadHandel, setReloadHandel] = useState(false);
  const [selectedTag, setSelectedTag] = useState(
    localStorage.getItem("selectedTag") || "dashboard"
  );
  const { data } = useSelector((state) => state.userData);
  const userType = data?.data?.role;

  console.log('SidebarContent Debug:', {
    selectedTag,
    userType,
    hasUserData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    userDataData: data?.data
  });

  useEffect(() => {
    // Make sure data is fetched whenever the selectedTag changes
    localStorage.setItem("selectedTag", selectedTag);
  }, [selectedTag]);

  useEffect(() => {
    // Listen for navigation changes from Sidebar
    const handleNavigationChange = (event) => {
      const { tag } = event.detail;
      setSelectedTag(tag);
      if (tag === 'allEmployees') {
        setReloadHandel(true);
      }
    };

    window.addEventListener('navigationChange', handleNavigationChange);
    return () => {
      window.removeEventListener('navigationChange', handleNavigationChange);
    };
  }, []);

  console.log('SidebarContent Render Debug:', {
    userType,
    shouldShowLoading: !userType,
    selectedTag
  });

  return (
    <div className="w-full h-full overflow-auto p-4 md:p-6 min-w-0">
      {/* Loading State */}
      {!userType && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we load your data</p>
          </div>
        </div>
      )}
      
      {/* Content - Only show when userType is loaded */}
      {userType && (
        <>
          {selectedTag === "dashboard" && <Dashboard reloadHandel={reloadHandel} />}
          {selectedTag === "profile" && <Profile />}
          {selectedTag === "allEmployees" && <EmployeeTable selectedTag={selectedTag} reloadHandel={reloadHandel}/>}
          {selectedTag === "attendance" && userType !== "HR-Admin" && <EmployeesAttendanceData />}
          {selectedTag === "attendance" && userType === "HR-Admin" && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance Feature</h2>
                <p className="text-gray-600">This feature is being reimplemented for HR Admin</p>
              </div>
            </div>
          )} 
          {selectedTag === "anouncment" && <Announcement reloadHandel={reloadHandel}/>}
          {selectedTag === "employeeLeaveStatus" && <EmployeeLeaveStatus reloadHandel={reloadHandel}/>}
          {selectedTag === "employeeHolidays" && <EmployeeHolidays />}
          {selectedTag === "viewByEmployee" && <TeammatesProfile selectedTag={selectedTag} />}
          {selectedTag === "payslipAndPayRole" && <EmployeePayroleTable />}
          {selectedTag === "declarationForm" && <DeclarationForm />}
          {selectedTag === "leaves" && <EmployessLeave />}
          {selectedTag === "managerApproval" && <ManagerApproval />}
          {selectedTag === "taskRecords" && <TotalTask />}
          {selectedTag === "hrmanual" && <ComingSoon />}
          {selectedTag === "coc" && <ComingSoon />}
          {selectedTag === "issuedDoc" && <MainDocuent />}
          {selectedTag === "finance" && <Finance />}
        </>
      )}
    </div>
  );
};

const ComingSoon = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
      <p className="text-gray-600">This feature is under development</p>
    </div>
  </div>
);

export default SidebarContent;
