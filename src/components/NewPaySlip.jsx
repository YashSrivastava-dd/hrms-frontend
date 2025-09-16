import React, { useState } from "react";
import logo from "../../src/assets/Icon/ddHealthcare.png";
import { toWords } from "number-to-words";
import moment from "moment";
import html2pdf from "html2pdf.js";

const NewPaySlip = ({ setPayslipModel, payslipModelData }) => {
  const [previewMode, setPreviewMode] = useState(false);
  
  // Sample data for preview
  const sampleData = {
    pay_slip_month: '2024-12-01',
    company_address: 'A1, BLOCK A, SECTOR 83, NOIDA, UTTAR PRADESH 201301',
    employee_basic_details: {
      employee_name: 'John Doe',
      employee_code: '001',
      designation: 'Software Developer',
      date_of_joining: '2024-01-15',
      employee_pan: 'ABCDE1234F',
      employee_aadhar: '1234-5678-9012',
      bank_name: 'HDFC Bank',
      bank_ifsc: 'HDFC0001234',
      bank_account: '1234567890',
      employee_uan: '123456789012',
      employee_esic: '123456789012345',
      payment_mode: 'Bank Transfer'
    },
    leave_summary: {
      month_days: '31',
      unpaid_days: '0',
      payable_days: '31',
      absent: 0.0,
      workedDays: 31.0
    },
    salary_details: {
      gross_salary: '50000',
      basic_salary: '25000',
      hra: '10000',
      travel_allowances: '5000',
      special_allowances: '10000',
      arrears: '0',
      bonus_or_others: '0',
      total_gross_salary: '50000',
      employee_pf: '3000',
      employee_esi: '375',
      tds: '0',
      loan_advance: '0',
      penalty: '0',
      transport_or_others: '0',
      total_deduction: '3375',
      net_pay: '46625'
    }
  };
  
  // Use sample data if in preview mode, otherwise use actual data
  const displayData = previewMode ? sampleData : payslipModelData;
  
  // Debug: Log the data being used
  console.log('NewPaySlip displayData:', displayData);
  console.log('Gross salary from displayData:', displayData?.salary_details?.gross_salary);
  console.log('Gross salary from payslipModelData:', payslipModelData?.salary_details?.gross_salary);
  console.log('Total gross salary:', displayData?.salary_details?.total_gross_salary);
  console.log('Preview mode:', previewMode);
  console.log('Salary details:', displayData?.salary_details);
  console.log('Form data from GenerateSalarySlip:', payslipModelData);
  console.log('Final gross salary value:', displayData?.salary_details?.gross_salary || payslipModelData?.salary_details?.gross_salary || '0.00');
  
  // Debug: Check if the data is the same object
  console.log('Are displayData and payslipModelData the same?', displayData === payslipModelData);
  console.log('displayData salary_details keys:', Object.keys(displayData?.salary_details || {}));
  console.log('payslipModelData salary_details keys:', Object.keys(payslipModelData?.salary_details || {}));
  
  // Check if gross_salary exists in the data
  console.log('Does displayData have gross_salary?', 'gross_salary' in (displayData?.salary_details || {}));
  console.log('Does payslipModelData have gross_salary?', 'gross_salary' in (payslipModelData?.salary_details || {}));
  
  // Check the actual values
  console.log('displayData.salary_details.gross_salary:', displayData?.salary_details?.gross_salary);
  console.log('payslipModelData.salary_details.gross_salary:', payslipModelData?.salary_details?.gross_salary);
  const generatePDF = () => {
    try {
      const element = document.getElementById("invoice");
      if (!element) {
        console.error("Invoice element not found");
        alert("Payslip content not ready. Please try again.");
        return;
      }
      
      // Generate descriptive filename
      const employeeCode = displayData?.employee_basic_details?.employee_code || 'Unknown';
      const employeeName = displayData?.employee_basic_details?.employee_name || 'Unknown';
      const month = displayData?.pay_slip_month ? moment(displayData.pay_slip_month).format("MMMM-YYYY") : 'Unknown-Month';
      
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
    Number(displayData?.salary_details?.total_gross_salary) -
    (Number(displayData?.salary_details?.transport_or_others) +
      Number(displayData?.salary_details?.employee_pf) +
      Number(displayData?.salary_details?.tds) +
      Number(displayData?.salary_details?.employee_esi) +
      Number(displayData?.salary_details?.loan_advance) +
      Number(displayData?.salary_details?.penalty));

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              previewMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">👁️</span> 
            {previewMode ? 'Live Data' : 'Preview'}
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            <span className="mr-2">📤</span> Export
          </button>
        </div>
      </div>

      {/* Preview Mode Indicator */}
      {previewMode && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <strong>Preview Mode:</strong> You are viewing sample data. Click "Live Data" to see actual employee data.
          </div>
        </div>
      )}

      {/* Main Payslip Container */}
      <div
        id="invoice"
        className="mx-auto mt-16 mb-8 pt-6 px-8 pb-6 border border-gray-300 font-sans text-xs text-gray-900 bg-white"
        style={{ maxWidth: "794px", maxHeight: "1123px" }} // A4 at 96 DPI
      >
        {/* Header */}
        <div className="flex justify-between items-center p-1 border-b border-gray-300">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <div className="text-right">
            <h1 className="text-lg font-bold">D&D Healthcare</h1>
            <p className="text-xs text-gray-700">Noida, India</p>
            <p className="text-xs text-gray-700">
              {displayData?.company_address}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center text-sm font-semibold bg-gray-100 py-1 px-1 border-b border-gray-300 text-center mt-3">
          Payslip for the month of{" "}
          <span className="font-bold ml-1">
            {displayData?.pay_slip_month ? moment(displayData.pay_slip_month, "MMMM YYYY").format("MMMM YYYY") : 'Invalid date'}
          </span>
        </div>

        {/* Employee Summary */}
        <div className="flex justify-between items-start border-b border-gray-300 p-2">
          <div className="flex-1 pr-3">
            <div className="text-xs font-bold text-black mb-1">
              Fixed Gross Salary
            </div>
            <div className="text-lg font-bold text-black mb-1">
              ₹ {displayData?.salary_details?.fixed_gross_salary || displayData?.salary_details?.gross_salary || payslipModelData?.salary_details?.fixed_gross_salary || payslipModelData?.salary_details?.gross_salary || '0.00'}
            </div>
            <div className="text-xs text-gray-600">
              Paid Days: {displayData?.leave_summary?.payable_days || 0} | LOP Days: {Math.max(0, (parseFloat(displayData?.leave_summary?.payable_days || 0) - parseFloat(displayData?.leave_summary?.workedDays || 0)))}
            </div>
          </div>

          <div className="flex-1 text-left text-xs">
            <div className="mb-1">
              <span className="font-bold">Employee Name</span>:{" "}
              {displayData?.employee_basic_details?.employee_name}
            </div>
            <div className="mb-1">
              <span className="font-bold">Employee Code</span>: DD-
              {displayData?.employee_basic_details?.employee_code}
            </div>
            <div className="mb-1">
              <span className="font-bold">Designation</span>:{" "}
              {displayData?.employee_basic_details?.designation}
            </div>
            <div>
              <span className="font-bold">Date of Joining</span>:{" "}
              {displayData?.employee_basic_details?.date_of_joining}
            </div>
          </div>
        </div>
        
        {/* Bank details */}
        <div className="p-1">
          <div className="grid grid-cols-4 gap-1 text-xs border-b border-gray-300 pb-2">
            {[...[
              { label: "Bank Name", value: displayData?.employee_basic_details?.bank_name },
              { label: "Bank IFSC", value: displayData?.employee_basic_details?.bank_ifsc },
              { label: "Bank Account", value: displayData?.employee_basic_details?.bank_account },
              { label: "Payment Mode", value: displayData?.employee_basic_details?.payment_mode },
              { label: "Pan Card", value: displayData?.employee_basic_details?.employee_pan },
              { label: "Aadhaar Number", value: displayData?.employee_basic_details?.employee_aadhar },
              { label: "UAN Number", value: displayData?.employee_basic_details?.employee_uan },
              { label: "IP Number ( ESI )", value: displayData?.salary_details?.employee_esi }
            ]].map((item, index) => (
              <div
                key={index}
                className="flex flex-col py-1 px-1 bg-gray-50 border border-gray-300"
              >
                <div className="font-bold text-black mb-1 text-xs">{item.label}</div>
                <div className="text-black break-words text-xs">{item.value || "--"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings and Deductions */}
        <div className="p-1 text-xs">
          {/* Earnings Section */}
          <div className="mb-2">
            <div className="grid grid-cols-2 gap-4 font-bold bg-gray-100 text-black py-1 px-2 border border-gray-300">
              <div>EARNINGS</div>
              <div className="text-right">AMOUNT</div>
            </div>

            {(() => {
              const adjustedGross = parseFloat(displayData?.salary_details?.total_gross_salary || 0);
              const basicSalary = adjustedGross * 0.5; // 50% of adjusted gross
              const hra = basicSalary * 0.4; // 40% of basic
              const travelAllowances = basicSalary * 0.2; // 20% of basic
              const specialAllowances = basicSalary * 0.4; // 40% of basic
              
              return [
                { label: "Basic", amount: basicSalary },
                { label: "House Rent Allowance", amount: hra },
                { label: "Travel Allowance", amount: travelAllowances },
                { label: "Special Allowance", amount: specialAllowances }
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 py-1 px-2 border-l border-r border-b border-gray-300 bg-white">
                  <div className="font-medium text-black">{item.label}</div>
                  <div className="text-right font-semibold text-black">₹{parseFloat(item.amount || 0).toFixed(2)}</div>
                </div>
              ));
            })()}

            <div className="grid grid-cols-2 gap-4 py-1 px-2 font-bold bg-gray-200 text-black border border-gray-300">
              <div>Gross Earnings - A</div>
              <div className="text-right text-sm">
                ₹{parseFloat(displayData?.salary_details?.total_gross_salary || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="mb-2">
            <div className="grid grid-cols-2 gap-4 font-bold bg-gray-100 text-black py-1 px-2 border border-gray-300">
              <div>DEDUCTIONS</div>
              <div className="text-right">AMOUNT</div>
            </div>

            {[...[
              { label: "PF Employee Share", amount: displayData?.salary_details?.employee_pf },
              { label: "ESI Employee Contribution", amount: displayData?.salary_details?.employee_esi },
              { label: "Employee TDS", amount: displayData?.salary_details?.tds },
              { label: "Advance / Loan", amount: displayData?.salary_details?.loan_advance },
              { label: "Transport and others", amount: displayData?.salary_details?.transport_or_others },
              { label: "Penalty", amount: displayData?.salary_details?.penalty }
            ]].map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 py-1 px-2 border-l border-r border-b border-gray-300 bg-white">
                <div className="font-medium text-black">{item.label}</div>
                <div className="text-right font-semibold text-black">₹{parseFloat(item.amount || 0).toFixed(2)}</div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4 py-1 px-2 font-bold bg-gray-200 text-black border border-gray-300">
              <div>Total Deductions - B</div>
              <div className="text-right text-sm">
                ₹{(
                  parseFloat(displayData?.salary_details?.employee_pf || 0) +
                  parseFloat(displayData?.salary_details?.employee_esi || 0) +
                  parseFloat(displayData?.salary_details?.tds || 0) +
                  parseFloat(displayData?.salary_details?.loan_advance || 0) +
                  parseFloat(displayData?.salary_details?.transport_or_others || 0) +
                  parseFloat(displayData?.salary_details?.penalty || 0)
                ).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="border-t-2 border-gray-400 p-2 text-xs bg-gray-50">
          <div className="font-bold text-base mb-2 text-center text-black">NET PAY CALCULATION</div>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="font-bold text-black">Gross Earnings - A</div>
            <div className="text-right font-semibold text-black">
              ₹{parseFloat(displayData?.salary_details?.total_gross_salary || 0).toFixed(2)}
            </div>
            <div className="font-bold text-black">Total Deductions - B</div>
            <div className="text-right font-semibold text-black">
              (-) ₹{(
                parseFloat(displayData?.salary_details?.employee_pf || 0) +
                parseFloat(displayData?.salary_details?.employee_esi || 0) +
                parseFloat(displayData?.salary_details?.tds || 0) +
                parseFloat(displayData?.salary_details?.loan_advance || 0) +
                parseFloat(displayData?.salary_details?.transport_or_others || 0) +
                parseFloat(displayData?.salary_details?.penalty || 0)
              ).toFixed(2)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2 px-2 bg-gray-200 border-2 border-gray-400 font-bold text-base">
            <div className="text-black">Total Net Pay (A - B)</div>
            <div className="text-right text-black">
              ₹{netPay.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-100 text-center p-1 text-xs font-normal italic">
          Total Net Pay{" "}
          <span className="font-bold text-black not-italic">
            ₹{netPay.toFixed(2)}
          </span>{" "}
          INR {toTitleCase(toWords(Number(netPay.toFixed(0))))} Only
        </div>

        {/* Computer Generated Disclaimer */}
        <div className="text-center p-3 text-xs text-gray-600 border-t border-gray-300 mt-2">
          This is a computer-generated pay slip and does not require a signature.
        </div>
      </div>
    </>
  );
};

export default NewPaySlip;