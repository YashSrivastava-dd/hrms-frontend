import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaUsers, FaChevronDown, FaChevronRight, FaCrown, FaUserTie } from 'react-icons/fa';

const OrganizationChartModal = ({ isOpen, onClose, department, employees }) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    if (!isOpen) return null;

    // Filter employees for the selected department
    const getDepartmentEmployees = () => {
        if (!employees || !department) return [];
        
        const departmentName = department.id;
        
        console.log(`Filtering ${employees.length} employees for ${departmentName} department`);
        const filtered = employees.filter(emp => {
            if (!emp) return false;
            
            // More comprehensive matching logic
            const empDepartment = emp.departmentId || emp.department || '';
            const empDesignation = emp.designation || '';
            const empRole = emp.role || '';
            
            // Check multiple fields for department matching
            const deptMatch = empDepartment.toLowerCase().includes(departmentName.toLowerCase());
            const designationMatch = empDesignation.toLowerCase().includes(departmentName.toLowerCase());
            const roleMatch = empRole.toLowerCase().includes(departmentName.toLowerCase());
            
            // Special cases for different department names
            let specialMatch = false;
            switch (departmentName) {
                case 'software':
                    specialMatch = empDesignation.toLowerCase().includes('developer') ||
                                 empDesignation.toLowerCase().includes('programmer') ||
                                 empDesignation.toLowerCase().includes('software') ||
                                 empDesignation.toLowerCase().includes('web') ||
                                 empDesignation.toLowerCase().includes('mobile') ||
                                 empDesignation.toLowerCase().includes('frontend') ||
                                 empDesignation.toLowerCase().includes('backend') ||
                                 empDesignation.toLowerCase().includes('fullstack') ||
                                 empDesignation.toLowerCase().includes('devops') ||
                                 empDesignation.toLowerCase().includes('ui/ux') ||
                                 empDesignation.toLowerCase().includes('qa') ||
                                 empDesignation.toLowerCase().includes('testing') ||
                                 empDepartment.toLowerCase().includes('software') ||
                                 empDepartment.toLowerCase().includes('r&d') ||
                                 empRole.toLowerCase().includes('software');
                    break;
                case 'marketing':
                    specialMatch = empDesignation.toLowerCase().includes('marketing') ||
                                 empDesignation.toLowerCase().includes('sales') ||
                                 empDesignation.toLowerCase().includes('business') ||
                                 empDepartment.toLowerCase().includes('sales');
                    break;
                case 'embedded':
                    specialMatch = empDesignation.toLowerCase().includes('embedded') ||
                                 empDesignation.toLowerCase().includes('firmware') ||
                                 empDesignation.toLowerCase().includes('hardware');
                    break;
                case 'quality':
                    specialMatch = empDesignation.toLowerCase().includes('quality') ||
                                 empDesignation.toLowerCase().includes('qa') ||
                                 empDesignation.toLowerCase().includes('test') ||
                                 empDesignation.toLowerCase().includes('qc');
                    break;
                case 'procurement':
                    specialMatch = empDesignation.toLowerCase().includes('procurement') ||
                                 empDesignation.toLowerCase().includes('purchase') ||
                                 empDesignation.toLowerCase().includes('supply') ||
                                 empDesignation.toLowerCase().includes('vendor');
                    break;
                case 'production':
                    specialMatch = empDesignation.toLowerCase().includes('production') ||
                                 empDesignation.toLowerCase().includes('manufacturing') ||
                                 empDesignation.toLowerCase().includes('operations') ||
                                 empDesignation.toLowerCase().includes('assembly');
                    break;
                default:
                    specialMatch = false;
            }
            

            
            // Additional fallback for managers who might belong to this department
            let managerFallback = false;
            if (departmentName === 'software') {
                // Only include managers who are explicitly related to software/tech
                const isManager = empDesignation.toLowerCase().includes('manager') || 
                                empDesignation.toLowerCase().includes('lead') ||
                                empRole.toLowerCase().includes('manager');
                
                if (isManager) {
                    // Only include managers with explicit software/tech keywords
                    managerFallback = empDesignation.toLowerCase().includes('tech') ||
                                    empDesignation.toLowerCase().includes('software') ||
                                    empDesignation.toLowerCase().includes('development') ||
                                    empDesignation.toLowerCase().includes('engineering') ||
                                    empDesignation.toLowerCase().includes('it') ||
                                    empDesignation.toLowerCase().includes('technical') ||
                                    empDesignation.toLowerCase().includes('dev') ||
                                    empDesignation.toLowerCase().includes('programmer') ||
                                    empDesignation.toLowerCase().includes('architect') ||
                                    empDesignation.toLowerCase().includes('fullstack') ||
                                    empDesignation.toLowerCase().includes('frontend') ||
                                    empDesignation.toLowerCase().includes('backend');
                    
                    // Explicitly exclude non-software managers
                    if (empDesignation.toLowerCase().includes('sales') ||
                        empDesignation.toLowerCase().includes('marketing') ||
                        empDesignation.toLowerCase().includes('hr') ||
                        empDesignation.toLowerCase().includes('finance') ||
                        empDesignation.toLowerCase().includes('admin') ||
                        empDesignation.toLowerCase().includes('business') ||
                        empDesignation.toLowerCase().includes('operations')) {
                        managerFallback = false;
                    }
                }
            }
            
            const matched = deptMatch || designationMatch || roleMatch || specialMatch || managerFallback;
            
            // Debug logging for software department
            if (departmentName === 'software' && matched) {
                console.log(`✅ Software Employee: ${emp.employeeName || emp.name || 'Unknown'} (${empDesignation})`);
            }
            
            return matched;
        });
        
        console.log(`Filtered result: ${filtered.length} employees match ${departmentName} department`);
        console.log('Matched employees:', filtered.map(emp => ({
            name: emp.employeeName || emp.name || 'Unknown',
            designation: emp.designation,
            department: emp.departmentId || emp.department
        })));
        
        return filtered;
    };

    // Build hierarchical structure
    const buildHierarchy = (employees) => {
        if (!employees || employees.length === 0) return [];
        
        const empMap = new Map();
        const roots = [];
        const managersInDept = new Set();

        // First pass: Create map of employees and identify managers
        employees.forEach(emp => {
            empMap.set(emp.employeeId, {
                ...emp,
                children: []
            });
            
            // Check if this employee is a manager based on designation or role
            const designation = (emp.designation || '').toLowerCase();
            const role = (emp.role || '').toLowerCase();
            if (designation.includes('manager') || designation.includes('lead') || 
                designation.includes('head') || designation.includes('director') ||
                role.includes('manager') || role.includes('lead')) {
                managersInDept.add(emp.employeeId);
            }
        });

        // Second pass: Build hierarchy
        employees.forEach(emp => {
            const employee = empMap.get(emp.employeeId);
            
            // Try to find manager relationship
            if (emp.managerId && empMap.has(emp.managerId)) {
                // Has a direct manager in this department
                const manager = empMap.get(emp.managerId);
                manager.children.push(employee);
            } else if (emp.teamLeadId && empMap.has(emp.teamLeadId)) {
                // Has a team lead in this department
                const teamLead = empMap.get(emp.teamLeadId);
                teamLead.children.push(employee);
            } else {
                // No direct manager found, check if this should be a root node
                const designation = (emp.designation || '').toLowerCase();
                const role = (emp.role || '').toLowerCase();
                
                // If this person is a manager/lead or no manager found, make them a root
                if (managersInDept.has(emp.employeeId) || 
                    designation.includes('manager') || designation.includes('head') || 
                    designation.includes('director') || designation.includes('lead')) {
                    roots.push(employee);
                } else {
                    // Try to find a manager in the same department to attach to
                    let attachedToManager = false;
                    for (let manager of employees) {
                        const managerDesignation = (manager.designation || '').toLowerCase();
                        if ((managerDesignation.includes('manager') || managerDesignation.includes('lead') || 
                             managerDesignation.includes('head')) && 
                            manager.employeeId !== emp.employeeId) {
                            const managerNode = empMap.get(manager.employeeId);
                            if (managerNode) {
                                managerNode.children.push(employee);
                                attachedToManager = true;
                                break;
                            }
                        }
                    }
                    
                    // If still not attached, make it a root
                    if (!attachedToManager) {
                        roots.push(employee);
                    }
                }
            }
        });

        // Sort roots by hierarchy (managers first, then by designation)
        roots.sort((a, b) => {
            const aDesig = (a.designation || '').toLowerCase();
            const bDesig = (b.designation || '').toLowerCase();
            
            // Directors/heads first
            if (aDesig.includes('director') || aDesig.includes('head')) return -1;
            if (bDesig.includes('director') || bDesig.includes('head')) return 1;
            
            // Then managers
            if (aDesig.includes('manager') && !bDesig.includes('manager')) return -1;
            if (bDesig.includes('manager') && !aDesig.includes('manager')) return 1;
            
            // Then leads
            if (aDesig.includes('lead') && !bDesig.includes('lead')) return -1;
            if (bDesig.includes('lead') && !aDesig.includes('lead')) return 1;
            
            return 0;
        });

        return roots;
    };

    const toggleNode = (employeeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(employeeId)) {
            newExpanded.delete(employeeId);
        } else {
            newExpanded.add(employeeId);
        }
        setExpandedNodes(newExpanded);
    };

    const getEmployeeIcon = (employee, hasChildren, level) => {
        if (level === 0) return <FaCrown size={18} />;
        if (hasChildren || employee.role?.toLowerCase().includes('manager') || employee.designation?.toLowerCase().includes('manager')) {
            return <FaUserTie size={16} />;
        }
        return <FaUser size={14} />;
    };

    const getEmployeeColors = (employee, hasChildren, level) => {
        if (level === 0) {
            return {
                bg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
                border: 'border-purple-300',
                cardBg: 'bg-gradient-to-r from-purple-50 to-indigo-50',
                text: 'text-purple-900'
            };
        }
        if (hasChildren || employee.role?.toLowerCase().includes('manager') || employee.designation?.toLowerCase().includes('manager')) {
            return {
                bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
                border: 'border-blue-300',
                cardBg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                text: 'text-blue-900'
            };
        }
        return {
            bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
            border: 'border-gray-300',
            cardBg: 'bg-gradient-to-r from-gray-50 to-gray-100',
            text: 'text-gray-900'
        };
    };

    const EmployeeNode = ({ employee, level = 0, isLast = false, parentConnector = '' }) => {
        const hasChildren = employee.children && employee.children.length > 0;
        const isExpanded = expandedNodes.has(employee.employeeId);
        const colors = getEmployeeColors(employee, hasChildren, level);

        return (
            <div className="relative">
                {/* Connecting Lines */}
                {level > 0 && (
                    <div className="absolute left-0 top-0 w-6 h-6">
                        {/* Vertical line from parent */}
                        <div className="absolute left-3 top-0 w-px h-3 bg-gray-300"></div>
                        {/* Horizontal line to node */}
                        <div className="absolute left-3 top-3 w-3 h-px bg-gray-300"></div>
                        {/* Vertical line to next sibling (if not last) */}
                        {!isLast && (
                            <div className="absolute left-3 top-3 w-px h-full bg-gray-300"></div>
                        )}
                    </div>
                )}

                {/* Employee Card */}
                <div className={`relative ${level > 0 ? 'ml-6' : ''} mb-4`}>
                    <div 
                        className={`
                            relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]
                            ${colors.cardBg} ${colors.border}
                            ${level === 0 ? 'shadow-xl' : hasChildren ? 'shadow-lg' : 'shadow-md'}
                            hover:shadow-xl
                        `}
                        onClick={() => hasChildren && toggleNode(employee.employeeId)}
                    >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <div className={`w-full h-full rounded-full ${colors.bg} -mr-10 -mt-10`}></div>
                        </div>

                        <div className="relative p-4">
                            <div className="flex items-center space-x-4">
                                {/* Expand/Collapse Button */}
                                {hasChildren && (
                                    <div className="flex-shrink-0">
                                        <div className="p-1 rounded-full bg-white shadow-sm">
                                            {isExpanded ? 
                                                <FaChevronDown className="text-gray-600" size={12} /> : 
                                                <FaChevronRight className="text-gray-600" size={12} />
                                            }
                                        </div>
                                    </div>
                                )}
                                
                                {/* Employee Avatar */}
                                <div className={`
                                    flex-shrink-0 p-3 rounded-full text-white shadow-lg
                                    ${colors.bg}
                                `}>
                                    {getEmployeeIcon(employee, hasChildren, level)}
                                </div>
                                
                                {/* Employee Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h4 className={`font-bold text-lg ${colors.text}`}>
                                            {employee.employeeName || 'Unknown'}
                                        </h4>
                                        {level === 0 && (
                                            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                                HEAD
                                            </span>
                                        )}
                                        {hasChildren && level > 0 && (
                                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                MANAGER
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        {employee.designation || 'No designation'}
                                    </p>
                                    {employee.email && (
                                        <p className="text-xs text-gray-600 truncate">
                                            {employee.email}
                                        </p>
                                    )}
                                    {employee.contactNo && (
                                        <p className="text-xs text-gray-600">
                                            📞 {employee.contactNo}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Reports Count */}
                                {hasChildren && (
                                    <div className="flex-shrink-0 text-center">
                                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
                                            <div className="text-lg font-bold text-gray-900">
                                                {employee.children.length}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Report{employee.children.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Children Nodes */}
                    {hasChildren && isExpanded && (
                        <div className="relative mt-4">
                            {/* Vertical line from parent to children */}
                            <div className="absolute left-3 top-0 w-px h-4 bg-gray-300"></div>
                            
                            <div className="ml-0">
                                {employee.children.map((child, index) => (
                                    <EmployeeNode 
                                        key={child.employeeId} 
                                        employee={child} 
                                        level={level + 1}
                                        isLast={index === employee.children.length - 1}
                                        parentConnector={parentConnector + (isLast ? ' ' : '│')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const departmentEmployees = getDepartmentEmployees();
    const hierarchy = buildHierarchy(departmentEmployees);

    // Auto-expand first level on load
    useEffect(() => {
        if (hierarchy.length > 0) {
            const firstLevelIds = hierarchy
                .filter(emp => emp.children && emp.children.length > 0)
                .map(emp => emp.employeeId);
            setExpandedNodes(new Set(firstLevelIds));
        }
    }, [department, employees]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {department?.label || 'Department'} Organization Chart
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {departmentEmployees.length} employee{departmentEmployees.length !== 1 ? 's' : ''} in this department
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <FaTimes className="text-gray-500 hover:text-gray-700" size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gradient-to-br from-gray-50 to-white">
                    {hierarchy.length > 0 ? (
                        <div className="space-y-6">
                            {/* Department Title */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
                                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                                        {department?.icon || <FaUsers />}
                                    </div>
                                    <span className="font-bold text-lg">
                                        {department?.label} Hierarchy
                                    </span>
                                </div>
                            </div>

                            {/* Organization Tree */}
                            <div className="relative">
                                {hierarchy.map((employee, index) => (
                                    <div key={employee.employeeId} className="relative">
                                        <EmployeeNode 
                                            employee={employee} 
                                            level={0}
                                            isLast={index === hierarchy.length - 1}
                                        />
                                        {index < hierarchy.length - 1 && (
                                            <div className="h-4"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FaUsers size={40} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                No employees found in {department?.label}
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-4">
                                No employees match the criteria for this department. This could be because:
                            </p>
                            <ul className="text-sm text-gray-500 max-w-md mx-auto text-left space-y-1">
                                <li>• Employees haven't been assigned to this department yet</li>
                                <li>• Department name doesn't match employee records</li>
                                <li>• Employee designations don't contain relevant keywords</li>
                            </ul>
                            <div className="mt-6 p-4 bg-gray-100 rounded-lg max-w-md mx-auto">
                                <p className="text-xs text-gray-600">
                                    <strong>Debug info:</strong> Searched for "{department?.id}" in {employees?.length || 0} total employees
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm">
                                    <FaCrown size={10} />
                                </div>
                                <span className="text-gray-700 font-medium">Department Head</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm">
                                    <FaUserTie size={10} />
                                </div>
                                <span className="text-gray-700 font-medium">Manager</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm">
                                    <FaUser size={10} />
                                </div>
                                <span className="text-gray-700 font-medium">Team Member</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">{departmentEmployees.length}</span> employees
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 rounded-lg transition-all duration-200 font-medium shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationChartModal;
