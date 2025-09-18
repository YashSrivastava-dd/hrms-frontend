import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiDownload, FiMoreVertical, FiEye, FiFileText, FiSearch, FiUser, FiCalendar } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { getHrAllPrivateDocsAction } from "../../store/action/userDataAction";

const HrPrivateDocuments = ({ onBack }) => {
  const { loading, data, error } = useSelector((state) => state.hrAllPrivateDocs);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // all, documentName, employeeName, description
  
  
  console.log('HR All Private Documents Data:', data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getHrAllPrivateDocsAction());
  }, [dispatch]);

  // Filter documents based on search term and filter type
  const filteredDocuments = useMemo(() => {
    const documentsToFilter = data?.data;
    
    if (!documentsToFilter || !Array.isArray(documentsToFilter)) return [];
    
    if (!searchTerm.trim()) return documentsToFilter;

    return documentsToFilter.filter((doc) => {
      const searchLower = searchTerm.toLowerCase();
      
      switch (filterBy) {
        case "documentName":
          return doc?.documentName?.toLowerCase().includes(searchLower);
        case "employeeName":
          return doc?.employeeName?.toLowerCase().includes(searchLower) || 
                 doc?.employeeCode?.toLowerCase().includes(searchLower);
        case "description":
          return doc?.description?.toLowerCase().includes(searchLower);
        case "all":
        default:
          return (
            doc?.documentName?.toLowerCase().includes(searchLower) ||
            doc?.employeeName?.toLowerCase().includes(searchLower) ||
            doc?.employeeCode?.toLowerCase().includes(searchLower) ||
            doc?.description?.toLowerCase().includes(searchLower)
          );
      }
    });
  }, [searchTerm, filterBy, data?.data]);

  const renderDocumentPreview = (location, index) => {
    if (!location) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <FiFileText size={48} />
          <span className="ml-2">Preview Not Available</span>
        </div>
      );
    }

    // Simple preview - just show file icon for all types
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <FiFileText size={64} />
      </div>
    );
  };

  const handleViewDocument = (location, documentName) => {
    if (!location || location.trim() === '') {
      alert('Document location not available. The file may not have been uploaded properly.');
      return;
    }

    console.log('Opening document:', { location, documentName });
    setDocumentLoading(true);
    setSelectedDocument({
      location: location.trim(),
      documentName
    });
  };

  const closeDocumentViewer = () => {
    setSelectedDocument(null);
    setDocumentLoading(false);
  };

  const handleDownload = (location, documentName) => {
    if (!location) {
      alert('Download link not available');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = location;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(location, '_blank');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      {/* Header Section */}
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <IoChevronBackOutline size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Private Documents</h1>
              <p className="text-gray-600 mt-1">View and manage all employee private documents</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="lg:w-64">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Search in all fields</option>
                <option value="documentName">Document name</option>
                <option value="employeeName">Employee name/code</option>
                <option value="description">Description</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredDocuments.length} of {data?.data?.length || 0} documents
          </div>
        </div>
        
        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group w-full max-w-sm"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {renderDocumentPreview(doc?.location, index)}
              </div>
              
              <div className="p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {doc?.documentName || "Untitled Document"}
                </h2>
                
                {/* Employee Information */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiUser className="mr-2" size={14} />
                  <span className="truncate">
                    {doc?.employeeName || "Unknown Employee"}
                    {doc?.employeeCode && ` (${doc?.employeeCode})`}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doc?.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" size={12} />
                    <span>{doc?.createdAt?.split("T")[0] || "Unknown Date"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDocument(doc?.location, doc?.documentName)}
                    className="flex-1 flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <FiEye className="mr-2" size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(doc?.location, doc?.documentName)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Download
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <FiMoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {(!data?.data || data?.data?.length === 0) && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Private Documents</h3>
              <p className="text-gray-600 mb-4">No private documents are available at the moment.</p>
              <div className="text-sm text-gray-500">Private documents will appear here once they are uploaded by employees</div>
            </div>
          </div>
        )}

        {data?.data && data?.data?.length > 0 && filteredDocuments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Documents Found</h3>
              <p className="text-gray-600 mb-4">No documents match your search criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBy("all");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {selectedDocument.documentName || "Document Preview"}
              </h3>
              <button
                onClick={closeDocumentViewer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-hidden relative">
              {documentLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-3 text-gray-600 font-medium">Loading document preview...</p>
                  </div>
                </div>
              )}
              
              {/* Universal document viewer with multiple fallbacks */}
              <div className="w-full h-full relative">
                {/* Try direct image first for common formats */}
                {(() => {
                  const isCommonImage = selectedDocument.location && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedDocument.location);
                  console.log('=== MODAL DEBUG ===');
                  console.log('Selected document:', selectedDocument);
                  console.log('Is common image format?', isCommonImage);
                  console.log('Image URL for direct display:', selectedDocument.location);
                  
                  if (isCommonImage) {
                    return (
                      <img
                        src={selectedDocument.location}
                        alt="Document Preview"
                        className="direct-image w-full h-full object-contain rounded-lg"
                        onLoad={(e) => {
                          console.log('✅ Image loaded successfully');
                          console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                          setDocumentLoading(false);
                        }}
                        onError={(e) => {
                          console.log('❌ Direct image loading failed');
                          console.log('Image error event:', e);
                          console.log('Image src that failed:', e.target.src);
                          // Hide the image and show iframe instead
                          const iframe = document.querySelector('.fallback-iframe');
                          const image = document.querySelector('.direct-image');
                          if (iframe) iframe.style.display = 'block';
                          if (image) image.style.display = 'none';
                        }}
                      />
                    );
                  }
                  return null;
                })()}
                
                {/* Google Docs Viewer for documents and .heic files */}
                <iframe
                  src={(() => {
                    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(selectedDocument.location)}&embedded=true`;
                    console.log('🔍 Google Docs Viewer URL:', googleDocsUrl);
                    return googleDocsUrl;
                  })()}
                  className={`fallback-iframe w-full h-full border border-gray-300 rounded-lg ${
                    selectedDocument.location && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(selectedDocument.location) 
                      ? 'hidden' : 'block'
                  }`}
                  frameBorder="0"
                  title="Document Preview"
                  onLoad={(e) => {
                    console.log('✅ Google Docs Viewer loaded successfully');
                    console.log('Iframe content window:', e.target.contentWindow);
                    setDocumentLoading(false);
                  }}
                  onError={(e) => {
                    console.log('❌ Google Docs Viewer failed');
                    console.log('Iframe error event:', e);
                    console.log('Failed iframe src:', e.target.src);
                    setDocumentLoading(false);
                    // Show error message
                    const errorDiv = document.querySelector('.preview-error');
                    const iframe = document.querySelector('.fallback-iframe');
                    if (errorDiv) errorDiv.style.display = 'flex';
                    if (iframe) iframe.style.display = 'none';
                  }}
                />
                
                {/* Error fallback - download option */}
                <div className="preview-error absolute inset-0 hidden flex-col items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center p-8">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                    <p className="text-gray-600 mb-6">This file format cannot be previewed in the browser.</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open(selectedDocument.location, '_blank')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Open in New Tab
                      </button>
                      <a
                        href={selectedDocument.location}
                        download
                        className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        Download File
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => handleDownload(selectedDocument.location, selectedDocument.documentName)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                <FiDownload className="inline mr-2" size={16} />
                Download
              </button>
              <button
                onClick={closeDocumentViewer}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrPrivateDocuments;
