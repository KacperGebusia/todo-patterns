// src/builder/TaskBuilder.js
// [PATTERN: Builder] — DEKLARACJA

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
    this._meta.due = new Date(localDateTimeString).toISOString();
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

  build() {
    if (!this._title) {
      throw new Error("Brak tytułu zadania.");
    }

    return {
      title: this._title,
      completed: this._completed,
      type: this._type,
      status: this._status,
      meta: { ...this._meta },
    };
  }
}
