// Wejście aplikacji
// [PATTERN: Observer] — UŻYCIE: StoreProvider subskrybuje store i udostępnia Context
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../styles/index.css";
import { StoreProvider } from "../store/StoreContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
