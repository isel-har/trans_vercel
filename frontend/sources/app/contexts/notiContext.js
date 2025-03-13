"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";
import { useToast } from "@chakra-ui/react";
import { GameInviteHandler, TournamentHandler } from "../components/multi_components/game_handler";
import { useAxios } from "@/public/AxiosInstance";
import { NotifWsURL } from "@/public/urls";
import { useAuth } from "./authContext";

const notiContext = createContext();

const useNoti = () => { return useContext(notiContext); };

const NotiProvider = ({ children }) => {

  const [friends, setFriends] = useState([]);
  const { user } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [check, setCheck] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const api= useAxios();

	const { sendMessage, lastMessage } = useWebSocket(`${NotifWsURL}?t=${user.access}`, {
    onOpen: () =>{
		sendMessage(JSON.stringify({ user_status: "Online" }))
	}});

  useEffect(() => {
    if (lastMessage) {
    
      let data = JSON.parse(lastMessage.data);
      
      if (data.data.type === "FRIEND_REQUEST_CREATE") {
        setFriends([...friends, data.data]);
        toast({
          title: data?.title,
          description: "Friend request received!",
          duration: 3000,
          position: "top-right",
        });
      }
      if (data.data.type === "FRIEND_DEL") {
        setFriends(
          friends.filter((friend) => {
            return friend.id !== data.data.id;
          })
        );
      }
      if (data.data.type === 'FRIEND_ADD') {

        setFriends((prev) => prev.map((n) => {
          if (n.id === data.data.id) n.status = 'accepted'
          return n
      }));
      }
      if (data.data.type === 'FRIEND_UPDATE'){
        const id = data.data.id;
        setFriends((prev) => prev.map((n) => {
          if (n.friend.id === id){
            n.friend = data.data.user;
          }
          return n;
        }));

      }
      if (data.data.type === "GAME_INVITE") {
          toast({
            title: data?.title,
            description: "Game invite received!",
            duration: 15000,
            position: "top-right",
            render: () => <GameInviteHandler data={data} />,
          });
        }
        if (data.data.type == "GAME_ACCEPTED"){
          router.push(`/game/pingpong/multiplayer?room_name=${data.data.data.room_name}`)
        }
         if (data?.data.type === "TR") {
          const toStart = data.data?.status === "start";
          toast({
            autoClose: toStart ? 15000 : 3000,
            position: "top-right",
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            render:() => <TournamentHandler data={data.data} />,
          }       
      );
    }
    }
  }, [lastMessage]);


  const fetchFriends = async () => {
    try {
      const response = await api.get("friends/");
      setFriends(response.data);
    } catch(error) {
      console.log(error);
    }
  };

  const fetchBans = async () => {
    try {
      const response = await api.get("ban/");
      setBlocks(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchBans();
  }, []);

  return (
    <notiContext.Provider
      value={{
        friends,
        setFriends,
        check,
        setCheck,
        blocks,
        setBlocks,
        lastMessage
      }}
    >
      {children}
    </notiContext.Provider>
  );
};

export { NotiProvider, useNoti };
