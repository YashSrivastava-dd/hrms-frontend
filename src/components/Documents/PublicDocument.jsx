import React, { useEffect } from "react";
import { FiDownload, FiMoreVertical } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getEmoployeeDocumentsAction } from "../../store/action/userDataAction";

const PublicDocument = ({ onBack }) => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.employeeDocument);
  const publicDocuments = data?.data || [];

  useEffect(() => {
    dispatch(getEmoployeeDocumentsAction());
  }, [dispatch]);

  const renderDocumentPreview = (location, index) => {
    if (!location) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Preview Not Available
        </div>
      );
    }
    return (
      <iframe
        loading="lazy"
        src={`https://docs.google.com/gview?url=${location}&embedded=true`}
        className="object-cover h-36 w-full rounded"
        frameBorder="0"
        title={`Document Preview ${index}`}
      ></iframe>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading documents...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load documents. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <IoChevronBackOutline size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Public Documents</h1>
            <p className="text-gray-600 mt-1">Shared company documents and resources</p>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {publicDocuments.map((doc, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group w-full max-w-sm"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {renderDocumentPreview(doc?.location, index)}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
              
              <div className="p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {doc?.documentName || "Untitled Document"}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doc?.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {doc?.docType || "Unknown Type"}
                  </span>
                  <span>{doc?.createdAt?.split("T")[0] || "Unknown Date"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <a
                    href={doc?.location || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="filename.pdf"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Download
                  </a>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <FiMoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {publicDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Public Documents</h3>
            <p className="text-gray-500">No public documents are available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDocument;