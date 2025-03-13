import React, { useEffect, useState } from "react";
// import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAxios } from "@/public/AxiosInstance";
// import { getCookie } from "cookies-next";
// import { useContext } from "react";


const Challenge = ({ show, data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const api = useAxios();
  // const api = useAxios();
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="friend_request flex absolute pt-[15px] pb-[15px] pl-[15px] pr-[15px] gap-[11px] items-center rounded  z-[155]  left-[50%] translate-x-[-50%] transition-[0.3s]">
      <Avatar className="w-[50px] h-[50px] ava">
        <AvatarImage
          src={`${data.data.avatar}`}
          alt="@shadcn"
          className="object-cover"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <h1 className="text-white">
        <b className="t">{data.data.username}</b> sent you a friend request
      </h1>
      <div className="flex gap-[5px] flex-col">
        <button
          className="bg-[#131a25] text-white pt-[5px] pr-[11px] pl-[11px] pb-[5px] rounded"
          onClick={() => {
            api.put(`${data.accept_url.url}`)
              .then((res) => {})
              .catch((error) => {
                console.log(error);
              });
            let noti = document.querySelector(".friend_request");
            noti.style.top = "-150px";
          }}
        >
          Accept
        </button>
        {/* <button className="bg-[#FF0000] text-white pt-[5px] pr-[10px] pl-[10px] pb-[5px] rounded" onClick={() =>{
         fetch(`http://localhost:8000/api/friends/${data.data.uid}/`, { // replace with userData.id 
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        }).then((res) =>{
         }).catch((error) =>{console.log(error)})
        //   let noti = document.querySelector('.friend_request')
        //    noti.style.top = "-150px"
        }}>Decline</button> */}
      </div>
    </div>
  );
};

export default Challenge;
