// src/store/index.js
// Wzorce: Singleton • Observer • Bridge • Strategy(save) • (Memento API)

import {
  StorageBridge,
  LocalStorageBackend,
  MemoryBackend,
  MockApiBackend,
} from "../bridge/storage";
import { createSaveStrategy } from "../strategy/save";

const LOCAL_STORAGE_KEY = "factory-method-todos";
const MOCK_API_DELAY_MS = 250;

class Emitter {
  constructor() {
    this.listeners = new Set();
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(payload) {
    for (const listener of this.listeners) {
      listener(payload);
    }
  }
}

class TodoStore {
  static #instance;

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new TodoStore();
    }
    return this.#instance;
  }

  constructor() {
    if (TodoStore.#instance) {
      return TodoStore.#instance;
    }

    this.emitter = new Emitter();
    this.errorEmitter = new Emitter();
    this.backendEmitter = new Emitter();
    this.settingsEmitter = new Emitter(); // zmiany strategii zapisu

    this.bridge = new StorageBridge(
      new LocalStorageBackend(LOCAL_STORAGE_KEY)
    );
    this.saveStrategy = createSaveStrategy("immediate"); // [Strategy(save)] domyślnie natychmiast

    this.state = [];
    this.ready = false;

    this.reload();
  }

  // =====================
  // ŁADOWANIE STANU
  // =====================

  async reload() {
    try {
      const result = await this.bridge.load();
      assertPersistenceOk(result, "load");

      const rawData = Array.isArray(result.data)
        ? result.data
        : [];

      const migrated = rawData.map((task) => ({
        ...task,
        status:
          task.status ||
          (task.completed ? "done" : "todo"),
        order:
          typeof task.order === "number"
            ? task.order
            : 0,
      }));

      this.state = migrated;
      this.ready = true;
      this.emitter.emit(this.state);
    } catch (error) {
      this.errorEmitter.emit(error);
      this.ready = true;
      this.emitter.emit(this.state);
    }
  }

  // =====================
  // ZAPIS STANU (Strategy + Bridge)
  // =====================

  async #save() {
    try {
      const result = await this.saveStrategy.save(
        this.state,
        this.bridge
      );
      assertPersistenceOk(result, "save");
      return true;
    } catch (error) {
      this.errorEmitter.emit(error);
      return false;
    }
  }

  async #set(nextState) {
    this.state = nextState;
    await this.#save();
    this.emitter.emit(this.state);
  }

  // =====================
  // CRUD
  // =====================

  async add(task) {
    const nextState = [task, ...this.state];
    await this.#set(nextState);
  }

  async remove(id) {
    const nextState = this.state.filter(
      (task) => task.id !== id
    );
    await this.#set(nextState);
  }

  async toggle(id) {
    const nextState = this.state.map((task) =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
          }
        : task
    );
    await this.#set(nextState);
  }

  async update(id, patchOrWhole) {
    const nextState = this.state.map((task) => {
      if (task.id !== id) {
        return task;
      }

      if (patchOrWhole && patchOrWhole.id) {
        // pełny obiekt (replace)
        return { ...patchOrWhole };
      }

      const patch =
        typeof patchOrWhole === "function"
          ? patchOrWhole(task)
          : patchOrWhole || {};

      return {
        ...task,
        ...patch,
        meta: {
          ...task.meta,
          ...(patch.meta || {}),
        },
      };
    });

    await this.#set(nextState);
  }

  // =====================
  // Kanban helpers
  // =====================

  getNextOrder(status) {
    const maxOrder = this.state
      .filter((task) => task.status === status)
      .reduce(
        (maxSoFar, task) =>
          Math.max(maxSoFar, task.order ?? 0),
        0
      );

    return maxOrder + 1;
  }

  async createIn(status, task) {
    const effectiveStatus =
      status ?? task.status ?? "todo";

    const taskWithStatus = {
      ...task,
      status: effectiveStatus,
      order: this.getNextOrder(effectiveStatus),
    };

    await this.add(taskWithStatus);
  }

  async moveCard(id, toStatus, toIndex) {
    const tasksCopy = [...this.state];
    const card = tasksCopy.find(
      (task) => task.id === id
    );

    if (!card) return;

    const sourceColumn = tasksCopy
      .filter(
        (task) =>
          task.status === card.status &&
          task.id !== id
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    normalizeColumnOrder(sourceColumn);

    const targetColumn = tasksCopy
      .filter(
        (task) =>
          task.status === toStatus &&
          task.id !== id
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const safeIndex = clampIndex(
      toIndex,
      targetColumn.length
    );
    const movedCard = {
      ...card,
      status: toStatus,
    };

    targetColumn.splice(safeIndex, 0, movedCard);
    normalizeColumnOrder(targetColumn);

    const updatedIds = new Set(
      [...sourceColumn, ...targetColumn].map(
        (task) => task.id
      )
    );

    const nextState = tasksCopy.map((task) => {
      if (!updatedIds.has(task.id)) {
        return task;
      }
      return (
        targetColumn.find(
          (colTask) => colTask.id === task.id
        ) ||
        sourceColumn.find(
          (colTask) => colTask.id === task.id
        ) ||
        task
      );
    });

    this.state = nextState;
    this.emitter.emit(this.state);
    await this.#save();
  }

  // =====================
  // Bridge (backend)
  // =====================

  backendName() {
    return this.bridge.name();
  }

  async setBackend(kind) {
    let backend;

    switch (kind) {
      case "memory":
        backend = new MemoryBackend([]);
        break;
      case "mockApi":
        backend = new MockApiBackend({
          delay: MOCK_API_DELAY_MS,
        });
        break;
      case "localStorage":
      default:
        backend = new LocalStorageBackend(
          LOCAL_STORAGE_KEY
        );
        break;
    }

    this.bridge.setBackend(backend);
    this.backendEmitter.emit(this.backendName());
    await this.reload();
  }

  // =====================
  // Strategy(save) — przełączanie
  // =====================

  saveStrategyName() {
    return (
      this.saveStrategy?.name?.() || "unknown"
    );
  }

  async setSaveStrategy(kind) {
    if (this.saveStrategy?.dispose) {
      await this.saveStrategy.dispose();
    }

    this.saveStrategy = createSaveStrategy(kind);
    this.settingsEmitter.emit({
      saveStrategy: this.saveStrategyName(),
    });
    // po zmianie strategii nic nie zapisujemy od razu
  }

  // =====================
  // MEMENTO API
  // =====================

  createSnapshot() {
    const data =
      typeof structuredClone === "function"
        ? structuredClone(this.state)
        : JSON.parse(JSON.stringify(this.state));

    return { data };
  }

  async restoreSnapshot(memento) {
    const rawNext = Array.isArray(memento?.data)
      ? memento.data
      : Array.isArray(memento)
      ? memento
      : [];

    const nextState = Array.isArray(rawNext)
      ? rawNext
      : [];

    this.state = nextState;
    this.emitter.emit(this.state);

    const result = await this.bridge.save(
      this.state
    );
    assertPersistenceOk(
      result,
      "restoreSnapshot"
    );
  }
}

export const todoStore = TodoStore.getInstance();

// =====================
// UTILS
// =====================

function normalizeColumnOrder(columnTasks) {
  columnTasks.forEach((task, index) => {
    task.order = index + 1;
  });
}

function clampIndex(index, length) {
  const numericIndex = Number(index);
  if (!Number.isFinite(numericIndex)) {
    return length;
  }
  return Math.min(
    Math.max(0, numericIndex),
    length
  );
}

/**
 * Zamienia zwracane "kody błędów" (ok:false, error)
 * na wyjątki. Używane w:
 * - reload (load)
 * - #save (save strategy)
 * - restoreSnapshot (bridge.save)
 */
function assertPersistenceOk(result, context) {
  if (!result || result.ok !== false) {
    return;
  }

  const baseMessage = `Operacja persystencji nie powiodła się (${context}).`;

  const error =
    result.error instanceof Error
      ? result.error
      : new Error(baseMessage);

  throw error;
}
