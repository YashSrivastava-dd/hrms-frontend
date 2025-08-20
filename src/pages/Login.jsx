import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules"; // Correct import for modules
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import loginImage1 from "../assets/Image/loginavatar.jpg";
import loginImage2 from "../assets/Image/loginavatar2.jpg";
import loginImage3 from "../assets/Image/loginavatar3.jpg";
import ddHealthcare from "../assets/Icon/ddHealthcare.png";
import { useDispatch, useSelector } from "react-redux";
import { loginUserDataAction } from "../store/action/userLogin";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { FaEyeSlash } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, data, error: msg } = useSelector((state) => state.loginData);
  useEffect(() => {
    // Load saved credentials from localStorage
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedRememberMe && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (msg) {
      toast.error(msg, {
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
  }, [msg])

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && data?.data) {
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
      console.log('token data', data?.data)
      setTimeout(() => {
        navigate("/dashboard"); // Redirect to dashboard if token exists
      }, 1000);
    }
  }, [navigate, data]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.', {
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

    try {
      const response = await dispatch(
        loginUserDataAction({ email, password, rememberMe })
      );
      if (response?.payload?.token) {
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Invalid login credentials");
      }
    } catch (err) {
      // toast.error("Login failed. Please try again.", { ... });
    }
  };

  const [show, setShow] = useState(true);

  const handelShowPassword = (e) => {
    e.preventDefault();
    if (show === false) {
     return setShow(true);
    }
    else {
    return  setShow(false);
    }
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">

        {/* Left Section with Carousel */}
        <div className="hidden lg:flex w-1/2 bg-white justify-center items-center">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="w-full max-w-lg"
          >
            <SwiperSlide>
              <div className="text-center">
                <img
                  src={loginImage1}
                  alt="Onboarding Illustration 1"
                  style={{ width: '300px' }}
                  className="mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold mb-2">
                  Onboarding New Talent with Digital HRMS
                </h1>
                <p className="text-gray-600">
                  Everything you need in an easily customizable dashboard.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="text-center">
                <img
                  src={loginImage2}
                  alt="Onboarding Illustration 2"
                  style={{ width: '280px' }}
                  className="mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold mb-2">Track Your Progress</h1>
                <p className="text-gray-600">
                  Gain insights into team performance at a glance.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="text-center">
                <img
                  src={loginImage3}
                  style={{ width: '280px' }}
                  alt="Onboarding Illustration 3"
                  className="mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold mb-2">Streamline HR Tasks</h1>
                <p className="text-gray-600">
                  Simplify complex HR workflows with a single click.
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Right Section */}
        <div className="flex w-full lg:w-1/2 justify-center items-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <img src={ddHealthcare} alt="Logo" className="mx-auto mb-4" />
              <h1 className="text-2xl font-semibold">Welcome Back!</h1>
              <p className="text-gray-600">Please enter your details</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-700 mb-2 font-semibold"
                >
                  Employee Code / Email Address
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  placeholder="Enter email or employee code "
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700 mb-2 font-semibold"
                >
                  Password
                </label>
                <div
                  className="flex justify-between items-center w-full bg-white border  rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <input
                    type={show===true?'password':'text'}
                    id="password"
                    value={password}
                    placeholder="Enter password "
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded focus:ring-0 focus:ring-white focus:outline-none"
                    required
                  />
                  <Link onClick={handelShowPassword}
                  className="px-1 cursor-pointer"
                  >
                    {show ?( <FaEyeSlash size={20} />) : (<IoEyeSharp size={20}/>)}
                  </Link>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              {/* Remember Me Checkbox */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember Me
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-700"
              >
                Login
              </button>
            </form>
            <a href='/forget_password' className="flex mt-4 text-end text-blue-600">Forget password?</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
