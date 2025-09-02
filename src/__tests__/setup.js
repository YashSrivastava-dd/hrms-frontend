/**
 * HRMS TEST SETUP
 * 
 * Global test configuration and setup for the HRMS test suite
 */

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn()
};

// Mock window.open
global.open = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  }))
}));

// Mock html2pdf
jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    set: jest.fn(() => ({
      from: jest.fn(() => ({
        save: jest.fn(() => Promise.resolve())
      }))
    }))
  }))
}));

// Mock moment
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return {
    ...moment,
    default: jest.fn(() => ({
      format: jest.fn(() => 'January-2025')
    }))
  };
});

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    dismiss: jest.fn()
  },
  ToastContainer: ({ children }) => children
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

// Mock file input
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: jest.fn(() => ({
    readAsDataURL: jest.fn(),
    onload: jest.fn(),
    onerror: jest.fn(),
    result: 'data:image/jpeg;base64,mock-data'
  }))
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

// Mock document methods
document.createElement = jest.fn((tagName) => {
  const element = {
    tagName: tagName.toUpperCase(),
    click: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    style: {},
    src: '',
    href: '',
    download: '',
    onload: null,
    onerror: null
  };
  
  if (tagName === 'a') {
    element.click = jest.fn();
  }
  
  return element;
});

document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
console.error = jest.fn((message, ...args) => {
  // Only show actual errors, not expected test warnings
  if (typeof message === 'string' && 
      !message.includes('Warning:') && 
      !message.includes('validateDOMNesting')) {
    originalConsoleError(message, ...args);
  }
});

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset fetch mock
  fetch.mockClear();
  
  // Reset window.open mock
  global.open.mockClear();
});

// Cleanup after tests
afterEach(() => {
  // Clean up any DOM modifications
  document.body.innerHTML = '';
});

// Global test utilities
global.testUtils = {
  // Wait for async operations
  waitForAsync: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create mock user data
  createMockUser: (role = 'Employee') => ({
    _id: `${role.toLowerCase()}123`,
    employeeName: `Test ${role}`,
    employeeCode: `${role.toUpperCase()}001`,
    email: `${role.toLowerCase()}@test.com`,
    role,
    managerId: role !== 'CEO' ? 'mgr123' : null
  }),
  
  // Create mock leave data
  createMockLeave: (status = 'Pending') => ({
    _id: `leave${Date.now()}`,
    leaveType: 'casualLeave',
    leaveStartDate: '2025-01-15',
    leaveEndDate: '2025-01-15',
    totalDayss: '1',
    reason: 'Test leave reason',
    status,
    location: status === 'medicalLeave' ? 'https://example.com/medical.jpg' : '',
    employeeInfo: {
      employeeName: 'Test Employee',
      employeeCode: 'TEST001',
      designation: 'Software Engineer'
    }
  }),
  
  // Create mock API response
  createMockApiResponse: (data, pagination = {}) => ({
    statusCode: 200,
    statusValue: 'SUCCESS',
    message: 'Data fetched successfully.',
    data,
    totalRecords: pagination.totalRecords || data?.length || 0,
    totalPages: pagination.totalPages || 1,
    currentPage: pagination.currentPage || 1,
    limit: pagination.limit || 10
  })
};

// Test data constants
export const TEST_CONSTANTS = {
  USER_ROLES: ['Employee', 'Manager', 'HR-Admin', 'CEO'],
  LEAVE_TYPES: ['casualLeave', 'earnedLeave', 'medicalLeave', 'compOff', 'shortLeave'],
  LEAVE_STATUSES: ['Pending', 'Approved', 'Rejected'],
  FILE_FORMATS: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif', 'tiff', 'tif'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'rtf']
  },
  API_ENDPOINTS: {
    LEAVES: '/api/leave/get-all-pending-leaves',
    LEAVE_COUNT: '/api/common/get-emp-leaves-count',
    DOCUMENTS: '/api/s3/get-employee-document-list',
    APPROVE: '/api/leave/action-for-leave-application'
  },
  BREAKPOINTS: {
    MOBILE: 375,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE: 1920
  }
};

console.log('🧪 HRMS Test Setup Complete - Ready for comprehensive testing!');
