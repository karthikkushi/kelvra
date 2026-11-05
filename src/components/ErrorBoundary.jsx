// src/components/ErrorBoundary.jsx
// If a page crashes, show a way out instead of a blank white screen.
import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    // A new deploy removes old page files; a reload picks up the new ones.
    const chunkFailed = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(this.state.error?.message || "");
    const offline = chunkFailed && !navigator.onLine;
    const staleBuild = chunkFailed && !offline;
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-headline text-2xl font-bold">
            {offline ? "This page is not available offline yet" : staleBuild ? "Kelvra was updated" : "Something went wrong on this page"}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {offline
              ? "Open it once while you are online and it will work offline after that. Your saved work is safe."
              : staleBuild
              ? "Reload to get the newest version."
              : "Your saved work is safe. Reload the page, or go back to your dashboard."}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">
              Reload
            </button>
            <a href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-bold text-sm">
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
