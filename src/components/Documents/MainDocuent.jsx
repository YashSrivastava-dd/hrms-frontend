import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import PrivateIssueDocuments from "./IssueDocuments";
import PublicDocument from "./PublicDocument";
import UploadDocumentCard from "./UploadDocumentCard";
import { getUserDataAction } from "../../store/action/userDataAction";
import { useDispatch, useSelector } from "react-redux";
import { IoAdd } from "react-icons/io5";

const MainDocument = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { data } = useSelector((state) => state.userData);
  const userType = data?.data?.role;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserDataAction());
  }, [dispatch]);

  const handleOpenUploadModal = () => setUploadModalOpen(true);
  const handleCloseUploadModal = () => setUploadModalOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
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
                onClick={handleOpenUploadModal}
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

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <UploadDocumentCard onClose={handleCloseUploadModal} />
      )}
    </div>
  );
};

export default MainDocument;
