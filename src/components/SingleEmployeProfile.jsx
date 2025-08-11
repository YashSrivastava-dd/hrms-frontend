import React from 'react';
import { IoChevronBackOutline } from "react-icons/io5";
const SingleEmployeProfile = ({ onBack }) => {
    return (
        <div className=" bg-gray-100 full-height-content">
            <header className="flex justify-between items-center mb-6">
                <button className="text-sm" onClick={onBack}>
                    <div className='flex gap-2 items-center'>
                        <IoChevronBackOutline />

                        Back
                    </div>
                </button>
            </header>
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-2xl font-bold">Rohan Rana <span className="text-green-500 text-sm ml-2">Active</span></h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-4">
                        <p><strong>Employee ID:</strong>AgVa 407</p>
                        <p><strong>Role:</strong>SDE -1 </p>
                        <p><strong>Phone number:</strong> +92 9990989909</p>
                        <p><strong>Email address:</strong> rohanrana@gmail.com</p>
                    </div>
                    <div className="grid gap-4">
                        <p><strong>Marital Status:</strong>Single</p>
                        <p><strong>Residential Address:</strong>Shiv Shakti Apartment Sector 71 Noida</p>
                        <p><strong>Permanent Address:</strong>Basti Uttar Pradesh</p>
                        <p><strong>Joining date:</strong> March 10, 2023</p>
                    </div>
                </div>
            </div>
            <section className="bg-white p-6 rounded shadow mb-6">
                <h3 className="text-lg font-bold mb-4">Office Data</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-4">
                        <p><strong>Employment Type:</strong>Single</p>
                        <p><strong>Overall Experience:</strong>Shiv Shakti Apartment Sector 71 Noida</p>
                        <p><strong>Shift Time:</strong>Basti Uttar Pradesh</p>
                        <p><strong>Team LeadId:</strong> March 10, 2023</p>
                    </div>
                    <div className="grid gap-4">
                        <p><strong>Casual Leave:</strong>2</p>
                        <p><strong>Medical Leave:</strong>12</p>
                        <p><strong>Earned Leave:</strong>16</p>
                        <p><strong>Compoff Leave:</strong>5</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default SingleEmployeProfile;