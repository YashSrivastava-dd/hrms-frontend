import { configureStore } from "@reduxjs/toolkit";
import { loginUserReducer, singleUserDataReducer, allEmployeeDataReducer, attendanceEmployeeReducer, getEmployeeLeaveStatusReducer, getHolidaysListReducer, getLeaveApproveReducer, getCompoffLeaveApprovalReducer, getPublicDocumentReduce, postLeaveApplyByEmployeReducer, deleteLeaveRequestReducer, leaveApproveByManagerReducer, postApplyCompoffLeaveReducer, putCompoffLeaveReducer, getCompoffLeaveDataReducer, getTeammateDataReducer, getEmployeePrivateReducer, postSendOtpWithEmailReducer, otpVerificationReducer, postConfirmPasswordReducer, getCalenderLogsApiReducer, postRegularizeReducer, getAllEmployeeAttendanceeReducer, getOnLeaveStatusReducer, getTotalProjectListReducer, getTaskProjectByIdReducer, getSingleTaskDetailsReducer, getAttendanceLogsDayWiseReducer, postMedicalFileReducer, getAnnouncementDataReducer, getPunchDataReducer, getPaySlipAndPayrollReducer, getPunchInPunchOutReducer, getVendorLogsReducer, getVendorSingleLogsReducer, getEmployeeDataCountReducer, getGraphCountDataReducer, getEmployeeLeaveCoutReducer, postVendorMeetingReducer, postRevertLeaveReducer } from "./reducer/UserDataReducer";

const store = configureStore({
  reducer: {
    userData: singleUserDataReducer, // Reducer for single user data
    loginData: loginUserReducer,    // Reducer for login data
    allUserData: allEmployeeDataReducer,
    attendanceLogs:attendanceEmployeeReducer,
    employeeLeaveStatus:getEmployeeLeaveStatusReducer,
    holidaysData:getHolidaysListReducer,
    managerLeaveApprove:getLeaveApproveReducer,
    compoffApprove:getCompoffLeaveApprovalReducer,
    employeeDocument:getPublicDocumentReduce,
    leaveApplyByEmployee:postLeaveApplyByEmployeReducer,
    deleteLeaveByEmoployee:deleteLeaveRequestReducer,
    leaveApproveByManager:leaveApproveByManagerReducer,
    compoffReducer:postApplyCompoffLeaveReducer,
    approveCompoffByManager:putCompoffLeaveReducer,
    compoffData:getCompoffLeaveDataReducer,
    teammateData:getTeammateDataReducer,
    privateDocument:getEmployeePrivateReducer,
    sendOtpwithemail:postSendOtpWithEmailReducer,
    otpVerification:otpVerificationReducer,
    confirmPasswordReducer:postConfirmPasswordReducer,
    calenderLogsData:getCalenderLogsApiReducer,
    regularizeReducer:postRegularizeReducer,
    allEmployeeAttencance:getAllEmployeeAttendanceeReducer,
    gertonleaveemployeedata:getOnLeaveStatusReducer,
    getTotalProjectList:getTotalProjectListReducer,
    getprojectbyid:getTaskProjectByIdReducer,
    singleTaskDetails:getSingleTaskDetailsReducer,
    attendanceLogsDayWise:getAttendanceLogsDayWiseReducer,
    medicalFileReducer:postMedicalFileReducer,
    announcementData:getAnnouncementDataReducer,
    punchInDataReducer:getPunchDataReducer,
    salarySlipData:getPaySlipAndPayrollReducer,
    punchINPunchOutLogs:getPunchInPunchOutReducer,
    vendorLogsData:getVendorLogsReducer,
    singleVendorLogsData:getVendorSingleLogsReducer,
    exployeeDataCountCount:getEmployeeDataCountReducer,
    employeeGraphDataCount:getGraphCountDataReducer,
    employeeLeaveCount:getEmployeeLeaveCoutReducer,
    vendorMeetingData:postVendorMeetingReducer,
    revertLeaveReducer:postRevertLeaveReducer,
  },
});

export default store;
