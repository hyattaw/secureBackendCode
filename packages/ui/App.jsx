import { HashRouter } from "react-router-dom";
import { useState } from "react";
import AppHeader from "@drewhyatt/ui/components/AppHeader/AppHeader.jsx";
import AppRouter from "@drewhyatt/ui/AppRouter.jsx";
import "@drewhyatt/ui/styles/style.css";

export default function App() {
  const [registerBlockPuzzleCallbacks, setRegisterBlockPuzzleCallbacks] =
    useState(null);

  // FIX: wrap the setter in a stable callback
  function handleRegisterBlockPuzzleCallbacks(fn) {
    setRegisterBlockPuzzleCallbacks(() => fn);
  }

  return (
    <HashRouter>
      <div className="app-container">
        <AppHeader
          registerBlockPuzzleCallbacks={handleRegisterBlockPuzzleCallbacks}
        />
        <main className="app-main">
          <AppRouter
            registerBlockPuzzleCallbacks={registerBlockPuzzleCallbacks}
          />
        </main>
      </div>
    </HashRouter>
  );
}
