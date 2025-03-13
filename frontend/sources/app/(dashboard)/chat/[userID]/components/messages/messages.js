"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import { useState } from "react";
import UserStatus from "@/app/components/global/usersstatus";
import { useRouter } from "next/navigation";
import { MdBlock } from "react-icons/md";
import { useToast } from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import useWebSocket from "react-use-websocket";
import { ChatWsURL } from "@/public/urls";
import "../../../../../app_css/chat.css";
import { useNoti } from "@/app/contexts/notiContext";
import { useAuth } from "@/app/contexts/authContext";
import { useAxios } from "@/public/AxiosInstance";
// import { BlockURL } from "@/public/urls";


export default function Messages({ userID }) {

	const [message, setMessage] = useState([]);;
	const messageRef = useRef(null);
	const router = useRouter();
	const toast = useToast();
	const { user } = useAuth();
  	const api = useAxios();
  // const api= useAxios();

  	const { friends, setFriends, setBlocks } = useNoti();

  	const { sendMessage, lastMessage } = useWebSocket(`${ChatWsURL}?t=${user.access}`);

  	useEffect(() => {
    	if (lastMessage) {
			let data = JSON.parse(lastMessage.data);
			let finalData = data.data;
			if (finalData.source == userID || finalData.dest == userID) {
				setMessage([...message, finalData]);
			}
		}
	}, [lastMessage]);

  	useEffect(() => {
		if (messageRef.current) {
		messageRef.current.scrollTop = messageRef.current.scrollHeight;
		}
		messageRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [message]);

	const handleBlock = async (action, username, userID) => {
		try {
			const response = await api(`ban/${userID}/`, {
				method: action,
			});
			setBlocks((prev) => [ ...prev, response.data]);
			setFriends((prev) => prev.filter((n) => {
				return n.friend.id !== userID;
			}
			
			));
			toast({
				title: "Block Request",
				description: `${username} was blocked`,
				status: "success",
				duration: 9000,
				isClosable: true,
				position: "top-right",
			  });
			  setTimeout(() => {
				router.push("/chat");
			  }, 1000);
			
		} catch (err) {
			console.error(err);
		}
	};

	const getMessages = async () => {
		try {
			const response = await api.get(`chat/${userID}`);
			setMessage(response.data);
			return true;
		} catch {
			console.log("error");
		}
		return false
	};
	useEffect(() => {
		getMessages();
	}, []);

  	return friends
    .filter((friend) => {
      return friend.friend.id == userID;
    })
    .map((friend) => {
      return (
        <>
          <div className="convo_title w-[100%] h-[75px] bg-[#13171C] flex items-center pl-[25px] pr-[25px] gap-[11px] justify-between">
            <div className="flex items-center gap-[15px]">
              <div className="relative">
                <Avatar
                  className="w-[55px] h-[55px] av_chat"
                  onClick={() => {
                    router.push(`/profile/${user}`);
                  }}
                >
                  <AvatarImage src={friend.friend.avatar} alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <UserStatus friend={friend}></UserStatus>
              </div>
              <div className="text-white">
                <h1 className="text-[21px] font-semibold user_chat">
                  {friend.friend.username}
                </h1>
              </div>
            </div>
            <div className="text-white flex items-center gap-[15px]">
              <MdBlock
                className="text-white text-[25px] cursor-pointer"
                onClick={() => handleBlock('POST', friend.friend.username, friend.friend.id) } />
              <span
                onClick={() => {
                  sendMessage(
                    JSON.stringify({
                      type: 2,
                      dest: friend.friend.id,
                      message: "",
                      is_typing: null,
                    })
                  );
                }}
                className="challenge border-[1px] rounded text-white flex cursor-pointer items-center h-[35px] pl-[5px] pr-[5px] rounded"
              >
                Challenge
              </span>
            </div>
          </div>
          <div
            ref={messageRef}
            className="the_msgs w-[100%] h-[700px] pr-[15px] overflow-y-scroll"
          >
            {message.map((me, key) =>{
             return (
                me.source != friend.friend.id ? (
                  <div
                    key={key}
                    className="flex justify-end text-right items-center gap-[15px] hover:bg-[#0D1117] pt-[15px] pl-[15px] pb-[15px] rounded "
                  >
                    <div className="text-white">
                      <p className="text-[11px] opacity-[0.5] acr_msg">
                        {me.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    key={key}
                    className="flex items-center gap-[15px] hover:bg-[#0D1117] pt-[15px] pl-[15px] pb-[15px] rounded "
                  >
                    <div className="text-white">
                      <p className="text-[11px] opacity-[0.5] ac_msg">
                        {me.message}
                      </p>
                    </div>
                  </div>
                )

              )
            }
            )}
          </div>
          <div className="w-[100%] flex justify-center items-center mt-[25px] gap-[15px] absolute bottom-[55px]">
            <div className="input_div  flex justify-between ">
              <input
                type="text"
                placeholder="type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    let input = document.querySelector(".msg_in");
                    if (input.value != "") {
                      sendMessage(
                        JSON.stringify({
                          dest: friend.friend.id,
                          message: input.value,
                          is_typing: null,
                          type: 1,
                        })
                      );
                      input.value = "";
                    }
                  }
                }}
                className="msg_in border-none"
              ></input>
            </div>
            <div
              className="h-[36px] w-[50px]   send bg-[#2C74B3] cursor-pointer flex justify-center items-center text-[20px] text-white"
              onClick={() => {
                let input = document.querySelector(".msg_in");
                if (input.value != "") {
                  sendMessage(
                    JSON.stringify({
                      dest: friend.friend.id,
                      message: input.value,
                      is_typing: null,
                      type: 1,
                    })
                  );
                  input.value = "";
                }
              }}
            >
              <IoSend />
            </div>
          </div>
        </>
      );
    });
}
