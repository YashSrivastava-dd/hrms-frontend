import React, { useState, useEffect, useRef } from "react";
import {  useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { safeGet, safeGetLocalStorage, safeSetLocalStorage } from "../utils/safariHelpers";

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
import TaxDeclarationManager from "./TaxDeclarationManager";
import Finance from "./Finance/Finance";
import Footer from "./Footer";
import LogsPage from "./Logs/LogsPage";
import GenerateSalarySlip from "./GenerateSalarySlip";
import PunchRecords from "./PunchRecords";
import AdminPunchRecords from "./AdminPunchRecords";
import SalarySheetList from "./SalarySheet/SalarySheetList";

const Sidebar = ({ isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.userData);
  
  // Safely extract user data with fallbacks using Safari-compatible helpers
  const userData = safeGet(data, 'data', {});
  const userType = safeGet(userData, 'role', null) || data?.data?.role || data?.role || 'Loading...';
  
  // Debug logging
  console.log('Sidebar userType debug:', {
    data,
    userData,
    userType,
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : null,
    userDataKeys: userData ? Object.keys(userData) : null
  });
  const [reloadHandel, setReloadHandel] = useState(false);
  const [selectedTag, setSelectedTag] = useState(
    safeGetLocalStorage("selectedTag", "dashboard")
  );
  
  // Draggable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = safeGetLocalStorage("sidebarWidth", "288");
    return parseInt(saved) || 288; // 72 * 4 = 288px (w-72)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const resizeHandleRef = useRef(null);

  useEffect(() => {
    // Make sure data is fetched whenever the selectedTag changes
    safeSetLocalStorage("selectedTag", selectedTag);
  }, [selectedTag]);

  // Listen for navigation changes from other components
  useEffect(() => {
    const handleNavigationChange = (event) => {
      const { tag } = event.detail;
      console.log('Sidebar: Received navigation change event:', tag);
      setSelectedTag(tag);
      safeSetLocalStorage("selectedTag", tag);
    };

    window.addEventListener('navigationChange', handleNavigationChange);
    return () => {
      window.removeEventListener('navigationChange', handleNavigationChange);
    };
  }, []);

  useEffect(() => {
    // Save sidebar width to localStorage
    safeSetLocalStorage("sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newWidth = e.clientX;
    const minWidth = 240; // Minimum width (w-60)
    const maxWidth = 480; // Maximum width (w-120)
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleNavigation = (tag) => {
    // Allow dashboard navigation even without user data (it will load the data)
    // For other sections, we can still navigate but show loading states
    console.log('Navigating to:', tag, 'User type:', userType);
    
    setSelectedTag(tag);
    // Close sidebar on mobile when navigation occurs
    if (isMobile) {
      onToggleSidebar();
    }
    safeSetLocalStorage("selectedTag", tag);
    
    // Dispatch navigation event to notify SidebarContent
    try {
      const navigationEvent = new CustomEvent('navigationChange', {
        detail: { tag }
      });
      window.dispatchEvent(navigationEvent);
    } catch (error) {
      console.error('Error dispatching navigation event:', error);
    }
    
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
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed z-20 top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-xl border-r border-gray-200 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:fixed md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)] flex flex-col`}
        style={{ 
          width: isMobile ? '280px' : `${sidebarWidth}px`,
          maxWidth: isMobile ? '280px' : `${sidebarWidth}px`,
          flexShrink: 0,
          height: 'calc(100vh - 4rem)',
          position: 'fixed',
          minHeight: 'calc(100vh - 4rem)'
        }}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 md:hidden flex-shrink-0" style={{ minHeight: '80px' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">HR</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">HRMS Portal</h2>
              <p className="text-sm text-gray-600">{userType}</p>
            </div>
          </div>
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0" style={{ minHeight: '80px' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">HR</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">HRMS Portal</h2>
              <p className="text-sm text-gray-600">{userType}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-3 sm:p-4 overflow-y-auto flex-1 h-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
          {/* Main Navigation */}
          <div className="space-y-1">
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
          </div>

          {/* Attendance & Leave Section */}
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance & Leave</h3>
            </div>
            
            {userType != "HR-Admin" && userType != "Super-Admin" && (
              <SidebarLink
                label="Attendance"
                icon="📅"
                isSelected={selectedTag === "attendance"}
                onClick={() => handleNavigation("attendance")}
              />
            )}
            
            {userType != "HR-Admin" && userType != "Super-Admin" && (
              <SidebarLink
                label="Punch Records"
                icon="⏰"
                isSelected={selectedTag === "punchRecords"}
                onClick={() => handleNavigation("punchRecords")}
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
              icon="🎉"
              isSelected={selectedTag === "employeeHolidays"}
              onClick={() => handleNavigation("employeeHolidays")}
            />
          </div>

          {/* HR Management Section */}
          {userType === "HR-Admin" && (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">HR Management</h3>
              </div>
              
              <SidebarLink
                label="Announcement"
                icon="📢"
                isSelected={selectedTag === "anouncment"}
                onClick={() =>{
                  setReloadHandel(true);
                  handleNavigation("anouncment")
                }}
              />
              
              <SidebarLink
                label="Employee Leave Status"
                icon="📋"
                isSelected={selectedTag === "employeeLeaveStatus"}
                onClick={() =>{
                  setReloadHandel(true);
                  handleNavigation("employeeLeaveStatus")
                }}
              />
              
              <SidebarLink
                label="Generate Salary Slip"
                icon="💰"
                isSelected={selectedTag === "generateSalarySlip"}
                onClick={() =>{
                  setReloadHandel(true);
                  handleNavigation("generateSalarySlip")
                }}
              />
              
              <SidebarLink
                label="Punch Records"
                icon="⏰"
                isSelected={selectedTag === "adminPunchRecords"}
                onClick={() =>{
                  setReloadHandel(true);
                  handleNavigation("adminPunchRecords")
                }}
              />
            </div>
          )}

          {/* Documents & Forms Section */}
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents & Forms</h3>
            </div>
            
            <SidebarLink
              label="Payroll and Payslip"
              icon="💰"
              isSelected={selectedTag === "payslipAndPayRole"}
              onClick={() => handleNavigation("payslipAndPayRole")}
            />
            
            <SidebarLink
              label="Salary Sheets"
              icon="💵"
              isSelected={selectedTag === "salarySheets"}
              onClick={() => handleNavigation("salarySheets")}
            />
            
            <SidebarLink
              label="Declaration Form"
              icon="📋"
              isSelected={selectedTag === "declarationForm"}
              onClick={() => handleNavigation("declarationForm")}
            />
            
            <SidebarLink
              label="Tax Declarations"
              icon="📄"
              isSelected={selectedTag === "taxDeclarations"}
              onClick={() => handleNavigation("taxDeclarations")}
            />
            
                         <SidebarLink
               label="Issued Documents"
               icon="📑"
               isSelected={selectedTag === "issuedDoc"}
               onClick={() => handleNavigation("issuedDoc")}
             />
          </div>

          {/* Financial Tools Section */}
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Tools</h3>
            </div>
            
            <SidebarLink
              label="Finance Calculator"
              icon="🧮"
              isSelected={selectedTag === "finance"}
              onClick={() => handleNavigation("finance")}
            />
          </div>

          {/* Other Features Section */}
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Other Features</h3>
            </div>
            
            <SidebarLink
              label="Activity Logs"
              icon="📋"
              isSelected={selectedTag === "activityLogs"}
              disabled={true}
              onClick={() => handleNavigation("activityLogs")}
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
              icon="📚"
              isSelected={selectedTag === "hrmanual"}
              disabled
              onClick={() => handleNavigation("hrmanual")}
            />
            
            <SidebarLink
              label="Code Of Conduct"
              icon="⚖️"
              isSelected={selectedTag === "coc"}
              disabled={true}
              onClick={() => handleNavigation("coc")}
            />
          </div>
        </nav>
      </aside>

      {/* Resize Handle - Only visible on desktop */}
      <div
        ref={resizeHandleRef}
        className="hidden md:block fixed z-20 top-16 h-[calc(100vh-4rem)] w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200"
        style={{ left: `${sidebarWidth}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded-full hover:bg-blue-600 transition-colors duration-200"></div>
      </div>

      {/* Main Content */}
      <div 
        style={{
          flex: '1 1 auto',
          width: '100%',
          maxWidth: 'none',
          minWidth: '0',
          overflowY: 'auto',
          height: '100vh',
          paddingTop: '80px',
          marginLeft: isMobile ? '0' : `${sidebarWidth}px`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Page Content */}
        <div style={{ 
          flex: '1 1 auto', 
          padding: selectedTag === 'taxDeclarations' ? '0' : isMobile ? '0' : '1rem 1.5rem' 
        }}>
          {error && error !== "Authentication token not found" ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {selectedTag === "dashboard" && <Dashboard reloadHandel={reloadHandel} />}
              {selectedTag === "profile" && (
                !userType ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile...</h2>
                    </div>
                  </div>
                ) : <Profile />
              )}
              {selectedTag === "allEmployees" && <EmployeeTable selectedTag={selectedTag} reloadHandel={reloadHandel}/>}
              {selectedTag === "attendance" && <EmployeesAttendanceData />} 
              {selectedTag === "punchRecords" && <PunchRecords />}
              {selectedTag === "anouncment" && <Announcement reloadHandel={reloadHandel}/>}
              {selectedTag === "employeeLeaveStatus" && <EmployeeLeaveStatus reloadHandel={reloadHandel}/>}
              {selectedTag === "employeeHolidays" && <EmployeeHolidays />}
              {selectedTag === "viewByEmployee" && <TeammatesProfile selectedTag={selectedTag} />}
              {selectedTag === "payslipAndPayRole" && <EmployeePayroleTable />}
              {selectedTag === "declarationForm" && <DeclarationForm />}
              {selectedTag === "taxDeclarations" && <TaxDeclarationManager />}
              {selectedTag === "leaves" && <EmployessLeave />}
              {selectedTag === "managerApproval" && <ManagerApproval />}
              {selectedTag === "activityLogs" && <LogsPage userRole={userType} />}
              {selectedTag === "generateSalarySlip" && <GenerateSalarySlip />}
              {selectedTag === "adminPunchRecords" && (() => {
                console.log('Sidebar: Rendering AdminPunchRecords component');
                return <AdminPunchRecords />;
              })()}
              {selectedTag === "taskRecords" && <TotalTask />}
              {selectedTag === "hrmanual" && <ComingSoon />}
              {selectedTag === "coc" && <ComingSoon />}
              {selectedTag === "issuedDoc" && <MainDocuent />}
              {selectedTag === "finance" && <Finance />}
            </>
          )}
        </div>
        
        {/* Global Footer */}
        <Footer />
      </div>
    </div>
  );
};

const SidebarLink = ({ label, icon, isSelected, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full p-2 sm:p-3 rounded-xl transition-all duration-200 text-left group ${
      isSelected 
        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-md"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span className={`mr-2 sm:mr-3 text-base sm:text-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
      isSelected ? "text-white" : "text-gray-500 group-hover:text-blue-500"
    }`}>
      {icon}
    </span> 
    <span className={`font-medium transition-colors duration-200 text-sm sm:text-base truncate ${
      isSelected ? "text-white" : "text-gray-700 group-hover:text-gray-900"
    }`}>
      {label}
    </span>
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