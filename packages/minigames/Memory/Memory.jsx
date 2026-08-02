import { useState, useEffect } from "react";
import "./memory.css";

const EMOJIS = ["🐶","🐱","🐸","🐵","🐼","🐧","🐤","🦊","🐙","🐝","🦄","🐢"];

function generateCards(size) {
  const total = size * size;
  const needed = total / 2;

  const selected = EMOJIS.slice(0, needed);
  const pairs = [...selected, ...selected];

  // Shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs.map((emoji, index) => ({
    id: index,
    emoji,
    flipped: false,
    matched: false
  }));
}

export default function MemoryGame() {
  const [size, setSize] = useState(4); // 4x4 default
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  // Initialize game
  useEffect(() => {
    resetGame(size);
  }, [size]);

  function resetGame(newSize) {
    setCards(generateCards(newSize));
    setFlipped([]);
    setMoves(0);
    setWon(false);
  }

  function handleCardClick(card) {
    if (card.flipped || card.matched || flipped.length === 2) return;

    const updated = cards.map(c =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    const newFlipped = [...flipped, card.id];

    setCards(updated);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkMatch(newFlipped, updated);
    }
  }

  function checkMatch([a, b], updatedCards) {
    const cardA = updatedCards.find(c => c.id === a);
    const cardB = updatedCards.find(c => c.id === b);

    if (cardA.emoji === cardB.emoji) {
      // Match
      const newCards = updatedCards.map(c =>
        c.id === a || c.id === b ? { ...c, matched: true } : c
      );
      setCards(newCards);
      setFlipped([]);

      // Check win
      if (newCards.every(c => c.matched)) {
        setTimeout(() => setWon(true), 300);
      }
    } else {
      // No match — flip back
      setTimeout(() => {
        const newCards = updatedCards.map(c =>
          c.id === a || c.id === b ? { ...c, flipped: false } : c
        );
        setCards(newCards);
        setFlipped([]);
      }, 800);
    }
  }

  return (
    <div id="memory">
      <h2>Memory Game</h2>

      <div className="difficulty">
        <label>Difficulty:</label>
        <select value={size} onChange={e => setSize(Number(e.target.value))}>
          <option value={4}>Easy (4×4)</option>
          <option value={5}>Medium (5×5)</option>
          <option value={6}>Hard (6×6)</option>
        </select>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {cards.map(card => (
          <div
            key={card.id}
            className={
              "card" +
              (card.flipped ? " flipped" : "") +
              (card.matched ? " matched" : "")
            }
            onClick={() => handleCardClick(card)}
          >
            <div className="front"></div>
            <div className="back">{card.emoji}</div>
          </div>
        ))}
      </div>

      <div className="status">Moves: {moves}</div>

      {won && (
        <div id="win-screen" className="visible">
          <div className="win-box">
            <h2>You Win!</h2>
            <p className="win-stats">Moves: {moves}</p>
            <button onClick={() => resetGame(size)}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
