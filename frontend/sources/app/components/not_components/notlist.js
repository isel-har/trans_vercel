"use client";

// import { useAuth } from "@/app/contexts/authContext";
// import { useAxios } from "@/public/AxiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdPersonAdd } from "react-icons/md";
import { MdPersonAddDisabled } from "react-icons/md";
// import Link from "next/navigation";
import Link from "next/link";

export default function Notlist({ pending, removeNoti }) {


  return (
    <div className="noti pt-[15px]  hidden">
      <h1 className="text-white text-[23px] ml-[15px]">Notifications</h1>
      <div className="notiList">
        {
          pending?.map((not, key) => {
        
            return (
              <div
                className={`not${not.friend.id}} text-white flex gap-[7px] items-center mb-[11px] ml-[15px] mt-[15px]`}
                key={key}
              >
                <Avatar>
                  <AvatarImage
                    src={not.friend.avatar}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  {not.is_sender ?  <p>you sent a friend request to {not.friend.username}</p> : <p>{not.friend.username} sent you a friend request</p> }
                  <span className="text-gray text-[15px] opacity-[0.3]">
                    {not.created_at.substr(0, 16)}
                  </span>
                </div>
                <div>
                <Link
                    href="#"
                    className="text-white  cursor-pointer   rounded"
                    onClick={() => removeNoti(not.id, 'DELETE')}
                  >
                    <MdPersonAddDisabled className="w-[25px] h-[25px]" />
                  </Link>
                  <Link
                    href="#"
                    className="text-white  cursor-pointer   rounded"
                    onClick={() => removeNoti(not.id, 'PUT')}
                  >
                    <MdPersonAdd className="w-[25px] h-[25px]" />
                  </Link>

                </div> 
          </div>
        )
        })}

        </div>
    </div>
  );
}
