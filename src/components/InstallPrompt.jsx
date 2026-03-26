// src/components/InstallPrompt.jsx
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show banner after 30 seconds
      setTimeout(() => setShowBanner(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setInstalled(true);
    setShowBanner(false);
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50">
      <div className="bg-surface-container-high border border-primary-container/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-on-primary-container text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-on-surface">Install Kelvra</p>
          <p className="text-xs text-on-surface-variant">Study offline, any time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBanner(false)}
            className="text-on-surface-variant hover:text-on-surface text-xs p-1">
            Not now
          </button>
          <button onClick={handleInstall}
            className="px-3 py-1.5 bg-primary-container text-on-primary-container font-bold rounded-lg text-xs">
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
