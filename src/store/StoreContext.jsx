// src/store/StoreContext.jsx
// Wzorce: Observer (subskrypcja store) + React Context

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { todoStore } from "./index";

const StoreContext = createContext({
  tasks: [],
  todoStore,
  lastError: null,
  backend: "unknown",
  ready: false,
});

export function StoreProvider({ children }) {
  const [tasks, setTasks] = useState(
    Array.isArray(todoStore.state) ? todoStore.state : []
  );
  const [lastError, setLastError] = useState(null);
  const [backend, setBackend] = useState(todoStore.backendName());
  const [ready, setReady] = useState(todoStore.ready);

  useEffect(() => {
    const unsubscribeState = todoStore.emitter.on((storeState) => {
      const nextTasks = Array.isArray(storeState)
        ? storeState
        : [];
      setTasks(nextTasks);
      setReady(true);
    });

    const unsubscribeError = todoStore.errorEmitter.on(
      (error) => setLastError(error)
    );

    const unsubscribeBackend = todoStore.backendEmitter.on(
      (backendName) => setBackend(backendName)
    );

    if (!todoStore.ready) {
      const readyCheckTimerId = setInterval(() => {
        if (todoStore.ready) {
          setReady(true);
          clearInterval(readyCheckTimerId);
        }
      }, 50);

      return () => {
        unsubscribeState();
        unsubscribeError();
        unsubscribeBackend();
        clearInterval(readyCheckTimerId);
      };
    }

    return () => {
      unsubscribeState();
      unsubscribeError();
      unsubscribeBackend();
    };
  }, []);

  return (
    <StoreContext.Provider
      value={{ tasks, todoStore, lastError, backend, ready }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
