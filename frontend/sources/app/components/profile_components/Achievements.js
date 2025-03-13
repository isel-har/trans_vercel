import Image from "next/image"

export default function Achievements(){
     let images = ["/other/acheiv/1.png", "/other/acheiv/2.png", "/other/acheiv/3.png", "/other/acheiv/4.png", "/other/acheiv/4-1.png", "/other/acheiv/5.png","/other/acheiv/6.png", "/other/acheiv/7.png", "/other/acheiv/9.png", "/other/acheiv/10.png"]
    return(
         <div className="Achievements pDivs pl-[55px] pr-[55px]">
             <h1 className="text-white text-[25px] text-center mb-[25px]">Achievements</h1>
               <div className="achiImages flex">
                    {
                    
                         images.map((e, key) => (
                            <Image src={e} key={key} width={81} height={81} className="w-[81px]" loading="lazy" alt={`${e}`}></Image>
                         ))
                    }
               </div>
         </div>
    ) 
 }