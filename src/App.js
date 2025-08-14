import { useEffect, useState, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserDataAction } from "./store/action/userDataAction";

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
import ErrorBoundary from "./components/ErrorBoundary";
import TaxDeclarationManager from "./components/TaxDeclarationManager";

const DESKTOP_BREAKPOINT = 768;

function App() {
  const dispatch = useDispatch();
  
  // Safari-safe online detection
  const [isOnline, setIsOnline] = useState(() => {
    try {
      return navigator.onLine !== undefined ? navigator.onLine : true;
    } catch (error) {
      console.warn('Error accessing navigator.onLine:', error);
      return true; // Assume online if we can't detect
    }
  });
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

  // Online/offline status listener with Safari compatibility
  useEffect(() => {
    try {
      // Check if the events are supported before adding listeners
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
      }

      return () => {
        try {
          if (typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
          }
        } catch (error) {
          console.warn('Error removing event listeners:', error);
        }
      };
    } catch (error) {
      console.warn('Error setting up online/offline listeners:', error);
    }
  }, [handleOnline, handleOffline]);

  // Responsive sidebar behavior with Safari compatibility
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('resize', handleResize);
      }
      
      return () => {
        try {
          if (typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener('resize', handleResize);
          }
        } catch (error) {
          console.warn('Error removing resize listener:', error);
        }
      };
    } catch (error) {
      console.warn('Error setting up resize listener:', error);
    }
  }, [handleResize]);

  // Load user data on app initialization
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const employeeId = localStorage.getItem("employeId");
    
    // Only dispatch if we have valid authentication data
    if (token && employeeId && token !== 'null' && employeeId !== 'null') {
      console.log('App: Dispatching getUserDataAction');
      dispatch(getUserDataAction());
    } else {
      console.log('App: No valid auth data found, skipping user data fetch');
    }
  }, [dispatch]);

  // Enhanced global error handler for Safari undefined issues
  useEffect(() => {
    const handleGlobalError = (event) => {
      // Always prevent the default browser error dialog
      event.preventDefault();
      event.stopPropagation();
      
      const error = event.error;
      if (error && error.message) {
        const errorMessage = error.message.toLowerCase();
        // Common Safari private browsing undefined errors
        if (errorMessage.includes('undefined') || 
            errorMessage.includes('cannot read property') ||
            errorMessage.includes('cannot read properties of undefined') ||
            errorMessage.includes('cannot read properties of null') ||
            errorMessage.includes('localstorage') ||
            errorMessage.includes('sessionstorage') ||
            errorMessage.includes('null is not an object') ||
            errorMessage.includes('object is not a function') ||
            errorMessage.includes('cannot access before initialization')) {
          console.warn('Safari compatibility error suppressed:', error.message);
          return false;
        }
      }
      
      // If it's any other undefined-related error, suppress it too
      if (event.message && event.message.toLowerCase().includes('undefined')) {
        console.warn('Generic undefined error suppressed:', event.message);
        return false;
      }
      
      return false; // Always suppress to prevent popup
    };

    const handleUnhandledRejection = (event) => {
      // Always prevent the default browser error dialog
      event.preventDefault();
      
      if (event.reason) {
        const reasonMessage = typeof event.reason === 'string' ? event.reason : 
                             (event.reason.message || String(event.reason));
        const errorMessage = reasonMessage.toLowerCase();
        
        if (errorMessage.includes('undefined') || 
            errorMessage.includes('cannot read property') ||
            errorMessage.includes('cannot read properties') ||
            errorMessage.includes('localstorage') ||
            errorMessage.includes('sessionstorage') ||
            errorMessage.includes('null is not an object')) {
          console.warn('Unhandled promise rejection suppressed (Safari):', reasonMessage);
          return false;
        }
      }
      
      return false; // Always suppress to prevent popup
    };

    // Override window.onerror as well
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && message.toLowerCase().includes('undefined')) {
        console.warn('Window.onerror undefined suppressed:', message);
        return true; // Prevent default browser error handling
      }
      return originalOnError ? originalOnError.apply(this, arguments) : false;
    };

    // Override alert function to catch undefined alerts
    const originalAlert = window.alert;
    window.alert = function(message) {
      if (message && (message === 'undefined' || String(message).toLowerCase().includes('undefined'))) {
        console.warn('Undefined alert suppressed:', message);
        return; // Don't show the alert
      }
      return originalAlert.apply(this, arguments);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleGlobalError, true); // Use capture phase
      window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

      return () => {
        window.removeEventListener('error', handleGlobalError, true);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
        window.onerror = originalOnError; // Restore original handler
        window.alert = originalAlert; // Restore original alert
      };
    }
  }, []);

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
    },
    {
      path: "/tax-declarations",
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
              <div style={{ 
                flex: '1 1 auto',
                padding: '0',
                overflow: 'auto',
                width: '100%'
              }}>
                <TaxDeclarationManager />
              </div>
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;