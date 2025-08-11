import { useEffect, useState, useCallback, useMemo } from "react";
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

const DESKTOP_BREAKPOINT = 768;

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOnline = useCallback(() => setIsOnline(true), []);
  const handleOffline = useCallback(() => setIsOnline(false), []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Online/offline status listener
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Responsive sidebar behavior
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Memoized route configuration for better performance
  const protectedRoutes = useMemo(() => [
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: "/statusManagment",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: "/payslipAndPayRole",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: "/managerApproved",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: "/singleTematesProfile",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: "/singleTeamateProfile/:employeeId",
      element: (
        <ProtectedRoute>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Navbar onToggleSidebar={toggleSidebar} />
            <div style={{ 
              display: 'flex', 
              flex: '1 1 auto',
              width: '100%',
              maxWidth: 'none',
              position: 'relative'
            }}>
              <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>
        </ProtectedRoute>
      )
    }
  ], [toggleSidebar, isSidebarOpen]);

  // Show error page when offline
  if (!isOnline) {
    return <ErrorPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forget_password" element={<ForgetPassword />} />
          <Route path="/otp_verification" element={<OtpVerification />} />
          <Route path="/confirm_password" element={<ConfirmPassword />} />

          {/* Protected Routes */}
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;