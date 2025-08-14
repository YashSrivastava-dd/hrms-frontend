import axios from "axios";
import {
  LOGIN_USER_FAIL,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
} from "../types/UserDataType";
import { safeSetLocalStorage, safeDelay, isPrivateBrowsing } from "../../utils/safariHelpers";

export const loginUserDataAction =
  ({ email, password, rememberMe }) =>
  async (dispatch) => {
    try {
      // Dispatch login request action
      dispatch({ type: LOGIN_USER_REQUEST });

      // Make API call to login
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/employee/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Store token in localStorage with Safari-safe methods
      if (data?.token) {
        const privateBrowsing = isPrivateBrowsing();
        console.log("Login successful, private browsing:", privateBrowsing);
        
        safeSetLocalStorage("authToken", data.token);
        safeSetLocalStorage("employeId", data?.data.employeeId);

        console.log("Login data stored:", data);
      } else {
        throw new Error("Token is missing from response");
      }
      
      if (rememberMe === true) {
        safeSetLocalStorage("savedEmail", email);
        safeSetLocalStorage("savedPassword", password);
        safeSetLocalStorage("rememberMe", "true");
      }
      else if(rememberMe === false){
        try {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
          localStorage.removeItem("rememberMe");
        } catch (error) {
          console.warn("Error removing saved credentials:", error);
        }
      }
      
      // Dispatch login success action with user data
      dispatch({ type: LOGIN_USER_SUCCESS, payload: data });
      
      if (data?.statusCode === 200) {
        // Add delay for Safari private browsing stability
        const delay = isPrivateBrowsing() ? 2000 : 1500;
        console.log("Scheduling page reload with delay:", delay);
        
        await safeDelay(delay);
        
        try {
          if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
          }
        } catch (error) {
          console.warn("Error reloading page:", error);
          // Fallback navigation
          window.location.href = window.location.href;
        }
      }
    } catch (error) {
      // Dispatch login failure action with error message
      dispatch({
        type: LOGIN_USER_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };
