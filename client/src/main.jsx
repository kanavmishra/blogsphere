import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) =>
          console.log(
            "🚀 PWA Service Worker Registered successfully:",
            reg.scope
          )
        )
        .catch((err) =>
          console.error("❌ Service Worker registration failed:", err)
        );
    });
  } else {
    // Unregister active service workers in development to prevent caching compilation assets
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log("♻️ Unregistered service worker in development mode");
            window.location.reload();
          }
        });
      }
    });
  }
}