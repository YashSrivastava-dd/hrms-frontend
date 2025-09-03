import React from "react";
import logo from "../../src/assets/Icon/ddHealthcare.png";
import { toWords } from "number-to-words";
import moment from "moment";
import html2pdf from "html2pdf.js";

const NewPaySlip = ({ setPayslipModel, payslipModelData }) => {
  const generatePDF = () => {
    try {
      const element = document.getElementById("invoice");
      if (!element) {
        console.error("Invoice element not found");
        alert("Payslip content not ready. Please try again.");
        return;
      }
      
      // Generate descriptive filename
      const employeeCode = payslipModelData?.employee_basic_details?.employee_code || 'Unknown';
      const employeeName = payslipModelData?.employee_basic_details?.employee_name || 'Unknown';
      const month = payslipModelData?.pay_slip_month ? moment(payslipModelData.pay_slip_month).format("MMMM-YYYY") : 'Unknown-Month';
      
      // Sanitize filename by removing special characters
      const sanitizeFilename = (str) => str.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      const sanitizedEmployeeCode = sanitizeFilename(employeeCode);
      const sanitizedMonth = sanitizeFilename(month);
      
      // Create filename: DD-415-Payslip-June-2025.pdf
      const filename = `DD-${sanitizedEmployeeCode}-Payslip-${sanitizedMonth}.pdf`;
      
      console.log('Generating PDF with filename:', filename);
      
      // Configure html2pdf with filename
      const options = {
        margin: [0.2, 0.2, 0.2, 0.2], // Reduced margins: top, right, bottom, left
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5, // Reduced scale for better fit
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };
      
      html2pdf().set(options).from(element).save();
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const toTitleCase = (str) =>
    str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );

  const netPay =
    Number(payslipModelData?.salary_details?.total_gross_salary) -
    (Number(payslipModelData?.salary_details?.transport_or_others) +
      Number(payslipModelData?.salary_details?.employee_pf) +
      Number(payslipModelData?.salary_details?.tds) +
      Number(payslipModelData?.salary_details?.employee_esi) +
      Number(payslipModelData?.salary_details?.loan_advance));

  return (
    <>
      {/* Top buttons */}
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

      {/* Main Payslip Container */}
      <div
        id="invoice"
        className="mx-auto my-0 p-4 border border-gray-300 font-sans text-sm text-gray-900 bg-white"
        style={{ maxWidth: "794px" }} // A4 at 96 DPI
      >
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-gray-300">
          <div>
            <h1 className="text-2xl font-bold">D&D Healthcare</h1>
            <p className="text-xs text-gray-700">Noida, India</p>
            <p className="text-xs text-gray-700">
              {payslipModelData?.company_address}
            </p>
          </div>
          <img src={logo} alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center text-base font-semibold bg-gray-100 py-2 px-1 border-b border-gray-300 text-center">
          Payslip for the month of{" "}
          <span className="font-bold ml-1">
            {moment(payslipModelData?.pay_slip_month).format("MMMM YYYY")}
          </span>
        </div>

        {/* Employee Summary */}
        <div className="flex justify-between border-b border-gray-300 p-2">
          <div className="w-1/2">
            <div className="text-xs font-bold text-gray-500">
              Employee Fixed Gross
            </div>
            <div className="text-lg font-bold text-black">
              ₹ {payslipModelData?.salary_details?.net_pay}
            </div>
            <div className="text-xs">
              Paid Days: {payslipModelData?.leave_summary?.payable_days} | LOP
              Days: {payslipModelData?.leave_summary?.unpaid_days}
            </div>
          </div>

          <div className="w-1/3 text-left text-xs">
            <div className="mb-4">
              <span className="font-bold">Employee Name</span>:{" "}
              {payslipModelData?.employee_basic_details?.employee_name}
            </div>
            <div>
              <span className="font-bold">Employee Code</span>: DD-
              {payslipModelData?.employee_basic_details?.employee_code}
            </div>
          </div>

          <div className="w-1/3 text-left text-xs">
            <div className="mb-4">
              <span className="font-bold">Designation</span>:{" "}
              {payslipModelData?.employee_basic_details?.designation}
            </div>
            <div>
              <span className="font-bold">Date of Joining</span>:{" "}
              {payslipModelData?.employee_basic_details?.date_of_joining}
            </div>
          </div>
        </div>
        
        {/* Bank details */}
        <div className="p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs border-b border-gray-300 pb-2">
            {[...[
              { label: "Bank Name", value: payslipModelData?.employee_basic_details?.bank_name },
              { label: "Bank IFSC", value: payslipModelData?.employee_basic_details?.bank_ifsc },
              { label: "Bank Account", value: payslipModelData?.employee_basic_details?.bank_account },
              { label: "Payment Mode", value: payslipModelData?.employee_basic_details?.payment_mode },
              { label: "Pan Card", value: payslipModelData?.employee_basic_details?.employee_pan },
              { label: "Aadhaar Number", value: payslipModelData?.employee_basic_details?.employee_aadhar },
              { label: "UAN Number", value: payslipModelData?.employee_basic_details?.employee_uan },
              { label: "IP Number ( ESI )", value: payslipModelData?.salary_details?.employee_esi }
            ]].map((item, index) => (
              <div
                key={index}
                className="flex flex-col border-b border-gray-100 py-1"
              >
                <div className="font-bold">{item.label}</div>
                <div>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings and Deductions */}
        <div className="p-2 text-xs">
          <div className="grid grid-cols-2 gap-2 font-semibold border-b border-gray-300 pb-2">
            <div>EARNINGS</div>
            <div className="text-right">AMOUNT</div>
          </div>

          {[...[
            { label: "Basic", amount: payslipModelData?.salary_details?.basic_salary },
            { label: "House Rent Allowance", amount: payslipModelData?.salary_details?.hra },
            { label: "Travel Allowance", amount: payslipModelData?.salary_details?.travel_allowances },
            { label: "Special Allowance", amount: payslipModelData?.salary_details?.special_allowances }
          ]].map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
              <div className="font-medium">{item.label}</div>
              <div className="text-right">₹{item.amount}</div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 py-2 font-semibold border-t border-gray-300 mt-2">
            <div className="font-bold">Gross Earnings - A</div>
            <div className="text-right">
              ₹{payslipModelData?.salary_details?.total_gross_salary}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold border-t border-gray-300 pt-2 mt-2">
            <div>DEDUCTIONS</div>
            <div className="text-right">AMOUNT</div>
          </div>

          {[...[
            { label: "Employee EPF", amount: payslipModelData?.salary_details?.employee_pf },
            { label: "Employee ESI", amount: payslipModelData?.salary_details?.employee_esi },
            { label: "Employee TDS", amount: payslipModelData?.salary_details?.tds },
            { label: "Advance / Loan", amount: payslipModelData?.salary_details?.loan_advance },
            { label: "Transport and others", amount: payslipModelData?.salary_details?.transport_or_others },
            { label: "Penalty", amount: payslipModelData?.salary_details?.penalty }
          ]].map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 py-1 border-b border-gray-100">
              <div className="font-medium">{item.label}</div>
              <div className="text-right">₹{item.amount}</div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 py-2 font-semibold border-t border-gray-300 mt-1">
            <div className="font-bold">Total Deductions - B</div>
            <div className="text-right">
              ₹{(
                payslipModelData?.salary_details?.total_gross_salary - netPay
              ).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="border-t border-gray-300 p-1 text-sm">
          <div className="font-semibold mb-0.5">NET PAY</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-bold">Gross Earnings - A</div>
            <div className="text-right">
              ₹{payslipModelData?.salary_details?.total_gross_salary}
            </div>
            <div className="font-bold">Total Deductions - B</div>
            <div className="text-right text-red-700">
              (-) ₹
              {(
                payslipModelData?.salary_details?.total_gross_salary - netPay
              ).toFixed(2)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1 border-t border-gray-300 pt-1 font-bold">
            <div>Total Net Payable (A - B)</div>
            <div className="text-right text-green-700">
              ₹{netPay.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-100 text-center p-1 text-xs font-normal italic">
          Total Net Payable{" "}
          <span className="font-bold text-black not-italic">
            ₹{netPay.toFixed(2)}
          </span>{" "}
          Inr {toTitleCase(toWords(Number(netPay.toFixed(0))))} Only
          <div className="text-xs font-normal mt-0.5">
            **Total Net Payable = Gross Earnings - Total Deductions
          </div>
        </div>
      </div>
    </>
  );
};

export default NewPaySlip;