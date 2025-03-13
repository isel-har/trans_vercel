"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image.js";
import UserStatus from "../global/usersstatus.js";
import "../../app_css/etc2.css";
import { useContext } from "react";
import { useNoti } from "@/app/contexts/notiContext.js";

export default function FriendsRen() {
  const { friends } = useNoti();
  function isFriend(n, key) {
    if (n.status == "accepted") {
      return (
        <div className="fr_list flex justify-between" key={key}>
          <div className="tit flex  items-center text-white gap-[11px]">
            <div className="relative">
              <Avatar className="w-[50px] h-[50px] ">
                <AvatarImage
                  className="w-[100%] h-[100%] object-cover"
                  src={`${n.friend.avatar}`}
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <UserStatus friend={n}></UserStatus>
            </div>
            <h1>{n.friend.username}</h1>
          </div>
          <div className="fr_opts flex">
            <Link href={`/chat/${n.friend.name}`}>
              <Image
                width={35}
                height={35}
                alt="friends1"
                src="/other/friends1.png"
                loading="lazy"
              ></Image>
            </Link>
            <Link href={`/profile/${n.friend.name}`}>
              <Image
                width={35}
                height={35}
                alt="friends2"
                src="/other/friends2.png"
                loading="lazy"
              ></Image>
            </Link>
          </div>
        </div>
      );
    }
    return false;
  }
  return (
    <div className="flex flex-col gap-[25px] h-[400px] overflow-y-scroll fr">
      {friends != null && friends.map((friend, key) => isFriend(friend, key))}
    </div>
  );
}
