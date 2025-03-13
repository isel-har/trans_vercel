import { useToast } from "@chakra-ui/react";
import Link from "next/link";
import { MdPending } from "react-icons/md";
import { useContext, useEffect } from "react";
import { useNoti } from "@/app/contexts/notiContext";
import { useState } from "react";
export default function PendingButton({ uData, setRpending, setRaccepted }) {
  let toast = useToast();
  const {check, setCheck} = useNoti()
  const {friends} = useNoti()
  const [friend, setFriend] = useState({})
  useEffect(() =>{
    let tmp = friends.filter((friend) =>{
      return friend.friend.id === uData.user.id;
    })
    if (tmp.length != 0)
      setFriend(tmp[0])
  }, [friends])
  const removeRequest = async () =>{
    try{
      const response = await fetch(`http://localhost:8000/api/friends/delete/${friend.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (check){
        setCheck(false)
      }
      else{
        setCheck(true)
      }

    }
    catch(error){
      console.log(error)
    }
  }
  return (
    <Link
      href="#"
      className="text-white opacity-[0.3]    rounded"
      onClick={() => {
       removeRequest()
      }}
    >
      <MdPending className="w-[45px] h-[45px]" alt="pending" />
    </Link>
  );
}
