import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CustomToast from "../CustomToast";
import { useEffect, useState } from "react";
import { useAxios } from "@/public/AxiosInstance";
// import { redirect } from 'next/navigation';

export function GameInviteHandler({ data }) {

  const router = useRouter();
  const game_info = data.data.data;
  const api= useAxios();

  const handleAccept = async () => {
    try {
      await api.put(`game/update?room_id=${game_info.room_name}`);

      // if (!response.stat) {
      //   throw new Error("Failed to accept game invite");
      // }
      router.push(
        `/game/pingpong/multiplayer?room_name=${game_info.room_name}`
      );
    } catch (error) {
      console.error("Error handling game invite:", error);
      toast({
        title: "Error",
        description: "Failed to accept game invite",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDecline = async () => {
    try {
      await api.delete(`game/update?room_id=${game_info.room_name}`);

      // if (!response.ok) {
      //   throw new Error("Failed to decline game invite");
      // }
    } catch (error) {
      console.error("Error declining game invite:", error);
      toast({
        title: "Error",
        description: "Failed to decline game invite",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <CustomToast
      data={data.data.data.inviter}
      info={{
        handleAccept: handleAccept,
        handleDecline: handleDecline,
        reason: "sent you a game invite",
      }}
    />
  );
}

export const TournamentHandler = ({ data }) => {
  const router = useRouter();
  const game_info = data.data;
  const [toStart, setStart] = useState(false);

  useEffect(() => {
    setStart(data?.data?.status === "start")
  }, []);


  const handleAccept = () => {
    //http://localhost:3000/game/pingpong/tournament/tournament_game?id=3/
    router.push(`/game/pingpong/tournament/tournament_game?id=${game_info.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {data.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tournament
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {toStart && (
            <Button 
              variant="default"
              className="
                bg-green-500 
                text-white 
                hover:bg-green-600 
                focus:ring-2 
                focus:ring-green-300 
                dark:bg-green-600 
                dark:hover:bg-green-700 
                dark:focus:ring-green-800
                transition-colors 
                duration-200 
                ease-in-out 
                py-2 
                px-4 
                rounded-md 
                text-sm 
                font-medium
              "
              onClick={handleAccept}
            >
              Play now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
