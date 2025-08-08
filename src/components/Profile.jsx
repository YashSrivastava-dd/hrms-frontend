import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserDataAction,
  postProfileUploadAction,
} from "../store/action/userDataAction";
import user from "../assets/Icon/user.png";
import { AiOutlineHome, AiOutlineMail, AiOutlinePhone, AiOutlineUser } from "react-icons/ai";
import { TbTax, TbBriefcase, TbCurrencyDollar } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { MdOutlineWork, MdOutlineSchool, MdOutlineLocationOn } from "react-icons/md";
import { FaRegCalendarAlt, FaRegIdCard } from "react-icons/fa";

const EmployeeProfile = () => {
  const { loading, data } = useSelector((state) => state.userData);
  const userDataList = data?.data;
  const [selectedImage, setSelectedImage] = useState(
    userDataList?.profileImage || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserDataAction());
  }, [dispatch]);

  const SkeletonRow = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
    </div>
  );

  const renderDetail = (label, value, icon = null) => (
    <div className="flex items-start space-x-3 p-4 bg-blue-100/60 rounded-lg hover:bg-blue-100 transition-colors duration-200">
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-800">
          {value && value !== "false" && value !== false ? value : "---"}
        </p>
      </div>
    </div>
  );

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("profileImage", file);
      try {
        await dispatch(postProfileUploadAction(formData));
        dispatch(getUserDataAction());
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-6">
            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-4 border-b border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-300 rounded-lg flex items-center justify-center">
                    <CgProfile className="text-blue-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Professional Information</h3>
                    <p className="text-blue-700 text-sm">Education and experience details</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading
                    ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : [
                        renderDetail("Level of Education", "Graduation", <MdOutlineSchool className="text-blue-600" />),
                        renderDetail("Degree", userDataList?.qualifications, <MdOutlineSchool className="text-blue-600" />),
                        renderDetail("Total Experience", userDataList?.overallExperience, <TbBriefcase className="text-blue-600" />),
                        renderDetail("Soft Skill", "Communication", <AiOutlineUser className="text-blue-600" />),
                      ]}
                </div>
              </div>
            </div>

            {/* Home Address */}
            <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-4 border-b border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-300 rounded-lg flex items-center justify-center">
                    <AiOutlineHome className="text-green-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Home Address</h3>
                    <p className="text-green-700 text-sm">Permanent address information</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading
                    ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : [
                        renderDetail("Address", userDataList?.permanentAddress, <MdOutlineLocationOn className="text-green-600" />),
                        renderDetail("Address (cont.)", "-", <MdOutlineLocationOn className="text-green-600" />),
                        renderDetail("City", "Noida Gautam Buddha Nagar", <MdOutlineLocationOn className="text-green-600" />),
                        renderDetail("Postal Code", "201301", <MdOutlineLocationOn className="text-green-600" />),
                      ]}
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-300 rounded-lg flex items-center justify-center">
                    <TbTax className="text-purple-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Tax Information</h3>
                    <p className="text-purple-700 text-sm">Tax and identification details</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading
                    ? Array(2).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : [
                        renderDetail("PAN Number", userDataList?.pancardNo, <FaRegIdCard className="text-purple-600" />),
                        renderDetail("Aadhaar Number", userDataList?.aadhaarNumber, <FaRegIdCard className="text-purple-600" />),
                      ]}
                </div>
              </div>
            </div>
          </div>
        );

      case "job":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-4 border-b border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-300 rounded-lg flex items-center justify-center">
                  <MdOutlineWork className="text-orange-700 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">Job Information</h3>
                  <p className="text-orange-700 text-sm">Employment and role details</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading
                  ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  : [
                      renderDetail("Department", userDataList?.departmentId || "NA", <MdOutlineWork className="text-orange-600" />),
                      renderDetail("Designation", userDataList?.designation || "NA", <TbBriefcase className="text-orange-600" />),
                      renderDetail("Date of Joining", userDataList?.doj || "NA", <FaRegCalendarAlt className="text-orange-600" />),
                      renderDetail("Manager", userDataList?.managerId || "NA", <AiOutlineUser className="text-orange-600" />),
                    ]}
              </div>
            </div>
          </div>
        );

      case "salary":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-teal-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-100 to-cyan-100 px-6 py-4 border-b border-teal-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-300 rounded-lg flex items-center justify-center">
                  <TbCurrencyDollar className="text-teal-700 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-900">Salary Information</h3>
                  <p className="text-teal-700 text-sm">Compensation and benefits details</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading
                  ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  : [
                      renderDetail("Basic Salary", userDataList?.salary?.basic || "---", <TbCurrencyDollar className="text-teal-600" />),
                      renderDetail("HRA", userDataList?.salary?.hra || "---", <TbCurrencyDollar className="text-teal-600" />),
                      renderDetail("Allowances", userDataList?.salary?.allowances || "---", <TbCurrencyDollar className="text-teal-600" />),
                      renderDetail("Total Salary", userDataList?.salary?.total || "---", <TbCurrencyDollar className="text-teal-600" />),
                    ]}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
   
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <AiOutlineUser className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Profile</h1>
                <p className="text-gray-700">Manage your personal and professional information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 text-center border-b border-blue-200">
                <div className="relative inline-block">
                  <div
                    className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group cursor-pointer mx-auto"
                    onClick={() => document.getElementById("profileImageInput").click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageUpload(e.dataTransfer.files[0]);
                    }}
                  >
                    <img
                      src={selectedImage || userDataList?.employeePhoto || user}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <span className="text-white text-xs text-center px-2 font-medium">Click or Drop Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      id="profileImageInput"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                  </div>
                  {isUploading && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Uploading...</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-blue-900">
                    {userDataList?.employeeName || "Employee Name"}
                  </h2>
                  <p className="text-blue-700 text-sm">
                    {userDataList?.employeeId || "Employee ID"}
                  </p>
                  <div className="mt-2">
                    <span className="inline-block bg-blue-300 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {userDataList?.designation || "Designation"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <AiOutlineUser className="text-blue-600" />
                  <span>Basic Information</span>
                </h3>
                <div className="space-y-3">
                  {loading
                    ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : [
                        renderDetail("Email", userDataList?.email, <AiOutlineMail className="text-blue-600" />),
                        renderDetail("Mobile Phone", userDataList?.contactNo ? `+91 ${userDataList.contactNo}` : "---", <AiOutlinePhone className="text-blue-600" />),
                        renderDetail("Nationality", "India", <AiOutlineUser className="text-blue-600" />),
                        renderDetail("Gender", userDataList?.gender, <AiOutlineUser className="text-blue-600" />),
                        renderDetail("Blood Group", userDataList?.bloodGroup, <AiOutlineUser className="text-blue-600" />),
                        renderDetail("Employment Type", userDataList?.employmentType, <MdOutlineWork className="text-blue-600" />),
                      ]}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "personal", label: "Personal Information", icon: <CgProfile className="w-4 h-4" /> },
                  { id: "job", label: "Job Information", icon: <MdOutlineWork className="w-4 h-4" /> },
                  { id: "salary", label: "Salary Information", icon: <TbCurrencyDollar className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
