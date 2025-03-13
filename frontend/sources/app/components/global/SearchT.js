'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaX } from "react-icons/fa6";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";

export default function SearchT({setSearch}){

  const [users, setUsers] = useState([])
  const router = useRouter();
  const api= useAxios();  
  const [index, setIndex] = useState(0);

  const fetchSearch = async () =>{
        let searchTab = document.querySelector(".searchTab");
        let input = document.querySelector(".searchT");
        if (input.value != undefined && input.value != "") {

          api
            .get(`search?query=${input.value}&index=${index}`)
            .then((res) => {
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


  const clearInput = () => {
    toSearch.current.value = "";
    setUsers([]);
    setIndex(0);
  };

  return (
    <div className="sT absolute w-[600px] h-[300px] top-[87%] left-[50%] translate-x-[-50%] bg-[#111827] " onScroll={(e) =>{
      ScrollLoading(e)
    }}>
          <FaX className="cursor-pointer text-white absolute right-[7px] top-[7px]" onClick={() =>{
            setSearch(false)
          }}/>
            <input type="search" placeholder="Search..." className=" searchT mb-[25px]" onChange={(e) => {
              fetchSearch(0)
      }
      }/>
      {

        users.map((u) =>{
            return (

            <div className="w-[100%] flex items-center gap-[15px] pl-[15px] mb-[15px] cursor-pointer sEl pt-[5px] pb-[5px]" onClick={() =>{
                router.push(`/profile/${u.id}`)
            }}>
            <Avatar className="w-[40px] h-[40px] ">
                <AvatarImage
                  src={u.avatar}
                  alt="@shadcn"
                  className="object-cover w-[100%] h-[100%]"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className="text-white">{u.username}</h1>
            </div>
            )
        })
      }
      
        </div>
    )
}