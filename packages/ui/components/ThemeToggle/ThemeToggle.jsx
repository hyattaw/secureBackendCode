export default function ThemeToggle({ theme, toggleTheme, sunSvg, moonSvg }) {
  // Convert URL-encoded SVGs into raw markup
  function normalizeSvg(svg) {
    if (!svg) return "";

    // Case 1: Raw SVG markup (starts with "<svg")
    if (svg.trim().startsWith("<svg")) {
      return svg;
    }

    // Case 2: URL-encoded SVG (starts with "data:image/svg+xml")
    if (svg.startsWith("data:image/svg+xml")) {
      try {
        const encoded = svg.split(",")[1]; // strip "data:image/svg+xml,"
        return decodeURIComponent(encoded);
      } catch (err) {
        console.error("Failed to decode SVG:", err);
        return "";
      }
    }

    // Case 3: Unexpected format — return empty
    return "";
  }

  const sun = normalizeSvg(sunSvg);
  const moon = normalizeSvg(moonSvg);

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <span
        className={`icon sun ${theme === "light" ? "visible" : ""}`}
        dangerouslySetInnerHTML={{ __html: sun }}
      />
      <span
        className={`icon moon ${theme === "dark" ? "visible" : ""}`}
        dangerouslySetInnerHTML={{ __html: moon }}
      />
      <span className="flare" />
    </button>
  );
}
