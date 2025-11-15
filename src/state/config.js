// src/state/config.js
// [PATTERN: State] — konfiguracja FSM dla cyklu życia karty.

// Lista wszystkich stanów maszyny stanów zadania
export const STATES = /** @type {const} */ ([
  "todo",
  "in_progress",
  "blocked",
  "done",
]);

// Mapowanie stanu na etykietę wyświetlaną w UI
export const STATE_LABEL = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

// Dozwolone przejścia sterowane zdarzeniami (event-driven FSM)
export const TRANSITIONS = {
  todo: {
    START: "in_progress",
    BLOCK: "blocked",
    COMPLETE: "done",
  },
  in_progress: {
    BLOCK: "blocked",
    COMPLETE: "done",
    RESET: "todo",
  },
  blocked: {
    UNBLOCK: "in_progress",
    RESET: "todo",
  },
  done: {
    REOPEN: "todo",
  },
};

// Proste klasy odznak (Tailwind) dla stanów
export const STATE_BADGE = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-amber-100 text-amber-800",
  done: "bg-green-100 text-green-700",
};
