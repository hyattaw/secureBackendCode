import { useState, useEffect, useRef } from "react";
import BlockPuzzleHelp from "./BlockPuzzleHelp.jsx";
import BlockPuzzleSettings from "./BlockPuzzleSettings.jsx";

import "./blocks.css";

/* ---------------- SHAPES ---------------- */

const SHAPES = [
  { name: "single", blocks: [[0, 0]] },

  {
    name: "twoVertical",
    blocks: [
      [0, 0],
      [1, 0],
    ],
  },
  {
    name: "threeVertical",
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
  },
  {
    name: "fourVertical",
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
  },
  {
    name: "fiveVertical",
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
  },

  {
    name: "square2x2",
    blocks: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },

  {
    name: "rect2x4",
    blocks: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
  },

  {
    name: "square3x3",
    blocks: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  },

  {
    name: "shortL",
    blocks: [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
  },

  {
    name: "wideL",
    blocks: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [2, 0],
    ],
  },

  {
    name: "Lshape",
    blocks: [
      [0, 0],
      [0, 1],
      [1, 0],
      [2, 0],
    ],
  },

  {
    name: "centerL",
    blocks: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
];

/* ---------------- HELPERS ---------------- */

function rotate(blocks, angle) {
  switch (angle) {
    case 90:
      return blocks.map(([r, c]) => [c, -r]);
    case 180:
      return blocks.map(([r, c]) => [-r, -c]);
    case 270:
      return blocks.map(([r, c]) => [-c, r]);
    default:
      return blocks;
  }
}

function normalize(blocks) {
  const minR = Math.min(...blocks.map((b) => b[0]));
  const minC = Math.min(...blocks.map((b) => b[1]));
  return blocks.map(([r, c]) => [r - minR, c - minC]);
}

function getRandomShape() {
  const base = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const angle = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
  const rotated = normalize(rotate(base.blocks, angle));
  return { name: base.name, blocks: rotated };
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function canPlace(board, blocks, startR, startC) {
  for (let [r, c] of blocks) {
    const br = startR + r;
    const bc = startC + c;
    if (br < 0 || br >= 8 || bc < 0 || bc >= 8) return false;
    if (board[br][bc] === 1) return false;
  }
  return true;
}

function placeShape(board, blocks, startR, startC) {
  const newBoard = cloneBoard(board);
  let placedCount = 0;

  for (let [r, c] of blocks) {
    const br = startR + r;
    const bc = startC + c;
    newBoard[br][bc] = 1;
    placedCount++;
  }

  return { newBoard, placedCount };
}

function clearLines(board) {
  const newBoard = cloneBoard(board);
  const rowsToClear = [];
  const colsToClear = [];

  for (let r = 0; r < 8; r++) {
    if (newBoard[r].every((v) => v === 1)) rowsToClear.push(r);
  }

  for (let c = 0; c < 8; c++) {
    let full = true;
    for (let r = 0; r < 8; r++) {
      if (newBoard[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) colsToClear.push(c);
  }

  const blocksToClear = new Set();

  rowsToClear.forEach((r) => {
    for (let c = 0; c < 8; c++) blocksToClear.add(`${r},${c}`);
  });

  colsToClear.forEach((c) => {
    for (let r = 0; r < 8; r++) blocksToClear.add(`${r},${c}`);
  });

  blocksToClear.forEach((coord) => {
    const [r, c] = coord.split(",").map(Number);
    newBoard[r][c] = 0;
  });

  const comboPoints =
    blocksToClear.size * (rowsToClear.length + colsToClear.length);

  return { newBoard, comboPoints };
}

function hasAnyValidMove(board, shapes) {
  for (const shape of shapes) {
    if (!shape) continue;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (canPlace(board, shape.blocks, r, c)) return true;
      }
    }
  }
  return false;
}

/* ---------------- WEBAUDIO SOUND SYNTH (PROMISE-BASED) ---------------- */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playPlaceSound(volume = 1) {
  return new Promise((resolve) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      200,
      audioCtx.currentTime + 0.12,
    );

    gain.gain.setValueAtTime(0.25 * volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);

    osc.onended = resolve;
  });
}

