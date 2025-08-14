import React, { useRef, useState } from 'react';
import { FaDownload, FaArrowLeft, FaUser, FaHome, FaCalculator, FaBuilding, FaSignature, FaSpinner } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import { safeSetLocalStorage } from '../utils/safariHelpers';

const TaxDeclarationView = ({ declaration, onBack }) => {
  const componentRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fallback print function using native browser print
  const handleNativePrint = () => {
    const printContent = componentRef.current;
    if (!printContent) {
      console.error('No content to print');
      return;
    }

    const originalTitle = document.title;
    document.title = `Tax_Declaration_${declaration?.employeeName?.replace(/\s+/g, '_')}_${declaration?.employeeId}`;
    
    // Add print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        .print-break {
          page-break-before: always;
        }
        @page {
          size: A4;
          margin: 20mm;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add print class
    printContent.classList.add('print-content');
    
    window.print();
    
    // Cleanup
    setTimeout(() => {
      document.title = originalTitle;
      document.head.removeChild(style);
      printContent.classList.remove('print-content');
    }, 1000);
  };

  // PDF generation using html2pdf.js
  const handleDownloadPdf = async () => {
    const element = componentRef.current;
    if (!element) {
      console.error('No content to convert to PDF');
      alert('PDF content not ready. Please try again.');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      console.log('Starting PDF generation...');
      console.log('Element to convert:', element);
      
      // Hide no-print elements
      const noPrintElements = element.querySelectorAll('.no-print');
      console.log('Found no-print elements:', noPrintElements.length);
      noPrintElements.forEach(el => {
        el.style.display = 'none';
      });

      const filename = `Tax_Declaration_${declaration?.employeeName?.replace(/\s+/g, '_') || 'Unknown'}_${declaration?.employeeId || 'Unknown'}.pdf`;
      console.log('Filename:', filename);
      
      const options = {
        margin: 0.5,
        filename: filename,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      console.log('PDF options:', options);
      console.log('html2pdf function:', html2pdf);
      
      // Try the PDF generation
      const pdf = html2pdf();
      console.log('PDF instance created:', pdf);
      
      await pdf.set(options).from(element).save();
      
      console.log('PDF generated successfully');
      
      // Restore no-print elements
      noPrintElements.forEach(el => {
        el.style.display = '';
      });
      
    } catch (error) {
      console.error('HTML2PDF error:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to generate PDF: ${error.message}. Please try the Print option instead.`);
      
      // Restore no-print elements in case of error
      const noPrintElements = element.querySelectorAll('.no-print');
      noPrintElements.forEach(el => {
        el.style.display = '';
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === '0') return '₹0';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  const renderDeductionSection = (title, items, icon) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left text-sm font-medium">Particulars</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-3 text-sm">
                    {item.particulars || item.nameOfChild || item.educationalInstitution || 'N/A'}
                  </td>
                  <td className="border border-gray-300 p-3 text-sm">
                    {formatCurrency(item.amountAnnual || item.amount || item.amountPaid || item.totalAmount || '0')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (!declaration) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <p className="text-gray-500">No declaration data available</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header with Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 no-print">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={() => {
                  // Update sidebar selection back to Tax Declarations
                  safeSetLocalStorage("selectedTag", "taxDeclarations");
                  
                  // Dispatch navigation event
                  const navigationEvent = new CustomEvent('navigationChange', {
                    detail: { tag: 'taxDeclarations' }
                  });
                  window.dispatchEvent(navigationEvent);
                  
                  // Call the original onBack function
                  onBack();
                }}
                className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Tax Declaration</h1>
              <p className="text-blue-100">View and export declaration details</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!declaration || isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FaDownload />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleNativePrint}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 font-medium"
              title="Print using browser"
              disabled={!declaration}
            >
              🖨️
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={componentRef} className="p-8">
        {/* Document Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">D&D Healthcare</h1>
          <h2 className="text-xl text-gray-700">INCOME TAX INVESTMENT DECLARATION FOR THE FY 2025-26</h2>
        </div>

        {/* Personal Details */}
        <div className="border border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <FaUser className="text-blue-600" />
            <span>Personal & Company Details</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Employee Name</label>
              <p className="text-gray-900 font-medium">{declaration.employeeName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Employee ID</label>
              <p className="text-gray-900 font-medium">{declaration.employeeId || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Designation</label>
              <p className="text-gray-900 font-medium">{declaration.designation || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Date of Joining</label>
              <p className="text-gray-900 font-medium">{formatDate(declaration.dateOfJoining)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Gender</label>
              <p className="text-gray-900 font-medium">{declaration.gender || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">PAN Number</label>
              <p className="text-gray-900 font-medium">{declaration.panNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Contact Number</label>
              <p className="text-gray-900 font-medium">{declaration.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Tax Regime</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                declaration.taxRegime === 'New' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {declaration.taxRegime} Tax Regime
              </span>
            </div>
          </div>
        </div>

        {/* Rental Details - Only for Old Regime */}
        {declaration.taxRegime === 'Old' && (declaration.rentPayablePerMonth || declaration.landlordName) && (
          <div className="border border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaHome className="text-blue-600" />
              <span>Rental Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Rent Per Month</label>
                <p className="text-gray-900 font-medium">{formatCurrency(declaration.rentPayablePerMonth)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Rent Start Date</label>
                <p className="text-gray-900 font-medium">{formatDate(declaration.rentStartDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Landlord Name</label>
                <p className="text-gray-900 font-medium">{declaration.landlordName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Landlord PAN</label>
                <p className="text-gray-900 font-medium">{declaration.landlordPan || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Property Address</label>
                <p className="text-gray-900 font-medium">{declaration.completeAddressOfRentedProperty || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Deductions - Only for Old Regime */}
        {declaration.taxRegime === 'Old' && declaration.deductions && (
          <div className="border border-gray-300 rounded-lg p-6 mb-6 print-break">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <FaCalculator className="text-blue-600" />
              <span>Tax Deductions</span>
            </h3>

            {renderDeductionSection(
              "Section 80CCC - Pension Funds",
              declaration.deductions.section80CCC,
              <FaCalculator className="text-gray-500" />
            )}

            {renderDeductionSection(
              "Section 80D - Medical Insurance",
              declaration.deductions.section80D,
              <FaCalculator className="text-gray-500" />
            )}

            {renderDeductionSection(
              "Section 80E - Education Loan",
              declaration.deductions.section80E,
              <FaCalculator className="text-gray-500" />
            )}

            {declaration.deductions.section80C && (
              <>
                {renderDeductionSection(
                  "Section 80C - Life Insurance Premium",
                  declaration.deductions.section80C.lifeInsurancePremium,
                  <FaCalculator className="text-gray-500" />
                )}

                {renderDeductionSection(
                  "Section 80C - PPF",
                  declaration.deductions.section80C.ppf,
                  <FaCalculator className="text-gray-500" />
                )}

                {renderDeductionSection(
                  "Section 80C - NSC Purchase",
                  declaration.deductions.section80C.nscPurchase,
                  <FaCalculator className="text-gray-500" />
                )}

                {renderDeductionSection(
                  "Section 80C - Infrastructure Bonds",
                  declaration.deductions.section80C.infrastructureBonds,
                  <FaCalculator className="text-gray-500" />
                )}

                {renderDeductionSection(
                  "Section 80C - Tuition Fees",
                  declaration.deductions.section80C.tuitionFees,
                  <FaCalculator className="text-gray-500" />
                )}
              </>
            )}

            {/* Other Deductions */}
            {declaration.deductions.section80CCD?.npsInvestmentAmount && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Section 80CCD - NPS Investment</h4>
                <p className="text-gray-900">{formatCurrency(declaration.deductions.section80CCD.npsInvestmentAmount)}</p>
              </div>
            )}

            {declaration.deductions.section80DD?.dependentMedicalExpenses && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Section 80DD - Dependent Medical Expenses</h4>
                <p className="text-gray-900">{formatCurrency(declaration.deductions.section80DD.dependentMedicalExpenses)}</p>
              </div>
            )}

            {declaration.deductions.section80DDB?.dependentMedicalTreatment && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Section 80DDB - Dependent Medical Treatment</h4>
                <p className="text-gray-900">{formatCurrency(declaration.deductions.section80DDB.dependentMedicalTreatment)}</p>
              </div>
            )}
          </div>
        )}

        {/* Housing Loan - Only for Old Regime */}
        {declaration.taxRegime === 'Old' && declaration.housingLoan && (
          <div className="border border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaBuilding className="text-blue-600" />
              <span>Housing Loan Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                <p className="text-gray-900 font-medium">{declaration.housingLoan.bankName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Loan Date</label>
                <p className="text-gray-900 font-medium">{formatDate(declaration.housingLoan.loanDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Loan Amount</label>
                <p className="text-gray-900 font-medium">{formatCurrency(declaration.housingLoan.loanAmount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Interest Repayment</label>
                <p className="text-gray-900 font-medium">{formatCurrency(declaration.housingLoan.repaymentInterest)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Principal Repayment</label>
                <p className="text-gray-900 font-medium">{formatCurrency(declaration.housingLoan.repaymentPrincipal)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Possession Date</label>
                <p className="text-gray-900 font-medium">{formatDate(declaration.housingLoan.dateOfTakingPossession)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Declaration - Only for Old Regime */}
        {declaration.taxRegime === 'Old' && declaration.declaration && (
          <div className="border border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <FaSignature className="text-blue-600" />
              <span>Declaration & Certification</span>
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                I certify that the particulars furnished above are correct. It is also requested that the Tax may be calculated on the basis of the above particulars and may be recovered from my salary. It is also certified that above investments or the payments have been made/will be made out of the income chargeable to tax during the Financial Year 2025-26.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Signature</label>
                <p className="text-gray-900 font-medium">{declaration.declaration.signature || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900 font-medium">{declaration.declaration.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Designation</label>
                <p className="text-gray-900 font-medium">{declaration.declaration.designation || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Generated on {formatDate(new Date().toISOString())}</p>
          <p>D&D Healthcare - Tax Declaration System</p>
        </div>
      </div>
    </div>
  );
};

export default TaxDeclarationView;
