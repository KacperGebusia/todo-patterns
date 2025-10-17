import { createContext, useContext, useEffect, useState } from "react";
import { todoStore } from "./store";

const StoreCtx = createContext({ tasks: [], todoStore, lastError: null });

export function StoreProvider({ children }){
  const [tasks, setTasks] = useState(todoStore.state);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    const offState = todoStore.emitter.on(setTasks);
    const offError = todoStore.errorEmitter.on((err) => setLastError(err));
    return () => { offState(); offError(); };
  }, []);

  return (
    <StoreCtx.Provider value={{ tasks, todoStore, lastError }}>
      {children}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);
