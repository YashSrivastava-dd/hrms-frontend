import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FiDownload, FiMoreVertical, FiEye, FiFileText, FiExternalLink } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import { postEmployePrivateDocAction } from "../../store/action/userDataAction";

const PrivateIssueDocuments = ({ onBack }) => {
  const {loading, data ,error} = useSelector((state) => state.privateDocument)
  const [viewingDocuments, setViewingDocuments] = useState(new Set());
  
  console.log('Private Documents Data:', data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(postEmployePrivateDocAction());
  }, [dispatch])

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

    // For images, show direct preview
    if (fileType === 'image') {
      return (
        <img
          src={location}
          alt={`Document ${index}`}
          className="object-cover h-36 w-full rounded"
          onError={(e) => {
            console.log('Image preview failed:', location);
            e.target.style.display = 'none';
            const fallback = e.target.nextSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }

    // For other document types, show Google Docs Viewer
    return (
      <iframe
        loading="lazy"
        src={`https://docs.google.com/gview?url=${encodeURIComponent(location)}&embedded=true`}
        className="object-cover h-36 w-full rounded"
        frameBorder="0"
        title={`Document Preview ${index}`}
        onError={() => console.log('Google Docs Viewer failed for:', location)}
      />
    );
  };

  const handleViewDocument = async (location, documentName, fileType) => {
    if (!location) {
      alert('Document location not available');
      return;
    }

    const docId = `${location}-${documentName}`;
    setViewingDocuments(prev => new Set(prev).add(docId));

    console.log('Attempting to view document:', {
      location,
      fileType,
      documentName,
      timestamp: new Date().toISOString()
    });

    try {
      // For images, open directly
      if (fileType === 'image') {
        window.open(location, '_blank');
        setViewingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(docId);
          return newSet;
        });
        return;
      }

      // Try to open document directly first
      const newWindow = window.open(location, '_blank');
      
      if (newWindow) {
        // Check if the document loaded successfully
        setTimeout(() => {
          try {
            if (!newWindow.closed && newWindow.location.href !== 'about:blank') {
              console.log('Document opened successfully in new tab');
            } else {
              console.log('Direct opening failed, trying alternative viewers');
              openWithAlternativeViewer(location, fileType);
            }
          } catch (error) {
            console.log('Error checking window status, trying alternative viewers');
            openWithAlternativeViewer(location, fileType);
          }
          
          setViewingDocuments(prev => {
            const newSet = new Set(prev);
            newSet.delete(docId);
            return newSet;
          });
        }, 3000);
      } else {
        console.log('Popup blocked, trying alternative viewers');
        openWithAlternativeViewer(location, fileType);
        setViewingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(docId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error opening document:', error);
      openWithAlternativeViewer(location, fileType);
      setViewingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const openWithAlternativeViewer = (location, fileType) => {
    let viewerUrl = '';
    
    if (fileType === 'pdf') {
      // Try Google Docs Viewer for PDFs
      viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(location)}&embedded=true`;
      console.log('Opening Google Docs Viewer for PDF');
    } else if (['document', 'spreadsheet'].includes(fileType)) {
      // Try Microsoft Office Online Viewer for Office documents
      viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(location)}`;
      console.log('Opening Microsoft Office Online Viewer for Office document');
    } else {
      // Try Google Docs Viewer for other types
      viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(location)}&embedded=true`;
      console.log('Opening Google Docs Viewer for other document type');
    }

    if (viewerUrl) {
      window.open(viewerUrl, '_blank');
    } else {
      // If all else fails, show user options
      showDocumentOptions(location, fileType);
    }
  };

  const showDocumentOptions = (location, fileType) => {
    const options = [
      'Try opening in new tab',
      'Download document',
      'Copy document link'
    ];

    const choice = prompt(
      `Unable to preview this ${fileType} document.\n\n` +
      `Please choose an option:\n` +
      `1. Try opening in new tab\n` +
      `2. Download document\n` +
      `3. Copy document link\n\n` +
      `Enter 1, 2, or 3:`,
      '1'
    );

    switch (choice) {
      case '1':
        window.open(location, '_blank');
        break;
      case '2':
        handleDownload(location, 'document');
        break;
      case '3':
        copyToClipboard(location);
        break;
      default:
        // Do nothing
        break;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Document link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Document link copied to clipboard!');
    });
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Private Documents</h1>
              <p className="text-gray-600 mt-1">Your confidential documents and files</p>
            </div>
          </div>
        </div>
        
        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data?.map((doc, index) => {
            const docId = `${doc?.location}-${doc?.documentName}`;
            const isViewing = viewingDocuments.has(docId);
            const fileType = getFileType(doc?.location);
            
            return (
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
                  
                  {/* Debug Info - Remove in production */}
                  <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
                    <div><strong>File Type:</strong> {fileType}</div>
                    <div><strong>Extension:</strong> {getFileExtension(doc?.location)}</div>
                    <div><strong>Location:</strong> {doc?.location ? doc.location.substring(0, 50) + '...' : 'None'}</div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {doc?.docType || getFileExtension(doc?.location) || "Unknown Type"}
                    </span>
                    <span>{doc?.createdAt?.split("T")[0] || "Unknown Date"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDocument(doc?.location, doc?.documentName, fileType)}
                      disabled={isViewing}
                      className={`flex-1 flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 font-medium ${
                        isViewing 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isViewing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Opening...
                        </>
                      ) : (
                        <>
                          <FiEye className="mr-2" size={16} />
                          View
                        </>
                      )}
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
            );
          })}
        </div>
        
        {(!data?.data || data?.data.length === 0) && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Private Documents</h3>
              <p className="text-gray-600 mb-4">You don't have any private documents yet.</p>
              <div className="text-sm text-gray-500">Private documents will appear here once they are uploaded</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateIssueDocuments;
