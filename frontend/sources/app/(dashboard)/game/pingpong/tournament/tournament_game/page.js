"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TournamentGame from "../../../../../components/multi_components/pong_tn";
import BoardSelector from "../../../../../components/multi_components/Boardselector";
import "../../../../../app_css/multi.css";
import { useRouter } from "next/navigation";

export default function TournamentGamePage() {

  const [selectedBoard, setSelectedBoard] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [back, setBack]   = useState(false);
  const router  = useRouter();

  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("id");

  useEffect(() => {
    if (tournamentId) {
      console.log("Tournament ID:", tournamentId);
    } else {
      setError("No tournament ID provided");
    }
  }, [tournamentId]);

  const handleBoardChange = (boardNumber) => {
    console.log("Board selected:", boardNumber);
    setSelectedBoard(boardNumber);
  };

  const startGame = async () => {
    if (!tournamentId) {
      setError("No tournament ID available");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // You might want to make an API call here to verify the tournament
      // and perhaps get any additional information needed
      setGameStarted(true);
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Failed to start the game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameEnd = (isWinner) => {
    console.log("Game ended. Winner:", isWinner);
    setGameStarted(false);
    setBack(true) ;
    setTimeout(()=> {
      router.push('/game');
    }, 2000);
    
    // to use
    // add another state for button to back
    // setSelectedBoard(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Tournament Game</h1>
      <div
        id="Game"
        className="flex items-center flex-col justify-center min-h-[50vh]">

        {!gameStarted && !back ? (
          <>
            <BoardSelector onBoardChange={handleBoardChange} />
            <button
              onClick={startGame}
              disabled={isLoading || !tournamentId}
              className={`mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                isLoading || !tournamentId
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? "Starting..." : "Play"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </>
        ) : (
          <TournamentGame
            selectedBoard={0}
            onGameEnd={handleGameEnd}
            tournamentId={tournamentId}
          />
        )}
      </div>
    </div>
  );
}
