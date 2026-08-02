import { useState } from "react";
import "./tictactoe.css";

const WIN_PATTERNS = [
  [0,1,2], [3,4,5], [6,7,8],     // rows
  [0,3,6], [1,4,7], [2,5,8],     // columns
  [0,4,8], [2,4,6]               // diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);

  function handleClick(index) {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
    } else {
      setTurn(turn === "X" ? "O" : "X");
    }
  }

  function checkWinner(b) {
    for (const [a, bIdx, c] of WIN_PATTERNS) {
      if (b[a] && b[a] === b[bIdx] && b[bIdx] === b[c]) {
        return b[a];
      }
    }
    return b.every(cell => cell) ? "tie" : null;
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinner(null);
  }

  return (
    <div id="tictactoe">
      <h2>Tic‑Tac‑Toe</h2>

      <div className="status">
        {winner === "tie" && "It's a tie!"}
        {winner && winner !== "tie" && `${winner} wins!`}
        {!winner && `${turn}'s turn`}
      </div>

      <div className="board">
        {board.map((cell, i) => (
          <button
            key={i}
            className="cell"
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>

      <button className="reset" onClick={reset}>
        Restart
      </button>
    </div>
  );
}
