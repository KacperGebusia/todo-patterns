import { createContext, useContext, useEffect, useState } from "react";
import { todoStore } from "./store";

const StoreCtx = createContext({ tasks: [], todoStore });

export function StoreProvider({ children }){
  const [tasks, setTasks] = useState(todoStore.state);
  useEffect(() => todoStore.emitter.on(setTasks), []);
  return <StoreCtx.Provider value={{ tasks, todoStore }}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
