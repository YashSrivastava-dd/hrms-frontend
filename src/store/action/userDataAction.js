import axios from "axios";
import {
  ALL_EMPLOYEE_DATA_FAIL,
  ALL_EMPLOYEE_DATA_REQUEST,
  ALL_EMPLOYEE_DATA_SUCCESS,
  DELETE_LEAVE_REQUEST_FAIL,
  DELETE_LEAVE_REQUEST_REQUEST,
  DELETE_LEAVE_REQUEST_SUCCESS,
  GET_ATTENDANCE_LOGS_OF_EMPLOYEES_FAIL,
  GET_ATTENDANCE_LOGS_OF_EMPLOYEES_REQUEST,
  GET_ATTENDANCE_LOGS_OF_EMPLOYEES_SUCCESS,
  GET_COMPOFF_DATA_FAIL,
  GET_COMPOFF_DATA_REQUEST,
  GET_COMPOFF_DATA_SUCCESS,
  GET_COMPOFF_LEAVE_APPROVAL_FAIL,
  GET_COMPOFF_LEAVE_APPROVAL_REQUEST,
  GET_COMPOFF_LEAVE_APPROVAL_SUCCESS,
  GET_EMPLOYEE_LEAVE_STATUS_FAIL,
  GET_EMPLOYEE_LEAVE_STATUS_REQUEST,
  GET_EMPLOYEE_LEAVE_STATUS_SUCCESS,
  GET_HOLIDAYS_DATA_FAIL,
  GET_HOLIDAYS_DATA_REQUEST,
  GET_HOLIDAYS_DATA_SUCCESS,
  GET_LEAVE_REQUEST_FAIL,
  GET_LEAVE_REQUEST_REQUEST,
  GET_LEAVE_REQUEST_SUCCESS,
  GET_PUBLIC_DOCUMENTS_FAIL,
  GET_PUBLIC_DOCUMENTS_REQUEST,
  GET_PUBLIC_DOCUMENTS_SUCCESS,
  GET_TEAMMATE_DATA_FAIL,
  GET_TEAMMATE_DATA_REQUEST,
  GET_TEAMMATE_DATA_SUCCESS,
  POST_APPLY_COMPOFF_LEAVE_FAIL,
  POST_APPLY_COMPOFF_LEAVE_REQUEST,
  POST_APPLY_COMPOFF_LEAVE_SUCCESS,
  POST_APPLY_REGULARIZE_FAIL,
  POST_APPLY_REGULARIZE_REQUEST,
  POST_APPLY_REGULARIZE_SUCCESS,
  GET_EMPLOYEE_PRIVATE_DOC_REQUEST,
  POST_EMPLOYEE_PRIVATE_DOC_SUCCESS,
  POST_LEAVE_APPLY_BY_EMPLOYEE_FAIL,
  POST_LEAVE_APPLY_BY_EMPLOYEE_REQUEST,
  POST_LEAVE_APPLY_BY_EMPLOYEE_SUCCESS,
  POST_LEAVE_REQUEST_FAIL,
  POST_LEAVE_REQUEST_REQUEST,
  POST_LEAVE_REQUEST_SUCCESS,
  POST_MEDICAL_FILE_FAIL,
  POST_MEDICAL_FILE_REQUEST,
  POST_MEDICAL_FILE_SUCCESS,
  PUT_COMPOFF_LEAVE_STATUS_FAIL,
  PUT_COMPOFF_LEAVE_STATUS_REQUEST,
  PUT_COMPOFF_LEAVE_STATUS_SUCCESS,
  PUT_LEAVE_APPROVAL_BY_MANAGER_FAIL,
  PUT_LEAVE_APPROVAL_BY_MANAGER_REQUEST,
  PUT_LEAVE_APPROVAL_BY_MANAGER_SUCCESS,
  SINGLE_USER_DATA_FAIL,
  SINGLE_USER_DATA_REDUCER,
  SINGLE_USER_DATA_SUCCESS,
  GET_EMPLOYEE_PRIVATE_DOC_SUCCESS,
  GET_EMPLOYEE_PRIVATE_DOC_FAIL,
  PROFILE_IMAGE_UPDATE_SUCCESS,
  PROFILE_IMAGE_UPDATE_REQUEST,
  PROFILE_IMAGE_UPDATE_FAIL,
  POST_SEND_OTP_WITH_EMAIL_FAIL,
  POST_SEND_OTP_WITH_EMAIL_SUCCESS,
  POST_SEND_OTP_WITH_EMAIL_REQUEST,
  POST_OTP_VERIFICATION_REQUEST,
  POST_OTP_VERIFICATION_SUCCESS,
  POST_OTP_VERIFICATION_FAIL,
  POST_CONFIRM_PASSWORD_REQUEST,
  POST_CONFIRM_PASSWORD_SUCCESS,
  POST_CONFIRM_PASSWORD_FAIL,
  POST_PROFILE_IMAGE_UPLOAD_FAIL,
  POST_PROFILE_IMAGE_UPLOAD_SUCCESS,
  POST_PROFILE_IMAGE_UPLOAD_REQUEST,
  GET_CALENDER_LOGS_API_FAIL,
  GET_CALENDER_LOGS_API_SUCCESS,
  GET_CALENDER_LOGS_API_REQUEST,
  GET_ALL_EMPLOYEE_ATTENDANCE_REQUEST,
  GET_ALL_EMPLOYEE_ATTENDANCE_SUCCESS,
  GET_ALL_EMPLOYEE_ATTENDANCE_FAIL,
  GET_ON_LEAVE_STATUS_REQUEST,
  GET_ON_LEAVE_STATUS_SUCCESS,
  GET_ON_LEAVE_STATUS_FAIL,
  GET_TOTAL_PROJECT_LIST_FAIL,
  GET_TOTAL_PROJECT_LIST_REQUEST,
  GET_TOTAL_PROJECT_LIST_SUCCESS,
  GET_TASK_BY_PROJECT_ID_FAIL,
  GET_TASK_BY_PROJECT_ID_SUCCESS,
  GET_TASK_BY_PROJECT_ID_REQUEST,
  PUT_CHANGE_TASK_STATUS_FAIL,
  PUT_CHANGE_TASK_STATUS_SUCCESS,
  PUT_CHANGE_TASK_STATUS_REQUEST,
  GET_SINGLE_TASK_DETAILS_FAIL,
  GET_SINGLE_TASK_DETAILS_SUCCESS,
  GET_SINGLE_TASK_DETAILS_REQUEST,
  PUT_APPROVED_REGULARIZATION_REQUEST,
  PUT_APPROVED_REGULARIZATION_SUCCESS,
  PUT_APPROVED_REGULARIZATION_FAIL,
  DELETE_LEAVE_COMPOFF_FAIL,
  DELETE_LEAVE_COMPOFF_SUCCESS,
  DELETE_LEAVE_COMPOFF_REQUEST,
  POST_REVERT_LEAVE_REQUEST,
  POST_REVERT_LEAVE_SUCCESS,
  POST_REVERT_LEAVE_FAIL,
  PUT_REVERT_LEAVE_BY_MANAGER_FAIL,
  PUT_REVERT_LEAVE_BY_MANAGER_SUCCESS,
  PUT_REVERT_LEAVE_BY_MANAGER_REQUEST,
  POST_HOLIDAYS_DATA_REQUEST,
  POST_HOLIDAYS_DATA_SUCCESS,
  POST_HOLIDAYS_DATA_FAIL,
  GET_ANNOUNCEMENT_DATA_FAIL,
  GET_ANNOUNCEMENT_DATA_SUCCESS,
  GET_ANNOUNCEMENT_DATA_REQUEST,
  POST_ANNOUNCEMENT_DATA_FAIL,
  POST_ANNOUNCEMENT_DATA_SUCCESS,
  POST_ANNOUNCEMENT_DATA_REQUEST,
  DELETE_ANNOUNCEMENT_DATA_FAIL,
  DELETE_ANNOUNCEMENT_DATA_SUCCESS,
  DELETE_ANNOUNCEMENT_DATA_REQUEST,
  PUT_ANNOUNCEMENT_DATA_FAIL,
  PUT_ANNOUNCEMENT_DATA_SUCCESS,
  PUT_ANNOUNCEMENT_DATA_REQUEST,
  POST_UPLOAD_PUBLIC_DOCUMENTS_FAIL,
  POST_UPLOAD_PUBLIC_DOCUMENTS_SUCCESS,
  POST_UPLOAD_PUBLIC_DOCUMENTS_REQUEST,
  GET_PAYROLL_AND_PAYSLIP_FAIL,
  GET_PAYROLL_AND_PAYSLIP_SUCCESS,
  GET_PAYROLL_AND_PAYSLIP_REQUEST,
  POST_VENDOR_MEETING_SUCCESS,
  POST_VENDOR_MEETING_FAIL,
  POST_VENDOR_MEETING_REQUEST,
  GET_VENDOR_LOGS_REQUEST,
  GET_VENDOR_LOGS_SUCCESS,
  GET_VENDOR_LOGS_FAIL,
  GET_VENDOR_SINGLE_LOGS_FAIL,
  GET_VENDOR_SINGLE_LOGS_SUCCESS,
  GET_VENDOR_SINGLE_LOGS_REQUEST,
  PUT_VENDOR_STATUS_FAIL,
  PUT_VENDOR_STATUS_SUCCESS,
  PUT_VENDOR_STATUS_REQUEST,
  POST_ADD_EMPLOYEE_FAIL,
  POST_ADD_EMPLOYEE_SUCCESS,
  POST_ADD_EMPLOYEE_REQUEST,
  GET_EMPLOYEE_DATA_COUNT_FAIL,
  GET_EMPLOYEE_DATA_COUNT_SUCCESS,
  GET_EMPLOYEE_DATA_COUNT_REQUEST,
  GET_GRAPH_DATA_EMPLOYEE_FAIL,
  GET_GRAPH_DATA_EMPLOYEE_SUCCESS,
  GET_GRAPH_DATA_EMPLOYEE_REQUEST,
  GET_EMPLOYEE_LEAVE_COUNT_SUCCESS,
  GET_EMPLOYEE_LEAVE_COUNT_FAIL,
  GET_EMPLOYEE_LEAVE_COUNT_REQUEST,
} from "../types/UserDataType";
export const getUserDataAction = () => async (dispatch, getState) => {
  const { userData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: SINGLE_USER_DATA_FAIL,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (userData.data) return;

  try {
    dispatch({ type: SINGLE_USER_DATA_REDUCER });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/employee/get-employee-details/${employeId}`,
      config
    );

    dispatch({ type: SINGLE_USER_DATA_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: SINGLE_USER_DATA_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getAllUserDataAction =
  ({ page, limit }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)

    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: ALL_EMPLOYEE_DATA_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: ALL_EMPLOYEE_DATA_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Pass key as a query parameter
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/employee/get-all?page=${page}&limit=${limit}`,
        config
      );

      dispatch({ type: ALL_EMPLOYEE_DATA_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: ALL_EMPLOYEE_DATA_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postApplyLeaveByEmployee =
  ({
    leaveType,
    leaveStartDate,
    leaveEndDate,
    totalDays,
    reason,
    approvedBy,
    employeId,
    shift,
    location,
  }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_LEAVE_APPLY_BY_EMPLOYEE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_LEAVE_APPLY_BY_EMPLOYEE_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/leave/apply-leave/${employeId}`,
        {
          leaveType,
          leaveStartDate,
          leaveEndDate,
          totalDays,
          reason,
          approvedBy,
          shift,
          location,
        },
        config
      );

      dispatch({ type: POST_LEAVE_APPLY_BY_EMPLOYEE_SUCCESS, payload: data });
      if (data?.statusCode == 200) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      dispatch({
        type: POST_LEAVE_APPLY_BY_EMPLOYEE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

//
export const getAttendenceLogsOfEmploye =
  (employeeId, dateFrom, dateToo, page) => async (dispatch, getState) => {
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_ATTENDANCE_LOGS_OF_EMPLOYEES_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // If employeeId is not provided, don't make the API call
    if (!employeeId) {
      return dispatch({
        type: GET_ATTENDANCE_LOGS_OF_EMPLOYEES_FAIL,
        payload: "Employee ID is required",
      });
    }

    try {
      dispatch({ type: GET_ATTENDANCE_LOGS_OF_EMPLOYEES_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      
      let newdateFrom = dateFrom ? dateFrom : "";
      let newdateTo = dateToo ? dateToo : "";
      let newPage = page ? page : "";
      
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/attendance-logs/${employeeId}?page=${newPage}&dateFrom=${newdateFrom}&dateTo=${newdateTo}`,
        config
      );

      dispatch({
        type: GET_ATTENDANCE_LOGS_OF_EMPLOYEES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
      dispatch({
        type: GET_ATTENDANCE_LOGS_OF_EMPLOYEES_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

// employee leave status action
export const getEmployeLeaveStatusAction =
  (employeeId) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_EMPLOYEE_LEAVE_STATUS_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: GET_EMPLOYEE_LEAVE_STATUS_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/leave/get-employee-leave/${employeeId}`,
        config
      );

      dispatch({ type: GET_EMPLOYEE_LEAVE_STATUS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_EMPLOYEE_LEAVE_STATUS_FAIL,
        payload: error.response?.data?.error || "Something went wrong",
      });
    }
  };

//
export const getHolidaysDataAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  // const employeId=localStorage.getItem('employeId')
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_HOLIDAYS_DATA_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_HOLIDAYS_DATA_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/common/get-holiday-list`,
      config
    );

    dispatch({ type: GET_HOLIDAYS_DATA_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_HOLIDAYS_DATA_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const postHolidaysDataAction =
  (holidayName, holidayDate) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    if (!token) {
      return dispatch({
        type: POST_HOLIDAYS_DATA_REQUEST,
        payload: "Authentication token not found",
      });
    }

    if (allUserData.data) return;

    try {
      dispatch({ type: POST_HOLIDAYS_DATA_REQUEST });
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/common/add-holiday`,
        { holidayName, holidayDate },
        config
      );
      dispatch({ type: POST_HOLIDAYS_DATA_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: POST_HOLIDAYS_DATA_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getLeaveApproveRequestAction =
  ({ page = 1, limit = 10 } = {}) => async (dispatch, getState) => {
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_LEAVE_REQUEST_REQUEST,
        payload: "Authentication token not found",
      });
    }

    try {
      dispatch({ type: GET_LEAVE_REQUEST_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit
        }
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/leave/get-all-pending-leaves`,
        config
      );

      dispatch({ type: GET_LEAVE_REQUEST_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_LEAVE_REQUEST_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postLeaveApproveRequestAction =
  ({ status, id }) =>
  async (dispatch, getState) => {
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_LEAVE_REQUEST_REQUEST,
        payload: "Authentication token not found",
      });
    }

    try {
      dispatch({ type: POST_LEAVE_REQUEST_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-regularization/${id}`,
        { status },
        config
      );

      dispatch({ type: POST_LEAVE_REQUEST_SUCCESS, payload: data });

      if (data?.statusCode === 200) {
        if (status == "Approved") {
          alert("Approved Successfuly");
        } else if (status == "Reject") {
          alert("Reject Successfuly");
        }
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      dispatch({
        type: POST_LEAVE_REQUEST_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const putApprovedLeaveByManagerAction =
  ({ status, id, remarks }) =>
  async (dispatch, getState) => {
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    
    // If token does not exist, do nothing or handle the case
    if (!token) {
      const errorAction = {
        type: PUT_LEAVE_APPROVAL_BY_MANAGER_REQUEST,
        payload: "Authentication token not found",
      };
      dispatch(errorAction);
      return { error: "Authentication token not found" };
    }

    try {
      dispatch({ type: PUT_LEAVE_APPROVAL_BY_MANAGER_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-leave-application/${id}`,
        { status, remarks },
        config
      );

      dispatch({ type: PUT_LEAVE_APPROVAL_BY_MANAGER_SUCCESS, payload: data });

      if (data?.statusCode === 200) {
        // Return the data for the component to handle
        return { success: true, data };
      } else {
        // Handle unexpected response
        return { success: false, error: data?.message || "Unexpected response from server" };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong";
      dispatch({
        type: PUT_LEAVE_APPROVAL_BY_MANAGER_FAIL,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

// New action specifically for navbar notifications that doesn't reload the page
export const putApprovedLeaveByManagerNavbarAction =
  ({ status, id, remarks }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      return dispatch({
        type: PUT_LEAVE_APPROVAL_BY_MANAGER_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: PUT_LEAVE_APPROVAL_BY_MANAGER_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-leave-application/${id}`,
        { status, remarks },
        config
      );

      const successAction = dispatch({ type: PUT_LEAVE_APPROVAL_BY_MANAGER_SUCCESS, payload: data });

      // Return the result for the component to handle
      return successAction;
    } catch (error) {
      const errorAction = dispatch({
        type: PUT_LEAVE_APPROVAL_BY_MANAGER_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
      
      // Re-throw the error so the component can catch it
      throw error;
    }
  };

export const putApprovedRegularizationAction =
  ({ status, id, remarks }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: PUT_APPROVED_REGULARIZATION_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: PUT_APPROVED_REGULARIZATION_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-regularization/${id}`,
        { status, remarks },
        config
      );

      dispatch({ type: PUT_APPROVED_REGULARIZATION_SUCCESS, payload: data });

      if (data?.statusCode === 200) {
        // if (status == "Approved") {
        //   alert("Approved Successfuly");
        // } else if (status == "Rejected") {
        //   alert("Reject Successfuly");
        // }
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      dispatch({
        type: PUT_APPROVED_REGULARIZATION_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postApplyRegularizationAction =
  (leaveType, leaveStartDate, reason) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_APPLY_REGULARIZE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_APPLY_REGULARIZE_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/leave/apply-for-regularization/${employeId}`,
        { leaveType, leaveStartDate, reason },
        config
      );

      dispatch({ type: POST_APPLY_REGULARIZE_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: POST_APPLY_REGULARIZE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postApplyCompOffLeaveAction =
  (compOffDate, reason) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_APPLY_COMPOFF_LEAVE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_APPLY_COMPOFF_LEAVE_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/leave/generate-compoff/${employeId}`,
        { compOffDate, reason },
        config
      );
      dispatch({ type: POST_APPLY_COMPOFF_LEAVE_SUCCESS, payload: data });
      // Removed alert and window.location.reload - let the component handle success
    } catch (error) {
      // Removed alert - let the component handle error display
      dispatch({
        type: POST_APPLY_COMPOFF_LEAVE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getCompoffLeaveRequestAction =
  ({ page = 1, limit = 10 } = {}) => async (dispatch, getState) => {
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_COMPOFF_LEAVE_APPROVAL_REQUEST,
        payload: "Authentication token not found",
      });
    }

    try {
      dispatch({ type: GET_COMPOFF_LEAVE_APPROVAL_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit
        }
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/leave/get-all-pending-compoff`,
        config
      );

      dispatch({ type: GET_COMPOFF_LEAVE_APPROVAL_SUCCESS, payload: data });

      if (data?.statusCode === 201) {
        alert(data?.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (error.response?.data?.statusCode === 404) {
        return;
      } else {
        alert(error.response?.data?.message);
      }
      dispatch({
        type: GET_COMPOFF_LEAVE_APPROVAL_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const putCompOffLeaveRequestAction =
  ({ status, id }) =>
  async (dispatch, getState) => {
    console.log('=== putCompOffLeaveRequestAction START ===');
    console.log('putCompOffLeaveRequestAction called with:', { status, id });
    
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      console.log('No token found');
      const errorAction = {
        type: PUT_COMPOFF_LEAVE_STATUS_REQUEST,
        payload: "Authentication token not found",
      };
      dispatch(errorAction);
      return { error: "Authentication token not found" };
    }

    try {
      console.log('Dispatching PUT_COMPOFF_LEAVE_STATUS_REQUEST');
      dispatch({ type: PUT_COMPOFF_LEAVE_STATUS_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      console.log('Making API call to:', `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-compoff-request/${id}`);
      console.log('Request payload:', { status });
      console.log('Request config:', config);

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-compoff-request/${id}`,
        { status },
        config
      );

      console.log('API response:', data);

      dispatch({ type: PUT_COMPOFF_LEAVE_STATUS_SUCCESS, payload: data });

      if (data?.statusCode === 200) {
        console.log('Action successful, returning success');
        // Return the data for the component to handle
        return { success: true, data };
      } else {
        console.log('Unexpected response status:', data?.statusCode);
        // Handle unexpected response
        return { success: false, error: data?.message || "Unexpected response from server" };
      }
    } catch (error) {
      console.error('Error in putCompOffLeaveRequestAction:', error);
      const errorMessage = error.response?.data?.message || "Something went wrong";
      dispatch({
        type: PUT_COMPOFF_LEAVE_STATUS_FAIL,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
    
    console.log('=== putCompOffLeaveRequestAction END ===');
  };

export const postMedicalFileAction =
  (formData) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage
    const employeId = localStorage.getItem("employeId");

    // If token does not exist, handle it gracefully
    if (!token) {
      return dispatch({
        type: POST_MEDICAL_FILE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData?.data) return;

    try {
      dispatch({ type: POST_MEDICAL_FILE_REQUEST });

      // Add token and content type headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Correct content type for file upload
        },
      };
      const file = formData;
      // Perform API call with FormData
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/s3/upload-medical-report/${employeId}`,
        file, // Pass the FormData object directly
        config
      );

      dispatch({ type: POST_MEDICAL_FILE_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: POST_MEDICAL_FILE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const deleteLeaveRequestAction =
  ({ id }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage
    const employeId = localStorage.getItem("employeId");

    // If token does not exist, handle it gracefully
    if (!token) {
      return dispatch({
        type: DELETE_LEAVE_REQUEST_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData?.data) return;

    try {
      dispatch({ type: DELETE_LEAVE_REQUEST_REQUEST });

      // Add token and content type headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Correct content type for file upload
        },
      };
      // Perform API call with FormData
      const { data } = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/leave/delete-leave-application/${id}`,
        config
      );

      dispatch({ type: DELETE_LEAVE_REQUEST_SUCCESS, payload: data });

      // Removed window.location.reload() - let the component handle data refresh
    } catch (error) {
      dispatch({
        type: DELETE_LEAVE_REQUEST_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const deleteLeaveCompoffAction =
  ({ id }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage

    // If token does not exist, handle it gracefully
    if (!token) {
      return dispatch({
        type: DELETE_LEAVE_COMPOFF_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData?.data) return;

    try {
      dispatch({ type: DELETE_LEAVE_COMPOFF_REQUEST });

      // Add token and content type headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Correct content type for file upload
        },
      };
      // Perform API call with FormData
      const { data } = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/leave/delete-compoff/${id}`,
        config
      );

      dispatch({ type: DELETE_LEAVE_COMPOFF_SUCCESS, payload: data });

      // Removed window.location.reload() - let the component handle data refresh
    } catch (error) {
      dispatch({
        type: DELETE_LEAVE_COMPOFF_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getEmoployeeDocumentsAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_PUBLIC_DOCUMENTS_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_PUBLIC_DOCUMENTS_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/s3/get-employee-document-list`,
      {
        employeId,
      },
      config
    );

    dispatch({ type: GET_PUBLIC_DOCUMENTS_SUCCESS, payload: data });

    if (data?.statusCode === 201) {
      alert(data?.message);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    if (error.response?.data?.statusCode === 404) {
      return;
    } else {
      alert(error.response?.data?.message);
    }
    dispatch({
      type: GET_PUBLIC_DOCUMENTS_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getCompoffDataAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_COMPOFF_DATA_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_COMPOFF_DATA_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/leave/get-own-compoff-history`,
      config
    );
    dispatch({ type: GET_COMPOFF_DATA_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_COMPOFF_DATA_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getVendorLogsAction = ({ page = 1, limit = 10 } = {}) => async (dispatch, getState) => {
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_VENDOR_LOGS_REQUEST,
      payload: "Authentication token not found",
    });
  }

  try {
    dispatch({ type: GET_VENDOR_LOGS_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        page,
        limit
      }
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/leave/get-all-vendor-meeting-logs`,
      config
    );
    dispatch({ type: GET_VENDOR_LOGS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_VENDOR_LOGS_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getVendorSingleLogsAction = () => async (dispatch, getState) => {
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_VENDOR_SINGLE_LOGS_REQUEST,
      payload: "Authentication token not found",
    });
  }

  try {
    dispatch({ type: GET_VENDOR_SINGLE_LOGS_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/leave/get-all-vendor-meeting-logs/${employeId}`,
      config
    );
    dispatch({ type: GET_VENDOR_SINGLE_LOGS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_VENDOR_SINGLE_LOGS_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getTeammateDataAction = () => async (dispatch, getState) => {
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  // const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_TEAMMATE_DATA_REQUEST,
      payload: "Authentication token not found",
    });
  }

  try {
    dispatch({ type: GET_TEAMMATE_DATA_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/employee/get-emp-list-by-manager`,
      config
    );
    dispatch({ type: GET_TEAMMATE_DATA_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_TEAMMATE_DATA_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const postEmployePrivateDocAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_EMPLOYEE_PRIVATE_DOC_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_EMPLOYEE_PRIVATE_DOC_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/s3/get-employee-document-list/${employeId}`,
      config
    );

    dispatch({ type: GET_EMPLOYEE_PRIVATE_DOC_SUCCESS, payload: data });

    if (data?.statusCode === 201) {
      alert(data?.message);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    if (error.response?.data?.statusCode === 404) {
      return;
    } else {
      alert(error.response?.data?.message);
    }
    dispatch({
      type: GET_EMPLOYEE_PRIVATE_DOC_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const updateProfileImage = (formData) => async (dispatch) => {
  try {
    dispatch({ type: PROFILE_IMAGE_UPDATE_REQUEST });
    const response = await fetch("/api/update-avatar", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    dispatch({ type: PROFILE_IMAGE_UPDATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: PROFILE_IMAGE_UPDATE_FAIL, payload: error.message });
  }
};

export const postSendOtpWithEmailAction = (email) => async (dispatch) => {
  try {
    dispatch({ type: POST_SEND_OTP_WITH_EMAIL_REQUEST });

    // API call without token
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/employee/reset-password`,
      { email },
      config
    );

    dispatch({ type: POST_SEND_OTP_WITH_EMAIL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: POST_SEND_OTP_WITH_EMAIL_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const postOTPVerificationAction = (otpverify) => async (dispatch) => {
  try {
    dispatch({ type: POST_OTP_VERIFICATION_REQUEST });

    // API call without token
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const otp = otpverify;
    const { data } = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/employee/verify-otp`,
      { otp },
      config
    );

    dispatch({ type: POST_OTP_VERIFICATION_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: POST_OTP_VERIFICATION_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const postConfirmPasswordAction =
  ({ email, loginPassword }) =>
  async (dispatch) => {
    try {
      dispatch({ type: POST_CONFIRM_PASSWORD_REQUEST });

      // API call without token
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/employee/generate-newpassword`,
        { email, loginPassword },
        config
      );

      dispatch({ type: POST_CONFIRM_PASSWORD_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: POST_CONFIRM_PASSWORD_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postProfileUploadAction = (file) => async (dispatch) => {
  const token = localStorage.getItem("authToken"); // Get the token
  const employeId = localStorage.getItem("employeId"); // Get employee ID

  if (!token) {
    return dispatch({
      type: POST_PROFILE_IMAGE_UPLOAD_FAIL,
      payload: "Authentication token not found",
    });
  }

  try {
    dispatch({ type: POST_PROFILE_IMAGE_UPLOAD_REQUEST });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const { data } = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/s3/upload-profile-image/${employeId}`,
      file,
      config
    );

    dispatch({ type: POST_PROFILE_IMAGE_UPLOAD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: POST_PROFILE_IMAGE_UPLOAD_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getCalenderLogsApiAction =
  (monthYear, employeeId) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    const employeId = employeeId
      ? employeeId
      : localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_CALENDER_LOGS_API_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: GET_CALENDER_LOGS_API_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/attendance-days-by-month/${employeId}?yearMonth=${monthYear}`,
        config
      );
      dispatch({ type: GET_CALENDER_LOGS_API_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_CALENDER_LOGS_API_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getAllEmployeeAtendenceAction =
  (dateFrom, dateToo, page) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_ALL_EMPLOYEE_ATTENDANCE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;
    try {
      dispatch({ type: GET_ALL_EMPLOYEE_ATTENDANCE_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      let newdateFrom = dateFrom ? dateFrom : "";
      let newdateTo = dateToo ? dateToo : "";
      let newPage = page ? page : "";
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/attendance-logs/?page=${newPage}&dateFrom=${newdateFrom}&dateTo=${newdateTo}`,
        config
      );

      dispatch({
        type: GET_ALL_EMPLOYEE_ATTENDANCE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: GET_ALL_EMPLOYEE_ATTENDANCE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getOnLeaveStatusAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  // const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_ON_LEAVE_STATUS_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_ON_LEAVE_STATUS_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/employee/get-today-onleave-emp-list`,
      config
    );
    dispatch({ type: GET_ON_LEAVE_STATUS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ON_LEAVE_STATUS_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getTotalProjectAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  // const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_TOTAL_PROJECT_LIST_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_TOTAL_PROJECT_LIST_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/task/get-projects`,
      config
    );
    dispatch({ type: GET_TOTAL_PROJECT_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_TOTAL_PROJECT_LIST_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const getTaskByProjectIdAction =
  (projectId) => async (dispatch, getState) => {
    const { allUserData } = getState();

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: GET_TASK_BY_PROJECT_ID_REQUEST });

      // Make API request without token
      const { data } = await axios.get(
        `http://172.23.100.117:8116/api/react/tasks?project_id=${projectId}`
      );

      dispatch({ type: GET_TASK_BY_PROJECT_ID_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_TASK_BY_PROJECT_ID_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const changeTaskStatusAction =
  (id, stage_name) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: PUT_CHANGE_TASK_STATUS_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: PUT_CHANGE_TASK_STATUS_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/task/update-task/${id}`,
        { stage_name },
        config
      );

      dispatch({ type: PUT_CHANGE_TASK_STATUS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: PUT_CHANGE_TASK_STATUS_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getSingleTaskDetailsAction =
  (taskId) => async (dispatch, getState) => {
    const { allUserData } = getState();

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: GET_SINGLE_TASK_DETAILS_REQUEST });

      // Make API request without token
      const { data } = await axios.get(
        `http://172.23.100.117:8116/api/tasks?task_id=${taskId}`
      );

      dispatch({ type: GET_SINGLE_TASK_DETAILS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_SINGLE_TASK_DETAILS_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

// export const getSingleTaskDetailsAction =
//   (taskId) => async (dispatch, getState) => {
//     const { allUserData } = getState();
//     const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
//     // const employeId = localStorage.getItem("employeId");
//     // If token does not exist, do nothing or handle the case
//     if (!token) {
//       return dispatch({
//         type: GET_SINGLE_TASK_DETAILS_REQUEST,
//         payload: "Authentication token not found",
//       });
//     }

//     // Prevent duplicate fetch if data already exists
//     if (allUserData.data) return;

//     try {
//       dispatch({ type: GET_SINGLE_TASK_DETAILS_REQUEST });

//       // Add token to request headers
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       };
//       const { data } = await axios.get(
//         `http://172.22.100.117:8116/api/tasks?project_id=${taskId}`,
//         // `${process.env.REACT_APP_BASE_URL}/api/task/get-task-details/${taskId}`,
//         config
//       );
//       dispatch({ type: GET_SINGLE_TASK_DETAILS_SUCCESS, payload: data });
//     } catch (error) {
//       dispatch({
//         type: GET_SINGLE_TASK_DETAILS_FAIL,
//         payload: error.response?.data?.message || "Something went wrong",
//       });
//     }
//   };

export const postrevertLeaveRequest =
  (revertedDays, id) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_LEAVE_APPLY_BY_EMPLOYEE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_REVERT_LEAVE_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/leave/revert-leave-req`,
        {
          revertedDays,
          id,
        },
        config
      );

      dispatch({ type: POST_REVERT_LEAVE_SUCCESS, payload: data });
      // Removed window.location.reload() - let the component handle data refresh
    } catch (error) {
      dispatch({
        type: POST_REVERT_LEAVE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const putRevertLeaveByManagerAction =
  ({ status, id }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: PUT_REVERT_LEAVE_BY_MANAGER_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: PUT_REVERT_LEAVE_BY_MANAGER_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-revert-leave-req/${id}`,
        {
          status,
        },
        config
      );

      dispatch({ type: PUT_REVERT_LEAVE_BY_MANAGER_SUCCESS, payload: data });
      // Removed window.location.reload() - let the component handle data refresh
    } catch (error) {
      dispatch({
        type: PUT_REVERT_LEAVE_BY_MANAGER_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getAnnouncementDataAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  // const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_ANNOUNCEMENT_DATA_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_ANNOUNCEMENT_DATA_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/common/get-event-list`,
      config
    );
    dispatch({ type: GET_ANNOUNCEMENT_DATA_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ANNOUNCEMENT_DATA_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const postAnnouncementDataAction =
  ({ title, description, dateTime, imageUrl }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_ANNOUNCEMENT_DATA_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_ANNOUNCEMENT_DATA_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/common/add-event`,
        {
          title,
          description,
          dateTime,
          imageUrl
        },
        config
      );
      dispatch({ type: POST_ANNOUNCEMENT_DATA_SUCCESS, payload: data });
      if (data?.statusCode === 201) {
        alert("Data added successfully");
        setTimeout(() => {
          window.location.reload();
        }, 100);
        return;
      }
    } catch (error) {
      dispatch({
        type: POST_ANNOUNCEMENT_DATA_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const deleteAnnouncementDataAction =
  (id) => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: DELETE_ANNOUNCEMENT_DATA_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: DELETE_ANNOUNCEMENT_DATA_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/common/delete-event/${id}`,
        config
      );
      dispatch({ type: DELETE_ANNOUNCEMENT_DATA_SUCCESS, payload: data });
      if (data?.statusCode === 200) {
        alert("Data Deleted");
        setTimeout(() => {
          window.location.reload();
        }, 100);
        return;
      }
    } catch (error) {
      dispatch({
        type: DELETE_ANNOUNCEMENT_DATA_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const updateAnnouncementDataAction =
  ({ id, title, description, dateTime }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: PUT_ANNOUNCEMENT_DATA_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: PUT_ANNOUNCEMENT_DATA_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/common/update-event/${id}`,
        { title, description, dateTime },
        config
      );
      dispatch({ type: PUT_ANNOUNCEMENT_DATA_SUCCESS, payload: data });
      if (data?.statusCode === 200) {
        alert("Data Updated");
        setTimeout(() => {
          window.location.reload();
        }, 100);
        return;
      }
    } catch (error) {
      dispatch({
        type: PUT_ANNOUNCEMENT_DATA_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postUploadEmployeeDocumentsAction =
  ({ docType, documentName, employeeId, location }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_UPLOAD_PUBLIC_DOCUMENTS_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_UPLOAD_PUBLIC_DOCUMENTS_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/s3/upload-employee-document`,
        {
          docType,
          documentName,
          employeeId,
          location,
        },
        config
      );
      dispatch({ type: POST_UPLOAD_PUBLIC_DOCUMENTS_SUCCESS, payload: data });
      if (data?.statusCode === 201) {
        alert("File uploaded successfully");
        setTimeout(() => {
          window.location.reload();
        }, 100);
        return;
      }
    } catch (error) {
      dispatch({
        type: POST_UPLOAD_PUBLIC_DOCUMENTS_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getPayrollAndPayslipAction = () => async (dispatch, getState) => {
  const { allUserData } = getState();
  const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
  // const employeId = localStorage.getItem("employeId");
  // If token does not exist, do nothing or handle the case
  if (!token) {
    return dispatch({
      type: GET_PAYROLL_AND_PAYSLIP_REQUEST,
      payload: "Authentication token not found",
    });
  }

  // Prevent duplicate fetch if data already exists
  if (allUserData.data) return;

  try {
    dispatch({ type: GET_PAYROLL_AND_PAYSLIP_REQUEST });

    // Add token to request headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/all-employee-salary-data`,
      config
    );
    dispatch({ type: GET_PAYROLL_AND_PAYSLIP_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_PAYROLL_AND_PAYSLIP_FAIL,
      payload: error.response?.data?.message || "Something went wrong",
    });
  }
};

export const postVendorMeetingAction =
  ({ leaveType, leaveStartDate, reason, duration }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_VENDOR_MEETING_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_VENDOR_MEETING_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/leave/apply-for-vendor-meeting/${employeId}`,
        {
          leaveType,
          leaveStartDate,
          reason,
          duration,
        },
        config
      );
      dispatch({ type: POST_VENDOR_MEETING_SUCCESS, payload: data });
      // Removed alert and window.location.reload - let the component handle success
    } catch (error) {
      dispatch({
        type: POST_VENDOR_MEETING_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const putVendorStatusDataAction =
  ({ status, id }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId=localStorage.getItem('employeId')
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: PUT_VENDOR_STATUS_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: PUT_VENDOR_STATUS_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/leave/action-for-vendor-meeting/${id}`,
        { status },
        config
      );

      dispatch({ type: PUT_VENDOR_STATUS_SUCCESS, payload: data });

      // Removed alerts and window.location.reload - let the component handle success
    } catch (error) {
      dispatch({
        type: PUT_VENDOR_STATUS_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const postAddEmployeeAction =
  ({
    employeeId,
    employeeName,
    employeeCode,
    gender,
    departmentId,
    designation,
    doj,
    employeeCodeInDevice,
    employmentType,
    employeeStatus,
    accountStatus,
    fatherName,
    motherName,
    residentialAddress,
    permanentAddress,
    contactNo,
    email,
    dob,
    placeOfBirth,
    bloodGroup,
    workPlace,
    aadhaarNumber,
    employeePhoto,
    masterDeviceId,
    maritalStatus,
    nationality,
    overallExperience,
    qualifications,
    emergencyContact,
    managerId,
    teamLeadId,
    leaveBalance,
    role,
    shiftTime,
    loginPassword,
    pancardNo,
    workingDays,
  }) =>
  async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: POST_ADD_EMPLOYEE_REQUEST,
        payload: "Authentication token not found",
      });
    }

    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;

    try {
      dispatch({ type: POST_ADD_EMPLOYEE_REQUEST });

      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/employee/register`,
        {
          employeeId,
          employeeName,
          employeeCode,
          gender,
          departmentId,
          designation,
          doj,
          employeeCodeInDevice,
          employmentType,
          employeeStatus,
          accountStatus,
          fatherName,
          motherName,
          residentialAddress,
          permanentAddress,
          contactNo,
          email,
          dob,
          placeOfBirth,
          bloodGroup,
          workPlace,
          aadhaarNumber,
          employeePhoto,
          masterDeviceId,
          maritalStatus,
          nationality,
          overallExperience,
          qualifications,
          emergencyContact,
          managerId,
          teamLeadId,
          leaveBalance,
          role,
          shiftTime,
          loginPassword,
          pancardNo,
          workingDays,
        },
        config
      );
      dispatch({ type: POST_ADD_EMPLOYEE_SUCCESS, payload: data });
      if (data?.statusCode === 201) {
        alert("Register successfully");
        setTimeout(() => {
          window.location.reload();
        }, 100);
        return;
      }
    } catch (error) {
      dispatch({
        type: POST_ADD_EMPLOYEE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  export const getEmployeeDataCountAction = () => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_EMPLOYEE_DATA_COUNT_REQUEST,
        payload: "Authentication token not found",
      });
    }
  
    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;
  
    try {
      dispatch({ type: GET_EMPLOYEE_DATA_COUNT_REQUEST });
  
      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/common/get-emp-data-count`,
        config
      );
      dispatch({ type: GET_EMPLOYEE_DATA_COUNT_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_EMPLOYEE_DATA_COUNT_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  export const getGraphDataForEmployeeAction = () => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_GRAPH_DATA_EMPLOYEE_REQUEST,
        payload: "Authentication token not found",
      });
    }
  
    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;
  
    try {
      dispatch({ type: GET_GRAPH_DATA_EMPLOYEE_REQUEST });
  
      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/common/get-emp-attendance-count`,
        config
      );
      dispatch({ type: GET_GRAPH_DATA_EMPLOYEE_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_GRAPH_DATA_EMPLOYEE_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  export const getEmployeeLeaveCountAction = () => async (dispatch, getState) => {
    const { allUserData } = getState();
    const token = localStorage.getItem("authToken"); // Get the token from localStorage (or cookies)
    // const employeId = localStorage.getItem("employeId");
    // If token does not exist, do nothing or handle the case
    if (!token) {
      return dispatch({
        type: GET_EMPLOYEE_LEAVE_COUNT_REQUEST,
        payload: "Authentication token not found",
      });
    }
    // Prevent duplicate fetch if data already exists
    if (allUserData.data) return;
  
    try {
      dispatch({ type: GET_EMPLOYEE_LEAVE_COUNT_REQUEST });
  
      // Add token to request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/common/get-emp-leaves-count`,
        config
      );
      dispatch({ type: GET_EMPLOYEE_LEAVE_COUNT_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_EMPLOYEE_LEAVE_COUNT_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };

export const getAllCompoffLeaveRequestAction =
  ({ page = 1, limit = 10 } = {}) => async (dispatch, getState) => {
    const token = localStorage.getItem("authToken");
    const employeId = localStorage.getItem("employeId");
    
    if (!token) {
      return dispatch({
        type: GET_COMPOFF_LEAVE_APPROVAL_REQUEST,
        payload: "Authentication token not found",
      });
    }

    try {
      dispatch({ type: GET_COMPOFF_LEAVE_APPROVAL_REQUEST });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit
        }
      };
      
      // Use a different endpoint to get all Comp Off requests, not just pending ones
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/leave/get-all-compoff`,
        config
      );

      dispatch({ type: GET_COMPOFF_LEAVE_APPROVAL_SUCCESS, payload: data });

      if (data?.statusCode === 201) {
        alert(data?.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (error.response?.data?.statusCode === 404) {
        return;
      } else {
        alert(error.response?.data?.message);
      }
      dispatch({
        type: GET_COMPOFF_LEAVE_APPROVAL_FAIL,
        payload: error.response?.data?.message || "Something went wrong",
      });
    }
  };