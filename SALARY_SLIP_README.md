# Salary Slip Generation Feature

## Overview
The Salary Slip Generation feature allows HR Admin users to create comprehensive employee salary slips using the provided API endpoint. This feature is accessible only to users with the "HR-Admin" role.

## Features

### 🔐 Role-Based Access
- **HR-Admin Only**: This feature is restricted to users with HR-Admin role
- **Secure Navigation**: Integrated into the HR Management section of the sidebar

### 📋 Comprehensive Form
The form includes all the fields required by the API:

#### Basic Information
- Pay Slip Month (required) - Custom dropdown with months from 2025-2026, featuring clear button and smooth animations
- Company Address (pre-filled with default value)

#### Employee Details
- Employee Name (required)
- Employee Code (required)
- Designation (required)
- Date of Joining (required)
- PAN Number
- Aadhar Number
- Bank Details (Name, IFSC, Account)
- UAN Number
- ESIC Number
- Payment Mode

#### Leave Summary
- Month Days, Unpaid Days, Payable Days
- Absent Days, Worked Days

#### Salary Details
- Basic Salary (required)
- HRA, Travel Allowances, Special Allowances
- Arrears, Bonus/Others
- Employee PF, ESI, TDS
- Loan/Advance, Penalty, Transport/Others

### 🧮 Automatic Calculations
- **Gross Salary**: Automatically calculated from all earnings
- **Total Deductions**: Sum of all deductions
- **Net Pay**: Gross Salary - Total Deductions

### 🎯 User Experience Features
- **Employee Search**: Search and auto-populate employee data by Employee ID
- **Month Selection**: Custom dropdown with months from 2025-2026, featuring clear button and smooth animations
- **Demo Data Button**: Load sample data for testing
- **Real-time Validation**: Form validation before submission
- **Success/Error Messages**: Clear feedback on API responses
- **Form Reset**: Automatic form reset after successful submission
- **Responsive Design**: Works on all device sizes

## API Integration

### Salary Slip Generation Endpoint
```
POST http://172.23.103.207:3001/api/save-salary-data
```

### Employee Data Fetch Endpoint
```
GET {REACT_APP_BASE_URL}/api/employee/get-employee-details/{employeeId}
```

**Note**: The employee search uses the same API endpoint that powers the employee profile section, ensuring data consistency across the application.

### Request Format
The component sends a POST request with the exact structure specified in your API documentation:

```json
{
  "pay_slip_month": "March 2025",
  "company_address": "A1, BLOCK A, SECTOR 83, NOIDA, UTTAR PRADESH 201301",
  "employee_basic_details": {
    "employee_name": "Test User",
    "employee_code": "495",
    "designation": "Software Engineer",
    "date_of_joining": "2021-07-15",
    "employee_pan": "ABCPR1234D",
    "employee_aadhar": "1234-5678-9123",
    "bank_name": "HDFC Bank",
    "bank_ifsc": "HDFC0001234",
    "bank_account": "123456789012",
    "employee_uan": "100200300400",
    "employee_esic": "ESIC1234567",
    "payment_mode": "Bank Transfer"
  },
  "leave_summary": {
    "month_days": "31",
    "unpaid_days": "1",
    "payable_days": "30",
    "EL": 31.5,
    "CL": 0.0,
    "ML": 6.0,
    "D_EL": 0.0,
    "D_CL": 2.0,
    "D_ML": 0.0,
    "regularisation": 0.0,
    "shortLeave": 0.0,
    "halfDay": 11.0,
    "absent": 10.0,
    "workedDays": 7.5,
    "SD": 9.5
  },
  "salary_details": {
    "basic_salary": "25000",
    "hra": "10000",
    "travel_allowances": "3000",
    "special_allowances": "2000",
    "arrears": "0",
    "bonus_or_others": "1000",
    "total_gross_salary": "41000",
    "employee_pf": "1800",
    "employee_esi": "500",
    "tds": "1000",
    "loan_advance": "0",
    "penalty": "0",
    "transport_or_others": "200",
    "total_deduction": "3500",
    "net_pay": "37500"
  }
}
```

## Navigation

### Sidebar Access
- **Location**: HR Management section (HR-Admin users only)
- **Icon**: 💰
- **Label**: "Generate Salary Slip"

### Dashboard Access
- **Quick Action**: Available in HR Operations section
- **Prominent Section**: Dedicated card with "Generate Now" button

## Usage Instructions

### 1. Access the Feature
- Log in as an HR-Admin user
- Navigate to "Generate Salary Slip" from the sidebar or dashboard

### 2. Search Employee (Optional)
- **Employee Search**: Enter Employee ID in the search field
- **Auto-populate**: Click "Search" to fetch and auto-fill employee details
- **Data Source**: Uses existing employee profile API (`/api/employee/get-employee-details/{id}`)
- **Clear Data**: Use "Clear" button to remove loaded employee data

### 3. Fill the Form
- **Required Fields**: Pay Slip Month (select from dropdown), Employee Name, Employee Code, Designation, Date of Joining, Basic Salary
- **Optional Fields**: All other fields can be left empty or filled as needed
- **Demo Data**: Use "Load Demo Data" button to populate with sample data
- **Auto-fill**: Employee search automatically populates basic information

### 4. Review Calculations
- Check the automatically calculated totals in the Salary Summary section
- Verify Gross Salary, Deductions, and Net Pay

### 5. Submit
- Click "Generate Salary Slip" button
- Wait for API response
- Check success/error message

### 6. Success
- Form will automatically reset
- Success message will be displayed
- Salary slip data will be saved via API

## Error Handling

### Validation Errors
- **Required Fields**: Must be filled before submission
- **Format Validation**: Date fields must be valid dates
- **Number Fields**: Must contain valid numbers

### API Errors
- **Network Issues**: Clear error message for connection problems
- **Server Errors**: Displays server response messages
- **User Feedback**: Success/error messages with appropriate styling

## Technical Details

### Component Location
```
src/components/GenerateSalarySlip.jsx
```

### Dependencies
- React Hooks (useState)
- React Icons (FaDownload, FaSave, FaUser, etc.)
- Tailwind CSS for styling

### State Management
- Local component state for form data
- Loading states for API calls
- Message states for user feedback
- Employee search state management
- Auto-population state for fetched employee data

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly form controls

## Security Considerations

### Role-Based Access
- Only HR-Admin users can access this feature
- Navigation is controlled by user role checks
- Component rendering is restricted by role

### Data Validation
- Client-side validation before API calls
- Required field validation
- Data format validation

### API Security
- No sensitive data stored locally
- All data sent via secure HTTP POST
- Form data cleared after successful submission

## Future Enhancements

### Potential Improvements
- **File Upload**: Allow attachment of supporting documents
- **Bulk Generation**: Generate multiple salary slips at once
- **Template Management**: Save and reuse salary slip templates
- **Export Options**: PDF generation, Excel export
- **Audit Trail**: Track all salary slip generations
- **Integration**: Connect with employee database for auto-population

### API Enhancements
- **Authentication**: Add JWT token support
- **Rate Limiting**: Implement API rate limiting
- **Webhook Support**: Notify other systems on completion
- **Status Tracking**: Track processing status of salary slips

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Note**: This feature is designed to work with the specified API endpoint. Any changes to the API structure will require corresponding updates to this component.

