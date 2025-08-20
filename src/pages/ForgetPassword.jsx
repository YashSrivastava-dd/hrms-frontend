import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ddHealthcare from "../assets/Icon/ddHealthcare.png";
import { postSendOtpWithEmailAction } from "../store/action/userDataAction";
import { Bounce, ToastContainer, toast } from "react-toastify";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [hasNavigated, setHasNavigated] = useState(false); // State to track navigation
    const { data, error, loading } = useSelector((state) => state.sendOtpwithemail);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Success Toast and Navigation
    useEffect(() => {
        if (data?.statusCode === 200 && !hasNavigated) {
            toast.success(data?.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
            localStorage.setItem('email', email)
            // Navigate after a delay to show success toast
            setTimeout(() => {
                setHasNavigated(true); // Set flag to prevent re-navigation
                navigate("/otp_verification");
            }, 2000);
        }
    }, [data, hasNavigated, navigate]);

    // Error Toast
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            alert("Please enter your email address");
            return;
        }

        // Dispatch the action with the email
        dispatch(postSendOtpWithEmailAction(email));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
                {/* Logo */}
                <div className="flex justify-start mb-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <img src={ddHealthcare} alt="" className="w-10 h-6" />
                    </div>
                </div>
                {/* Heading */}
                <h2 className="text-xl font-bold text-gray-900 text-start mb-4">
                    Reset your password
                </h2>
                <p className="text-sm text-gray-600 text-start mb-6">
                    Enter the Agva email address you used to register with.
                </p>
                {/* Email Input */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            placeholder="Email address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-between">
                        <Link
                            to="/"
                            type="button"
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                        >
                            Back to sign in
                        </Link>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send instructions"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgetPassword;
