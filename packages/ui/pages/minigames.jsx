import NavCard from "../components/NavCard/NavCard.jsx";

export default function Minigames() {
  return (
    <div id="minigames">
      <h1>Minigames</h1>

      <div className="nav-grid">
        <NavCard
          title="Memory"
          description="Flip cards and test your recall."
          to="/minigames/memory"
        />

        <NavCard
          title="Tic‑Tac‑Toe"
          description="Classic X vs O strategy game."
          to="/minigames/tictactoe"
        />
        <NavCard
          title="Blocks"
          description="Arrange blocks in a row."
          to="/minigames/blocks"
        />
      </div>
    </div>
  );
}
