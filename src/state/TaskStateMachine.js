// src/state/TaskStateMachine.js
// [PATTERN: State] — deklaracja i API FSM: can(), canTo(), transition(), transitionTo(), eventsFor()

import { TRANSITIONS, STATES } from "./config";

// Zwraca mapę event -> nextState dla podanego stanu
function getTransitionTableForState(currentState) {
  return TRANSITIONS[currentState] || {};
}

// Czy zdarzenie jest dozwolone z bieżącego stanu?
export function can(currentState, eventName) {
  const transitionTable = getTransitionTableForState(currentState);
  return Boolean(transitionTable[eventName]);
}

// Czy można przejść DO wskazanego stanu (na podstawie możliwych eventów)?
export function canTo(currentState, targetState) {
  const transitionTable = getTransitionTableForState(currentState);
  return Object.values(transitionTable).includes(targetState);
}

// Lista dozwolonych eventów z danego stanu
export function eventsFor(currentState) {
  const transitionTable = getTransitionTableForState(currentState);
  return Object.keys(transitionTable);
}

function getCurrentTaskStatus(task) {
  return task?.status ?? "todo";
}

function getNextStatusForEvent(currentStatus, eventName) {
  const transitionTable = getTransitionTableForState(currentStatus);
  return transitionTable[eventName];
}

// Zastosuj event -> zwróć nowy obiekt zadania (bez mutacji)
export function transition(task, eventName) {
  const currentStatus = getCurrentTaskStatus(task);
  const nextStatus = getNextStatusForEvent(currentStatus, eventName);

  if (!nextStatus) {
    throw new Error(
      `Transition denied: state=${currentStatus} event=${eventName}`
    );
  }

  const updatedTask = { ...task, status: nextStatus };
  return normalizeTaskState(updatedTask);
}

// Wymuś przejście DO konkretnego stanu (znajduje pierwszy pasujący event)
export function transitionTo(task, targetState) {
  const currentStatus = getCurrentTaskStatus(task);

  if (currentStatus === targetState) {
    return { ...task };
  }

  const transitionTable = getTransitionTableForState(currentStatus);
  const eventName = Object.keys(transitionTable).find(
    (eventKey) => transitionTable[eventKey] === targetState
  );

  if (!eventName) {
    throw new Error(
      `No event from ${currentStatus} to ${targetState}`
    );
  }

  return transition(task, eventName);
}

// Normalizacja pól stanu (np. completed dla 'done')
function normalizeTaskState(task) {
  const normalizedStatus = task?.status ?? "todo";
  const isCompleted = normalizedStatus === "done";

  return {
    ...task,
    status: normalizedStatus,
    completed: isCompleted,
  };
}

// Walidacja stanu (opcjonalna)
export function isValidState(stateKey) {
  return STATES.includes(stateKey);
}
