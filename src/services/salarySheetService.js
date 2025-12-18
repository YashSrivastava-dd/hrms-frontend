import axios from "axios";
import { safeGetLocalStorage } from "../utils/safariHelpers";
import safeToast from "../utils/safeToast";

/**
 * Get authentication token from localStorage
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
  try {
    return safeGetLocalStorage("authToken");
  } catch (error) {
    console.warn("Error accessing localStorage for token:", error);
    return null;
  }
};

/**
 * Get base API URL from environment variables
 * @returns {string} Base API URL
 */
const getBaseUrl = () => {
  return process.env.REACT_APP_BASE_URL || "http://localhost:3001";
};

/**
 * Create axios config with authentication headers
 * @returns {object} Axios config object
 */
const getAuthConfig = () => {
  const token = getAuthToken();
  
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error("Authentication token not found");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 second timeout
  };
};

/**
 * Handle API errors and show appropriate messages
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 */
const handleError = (error, defaultMessage = "Something went wrong") => {
  console.error("API Error:", error);

  let errorMessage = defaultMessage;

  if (error.code === "ECONNABORTED") {
    errorMessage = "Request timeout - please check your connection";
  } else if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        errorMessage = "Unauthorized - Please login again";
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        break;
      case 403:
        errorMessage = data?.message || "You don't have permission to perform this action";
        break;
      case 404:
        errorMessage = data?.message || "Resource not found";
        break;
      case 500:
        errorMessage = data?.message || "Server error - Please try again later";
        break;
      default:
        errorMessage = data?.message || `Error: ${status}`;
    }
  } else if (error.request) {
    errorMessage = "Network error - please check your connection";
  } else {
    errorMessage = error.message || defaultMessage;
  }

  safeToast.error(errorMessage);
  throw new Error(errorMessage);
};

/**
 * Salary Sheet API Service
 */
const salarySheetService = {
  /**
   * Generate salary sheets for a specific month/year
   * @param {object} params - Generation parameters
   * @param {number} params.year - Year (e.g., 2025)
   * @param {number} params.month - Month (1-12)
   * @param {string} params.generated_by - User ID who is generating
   * @returns {Promise<object>} Response with generation results
   */
  generateSalarySheets: async ({ year, month, generated_by }) => {
    try {
      const config = getAuthConfig();
      const response = await axios.post(
        `${getBaseUrl()}/api/generate-salary-sheets`,
        { year, month, generated_by },
        config
      );

      if (response.data?.statusCode === 200) {
        safeToast.success(response.data.message || "Salary sheets generated successfully");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to generate salary sheets");
      }
    } catch (error) {
      handleError(error, "Failed to generate salary sheets");
      throw error;
    }
  },

  /**
   * Get all salary sheets with pagination and filters
   * @param {object} filters - Filter parameters
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @param {number} filters.month - Filter by month (1-12)
   * @param {number} filters.year - Filter by year
   * @param {string} filters.employee_code - Filter by employee code
   * @param {string} filters.search - Search query
   * @returns {Promise<object>} Response with salary sheets and pagination
   */
  getAllSalarySheets: async (filters = {}) => {
    try {
      const config = getAuthConfig();
      const params = new URLSearchParams();

      // Add pagination
      params.append("page", filters.page || 1);
      params.append("limit", filters.limit || 20);

      // Add filters
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);
      if (filters.employee_code) params.append("employee_code", filters.employee_code);
      if (filters.search) params.append("search", filters.search);

      const response = await axios.get(
        `${getBaseUrl()}/api/salary-sheets?${params.toString()}`,
        config
      );

      if (response.data?.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch salary sheets");
      }
    } catch (error) {
      handleError(error, "Failed to fetch salary sheets");
      throw error;
    }
  },

  /**
   * Get salary sheet by ID
   * @param {string} id - Salary sheet ID
   * @returns {Promise<object>} Salary sheet data
   */
  getSalarySheetById: async (id) => {
    try {
      const config = getAuthConfig();
      const response = await axios.get(
        `${getBaseUrl()}/api/salary-sheets/${id}`,
        config
      );

      if (response.data?.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch salary sheet");
      }
    } catch (error) {
      handleError(error, "Failed to fetch salary sheet");
      throw error;
    }
  },

  /**
   * Get salary sheets by employee code
   * @param {string} employeeCode - Employee code
   * @param {object} filters - Optional filters (month, year)
   * @returns {Promise<object>} Response with salary sheets
   */
  getSalarySheetsByEmployee: async (employeeCode, filters = {}) => {
    try {
      const config = getAuthConfig();
      const params = new URLSearchParams();

      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);

      const queryString = params.toString();
      const url = `${getBaseUrl()}/api/salary-sheets/employee/${employeeCode}${queryString ? `?${queryString}` : ""}`;

      const response = await axios.get(url, config);

      if (response.data?.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch employee salary sheets");
      }
    } catch (error) {
      handleError(error, "Failed to fetch employee salary sheets");
      throw error;
    }
  },

  /**
   * Get salary sheets by month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<object>} Response with salary sheets
   */
  getSalarySheetsByMonth: async (year, month) => {
    try {
      const config = getAuthConfig();
      const response = await axios.get(
        `${getBaseUrl()}/api/salary-sheets/month/${year}/${month}`,
        config
      );

      if (response.data?.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch salary sheets for month");
      }
    } catch (error) {
      handleError(error, "Failed to fetch salary sheets for month");
      throw error;
    }
  },

  /**
   * Update salary sheet
   * @param {string} id - Salary sheet ID
   * @param {object} updates - Update data
   * @param {boolean} updates.is_locked - Lock/unlock status
   * @param {object} updates.deductions - Deduction updates
   * @returns {Promise<object>} Updated salary sheet
   */
  updateSalarySheet: async (id, updates) => {
    try {
      const config = getAuthConfig();
      const response = await axios.put(
        `${getBaseUrl()}/api/salary-sheets/${id}`,
        updates,
        config
      );

      if (response.data?.statusCode === 200) {
        safeToast.success(response.data.message || "Salary sheet updated successfully");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to update salary sheet");
      }
    } catch (error) {
      handleError(error, "Failed to update salary sheet");
      throw error;
    }
  },

  /**
   * Delete salary sheet
   * @param {string} id - Salary sheet ID
   * @returns {Promise<object>} Success response
   */
  deleteSalarySheet: async (id) => {
    try {
      const config = getAuthConfig();
      const response = await axios.delete(
        `${getBaseUrl()}/api/salary-sheets/${id}`,
        config
      );

      if (response.data?.statusCode === 200) {
        safeToast.success(response.data.message || "Salary sheet deleted successfully");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to delete salary sheet");
      }
    } catch (error) {
      handleError(error, "Failed to delete salary sheet");
      throw error;
    }
  },
};

export default salarySheetService;
