import React, { useEffect, useState } from 'react'
import anouncementavatar from "../assets/Icon/anouncement.jpg"
import { FaUsers, FaUserPlus, FaUserTimes, FaBriefcase, FaClock } from "react-icons/fa";
import AddEmployeeModal from './AddEmployeeModal';
import AddAnouncementModel from './AddAnouncementModel';
import { useDispatch, useSelector } from 'react-redux';
import { getAnnouncementDataAction, getEmployeeDataCountAction, getLeaveApproveRequestAction, putApprovedLeaveByManagerAction } from '../store/action/userDataAction';
import { MoreHorizontal } from 'lucide-react';
import EmployeeGraphData from './EmployeeGraphData';
function HrAdminDashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAnnouncement, setIsOpenAnnouncement] = useState(false);
    const { data } = useSelector((state) => state.announcementData);
    const { data: dataa } = useSelector((state) => state.managerLeaveApprove);
    const { data: countData } = useSelector((state) => state.exployeeDataCountCount);
    const managerApprove = dataa?.data;
    const announcementData = data?.data;
    console.log('managerApprove', managerApprove)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAnnouncementDataAction())
        dispatch(getLeaveApproveRequestAction());
        dispatch(getEmployeeDataCountAction())
    }, [])

    const handelChangeStatus = ({ value, id }) => {
        const status = value === "Approved" ? "Approved" : "Reject";
        dispatch(putApprovedLeaveByManagerAction({ status, id }));
    };
    console.log('12', countData)
    const stats = [
        {
            icon: <FaUsers />,
            value: countData?.data?.totalEmployeeCount,
            label: "Total Employee",
            change: "+5%",
            trend: "up",
            color: "bg-orange-100 text-orange-500",
            bgcolor: "bg-orange-500 text-orange-100",
        },
        {
            icon: <FaUserPlus />,
            value: countData?.data?.newEmployeeCount,
            label: "New Employee",
            change: "+3.2%",
            trend: "up",
            color: "bg-sky-100 text-sky-500",
            bgcolor: "bg-sky-500 text-sky-100",

        },
        {
            icon: <FaUserTimes />,
            value: countData?.data?.inHouseEmpCount,
            label: "In House Employee",
            change: "-2%",
            trend: "down",
            color: "bg-blue-100 text-blue-500",
            bgcolor: "bg-blue-500 text-blue-100",

        },
        {
            icon: <FaBriefcase />,
            value: countData?.data?.fieldEmpCount,
            label: "Field Employee Count",
            change: "+8%",
            trend: "up",
            bgcolor: "bg-green-500 text-green-100",
            color: "bg-green-100 text-green-500",
        },
        {
            icon: <FaClock />,
            value: countData?.data?.employeeOnNoticePeriod,
            label: "Employee Notice Period",
            change: "-8%",
            trend: "down",
            bgcolor: "bg-red-500 text-red-100",
            color: "bg-red-100 text-red-500",
        },
    ];

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const options = { day: "2-digit", month: "long" };
        return date.toLocaleDateString("en-GB", options);
    };
    return (
        <>
            <div className="">
                {/* Header */}
                <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                        <p className="text-sm text-gray-500">Mon, Aug 01, 2024 - Sep 01, 2024</p>
                    </div>
                    <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        + Add Employee
                    </button>
                </div>
                <AddEmployeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {stats.map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-xl shadow-sm ${item.color}`}>
                            <div className={`text-3xl mb-2 p-2 ${item.bgcolor} w-12 rounded-full items-center`}>
                                <span>
                                    {item.icon}
                                </span>
                            </div>
                            <div className="text-3xl mb-2 text-black font-bold">{item.value}</div>
                            <div className="text-sm font-bold text-gray-700">{item.label}</div>
                            <div
                                className={`text-xs ${item.trend === "up" ? "text-green-600" : "text-red-500"
                                    } mt-1`}
                            >
                                {item.change} Last Month
                            </div>
                        </div>
                    ))}

                    {/* Announcement Card */}
                    <div
                        className="col-span-1 md:col-span-2 xl:col-span-1 p-4 border rounded-xl flex flex-col justify-between bg-white shadow-md"
                        style={{
                            backgroundImage: `url(${anouncementavatar})`,
                            backgroundSize: "cover",
                            backgroundPosition: "60px 10px",
                        }}
                    >
                        <div>
                            <h4 className="text-md font-bold text-gray-800">Create Announcement</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Make an announcement to your employee
                            </p>
                        </div>
                        <div className="mt-4">
                            <button onClick={() => setIsOpenAnnouncement(true)} className="border border-blue-600 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium">
                                Create Now
                            </button>
                        </div>
                    </div>
                    <AddAnouncementModel isOpenAnnouncement={isOpenAnnouncement} onClose={() => setIsOpenAnnouncement(false)} />
                </div>
                {/* Employee Graph Chart Data */}
                <EmployeeGraphData />
                {/* job and attendance details  */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 py-6">
                    {/* Job Application */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Announcement's of 2025</h3>
                            {/* <a href="#" className="text-sm text-blue-600 hover:underline">
                                View All
                            </a> */}
                        </div>
                        <div className="max-w-4xl mx-auto p-6 bg-white font-sans">
                            {announcementData?.map((note, index) => (
                                <div key={index} className="flex gap-6 border-b pb-6 mb-6">
                                    <div className="w-16 text-right">
                                        <p className="text-sm font-semibold text-gray-500">
                                            <img src={note?.imageUrl} />
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {note.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{note.description}</p>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {formatDate(note.dateTime)}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-400">
                                            {note.dateTime.split('T')[1]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Employee's Leave */}
                    <div className="bg-white p-6 rounded-xl shadow-md overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Employee's Leave</h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Name ⬍</th>
                                    <th className="px-4 py-2">Department ⬍</th>
                                    <th className="px-4 py-2">Days ⬍</th>
                                    <th className="px-4 py-2">Date ⬍</th>
                                    <th className="px-4 py-2">Status ⬍</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managerApprove?.slice(0, 4)?.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-4 py-4 font-medium whitespace-nowrap truncate max-w-[120px]" title={item.employeeInfo.employeeName}>{item.employeeInfo.employeeName}</td>
                                        <td className="px-4 py-4 whitespace-nowrap truncate max-w-[100px]" title={item.employeeInfo.designation}>{item.employeeInfo.designation}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{item.totalDays}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{item.dateTime.split(' ')[0]}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.status === "Approved" ? (
                                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <select
                                                    defaultValue=""
                                                    onChange={(e) =>
                                                        handelChangeStatus({
                                                            value: e.target.value,
                                                            id: item._id,
                                                        })
                                                    }
                                                    className="border px-2 py-1 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                >
                                                    <option value="" disabled>
                                                        Select
                                                    </option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HrAdminDashboard