import { useEffect, useState } from "react";

export default function SoundToggleIcon({ muted, onToggle }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    async function loadIcon() {
      const raw = await fetch("@drewhyatt/assets/images/soundToggle.svg").then((r) => r.text());
      setSvg(raw);
    }
    loadIcon();
  }, []);

  return (
    <button
      className="sound-toggle-icon"
      onClick={onToggle}
      aria-label={muted ? "Unmute" : "Mute"}
    >
      <span
        className={muted ? "muted" : "unmuted"}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </button>
  );
}
