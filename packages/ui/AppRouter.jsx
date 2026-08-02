import { Routes, Route } from "react-router-dom";

import Home from "@drewhyatt/ui/pages/Home.jsx";
import Minigames from "@drewhyatt/ui/pages/minigames.jsx";

import MemoryGame from "@drewhyatt/minigames/Memory/Memory.jsx";
import TicTacToe from "@drewhyatt/minigames/TicTacToe/TicTacToe.jsx";
import Blocks from "@drewhyatt/minigames/Blocks/blocks.jsx";
import Landing from "@drewhyatt/ui/pages/Landing.jsx";

export default function AppRouter({ registerBlockPuzzleCallbacks }) {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
{/*}      <Route path="/" element={<Home />} /> */}
      <Route path="minigames" element={<Minigames />} />

      {/* Minigames */}
      <Route path="minigames/memory" element={<MemoryGame />} />
      <Route path="minigames/tictactoe" element={<TicTacToe />} />
      <Route
        path="minigames/blocks"
        element={
          <Blocks registerBlockPuzzleCallbacks={registerBlockPuzzleCallbacks} />
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
