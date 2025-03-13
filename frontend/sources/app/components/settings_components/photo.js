"use client";
import "../../app_css/settings.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import {  useAuth } from "@/app/contexts/authContext";
import { useAxios } from "@/public/AxiosInstance";


export default function Photo() {

  const [imgName, setImage] = useState();
  const { user, setUser } = useAuth();
  const api= useAxios();

  const handleImageChange = (event) => {
    // const file = event;
    setImage(event.target.files[0]);
    let Form = new FormData();
    Form.append("avatar", event.target.files[0]);
    api
      .put(`auth/change-avatar/`, Form, {
        headers: {"Content-Type" : "multipart/form-data"}
      })
      .then((res) => {
        let newUser = res.data;
        newUser.access = user.access;
        setUser(newUser);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleImageClick = () => {
    let file = document.querySelector(".file");
    file.click();
  };
  return (
    <div className="flex flex-col gap-[25px]">
      <input type="file" onChange={handleImageChange} className="file hidden" />
      <div className="image">
        {imgName == undefined ? (
          <Avatar className="w-[277px] h-[277px] avs">
            <AvatarImage
              src={`${user.avatar}`}
              alt="@shadcn"
              className="object-cover"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="w-[277px] h-[277px]">
            <AvatarImage
              src={URL.createObjectURL(imgName)}
              alt="@shadcn"
              className="object-cover"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex gap-[25px]">
        <Link
          href="#"
          onClick={handleImageClick}
          className="flex text-white bg-[#2C74B3] pt-[7px] pb-[7px] pl-[11px] pr-[11px] rounded items-center gap-[11px]"
        >
          <Image
            width={35}
            height={35}
            alt="image"
            src="/simo/2-edit profile/image-gallery 1.png"
            loading="lazy"

          ></Image>
          Change
        </Link>
        <Link
          href="#"
          className="flex text-white items-center border-[1px] rounded  pt-[7px] pb-[7px] pl-[11px] pr-[11px]"
          onClick={() => {
            api
              .delete("auth/change-avatar/")
              .then((res) => {
              })
              .catch((error) => {
                console.log(error);
              });
          }}
        >
          <Image
            width={35}
            height={35}
            alt="image"
            src="/simo/2-edit profile/recycle-bin 1.png"
            loading="lazy"

          ></Image>
          Remove
        </Link>
      </div>
    </div>
  );
}
