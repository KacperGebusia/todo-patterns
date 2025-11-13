// src/app/main.jsx
// Wejście aplikacji
// [PATTERN: Observer] — UŻYCIE: StoreProvider subskrybuje store i udostępnia Context

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../styles/index.css";
import { StoreProvider } from "../store/StoreContext";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
