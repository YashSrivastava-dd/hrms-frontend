import React from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import logo from "../../src/assets/Icon/ddHealthcare.png"
function PaySlipData({ setPayslipModel, payslipModelData }) {
    const navigate = useNavigate();
    console.log("payslipModelData", payslipModelData);

    const generatePDF = () => {
        const element = document.getElementById("invoice");
        html2pdf().from(element).save();
    };
    return (
        <>
            {/* Header actions */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setPayslipModel(false)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    ← Go Back
                </button>
                <button
                    onClick={generatePDF}
                    className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                >
                    <span className="mr-2">📤</span> Export
                </button>
            </div>
            <div id="invoice" className=" font-sans text-sm p-10">
                {/* image */}
                <div className="flex flex-col items-center justify-center" >
                    <img src={logo} />
                    <h1 className="font-bold">D&D Healthcare</h1>
                </div>
                {/* Title */}
                <h2 className="text-center font-bold text-base mb-1">
                    Pay Slip - Month: May 2025
                </h2>
                <p className="text-center mb-4">
                    A1, BLOCK A, SECTOR 83 NOIDA, UTTAR PRADESH 201301
                </p>

                {/* Employee Basic Details */}
                <table className="w-full border border-black border-collapse mb-4">
                    <thead>
                        <tr className="bg-gray-200 font-bold">
                            <td
                                className="border border-black px-2 py-1 text-start"
                                colSpan={4}
                            >
                                Employee Basic Details
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th className="border px-2 py-1 text-start text-start">
                                Employee Name
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.employee_name}
                            </td>
                            <th className="border px-2 py-1 text-start text-start">
                                Employee PAN Number
                            </th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.employee_basic_details?.employee_pan}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start text-start">
                                Employee Code
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                DD-{payslipModelData?.employee_basic_details?.employee_code}
                            </td>
                            <th className="border px-2 py-1 text-start text-start">
                                Employee Aadhaar Number
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.employee_aadhar}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start text-start">
                                Designation
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.designation}
                            </td>
                            <th className="border px-2 py-1 text-start text-start">
                                Bank Name
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.bank_name}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start text-start">
                                Date of Joining
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.date_of_joining}
                            </td>
                            <th className="border px-2 py-1 text-start text-start">
                                Bank IFSC Code
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.bank_ifsc}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start text-start">
                                Employee UAN Number
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.employee_uan}
                            </td>
                            <th className="border px-2 py-1 text-start text-start">
                                Bank Account Number
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.bank_account}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start text-start">
                                Employee ESIC Number
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.employee_esic}
                            </td>
                            <th className="border px-2 py-1 text-start text-start">
                                Payment Mode
                            </th>
                            <td className="border px-2 py-1 text-start text-start">
                                {payslipModelData?.employee_basic_details?.payment_mode}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Salary Breakdown */}
                <table className="w-full border border-black border-collapse mb-4">
                    <thead>
                        <tr className="bg-gray-200 font-bold">
                            <td
                                className="border border-black px-2 py-1 text-start"
                                colSpan={2}
                            >
                                Salary Breakdown
                            </td>
                            <td
                                className="border border-black px-2 py-1 text-start"
                                colSpan={2}
                            >
                                Deductions
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th className="border px-2 py-1 text-start">Basic Salary</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.basic_salary}
                            </td>
                            <th className="border px-2 py-1 text-start">Employee Provident Fund</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.employee_pf}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start">House Rent Allowance</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.hra}
                            </td>
                            <th className="border px-2 py-1 text-start">Employee State Insurance</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.employee_esi}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start">Travel Allowances</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.travel_allowances}
                            </td>
                            <th className="border px-2 py-1 text-start">Tax Deducted at Source</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.tds}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start">
                                Special Allowances
                            </th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.special_allowances}
                            </td>
                            <th className="border px-2 py-1 text-start">Loan Advance</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.loan_advance}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start">Arrears</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.arrears}
                            </td>
                            <th className="border px-2 py-1 text-start">Penalty</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.penalty}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start">Bonus/Others</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.bonus_or_others}
                            </td>
                            <th className="border px-2 py-1 text-start">Transport/Others</th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.transport_or_others}
                            </td>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-start">
                                Total A (Gross Salary)
                            </th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.total_gross_salary}
                            </td>
                            <th className="border px-2 py-1 text-start">
                                Total B (Deductions)
                            </th>
                            <td className="border px-2 py-1 text-start">
                                {payslipModelData?.salary_details?.total_deduction}
                            </td>
                        </tr>
                        <tr>
                            <th colSpan={2} className="border px-2 py-1 text-start">
                                Total Net Pay (A - B)
                            </th>
                            <td className="border px-2 py-1 text-start" colSpan={2}>
                                {payslipModelData?.salary_details?.employee_name}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Notes */}
                <p className="text-xs mt-2 italic">
                    *Note: All amounts displayed in this pay slip are in INR.
                </p>
                <p className="text-xs italic">
                    *This is a system-generated pay slip and does not require a signature.
                </p>
            </div>
        </>
    );
}

export default PaySlipData;
