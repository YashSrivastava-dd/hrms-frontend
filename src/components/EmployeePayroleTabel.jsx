import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPayrollAndPayslipAction, getUserDataAction } from "../store/action/userDataAction";
import NewPaySlip from "./NewPaySlip";

const EmployeePayroleTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [payslipModel, setPayslipModel] = useState(false);
  const [payslipModelData, setPayslipModelData] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserDataAction());
    dispatch(getPayrollAndPayslipAction());
  }, [dispatch]);

  const { data } = useSelector((state) => state.salarySlipData);

  // 🔍 Utility to convert "2024-01", "2024-01-01", or similar to "January"
  const getMonthName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Invalid date
    return date.toLocaleString("default", { month: "long" });
  };

  // ✅ Filter logic with month conversion
  const filteredData = data?.data?.filter((employee) => {
    const nameMatch = employee?.employee_basic_details?.employee_name
      ?.toLowerCase()
      ?.includes(searchTerm.toLowerCase());

    const paySlipMonth = getMonthName(employee?.pay_slip_month);
    const monthMatch = selectedMonth
      ? paySlipMonth.toLowerCase() === selectedMonth.toLowerCase()
      : true;

    return nameMatch && monthMatch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {payslipModel ? (
        <NewPaySlip
          setPayslipModel={setPayslipModel}
          payslipModelData={payslipModelData}
        />
      ) : (
        <div>
          {/* Search and Month Filter */}
          <div className="flex justify-between items-center mb-4 gap-4">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Months</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">Employee ID</th>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">Employee Name</th>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">Designation</th>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">Month</th>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">Paid Days</th>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">LOP</th>
                <th className="py-2 px-4 text-left text-gray-600 font-bold">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((employee, index) => (
                <tr key={index} className="border-t hover:bg-gray-100">
                  <td className="py-4 px-3">{employee?.employee_basic_details?.employee_code}</td>
                  <td className="py-4 px-3">{employee?.employee_basic_details?.employee_name}</td>
                  <td className="py-4 px-3">{employee?.employee_basic_details?.department || employee?.employee_basic_details?.designation}</td>
                  <td className="py-4 px-3">{employee.pay_slip_month}</td>
                  <td className="py-4 px-3">{employee.leave_summary?.payable_days || employee.leave_summary?.workedDays}</td>
                  <td className="py-4 px-3">{employee.leave_summary?.unpaid_days || employee.leave_summary?.absent}</td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() => {
                        setPayslipModel(true);
                        setPayslipModelData(employee);
                      }}
                      className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroleTable;
