import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserDataAction,
  postProfileUploadAction,
} from "../store/action/userDataAction";
import user from "../assets/Icon/user.png";
import { AiOutlineHome } from "react-icons/ai";
import { TbTax } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";

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
      <p className="h-4 bg-gray-300 rounded w-1/3 mb-2"></p>
      <p className="h-4 bg-gray-200 rounded w-2/3"></p>
    </div>
  );

  const renderDetail = (label, value) => (
    <div>
      <p className="text-xs sm:text-sm text-gray-400">{label}</p>
      <p className="text-sm sm:text-base">{value && value !== "false" && value !== false ? value : "---"}</p>
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
          <>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
              <div className="flex gap-2 items-center mb-4">
                <CgProfile />
                <h3 className="font-semibold text-lg">Professional Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading
                  ? Array(4)
                      .fill(0)
                      .map((_, i) => <SkeletonRow key={i} />)
                  : [
                      renderDetail("Level of Education", "Graduation"),
                      renderDetail("Degree", userDataList?.qualifications),
                      renderDetail("Total Experience", userDataList?.overallExperience),
                      renderDetail("Soft Skill", "Communication"),
                    ]}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
              <div className="flex gap-2 items-center mb-4">
                <AiOutlineHome />
                <h3 className="font-semibold text-lg">Home Address</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading
                  ? Array(4)
                      .fill(0)
                      .map((_, i) => <SkeletonRow key={i} />)
                  : [
                      renderDetail("Address", userDataList?.permanentAddress),
                      renderDetail("Address (cont.)", "-"),
                      renderDetail("City", "Noida Gautam Buddha Nagar"),
                      renderDetail("Postal Code", "201301"),
                    ]}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
              <div className="flex items-center gap-2 mb-4">
                <TbTax />
                <h3 className="font-semibold text-lg">Tax Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading
                  ? Array(4)
                      .fill(0)
                      .map((_, i) => <SkeletonRow key={i} />)
                  : [
                      renderDetail("PAN Number", userDataList?.pancardNo),
                      renderDetail("ADHAR Number", userDataList?.aadhaarNumber),
                    ]}
              </div>
            </div>
          </>
        );

      case "job":
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4">Job Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderDetail("Department", userDataList?.departmentId || "NA")}
              {renderDetail("Designation", userDataList?.designation || "NA")}
              {renderDetail("Date of Joining", userDataList?.doj || "NA")}
              {renderDetail("Manager", userDataList?.managerId || "NA")}
            </div>
          </div>
        );

      case "salary":
        return (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4">Salary Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderDetail("Basic Salary", userDataList?.salary?.basic || "---")}
              {renderDetail("HRA", userDataList?.salary?.hra || "---")}
              {renderDetail("Allowances", userDataList?.salary?.allowances || "---")}
              {renderDetail("Total Salary", userDataList?.salary?.total || "---")}
            </div>
          </div>
        );  
      default:
        return null;
    }
  };
   
  return (
    <div className="bg-gray-100 p-4 font-sans min-h-screen">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow col-span-1">
          <div className="flex flex-col items-start gap-3">
            <div
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border group cursor-pointer"
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
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs text-center px-2">Click or Drop Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                id="profileImageInput"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
            </div>
            {isUploading && <p className="text-xs text-gray-500">Uploading...</p>}
            <h2 className="text-lg sm:text-xl font-semibold">
              {userDataList?.employeeName} ({userDataList?.employeeId})
            </h2>
            <p className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
              {userDataList?.designation}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            {loading
              ? Array(7)
                  .fill(0)
                  .map((_, i) => <SkeletonRow key={i} />)
              : [
                  renderDetail("Email", userDataList?.email),
                  renderDetail("Mobile Phone", `+91 ${userDataList?.contactNo}`),
                  renderDetail("Nationality", "India"),
                  renderDetail("Gender", userDataList?.gender),
                  renderDetail("Blood Group", userDataList?.bloodGroup),
                  renderDetail("Age", "-"),
                  renderDetail("Status", "Active"),
                  renderDetail("Type of Hire", userDataList?.employmentType),
                ]}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-4 pb-2 sm:pb-4">
            {["personal", "job", "salary"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-black text-white border border-transparent shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
              </button>
            ))}
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
