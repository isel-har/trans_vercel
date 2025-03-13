"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";

// import { useAxios } from "@/public/AxiosInstance.js";
import { useAuth } from "@/app/contexts/authContext.js";
// import { intraURL } from "@/public/urls";
import axios from "axios";
import { HTTPENDPOINT } from "@/public/urls";

export default function Login() {
  
  const toast = useToast();
  const router = useRouter();
  const [imgUrl, setImgUrl] = useState("42.png");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useAuth();

  const intraURL =`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_QUERY_URL}`;
  
  const handleLogin = async (e) => {
    // e.preventDefault();

    try { 
      const response = await axios.post(
        `${HTTPENDPOINT}auth/login/`,
        { username: userName, password: password }
      );


      if (response.data.TFA) {
        setRequires2FA(true);
      } else {
        localStorage.setItem("token", response.data.access);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.response?.data?.detail || "Invalid credentials",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
      `${HTTPENDPOINT}auth/verify-2FA/`,
        { code, username: userName }
      );

      localStorage.setItem("token", response.data.access);
      setUser(response.data);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "An error occurred while verifying the code."
      );
    } finally {
      setLoading(false);
      setCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6">
        {/* Login Form */}
        {!requires2FA && (
          <form
            className="bg-[#1a1f2e] shadow-2xl rounded-2xl p-8 border border-[#2a3142]"
            onSubmit={handleLogin}
          >
            <h1 className="text-3xl font-bold text-center mb-8 text-white">
              Get Started Now
            </h1>

            {/* 42 Login Button */}
            <div
              className="flex items-center justify-center space-x-2 p-3 border border-[#2a3142] rounded-xl cursor-pointer 
                                     bg-[#1e2332] hover:bg-[#252a3c] transition-all duration-300 mb-6 group"
              onMouseOver={() => setImgUrl("42-v2.png")}
              onMouseLeave={() => setImgUrl("42.png")}
              onClick={() => {
                router.push(intraURL);
              }}
            >
              <Image
                src={`/auth/1-register/${imgUrl}`}
                alt="42 logo"
                width="35"
                height="35"
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                LOGIN WITH INTRA
              </span>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a3142]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1f2e] text-gray-400">or</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1e2332] border border-[#2a3142] text-white 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                                             placeholder-gray-500"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1e2332] border border-[#2a3142] text-white 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
                                             placeholder-gray-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
            type="button"
              onClick={() =>{
                handleLogin()
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium 
                                     hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 mt-8
                                     transform hover:-translate-y-1 active:translate-y-0
                                     shadow-lg hover:shadow-blue-500/25"
            >
              LOGIN
            </button>

            <p className="text-center mt-6 text-gray-400">
              Don't have an account?
              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 ml-1 transition-colors duration-300"
              >
                Register
              </Link>
            </p>
          </form>
        )}

        {/* 2FA Modal */}
        {requires2FA && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-[#1a1f2e] rounded-2xl p-8 shadow-2xl w-full max-w-md mx-4 
                                    transform transition-all duration-300 ease-in-out border border-[#2a3142]"
            >
              <div className="text-center mb-8">
                <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-gray-400 mt-2">
                  Please enter the verification code sent to your email
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="w-12 h-12 text-center text-xl font-semibold bg-[#1e2332] text-white
                                                     border-2 border-[#2a3142] rounded-lg 
                                                     focus:border-blue-800 focus:ring-blue-800 focus:outline-none 
                                                     transition-all duration-200"
                      value={code[index] || ""}
                      onChange={(e) => {
                        const newCode = code.split("");
                        newCode[index] = e.target.value;
                        setCode(newCode.join(""));

                        if (e.target.value && e.target.nextSibling) {
                          e.target.nextSibling.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !e.target.value &&
                          e.target.previousSibling
                        ) {
                          e.target.previousSibling.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`
                                        w-full py-3 px-4 rounded-xl text-white font-medium
                                        transition-all duration-300 ease-in-out
                                        transform hover:-translate-y-1 active:translate-y-0
                                        ${
                                          loading
                                            ? "bg-gray-600 cursor-not-allowed"
                                            : "bg-blue-900 hover:bg-blue-800 active:bg-blue-800 shadow-lg"
                                        }
                                    `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Didn't receive the code?
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 ml-1 font-medium transition-colors duration-300"
                    onClick={() => {
                      /* Add resend code functionality */
                    }}
                  >
                    Resend
                  </button>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
