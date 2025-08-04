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
import { Pencil, Trash2 } from 'lucide-react';

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

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Announcements</h2>
        <button
          onClick={toggleModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <IoAdd className="text-xl" />
          <span>Add Announcement</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3">Announcements</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Publication Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 flex items-center gap-4 whitespace-nowrap">
                  <img src={item.imageUrl || 'https://via.placeholder.com/40'} alt="avatar" className="w-10 h-10 rounded-md object-cover" />
                  <a
                    href={item.imageUrl}
                    download={`Announcement of ${item.dateTime.split("T")[0]}.jpg`}
                    className="text-blue-500 text-xs hover:underline"
                  >
                    Download
                  </a>
                  <span className="text-gray-800 font-medium truncate max-w-[200px]" title={item.title}>
                    {item.title}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {/* Status logic can be dynamic if needed */}
                  {new Date(item.dateTime) > new Date() ? 'Expires in 2 weeks' : 'Expired'}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {new Date(item.dateTime).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 flex gap-2 whitespace-nowrap">
                  <button
                    className="p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    className="p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{formData._id ? 'Edit' : 'Add'} Announcement</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="w-full border rounded px-4 py-2"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full border rounded px-4 py-2"
                required
              />
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full border rounded px-4 py-2"
                required
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location (optional)"
                className="w-full border rounded px-4 py-2"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={toggleModal} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcement;