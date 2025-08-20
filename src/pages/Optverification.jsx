import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postOTPVerificationAction, postSendOtpWithEmailAction } from "../store/action/userDataAction";
import { useDispatch, useSelector } from "react-redux";
import { Bounce, ToastContainer, toast } from "react-toastify";

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(4).fill("")); // State for 6-digit OTP
  const { data, error } = useSelector((state) => state.otpVerification)
  const { data:dataa } = useSelector((state) => state.sendOtpwithemail);
console.log('dataa',dataa)
  const [hasNavigated, setHasNavigated] = useState(false); // State to track navigation
  const email=localStorage.getItem('email')

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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

      // Navigate after a delay to show success toast
      setTimeout(() => {
        setHasNavigated(true); // Set flag to prevent re-navigation
        navigate("/confirm_password");
      }, 2000);
    }
  }, [data])


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
  }, [error])
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus the next input field if value is entered
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };
  console.log('data', data, error)
 
  const handleVerify = () => {
    const otpverify = otp.join("");
    dispatch(postOTPVerificationAction(otpverify))
    // navigate("/confirm_password");
  };

  const handleResend = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    dispatch(postSendOtpWithEmailAction(email))

    toast.success('OTP Sent successfully!', {
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

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_2x_r5.png"
            alt="Gmail Logo"
            className="w-28 h-12 object-fit"
          />
        </div>

        {/* Header */}
        <h2 className="text-2xl font-semibold text-center mb-4">Verify your Email</h2>
        <p className="text-center text-gray-500 mb-6">
          An 4-digit code has been sent to{" "}
          <span className="font-medium text-gray-800">{email}</span>{" "}
          <a href="/forget_password" className="text-blue-500 hover:underline">
            change
          </a>
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="w-10 h-10 text-lg text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleOtpChange(e.target, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        {/* Timer and Resend Options */}
        <div className="text-sm text-gray-500 mb-6">
          <ul>
            {/* <li>The OTP will be expired in {timer}</li> */}
            <li>
              Didn’t receive the code?{" "}
              <button
                href="#"
                onClick={handleResend}
                className="text-blue-500 hover:underline"
              >
                Resend
              </button>{" "}
            </li>
          </ul>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
