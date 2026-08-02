import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";

import SettingsMenu from "@drewhyatt/ui/components/SettingsMenu/SettingsMenu.jsx";

const isMobileApp = Capacitor.isNativePlatform();


import { useTheme } from "@drewhyatt/core/theme/useTheme.js";

import sunSvg from "@drewhyatt/assets/images/sun.svg?raw";
import moonSvg from "@drewhyatt/assets/images/moon.svg?raw";

export default function AppHeader({
  appName,
  pageTitle,
  pageSettings,
  registerBlockPuzzleCallbacks,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // ⭐ Clean theme system
  const { theme, toggleTheme } = useTheme();

  // ⭐ Settings menu open/close
  const [open, setOpen] = useState(false);

  // ⭐ Block Puzzle callbacks
  const [blockPuzzleCallbacks, setBlockPuzzleCallbacks] = useState({
    openSettings: null,
    openHelp: null,
  });

  useEffect(() => {
    if (!registerBlockPuzzleCallbacks) return;
    Promise.resolve().then(() => {
      registerBlockPuzzleCallbacks(setBlockPuzzleCallbacks);
    });
  }, [registerBlockPuzzleCallbacks]);

  // ⭐ Breadcrumbs
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((seg, index) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    path: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
<header className={`app-header ${isMobileApp ? "native-mobile" : ""}`}>
      <div className="header-left">
        <h1 className="app-title">{appName}</h1>

        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>

        <nav className="breadcrumbs">
          <Link to="/">Home</Link>
          {breadcrumbItems.map((item, i) => (
            <span key={i}>
              <span className="crumb-sep">›</span>
              <Link to={item.path}>{item.label}</Link>
            </span>
          ))}
        </nav>

        {pageTitle && <span className="page-title">{pageTitle}</span>}
      </div>

      <div className="header-right">
        <button className="header-btn" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="m4,7l16,0m-16,5l16,0m-16,5l16,0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <SettingsMenu
          isOpen={open}
          onClose={() => setOpen(false)}
          toggleTheme={toggleTheme}
          theme={theme}
          sunSvg={sunSvg}
          moonSvg={moonSvg}
          pageSettings={pageSettings}
          openBlockPuzzleSettings={blockPuzzleCallbacks.openSettings}
          openBlockPuzzleHelp={blockPuzzleCallbacks.openHelp}
        />
      </div>
    </header>
  );
}
