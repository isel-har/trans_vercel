import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"

export default function RowTwo({leaderboard}){
    return (
        <div className="rowTwo h-[100%] w-[30%]">
            <h1 className="text-white text-[30px] font-bold mt-[25px] text-center">Top 3 Players</h1>
            <div className="other_card pt-[15px] pl-[15px] pr-[15px] pb-[25px] relative left-[50%] translate-x-[-50%] top-[75px]">
                <h1 className="text-white text-[25px] font-bold">#1</h1>
                <div className="flex flex-col items-center">
                    <Avatar className="w-[185px] h-[185px]">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <h1 className="text-[30px] font-bold text-white">Houadou</h1>
                </div>
            </div>
            <div className="flex mt-[105px] justify-center gap-[25px]">
                <div className="other_card other_cards pt-[15px] pl-[15px] w-[100px] pr-[15px] pb-[25px]">
                    <h1 className="text-white text-[25px] font-bold">#2</h1>
                    <div className="flex flex-col items-center">
                        <Avatar className="w-[100px] h-[100px]">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h1 className="text-[25px] font-bold text-white mt-[15px]">Houadou</h1>
                    </div>
                </div>
                <div className="other_card other_cards w-[100px] pt-[15px] pl-[15px] pr-[15px] pb-[25px] top-[75px]">
                    <h1 className="text-white text-[25px] font-bold">#3</h1>
                    <div className="flex flex-col items-center">
                        <Avatar className="w-[90px] h-[90px]">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h1 className="text-[25px] font-bold text-white mt-[15px]">Houadou</h1>
                    </div>
                </div>

            </div>
        </div>
    )
}