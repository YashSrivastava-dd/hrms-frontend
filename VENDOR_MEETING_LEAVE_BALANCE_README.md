# Vendor Meeting Leave Balance Modifications

## Overview
This document describes the modifications made to the leave balance system when using vendor meeting leave type. The system now tracks vendor meetings separately from regular leave balances and provides enhanced visibility into vendor meeting usage.

## Key Features

### 1. Separate Leave Balance Tracking
- **Vendor meetings do not consume regular leave balance**
- **Separate tracking for reporting and compliance purposes**
- **Real-time balance updates after vendor meeting applications**

### 2. Enhanced UI Components
- **Vendor Meeting Leave Balance Display**: Shows current vendor meeting usage and regular leave balance
- **Duration Selection**: Half-day, full-day, and custom duration options
- **Real-time Updates**: Balance updates immediately after successful application

### 3. Leave Balance Modifications
- **No Impact on Regular Leave**: Vendor meetings don't reduce earned, casual, or other leave balances
- **Separate Counter**: Tracks vendor meeting days used separately
- **Compliance Reporting**: Maintains audit trail for vendor meeting usage

## Technical Implementation

### 1. Modified Actions (`src/store/action/userDataAction.js`)
```javascript
export const postVendorMeetingAction = ({
  leaveType, 
  leaveStartDate, 
  reason, 
  duration, 
  totalDays, 
  leaveEndDate 
}) => async (dispatch, getState) => {
  // ... existing implementation
  
  // After successful vendor meeting application, refresh user data
  if (data?.statusCode === 200) {
    dispatch(refreshUserDataAfterVendorMeeting());
  }
};

export const refreshUserDataAfterVendorMeeting = () => async (dispatch, getState) => {
  // Fetches updated user data including leave balance
  // Updates store with new information
};
```

### 2. New Action Types (`src/store/types/UserDataType.js`)
```javascript
export const REFRESH_USER_DATA_AFTER_VENDOR_MEETING = "REFRESH_USER_DATA_AFTER_VENDOR_MEETING";
```

### 3. Enhanced Reducer (`src/store/reducer/UserDataReducer.js`)
```javascript
case REFRESH_USER_DATA_AFTER_VENDOR_MEETING:
  return {
    ...state,
    loading: false,
    data: action.payload,
    error: null,
  };
```

### 4. UI Components

#### Vendor Meeting Leave Balance Display (`src/components/AddEmployee.jsx`)
- Shows vendor meeting days used vs. regular leave balance
- Real-time updates based on duration selection
- Informational notes about vendor meeting rules

#### Dedicated Vendor Meeting Component (`src/components/VendorMeetingLeaveBalance.jsx`)
- Comprehensive vendor meeting history
- Summary cards showing usage statistics
- Detailed table with meeting information

## API Integration

### Vendor Meeting API Endpoint
```
POST /api/leave/apply-for-vendor-meeting/{employeeId}
```

### Request Payload
```json
{
  "leaveType": "vendor-meeting",
  "leaveStartDate": "2025-01-15",
  "leaveEndDate": "2025-01-15",
  "reason": "Meeting with vendor for project requirements",
  "totalDays": "1",
  "duration": "full-day"
}
```

### Response
```json
{
  "statusCode": 200,
  "message": "Vendor meeting request submitted successfully",
  "data": {
    "id": "vm_123",
    "status": "pending",
    "totalDays": 1
  }
}
```

## Leave Balance Rules

### Vendor Meeting Rules
- **Minimum Duration**: 0.5 days (half day)
- **Maximum Duration**: 7 days per request
- **Date Range**: Yesterday to last 30 days
- **No Balance Check**: Always allowed (no leave balance consumption)

### Regular Leave Rules
- **Earned Leave**: Requires sufficient balance
- **Casual Leave**: Requires sufficient balance
- **Medical Leave**: Requires sufficient balance
- **Comp-Off Leave**: Requires sufficient balance

## User Experience

### 1. Leave Application Flow
1. User selects "Vendor Meeting" as leave type
2. Duration selection (half-day, full-day, custom)
3. Date range selection
4. Reason input
5. Real-time leave balance display
6. Submit application

### 2. Balance Display
- **Vendor Meeting Days**: Shows current selection
- **Regular Leave Balance**: Shows available earned leave
- **Visual Indicators**: Color-coded for easy understanding

### 3. Success Handling
- Immediate balance refresh
- Success notification
- Form reset
- Modal closure

## Benefits

### 1. For Employees
- **Clear Visibility**: Understand vendor meeting usage vs. regular leave
- **No Balance Impact**: Vendor meetings don't affect leave entitlements
- **Easy Tracking**: Monitor vendor meeting history

### 2. For Managers
- **Better Oversight**: Track vendor meeting patterns
- **Compliance**: Maintain audit trail for external meetings
- **Resource Planning**: Understand team availability

### 3. For HR
- **Accurate Reporting**: Separate vendor meeting data
- **Policy Compliance**: Enforce vendor meeting rules
- **Analytics**: Generate vendor meeting reports

## Configuration

### Environment Variables
```bash
REACT_APP_BASE_URL=http://localhost:3001
```

### Store Configuration
The vendor meeting system integrates with the existing Redux store:
- `userData`: User information and leave balance
- `vendorMeetingData`: Vendor meeting application status
- `attendanceLogs`: Attendance tracking

## Future Enhancements

### 1. Advanced Analytics
- Vendor meeting trends over time
- Department-wise vendor meeting usage
- Cost analysis for vendor meetings

### 2. Integration Features
- Calendar integration
- Email notifications
- Mobile app support

### 3. Reporting
- Monthly vendor meeting reports
- Compliance dashboards
- Export functionality

## Troubleshooting

### Common Issues

#### 1. Leave Balance Not Updating
- Check if `refreshUserDataAfterVendorMeeting` action is dispatched
- Verify API response status code
- Check Redux store for errors

#### 2. Vendor Meeting Not Showing in History
- Ensure vendor meeting status is "approved"
- Check if history component is properly mounted
- Verify data structure in store

#### 3. Duration Selection Issues
- Validate vendor meeting duration values
- Check if totalDays calculation is correct
- Ensure proper state updates

### Debug Steps
1. Check browser console for errors
2. Verify Redux DevTools for action flow
3. Confirm API responses
4. Validate component props and state

## Support

For technical support or questions about the vendor meeting leave balance system, please refer to:
- Frontend development team
- HR system documentation
- API documentation
- User manual

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Author**: Development Team
