# HRMS Logs/Activity Components

This directory contains React components for displaying and filtering system activity logs in the HRMS application.

## Components

### 1. LogsPage.jsx
Main container component that combines filters and timeline. Accepts a `userRole` prop to determine which logs to fetch.

**Props:**
- `userRole` (string): One of 'Employee', 'Manager', 'HR', or 'CEO'

**Features:**
- Role-based scope determination (me/team/all)
- API integration with `/api/logs` endpoint
- Pagination with "Load More" functionality
- Error handling and loading states
- Mock data for development

### 2. LogFilters.jsx
Filter component with action type, entity type, and date range filters.

**Props:**
- `onApplyFilters` (function): Callback when filters are applied
- `loading` (boolean): Loading state for the apply button

**Filters:**
- Action Type: LEAVE_APPLIED, LEAVE_APPROVED, PAYSLIP_VIEWED, etc.
- Entity Type: LEAVE, PAYSLIP, ATTENDANCE, etc.
- Date Range: Start and end date pickers
- Reset functionality

### 3. LogTimeline.jsx
Timeline display component for log entries with icons and hover effects.

**Props:**
- `logs` (array): Array of log objects
- `loading` (boolean): Loading state
- `onLoadMore` (function): Callback for pagination
- `hasMore` (boolean): Whether more logs are available

**Features:**
- Timeline UI with left border and dots
- Action-specific icons (📅, ✅, 💰, etc.)
- Hover effects and transitions
- Date formatting with date-fns
- Device and IP information display

## Usage

### Basic Implementation
```jsx
import { LogsPage } from './components/Logs';

function App() {
  return <LogsPage userRole="Manager" />;
}
```

### With Custom Styling
```jsx
import { LogsPage, LogFilters, LogTimeline } from './components/Logs';

function CustomLogsPage() {
  const [logs, setLogs] = useState([]);
  
  return (
    <div className="custom-container">
      <LogFilters onApplyFilters={handleFilters} />
      <LogTimeline logs={logs} />
    </div>
  );
}
```

## API Integration

The components expect the following API response format:

```json
[
  {
    "id": 101,
    "user": { "id": 12, "name": "John Doe", "role": "Employee" },
    "actionType": "LEAVE_APPLIED",
    "description": "Applied for Casual Leave",
    "entityType": "LEAVE",
    "entityId": 55,
    "ipAddress": "192.168.1.12",
    "device": "Chrome on Windows",
    "createdAt": "2025-08-21T10:32:00Z"
  }
]
```

## Styling

All components use TailwindCSS classes and follow the project's design system:
- Soft, muted color scheme
- Consistent spacing and typography
- Responsive design
- Hover effects and transitions

## Development

- Mock data is included for development
- Error boundaries and loading states
- Responsive design for mobile/desktop
- Accessible form controls and buttons

## Dependencies

- React 19+
- TailwindCSS
- date-fns (for date formatting)
- React Icons (optional, for additional icons)
