"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { MdPersonAdd } from "react-icons/md";
import { MdPersonAddDisabled } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";
import UserStatus from "../global/userstatus";
import { MdPending } from "react-icons/md";
import { useContext } from "react";
import AddButton from "./Addbutton";
import PendingButton from "./PendingButton";
import RemoveButton from "./RemoveButton";
import { useNoti } from "@/app/contexts/notiContext";

const Pro = ({ uData, xp}) => {
  const { friends } = useNoti()
  const [friend, setFriend] = useState({})
  useEffect(() =>{
    if (friends != null){
      let tmp = friends.filter((friend) =>{
        return friend.friend.id === uData.user.id;
      })
      if (tmp.length != 0)
        setFriend(tmp[0])
      else
        setFriend({})
    }
  }, [friends])
  return (
    <div className="Prof pDivs flex flex-col relative">
      <h1 className="text-red-800 absolute top-[25px] left-[500px] hidden no">
        noti
      </h1>
      <div className="flex items-center gap-[15px] p-[15px] w-[100%] gap-[55px] pF">
        <div className="relative">
          <Avatar className="w-[155px] h-[155px] ava">
            <AvatarImage
              src={uData.user.avatar}
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
              Level {uData.score.level}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between pl-[25px] pr-[25px]">
        <div>
          
          <p className="text-[#517DA2]">{uData.user.username}</p>
        </div>
        <div className="flex gap-[25px] items-center">
          {friend.status === undefined ? (
            <AddButton uData={uData} />
          ) : friend.status === "pending" ? (
            <PendingButton uData={uData} />
          ) : (
            <RemoveButton uData={uData} /> // For the case when requestAccepted and requestPending are both true.
          )}
          <Link href={`/chat/${uData.username}`}>
            <Image
              width={45}
              height={45}
              alt="friends1"
              src="/other/friends1.png"
              loading="lazy"

            ></Image>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default function Prof({ uData, friends, user }) {
  let [isBlock, setIsBlock] = useState(false);
  let [isFriend, setIsFriend] = useState(0);
  let router = useRouter();
  let [isMe, setIsMe] = useState(false);
  let toast = useToast();
  let [xp, setXp] = useState(0);

  useEffect(() => {
    if (uData != undefined)
      setXp((uData.score.current_xp / uData.score.required_xp) * 100);
  }, [uData]);

  return <>{uData != undefined && <Pro uData={uData}  xp={xp}></Pro>}</>;
}
