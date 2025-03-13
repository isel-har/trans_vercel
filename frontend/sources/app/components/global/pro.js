"use client";

import "../../app_css/global.css";
import Image from "next/image";
import arrow from "../../../public/global/arrow.png";
import UserStatus from "./userstatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProTab from "./proTab.js";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/app/contexts/authContext";

export default function Pro() {

  const { user, setUser } = useAuth()

  return (
    <>
      <div
        className="pro"
        onClick={(e) => {
          let pro = document.querySelector(".pro");
          let profileTab = document.querySelector(".profileTab");
          e.stopPropagation();
          if (profileTab != null) {
            if (
              profileTab.style.display == "none" ||
              profileTab.style.display == ""
            ) {
              pro.style.borderBottomLeftRadius = "0";
              pro.style.borderBottomRightRadius = "0";
              profileTab.style.display = "flex";
            } else if (profileTab.style.display == "flex") {
              profileTab.style.display = "none";
              pro.style.borderBottomLeftRadius = "35px";
              pro.style.borderBottomRightRadius = "35px";
            }
          }
        }}
      >
        <div className="flex gap-[15px]">
          {user != undefined ? (
            <>
              <div className="relative">
                <Avatar className="w-[50px] h-[50px] ava">
                  <AvatarImage
                    src={`${user.avatar}`}
                    alt="@shadcn"
                    className="object-cover"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <UserStatus></UserStatus>
              </div>
              <div className="info flex items-center">
               
                <span className="text-[#707D89]">@{user.username}</span>
              </div>
            </>
          ) : (
            <>
              {" "}
              <Skeleton className="h-12 w-12 rounded-full bg-white" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[140px]  bg-white" />
                <Skeleton className="h-4 w-[130px]  bg-white" />
              </div>
            </>
          )}
        </div>
        <Image
          className="w-[11px] h-[11px] imagg"
          width={0}
          height={0}
          src={arrow}
          alt="arrow"
          loading="lazy"

        ></Image>
      </div>
      <ProTab setUser={setUser}/>
    </>
  );
}
