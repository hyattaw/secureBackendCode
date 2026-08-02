import ThemeToggle from "@drewhyatt/ui/components/ThemeToggle/ThemeToggle.jsx";
import "./settings.css";

export default function Settings() {
  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-row">
          <label>Theme</label>
          <ThemeToggle />
        </div>
      </section>

      <section className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-row">
          <label>Coming soon…</label>
        </div>
      </section>
    </div>
  );
}
