import React, { useEffect, useState } from "react";
import { FiDownload, FiMoreVertical, FiEye, FiFileText } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getEmoployeeDocumentsAction } from "../../store/action/userDataAction";

const PublicDocument = ({ onBack }) => {
  const dispatch = useDispatch();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('preview');

  const { data, loading, error } = useSelector((state) => state.employeeDocument);
  const publicDocuments = data?.data || [];

  useEffect(() => {
    dispatch(getEmoployeeDocumentsAction());
  }, [dispatch]);

  const getFileExtension = (url) => {
    if (!url) return '';
    const match = url.match(/\.([^.]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : '';
  };

  const getFileType = (url) => {
    const ext = getFileExtension(url);
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const pdfTypes = ['pdf'];
    const docTypes = ['doc', 'docx'];
    const excelTypes = ['xls', 'xlsx'];
    const textTypes = ['txt', 'rtf'];
    
    if (imageTypes.includes(ext)) return 'image';
    if (pdfTypes.includes(ext)) return 'pdf';
    if (docTypes.includes(ext)) return 'document';
    if (excelTypes.includes(ext)) return 'spreadsheet';
    if (textTypes.includes(ext)) return 'text';
    return 'unknown';
  };

  const renderDocumentPreview = (location, index) => {
    if (!location) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <FiFileText size={48} />
          <span className="ml-2">Preview Not Available</span>
        </div>
      );
    }

    const fileType = getFileType(location);
    const fileExt = getFileExtension(location);

    // For images, show direct preview
    if (fileType === 'image') {
      return (
        <img
          src={location}
          alt={`Document ${index}`}
          className="object-cover h-36 w-full rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    // For PDFs, try Google Docs Viewer first, fallback to direct link
    if (fileType === 'pdf') {
      return (
        <div className="relative">
          <iframe
            loading="lazy"
            src={`https://docs.google.com/gview?url=${encodeURIComponent(location)}&embedded=true`}
            className="object-cover h-36 w-full rounded"
            frameBorder="0"
            title={`Document Preview ${index}`}
            onError={() => console.log('Google Docs Viewer failed for:', location)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleViewDocument(location, fileType)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <FiEye className="inline mr-1" size={14} />
              View
            </button>
          </div>
        </div>
      );
    }

    // For other document types, show Google Docs Viewer
    return (
      <div className="relative">
        <iframe
          loading="lazy"
          src={`https://docs.google.com/gview?url=${encodeURIComponent(location)}&embedded=true`}
          className="object-cover h-36 w-full rounded"
          frameBorder="0"
          title={`Document Preview ${index}`}
          onError={() => console.log('Google Docs Viewer failed for:', location)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleViewDocument(location, fileType)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            <FiEye className="inline mr-1" size={14} />
            View
          </button>
        </div>
      </div>
    );
  };

  const handleViewDocument = (location, fileType) => {
    if (!location) {
      alert('Document location not available');
      return;
    }

    // Try to open in new tab first
    try {
      const newWindow = window.open(location, '_blank');
      if (newWindow) {
        // If new window opens successfully, close it after a short delay to check if content loaded
        setTimeout(() => {
          if (newWindow.closed || newWindow.location.href === 'about:blank') {
            // If window closed or blank, try alternative methods
            handleAlternativeView(location, fileType);
          }
        }, 1000);
      } else {
        // If popup blocked, try alternative methods
        handleAlternativeView(location, fileType);
      }
    } catch (error) {
      console.error('Error opening document:', error);
      handleAlternativeView(location, fileType);
    }
  };

  const handleAlternativeView = (location, fileType) => {
    // For PDFs, try Google Docs Viewer
    if (fileType === 'pdf') {
      const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(location)}&embedded=true`;
      window.open(googleViewerUrl, '_blank');
      return;
    }

    // For other types, try Microsoft Office Online Viewer
    if (['document', 'spreadsheet'].includes(fileType)) {
      const msViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(location)}`;
      window.open(msViewerUrl, '_blank');
      return;
    }

    // Fallback: download the file
    alert('Unable to preview this document type. The file will be downloaded instead.');
    const link = document.createElement('a');
    link.href = location;
    link.download = '';
    link.click();
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Public Documents</h1>
              <p className="text-gray-600 mt-1">Shared company documents and resources</p>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publicDocuments.map((doc, index) => (
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
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doc?.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {doc?.docType || getFileExtension(doc?.location) || "Unknown Type"}
                  </span>
                  <span>{doc?.createdAt?.split("T")[0] || "Unknown Date"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDocument(doc?.location, getFileType(doc?.location))}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    <FiEye className="mr-2" size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(doc?.location, doc?.documentName)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
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
        
        {publicDocuments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Public Documents</h3>
              <p className="text-gray-600 mb-4">No public documents are available at the moment.</p>
              <div className="text-sm text-gray-500">Public documents will appear here once they are shared</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDocument;