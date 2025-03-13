"use client";

import { useState } from "react";
import { useEffect } from "react";
import Input from "../global/input";
import { CiSearch } from "react-icons/ci";

import "../../app_css/global.css";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";

export default function Search({search, setSearch }) {
  
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const [width, setWidth] = useState();
  const [index, setIndex] = useState(0);
  const api= useAxios();
  // const handleResize = () => {
  //   setWidth(window.innerWidth);
  // };
  // useEffect(() => {
  //   window.addEventListener("resize", handleResize);
  //   let search = document.querySelector(".searchTab");
  //   if (width <= 1088) {
  //     search.style.display = "none";
  //   }
  // }, [width]);
  const fetchSearch = async () =>{
    let searchTab = document.querySelector(".searchTab");
    let input = document.querySelector(".search");
    if (input.value != undefined && input.value != "") {
      searchTab.style.display = "block"
      api
        .get(`search?query=${input.value}&index=${index}`)
        .then((res) => {
            // console.log("ha result dial search : ", res);
          if (res.statusText === "OK") {
            if (index != 0){
                setUsers(users.concat(res.data));
            }
            else{
                setUsers(res.data)
            }
          } 
        })
        .catch(
          (error) => {
            console.log(error);
          } // router.push("/login")
        );
    } else {
      searchTab.style.display = "none"
      setUsers([])
      setIndex(1)
    }
    
}
  const ScrollLoading = (e) => {
      if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
        setIndex((prevIndex) => prevIndex + 10);
        fetchSearch();
      }
  };
  return (
    <>
      <Input
        type="search"
        className="search_in text-black"
        placeholder="Search"
        setUsers={setUsers}
        index={index}
        setIndex={setIndex}
        fetchSearch={fetchSearch}
      />
      <Link
        href="#"
        className="w-[55px] h-[50px] bg-[#222831] rounded-full p-[7px] search_icon"
      >
        <CiSearch className="text-white w-[100%] h-[100%]" onClick={() =>{
          if (search ==false)
            setSearch(true)
          else{
            setSearch(false)

          }
        }}/>
      </Link>
      <div 
      onScroll={(e) =>{
      ScrollLoading(e)

      }}
      className="w-[370px] h-[300px] bg-[#13171C] flex flex-col gap-[15px] absolute top-[135px] p-[25px] hidden searchTab overflow-y-scroll">
        {users.map((user, key) => (
          <div
            className="flex text-white items-center gap-[15px] cursor-pointer pt-[7px] pb-[7px] hover:bg-[#131a25]"
            onClick={() => {
              router.push(`/profile/${user.id}`);
            }}
            key={key}
          >
            <div>
              <Avatar className="w-[50px] h-[50px] ">
                <AvatarImage
                  src={user.avatar}
                  alt="@shadcn"
                  className="object-cover w-[100%] h-[100%]"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <p>{user.username}</p>
          </div>
        ))}
      </div>
    </>
  );
}