function playClearSound(volume = 1) {
  return new Promise((resolve) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      1200,
      audioCtx.currentTime + 0.25,
    );

    gain.gain.setValueAtTime(0.15 * volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);

    osc.onended = resolve;
  });
}

function playGameOverSound(volume = 1) {
  return new Promise((resolve) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3 * volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);

    osc.onended = resolve;
  });
}

/* ---------------- COMPONENT ---------------- */

export default function Blocks({ registerBlockPuzzleCallbacks }) {
  const [board, setBoard] = useState(
    Array.from({ length: 8 }, () => Array(8).fill(0)),
  );
  const [shapes, setShapes] = useState([null, null, null]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [preview, setPreview] = useState({ cells: [], valid: false });
  const [initialized, setInitialized] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const dragCloneRef = useRef(null);
  const dragShapeRef = useRef(null);
  const dragSlotRef = useRef(null);
  const dragAnchorRef = useRef({ r: 0, c: 0 });

  /* ---------------- BEGIN pass menu items to global header ---------------- */
  function openGameHelp() {
    setHelpOpen(true);
  }

  function openGameSettings() {
    setSettingsOpen(true);
  }

  useEffect(() => {
    if (!registerBlockPuzzleCallbacks) return;

    // Defer registration so AppHeader can install its receiver first
    Promise.resolve().then(() => {
      registerBlockPuzzleCallbacks({
        openSettings: () => setSettingsOpen(true),
        openHelp: () => setHelpOpen(true),
      });
    });
  }, [registerBlockPuzzleCallbacks]);

  /* ---------------- END pass menu items to global header ---------------- */

  useEffect(() => {
    try {
      const stored = localStorage.getItem("blockPuzzleHighScore");
      if (stored) setHighScore(parseInt(stored, 10));
    } catch {}
  }, []);

  function resetGame() {
    setBoard(Array.from({ length: 8 }, () => Array(8).fill(0)));
    setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    setScore(0);
    setGameOver(false);
    setHelpOpen(false);
    setDraggingIndex(null);
    setPreview({ cells: [], valid: false });

    dragCloneRef.current = null;
    dragShapeRef.current = null;
    dragSlotRef.current = null;
    dragAnchorRef.current = { r: 0, c: 0 };

    setInitialized(true);
  }

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    if (!hasAnyValidMove(board, shapes)) {
      setGameOver(true);
      try {
        if (!muted) {
          playGameOverSound(volume);
        }
      } catch {}
    }
  }, [board, shapes, initialized, muted, volume]);

  useEffect(() => {
    try {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("blockPuzzleHighScore", String(score));
      }
    } catch {}
  }, [score, highScore]);

  /* ---------------- DRAG START ---------------- */

  function handleDragStart(e, shape, slotIndex) {
    setDraggingIndex(slotIndex);

    dragShapeRef.current = shape;
    dragSlotRef.current = slotIndex;

    const block = e.target.closest(".filled");
    if (block) {
      //      dragAnchorRef.current = {
      //        r: parseInt(block.dataset.sr),
      //        c: parseInt(block.dataset.sc),
      //      };
      //    } else {
      dragAnchorRef.current = { r: 0, c: 0 };
    }

    const clone = e.currentTarget.cloneNode(true);
    clone.classList.add("spt-bp-drag-clone");

    // Make clone use board-sized blocks (40px)
    const cols = Math.max(...shape.blocks.map((b) => b[1])) + 1;
    clone.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

    // Fix block sizes inside clone
    clone.querySelectorAll(".spt-bp-shape-block").forEach((b) => {
      b.style.width = "40px";
      b.style.height = "40px";
    });

    document.body.appendChild(clone);
    dragCloneRef.current = clone;

    moveClone(e.clientX, e.clientY);

    document.addEventListener("pointermove", handleDragMove);
    document.addEventListener("pointerup", handleDragEnd);
  }

  function moveClone(x, y) {
    const clone = dragCloneRef.current;
    if (!clone) return;

    const offsetX = dragAnchorRef.current.c * 22 + 10;
    const offsetY = dragAnchorRef.current.r * 22 + 10;

    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;
    clone.style.transform = `translate(-${offsetX}px, -${offsetY}px)`;
  }

  function handleDragMove(e) {
    e.preventDefault();
    moveClone(e.clientX, e.clientY);

    const clone = dragCloneRef.current;
    const shape = dragShapeRef.current;
    if (!clone || !shape) return;

    // Get bounding boxes
    const boardEl = document.querySelector(".spt-bp-board");
    const boardRect = boardEl.getBoundingClientRect();
    const cloneRect = clone.getBoundingClientRect();

    // Detect overlap between clone and board
    const overlaps =
      cloneRect.right > boardRect.left &&
      cloneRect.left < boardRect.right &&
      cloneRect.bottom > boardRect.top &&
      cloneRect.top < boardRect.bottom;

    if (!overlaps) {
      setPreview({ cells: [], valid: false });
      return;
    }

    // Hit-test using clone's top-left block instead of pointer
    const anchorX = cloneRect.left + 1;
    const anchorY = cloneRect.top + 1;

    const target = document.elementFromPoint(anchorX, anchorY);

    if (!target || !target.classList.contains("spt-bp-cell")) {
      setPreview({ cells: [], valid: false });
      return;
    }

    const dropR = parseInt(target.dataset.r);
    const dropC = parseInt(target.dataset.c);

    // Always anchor at top-left block
    const startR = dropR;
    const startC = dropC;

    const valid = canPlace(board, shape.blocks, startR, startC);
    const cells = shape.blocks.map(([r, c]) => [startR + r, startC + c]);

    setPreview({ cells, valid });
  }

  /* ---------------- DRAG END ---------------- */

  async function handleDragEnd(e) {
    document.removeEventListener("pointermove", handleDragMove);
    document.removeEventListener("pointerup", handleDragEnd);

    const clone = dragCloneRef.current;
    const shape = dragShapeRef.current;

    if (!clone || !shape) {
      setDraggingIndex(null);
      setPreview({ cells: [], valid: false });
      return;
    }

    // Get bounding boxes
    const boardEl = document.querySelector(".spt-bp-board");
    const boardRect = boardEl.getBoundingClientRect();
    const cloneRect = clone.getBoundingClientRect();

    // Detect overlap
    const overlaps =
      cloneRect.right > boardRect.left &&
      cloneRect.left < boardRect.right &&
      cloneRect.bottom > boardRect.top &&
      cloneRect.top < boardRect.bottom;

    let placed = false;

    if (overlaps) {
      // Hit-test using clone's top-left block
      const anchorX = cloneRect.left + 1;
      const anchorY = cloneRect.top + 1;

      const target = document.elementFromPoint(anchorX, anchorY);

      if (target && target.classList.contains("spt-bp-cell")) {
        const dropR = parseInt(target.dataset.r);
        const dropC = parseInt(target.dataset.c);

        const startR = dropR;
        const startC = dropC;

        if (canPlace(board, shape.blocks, startR, startC)) {
          const { newBoard, placedCount } = placeShape(
            board,
            shape.blocks,
            startR,
            startC,
          );

          const { newBoard: clearedBoard, comboPoints } = clearLines(newBoard);

          const newScore = score + placedCount + comboPoints;
          setBoard(clearedBoard);
          setScore(newScore);

          const newShapes = [...shapes];
          newShapes[dragSlotRef.current] = null;

          if (newShapes.every((s) => s === null)) {
            newShapes[0] = getRandomShape();
            newShapes[1] = getRandomShape();
            newShapes[2] = getRandomShape();
          }

          setShapes(newShapes);
          placed = true;

          try {
            if (!muted) {
              await playPlaceSound(volume);
              if (comboPoints > 0) playClearSound(volume);
            }
          } catch {}
        }
      }
    }

    // Remove clone
    document.body.removeChild(clone);
    dragCloneRef.current = null;

    setDraggingIndex(null);
    setPreview({ cells: [], valid: false });
  }

  /* ---------------- UI ---------------- */

  return (
    <div id="spt-bp-container" className="spt-bp-container">
      <div className="spt-bp-header">
        <h2 className="spt-bp-title">Block Puzzle</h2>

        <div className="spt-bp-header-right">
          <div className="spt-bp-score-board">
            Score: {score} &nbsp;|&nbsp; Best: {highScore}
          </div>
        </div>
      </div>

      <div className="spt-bp-board">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const inPreview = preview.cells.some(
              ([pr, pc]) => pr === r && pc === c,
            );
            const previewClass = inPreview
              ? preview.valid
                ? " preview-valid"
                : " preview-invalid"
              : "";
            return (
              <div
                key={`${r}-${c}`}
                className={
                  "spt-bp-cell" + (cell ? " filled" : "") + previewClass
                }
                data-r={r}
                data-c={c}
              />
            );
          }),
        )}
      </div>

      <div className="spt-bp-tray">
        {shapes.map((shape, idx) => (
          <div key={idx} className="spt-bp-tray-slot">
            {shape && (
              <div
                className={
                  "spt-bp-shape" +
                  (draggingIndex === idx ? " dragging-hidden" : "")
                }
                onPointerDown={(e) => handleDragStart(e, shape, idx)}
                style={{
                  "--bp-cols": Math.max(...shape.blocks.map((b) => b[1])) + 1,
                }}
              >
                {shape.blocks.map(([r, c], i) => (
                  <div
                    key={i}
                    className="spt-bp-shape-block filled"
                    data-sr={r}
                    data-sc={c}
                    style={{
                      "--bp-row": r + 1,
                      "--bp-col": c + 1,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {settingsOpen && (
        <BlockPuzzleSettings
          onClose={() => setSettingsOpen(false)}
          resetGame={resetGame}
          muted={muted}
          setMuted={setMuted}
          openHelp={() => setHelpOpen(true)} // ⭐ FIX
        />
      )}

      {helpOpen && <BlockPuzzleHelp onClose={() => setHelpOpen(false)} />}

      {gameOver && (
        <div className="spt-bp-overlay">
          <div className="spt-bp-modal gameover-modal">
            <h3>Game Over!</h3>
            <p>No more valid moves.</p>
            <p>
              Final Score: <strong>{score}</strong>
            </p>
            <button className="spt-bp-btn-primary" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/*
      {helpOpen && (
        <div className="spt-bp-overlay">
          <div className="spt-bp-modal help-modal">
            <h3>How to Play</h3>
            <ul>
              <li>Drag shapes from the tray onto the board.</li>
              <li>Fill an entire row or column to clear it.</li>
              <li>Earn points for placing blocks and clearing lines.</li>
              <li>The game ends when no available shapes can be placed.</li>
            </ul>
            <h3>Scoring:</h3>
            <ul>
              <li>1 point per block placed</li>
              <li>Combo: cleared blocks × number of lines cleared</li>
            </ul>
            <button
              className="spt-bp-btn-primary"
              onClick={() => setHelpOpen(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="spt-bp-overlay">
          <div className="spt-bp-modal settings-modal">
            <h3>Settings</h3>

            <button className="spt-bp-btn-primary" onClick={resetGame}>
              Start Over
            </button>

            <button
              className="spt-bp-btn-secondary"
              onClick={() => {
                setHelpOpen(true);
                setSettingsOpen(false);
              }}
            >
              Help
            </button>

            <div className="spt-bp-setting-group">
              <label>Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>

            <div className="spt-bp-setting-group">
              <label>Mute</label>
              <input
                type="checkbox"
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
              />
            </div>

            <button
              className="spt-bp-btn-primary"
              onClick={() => setSettingsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
*/
