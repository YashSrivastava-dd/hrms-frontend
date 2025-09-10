import React, { useState, useEffect } from 'react';
import { FaUpload, FaSpinner, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaChevronDown, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { postS3UploadDocAction, postUploadEmployeeDocumentsAction } from '../../store/action/userDataAction';

const DocumentUpload = ({ onBack }) => {
  const [formData, setFormData] = useState({
    documentName: '',
    docType: 'Public',
    employeeId: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0); // 0: not started, 1: uploading file, 2: saving metadata, 3: completed
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
  
  const dispatch = useDispatch();
  const { data, loading: reduxLoading } = useSelector((state) => state.userData);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDocTypeDropdown && !event.target.closest('.doc-type-dropdown')) {
        setShowDocTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDocTypeDropdown]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        file: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.documentName.trim()) {
      toast.error('Please enter a document name');
      return false;
    }
    if (!formData.file) {
      toast.error('Please select a file to upload');
      return false;
    }
    if (formData.docType === 'Private' && !formData.employeeId.trim()) {
      toast.error('Employee ID is required for private documents');
      return false;
    }
    return true;
  };

  const uploadFile = async (file) => {
    try {
      const response = await dispatch(postS3UploadDocAction(file));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const saveDocumentMetadata = async (uploadResponse) => {
    const payload = {
      documentName: formData.documentName,
      docType: formData.docType,
      location: uploadResponse.location
    };
    
    // Only add employeeId if docType is Private
    if (formData.docType === 'Private') {
      payload.employeeId = formData.employeeId;
    }
    
    try {
      const response = await dispatch(postUploadEmployeeDocumentsAction(payload));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setUploadStep(1);
    
    try {
      // Step 1: Upload file to S3
      const uploadResponse = await uploadFile(formData.file);
      
      setUploadStep(2);
      
      // Step 2: Save document metadata
      const saveResponse = await saveDocumentMetadata(uploadResponse);
      
      setUploadStep(3);
      toast.success('Document uploaded successfully!');
      
      // Reset form
      setFormData({
        documentName: '',
        docType: 'Public',
        employeeId: '',
        file: null
      });
      setShowDocTypeDropdown(false);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setUploadStep(0);
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);
      setUploadStep(0);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Upload failed. Please try again.');
      }
    }
  };

  const getStepIcon = (step) => {
    if (step < uploadStep) {
      return <FaCheckCircle className="text-green-500" />;
    } else if (step === uploadStep) {
      return <FaSpinner className="text-blue-500 animate-spin" />;
    } else {
      return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepText = (step) => {
    switch (step) {
      case 1:
        return 'Uploading file...';
      case 2:
        return 'Saving metadata...';
      case 3:
        return 'Upload completed!';
      default:
        return 'Ready to upload';
    }
  };

  // Custom Document Type Dropdown Component
  const CustomDocTypeDropdown = () => {
    const handleDocTypeSelect = (docType) => {
      setFormData(prev => ({
        ...prev,
        docType: docType
      }));
      setShowDocTypeDropdown(false);
    };

    const clearDocType = () => {
      setFormData(prev => ({
        ...prev,
        docType: 'Public'
      }));
      setShowDocTypeDropdown(false);
    };

    return (
      <div className="relative doc-type-dropdown">
        <button
          onClick={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
          className={`flex items-center justify-between w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 ${
            formData.docType 
              ? 'border-blue-300 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700'
          }`}
          disabled={loading}
        >
          <span className="text-gray-700">
            {formData.docType === 'Public' ? 'Public Document' : 'Private Document'}
          </span>
          <div className="flex items-center space-x-2">
            {formData.docType && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  clearDocType();
                }}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
              >
                <FaTimes className="w-3 h-3 text-blue-500" />
              </span>
            )}
            <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${
              showDocTypeDropdown ? 'rotate-180' : ''
            } ${formData.docType ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        </button>

        {showDocTypeDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transition-all duration-200 ease-in-out">
            <div className="p-2">
              <button
                onClick={() => handleDocTypeSelect('Public')}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  formData.docType === 'Public'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.docType === 'Public' ? 'border-white bg-white' : 'border-gray-300'
                  }`}></div>
                  <div>
                    <span className="font-medium">Public Document</span>
                    <p className="text-xs opacity-75">Visible to all employees</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleDocTypeSelect('Private')}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 mt-1 ${
                  formData.docType === 'Private'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.docType === 'Private' ? 'border-white bg-white' : 'border-gray-300'
                  }`}></div>
                  <div>
                    <span className="font-medium">Private Document</span>
                    <p className="text-xs opacity-75">Specific to an employee</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaUpload className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
                <p className="text-gray-600">Upload employee or public documents to the system</p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documentName"
                value={formData.documentName}
                onChange={handleInputChange}
                placeholder="Enter document name (e.g., Form16, Payslip, Policy)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <CustomDocTypeDropdown />
              <p className="text-xs text-gray-500 mt-1">
                Public documents are visible to all employees. Private documents are specific to an employee.
              </p>
            </div>

            {/* Employee ID - Only show for Private documents */}
            {formData.docType === 'Private' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="Enter employee ID (e.g., 415)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required={formData.docType === 'Private'}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for private documents to associate with specific employee
                </p>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
              </p>
              {formData.file && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <FaFileAlt />
                  <span>{formData.file.name}</span>
                  <span className="text-gray-500">({(formData.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FaSpinner className="text-blue-500 animate-spin" />
                  <span className="text-blue-700 font-medium">Upload Progress</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStepIcon(1)}
                    <span className="text-sm text-gray-700">Step 1: Upload file to S3</span>
                    {uploadStep === 1 && <span className="text-xs text-blue-600">- {getStepText(1)}</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStepIcon(2)}
                    <span className="text-sm text-gray-700">Step 2: Save document metadata</span>
                    {uploadStep === 2 && <span className="text-xs text-blue-600">- {getStepText(2)}</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStepIcon(3)}
                    <span className="text-sm text-gray-700">Step 3: Complete</span>
                    {uploadStep === 3 && <span className="text-xs text-green-600">- {getStepText(3)}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    documentName: '',
                    docType: 'Public',
                    employeeId: '',
                    file: null
                  });
                  setUploadStep(0);
                  setShowDocTypeDropdown(false);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                disabled={loading}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FaUpload />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* API Information */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">API Information</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Step 1:</strong> POST /api/s3/upload-doc - Uploads file to S3 and returns location URL</p>
            <p><strong>Step 2:</strong> POST /api/s3/upload-employee-document - Saves document metadata to database</p>
            <p><strong>Private Documents:</strong> Require employeeId field</p>
            <p><strong>Public Documents:</strong> Visible to all employees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
