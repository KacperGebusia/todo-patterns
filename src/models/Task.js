// src/models/Task.js
// LSP: Task jako klasa bazowa, SimpleTask / PriorityTask / DeadlineTask są wymienialne

export class Task {
  /**
   * @param {Object} props
   * @param {string} props.title
   * @param {string} [props.id]
   * @param {boolean} [props.completed]
   * @param {number} [props.createdAt]
   * @param {string} [props.type]
   * @param {string} [props.status]       // 👈 ważne
   * @param {Object} [props.meta]
   */
  constructor({
    id,
    title,
    completed = false,
    createdAt = Date.now(),
    type = "simple",
    status,
    meta = {},
  } = {}) {
    if (!title || typeof title !== "string") {
      throw new Error("Task.title is required and must be a string");
    }

    this.id = id ?? crypto.randomUUID();
    this.title = title;
    this.completed = !!completed;
    this.createdAt = createdAt;
    this.type = type;

    // 👇 KLUCZOWE: status jest częścią modelu
    this.status = status ?? (this.completed ? "done" : "todo");

    this.meta = meta;
  }

  toggle() {
    this.completed = !this.completed;
    // opcjonalnie można aktualizować status:
    // this.status = this.completed ? "done" : this.status;
  }

  getDescription() {
    return `Task: ${this.title}${this.completed ? " [done]" : ""}`;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      type: this.type,
      status: this.status,   // 👈 ważne, żeby przechodziło przez save/load
      meta: this.meta,
    };
  }
}

export class SimpleTask extends Task {
  constructor(props = {}) {
    super({
      ...props,
      type: "simple",
      meta: { icon: "circle", ...(props.meta || {}) },
    });
  }
}

export class PriorityTask extends Task {
  constructor(props = {}) {
    const priority =
      props.meta?.priority ?? props.priority ?? 1;

    super({
      ...props,
      type: "priority",
      meta: {
        icon: "star",
        priority,
        ...(props.meta || {}),
      },
    });
  }

  getDescription() {
    return `Priority ${this.meta.priority} – ${this.title}${
      this.completed ? " [done]" : ""
    }`;
  }
}

export class DeadlineTask extends Task {
  constructor(props = {}) {
    const due =
      props.meta?.due ??
      props.due ??
      new Date().toISOString();

    super({
      ...props,
      type: "deadline",
      meta: {
        icon: "calendar",
        due,
        ...(props.meta || {}),
      },
    });
  }

  getDescription() {
    const base = super.getDescription();
    return `${base} (due: ${this.meta.due})`;
  }
}
