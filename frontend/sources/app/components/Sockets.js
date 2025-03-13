"use client";

import { getCookie } from "cookies-next";
import "../app_css/global.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";
import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomToast from "./CustomToast";
import { useContext } from "react";
import {
  GameInviteHandler,
  TournamentHandler,
} from "./multi_components/game_handler";

export default function Sockets() {


  const router = useRouter();

  // let [token, setToken] = useState(null);
  const toast = useToast();
  const [show, setShow] = useState(false);
  let [data, setData] = useState({});
  let pathname = usePathname();

  let [f, setF] = useState(false);
  let checkStatus;

  // useEffect(() => {
  //   if (data.type == "STATUS_UPDATED") {
  //     let f = friends.filter((frie) => {
  //       return frie.friend_name === data.data.username;
  //     });
  //     if (f.length != 0) {
  //       f.forEach((fr) => {
  //         fr.status = data.data.status;
  //       });
  //       let final = friends.filter((frie) => {
  //         return frie.friend_name !== data.data.username;
  //       });
  //       final = [...final, f[0]];
  //       console.log("print final => ", final);
  //       setFriends(final);
  //     }
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (getCookie("token") != undefined) setToken(getCookie("token"));
  //   else setToken(null);
  // }, [pathname]);

  // useEffect(() => {
  
  //     console.log("First effect!");

  //   if (token != undefined) {
  //     let notSock = new WebSocket(
  //       `ws://localhost:8000/ws/notifications?t=${token}`
  //     );
  //     console.log("notSock => ", notSock);
  //     notSock.onopen = function (e) {
  //       notSock.send(JSON.stringify({ user_status: "Online" }));
  //     };
  //     notSock.onclose = function (e) {
  //       console.log("diro => ", e);
  //     };
  //     notSock.onclose = () => {};
  //     // notSock.onmessage = function (e){
  //     //   console.log("e =>", e)
  //     // }
  //     // return () => {
  //     //   notSock.close(); // Cleanup on component unmount
  //     // };
  //     notSock.onmessage = function (e) {
  //       let d = JSON.parse(e.data);
  //       console.log("1")
  //       const handleAccept = () => {


  //         fetch(`http://localhost:8000/api/friends/accept/${d.data.friendship_id}/`, {
  //           method: "PUT",
  //           headers: { Authorization: `Bearer ${token}` },
  //         })
  //           .then((res) => {
  //             let obj = {
  //               avatar: d.data.data.avatar,
  //               friend_id: d.data.data.uid,
  //               friend_name: d.data.data.username,
  //               friendship_status: "accepted",
  //               id: d.data.data.friendship_id,
  //               requested: null,
  //             };
  //             setFriends(
  //               friends.filter(
  //                 (friend) => friend.username !== d.data.data.username
  //               )
  //             );
  //             setFriends([...friends, obj]);
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //           });
  //         let noti = document.querySelector(".friend_request");
  //         noti.style.top = "-150px";
  //       };
  //       const handleDecline = () => {
  //         fetch(
  //           `http://localhost:8000/api/friends/${d.data.data.id}/`,
  //           {
  //             // replace with userData.id
  //             method: "DELETE",
  //             headers: { Authorization: `Bearer ${token}` },
  //           }
  //         )
  //           .then((res) => {})
  //           .catch((error) => {
  //             console.log(error);
  //           });
  //         let noti = document.querySelector(".friend_request");
  //         noti.style.top = "-150px";
  //       };
  //       setData(d.data);
  //       setLastMessage(d);
  //       if (d.data.type == "FRIEND_REQUEST_CREATE") {
  //         if (check.length === 0) {
  //           setCheck([{ dummy: "dummy", dummies: "dummies" }]);
  //         } else {
  //           setCheck([]);
  //         }
  //         setNotList([d.data, ...notList]);
  //         toast({
  //           title: d?.title,
  //           description: "Game invitation received",
  //           duration: 3000,
  //           position: "top-right",
  //           render: () => (
  //             <CustomToast
  //               data={d.data.data}
  //               info={{
  //                 handleAccept: handleAccept,
  //                 handleDecline: handleDecline,
  //                 reason: "sent you a friend request",
  //               }}
  //             />
  //           ),
  //         });
  //       }

  //       if (d.data.type !== undefined) {
  //         if (d.data.type == "FRIEND_REMOVE") {
  //           if (check.length === 0) {
  //             setCheck([{ dummy: "dummy", dummies: "dummies" }]);
  //           } else {
  //             setCheck([]);
  //           }
  //         }
  //         // if (d.data.type == "FRIEND_REQUEST_CREATE") {

  //         // }
  //         if (d.data.type == "FRIEND_ADD") {
  //           if (check.length === 0) {
  //             setCheck([{ dummy: "dummy", dummies: "dummies" }]);
  //           } else {
  //             setCheck([]);
  //           }
  //         }
  //       }
  //       if (d.data?.type === "GAME_INVITE") {
  //         toast({
  //           title: data?.title,
  //           description: "Game invitation received",
  //           duration: 15000,
  //           position: "top-right",
  //           render: () => <GameInviteHandler data={d} token={token} />,
  //         });
  //       }
  //       if (d.data.type === "GAME_ACCEPTED") {
  //         toast({
  //           title: "game accepted",
  //           duration: 2000,
  //           position: "top-right",
  //         });
  //         const room = d.data?.data?.room_name;
  //         alert(room);
  //         router.push(`/game/pingpong/multiplayer?room_name=${room}`);
  //       }
  //       if (d.data.type === "TR") {
          
  //         console.log("in tournament => ", e.data)
  //         toast({
  //           title: data?.title,
  //           description: "Game invitation received",
  //           duration: 3000,
  //           position: "top-right",
  //           render: () => {
  //             return(
  //                <TournamentHandler data={d.data} />
  //             )
  //           },
  //         });
  //       }
  //       if (d.data.type === "STATUS_UPDATED") {
  //         if (f) {
  //           setF(true);
  //         } else setF(false);
  //       }
  //     };
  //   }
  // }, [token]);
  useEffect(() => {
    setTimeout(() => {
      document.querySelector("body").style.backgroundColor = "#131A25";
    }, 700);
  }, []);
}
