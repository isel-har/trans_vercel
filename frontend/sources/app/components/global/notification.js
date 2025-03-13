"use client";

import "../../app_css/global.css";
import Image from "next/image";
import noti from "../../../public/other/notification.png";
import { useEffect, useState } from "react";
import Notlist from "../not_components/notlist.js";
import { useNoti } from "@/app/contexts/notiContext";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";


const Notification = () => {

  const { friends, setFriends } = useNoti();
  const [pending, setPending] = useState([]);
  const api= useAxios();

  const removeNoti = async (id, action) => {
    const path = action === 'PUT' ? `friends/accept/${id}/`:`friends/delete/${id}/`;
    try {
      await api(path, {method: action});
      if (action === 'PUT'){
        setFriends((prev) => prev.map((n) => {
          if (n.id === id)
            n.status = 'accepted'
          return n
        }));
      } else {
        setFriends((prev) => prev.filter((n) => n.id !== id ));
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setPending(friends.filter((n) => n.status === 'pending' && !n.is_sender));
  }, [friends]);

  return (
    <>
      <div
        className="notification cursor-pointer relative"
        onClick={() => {
          let noti = document.querySelector(".noti");
          if (noti != null) {
            if (noti.style.display == "none" || noti.style.display == "") {
              noti.style.display = "block";
            } else if (noti.style.display == "block") {
              noti.style.display = "none";
            }
          }
        }}
      >
        <Image
          className=""
          width={30}
          height={30}
          alt="noti"
          src={noti}
          loading="lazy"

        ></Image>
        <span className="absolute right-[-3px] top-[-1px] bg-red-800 rounded-full w-[18px] h-[18px] text-[12px] text-bold text-center text-white">
          {pending.length}
        </span>
      </div>
      <Notlist pending={pending} removeNoti={removeNoti} />
    </>
  );
}

export default Notification;