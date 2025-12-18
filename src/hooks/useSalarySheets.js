import { useState, useEffect, useCallback } from "react";
import salarySheetService from "../services/salarySheetService";

/**
 * Hook to fetch all salary sheets with pagination and filters
 * @param {object} filters - Filter parameters
 * @returns {object} { data, loading, error, refetch, pagination }
 */
export const useSalarySheets = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 20,
  });

  const fetchSalarySheets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await salarySheetService.getAllSalarySheets(filters);
      
      if (response?.data) {
        setData(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSalarySheets();
  }, [fetchSalarySheets]);

  return {
    data,
    loading,
    error,
    refetch: fetchSalarySheets,
    pagination,
  };
};

/**
 * Hook to fetch a single salary sheet by ID
 * @param {string} id - Salary sheet ID
 * @returns {object} { data, loading, error, refetch }
 */
export const useSalarySheet = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalarySheet = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await salarySheetService.getSalarySheetById(id);
      
      if (response?.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSalarySheet();
  }, [fetchSalarySheet]);

  return {
    data,
    loading,
    error,
    refetch: fetchSalarySheet,
  };
};

/**
 * Hook to fetch salary sheets by employee code
 * @param {string} employeeCode - Employee code
 * @param {object} filters - Optional filters (month, year)
 * @returns {object} { data, loading, error, refetch, count }
 */
export const useEmployeeSalarySheets = (employeeCode, filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const fetchEmployeeSalarySheets = useCallback(async () => {
    if (!employeeCode) return;

    try {
      setLoading(true);
      setError(null);
      const response = await salarySheetService.getSalarySheetsByEmployee(
        employeeCode,
        filters
      );
      
      if (response?.data) {
        setData(response.data);
        setCount(response.count || response.data.length);
      }
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [employeeCode, filters]);

  useEffect(() => {
    fetchEmployeeSalarySheets();
  }, [fetchEmployeeSalarySheets]);

  return {
    data,
    loading,
    error,
    refetch: fetchEmployeeSalarySheets,
    count,
  };
};

/**
 * Hook to generate salary sheets with loading and error states
 * @returns {object} { generate, loading, error }
 */
export const useGenerateSalarySheets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async (year, month, generated_by) => {
    try {
      setLoading(true);
      setError(null);
      const response = await salarySheetService.generateSalarySheets({
        year,
        month,
        generated_by,
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generate,
    loading,
    error,
  };
};
