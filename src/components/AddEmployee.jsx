import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postApplyLeaveByEmployee, postMedicalFileAction, getAttendenceLogsOfEmploye } from "../store/action/userDataAction";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaClock } from "react-icons/fa";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const CreateProjectModal = ({ tittleBtn, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data } = useSelector((state) => state.userData);
    const { loading: uploadLoading, data: medicalReport } = useSelector((state) => state.medicalFileReducer);
    const navigate = useNavigate();
    const { data: dataa, error } = useSelector((state) => state.leaveApplyByEmployee)
    const { data: attendanceData, loading: attendanceLoading } = useSelector((state) => state.attendanceLogs);

    // Reset function to clear all form data - defined before useEffect hooks
    const resetForm = () => {
        setLeaveData({
            leaveType: "",
            startDate: "",
            endDate: "",
            selectTime: '',
            reason: "",
            totalDays: 0,
            compOffDayType: "",
        });
        setLeaveTypeError(null);
        setTotalDayError(null);
        setReasonError(null);
        setFileError(null);
        setCompOffDayTypeError(null);
        setLeaveError({
            medical: null,
            casual: null,
            earned: null,
        });
        setFile(null);
        setCalendarOpen(false);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setIsLeaveTypeDropdownOpen(false);
    };

    useEffect(() => {
        // Remove the problematic toast.dismiss() call that's causing the runtime error
        // toast.dismiss()
    }, [])

    useEffect(() => {
        if (error && typeof error === 'string' && error.length > 0) {
            // Provide more user-friendly error messages
            let errorMessage = error;
            
            if (error.includes('Outreached pending earnedLeave balance')) {
                errorMessage = 'Insufficient earned leave balance. Please check your available leave balance.';
            } else if (error.includes('balance')) {
                errorMessage = 'Insufficient leave balance. Please check your available leave balance before applying.';
            }
            
            // Use a try-catch to prevent toast errors from crashing the app
            try {
                toast.error(errorMessage, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
        }
    }, [error])
    useEffect(() => {
        // Remove the problematic toast.dismiss() call that's causing the runtime error
        // toast.dismiss()
    }, [])
    useEffect(() => {
        if (error === "jwt expired") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("employeId");
            localStorage.removeItem("selectedTag");
            navigate("/");
            return;
        }
    }, [error])
    useEffect(() => {
        if (dataa && dataa?.message) {
            // Use a try-catch to prevent toast errors from crashing the app
            try {
                toast.success(dataa.message, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
            
            // Reset form after successful submission
            setTimeout(() => {
                resetForm();
                setIsOpen(false);
            }, 1000);
        }
    }, [dataa])

    useEffect(() => {
        if (medicalReport && medicalReport.location) {  // ✅ Ensure medicalReport is defined
            // Use a try-catch to prevent toast errors from crashing the app
            try {
                toast.success('File Upload Successfully', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
        }
    }, [medicalReport]);

    // Handle dropdown click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target)) {
                setIsLeaveTypeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const managerId = data?.data?.managerId;
    const employeeType = data?.data?.employmentType;
    const employeeId = localStorage.getItem('employeId');
    const leaveBalance = data?.data?.leaveBalance;
    console.log('leaveBalance', leaveBalance)
    const [leaveTypeError, setLeaveTypeError] = useState(null);
    const [totalDayError, setTotalDayError] = useState(null);
    const [reasonError, setReasonError] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [compOffDayTypeError, setCompOffDayTypeError] = useState(null);
    const [leaveError, setLeaveError] = useState({
        medical: null,
        casual: null,
        earned: null,
    })

    const [leaveData, setLeaveData] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        selectTime: '',
        reason: "",
        totalDays: 0, // New field for total days
        compOffDayType: "", // New field for comp-off day type
    });

    // Date range picker state
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

    // Custom dropdown state
    const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
    const leaveTypeDropdownRef = useRef(null);

    // Attendance date range navigation state
    const [currentAttendanceDate, setCurrentAttendanceDate] = useState(dayjs());
    const [attendanceDateRange, setAttendanceDateRange] = useState([]);
    const [currentAttendanceIndex, setCurrentAttendanceIndex] = useState(0);

    const openModal = () => {
        setIsOpen(true);
        // Fetch attendance data when modal opens
        const employeeId = localStorage.getItem("employeId");
        if (employeeId) {
            // If a date range is selected, we might need to fetch data for that range
            // For now, we'll fetch current data and let the navigation handle the rest
            dispatch(getAttendenceLogsOfEmploye(employeeId));
        }
    };
    const closeModal = () => {
        setIsOpen(false);
        resetForm(); // Reset form when modal is closed
    };
    const dispatch = useDispatch();

    const [file, setFile] = useState(null);
    const handelChangeFile = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileError('')
        }
    };

    useEffect(() => {
        const startDate = new Date(leaveData.startDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize to midnight for accurate comparison

        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1); // Yesterday

        const thirtyDaysAgo = new Date(currentDate);
        thirtyDaysAgo.setDate(currentDate.getDate() - 30); // 30 days ago

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const minEarnedLeaveDate = new Date(currentDate);
        minEarnedLeaveDate.setDate(currentDate.getDate() - 14); // 14 days before today

        const maxEarnedLeaveDate = new Date(currentDate);
        maxEarnedLeaveDate.setDate(currentDate.getDate() + 31); // 31 days after today

        if (leaveData?.leaveType === '' || leaveData?.startDate === '') {
            setLeaveError((prevErrors) => ({
                ...prevErrors,
                medical: '', // Update the `medical` field
            }));
            return;
        }


        if (leaveData?.leaveType === '' || leaveData?.startDate === '') {
            setLeaveError((prevErrors) => ({
                ...prevErrors,
                medical: '', // Update the `medical` field
            }));
            return;
        }

        switch (leaveData.leaveType) {
            case "casualLeave":
                if (leaveData.selectTime === 'firstHalf') {
                    setLeaveData({ ...leaveData, totalDays: 0.5 })
                    return;
                }
                if (leaveData.selectTime === 'secondHalf') {
                    setLeaveData({ ...leaveData, totalDays: 0.5 })
                    return;
                }
                if (leaveData.selectTime === 'fullDay') {
                    setLeaveData({ ...leaveData, totalDays: 1 })
                    return;
                }
                const currentMonth = currentDate.getMonth();
                if (startDate.getMonth() !== currentMonth) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        casual: 'Casual leave can only be applied in the current month.', // Update the `casual` field
                    }));
                    return
                }
                const sevenDaysFromNow = new Date(currentDate);
                sevenDaysFromNow.setDate(currentDate.getDate() + 7);
                if (startDate < currentDate || startDate > sevenDaysFromNow) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        casual: 'Casual leave can only be applied for dates between today and the next 7 days.', // Update the `casual` field
                    }));
                    return
                }
                // Clear errors if validation passes
                setLeaveError((prevErrors) => ({
                    ...prevErrors,
                    casual: '', // Update the `casual` field
                }));
                break;

            case "medicalLeave":
                if (!(startDate <= yesterday && startDate >= thirtyDaysAgo)) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        medical: 'Medical leave can only be applied for dates between yesterday and the last 30 days.',
                    }));
                    return;
                }

                if (leaveData.totalDays < 1 || leaveData.totalDays > 7) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        medical: 'Medical leave must be applied for a minimum of 1 day and a maximum of 7 days.',
                    }));
                    return;
                }

                if (!file) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        medical: 'Please attach a medical file.',
                    }));
                    return;
                }

                // Clear errors if validation passes
                setLeaveError((prevErrors) => ({
                    ...prevErrors,
                    medical: null,
                }));
                break;

            case "optionalLeave":
                break;
            case "earnedLeave":
                // const maxEarnedLeaveDate = new Date(currentDate);
                // maxEarnedLeaveDate.setDate(currentDate.getDate() + 31); // 14 days after today
                if (leaveData.selectTime === 'firstHalf') {
                    setLeaveData({ ...leaveData, totalDays: 0.5 })
                    return;
                }
                if (leaveData.selectTime === 'secondHalf') {
                    setLeaveData({ ...leaveData, totalDays: 0.5 })
                    return;
                }
                if (leaveData.selectTime === 'fullDay') {
                    setLeaveData({ ...leaveData, totalDays: 1 })
                    return;
                }
                // Ensure start date is within the current month
                if (startDate < firstDayOfMonth || startDate > lastDayOfMonth) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        earned: 'Earned leave can only be applied within the current month.',
                    }));
                    return;
                }

                // Ensure the start date is within the allowed range
                if (startDate < minEarnedLeaveDate || startDate > maxEarnedLeaveDate) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        earned: 'Earned leave can only be applied for dates within 14 days before or after today.',
                    }));
                    return;
                }

                // Ensure the leave duration is between 1 and 14 days
                if (leaveData.totalDays < 1 || leaveData.totalDays > 14) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        earned: 'Earned leave must be applied for a minimum of 1 day and a maximum of 14 days.',
                    }));
                    return;
                }

                // Clear errors if validation passes
                setLeaveError((prevErrors) => ({
                    ...prevErrors,
                    earned: null,
                }));
                break;

            case "compOffLeave":
                // Now these variables are defined outside and accessible here
                if (leaveData.selectTime === 'firstHalf') {
                    setLeaveData({ ...leaveData, totalDays: 0.5 });
                    return;
                }
                if (leaveData.selectTime === 'secondHalf') {
                    setLeaveData({ ...leaveData, totalDays: 0.5 });
                    return;
                }
                if (leaveData.selectTime === 'fullDay') {
                    setLeaveData({ ...leaveData, totalDays: 1 });
                    return;
                }

                if (startDate < firstDayOfMonth || startDate > lastDayOfMonth) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        earned: 'Earned leave can only be applied within the current month.',
                    }));
                    return;
                }

                if (startDate < minEarnedLeaveDate || startDate > maxEarnedLeaveDate) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        earned: 'Earned leave can only be applied for dates within 14 days before or after today.',
                    }));
                    return;
                }

                if (leaveData.totalDays < 1 || leaveData.totalDays > 14) {
                    setLeaveError((prevErrors) => ({
                        ...prevErrors,
                        earned: 'Earned leave must be applied for a minimum of 1 day and a maximum of 14 days.',
                    }));
                    return;
                }

                setLeaveError((prevErrors) => ({
                    ...prevErrors,
                    earned: null,
                }));
                break;

            default:
                alert('Invalid leave type selected.');
                return;
        }
    }, [leaveData.totalDays, leaveData.leaveType, leaveData.selectTime]);

    // Add useEffect to recalculate totalDays when startDate or endDate changes
    useEffect(() => {
        if (leaveData.startDate || leaveData.endDate) {
            const startDate = leaveData.startDate ? new Date(leaveData.startDate + 'T00:00:00') : null;
            const endDate = leaveData.endDate ? new Date(leaveData.endDate + 'T00:00:00') : null;

            let calculatedTotalDays = 0;
            if (startDate) {
                if (!endDate || endDate < startDate) {
                    // If only start date is selected or end date is invalid, total days is 1
                    calculatedTotalDays = 1;
                } else if (endDate >= startDate) {
                    // If both start and end dates are valid, calculate total days
                    const timeDiff = endDate - startDate;
                    calculatedTotalDays = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Include start date and round to avoid floating point issues
                }
            }

            // Only update if the calculated value is different from current totalDays
            if (Math.abs(calculatedTotalDays - leaveData.totalDays) > 0.01) {
                setLeaveData(prevData => ({
                    ...prevData,
                    totalDays: calculatedTotalDays
                }));
            }
        }
    }, [leaveData.startDate, leaveData.endDate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeaveData((prevData) => {
            const updatedData = {
                ...prevData,
                [name]: value,
            };
            setLeaveTypeError('')
            setTotalDayError('')
            setReasonError('')
            if (name === "startDate" || name === "endDate") {
                const startDate = updatedData.startDate ? new Date(updatedData.startDate + 'T00:00:00') : null;
                const endDate = updatedData.endDate ? new Date(updatedData.endDate + 'T00:00:00') : null;

                if (startDate && (!endDate || endDate < startDate)) {
                    // If only start date is selected or end date is invalid, total days is 1
                    updatedData.totalDays = 1;
                } else if (startDate && endDate && endDate >= startDate) {
                    // If both start and end dates are valid, calculate total days
                    const timeDiff = endDate - startDate;
                    updatedData.totalDays = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Include start date and round to avoid floating point issues
                } else {
                    // Default case for total days
                    updatedData.totalDays = 0;
                }
            }

            return updatedData;
        });
    };

    const getMinDateForLeaveType = () => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize to midnight

        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1); // Tomorrow

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(currentDate.getDate() - 14); // 30 days in the past

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const minEarnedLeaveDate = new Date(currentDate);
        minEarnedLeaveDate.setDate(currentDate.getDate() - 31);

        switch (leaveData.leaveType) {
            case "casualLeave":
                return formatDate(minEarnedLeaveDate > firstDayOfMonth ? minEarnedLeaveDate : firstDayOfMonth); // Can apply from today
            case "medicalLeave":
                return formatDate(minEarnedLeaveDate > firstDayOfMonth ? minEarnedLeaveDate : firstDayOfMonth); // Allow from 31 days ago of current month
            case "earnedLeave":
                return formatDate(minEarnedLeaveDate > firstDayOfMonth ? minEarnedLeaveDate : firstDayOfMonth); // Allow from 31 days ago of current month 
            case "optionalLeave":
                return formatDate(minEarnedLeaveDate > firstDayOfMonth ? minEarnedLeaveDate : firstDayOfMonth); // Allow from 31 days ago of current month 
            case "compOffLeave":
                return formatDate(minEarnedLeaveDate > firstDayOfMonth ? minEarnedLeaveDate : firstDayOfMonth); // Allow from 31 days ago of current month 

            default:
                return formatDate(currentDate); // Default to today
        }
    };

    const getMaxDateForLeaveType = () => {
        // current day code
        const currentDate = new Date();
        const maxDate = new Date(currentDate);
        // yesterday  code 
        const yesterday = new Date();
        yesterday.setDate(currentDate.getDate() - 1); // One day before today

        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const maxEarnedLeaveDate = new Date(currentDate);
        maxEarnedLeaveDate.setDate(currentDate.getDate() + 14);

        switch (leaveData.leaveType) {
            case "casualLeave":
                const casualMaxDate = new Date(currentDate);
                casualMaxDate.setDate(currentDate.getDate() + 7); // Allow within the next 7 days
                return formatDate(casualMaxDate);
            case "optionalLeave":
                return formatDate(maxDate);
            case "medicalLeave":
                return formatDate(yesterday); // Only up to yesterday
            case "earnedLeave":
                return formatDate(maxEarnedLeaveDate < lastDayOfMonth ? maxEarnedLeaveDate : lastDayOfMonth);
            default:
                return null; // No restrictions by default
        }
    };

    // Utility function to format date to "YYYY-MM-DD"
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const startDate = new Date(leaveData.startDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize to midnight
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1); // Yesterday
        const thirtyDaysAgo = new Date(currentDate);
        thirtyDaysAgo.setDate(currentDate.getDate() - 30); // 30 days ago

        const updatedErrors = { ...leaveError };

        if (!leaveData.leaveType) {
            setLeaveTypeError('Please select a leave type.');
            return;
        }

        // Validate comp-off day type selection
        if (leaveData.leaveType === 'compOffLeave' && !leaveData.compOffDayType) {
            setCompOffDayTypeError('Please select a duration (First Half, Second Half, or Full Day).');
            return;
        }

        if (leaveData.totalDays < 0.5) {
            setTotalDayError('You must apply for at least 1 day of leave.');
            return;
        }

        if (leaveData?.leaveType === 'medicalLeave' && !file) {
            setFileError('Please attach documents !!');
            return;
        }

        if (!leaveData?.reason) {
            setReasonError('Reason cannot be empty.');
            return;
        }

        // Check leave balance before submitting
        const requestedDays = parseFloat(leaveData.totalDays);
        const availableBalance = parseFloat(leaveBalance?.[leaveData.leaveType] || 0);
        
        if (requestedDays > availableBalance) {
            try {
                toast.error(`Insufficient leave balance. You have ${availableBalance} days available but requesting ${requestedDays} days.`);
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
            return;
        }

        // Additional balance check for specific leave types
        if (leaveData.leaveType === 'earnedLeave' && availableBalance <= 0) {
            try {
                toast.error('You have no earned leave balance available.');
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
            return;
        }

        if (leaveData.leaveType === 'casualLeave' && availableBalance <= 0) {
            try {
                toast.error('You have no casual leave balance available.');
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
            return;
        }

        if (leaveData.leaveType === 'compOffLeave' && availableBalance <= 0) {
            try {
                toast.error('You have no comp-off leave balance available.');
            } catch (toastError) {
                console.error('Toast error:', toastError);
            }
            return;
        }

        setLeaveError({
            medical: null,
            casual: null,
            earned: null,
        });

        dispatch(
            postApplyLeaveByEmployee({
                leaveType: leaveData?.leaveType,
                leaveStartDate: leaveData?.startDate,
                leaveEndDate: leaveData?.endDate,
                totalDays: leaveData?.totalDays,
                reason: leaveData?.reason,
                approvedBy: managerId,
                employeId: employeeId,
                shift: leaveData?.selectTime,
                location: medicalReport?.location,
            })
        );

    };
    const handelUploadPrescription = () => {
        const formData = new FormData();
        formData.append("file", file);
        dispatch(postMedicalFileAction(formData));
    }
    const convertToDateFormat = () => {
        // Create a new Date object from the input string
        const date = new Date();

        // Format to "YYYY-MM-DD" using toISOString and split
        const formattedDate = date.toISOString().split("T")[0];

        return formattedDate;
    };

    // Attendance summary calculation functions
    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        // Extract time from format like "09:13 (IN 1)" or "18:31 (OUT 1)"
        const timeMatch = timeString.match(/(\d{2}:\d{2})/);
        return timeMatch ? timeMatch[1] : timeString;
    };

    // Deduplicate and clean punch records
    const cleanPunchRecords = (punchRecords) => {
        if (!punchRecords) return [];
        
        // Split and clean punch records
        const punches = punchRecords
            .split(",")
            .map(p => p.trim())
            .filter(p => p.length > 0); // Remove empty entries
        
        // Remove duplicates while preserving order
        const uniquePunches = [];
        const seen = new Set();
        
        punches.forEach(punch => {
            // Normalize the punch record for comparison
            const normalized = punch.replace(/\s+/g, ' ').trim();
            if (!seen.has(normalized)) {
                seen.add(normalized);
                uniquePunches.push(punch);
            }
        });
        
        return uniquePunches;
    };

    const calculateTotalHours = (punchRecords) => {
        if (!punchRecords) return "00:00";
        
        const punches = cleanPunchRecords(punchRecords);
        const inTimes = punches.filter(p => p.includes("(IN")).map(p => formatTime(p));
        const outTimes = punches.filter(p => p.includes("(OUT")).map(p => formatTime(p));
        
        if (inTimes.length === 0 || outTimes.length === 0) return "00:00";
        
        // Calculate total hours from first in and last out
        const firstIn = inTimes[0];
        const lastOut = outTimes[outTimes.length - 1];
        
        if (!firstIn || !lastOut) return "00:00";
        
        const inMinutes = parseInt(firstIn.split(':')[0]) * 60 + parseInt(firstIn.split(':')[1]);
        const outMinutes = parseInt(lastOut.split(':')[0]) * 60 + parseInt(lastOut.split(':')[1]);
        
        const totalMinutes = outMinutes - inMinutes;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Calendar functions
    const openCalendar = () => {
        setCalendarOpen(true);
        setSelectedStartDate(leaveData.startDate ? dayjs(leaveData.startDate) : null);
        setSelectedEndDate(leaveData.endDate ? dayjs(leaveData.endDate) : null);
    };

    const closeCalendar = () => {
        setCalendarOpen(false);
    };

    const applyDateRange = () => {
        const newStartDate = selectedStartDate ? selectedStartDate.format('YYYY-MM-DD') : '';
        const newEndDate = selectedEndDate ? selectedEndDate.format('YYYY-MM-DD') : '';
        
        // Calculate total days when applying date range
        let calculatedTotalDays = 0;
        if (newStartDate) {
            const startDate = new Date(newStartDate + 'T00:00:00');
            const endDate = newEndDate ? new Date(newEndDate + 'T00:00:00') : null;
            
            if (!endDate || endDate < startDate) {
                // If only start date is selected or end date is invalid, total days is 1
                calculatedTotalDays = 1;
            } else if (endDate >= startDate) {
                // If both start and end dates are valid, calculate total days
                const timeDiff = endDate - startDate;
                calculatedTotalDays = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Include start date and round to avoid floating point issues
            }
        }
        
        setLeaveData({
            ...leaveData,
            startDate: newStartDate,
            endDate: newEndDate,
            totalDays: calculatedTotalDays
        });
        setCalendarOpen(false);
    };

    const selectDate = (selectedDate) => {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            // Start new selection
            setSelectedStartDate(selectedDate);
            setSelectedEndDate(null);
        } else {
            // Complete the range
            if (selectedDate.isBefore(selectedStartDate)) {
                setSelectedEndDate(selectedStartDate);
                setSelectedStartDate(selectedDate);
            } else {
                setSelectedEndDate(selectedDate);
            }
        }
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(currentMonth.subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(currentMonth.add(1, 'month'));
    };

    const isDateInRange = (date) => {
        if (!selectedStartDate) return false;
        if (!selectedEndDate) return date.isSame(selectedStartDate, 'day');
        return date.isSameOrAfter(selectedStartDate, 'day') && date.isSameOrBefore(selectedEndDate, 'day');
    };

    const isDateSelected = (date) => {
        return date.isSame(selectedStartDate, 'day') || date.isSame(selectedEndDate, 'day');
    };

    const getDaysInMonth = () => {
        const startOfMonth = currentMonth.startOf('month');
        const endOfMonth = currentMonth.endOf('month');
        const startOfWeek = startOfMonth.startOf('week');
        const endOfWeek = endOfMonth.endOf('week');
        
        const days = [];
        let day = startOfWeek;
        
        while (day.isBefore(endOfWeek) || day.isSame(endOfWeek, 'day')) {
            days.push(day);
            day = day.add(1, 'day');
        }
        
        return days;
    };

    // Attendance date range navigation functions
    const navigateAttendanceDate = (direction) => {
        if (direction === 'next') {
            setCurrentAttendanceIndex(prev => Math.min(prev + 1, attendanceDateRange.length - 1));
        } else {
            setCurrentAttendanceIndex(prev => Math.max(prev - 1, 0));
        }
    };

    const getCurrentAttendanceData = () => {
        if (!attendanceData?.data || attendanceData.data.length === 0) return null;
        
        if (attendanceDateRange.length === 0) {
            // If no date range is selected, show today's data
            return attendanceData.data[0];
        }
        
        const currentDate = attendanceDateRange[currentAttendanceIndex];
        if (!currentDate) return attendanceData.data[0];
        
        // Find attendance data for the current date
        const foundData = attendanceData.data.find(record => 
            record.AttendanceDate?.split("T")[0] === currentDate.format("YYYY-MM-DD")
        );
        
        // Return found data or null if no data exists for this date
        return foundData || null;
    };

    const updateAttendanceDateRange = () => {
        if (selectedStartDate && selectedEndDate) {
            const range = [];
            let current = selectedStartDate.clone();
            while (current.isSameOrBefore(selectedEndDate)) {
                range.push(current.clone());
                current = current.add(1, 'day');
            }
            setAttendanceDateRange(range);
            setCurrentAttendanceIndex(0);
        } else {
            setAttendanceDateRange([]);
            setCurrentAttendanceIndex(0);
        }
    };

    // Update attendance date range when date selection changes
    useEffect(() => {
        updateAttendanceDateRange();
    }, [selectedStartDate, selectedEndDate]);

    return (
        <div>
            <ToastContainer />
            {/* Button to Open Modal */}
            <button
                onClick={openModal}
                className="px-4 py-2 mb-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
                {tittleBtn}
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Modal Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={closeModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10 p-6">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-10 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <RxCross2 size={20} />
                        </button>

                        {/* Modal Header */}
                        <h2 className="text-xl font-semibold text-gray-800">
                            Apply New Leave
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Only applicable if you have pending leave balance.
                        </p>

                        {/* Attendance Summary Section */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <FaClock className="w-4 h-4 text-blue-600" />
                                    {attendanceDateRange.length > 0 ? 'Date Range Attendance' : "Today's Attendance Summary"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {attendanceDateRange.length > 0 && (
                                        <>
                                            <button
                                                onClick={() => navigateAttendanceDate('prev')}
                                                disabled={currentAttendanceIndex === 0}
                                                className={`p-1 rounded-full transition-colors duration-200 ${
                                                    currentAttendanceIndex === 0 
                                                        ? 'text-gray-300 cursor-not-allowed' 
                                                        : 'text-blue-600 hover:bg-blue-100'
                                                }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {currentAttendanceIndex + 1} of {attendanceDateRange.length}
                                            </span>
                                            <button
                                                onClick={() => navigateAttendanceDate('next')}
                                                disabled={currentAttendanceIndex === attendanceDateRange.length - 1}
                                                className={`p-1 rounded-full transition-colors duration-200 ${
                                                    currentAttendanceIndex === attendanceDateRange.length - 1 
                                                        ? 'text-gray-300 cursor-not-allowed' 
                                                        : 'text-blue-600 hover:bg-blue-100'
                                                }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {getCurrentAttendanceData()?.AttendanceDate?.split("T")[0] || 
                                         (attendanceDateRange.length > 0 ? 
                                          attendanceDateRange[currentAttendanceIndex]?.format("YYYY-MM-DD") : 
                                          "Today")}
                                    </span>
                                </div>
                            </div>
                            
                            {attendanceLoading ? (
                                <div className="animate-pulse">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                                    </div>
                                </div>
                            ) : attendanceData?.data && attendanceData.data.length > 0 && getCurrentAttendanceData() ? (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Total Hours</p>
                                        <p className="text-sm font-semibold text-blue-800">
                                            {calculateTotalHours(getCurrentAttendanceData()?.PunchRecords)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                        <p className="text-xs text-green-600 font-medium mb-1">First In</p>
                                        <p className="text-sm font-semibold text-green-800">
                                            {getCurrentAttendanceData()?.InTime ? formatTime(getCurrentAttendanceData().InTime) : '--:--'}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                        <p className="text-xs text-red-600 font-medium mb-1">Last Out</p>
                                        <p className="text-sm font-semibold text-red-800">
                                            {getCurrentAttendanceData()?.OutTime ? formatTime(getCurrentAttendanceData().OutTime) : '--:--'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <FaClock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">
                                        {attendanceDateRange.length > 0 
                                            ? `No attendance data available for ${attendanceDateRange[currentAttendanceIndex]?.format("MMM DD, YYYY")}`
                                            : "No attendance data available for today"
                                        }
                                    </p>
                                </div>
                            )}
                            
                            {getCurrentAttendanceData()?.AttendanceStatus && (
                                <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-600 font-medium mb-1">Status</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {getCurrentAttendanceData().AttendanceStatus}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                            {/* Leave Type */}
                            <div>
                                <label
                                    htmlFor="leaveType"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Leave Type<span className="text-red-500">*</span>
                                </label>
                                <div className="relative" ref={leaveTypeDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-gradient-to-r from-gray-50 to-white hover:border-gray-300 shadow-sm flex items-center justify-between"
                                    >
                                        <span className={leaveData.leaveType ? "text-gray-900" : "text-gray-500"}>
                                            {leaveData.leaveType ? 
                                                (leaveData.leaveType === "earnedLeave" ? "Earned Leave" :
                                                 leaveData.leaveType === "casualLeave" ? "Casual Leave" :
                                                 leaveData.leaveType === "medicalLeave" ? "Medical Leave" :
                                                 leaveData.leaveType === "paternityLeave" ? "Paternity Leave" :
                                                 leaveData.leaveType === "maternityLeave" ? "Maternity Leave" :
                                                 leaveData.leaveType === "compOffLeave" ? "Comp Off" :
                                                 leaveData.leaveType === "optionalLeave" ? "Optional Leave" :
                                                 leaveData.leaveType) : 
                                                "Choose your leave type"
                                            }
                                        </span>
                                        <div className="flex items-center">
                                            {isLeaveTypeDropdownOpen ? 
                                                <FiChevronUp className="w-5 h-5 text-gray-400 transition-transform duration-200" /> : 
                                                <FiChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                                            }
                                        </div>
                                    </button>

                                    {/* Custom Dropdown Menu */}
                                    <div className={`absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden transition-all duration-300 ease-in-out ${
                                        isLeaveTypeDropdownOpen 
                                            ? 'opacity-100 scale-100 translate-y-0' 
                                            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                    }`}>
                                        <div className="max-h-60 overflow-y-auto">
                                    {/* Show Earned Leave only if in notice period */}
                                    {(data?.data?.isNotice === true) && (
                                                leaveBalance?.earnedLeave === '0' ? (
                                                    <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                        Earned Leave - No balance
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLeaveData({ ...leaveData, leaveType: "earnedLeave" });
                                                            setIsLeaveTypeDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                    >
                                                        <div className="font-medium text-gray-900">Earned Leave</div>
                                                        <div className="text-xs text-gray-500">{leaveBalance?.earnedLeave} days remaining</div>
                                                    </button>
                                                )
                                    )}

                                    {/* Show Casual Leave only if in probation period */}
                                    {(data?.data?.isProbation === true) && (
                                                leaveBalance?.casualLeave === '0' ? (
                                                    <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                        Casual Leave - No balance
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLeaveData({ ...leaveData, leaveType: "casualLeave" });
                                                            setIsLeaveTypeDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                    >
                                                        <div className="font-medium text-gray-900">Casual Leave</div>
                                                        <div className="text-xs text-gray-500">{leaveBalance?.casualLeave} days remaining</div>
                                                    </button>
                                                )
                                            )}
                                            
                                    {(data?.data?.isProbation === true) && (
                                                leaveBalance?.compOffLeave === '0' ? (
                                                    <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                        Comp Off - No balance
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLeaveData({ ...leaveData, leaveType: "compOffLeave" });
                                                            setIsLeaveTypeDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                    >
                                                        <div className="font-medium text-gray-900">Comp Off</div>
                                                        <div className="text-xs text-gray-500">{leaveBalance?.compOffLeave} days remaining</div>
                                                    </button>
                                                )
                                            )}

                                    {/* Show all leave types if employee is permanent */}
                                    {(data?.data?.isWorking === true) && (
                                        <>
                                                    {leaveBalance?.earnedLeave === '0' ? (
                                                        <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                            Earned Leave - No balance
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLeaveData({ ...leaveData, leaveType: "earnedLeave" });
                                                                setIsLeaveTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                        >
                                                            <div className="font-medium text-gray-900">Earned Leave</div>
                                                            <div className="text-xs text-gray-500">{leaveBalance?.earnedLeave} days remaining</div>
                                                        </button>
                                                    )}
                                                    
                                                    {leaveBalance?.compOffLeave === '0' ? (
                                                        <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                            Comp Off - No balance
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLeaveData({ ...leaveData, leaveType: "compOffLeave" });
                                                                setIsLeaveTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                        >
                                                            <div className="font-medium text-gray-900">Comp Off</div>
                                                            <div className="text-xs text-gray-500">{leaveBalance?.compOffLeave} days remaining</div>
                                                        </button>
                                                    )}
                                                    
                                                    {leaveBalance?.medicalLeave === '0' ? (
                                                        <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                            Medical Leave - No balance
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLeaveData({ ...leaveData, leaveType: "medicalLeave" });
                                                                setIsLeaveTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                        >
                                                            <div className="font-medium text-gray-900">Medical Leave</div>
                                                            <div className="text-xs text-gray-500">{leaveBalance?.medicalLeave} days remaining</div>
                                                        </button>
                                                    )}
                                                    
                                                    {leaveBalance?.paternityLeave === '0' ? (
                                                        <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                            Paternity Leave - No balance
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLeaveData({ ...leaveData, leaveType: "paternityLeave" });
                                                                setIsLeaveTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                        >
                                                            <div className="font-medium text-gray-900">Paternity Leave</div>
                                                            <div className="text-xs text-gray-500">{leaveBalance?.paternityLeave} days remaining</div>
                                                        </button>
                                                    )}
                                                    
                                                    {leaveBalance?.maternityLeave === '0' ? (
                                                        <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                            Maternity Leave - No balance
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLeaveData({ ...leaveData, leaveType: "maternityLeave" });
                                                                setIsLeaveTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                        >
                                                            <div className="font-medium text-gray-900">Maternity Leave</div>
                                                            <div className="text-xs text-gray-500">{leaveBalance?.maternityLeave} days remaining</div>
                                                        </button>
                                                    )}
                                                    
                                                    {leaveBalance?.casualLeave === '0' ? (
                                                        <div className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm">
                                                            Casual Leave - No balance
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLeaveData({ ...leaveData, leaveType: "casualLeave" });
                                                                setIsLeaveTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                        >
                                                            <div className="font-medium text-gray-900">Casual Leave</div>
                                                            <div className="text-xs text-gray-500">{leaveBalance?.casualLeave} days remaining</div>
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLeaveData({ ...leaveData, leaveType: "optionalLeave" });
                                                            setIsLeaveTypeDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 text-sm"
                                                    >
                                                        <div className="font-medium text-gray-900">Optional Leave</div>
                                                        <div className="text-xs text-gray-500">No balance limit</div>
                                                    </button>
                                        </>
                                    )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-red-600 mt-2">{leaveTypeError ? leaveTypeError : ''}</p>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Range
                                    </label>
                                <button
                                    type="button"
                                    onClick={openCalendar}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gradient-to-r from-gray-50 to-white shadow-sm flex items-center justify-between"
                                >
                                    <span className={leaveData.startDate && leaveData.endDate ? "text-gray-900" : "text-gray-500"}>
                                        {leaveData.startDate && leaveData.endDate 
                                            ? `${dayjs(leaveData.startDate).format('MMM DD')} - ${dayjs(leaveData.endDate).format('MMM DD, YYYY')}`
                                            : leaveData.startDate 
                                            ? `${dayjs(leaveData.startDate).format('MMM DD, YYYY')} - Select end date`
                                            : 'Select Date Range'
                                        }
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Comp-Off Day Type Selection */}
                            {leaveData.leaveType === "compOffLeave" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Duration<span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="compOffDayType"
                                            name="compOffDayType"
                                            value={leaveData.compOffDayType}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                let totalDays = 0;
                                                if (value === "firstHalf" || value === "secondHalf") {
                                                    totalDays = 0.5;
                                                } else if (value === "fullDay") {
                                                    totalDays = 1;
                                                }
                                                setLeaveData({ ...leaveData, compOffDayType: value, totalDays });
                                            }}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white hover:border-gray-300"
                                        >
                                            <option value="">Select Duration</option>
                                            <option value="firstHalf">First Half</option>
                                            <option value="secondHalf">Second Half</option>
                                            <option value="fullDay">Full Day</option>
                                        </select>
                                        {/* Custom dropdown arrow */}
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {compOffDayTypeError && (
                                        <p className="text-red-600 mt-2 text-sm">{compOffDayTypeError}</p>
                                    )}
                                </div>
                            )}
                            {leaveData.totalDays < 2 ? leaveData.leaveType === 'casualLeave' || leaveData.leaveType === 'earnedLeave' ?
                                <div>
                                    <label
                                        htmlFor="startDate"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Select Duration
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="selectTime"
                                            name="selectTime"
                                            value={leaveData.selectTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white hover:border-gray-300"
                                        >
                                        <option>Select </option>
                                        <option value="firstHalf">First Half</option>
                                        <option value="secondHalf">Second Half</option>
                                        <option value="fullDay">Full Day</option>
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                </div> : ''
                                : ''}
                            <p class="text-red-600 mt-2">{totalDayError ? totalDayError : ''}</p>
                            {/* Display Total Days */}
                            {leaveData.totalDays > 0 && (
                                <p className="text-sm text-gray-700">
                                    Total Days: {leaveData.totalDays}
                                </p>
                            )}
                            <p class="text-red-600 mt-2">{leaveError?.medical ? leaveError.medical : ''}</p>
                            {leaveData.leaveType === "medicalLeave" && (
                                <div className="flex flex-col gap-4">
                                    <label htmlFor="document">Prescription:</label>
                                    <input
                                        type="file"
                                        id="document"
                                        accept=".pdf,.jpg,.png"
                                        onChange={handelChangeFile}
                                    />
                                    {file ?
                                        <button type="button" onClick={handelUploadPrescription} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">{uploadLoading ? 'Uploading...' : 'Upload Prescription'}</button>
                                        : null}
                                </div>
                            )}
                            <p className='text-red-600 mt-2'>{fileError}</p>
                            {/* Reason */}
                            <div>
                                <label
                                    htmlFor="reason"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    {leaveData.leaveType === "compOffLeave" ? "Reason for Comp-Off" : "Reason for Leave"}
                                </label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    rows="4"
                                    value={leaveData.reason}
                                    onChange={handleInputChange}
                                    placeholder={leaveData.leaveType === "compOffLeave" ? "Provide your reason for comp-off..." : "Provide your reason for leave..."}
                                    className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none hover:border-gray-300"
                                ></textarea>
                            </div>
                            <p className='text-red-600 mt-2'>{reasonError ? reasonError : ''}</p>
                            {/* Footer */}
                            <div className="flex justify-center items-center mt-4">
                                <button
                                    type="submit"
                                    className="py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 font-medium"
                                >
                                    Apply For Leave
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            <Modal open={calendarOpen} onClose={closeCalendar}>
                <Box className="bg-white rounded-lg p-6 mx-auto my-10 max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Select Date Range</h2>
                        <button
                            onClick={closeCalendar}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-lg font-medium text-gray-900">
                            {currentMonth.format('MMMM YYYY')}
                        </h3>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="mb-4">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth().map((day, index) => {
                                const isCurrentMonth = day.month() === currentMonth.month();
                                const isToday = day.isSame(dayjs(), 'day');
                                const isInRange = isDateInRange(day);
                                const isSelected = isDateSelected(day);
                                
                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectDate(day)}
                                        disabled={!isCurrentMonth}
                                        className={`
                                            p-2 text-sm rounded-lg transition-colors duration-200
                                            ${!isCurrentMonth ? 'text-gray-300 cursor-default' : 'hover:bg-blue-50 cursor-pointer'}
                                            ${isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                                            ${isInRange ? 'bg-blue-200' : ''}
                                            ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                                            ${isCurrentMonth ? 'text-gray-900' : ''}
                                        `}
                                    >
                                        {day.date()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Date Range Display */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Selected Range:</div>
                        <div className="text-sm font-medium">
                            {selectedStartDate ? (
                                selectedEndDate ? (
                                    `${selectedStartDate.format('MMM DD, YYYY')} - ${selectedEndDate.format('MMM DD, YYYY')}`
                                ) : (
                                    `${selectedStartDate.format('MMM DD, YYYY')} - Select end date`
                                )
                            ) : (
                                'No date selected'
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={closeCalendar}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyDateRange}
                            disabled={!selectedStartDate || !selectedEndDate}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                selectedStartDate && selectedEndDate
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Apply
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default CreateProjectModal;