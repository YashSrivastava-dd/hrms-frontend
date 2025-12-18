# Salary Sheet Management System

Complete frontend integration for salary sheet management with full CRUD operations, role-based access control, and comprehensive UI components.

## Features Implemented

### ✅ API Service Layer
- **File**: `src/services/salarySheetService.js`
- Handles all API calls to salary sheet endpoints
- Manages authentication token from localStorage
- Comprehensive error handling (401, 403, 404, 500, network errors)
- Consistent response format
- Toast notifications for success/error

### ✅ React Hooks
- **File**: `src/hooks/useSalarySheets.js`
- `useSalarySheets(filters)` - Fetch all salary sheets with pagination
- `useSalarySheet(id)` - Fetch single salary sheet
- `useEmployeeSalarySheets(employeeCode, filters)` - Fetch by employee
- `useGenerateSalarySheets()` - Generate salary sheets with loading/error states

### ✅ UI Components

#### 1. SalarySheetList Component
- **File**: `src/components/SalarySheet/SalarySheetList.jsx`
- Display salary sheets in a responsive table
- Filters: Year, Month, Employee Code (admin only), Search
- Pagination controls
- Shows: Employee name, Month/Year, Worked Days, Gross Salary, Deductions, Net Pay, Lock Status
- Currency formatting in INR (₹)
- Loading and error states
- Role-based access control

#### 2. SalarySheetDetail Component
- **File**: `src/components/SalarySheet/SalarySheetDetail.jsx`
- Complete salary sheet information display
- All salary components breakdown
- All deductions breakdown
- Employee information
- Lock/Unlock button (for admins)
- Print functionality

#### 3. GenerateSalarySheets Component
- **File**: `src/components/SalarySheet/GenerateSalarySheets.jsx`
- Form with Year and Month selectors
- Generate button with loading state
- Display results: Total Employees, Processed, Skipped, Errors (if any)
- Success/error notifications

#### 4. EditSalarySheet Component
- **File**: `src/components/SalarySheet/EditSalarySheet.jsx`
- Form to update deductions
- Validation: Cannot edit if locked
- Shows current values
- Real-time calculation of total deductions and net pay
- Save/Cancel buttons
- Success/error feedback

## Role-Based Access Control

- **Employees/Managers**: Can only view their own salary sheets
- **HR-Admin/Admin/Super-Admin**: Full access (view all, edit, delete, generate)
- Handles 403 errors gracefully with user-friendly messages

## Error Handling

- ✅ 401 (Unauthorized) - Shows error and redirects to login after 2 seconds
- ✅ 403 (Forbidden) - Shows permission denied message
- ✅ 404 (Not Found) - Shows not found message
- ✅ 500 (Server Error) - Shows generic error message
- ✅ Network errors - Shows connection error message

## API Endpoints Integrated

1. `POST /api/generate-salary-sheets` - Generate salary sheets
2. `GET /api/salary-sheets` - Get all with pagination & filters
3. `GET /api/salary-sheets/:id` - Get by ID
4. `GET /api/salary-sheets/employee/:employeeCode` - Get by employee
5. `GET /api/salary-sheets/month/:year/:month` - Get by month
6. `PUT /api/salary-sheets/:id` - Update salary sheet
7. `DELETE /api/salary-sheets/:id` - Delete salary sheet

## Navigation

- **Route**: `/salary-sheets`
- **Sidebar Tag**: `salarySheets`
- **Sidebar Label**: "Salary Sheets" with 💵 icon
- Located in "Documents & Forms" section

## Usage

1. Navigate to "Salary Sheets" from the sidebar
2. View all salary sheets (filtered by role)
3. Use filters to search by month, year, employee code, or search term
4. Click "View" to see details
5. Admins can:
   - Generate new salary sheets
   - Edit deductions (if unlocked)
   - Lock/Unlock salary sheets
   - Delete salary sheets

## Data Structure

```typescript
interface SalarySheet {
  _id: string;
  employee_id: {
    _id: string;
    employeeName: string;
    employeeCode: string;
    designation: string;
    email?: string;
    contactNo?: string;
  };
  employee_code: string;
  month: number; // 1-12
  year: number;
  payable_days: number;
  worked_days: number;
  gross_salary: number;
  daily_rate: number;
  adjusted_gross: number;
  salary_components: {
    basic: number;
    hra: number;
    travel_allowance: number;
    special_allowance: number;
  };
  deductions: {
    employee_pf: number;
    employee_esi: number;
    tds: number;
    loan_advance: number;
    penalty: number;
    transport_or_others: number;
    total_deductions: number;
  };
  net_pay: number;
  generated_at: string; // ISO date
  generated_by: string;
  is_locked: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Dependencies

- `axios` - HTTP client
- `react-redux` - State management
- `react-icons` - Icons
- `react-toastify` - Toast notifications (via safeToast utility)
- `currencyFormatter` - Currency formatting utility

## Notes

- All API calls use Bearer token authentication from localStorage
- Currency is formatted using Indian Rupees (₹) format
- Responsive design works on mobile, tablet, and desktop
- Loading states and error handling are implemented throughout
- Follows existing codebase patterns and conventions
