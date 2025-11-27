// src/fn/TaskFunctions.js

// Zad 1 

// Funkcyjne interfejsy 
// + przykładowe implementacje

import { Task } from "../models/Task";

/**
 * @callback TaskPredicate
 * @description
 * Funkcyjny interfejs: przyjmuje Task, zwraca boolean.
 * Używany do filtrowania / wyszukiwania zadań.
 * @param {Task} task
 * @returns {boolean}
 */

/**
 * @callback TaskMapper
 * @description
 * Funkcyjny interfejs: przyjmuje Task, zwraca zmodyfikowanego Taska.
 * Używany np. przy aktualizacji stanu (update).
 * @param {Task} task
 * @returns {Task}
 */

/**
 * @callback TaskEffect
 * @description
 * Funkcyjny interfejs: przyjmuje Task i wykonuje efekt uboczny (np. log, toast, zapis).
 * Może być synchroniczny lub asynchroniczny.
 * @param {Task} task
 * @returns {void | Promise<void>}
 */

// ============================
// IMPLEMENTACJE (konkretne klasy „funkcyjne”)
// ============================

/** @type {TaskPredicate} */
export const isDone = (task) => task.completed === true;

/** @type {TaskPredicate} */
export const isBlocked = (task) => task.status === "blocked";

/** @type {TaskMapper} */
export const completeTaskMapper = (task) =>
  new Task({
    ...task,
    completed: true,
    status: "done",
  });

/** @type {TaskMapper} */
export const moveToInProgressMapper = (task) =>
  new Task({
    ...task,
    completed: false,
    status: "in_progress",
  });

/** @type {TaskEffect} */
export const logTaskEffect = (task) => {
  console.log(`[TaskEffect] ${task.id} – ${task.title} [${task.status}]`);
};

/** @type {TaskEffect} */
export const notifyDoneEffect = async (task) => {
  if (!task.completed) return;
  // tu mógłbyś użyć np. uiBus.emit('TOAST', ...) – zostawiam neutralny przykład
  console.log(`[TaskEffect] DONE → ${task.title}`);
};

// ============================
// Funkcje narzędziowe używające interfejsów + lambdy
// ============================

/**
 * Przykład użycia TaskPredicate:
 * filtruje przekazaną listę zadań.
 * @param {Task[]} tasks
 * @param {TaskPredicate} predicate
 * @returns {Task[]}
 */
export function filterTasks(tasks, predicate) {
  return (Array.isArray(tasks) ? tasks : []).filter(predicate);
}

/**
 * Przykład użycia TaskMapper:
 * mapuje listę zadań do nowych instancji.
 * @param {Task[]} tasks
 * @param {TaskMapper} mapper
 * @returns {Task[]}
 */
export function mapTasks(tasks, mapper) {
  return (Array.isArray(tasks) ? tasks : []).map(mapper);
}

/**
 * Przykład użycia TaskEffect:
 * odpala efekt uboczny dla każdego zadania.
 * @param {Task[]} tasks
 * @param {TaskEffect} effect
 */
export async function forEachTask(tasks, effect) {
  for (const task of Array.isArray(tasks) ? tasks : []) {
    await effect(task);
  }
}
