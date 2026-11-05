import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { proxyGroq } from "./api/groq.js";

// `npm run dev` serves /api/groq with the same code Vercel runs in production (api/groq.js).
const groqDevApi = (env) => ({
  name: "groq-dev-api",
  configureServer(server) {
    server.middlewares.use("/api/groq", async (req, res) => {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      let body = null;
      try { body = JSON.parse(raw); } catch { /* proxyGroq answers 400 */ }
      const token = (req.headers.authorization || "").replace(/^Bearer /, "");
      const { status, data } = req.method === "POST"
        ? await proxyGroq({ body, token, env, fetch })
        : { status: 405, data: { error: { message: "Use POST." } } };
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    });
  },
});

export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        // Big libraries get their own files, so an app update does not make users download them again.
        manualChunks(id) {
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) return "firebase";
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
        },
      },
    },
  },
  plugins: [
    react(),
    groqDevApi(loadEnv(mode, process.cwd(), "")),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.svg", "icon-512.svg"],
      manifest: {
        name: "Kelvra — AI Study App",
        short_name: "Kelvra",
        description: "AI-powered study companion",
        theme_color: "#6ee7b7",
        background_color: "#0d0f14",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        // Cache app shell
        globPatterns: ["**/*.{js,mjs,css,html,svg,png,ico,woff2}"],
        // The PDF reader worker is ~1 MB; cache it too so PDF upload works offline
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        // Cache strategies
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Cache Material Symbols
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Firebase login and database: never cache (Firestore keeps its own offline copy)
            urlPattern: /^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
      },
    }),
  ],
}));
