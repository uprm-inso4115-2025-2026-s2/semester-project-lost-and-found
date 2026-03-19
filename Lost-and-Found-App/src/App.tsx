import { useMemo, useState } from "react";
import HomePage from "./pages/HomePage";
import ReportCreatePage from "./pages/ReportCreatePage";

export default function App() {
  const envWantsCreate =
    String(import.meta.env.VITE_SHOW_CREATE_MENU).toLowerCase() === "true";
  const [showCreateMenu, setShowCreateMenu] = useState(envWantsCreate);

  const handleOpen = () => setShowCreateMenu(true);
  const handleClose = () => {
    if (envWantsCreate) return; // keep open when explicitly forced via env
    setShowCreateMenu(false);
  };

  return (
    <>
      <HomePage onCreateClick={handleOpen} />

      {showCreateMenu ? (
        <div className="reportOverlay">
          <div className="reportOverlay__inner">
            {!envWantsCreate && (
              <button
                className="reportOverlay__close"
                aria-label="Close report form"
                onClick={handleClose}
              >
                ×
              </button>
            )}
            <ReportCreatePage />
          </div>
        </div>
      ) : null}
    </>
  );
}
