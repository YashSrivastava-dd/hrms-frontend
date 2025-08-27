import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';

const VendorMeetingLeaveBalance = ({ employeeId }) => {
    const dispatch = useDispatch();
    const [vendorMeetingHistory, setVendorMeetingHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Get user data from store
    const { data: userData } = useSelector((state) => state.userData);
    const leaveBalance = userData?.data?.leaveBalance;

    // Mock data for vendor meeting history (replace with actual API call)
    const mockVendorMeetingHistory = [
        {
            id: 1,
            date: '2025-01-15',
            duration: 'fullDay',
            totalDays: 1,
            reason: 'Meeting with software vendor for project requirements',
            status: 'approved'
        },
        {
            id: 2,
            date: '2025-01-10',
            duration: 'firstHalf',
            totalDays: 0.5,
            reason: 'Vendor presentation on new tools',
            status: 'approved'
        },
        {
            id: 3,
            date: '2025-01-08',
            duration: 'fullDay',
            totalDays: 1,
            reason: 'Contract negotiation with service provider',
            status: 'pending'
        },
        {
            id: 4,
            date: '2025-01-05',
            duration: 'secondHalf',
            totalDays: 0.5,
            reason: 'Product demo with vendor team',
            status: 'approved'
        },
        {
            id: 5,
            date: '2025-01-03',
            duration: 'fullDay',
            totalDays: 1,
            reason: 'Annual vendor review meeting',
            status: 'approved'
        }
    ];

    useEffect(() => {
        // In a real implementation, you would fetch vendor meeting history here
        setVendorMeetingHistory(mockVendorMeetingHistory);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDurationText = (duration) => {
        switch (duration) {
            case 'firstHalf':
                return 'First Half';
            case 'secondHalf':
                return 'Second Half';
            case 'fullDay':
                return 'Full Day';
            default:
                return duration;
        }
    };

    const calculateTotalVendorMeetingDays = () => {
        return vendorMeetingHistory
            .filter(meeting => meeting.status === 'approved')
            .reduce((total, meeting) => total + meeting.totalDays, 0);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Vendor Meeting Leave Balance
                </h2>
                <p className="text-gray-600">
                    Track your vendor meeting usage and its impact on leave balance
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-700">Regular Leave Balance</div>
                    <div className="text-3xl font-bold text-green-900">
                        {leaveBalance?.earnedLeave || 0} days
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                        Earned Leave Available
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-sm font-medium text-purple-700">Vendor Meeting Limit</div>
                    <div className="text-3xl font-bold text-purple-900">
                        7 days
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                        Per request maximum
                    </div>
                </div>
            </div>

            {/* Key Information */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Important Notes
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Vendor meetings do not consume your regular leave balance</li>
                    <li>• These are tracked separately for reporting and compliance purposes</li>
                    <li>• Maximum 7 days per vendor meeting request</li>
                    <li>• Can only be applied for dates between yesterday and the last 30 days</li>
                    <li>• Minimum duration is 0.5 days (half day)</li>
                </ul>
            </div>

            {/* Vendor Meeting History with Scroller */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Vendor Meeting History
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                        Days
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vendorMeetingHistory.map((meeting) => (
                                    <tr key={meeting.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {dayjs(meeting.date).format('MMM DD, YYYY')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getDurationText(meeting.duration)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {meeting.totalDays} {meeting.totalDays === 1 ? 'day' : 'days'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {meeting.reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                                                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {vendorMeetingHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No vendor meeting history available
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorMeetingLeaveBalance;
