import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useAxios } from "@/public/AxiosInstance";
// {
//   "winner": {
//       "username": "brahmos1",
//       "avatar": "http://localhost:8000/media/9_avatar.png",
//       "id": 9
//   },
//   "loser": {
//       "username": "UpperMoon2",
//       "avatar": "http://localhost:8000/media/6_avatar.jpeg",
//       "id": 6
//   },
//   "start_time": "2024-12-07T22:24:28.820156Z",
//   "game_type": "pong",
//   "score": [
//       2,
//       5
//   ],
//   "opponent": "UpperMoon2",
//   "opponent_avatar": "http://localhost:8000/media/6_avatar.jpeg",
//   "result": "Win"
// }
export default function History({ id }) {

  const [history, setHistory ] = useState([]);
  const api= useAxios();

  const fetchHistory = async () => {
    try {
      const response = await api.get(`game/history?dest=${id}`);
      setHistory(response.data);

    } catch (error) {
      console.log("error on fetch history :" , error);
    }
  }

  useEffect(() => {
	  fetchHistory();
  }, [id]);
  
  let ren;
  if (history.length == 0) {
    ren = (
      <div className="text-center absolute top-[50%] gap-[15px] translate-y-[-50%] left-[50%] translate-x-[-50%]">
        <p className="text-white mb-[15px] text-[23px]">
          No recents matches to show
        </p>
        <Link
          href="/"
          className="bg-[#2C74B3] text-white  cursor-pointer items-center h-[35px] pl-[15px] pr-[15px] pt-[7px] pb-[7px] rounded"
        >
          PLAY
        </Link>
      </div>
    );
  } else {
    ren = (
      <div className="bg-[#131A25] relative  w-[80%] h-[488px] left-[50%] translate-x-[-50%] mt-[25px] pt-[25px] pl-[15px] pr-[15px] pb-[25px] his rounded height-[400px] overflow-y-scroll">
        <div className="titles text-[#C2C4C6]  pl-[25px] flex justify-between   ">
          <h1 className="text-[23px]">Players</h1>
          <h1 className="text-[23px]">Result</h1>
          <h1 className="text-[23px]">Score</h1>
        </div>
        <div className="flex flex-col mt-[25px] gap-[25px] rounded his">
          {history.map((his, key) => (
            <div
              className="flex gap-[0px] items-center hover:bg-[#222831] pt-[7px] pb-[7px] pl-[7px] pr-[7px] rounded transition-[0.3s]"
              key={key}
            >
              <div className="flex items-center gap-[7px]">
                <Avatar className="w-[70px] h-[40px] ava">
                  <AvatarImage src={his.opponent_avatar} alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p className="text-white">{his.opponent}</p>
              </div>
              <div className="mr-[23px] absolute left-[50%]">
                <h1 className={`win text-[18px] ${his.result}`}>
                  {his.result}
                </h1>
              </div>
              <div className="absolute right-[25px]">
                <h1 className="scores text-[#5E7396] text-[18px]">
                  {his.score[0]} - {his.score[1]}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="History pDivs relative">
      <h1 className="text-white text-[25px] text-center pt-[35px]">History</h1>
      {ren}
    </div>
  );
}
