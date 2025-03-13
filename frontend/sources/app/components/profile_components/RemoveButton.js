'use client'
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import Link from "next/link";
import { MdPending } from "react-icons/md";
import { MdPersonAdd } from "react-icons/md";
import { MdPersonAddDisabled } from "react-icons/md";
import { getCookie } from "cookies-next";
import { useContext } from "react";
import { useNoti } from "@/app/contexts/notiContext";
import { useEffect } from "react";

export default function RemoveButton({ uData, setRpending, setRaccepted }) {
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
  return (
    <Link
      href="#"
      className="text-white  cursor-pointer   rounded"
      onClick={() => {
        // ${userData.id}
        fetch(`http://localhost:8000/api/friends/delete/${friend.id}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
          .then((res) => {
            if (check) {
              setCheck(false);
            } else {
              setCheck(true);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }}
    >
      <MdPersonAddDisabled className="w-[45px] h-[45px]" />
    </Link>
  );
}
