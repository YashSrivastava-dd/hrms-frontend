import { IoChevronBackOutline } from 'react-icons/io5'
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { getAttendenceLogsOfEmploye } from '../../store/action/userDataAction';
import Calendar from '../Calendar';
import { FaLongArrowAltLeft } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";


function AllEmployeeAttendanceLogs({ onBack, employeeTicket, employeeName, employeeLeaveBalance }) {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState({ startDate: null, endDate: null });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [count, setCount] = useState(1); // Pagination count
    const [activeTab, setActiveTab] = useState("teamLogs"); // Track which tab is active
    const { data: userData } = useSelector((state) => state.userData);
    const userDataList = userData?.data?.role || [];
    const { loading, data } = useSelector((state) => state.attendanceLogs);
    const employees = data?.data || [];
    const dispatch = useDispatch();
    useEffect(() => {
        const dateFrom = date.startDate?.format("YYYY-MM-DD");
        const dateTo = date.endDate?.format("YYYY-MM-DD");
        if (employeeTicket) {
            const dateFrom = date.startDate?.format("YYYY-MM-DD");
            const dateTo = date.endDate?.format("YYYY-MM-DD");
            dispatch(getAttendenceLogsOfEmploye(employeeTicket, dateFrom, dateTo, count));
        }
        console.log('Dispatching logs fetch with:', { employeeTicket, dateFrom, dateTo, count });
    }, [employeeTicket, date.startDate, date.endDate, count]);

    const handleOpenModal = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const handlePrevious = () => {
        if (count > 1) {
            setCount((prevCount) => prevCount - 1);
        }
    };

    const handleNext = () => {
        setCount((prevCount) => prevCount + 1);
    };

    const SkeletonLoader = () => (
        <tr className="animate-pulse">
            {Array(6)
                .fill(0)
                .map((_, idx) => (
                    <td key={idx} className="p-5 text-center">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    </td>
                ))}
        </tr>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center text-center">
                    <button onClick={onBack}>
                        <IoChevronBackOutline size={25} />
                    </button>
                    <h1 className="text-2xl font-bold">{employeeName}</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                <div className={`p-6 rounded-lg shadow bg-yellow-50`} role="region" aria-label='Casual Leave'>
                    <h3 className="text-lg">Casual Leave</h3>
                    <p className="text-2xl font-bold">{employeeLeaveBalance?.casualLeave}</p>
                </div>
                <div className={`p-6 rounded-lg shadow bg-blue-50`} role="region" aria-label='Casual Leave'>
                    <h3 className="text-lg">Earned Leave</h3>
                    <p className="text-2xl font-bold">{employeeLeaveBalance?.earnedLeave}</p>
                </div>
                <div className={`p-6 rounded-lg shadow bg-purple-50`} role="region" aria-label='Casual Leave'>
                    <h3 className="text-lg">Medical Leave</h3>
                    <p className="text-2xl font-bold">{employeeLeaveBalance?.medicalLeave}</p>
                </div>
                <div className={`p-6 rounded-lg shadow bg-purple-50`} role="region" aria-label='Casual Leave'>
                    <h3 className="text-lg">CompOff</h3>
                    <p className="text-2xl font-bold">{employeeLeaveBalance?.compOffLeave}</p>
                </div>
            </div>
            <div className="py-4 flex gap-2">
                <button
                    className={`p-3 rounded ${activeTab === "teamLogs" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
                    onClick={() => setActiveTab("teamLogs")}
                >
                    Attendance Logs
                </button>
                <button
                    className={`p-3 rounded ${activeTab === "attendance" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
                    onClick={() => setActiveTab("attendance")}
                >
                    Attendance Calendar
                </button>
            </div>

            {activeTab === "teamLogs" ? (<>
                <div className="p-6 bg-gray-50 min-h-screen">
                    {/* Filters Section */}
                    <div className="flex flex-col sm:flex-row items-center justify-start mb-4 gap-4">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    value={date.startDate}
                                    onChange={(newDate) => setDate({ ...date, startDate: newDate })}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={date.endDate}
                                    onChange={(newDate) => setDate({ ...date, endDate: newDate })}
                                />
                            </LocalizationProvider>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white shadow-md rounded overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {[
                                            "Employee Name",
                                            "Status",
                                            "Date",
                                            "Check In",
                                            "Check Out",
                                            "Total Hours",
                                            "Days",
                                            "Records",
                                        ].map((header, idx) => (
                                            <th
                                                key={idx}
                                                className="p-3 text-center font-semibold hidden sm:table-cell"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                        <th className="p-3 text-center font-semibold sm:hidden">
                                            Date
                                        </th>
                                        <th className="p-3 text-center font-semibold sm:hidden">
                                            Check In
                                        </th>
                                        <th className="p-3 text-center font-semibold sm:hidden">
                                            Check Out
                                        </th>
                                        <th className="p-3 text-center font-semibold sm:hidden">
                                            Days
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading
                                        ? Array(10)
                                            .fill(0)
                                            .map((_, idx) => <SkeletonLoader key={idx} />)
                                        : employees
                                            ?.filter((employee) =>
                                                employee.EmployeeName.toLowerCase().includes(
                                                    search.toLowerCase()
                                                )
                                            )
                                            ?.map((employee) => {
                                                const hours = Math.floor(employee.Duration / 60);
                                                const minutes = employee.Duration % 60;
                                                let dayType = "Off Day";
                                                if (
                                                    employee.Duration >= 4 * 60 + 30 &&
                                                    employee.Duration < 8 * 60 + 40
                                                )
                                                    dayType = "Half Day";
                                                else if (employee.Duration >= 8 * 60 + 40)
                                                    dayType = "Full Day";

                                                return (
                                                    <tr
                                                        key={employee.id}
                                                        className="border-t hover:bg-gray-100"
                                                    >
                                                        <td className="p-3 text-center hidden sm:table-cell">
                                                            {employee.EmployeeName}
                                                        </td>
                                                        <td className="p-3 text-center hidden sm:table-cell">
                                                            {employee.Status}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {employee.AttendanceDate?.split("T")[0]}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {employee.InTime.split(" ")[1] === "00:00:00"
                                                                ? "--"
                                                                : employee.InTime.split(" ")[1]}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {employee.OutTime.split(" ")[1] === "00:00:00"
                                                                ? "--"
                                                                : employee.OutTime.split(" ")[1]}
                                                        </td>
                                                        <td className="p-3 text-center hidden sm:table-cell">
                                                            {hours} Hours {minutes} Minutes
                                                        </td>
                                                        <td
                                                            className="p-3 text-center"
                                                            style={{
                                                                color:
                                                                    dayType === "Full Day"
                                                                        ? "green"
                                                                        : dayType === "Half Day"
                                                                            ? "#FF7E01"
                                                                            : employee.Status === "Absent"
                                                                                ? "red"
                                                                                : "blue",
                                                            }}
                                                        >
                                                            {dayType}
                                                        </td>
                                                        <td className="p-3 text-center hidden sm:table-cell">
                                                            <button
                                                                className={`p-2 rounded ${
                                                                    employee.Duration === 0 
                                                                        ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                                }`}
                                                                onClick={() => handleOpenModal(employee)}
                                                                disabled={employee.Duration === 0}
                                                            >
                                                                Punch Records
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center sm:justify-end mt-4 gap-4">
                        <button
                            onClick={handlePrevious}
                            className={`px-6 py-2 rounded-lg ${count === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            disabled={count === 1}
                        >
                            <FaLongArrowAltLeft />

                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <FaLongArrowAltRight />

                        </button>
                    </div>

                    {/* Modal */}
                    <Modal open={modalOpen} onClose={handleCloseModal}>
                        <Box className="bg-white rounded p-6 mx-auto my-10 max-w-xl">
                            <h2 className="text-lg font-semibold">Punch Records Logs</h2>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {selectedEmployee?.PunchRecords
                                    ?.trim()
                                    ?.replace(/,$/, "")
                                    ?.split(",")
                                    ?.map((item, index) => {
                                        const bgColor = item.includes("in(IN 1)") ? "#DEF7EC" : "#FDE8E8";
                                        const textColor = item.includes("in(IN 1)") ? "#014737" : "#C81E1E";
                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: "8px",
                                                    textAlign: "center",
                                                    backgroundColor: bgColor,
                                                    color: textColor,
                                                    borderRadius: "8px",
                                                    width: "9rem",
                                                }}
                                            >
                                                {item}
                                            </div>
                                        );
                                    })}
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Close
                                </button>
                            </div>
                        </Box>
                    </Modal>
                </div>
            </>)
                :
                (<Calendar employeeId={employeeTicket} userRole={userDataList} />)}
        </div>
    )
}

export default AllEmployeeAttendanceLogs