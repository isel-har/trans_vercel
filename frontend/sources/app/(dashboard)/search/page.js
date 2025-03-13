"use client";

import "../../app_css/search.css";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import UserStatus from "../../components/global/userstatus";
import { Input } from "@/components/ui/input"


export default function Search() {

  const [users] = useState([]);
  const router = useRouter();

  return (
    <div className="absolute w-[100vw] h-[100vh] z-[1000000]">
      <div className="ins z-[100] w-[70%] h-[45px] bg-[#1F2326] rounded flex items-center">
      {/* <IoSearch className="text-white w-[25px] h-[25px]"/> */}

      <Input type="email" placeholder="Email" />        {/* <input
          type="search"
          onChange={(e) => {
            let input = document.querySelector(".search_ins");
            if (input.value != undefined && input.value != "") {
              axios
                .get(`http://localhost:8000/api/search?query=${input.value}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                  if (res.statusText === "OK") {
                    setUsers(res.data);
                  } else {
                  }
                })
                .catch(
                  (error) => {
                    if (error.status === 401) router.push("/login");
                  } // router.push("/login")
                );
            }
          }}
          className="z-55  search_ins pl-[15px]"
          placeholder="Search something...."
        /> */}
        
      </div>
      <div className="searchs_tab w-[80%] bg-[#222831] h-[250px] 	overflow-y-scroll">
        {users.map((user) => (
          <div
            className="flex text-white items-center gap-[15px] cursor-pointer pt-[7px] pb-[7px] hover:bg-[#131a25]"
            onClick={() => {
              router.push(`profile/${user.id}`);
            }}
          >
            <div className="relative">
              <Avatar className="w-[50px] h-[50px] relative">
                <AvatarImage
                  src={user.avatar}
                  alt="@shadcn"
                  className="object-cover w-[100%] h-[100%]"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <UserStatus></UserStatus>
            </div>
            <p>{user.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
