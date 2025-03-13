"use client";

import "../../app_css/chat.css";

// import { getCookie, getCookies } from "cookies-next";
import Users from "./[userID]/components/users";
import Image from "next/image";
import { useState } from "react";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";

import Info from "./info";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNoti } from "@/app/contexts/notiContext";
import { useRouter } from "next/navigation";


export default function Chat({ children }) {
  const [info, setInfo] = useState(undefined);
  const { friends } = useNoti();
  const router = useRouter();

  return (
    <div className="content w-[1700px] h-[1000px]">
      <Carousel className="pt-[17px] w-full max-w-sm absolute  z-[15]  pl-[10px] h-[100px] bg-none left-[50%] translate-x-[-50%] mSt">
        <CarouselContent className="-ml-1 pl-[10px]">
          {
            friends.map((friend) => {
              return (
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    router.push(`/chat/${friend.friend.id}`);
                  }}
                >
                  <Avatar className="w-[55px] h-[55px] chat_av">
                    <AvatarImage src={`${friend.friend.avatar}`} alt={`simo`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <h1 className="text-white">{friend.friend.username}</h1>
                </div>
              );
            })}
        </CarouselContent>
        <CarouselPrevious className="text-white" />
        <CarouselNext className="text-white" />
      </Carousel>
      <div className="con w-[100%] h-[100%] flex gap-[7px]">
        <Users></Users>
        <div className="convo">{children}</div>
        <div className="info bg-[#0e1825] h-[100%] w-[30%] relative">
          {info === undefined ? (
            <Image
              width={500}
              height={500}
              src="/simo/4-chat/aas.png"
              className="w-[500px] w-[500px] absolute top-[50%] translate-x-[-50%] left-[50%] translate-y-[-50%]"
            />
          ) : (
            <Info info={info} />
          )}
        </div>
      </div>
    </div>
  );
}
