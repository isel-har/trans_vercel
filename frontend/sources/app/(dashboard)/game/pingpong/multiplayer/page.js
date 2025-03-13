"use client";

import { useState } from "react";
import Pong_multi from "../../../../components/multi_components/pongmulti";
import BoardSelector from "../../../../components/multi_components/Boardselector";
import "../../../../app_css/multi.css";

export default function GamePage() {
  const [selectedBoard, setSelectedBoard] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleBoardChange = (boardNumber) => {
    setSelectedBoard(boardNumber);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const handleGameReset = () => {
    setGameStarted(false);
    setSelectedBoard(0);
  };

  return (
    <div>
      <div
        id="Game"
        className="flex items-center  flex-col justify-center h-[50vh]"
      >
        {!gameStarted ? (
          <>
            <BoardSelector onBoardChange={handleBoardChange} />
            <button
              onClick={startGame}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Play
            </button>
          </>
        ) : (
          <Pong_multi
            selectedBoard={selectedBoard}
            onGameReset={handleGameReset}
          />
        )}
      </div>
    </div>
  );
}
