// Prosty Memento: przechowuje migawkę stanu aplikacji
export function createMemento(state) {
  // deep copy
  const data = (typeof structuredClone === "function")
    ? structuredClone(state)
    : JSON.parse(JSON.stringify(state));
  return { data, createdAt: Date.now() };
}
