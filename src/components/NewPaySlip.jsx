import React from "react";
import html2pdf from 'html2pdf.js';
import logo from "../../src/assets/Icon/ddHealthcare.png"

const NewPaySlip = ({ setPayslipModel, payslipModelData }) => {
    const generatePDF = () => {
        try {
            const element = document.getElementById("invoice");
            if (!element) {
                console.error("Invoice element not found");
                return;
            }
            
            if (typeof html2pdf === 'undefined') {
                console.error("html2pdf library not loaded");
                return;
            }
            
            html2pdf().from(element).save();
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setPayslipModel(false)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    ← Go Back
                </button>
                <button
                    onClick={generatePDF}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                    <span className="mr-2">📤</span> Export
                </button>
            </div>
            <div id="invoice" className="border border-gray-300 font-sans text-[13px] text-gray-900">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <div>
                        <h1 className="text-xl font-semibold">D&D Healthcare</h1>
                        <p className="text-sm text-gray-700">Noida, India</p>
                        <p className="text-sm text-gray-700">{payslipModelData?.company_address}</p>
                    </div>
                    <img src={logo} alt="Logo" className="h-8 w-auto" />
                </div>

                {/* Title */}
                <div className="text-center font-semibold bg-gray-100 py-2 border-b border-gray-300">
                    Payslip for the month of {payslipModelData?.pay_slip_month}
                </div>

                {/* Employee Summary */}
                <div className="flex justify-between border-b border-gray-300 p-4">
                    <div className="w-1/2">
                        <div className="text-sm text-gray-500 font-bold">Employee Net Pay</div>
                        <div className="text-2xl font-bold text-black">₹{payslipModelData?.salary_details?.net_pay}</div>
                        <div className="text-sm">Paid Days : {payslipModelData?.leave_summary?.payable_days} | LOP Days : {payslipModelData?.leave_summary?.unpaid_days}</div>
                    </div>
                    <div className=" w-1/3 text-left">
                        <div className="mb-1">
                            <span className="font-bold ">Employee Name</span>: {payslipModelData?.employee_basic_details?.employee_name}
                        </div>
                        <div className="mb-1">
                            <span className="font-bold">Designation</span>: {payslipModelData?.employee_basic_details?.designation}
                        </div>
                        <div className="mb-1">
                            <span className="font-bold">Employee Code</span>: DD-{payslipModelData?.employee_basic_details?.employee_code}
                        </div>

                    </div>
                    <div className=" w-1/3 text-left">
                        <div className="mb-1">
                            <span className="font-bold">Date of Joining</span>: {payslipModelData?.employee_basic_details?.date_of_joining}
                        </div>
                        <div className="mb-1">
                            <span className="font-bold">Pay Period</span>: December 2023
                        </div>
                        <div>
                            <span className="font-bold">Pay Date</span>: 31/01/2024
                        </div>
                    </div>

                </div>
                {/* Bank details */}
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border-b border-gray-300 pb-2">
                        {[
                            { label: "Bank Name", value: payslipModelData?.employee_basic_details?.bank_name },
                            { label: "Bank IFSC Code", value: payslipModelData?.employee_basic_details?.bank_ifsc },
                            { label: "Bank Account Number", value: payslipModelData?.employee_basic_details?.bank_account },
                            { label: "Payment Mode", value: payslipModelData?.employee_basic_details?.payment_mode },
                            { label: "PAN Card Number", value: payslipModelData?.employee_basic_details?.employee_pan },
                            { label: "Aadhaar Number", value: payslipModelData?.employee_basic_details?.employee_aadhar },
                            { label: "UAN Number", value: payslipModelData?.employee_basic_details?.employee_uan },

                        ].map((item, index) => (
                            <div key={index} className="flex flex-col border-b border-gray-100 py-1">
                                <div className="font-bold">{item.label}</div>
                                <div>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Earnings / Deductions */}
                <div className="p-4">
                    {/* Earnings Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-sm font-semibold border-b border-gray-300 pb-2">
                        <div>EARNINGS</div>
                        <div>AMOUNT</div>
                    </div>

                    {[
                        { label: "Basic Salary", amount: payslipModelData?.salary_details?.basic_salary },
                        { label: "House Rent Allowance", amount: payslipModelData?.salary_details?.hra },
                        { label: "Travel Allowance", amount: payslipModelData?.salary_details?.travel_allowances },
                        { label: "Special Allowance", amount: payslipModelData?.salary_details?.special_allowances },
                    ].map((item, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 py-1 border-b border-gray-100">
                            <div className="font-bold">{item.label}</div>
                            <div>₹{item.amount}</div>
                        </div>
                    ))}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 py-2 font-semibold border-t border-gray-300 mt-2">
                        <div className="font-bold">Gross Earnings</div>
                        <div>₹{payslipModelData?.salary_details?.total_gross_salary}</div>
                    </div>

                    {/* Deductions Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-sm font-semibold border-t border-gray-300 pt-4 mt-6">
                        <div>DEDUCTIONS</div>
                        <div>AMOUNT</div>
                    </div>

                    {[
                        { label: "Transport and others", amount: payslipModelData?.salary_details?.transport_or_others },
                        { label: "Employee Provident Fund", amount: payslipModelData?.salary_details?.employee_pf },
                        { label: "Tax Deducted at Source", amount: payslipModelData?.salary_details?.tds },
                        { label: "Employee State Insurance", amount: payslipModelData?.salary_details?.employee_esi },
                        // { label: "Advance / Loan", amount: payslipModelData?.salary_details?.employee_esi },

                    ].map((item, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 py-1 border-b border-gray-100">
                            <div className="font-bold">{item.label}</div>
                            <div>₹{item.amount}</div>
                        </div>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 py-2 font-semibold border-t border-gray-300 mt-2">
                        <div className="font-bold">Total Deductions</div>
                        <div>₹{payslipModelData?.salary_details?.total_deduction}</div>
                    </div>
                </div>
                {/* Net Pay Section */}
                <div className="border-t border-gray-300 p-4 text-sm">
                    <div className="font-semibold mb-2">NET PAY</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="font-bold">Gross Earnings</div>
                        <div className="text-right">₹{payslipModelData?.salary_details?.total_gross_salary}</div>
                        <div className="font-bold">Total Deductions</div>
                        <div className="text-right">(-) ₹{payslipModelData?.salary_details?.total_deduction}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 border-t border-gray-300 pt-2 font-bold">
                        <div>Total Net Payable</div>
                        <div className="text-right">₹{payslipModelData?.salary_details?.net_pay}</div>
                    </div>
                </div>
                {/* Footer Note */}
                <div className="bg-gray-100 text-center p-4 text-sm font-medium">
                    Total Net Payable <span className="font-bold text-black">₹{payslipModelData?.salary_details?.net_pay}</span>
                    (Indian Rupee Eighty-Seven Thousand Three Hundred Only)
                    <div className="text-xs font-normal mt-1 italic">
                        **Total Net Payable = Gross Earnings - Total Deductions
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewPaySlip;
