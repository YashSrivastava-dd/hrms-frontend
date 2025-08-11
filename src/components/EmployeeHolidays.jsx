import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHolidaysDataAction, getUserDataAction } from "../store/action/userDataAction";
import { FaCalendarAlt, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { MdEvent, MdToday, MdDateRange } from "react-icons/md";

const EmployeeHolidays = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.holidaysData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  useEffect(() => {
    const employeeId = "900";
    dispatch(getUserDataAction(employeeId));
    dispatch(getHolidaysDataAction());
    setLoading(false);
  }, [dispatch]);

  // Handle clicking outside the month filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMonthFilter && !event.target.closest('.month-filter-dropdown')) {
        setShowMonthFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthFilter]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDate = new Date();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredHolidays = data?.data?.filter(holiday => {
    const matchesSearch = holiday.holidayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || new Date(holiday.holidayDate).getMonth() === months.indexOf(selectedMonth);
    return matchesSearch && matchesMonth;
  }) || [];

  const totalHolidays = data?.data?.length || 0;
  const upcomingHolidays = data?.data?.filter(holiday => new Date(holiday.holidayDate) > currentDate).length || 0;
  const thisMonthHolidays = data?.data?.filter(holiday => {
    const holidayDate = new Date(holiday.holidayDate);
    return holidayDate.getMonth() === currentMonth && holidayDate.getFullYear() === currentYear;
  }).length || 0;
  const passedHolidays = data?.data?.filter(holiday => new Date(holiday.holidayDate) < currentDate).length || 0;

  // Custom Month Filter Component
  const CustomMonthFilter = () => {
    const handleMonthSelect = (month) => {
      setSelectedMonth(selectedMonth === month ? "" : month);
      setShowMonthFilter(false);
    };

    const clearFilter = () => {
      setSelectedMonth("");
      setShowMonthFilter(false);
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowMonthFilter(!showMonthFilter)}
          className={`flex items-center space-x-2 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white w-full sm:w-48 hover:bg-gray-50 transition-colors duration-200 ${
            selectedMonth 
              ? 'border-purple-300 bg-purple-50 text-purple-700' 
              : 'border-gray-300 text-gray-700'
          }`}
        >
          <FaFilter className={`absolute left-3 w-4 h-4 ${
            selectedMonth ? 'text-purple-500' : 'text-gray-400'
          }`} />
          <span className="text-gray-700">
            {selectedMonth || "All Months"}
          </span>
          {selectedMonth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilter();
              }}
              className="ml-2 p-1 rounded-full hover:bg-purple-200 transition-colors duration-200"
            >
              <FaTimes className="w-3 h-3 text-purple-500" />
            </button>
          )}
        </button>

        {showMonthFilter && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto month-filter-dropdown transition-all duration-200 ease-in-out">
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Select Month</h3>
                {selectedMonth && (
                  <button
                    onClick={clearFilter}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:bg-purple-100 px-2 py-1 rounded transition-colors duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => {
                  const isSelected = selectedMonth === month;
                  const isCurrentMonth = index === currentMonth;
                  const hasHolidays = data?.data?.some(holiday => 
                    new Date(holiday.holidayDate).getMonth() === index
                  );
                  const holidayCount = data?.data?.filter(holiday => 
                    new Date(holiday.holidayDate).getMonth() === index
                  ).length || 0;

                  return (
                    <button
                      key={index}
                      onClick={() => handleMonthSelect(month)}
                      className={`p-3 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-300'
                          : isCurrentMonth
                          ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border-2 border-purple-300 shadow-md'
                          : hasHolidays
                          ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-sm'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 hover:from-gray-100 hover:to-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">{month.slice(0, 3)}</span>
                        {isCurrentMonth && !isSelected && (
                          <span className="text-xs text-purple-600 font-semibold mt-1">Current</span>
                        )}
                        {hasHolidays && (
                          <span className={`text-xs mt-1 font-medium ${
                            isSelected ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            {holidayCount} {holidayCount === 1 ? 'holiday' : 'holidays'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  const HolidayCard = ({ holiday, index }) => {
    const holidayDate = new Date(holiday.holidayDate);
    const isToday = holidayDate.toDateString() === currentDate.toDateString();
    const isUpcoming = holidayDate > currentDate;
    const isThisMonth = holidayDate.getMonth() === currentMonth && holidayDate.getFullYear() === currentYear;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[holidayDate.getDay()];
    const monthName = holidayDate.toLocaleString('default', { month: 'short' });
    const dayOfMonth = holidayDate.getDate();

    // Determine card styling based on holiday status
    let cardStyle = "bg-white";
    let iconStyle = "from-blue-500 to-indigo-600";
    let statusText = "Passed";
    let statusColor = "bg-gray-100 text-gray-800";

    if (isToday) {
      cardStyle = "ring-2 ring-green-500 bg-green-50";
      iconStyle = "from-green-500 to-green-600";
      statusText = "Today";
      statusColor = "bg-green-100 text-green-800";
    } else if (isUpcoming && isThisMonth) {
      cardStyle = "ring-2 ring-purple-500 bg-purple-50";
      iconStyle = "from-purple-500 to-purple-600";
      statusText = "This Month";
      statusColor = "bg-purple-100 text-purple-800";
    } else if (isUpcoming) {
      cardStyle = "ring-2 ring-blue-500 bg-blue-50";
      iconStyle = "from-blue-500 to-indigo-600";
      statusText = "Upcoming";
      statusColor = "bg-blue-100 text-blue-800";
    }

    return (
      <div className={`rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${cardStyle}`}>
        {/* Date Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold ${iconStyle}`}>
              <span className="text-xs">{monthName}</span>
              <span className="text-lg">{dayOfMonth}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{dayName}</p>
              <p className="text-xs text-gray-500">{holidayDate.getFullYear()}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {isToday && <MdToday className="w-3 h-3 mr-1" />}
            {isUpcoming && !isToday && <MdDateRange className="w-3 h-3 mr-1" />}
            {statusText}
          </span>
        </div>

        {/* Holiday Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{holiday.holidayName}</h3>
        
        {/* Additional Info */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaCalendarAlt className="text-purple-500" />
          <span>{holiday.holidayDate}</span>
        </div>
      </div>
    );
  };

  const HolidayTableRow = ({ holiday, index }) => {
    const holidayDate = new Date(holiday.holidayDate);
    const isToday = holidayDate.toDateString() === currentDate.toDateString();
    const isUpcoming = holidayDate > currentDate;
    const isThisMonth = holidayDate.getMonth() === currentMonth && holidayDate.getFullYear() === currentYear;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[holidayDate.getDay()];
    
    // Determine row styling based on holiday status
    let rowStyle = "bg-white";
    let iconStyle = "from-blue-500 to-indigo-600";
    let statusText = "Passed";
    let statusColor = "bg-gray-100 text-gray-800";

    if (isToday) {
      rowStyle = "bg-green-50";
      iconStyle = "from-green-500 to-green-600";
      statusText = "Today";
      statusColor = "bg-green-100 text-green-800";
    } else if (isUpcoming && isThisMonth) {
      rowStyle = "bg-purple-50";
      iconStyle = "from-purple-500 to-purple-600";
      statusText = "This Month";
      statusColor = "bg-purple-100 text-purple-800";
    } else if (isUpcoming) {
      rowStyle = "bg-blue-50";
      iconStyle = "from-blue-500 to-indigo-600";
      statusText = "Upcoming";
      statusColor = "bg-blue-100 text-blue-800";
    }

    return (
      <tr className={`border-b hover:bg-gray-50 transition-colors duration-200 ${rowStyle}`}>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white font-bold text-xs ${iconStyle}`}>
              <span>{holidayDate.toLocaleString('default', { month: 'short' })}</span>
              <span>{holidayDate.getDate()}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{holiday.holidayDate}</p>
              <p className="text-sm text-gray-500">{dayName}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <h3 className="font-semibold text-gray-900">{holiday.holidayName}</h3>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {isToday && <MdToday className="w-3 h-3 mr-1" />}
            {isUpcoming && !isToday && <MdDateRange className="w-3 h-3 mr-1" />}
            {statusText}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="full-height-content bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 flex flex-col">
      <div className="w-full flex-1">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MdEvent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Holiday Calendar {currentYear}</h1>
                  <p className="text-sm text-gray-600">View and manage company holidays</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === "grid" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === "list" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search holidays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
                />
              </div>
              
              <CustomMonthFilter />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Holidays</p>
                <p className="text-lg font-bold text-gray-900">{totalHolidays}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MdEvent className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Upcoming</p>
                <p className="text-lg font-bold text-blue-600">{upcomingHolidays}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdToday className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">This Month</p>
                <p className="text-lg font-bold text-purple-600">{thisMonthHolidays}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MdDateRange className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Passed</p>
                <p className="text-lg font-bold text-gray-600">{passedHolidays}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          {loading ? (
            <SkeletonLoader />
          ) : filteredHolidays.length > 0 ? (
            viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredHolidays.map((holiday, index) => (
                  <HolidayCard key={index} holiday={holiday} index={index} />
                ))}
              </div>
            ) : (
              // List View
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Holiday Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHolidays.map((holiday, index) => (
                      <HolidayTableRow key={index} holiday={holiday} index={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Holidays Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHolidays;
