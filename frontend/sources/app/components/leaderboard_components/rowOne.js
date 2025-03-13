import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useState from "react";

export default function RowOne({ leaderboard }) {
  let results = [
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
    { name: "simo" },
  ];
  return (
    <div className="rowOne h-[100%] w-[70%] text-white relative flex gap-[75px] pt-[25px]">
      <div className="profile_card bg-[#13171C] w-[300px] h-[600px] relative top-[-55px] left-[55px] rounded">
        <h1 className="text-[30px] font-bold pt-[15px] pb-[15px] pl-[10px] pr-[10px]">
          #1
        </h1>
        <div className="w-[100%] text-center flex flex-col items-center gap-[25px]">
          <Avatar className="w-[255px] h-[255px]">
            <AvatarImage src={leaderboard[0].avatar} alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="text-[35px] font-bold">{leaderboard[0].username}</h1>
        </div>
        <div className="w-[85%] flex flex-col gap-[35px] relative left-[50%] translate-x-[-50%] mt-[75px] ">
          <div className="flex  relative w-[100%] ">
            {/* <h1 className="absolute left-[11px] text-[20px] font-bold">Games</h1> */}
            <h1 className="absolute left-[50%] translate-x-[-50%] text-[20px] font-bold text-[#13B039]">
              Wins
            </h1>
            {/* <h1 className="absolute right-[11px] text-[20px] font-bold text-[#FF006B]">Losses</h1> */}
          </div>
          <div className="flex gap-[25px] relative">
            {/* <h1 className="absolute left-[11px] text-[17px] left-[30px]">42</h1> */}
            <h1 className="absolute left-[50%] translate-x-[-50%] text-[17px] text-[#13B039]">
              {leaderboard[0].score.wins}
            </h1>
            {/* <h1 className="absolute right-[31px] text-[17px] text-[#FF006B]">42</h1> */}
          </div>
        </div>
      </div>
      <div className="results w-[65%] h-[100%]  gap-[25px] flex flex-col">
        <div className="flex title">
          <h1>Rank</h1>
          <h1>Username</h1>
          <h1>XP</h1>
          <h1>Wins</h1>
          <h1>Level</h1>
        </div>
        <div className="w-[100%] bg-[#13171C] h-[85%] rounded pt-[15px] pl-[15px] pr-[15px] flex flex-col gap-[25px] overflow-y-scroll">
          {leaderboard.map((e, key) => (
            <div className="res flex w-[100%] justify-center gap-[122px] bg-[#202C3B] pt-[11px] pb-[11px] rounded">
              <h1 className="font-bold">{key}</h1>
              <h1 className="font-bold">{e.username}</h1>
              <h1 className="text-[#2C74B3] font-bold">{e.score.total_xp}</h1>
              <h1 className="text-[#13B039] font-bold">{e.score.wins}</h1>
              <h1 className="text-[#FF006B] font-bold">{e.score.level}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
