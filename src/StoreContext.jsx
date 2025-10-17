import { createContext, useContext, useEffect, useState } from "react";
import { todoStore } from "./store";

const StoreCtx = createContext({ tasks: [], todoStore, lastError: null, backend: "unknown", ready: false });

export function StoreProvider({ children }){
  const [tasks, setTasks] = useState(todoStore.state);
  const [lastError, setLastError] = useState(null);
  const [backend, setBackend] = useState(todoStore.backendName());
  const [ready, setReady] = useState(todoStore.ready);

  useEffect(() => {
    const offState = todoStore.emitter.on((s) => { setTasks(s); setReady(true); });
    const offError = todoStore.errorEmitter.on((err) => setLastError(err));
    const offBackend = todoStore.backendEmitter.on((b) => setBackend(b));
    if (!todoStore.ready) {
      const check = setInterval(() => {
        if (todoStore.ready) { setReady(true); clearInterval(check); }
      }, 50);
      return () => { offState(); offError(); offBackend(); clearInterval(check); };
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
