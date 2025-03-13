"use client";

import Image from "next/image";
import "../app_css/home.css";
import "../app_css/global.css";
import "../app_css/hena.css";
import Bronze from "../../public/other/acheiv/2.png";
import Iron from "../../public/other/acheiv/3.png";
import Gold from "../../public/other/acheiv/4.png";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/authContext";
import { useState, useEffect } from "react";
import { useAxios } from "@/public/AxiosInstance";


export default function Home() {

  const router = useRouter();
  const { user } = useAuth();
  const [score , setScore] = useState({});
  const [loading, setLoading] = useState(true);
  const api = useAxios();

  const fetchScore = async () => {
    try {
      const response = await  api.get(`score/?query=${user.id}`);
      setScore(response.data);
    }catch(err) { console.log(err)}
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchScore();
  }, []);


  return ( !loading &&
    <>
      <main>
        {user && (
          <h1 className="welcome">Welcome back, {user.username} !</h1>
        )}
        <div className="options">
          <div
            className="w-[130px] h-[130px] op op_one bg-white ops"
            onClick={() => {
              router.push("/game");
            }}
          ></div>
          {/* <div
            className="w-[130px] h-[130px] op op_two bg-[#19354E] ops"
            onClick={() => {
              router.push("/leaderboard");
            }}
          ></div> */}
          <div
            className="w-[130px] h-[130px] op op_three bg-[#222831] ops"
            onClick={() => {
              router.push("/chat");
            }}
          ></div>
          <div
            className="w-[130px] h-[130px] op_four bg-[#0D1117] op ops"
            onClick={() => {
              router.push("/settings");
            }}
          ></div>
        </div>
        <div className="showProfile">
          <div className="achivements flex justify-center gap-[25px]">
            <Image
              className=""
              width={0}
              height={0}
              size="100vh"
              src={Bronze}
              alt="achi"
              loading="lazy"
            ></Image>
            <Image
              className=""
              width={0}
              height={0}
              size="100vh"
              src={Iron}
              alt="achi"
              loading="lazy"
            ></Image>
            <Image
              className=""
              width={0}
              height={0}
              size="100vh"
              alt="achi"
              src={Gold}
              loading="lazy"
            ></Image>
          </div>
          {user && (
            <div className="flex items-center flex-col">
              <Avatar className="w-[200px] h-[200px] ">
                <AvatarImage
                  src={user.avatar}
                  alt="@shadcn"
                  className="object-cover w-[100%] h-[100%]"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h3 className="text-white text-center mt-[15px]">
                {user.username}
              </h3>
            </div>
          )}

          {user && (
            <div className="stats flex justify-center gap-[25px] mt-[25px] z-[-1]">
              <div className="games text-white text-center">
                <h1 className="text-[28px] font-extrabold	">Games</h1>
                <p className="text-[25px] font-light">{score.games}</p>
              </div>
              <div className="wins text-[#13B039] text-center">
                <h1 className="text-[28px] font-extrabold	">Wins</h1>
                <p className="text-[25px] font-light">{score.wins}</p>
              </div>
              <div className="losses text-[#FF006B] text-center">
                <h1 className="text-[28px] font-extrabold	">Losses</h1>
                <p className="text-[25px] font-light">
                  {score.losses}
                </p>
              </div>
            </div>
          )}
        </div>
        <Link
          href="/profile"
          className="sPro text-white text-[21px] font-extrabold bg-[#13171C] absolute bottom-[25px] right-[178px] pt-[15px] pb-[15px] pl-[25px] pr-[25px] rounded hover:bg-[#ffffff] hover:text-black "
        >
          View Profile
        </Link>
      </main>
    </>
  );
}
