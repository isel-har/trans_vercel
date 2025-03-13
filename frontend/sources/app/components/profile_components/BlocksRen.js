"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "../../app_css/etc2.css";
import { CgUnblock } from "react-icons/cg";
import { ChakraProvider } from "@chakra-ui/react";
import { useNoti } from "@/app/contexts/notiContext";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";


export default function BlocksRen() {
  const {blocks, setBlocks} = useNoti();
  const api= useAxios();

  const token = localStorage.getItem("token")
  const Unban = async (id, user) => {
    try {
      await api.delete(`ban/${id}/`);

      setBlocks(
        blocks.filter((block) => {
          return block.blocked_username !== user;
        })
      );
    } catch (error) {
      console.log(error)
    }
  };

 
  return (
    <ChakraProvider>
      <div className="flex flex-col gap-[25px] h-[400px] overflow-y-scroll fr">
        {blocks.map((blocks, key) => (
          <div className="fr_list flex justify-between" key={key}>
            <div className="tit flex  items-center text-white gap-[11px]">
              <Avatar className="w-[50px] h-[50px] object-cover ">
                <AvatarImage
                  src={`${blocks.avatar}`}
                  alt="@shadcn"
                  className="object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1>{blocks.blocked_username}</h1>
            </div>
            <div className="fr_opts flex">
              <CgUnblock
                className="w-[35px] h-[35px] text-white cursor-pointer"
                onClick={() => {
                  try {
                    Unban(blocks.blocked_id, blocks.blocked_username);
                  } catch (error) {
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChakraProvider>
  );
}
