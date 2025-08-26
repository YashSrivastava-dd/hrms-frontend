// AddEmployeeModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { postAddEmployeeAction } from "../store/action/userDataAction";

const AddEmployeeModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [employmentType, setEmploymentType] = useState("Full time");

    const [formData, setFormData] = useState({
        employeeId: "",
        employeeName: "",
        employeeCode: "",
        gender: "Male",
        departmentId: "",
        designation: "",
        doj: "",
        employeeCodeInDevice: "",
        employmentType: "Full time",
        employeeStatus: "",
        accountStatus: "",
        fatherName: "",
        motherName: "",
        residentialAddress: "",
        permanentAddress: "",
        contactNo: "",
        email: "",
        dob: "",
        placeOfBirth: "",
        bloodGroup: "",
        workPlace: "",
        aadhaarNumber: "",
        employeePhoto: null,
        masterDeviceId: "",
        maritalStatus: "",
        nationality: "",
        overallExperience: "",
        qualifications: "",
        emergencyContact: "",
        managerId: "",
        teamLeadId: "",
        leaveBalance: "",
        role: "",
        shiftTime: "",
        loginPassword: "",
        pancardNo: "",
        workingDays: "",
    });
    const dispatch = useDispatch();
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        setStep((prev) => Math.min(prev + 1, 3));
    };
    const handelSubmit = () => {
        console.log("Submitted Employee Data:", { ...formData });
        dispatch(postAddEmployeeAction({
            employeeId: formData?.employeeId,
            employeeName: formData?.employeeName,
            employeeCode: formData?.employeeCode,
            gender: formData?.gender,
            departmentId: formData?.departmentId,
            designation: formData?.designation,
            doj: formData?.doj,
            employeeCodeInDevice: formData?.employeeCodeInDevice,
            employmentType: formData?.employmentType,
            employeeStatus: formData?.employeeStatus,
            accountStatus: formData?.accountStatus,
            fatherName: formData?.fatherName,
            motherName: formData?.motherName,
            residentialAddress: formData?.residentialAddress,
            permanentAddress: formData?.permanentAddress,
            contactNo: formData?.contactNo,
            email: formData?.email,
            dob: formData?.dob,
            placeOfBirth: formData?.placeOfBirth,
            bloodGroup: formData?.bloodGroup,
            workPlace: formData?.workPlace,
            aadhaarNumber: formData?.aadhaarNumber,
            employeePhoto: formData?.employeePhoto,
            masterDeviceId: formData?.masterDeviceId,
            maritalStatus: formData?.maritalStatus,
            nationality: formData?.nationality,
            overallExperience: formData?.overallExperience,
            qualifications: formData?.qualifications,
            emergencyContact: formData?.emergencyContact,
            managerId: formData?.managerId,
            teamLeadId: formData?.teamLeadId,
            leaveBalance: formData?.leaveBalance,
            role: formData?.role,
            shiftTime: formData?.shiftTime,
            loginPassword: formData?.loginPassword,
            pancardNo: formData?.pancardNo,
            workingDays: formData?.workingDays,
        }))
    }
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center overflow-auto">
            <div className="bg-white rounded-xl w-full max-w-2xl mx-4 my-10 shadow-2xl font-inter">
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-2xl font-bold text-blue-700">Add Employee</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 space-x-6 border-b text-sm font-semibold">
                    <div
                        className={`pb-2 border-b-2 transition ${step === 1 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
                            }`}
                    >
                        Basic Information
                    </div>
                    <div
                        className={`pb-2 border-b-2 transition ${step === 2 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
                            }`}
                    >
                        Employment Type
                    </div>
                    <div
                        className={`pb-2 border-b-2 transition ${step === 3 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
                            }`}
                    >
                        Education & Exp
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto text-gray-700">
                    {step === 1 && (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Employee name</label>
                                    <input
                                        type="text"
                                        value={formData.employeeName}
                                        onChange={(e) => handleChange("employeeName", e.target.value)}
                                        placeholder="John Doe Pandey"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">DOB</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleChange("dob", e.target.value)}
                                        placeholder="DOB"
                                        className="input"
                                    />
                                </div>
                            </div>
                            {/* <div>
                                <label className="text-sm font-medium">Job title</label>
                                <input
                                    type="text"
                                    value={formData.designation}
                                    onChange={(e) => handleChange("designation", e.target.value)}
                                    placeholder="Product Designer"
                                    className="input"
                                />
                            </div> */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Email address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="abc@example.com"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Phone number</label>
                                    <input
                                        type="text"
                                        value={formData.contactNo}
                                        onChange={(e) => handleChange("contactNo", e.target.value)}
                                        placeholder="+123 456 789"
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Father Name</label>
                                    <input
                                        type="text"
                                        value={formData.fatherName}
                                        onChange={(e) => handleChange("fatherName", e.target.value)}
                                        placeholder="Father Name"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Mother Name</label>
                                    <input
                                        type="text"
                                        value={formData.motherName}
                                        onChange={(e) => handleChange("motherName", e.target.value)}
                                        placeholder="Mother name"
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Blood Group</label>
                                    <input
                                        type="text"
                                        value={formData.bloodGroup}
                                        onChange={(e) => handleChange("bloodGroup", e.target.value)}
                                        placeholder="Blood Group"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Permanent Address</label>
                                    <input
                                        type="text"
                                        value={formData.permanentAddress}
                                        onChange={(e) => handleChange("permanentAddress", e.target.value)}
                                        placeholder="Permanent Address"
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Adhar Card</label>
                                    <input
                                        type="number"
                                        value={formData.aadhaarNumber}
                                        onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
                                        placeholder="Adharcard No"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Pan Card</label>
                                    <input
                                        type="text"
                                        value={formData.pancardNo}
                                        onChange={(e) => handleChange("pancardNo", e.target.value)}
                                        placeholder="Pancard No"
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Nationality</label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => handleChange("nationality", e.target.value)}
                                    placeholder="Uttarakhand"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1">Gender</label>
                                <div className="flex gap-2">
                                    {['Male', 'Female', 'Other'].map((g) => (
                                        <button
                                            key={g}
                                            className={`tab-btn ${formData.gender === g ? "tab-btn-selected" : ""}`}
                                            onClick={() => handleChange("gender", g)}
                                            type="button"
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4">
                            <div className="flex gap-2">
                                <button onClick={() => handleChange("employmentType", "Full time")} className={`tab-btn ${formData.employmentType === "Full time" ? "tab-btn-selected" : ""}`}>Full time</button>
                                <button onClick={() => handleChange("employmentType", "Contractual")} className={`tab-btn ${formData.employmentType === "Contractual" ? "tab-btn-selected" : ""}`}>Contractual</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Date of joining</label>
                                    <input
                                        type="date"
                                        value={formData.doj}
                                        onChange={(e) => handleChange("doj", e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Hours/week</label>
                                    <input
                                        type="text"
                                        value={formData.workingDays}
                                        onChange={(e) => handleChange("workingDays", e.target.value)}
                                        placeholder="70hrs/week"
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Employee Id</label>
                                <input
                                    type="text"
                                    value={formData.employeeId}
                                    onChange={(e) => handleChange("employeeId", e.target.value)}
                                    placeholder="Employee Code"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Salary</label>
                                <input
                                    type="text"
                                    value={formData.salary}
                                    onChange={(e) => handleChange("salary", e.target.value)}
                                    placeholder="₹12,00,000/year"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Tax deductions</label>
                                <input
                                    type="text"
                                    value={formData.tax}
                                    onChange={(e) => handleChange("tax", e.target.value)}
                                    placeholder="20%"
                                    className="input"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid gap-4">
                            {/* <div className="flex gap-2">
                                <button onClick={() => handleChange("employmentType", "Full time")} className={`tab-btn ${formData.employmentType === "Full time" ? "tab-btn-selected" : ""}`}>Full time</button>
                                <button onClick={() => handleChange("employmentType", "Contractual")} className={`tab-btn ${formData.employmentType === "Contractual" ? "tab-btn-selected" : ""}`}>Contractual</button>
                            </div> */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">overallExperience</label>
                                    <input
                                        type="text"
                                        value={formData.overallExperience}
                                        onChange={(e) => handleChange("overallExperience", e.target.value)}
                                        placeholder="overallExperience"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">qualifications</label>
                                    <input
                                        type="text"
                                        value={formData.qualifications}
                                        onChange={(e) => handleChange("qualifications", e.target.value)}
                                        placeholder="qualifications"
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">maritalStatus</label>
                                <input
                                    type="text"
                                    value={formData.maritalStatus}
                                    onChange={(e) => handleChange("maritalStatus", e.target.value)}
                                    placeholder="maritalStatus"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">emergencyContact</label>
                                <input
                                    type="number"
                                    value={formData.emergencyContact}
                                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                                    placeholder="emergencyContact"
                                    className="input"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
                    <button
                        className={`px-4 py-2 border rounded ${step === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100 transition"
                            }`}
                        onClick={() => step !== 1 && setStep((prev) => Math.max(prev - 1, 1))}
                        disabled={step === 1}
                    >
                        Previous
                    </button>
                    {step === 3 ? (
                        <button
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                            onClick={handelSubmit}
                        >
                            Submit
                        </button>
                    ) : (
                        <button
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
