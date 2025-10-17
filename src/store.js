const DEV = false; // true - włączone logi akcji

class Emitter {
  constructor() {
    this.listeners = new Set();
  }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(payload) {
    for (const fn of this.listeners) fn(payload);
  }
}

class TodoStore {
  static #instance;

  static getInstance() {
    if (!TodoStore.#instance) TodoStore.#instance = new TodoStore();
    return TodoStore.#instance;
  }

  constructor() {
    if (TodoStore.#instance) return TodoStore.#instance;
    this.emitter = new Emitter();
    this.key = "factory-method-todos";
    this.state = this.#load();
    if (DEV) console.log("[store] init", this.state);
  }

  #load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) ?? [];
    } catch {
      return [];
    }
  }
  #save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
    } catch (e) {
      console.error("[store] save error", e);
    }
  }

  #publish(next) {
    this.state = Array.isArray(next) ? [...next] : [];
    this.#save();
    if (DEV) console.log("[store] publish", this.state);
    this.emitter.emit(this.state);
  }

  add(task) {
    if (DEV) console.log("[store] add", task);
    this.#publish([task, ...this.state]);
  }

  remove(id) {
    if (DEV) console.log("[store] remove", id);
    this.#publish(this.state.filter((t) => t.id !== id));
  }

  toggle(id) {
    if (DEV) console.log("[store] toggle", id);
    this.#publish(
      this.state.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  update(id, patchOrFn) {
    const next = this.state.map((t) => {
      if (t.id !== id) return t;
      const patch = typeof patchOrFn === "function" ? patchOrFn(t) : patchOrFn;
      return { ...t, ...patch, meta: { ...t.meta, ...(patch?.meta || {}) } };
    });
    this.#publish(next);
  }

  replaceAll(tasks) {
    if (DEV) console.log("[store] replaceAll", tasks);
    this.#publish(tasks);
  }
}

export const todoStore = TodoStore.getInstance();
