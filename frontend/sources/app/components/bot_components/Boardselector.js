"use client"

import { useState } from 'react'

export default function BoardSelector({ onBoardChange }) {
  const [selectedBoard, setSelectedBoard] = useState(0)

  const handleBoardSelect = (boardNumber) => {
    setSelectedBoard(boardNumber)
    onBoardChange(boardNumber)
  }

  return (
    <div className="board-selector  ">
      <h2>Select Board</h2>
      <div className="board-options">
        {[0, 1, 2, 3, 4].map((boardNumber) => (
          <div
            key={boardNumber}
            className={`board-option ${selectedBoard === boardNumber ? 'selected' : ''}`}
            style={{ backgroundImage: `url(/boards/${boardNumber}.png)` }}
            onClick={() => handleBoardSelect(boardNumber)}
          ></div>
        ))}
      </div>
    </div>
  )
}