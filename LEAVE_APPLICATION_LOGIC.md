# HRMS Leave Application Logic - Complete Guide

## Overview
This document provides a comprehensive breakdown of all leave application scenarios, rules, and logic implemented in the HRMS system.

## 1. Leave Types Available

### 1.1 Standard Leave Types
| Leave Type | Abbreviation | Description | Balance Required |
|------------|--------------|-------------|------------------|
| **Casual Leave** | CL | Personal/emergency leave | Yes |
| **Earned Leave** | EL | Annual leave earned over time | Yes |
| **Medical Leave** | ML | Sick leave with medical certificate | Yes |
| **Optional Leave** | OL | Optional holidays | Yes |
| **Comp-Off Leave** | C-Off | Compensation for overtime work | Yes |
| **Bereavement Leave** | BL | Death in family | Yes |
| **Paternity Leave** | PL | New father leave | Yes |
| **Maternity Leave** | ML | New mother leave | Yes |

### 1.2 Special Leave Types
| Leave Type | Abbreviation | Description | Balance Required |
|------------|--------------|-------------|------------------|
| **Short Leave** | SL | Early departure (partial day) | No |
| **Regularization** | RL | Attendance correction | No |
| **Vendor Meeting** | VM | Client/vendor meetings | No |
| **Uninformed Leave** | UL | Leave without prior notice | Yes |

## 2. Leave Application Rules & Scenarios

### 2.1 Date Selection Rules
- **Standard Leaves**: Can be applied for future dates
- **Short Leave**: Can be applied for last 35 days from today
- **Regularization**: Can be applied for last 35 days from today
- **Vendor Meeting**: Can be applied for dates from 7 days ago to today

### 2.2 Duration Rules
- **Minimum Duration**: 0.5 days (Half Day)
- **Maximum Duration**: Varies by leave type
- **Vendor Meeting**: 0.5 to 7 days maximum

### 2.3 Balance Validation
```javascript
// Leave types that DON'T consume balance
const noBalanceLeaves = [
    'vendorMeeting',
    'vendorLeave', 
    'shortLeave',
    'regularization'
];

// Leave types that DO consume balance
const balanceRequiredLeaves = [
    'casualLeave',
    'earnedLeave',
    'medicalLeave',
    'optionalLeave',
    'compOffLeave',
    'bereavementLeave',
    'paternityLeave',
    'maternityLeave'
];
```

## 3. Special Scenarios

### 3.1 Regularization Logic
```javascript
// Regularization Rules:
// 1. Maximum 2 regularizations per month
// 2. Only allowed if punched in between 9:15-9:31 AM
// 3. Can apply for last 35 days from today
// 4. Takes priority over other leave types for absent days

const isRegularizationAllowed = (dayData) => {
    const punches = cleanPunchRecords(dayData.PunchRecords);
    const inTimes = punches.filter(p => p.includes("(IN")).map(p => formatTime(p));
    
    if (inTimes.length === 0) return false;
    
    const firstInTime = inTimes[0];
    const [hours, minutes] = firstInTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    // Check if time is between 9:15 (555 minutes) and 9:31 (571 minutes)
    const minTime = 9 * 60 + 15; // 9:15 in minutes
    const maxTime = 9 * 60 + 31; // 9:31 in minutes
    
    return totalMinutes >= minTime && totalMinutes <= maxTime;
};
```

### 3.2 Half-Day Due to Late Arrival
```javascript
// Half-Day Priority Rules:
// 1. If someone arrives after 9:15 AM or between 9:15-9:30 AM
// 2. Day is marked as half-day
// 3. Half-day takes priority over regularization
// 4. Visual indicator: Yellow background with "Late (Half)" label

const shouldMarkAsHalfDay = (dayData) => {
    const punches = cleanPunchRecords(dayData.PunchRecords);
    const inTimes = punches.filter(p => p.includes("(IN")).map(p => formatTime(p));
    
    if (inTimes.length === 0) return false;
    
    const firstInTime = inTimes[0];
    const [hours, minutes] = firstInTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    // Check if time is after 9:15 (555 minutes) or between 9:15-9:30 (555-570 minutes)
    const lateTime = 9 * 60 + 15; // 9:15 in minutes
    const halfDayCutoff = 9 * 60 + 30; // 9:30 in minutes
    
    return totalMinutes >= lateTime && totalMinutes <= halfDayCutoff;
};
```

