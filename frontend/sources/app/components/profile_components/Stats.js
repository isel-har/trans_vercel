import Link from "next/link"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
// import Achievements from "./Achievements";


export default function Stats({userData}){
     let percentage = 45;
     let ren;
     if (userData){
               ren =  <div className="text-center absolute top-[50%] gap-[15px] translate-y-[-50%] left-[50%] translate-x-[-50%]">
               <p className="text-white mb-[15px] text-[23px]">No data to show</p>
               <Link
                    href="/"
                    className="bg-[#2C74B3] text-white  cursor-pointer items-center h-[35px] pl-[15px] pr-[15px] pt-[7px] pb-[7px] rounded"
               >
                    PLAY
               </Link>
               </div>
               ren =  <><div className="flex flex-col gap-[25px] rounded pl-[11px] pr-[11px] pt-[25px] pb-[25px] text-[#C2C4C6] text-[22px] mt-[25px] relative left-[50%] translate-x-[-50%] w-[85%] bg-[#131A25]">
               <div className="titles  text-[#C2C4C6] text-[22px] flex gap-[25px]  ">
                    <h1>Matches</h1>
                    <h1 className="absolute left-[50%] translate-x-[-40%]">Losses</h1>
                    <h1 className="absolute right-[28px] ">Wins</h1>
               </div>
               <div className="text-white text-[25px] flex gap-[25px]">
                    <h1>{userData?.score.games}</h1>
                    <h1 className="absolute left-[50%]">{userData?.score.losses}</h1>
                    <h1 className="absolute right-[31px]">{userData?.score.wins}</h1>
                                             
               </div>
          </div>
          <div>
               <CircularProgressbar className="w-[50%] mt-[15px] h-[170px] relative left-[50%] translate-x-[-50%]" value={userData?.score.win_ratio} text={`${userData?.score.win_ratio}%`} />

          </div>
          </>

     }
    return(
         <div className="Stats pDivs relative pb-[15px]">
             <h1 className="text-white text-[25px] text-center pt-[35px]">Stats</h1>
              {ren}
              
         </div>
    ) 
 }