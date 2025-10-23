// src/store/StoreContext.jsx
// Wzorce: Observer (subskrypcja store) + React Context

import { createContext, useContext, useEffect, useState } from "react";
import { todoStore } from "./index";

const StoreCtx = createContext({
  tasks: [],
  todoStore,
  lastError: null,
  backend: "unknown",
  ready: false
});

export function StoreProvider({ children }){
  const [tasks, setTasks] = useState(Array.isArray(todoStore.state) ? todoStore.state : []);
  const [lastError, setLastError] = useState(null);
  const [backend, setBackend] = useState(todoStore.backendName());
  const [ready, setReady] = useState(todoStore.ready);

  useEffect(() => {
    const offState = todoStore.emitter.on((s) => {
      // bezpieczeństwo: zawsze tablica
      setTasks(Array.isArray(s) ? s : []);
      setReady(true);
    });
    const offError = todoStore.errorEmitter.on((e) => setLastError(e));
    const offBackend = todoStore.backendEmitter.on((b) => setBackend(b));

    if (!todoStore.ready) {
      const tick = setInterval(() => {
        if (todoStore.ready){ setReady(true); clearInterval(tick); }
      }, 50);
      return () => { offState(); offError(); offBackend(); clearInterval(tick); };
    }
    return () => { offState(); offError(); offBackend(); };
  }, []);

  return (
    <StoreCtx.Provider value={{ tasks, todoStore, lastError, backend, ready }}>
      {children}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);
