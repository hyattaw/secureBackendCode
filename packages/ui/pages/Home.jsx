import NavCard from "@drewhyatt/ui/components/NavCard/NavCard.jsx";

export default function Home() {
  return (
    <div id="home">
      <h1>Welcome</h1>
      <p className="subtitle">
        Choose an activity to get started.
      </p>

      <div className="nav-grid">
        <NavCard
          title="Minigames"
          description="Play Memory, Tic‑Tac‑Toe, and more."
          to="/minigames"
        />


        <NavCard
          title="About"
          description="Learn more about this app."
          to="/about"
        />
      </div>
    </div>
  );
}
