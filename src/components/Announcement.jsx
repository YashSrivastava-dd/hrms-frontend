import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAnnouncementDataAction,
  postAnnouncementDataAction,
  deleteAnnouncementDataAction,
  updateAnnouncementDataAction,
  getUserDataAction,
} from '../store/action/userDataAction';
import { IoAdd } from 'react-icons/io5';
import { Pencil, Trash2, Calendar, MapPin, Clock, Download } from 'lucide-react';

function Announcement({ reloadHandel }) {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.announcementData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    dateTime: '',
    location: '',
  });

  useEffect(() => {
    const employeeId = '900';
    dispatch(getUserDataAction(employeeId));
    dispatch(getAnnouncementDataAction());
  }, [dispatch, reloadHandel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData._id) {
      dispatch(updateAnnouncementDataAction({
        id: formData._id,
        title: formData.title,
        description: formData.description,
        dateTime: formData.dateTime,
      }));
    } else {
      dispatch(postAnnouncementDataAction({
        title: formData.title,
        description: formData.description,
        dateTime: formData.dateTime,
        location: formData.location,
      }));
    }
    setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setFormData({ id: null, title: '', description: '', dateTime: '', location: '' });
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteAnnouncementDataAction(id));
  };

  const getStatusColor = (dateTime) => {
    const announcementDate = new Date(dateTime);
    const now = new Date();
    const diffTime = announcementDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) return 'bg-green-100 text-green-800';
    if (diffDays > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (dateTime) => {
    const announcementDate = new Date(dateTime);
    const now = new Date();
    const diffTime = announcementDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) return 'Active';
    if (diffDays > 0) return `Expires in ${diffDays} days`;
    return 'Expired';
  };

  return (
    <div className="full-height-content bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 flex flex-col">
      <div className="w-full flex-1">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📢</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h1>
                  <p className="text-sm text-gray-600">Manage and publish important announcements for your team</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={toggleModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <IoAdd className="text-lg" />
              <span className="font-medium">Add Announcement</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{data?.data?.length || 0}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">📢</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active</p>
                <p className="text-lg font-bold text-green-600">
                  {data?.data?.filter(item => new Date(item.dateTime) > new Date()).length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Expiring Soon</p>
                <p className="text-lg font-bold text-yellow-600">
                  {data?.data?.filter(item => {
                    const diff = new Date(item.dateTime).getTime() - new Date().getTime();
                    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    return diffDays > 0 && diffDays <= 7;
                  }).length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚠️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Expired</p>
                <p className="text-lg font-bold text-red-600">
                  {data?.data?.filter(item => new Date(item.dateTime) <= new Date()).length || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">All Announcements</h2>
            <div className="text-sm text-gray-600">
              {data?.data?.length || 0} announcement{(data?.data?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>

          {data?.data?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Announcements Yet</h3>
              <p className="text-gray-600 mb-4">Create your first announcement to keep your team informed</p>
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {data?.data?.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/40'} 
                        alt="announcement" 
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200" 
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm" title={item?.title || "Untitled Announcement"}>
                          {item?.title || "Untitled Announcement"}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(item?.dateTime)}`}>
                          {getStatusText(item?.dateTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {item?.description && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2" title={item?.description}>
                      {item?.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      <span>
                        {item?.dateTime ? new Date(item.dateTime).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : "--"}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1.5" />
                      <span>
                        {item?.dateTime ? new Date(item.dateTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "--"}
                      </span>
                    </div>
                    
                    {item?.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        <span>{item?.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Download Link */}
                  {item?.imageUrl && (
                    <div className="pt-2 border-t border-gray-100">
                      <a
                        href={item?.imageUrl}
                        download={`Announcement_${item?.dateTime?.split("T")[0] || "unknown"}.jpg`}
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download Attachment
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {formData._id ? 'Edit' : 'Add'} Announcement
              </h3>
              <p className="text-gray-600 mt-1 text-sm">
                {formData._id ? 'Update the announcement details' : 'Create a new announcement for your team'}
              </p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter announcement title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter announcement description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={toggleModal} 
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  {formData._id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcement;