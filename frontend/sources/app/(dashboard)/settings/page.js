"use client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import "../../app_css/settings.css";
import Link from "next/link";
import Photo from "../../components/settings_components/photo.js";
import Inputs from "../../components/settings_components/Inputs.js";
import { useState, useRef } from "react";
import "../../app_css/global.css";
import {  useAuth } from "@/app/contexts/authContext";
import { useAxios } from "@/public/AxiosInstance";

function TwoFactorSection({ user }) {

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(user?.enable_2FA || false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const messageRef = useRef(null);
  const api = useAxios();

  const handleToggle2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");


    try {
      const response = await api({
        method: isEnabled ? "DELETE" : "POST",
        url: "auth/two-factor/",
        data: { password },
      });

      setIsEnabled(!isEnabled);
      setSuccessMessage(response.data.message);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "An error occurred");
    } finally {
      setLoading(false);
      setPassword("");
      setTimeout(() => setErrorMessage(""), 7000);
      setTimeout(() => setSuccessMessage(""), 7000);
    }
  };

  return (
    <div className="two-factor-section mt-6 border-t pt-6 w-full max-w-md mx-auto bg-inherit">
      <div className="two-factor-content p-4 rounded-lg w-full">
        <h3 className="text-lg font-medium mb-4 text-center text-white">
          Two-Factor Authentication
        </h3>
        <p className="status-text mb-4 text-center text-white">
          Status:{" "}
          <span
            className={`font-semibold ${
              isEnabled ? "text-green-500" : "text-red-500"
            }`}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </p>

        <form onSubmit={handleToggle2FA} className="two-factor-form w-full">
          <div className="password-input mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded bg-transparent text-white"
              placeholder="Enter your password to confirm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`toggle-button w-full p-2 rounded text-white transition-colors
              ${
                isEnabled
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-green-600"
              }
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading
              ? "Processing..."
              : isEnabled
              ? "Disable 2FA"
              : "Enable 2FA"}
          </button>
        </form>

        <div ref={messageRef} aria-live="polite" className="mt-4 text-center">
          {errorMessage && (
            <div className="error bg-red-500 text-white p-2 rounded mt-2">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="success bg-green-500 text-white p-2 rounded mt-2">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  // const router = useRouter();
  const [data, setData] = useState({});
  const [confirmPassword, setConfirmPassword] = useState(null);
  const { user } = useAuth();
  const api= useAxios();
  
  return (
    <>
      <Alert variant="destructive" className="error">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="border-red paragraph_er">
          Your login credentials are wrong!
        </AlertDescription>
      </Alert>
      <div className="settings 380px top-[0px]  w-[800px] pt-[25px] pl-[25px] rounded">
        <div className="flex gap-[25px] justify-center setts">
         <Photo ></Photo>
          <Inputs
            setData={setData}
            setConfirmPassword={setConfirmPassword}

          ></Inputs>
        </div>

        {user && !user?.oauth_42 && (
          <TwoFactorSection user={ user } />
        )}

        {
          !user.oauth_42 && 
        <div className="wrap mt-[15px]">
          <Link
            href="#"
            className="save"
            onClick={() => {
              if (data.new_password === confirmPassword) {
                api
                  .put("auth/edit/", data)
                  .then((res) => {
                    // Success handling
                  })
                  .catch((erro) => {
                    let er = document.querySelector(".error");
                    let error = document.querySelector(".paragraph_er");
                    er.style.top = "25px";
                    error.innerHTML = "Incorrect password!";
                    setTimeout(() => {
                      er.style.top = "-100px";
                    }, 7000);
                  });
              } else {
                let er = document.querySelector(".error");
                let error = document.querySelector(".paragraph_er");
                error.innerHTML = "password confirm doesnt match new password!";
                er.style.top = "25px";
                setTimeout(() => {
                  er.style.top = "-100px";
                }, 7000);
              }
            }}
          >
            Save new password
          </Link>
        </div>
        }
      </div>
    </>
  );
}
