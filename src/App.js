import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages and Components
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import StatusManagment from "./components/StatusManagment";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/Protected";
import Navbar from "./components/Navbar";
import ForgetPassword from "./pages/ForgetPassword";
import ConfirmPassword from "./pages/ComfirmPassword";
import OtpVerification from "./pages/Optverification";
import SingleTeamatesProfile from "./components/TeamatesProfile/SingleTeamatesProfile";
import ErrorPage from "./errorPage/ErrorPage";
import NotFound from "./pages/NotFound";
import EmployeePayroleTable from "./components/EmployeePayroleTabel";
import ManagerApproval from "./components/ManagerComponent/ManagerApproval";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Disable right-click and specific key combinations
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Online/offline status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show error page when offline
  if (!isOnline) {
    return <ErrorPage />;
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forget_password" element={<ForgetPassword />} />
        <Route path="/otp_verification" element={<OtpVerification />} />
        <Route path="/confirm_password" element={<ConfirmPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar onToggleSidebar={toggleSidebar}/>
              <Sidebar isSidebarOpen={isSidebarOpen}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/statusManagment"
          element={
            <ProtectedRoute>
              <StatusManagment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payslipAndPayRole"
          element={
            <ProtectedRoute>
              <EmployeePayroleTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/managerApproved"
          element={
            <ProtectedRoute>
              <ManagerApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/singleTematesProfile"
          element={
            <ProtectedRoute>
              <SingleTeamatesProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/singleTeamateProfile/:employeeId"
          element={
            <ProtectedRoute>
              <SingleTeamatesProfile />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;