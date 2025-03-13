"use client";

import { FaCheck } from "react-icons/fa";
// import axios from "axios";
// import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/authContext";
import { useAxios } from "@/public/AxiosInstance";

export default function Input({ labe, type, setter, ids, data }) {

  const {user, setUser} = useAuth();
  const api= useAxios();

  
  let ren = undefined;
  if (type != "password") {
    ren = (
      <div
        className="w-[40px] h-[40px] pl-[12px] pr-[12px] bg-[#1f7ac9] flex justify-center items-center rounded cursor-pointer"
        onClick={() => {
          api
            .put("auth/edit/", data)
            .then((res) => {
              let obj = user;

              if (labe == "UserName") {
                const updatedObj = { ...obj, username: data.username };
                setUser(updatedObj);
              }
              
            })
            .catch((error) => {
              console.log(error)
            });
        }}
      >
        <FaCheck />
      </div>
    );
  }
  return (
    <div className="flex flex-col text-white mb-[15px]">
      <label className="text-white text-[21px]">{labe}</label>
      <div className="flex items-center gap-[15px]">
        <input
          className={`setting_in bg-transparent ${ids}`}
          type={type}
          onChange={() => {
            let inp = document.querySelector(`.${ids}`);
            setter(inp.value);
          }}
        ></input>
        {ren}
      </div>
    </div>
  );
}
