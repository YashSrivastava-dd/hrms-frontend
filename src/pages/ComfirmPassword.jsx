import React, { useEffect, useState } from "react";
import ddHealthcare from "../assets/Icon/ddHealthcare.png";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { postConfirmPasswordAction } from "../store/action/userDataAction";
import { Bounce, toast } from "react-toastify";

const ConfirmPassword = () => {
    const [password, setPassword] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [newPasswordError, setNewPasswordError] = useState("");

    const [hasNavigated, setHasNavigated] = useState(false); // State to track navigation

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const { data, error } = useSelector((state) => state.confirmPasswordReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const handleChange = (e) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for password match
        // if (newPasswordError) {
        //     toast.error('Passwords do not match!', {
        //         position: "top-center",
        //         autoClose: 5000,
        //         hideProgressBar: false,
        //         closeOnClick: false,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: "colored",
        //         transition: Bounce,
        //     });
        //     return;
        // }

        if (password.newPassword !== password.confirmPassword) {
            toast.error('Passwords do not match!', {
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
            return;
        }

        // Dispatch the action to update the password
        const email = localStorage.getItem("email"); // Assuming the email is stored in localStorage
        if (email) {
            dispatch(postConfirmPasswordAction({ email, loginPassword: password.newPassword }));
        } else {
            alert("Email not found. Please go back to reset your password.");
        }
    };

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
            localStorage.removeItem('email')
            // Navigate after a delay to show success toast
            setTimeout(() => {
                setHasNavigated(true); // Set flag to prevent re-navigation
                navigate("/");
            }, 2000);
        }
    }, [data, hasNavigated, navigate]);

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
        return;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
                {/* Logo */}
                <div className="flex justify-start mb-6">
                    <div className="w-10 h-10 rounded-full flex items-start justify-center">
                        <img src={ddHealthcare} alt="" className="w-10 h-6" />
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-xl font-bold text-gray-900 text-start mb-4">
                    Enter your new password
                </h2>
                <p className="text-sm text-gray-600 text-start mb-6">
                    Your new password must be different from previous passwords.
                </p>

                {/* Password Form */}
                <form onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div className="mb-4 relative">
                        <label htmlFor="new-password" className="sr-only">
                            Enter new password
                        </label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="new-password"
                            name="newPassword"
                            value={password.newPassword}
                            // onChange={handleChange}
                            placeholder="Enter new password"

                            // type={showPassword.confirmNewpasswordShow ? "text" : "password"}
                            // disabled={newPasswordError !== ""}

                            onChange={(e) => {
                                const value = e.target.value;
                                setPassword({ ...password, newPassword: value })
                                // setNewPassword(value);

                                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
                                if (!regex.test(value)) {
                                    setNewPasswordError(
                                        "Password must be 8-15 characters, include uppercase, lowercase, number, and special character."
                                    );
                                } else {
                                    setNewPasswordError("");
                                }
                            }}

                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-3 top-2.5 text-gray-500 focus:outline-none"
                        >
                            {passwordVisible ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                        </button>
                    </div>
                    <div className="mb-4">
                        <p style={{ color: "red", fontSize: ".8rem" }}>{newPasswordError}</p>
                    </div>
                    {/* Confirm Password */}
                    <div className="mb-6 relative">
                        <label htmlFor="confirm-password" className="sr-only">
                            Confirm new password
                        </label>
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            id="confirm-password"
                            name="confirmPassword"
                            value={password.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            className="absolute right-3 top-2.5 text-gray-500 focus:outline-none"
                        >
                            {confirmPasswordVisible ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                        </button>
                    </div>

                    {/* Reset Password Button */}
                    <div className="flex flex-wrap gap-4">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Reset password
                        </button>
                        <Link
                            to={"/forget_password"}
                            className="w-full px-4 py-2 border-2 text-center text-blue-600 rounded-lg"
                        >
                            Back to email
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfirmPassword;
