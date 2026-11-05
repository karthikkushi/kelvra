// src/components/OfflineBanner.jsx
// Shows when the device goes offline and hides again when it comes back.
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;
  return (
    <div role="status"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100%-2rem)] bg-error-container text-error rounded-full shadow-lg px-4 py-2 text-xs font-bold flex items-center gap-2">
      <span className="material-symbols-outlined text-sm">cloud_off</span>
      <span>Offline: your progress still works and syncs later. AI needs internet.</span>
    </div>
  );
}