### 3.3 Weekend Comp-Off Logic
```javascript
// Weekend Comp-Off Rules:
// 1. Saturday/Sunday work is eligible for comp-off
// 2. >1 hour but <4 hours = Half Day Comp-Off
// 3. >4 hours = Full Day Comp-Off
// 4. <1 hour = No Comp-Off eligible

const getWeekendCompOffType = (dayData) => {
    if (!isWeekend(dayData.AttendanceDate)) return null;
    
    const hoursWorked = calculateWeekendHours(dayData);
    
    if (hoursWorked > 4) {
        return 'fullDay'; // More than 4 hours = full day comp-off
    } else if (hoursWorked > 1) {
        return 'halfDay'; // More than 1 hour but less than 4 = half day comp-off
    }
    
    return null; // Less than 1 hour = no comp-off
};
```

### 3.4 Vendor Meeting Logic
```javascript
// Vendor Meeting Rules:
// 1. Can be applied for dates from 7 days ago to today
// 2. Duration: 0.5 to 7 days maximum
// 3. Duration options: First Half, Second Half, Full Day
// 4. Doesn't consume leave balance
// 5. Special validation for duration selection

const validateVendorMeeting = (leaveData) => {
    // Vendor meeting can be applied for dates from 7 days ago to today
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    
    if (!(startDate <= currentDate && startDate >= sevenDaysAgo)) {
        return 'Vendor meeting can only be applied for dates from 7 days ago to today.';
    }
    
    if (leaveData.totalDays < 0.5 || leaveData.totalDays > 7) {
        return 'Vendor meeting must be applied for a minimum of 0.5 days and a maximum of 7 days.';
    }
    
    return null; // Valid
};
```

## 4. Comp-Off Application Logic

### 4.1 Comp-Off Types
- **Half Day Comp-Off**: 0.5 days (4 hours)
- **Full Day Comp-Off**: 1 day (8 hours)

### 4.2 Comp-Off Sources
1. **Weekend Work**: Automatic detection based on hours worked
2. **Overtime**: Manual application for extra hours
3. **Holiday Work**: Work done on declared holidays
4. **Vendor Meetings**: Special comp-off for client meetings

### 4.3 Comp-Off Validation
```javascript
// Comp-Off Balance Check
if (leaveData.leaveType === 'compOffLeave' && availableBalance <= 0) {
    return 'You have no comp-off leave balance available.';
}

// Comp-Off Duration Selection
if (actionType === 'compOff' && !compOffDayType) {
    return 'Please select a duration (Half Day or Full Day).';
}
```

## 5. Medical Leave Special Rules

### 5.1 Document Requirements
- **Medical Certificate**: Required for medical leave
- **File Upload**: Must attach supporting documents
- **Validation**: File must be uploaded before submission

### 5.2 Medical Leave Logic
```javascript
// Medical Leave Validation
if (leaveData?.leaveType === 'medicalLeave' && !file) {
    return 'Please attach documents !!';
}

// Medical Report Processing
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        dispatch(postMedicalFileAction(file));
    }
};
```

## 6. Working Days Calculation

### 6.1 Working Day Criteria
A day is counted as a working day if ANY of these conditions are met:

1. **Full Day or Half Day attendance**
2. **Regularization applied (RL)**
3. **Short Leave (SL)**
4. **Comp-Off Leave**
5. **Present status** (regardless of attendance status)
6. **Leave taken but not marked as absent** (approved leaves)
7. **Other approved leave types**

### 6.2 Effective Hours Calculation
```javascript
const calculateEffectiveHours = (dayData) => {
    const { AttendanceStatus, Status, isLeaveTaken, leaveType, PunchRecords, InTime, OutTime, Duration } = dayData;
    
    // Priority order for hour calculation:
    // 1. Duration field (if available)
    // 2. Full Day attendance (8 hours)
    // 3. Half Day attendance (4 hours)
    // 4. Regularization (actual hours or 8h default)
    // 5. Short Leave (actual hours + leave hours)
    // 6. Comp-Off Leave (8 hours)
    // 7. Other approved leaves (8 hours)
    // 8. Present status (8 hours)
    // 9. Fallback to punch records
};
```

## 7. Visual Indicators & Color Coding

