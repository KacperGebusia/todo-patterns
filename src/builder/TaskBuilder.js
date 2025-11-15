// src/builder/TaskBuilder.js
// [PATTERN: Builder] — deklaracja buildera zadań

export class TaskBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.titleText = "";
    this.typeName = "simple";
    this.meta = {};
    this.isCompleted = false;
    this.statusName = "todo";
    return this;
  }

  setTitle(rawTitle) {
    this.titleText = String(rawTitle ?? "").trim();
    return this;
  }

  setType(rawType) {
    this.typeName = rawType || "simple";
    return this;
  }

  setPriority(priorityValue) {
    this.meta.priority = Number(priorityValue ?? 1);
    return this;
  }

  setDueDate(localDateTimeValue) {
    const iso = this.toIsoString(localDateTimeValue);
    if (iso) {
      this.meta.due = iso;
    }
    return this;
  }

  setStatus(rawStatus) {
    this.statusName = rawStatus || "todo";
    return this;
  }

  setCompleted(flag) {
    this.isCompleted = Boolean(flag);
    return this;
  }

  toIsoString(localDateTimeValue) {
    if (!localDateTimeValue) return null;
    const date = new Date(localDateTimeValue);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  validate() {
    if (!this.titleText) {
      throw new Error("Brak tytułu zadania.");
    }
  }

  build() {
    this.validate();

    return {
      title: this.titleText,
      completed: this.isCompleted,
      type: this.typeName,
      status: this.statusName,
      meta: { ...this.meta },
    };
  }
}
