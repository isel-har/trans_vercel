import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import UserStatus from "../global/userstatus";
import { useContext, useEffect, useState } from "react";
import { useNoti } from "@/app/contexts/notiContext";

export default function Prof({ userData }) {
  const [xp, setXp] = useState(0);
  // const {userData} = useNoti()
  useEffect(() => {
    if (userData != undefined)
      setXp((userData.score.current_xp / userData.score.required_xp) * 100);
  }, [userData]);

  return (
    <>
      {userData != undefined && (
        <div className="Prof pDivs flex flex-col ">
          <div className="flex items-center gap-[15px] p-[15px] w-[100%] gap-[25px] ">
            <div className="relative">
              <Avatar className="w-[155px] h-[155px] ava object-cover" priority>
                <AvatarImage
                  src={`${userData.user.avatar}`}
                  alt="@shadcn"
                  className="object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="progress relative">
              <Progress value={xp} className="ac" />
              <div className="rank flex items-center ">
                <Image
                  className="w-[55px] h-[55px] "
                  width={55}
                  height={55}
                  size="100vh"
                  alt="achi"
                  src={"/other/acheiv/2.png"}
                loading="lazy"

                ></Image>
                <h1 className="text-[#D95F15] text-[25px]">Bronze</h1>
                <p className="text-white absolute right-[0px]">
                  Level {userData.score.level}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between pl-[25px] pr-[25px]">
            <div>
              <p className="text-[#517DA2]">{userData.user.username}</p>
            </div>
            <Link
              href="/settings"
              className="bg-[#2C74B3] text-white flex cursor-pointer items-center h-[35px] pl-[5px] pr-[5px] rounded"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