### 7.1 Calendar Day Colors
| Color | Background | Border | Meaning |
|-------|------------|--------|---------|
| **Green** | bg-green-100 | border-green-300 | Full Day |
| **Yellow** | bg-yellow-100 | border-yellow-300 | Half Day / Late Arrival |
| **Red** | bg-red-100 | border-red-300 | Absent |
| **Orange** | bg-orange-100 | border-orange-400 | Regularization Eligible |
| **Purple** | bg-purple-100 | border-purple-400 | Weekend C-Off (Full) |
| **Indigo** | bg-indigo-100 | border-indigo-400 | Weekend C-Off (Half) |
| **Blue** | bg-blue-100 | border-blue-300 | Holiday |
| **White** | bg-white | border-gray-300 | Regular Day |

### 7.2 Leave Type Indicators
| Indicator | Color | Meaning |
|-----------|-------|---------|
| **SL** | Blue | Short Leave |
| **RL** | Orange | Regularization |
| **C-Off (Full)** | Purple | Full Day Comp-Off |
| **C-Off (Half)** | Indigo | Half Day Comp-Off |
| **Late (Half)** | Yellow | Late Arrival Half Day |

## 8. API Endpoints & Actions

### 8.1 Leave Application Actions
```javascript
// Standard Leave Application
dispatch(postApplyLeaveByEmployee({
    leaveType: apiLeaveType,
    leaveStartDate: leaveData?.startDate,
    leaveEndDate: leaveData?.endDate,
    totalDays: leaveData?.totalDays,
    reason: leaveData?.reason,
    approvedBy: managerId,
    employeId: employeeId,
    shift: apiShift,
    location: medicalReport?.location,
}));

// Short Leave & Regularization
dispatch(postApplyRegularizationAction(
    apiLeaveType,
    leaveData.startDate,
    leaveData.reason
));

// Comp-Off Application
dispatch(postApplyCompOffLeaveAction(
    selectedDate,
    reason,
    totalDays
));

// Vendor Meeting
dispatch(postVendorMeetingAction({
    // vendor meeting specific data
}));
```

### 8.2 Data Fetching Actions
```javascript
// Get leave balance
dispatch(getEmployeeLeaveCountAction(employeeId));

// Get regularization count
dispatch(getRegularizationCountAction(employeeId));

// Get attendance logs
dispatch(getAttendenceLogsOfEmploye(employeeId, monthYear));

// Get calendar logs
dispatch(getCalenderLogsApiAction(monthYear, employeeId));
```

## 9. Error Handling & Validation

### 9.1 Common Validation Errors
- **Insufficient Balance**: "You have X days available but requesting Y days"
- **Invalid Date Range**: "You can only apply for dates within the last 35 days"
- **Missing Documents**: "Please attach documents for medical leave"
- **Regularization Limit**: "You have already applied for 2 regularizations this month"
- **Invalid Punch Time**: "Regularization is only allowed if you punched in between 9:15-9:31 AM"

### 9.2 Success Messages
- **Leave Applied**: "Leave application submitted successfully"
- **Comp-Off Applied**: "Comp-off request submitted successfully"
- **Regularization Applied**: "Regularization request submitted successfully"

## 10. User Roles & Permissions

### 10.1 Employee Role
- Can apply for all leave types
- Can view own leave balance
- Can apply for regularization (with restrictions)
- Can apply for comp-off

### 10.2 Manager Role
- Can approve/reject leave applications
- Can view team leave status
- Can apply for all leave types

### 10.3 Super-Admin Role
- Full access to all features
- Can view all employee data
- Can override leave restrictions

## 11. Best Practices & Recommendations

### 11.1 For Employees
1. Apply for leaves well in advance
2. Attach proper documentation for medical leaves
3. Check leave balance before applying
4. Use regularization only when necessary
5. Keep track of comp-off eligibility

### 11.2 For Managers
1. Review leave applications promptly
2. Consider team workload when approving leaves
3. Monitor regularization patterns
4. Ensure proper documentation

### 11.3 For System Administrators
1. Monitor leave patterns for policy updates
2. Regular backup of leave data
3. Update leave balances as per company policy
4. Maintain audit trails for all leave transactions

---

*This document covers all the leave application logic, scenarios, and rules implemented in the HRMS system. For any specific implementation details, refer to the source code in the respective components.*
