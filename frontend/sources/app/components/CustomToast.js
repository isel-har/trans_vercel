import React, { useState } from "react";
// import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { getCookie } from "cookies-next";
// import { useContext } from "react";

const CustomToast = ({data , info}) => {

  const [shownoti, setnotification] = useState(true);


  return ( shownoti && 
    <div className="friend_request flex absolute pt-[15px] pb-[15px] pl-[15px] pr-[15px] gap-[11px] items-center rounded  z-[155]  left-[50%] translate-x-[-50%] transition-[0.3s]">
      <Avatar className="w-[50px] h-[50px] ava">
        <AvatarImage
          src={`${data.avatar}`}
          alt="@shadcn"
          className="object-cover"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <h1 className="text-white">
        <b className="t">{data.username}</b> {info.reason}
      </h1>
      <div className="flex gap-[5px] flex-col">
        <button
          className="bg-[#131a25] text-white pt-[5px] pr-[11px] pl-[11px] pb-[5px] rounded"
          onClick={() => {
            info.handleAccept();
            setnotification(false);
          }}
        >
          Accept
        </button>
        <button
          className="bg-[#FF0000] text-white pt-[5px] pr-[10px] pl-[10px] pb-[5px] rounded"
          onClick={() => {
            info.handleDecline();
            setnotification(false);
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CustomToast;
