// src/state/config.js
// [PATTERN: State] — konfiguracja FSM dla cyklu życia karty.

export const STATES = /** @type {const} */ ([
  "todo",
  "in_progress",
  "blocked",
  "done",
]);

export const STATE_LABEL = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

// Dozwolone przejścia sterowane ZDARZENIAMI (event-driven)
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

// (opcjonalnie) proste kolory odznak
export const STATE_BADGE = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-amber-100 text-amber-800",
  done: "bg-green-100 text-green-700",
};
