import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHolidaysDataAction, getUserDataAction } from "../store/action/userDataAction";

const EmployeeHolidays = () => {
  const { loading, data, error } = useSelector((state) => state.holidaysData);
  const holidaysData = data?.data || [];
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getHolidaysDataAction());
    dispatch(getUserDataAction());
  }, [dispatch])

  const NoDataCard = () => (
    <div className="flex justify-center items-center p-6 bg-gray-50 rounded-lg shadow-lg">
      <p className="text-gray-500 text-lg font-semibold">No Holidays Found</p>
    </div>
  );

  const SkeletonLoader = () => (
    <tbody>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <tr key={index} className={`animate-pulse ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            <td className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </td>
            <td className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
            </td>
            <td className="px-6 py-3">
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </td>
          </tr>
        ))}
    </tbody>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h5 class="mb-3 font-extrabold leading-none tracking-tight text-gray-900 lg:text-2xl dark:text-black">Holiday List Of 2025</h5>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-left text-sm text-gray-700">
          {/* Table Header */}
          <thead className="bg-blue-100 text-blue-600 uppercase">
            <tr>
              <th className="px-6 py-6 text-black">Date</th>
              <th className="px-6 py-6 text-black">Day</th>
              <th className="px-6 py-6 text-black">Holiday Name</th>
            </tr>
          </thead>
          {/* Table Body */}
          {loading ? (
            <SkeletonLoader />
          ) : holidaysData.length > 0 ? (
            <tbody>
              {holidaysData.map((holiday, index) => {
                const holidayDate = new Date(holiday.holidayDate);
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const dayName = days[holidayDate.getDay()]; // Get the day of the week
                return (
                  <tr
                    key={index}
                    className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                  >
                    <td className="px-6 py-6 text-gray-700 text-sm font-bold">{holiday.holidayDate}</td>
                    <td className="px-6 py-6 text-gray-700 text-sm">{dayName}</td>
                    <td className="px-6 py-6 text-gray-700 font-semibold text-lg">{holiday.holidayName}</td>
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan="3">
                  <NoDataCard />
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default EmployeeHolidays;
