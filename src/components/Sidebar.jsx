import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
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

const Sidebar = ({ isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.userData);
  const userType = data?.data?.role;
  const [reloadHandel, setReloadHandel] = useState(false);
  const [selectedTag, setSelectedTag] = useState(
    localStorage.getItem("selectedTag") || "dashboard"
  );

  useEffect(() => {
    // Make sure data is fetched whenever the selectedTag changes
    localStorage.setItem("selectedTag", selectedTag);
  }, [selectedTag]);

  const handleNavigation = (tag) => {
    setSelectedTag(tag);
    // Close sidebar on mobile when navigation occurs
    if (window.innerWidth < 768) {
      onToggleSidebar();
    }
    localStorage.setItem("selectedTag", tag);
    if (tag === 'viewByEmployee') {
      // Don't reload, just navigate to avoid page refresh
      return;
    }
    else if(tag === 'managerApproval'){
      // Don't reload, just navigate to avoid undefined popup
      return;
    }
    else if (tag === 'allEmployees') {
      setReloadHandel(true);
      // window.location.reload();  // ✅ Forces full page reload
      return;
    }
  };



  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-20 top-0 left-0 h-full bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 lg:w-72`}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1 p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <SidebarLink
            label="Dashboard"
            icon="📊"
            isSelected={selectedTag === "dashboard"}
            onClick={() => {
              setReloadHandel(true);
              handleNavigation("dashboard")
            }}
          />
          {userType !== "HR-Admin" ? (
            <SidebarLink
              label="Profile"
              icon="👤"
              isSelected={selectedTag === "profile"}
              onClick={() =>{
                setReloadHandel(true);
                handleNavigation("profile")
              }}
            />
          ) : null}
          
          {(userType === "Manager" || userType === "Super-Admin" || userType === "HR-Admin") && (
            <SidebarLink
              label="Teammate's Profile"
              icon="👥"
              isSelected={selectedTag === "viewByEmployee"}
              onClick={() => handleNavigation("viewByEmployee")}
            />
          )}
          
          {userType != "HR-Admin" && userType != "Super-Admin" && (
            <SidebarLink
              label="Attendance"
              icon="📅"
              isSelected={selectedTag === "attendance"}
              onClick={() => handleNavigation("attendance")}
            />
          )}
          
          {userType !== "HR-Admin" && userType != "Super-Admin" && (
            <SidebarLink
              label="Leave Status"
              icon="📩"
              isSelected={selectedTag === "leaves"}
              onClick={() => handleNavigation("leaves")}
            />
          )}
          
          {(userType === "Manager" || userType === "Super-Admin") && (
            <SidebarLink
              label="Team Approvals"
              icon="📋"
              isSelected={selectedTag === "managerApproval"}
              onClick={() => handleNavigation("managerApproval")}
            />
          )}
          
          <SidebarLink
            label="Holidays"
            icon="⌛️"
            isSelected={selectedTag === "employeeHolidays"}
            onClick={() => handleNavigation("employeeHolidays")}
          />
          
          {userType === "HR-Admin" && (
            <SidebarLink
              label="Announcement"
              icon="📢"
              isSelected={selectedTag === "anouncment"}
              onClick={() =>{
                setReloadHandel(true);
                handleNavigation("anouncment")
              }}
            />
          )}
          
          {userType === "HR-Admin" && (
            <SidebarLink
              label="Employee Leave Status"
              icon="📋"
              isSelected={selectedTag === "employeeLeaveStatus"}
              onClick={() =>{
                setReloadHandel(true);
                handleNavigation("employeeLeaveStatus")
              }}
            />
          )}
          
          <SidebarLink
            label="Payroll and Payslip"
            icon="🧾"
            isSelected={selectedTag === "payslipAndPayRole"}
            onClick={() => handleNavigation("payslipAndPayRole")}
          />
          
          <SidebarLink
            label="Task Records"
            icon="📝"
            isSelected={selectedTag === "taskRecords"}
            disabled={true}
            onClick={() => handleNavigation("taskRecords")}
          />
          
          <SidebarLink
            label="HR Manual"
            icon="⚙️"
            isSelected={selectedTag === "hrmanual"}
            disabled
            onClick={() => handleNavigation("hrmanual")}
          />
          
          <SidebarLink
            label="Code Of Conduct"
            icon="🗂️"
            isSelected={selectedTag === "coc"}
            disabled={true}
            onClick={() => handleNavigation("coc")}
          />
          
          <SidebarLink
            label="Issued Documents"
            icon="📑"
            isSelected={selectedTag === "issuedDoc"}
            onClick={() => handleNavigation("issuedDoc")}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 w-full">
        {selectedTag === "dashboard" && <Dashboard reloadHandel={reloadHandel} />}
        {selectedTag === "profile" && <Profile />}
        {selectedTag === "allEmployees" && <EmployeeTable selectedTag={selectedTag} reloadHandel={reloadHandel}/>}
        {selectedTag === "attendance" && <EmployeesAttendanceData />} 
        {selectedTag === "anouncment" && <Announcement reloadHandel={reloadHandel}/>}
        {selectedTag === "employeeLeaveStatus" && <EmployeeLeaveStatus reloadHandel={reloadHandel}/>}
        {selectedTag === "employeeHolidays" && <EmployeeHolidays />}
        {selectedTag === "viewByEmployee" && <TeammatesProfile selectedTag={selectedTag} />}
        {selectedTag === "payslipAndPayRole" && <EmployeePayroleTable />}
        {selectedTag === "leaves" && <EmployessLeave />}
        {selectedTag === "managerApproval" && <ManagerApproval />}
        {selectedTag === "taskRecords" && <TotalTask />}
        {selectedTag === "hrmanual" && <ComingSoon />}
        {selectedTag === "coc" && <ComingSoon />}
        {selectedTag === "issuedDoc" && <MainDocuent />}
      </div>
    </div>
  );
};

const SidebarLink = ({ label, icon, isSelected, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 text-left ${
      isSelected 
        ? "bg-blue-100 text-blue-700 shadow-sm" 
        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span className="mr-3 text-lg">{icon}</span> 
    <span className="font-medium">{label}</span>
  </button>
);

const ComingSoon = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
      <p className="text-gray-600">This feature is under development</p>
    </div>
  </div>
);

export default Sidebar;