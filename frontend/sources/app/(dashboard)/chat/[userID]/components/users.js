"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
// import Image from "next/image";
// import axios from "axios";
// import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import UserStatus from "../../../../components/global/usersstatus";
// import { useContext } from "react";
// import { Input } from "@chakra-ui/react";
import { useNoti } from "@/app/contexts/notiContext";

export default function Users() {

  const router = useRouter();
  // const [friendss, setFriendss] = useState([]);
  const [users, setUsers] = useState([]);
  const { friends } = useNoti();

  useEffect(() => {
    setUsers(
      friends?.filter((friend) => {
        return friend.status !== "pending";
      }));
  }, [friends]);

  return (
    <div className="users relative w-[20%]">
      <h1 className="text-[#FFFFFF] opacity-[0.3] messages mb-[25px]">
        Messages
      </h1>

      <div className="users_list  flex flex-col gap-[15px] h-[405px] overflow-y-scroll">
        {users.map((friend) => (
          <div
            className="flex items-center user gap-[15px] hover:bg-[#0D1117] pt-[15px] pl-[15px] cF pb-[15px] rounded cursor-pointer"
            onClick={() => {
              router.push(`/chat/${friend.friend.id}`);
            }}
          >
            <div className="relative avat">
              <Avatar className="w-[55px] h-[55px] chat_av">
                <AvatarImage
                  src={`${friend.friend.avatar}`}
                  alt={`${friend.friend.username}`}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <UserStatus friend={friend}></UserStatus>
            </div>
            <div className="text-white">
              <h1 className="text-[21px] font-semibold friend_name">
                {friend.friend.username}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
