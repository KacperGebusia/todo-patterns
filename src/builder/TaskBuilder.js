// src/builder/TaskBuilder.js
// [PATTERN: Builder] — DEKLARACJA
// Współpraca z modelami z src/models/Task.js (LSP + Factory-like)

import {
  SimpleTask,
  PriorityTask,
  DeadlineTask,
} from "../models/Task";

export class TaskBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this._title = "";
    this._type = "simple";
    this._meta = {};
    this._completed = false;
    this._status = "todo";
    return this;
  }

  title(value) {
    this._title = String(value ?? "").trim();
    return this;
  }

  type(value) {
    this._type = value || "simple";
    return this;
  }

  priority(priorityValue) {
    this._meta.priority = Number(priorityValue ?? 1);
    return this;
  }

  due(localDateTimeString) {
    if (localDateTimeString) {
      this._meta.due = new Date(localDateTimeString).toISOString();
    }
    return this;
  }

  status(statusValue) {
    this._status = statusValue || "todo";
    return this;
  }

  completed(flag) {
    this._completed = Boolean(flag);
    return this;
  }

  // === KLUCZOWA ZMIANA: budujemy *instancję* jednej z klas z Task.js ===
  build() {
    if (!this._title) {
      throw new Error("Brak tytułu zadania.");
    }

    const baseProps = {
      title: this._title,
      completed: this._completed,
      // 'type' ustawią już konkretne klasy (SimpleTask / PriorityTask / DeadlineTask),
      // ale przekazujemy, żeby zachować spójność z resztą projektu
      type: this._type,
      meta: {
        ...this._meta,
        status: this._status, // status przenosimy do meta, żeby nie zaginął
      },
    };

    let taskInstance;
    switch (this._type) {
      case "priority":
        taskInstance = new PriorityTask(baseProps);
        break;
      case "deadline":
        taskInstance = new DeadlineTask(baseProps);
        break;
      default:
        taskInstance = new SimpleTask(baseProps);
        break;
    }

    // opcjonalnie czyścimy builder po użyciu
    this.reset();

    return taskInstance;
  }
}
