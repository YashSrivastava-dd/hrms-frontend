import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import PrivateIssueDocuments from "./IssueDocuments";
import PublicDocument from "./PublicDocument";
import { getUserDataAction, postUploadEmployeeDocumentsAction } from "../../store/action/userDataAction";
import { useDispatch, useSelector } from "react-redux";
import { IoAdd } from "react-icons/io5";
import { toast } from "react-toastify";

const MainDocument = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    docType: "Public",
    documentName: "",
    employeeId: "",
    location: null, // location will hold the file
  });
  const { data } = useSelector((state) => state.userData);
  const userType = data?.data?.role;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserDataAction());
  }, [dispatch]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      // Handle file input (assign the file to location)
      setFormData((prev) => ({ ...prev, location: files[0] })); // Set the first selected file
    } else {
      // Handle other form inputs (text fields)
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure that location (the file) is available before proceeding
    if (!formData.location) {
      toast.error("Please select a document to upload.");
      return;
    }

    // Create a new FormData object to handle the file upload
    const fileData = new FormData();

    // Append the form data
    fileData.append("docType", formData.docType);
    fileData.append("documentName", formData.documentName);
    fileData.append("employeeId", formData.employeeId);

    // Append the selected file under the 'file' field
    fileData.append("file", formData.location); // Here, 'location' contains the file

    // Log the FormData object to the console for debugging
    for (let pair of fileData.entries()) {
      console.log(pair[0], pair[1]); // Log each field and value (including file)
    }

    // Dispatch the action with the FormData
    dispatch(postUploadEmployeeDocumentsAction(fileData));

    // Close the modal after submission
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <ToastContainer />
      {selectedComponent === "private" && (
        <PrivateIssueDocuments onBack={() => setSelectedComponent(null)} />
      )}
      {selectedComponent === "public" && (
        <PublicDocument onBack={() => setSelectedComponent(null)} />
      )}

      {!selectedComponent && (
        <div className="w-full">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Document Center</h1>
                  <p className="text-gray-600">Access and manage your important documents</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userType === "HR-Admin" && (
              <div 
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                onClick={handleOpenModal}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6 h-48 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                      <IoAdd className="text-white text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Add Document</h2>
                    <p className="text-blue-100 text-sm">Upload new documents to the system</p>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <span className="text-sm font-medium">Click to upload</span>
                    <FiArrowRight className="ml-2" size={16} />
                  </div>
                </div>
              </div>
            )}
            
            <div 
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
              onClick={() => setSelectedComponent("private")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 h-48 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Private Documents</h2>
                  <p className="text-gray-300 text-sm">Access your confidential documents</p>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-sm font-medium">View documents</span>
                  <FiArrowRight className="ml-2" size={16} />
                </div>
              </div>
            </div>

            <div 
              className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
              onClick={() => setSelectedComponent("public")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 h-48 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Public Documents</h2>
                  <p className="text-green-100 text-sm">Browse shared company documents</p>
                </div>
                <div className="flex items-center text-green-100">
                  <span className="text-sm font-medium">View documents</span>
                  <FiArrowRight className="ml-2" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Document</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">Upload a new document to the system</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  name="docType"
                  value={formData.docType}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="Public">Public Document</option>
                  <option value="Private">Private Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                <input
                  type="text"
                  name="documentName"
                  value={formData.documentName}
                  onChange={handleChange}
                  placeholder="Enter document name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document File</label>
                <div className="relative">
                  <input
                    type="file"
                    name="location"
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, XLS, XLSX</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDocument;
