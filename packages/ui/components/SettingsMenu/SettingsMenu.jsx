import { useState, useEffect, useRef } from "react";

export default function SettingsMenu({
  isOpen,
  onClose,
  toggleTheme,
  theme,
  sunSvg,
  moonSvg,
  pageSettings = null,
  openBlockPuzzleSettings = null,
  openBlockPuzzleHelp = null,
}) {
  if (!isOpen) {
    return null; // clean, safe, reactive
  }

  const menuRef = useRef(null);

  // ⭐ Normalize raw or URL-encoded SVGs
  function normalizeSvg(svg) {
    if (!svg) return "";

    // Case 1: Raw SVG markup
    if (svg.trim().startsWith("<svg")) {
      return svg;
    }

    // Case 2: URL-encoded SVG
    if (svg.startsWith("data:image/svg+xml")) {
      try {
        const encoded = svg.split(",")[1];
        return decodeURIComponent(encoded);
      } catch (err) {
        console.error("Failed to decode SVG:", err);
        return "";
      }
    }

    // Case 3: Unexpected format
    return "";
  }

  const sun = normalizeSvg(sunSvg);
  const moon = normalizeSvg(moonSvg);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className={`settings-menu ${isOpen ? "open" : "closed"}`} ref={menuRef}>
      <div className="settings-menu-header">
        <h3>Settings</h3>

        <button className="settings-theme-icon" onClick={toggleTheme}>
          <span
            dangerouslySetInnerHTML={{
              __html: theme === "light" ? moon : sun,
            }}
          />
        </button>
      </div>

      <ul className="settings-list">
        {/* Global items */}
        <li>
          <button className="muted">Profile (not yet functional)</button>
        </li>
        <li>
          <button className="muted">About (not yet functional)</button>
        </li>

        {/* Page-specific items */}
        {Array.isArray(pageSettings) && pageSettings.length > 0 && (
          <>
            <hr />
            {pageSettings.map((item, i) => (
              <li key={i}>
                <button onClick={item.onClick}>{item.label}</button>
              </li>
            ))}
          </>
        )}

        {/* Block Puzzle section */}
        {(openBlockPuzzleSettings || openBlockPuzzleHelp) && (
          <li className="settings-section">
            <hr />
            <h3 className="settings-menu-header">Block Puzzle</h3>

            {openBlockPuzzleSettings && (
              <button
                className="settings-btn"
                onClick={() => openBlockPuzzleSettings()}
              >
                Game Settings
              </button>
            )}

            {openBlockPuzzleHelp && (
              <button
                className="settings-btn"
                onClick={() => openBlockPuzzleHelp()}
              >
                How to Play
              </button>
            )}
          </li>
        )}
      </ul>

      <button className="close-btn" onClick={onClose}>
        Close
      </button>
    </div>
  );
}