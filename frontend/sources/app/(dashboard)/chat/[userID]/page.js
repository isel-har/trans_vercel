"use client";
import "../../../app_css/chat.css";
// import { getCookie } from "cookies-next";
// import { useEffect, useState } from "react";
// import axios from "axios";
import Messages from "./components/messages/messages.js";
import { useRouter } from "next/navigation";
import { useNoti } from "@/app/contexts/notiContext";
// import { useContext } from "react";


export default function Chat({ params }) {
  // const [userD, setD] = useState({ username: "" });
  // const [rootData, setRootData] = useState({});
  // let router = useRouter();
  // const {friends} = useNoti()
  // useEffect(() => {
  //   // replace with ?query=${user.id}
  //   let tmp = friends.filter((friend) => {
  //     console.log("fff => ", friend);
  //     return friend.friend_name === params.userName;
  //   });
  //   if (tmp.length === 0) {
  //     router.push("/chat");
  //   } else {
  //     console.log("tmp => ", tmp);
  //   }

  // }, []);

  return <Messages userID={params.userID} />;
}
