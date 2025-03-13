"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BsPersonFill } from "react-icons/bs";
import { MdBlock } from "react-icons/md";

export default function Info({ info }) {
  return (
    <div className="w-[100%] h-[155px] flex flex-col justify-center items-center gap-[15px] absolute top-[170px]">
      <h1 className="text-[35px] text-white username">{info.username}</h1>
      <Avatar className="w-[285px] h-[285px] chat_av">
        <AvatarImage src={`${info.avatar}`} alt={`${info.username}`} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="text-white  flex gap-[7px] items-center mt-[25px]">
        <BsPersonFill className="text-[35px] cursor-pointer" />
        <h1 className="text-[20px] chal cursor-pointer">Challenge</h1>
        <MdBlock className="text-[35px] cursor-pointer" />
      </div>
    </div>
  );
}
