"use client";


import { CgProfile } from "react-icons/cg";
import { IoMdSettings } from "react-icons/io";
import { IoLogOutSharp } from "react-icons/io5";
import { useAxios } from "@/public/AxiosInstance";
// import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";

export default function ProTab({ setUser }) {

  // const { setUser } = useAuth();
  const router = useRouter();
  const api = useAxios();


  const logoutFunc = async () => {    
    const token = localStorage.getItem("token");
    try {
      await api.post("auth/logout/");
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      console.log(err)
    }
  };
  return (
    <div className="profileTab pl-[17px] cursor-pointer hidden ">
      <div
        className="flex items-center gap-[25px] pl-[20px] pTab"
        onClick={() => {
          router.push("/profile");
        }}
      >
        <CgProfile className="pIcon" />
        <h1 className="text-[25px]">Profile</h1>
      </div>
      <div
        className="flex items-center object-cover gap-[25px] pl-[20px] pTab"
        onClick={() => {
          router.push("/settings");
        }}
      >
        <IoMdSettings className="pIcon" />

        <h1 className="text-[25px]">Settings</h1>
      </div>
      <div
        className="flex items-center gap-[25px] pl-[20px] pTab"
        onClick={logoutFunc}
      >
        <IoLogOutSharp className="pIcon" />

        <h1 className="text-[25px]">Log Out</h1>
      </div>
    </div>
  );
}
