// import { useToast } from "@chakra-ui/react";
import Link from "next/link";
import { MdPersonAdd } from "react-icons/md";
import { useNoti } from "@/app/contexts/notiContext";
import { useAxios } from "@/public/AxiosInstance";
import { useAuth } from "@/app/contexts/authContext";
// Import

export default function AddButton({ uData, setRpending }) {

//   const toast = useToast();
  const {check, setCheck, setFriends} = useNoti();
  const api= useAxios();

  const friendRequest = async () =>{
   try{
      const response = await api.post(`friends/create/${uData.user.id}/`);
      if (response.status == 201){
        setFriends((prev) => [ ...prev, response.data]);
      if (check)
        setCheck(false);
      else
        setCheck(true);
      }
   }
   catch (error){
    console.log("error => ", error)
   }
  }
  return (
    <Link
      href="#"
      className="text-white  cursor-pointer   rounded"
      onClick={
        friendRequest
        // userData.id
        // fetch(`http://localhost:8000/api/friends/${uData.user.id}/`, {
        //   method: "POST",
        //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        // })
        //   .then((res) => {
        //     if (res.ok == true && res.status == 201) {
        //       if (check.length === 0) {
        //       } else {
        //       }
        //       toast({
        //         title: "Friend Request ",
        //         description: `sent to ${uData.username}`,
        //         status: "success",
        //         duration: 3000,
        //         isClosable: true,
        //         position: "top-right",
        //       });
        //     } else {
        //       toast({
        //         title: "Friend Request ",
        //         description: `already sent`,
        //         status: "info",
        //         duration: 3000,
        //         isClosable: true,
        //         position: "top-right",
        //       });
        //     }
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      }
    >
      <MdPersonAdd className="w-[45px] h-[45px]" />
    </Link>
  );
}
