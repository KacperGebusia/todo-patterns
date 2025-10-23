// src/state/TaskStateMachine.js
// [PATTERN: State] — DEKLARACJA i API FSM: can(), canTo(), transition(), transitionTo(), eventsFor()

import { TRANSITIONS, STATES } from "./config";

/** Zwraca mapę event->nextState dla danego currentState */
function tableFor(state) {
  return TRANSITIONS[state] || {};
}

/** Czy zdarzenie jest dozwolone z bieżącego stanu? */
export function can(state, event) {
  return Boolean(tableFor(state)[event]);
}

/** Czy można przejść DO wskazanego stanu (na podstawie możliwych eventów)? */
export function canTo(state, toState) {
  const t = tableFor(state);
  return Object.values(t).includes(toState);
}

/** Lista dozwolonych eventów z danego stanu */
export function eventsFor(state) {
  return Object.keys(tableFor(state));
}

/** Zastosuj event -> nowy obiekt zadania (bez mutacji) */
export function transition(task, event) {
  const curr = task?.status ?? "todo";
  const next = tableFor(curr)[event];
  if (!next) {
    throw new Error(`Transition denied: state=${curr} event=${event}`);
  }
  return normalizeTaskState({ ...task, status: next });
}

/** Wymuś przejście DO konkretnego stanu (znajdzie pierwszy pasujący event) */
export function transitionTo(task, toState) {
  const curr = task?.status ?? "todo";
  if (curr === toState) return { ...task };
  const t = tableFor(curr);
  const evt = Object.keys(t).find((k) => t[k] === toState);
  if (!evt) throw new Error(`No event from ${curr} to ${toState}`);
  return transition(task, evt);
}

/** Normalizacja dodatkowych pól (np. completed dla 'done') */
function normalizeTaskState(task) {
  const st = task?.status ?? "todo";
  const completed = st === "done";
  return { ...task, status: st, completed };
}

/** Walidacja stanu (opcjonalna) */
export function isValidState(s) {
  return STATES.includes(s);
}
