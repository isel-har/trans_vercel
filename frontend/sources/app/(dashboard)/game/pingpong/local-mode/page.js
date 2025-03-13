"use client";

import { useState } from "react";
import Pong_local from "../../../../components/local_components/ponglocal";
import BoardSelector from "../../../../components/local_components/Boardselector";
import "../../../../app_css/localbot.css";

export default function Home() {
  const [selectedBoard, setSelectedBoard] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleBoardChange = (boardNumber) => {
    setSelectedBoard(boardNumber);
  };

  const startGame = () => {
    setGameStarted(true);
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
          <>
            <Pong_local selectedBoard={selectedBoard} />
            <div id="score" className="score"></div>
          </>
        )}
      </div>
    </div>
  );
}
