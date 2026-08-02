export default function BlockPuzzleHelp({ onClose }) {
  return (
    <div className="spt-bp-overlay">
      <div className="spt-bp-modal help-modal">
        <h3>How to Play</h3>

        <ul>
          <li>Drag shapes from the tray onto the board.</li>
          <li>Fill an entire row or column to clear it.</li>
          <li>Earn points for placing blocks and clearing lines.</li>
          <li>The game ends when no available shapes can be placed.</li>
        </ul>

        <h3>Scoring</h3>
        <ul>
          <li>1 point per block placed</li>
          <li>Combo: cleared blocks × number of lines cleared</li>
        </ul>

        <button className="spt-bp-btn-primary" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}
