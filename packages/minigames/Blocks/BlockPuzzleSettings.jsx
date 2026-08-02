import SoundToggleIcon from "@drewhyatt/ui/components/soundToggle.jsx";

export default function BlockPuzzleSettings({
  onClose,
  resetGame,
  muted,
  setMuted,
  openHelp,
}) {
  return (
    <div className="spt-bp-overlay">
      <div className="spt-bp-modal settings-modal">
        <h3>Settings</h3>

        <button className="spt-bp-btn-primary" onClick={resetGame}>
          Start Over
        </button>

        <button
          className="spt-bp-btn-secondary"
          onClick={() => {
            openHelp();
            onClose();
          }}
        >
          How to Play
        </button>

        <div className="spt-bp-setting-group">
          <SoundToggleIcon
            muted={muted}
            onToggle={() => setMuted(!muted)}
          />
        </div>

        <button className="spt-bp-btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
