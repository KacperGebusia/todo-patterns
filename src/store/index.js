// src/store/index.js
// Wzorce: Singleton • Observer • Bridge • Strategy(save) • (Memento API)

import {
  StorageBridge,
  LocalStorageBackend,
  MemoryBackend,
  MockApiBackend,
} from "../bridge/storage";
import { createSaveStrategy } from "../strategy/save";

class Emitter {
  constructor() {
    this.listeners = new Set();
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(value) {
    for (const listener of this.listeners) {
      listener(value);
    }
  }
}

// POMOCNICZE FUNKCJE (pojedyncza odpowiedzialność)

function migrateLoadedTasks(rawTasks) {
  const fallbackTasks = Array.isArray(rawTasks) ? rawTasks : [];
  return fallbackTasks.map((task) => ({
    ...task,
    status: task.status || (task.completed ? "done" : "todo"),
    order: typeof task.order === "number" ? task.order : 0,
  }));
}

function cloneTasksForSnapshot(tasks) {
  if (typeof structuredClone === "function") {
    return structuredClone(tasks);
  }
  return JSON.parse(JSON.stringify(tasks));
}

function buildBackendInstance(kind) {
  switch (kind) {
    case "memory":
      return new MemoryBackend([]);
    case "mockApi":
      return new MockApiBackend({ delay: 250 });
    case "localStorage":
    default:
      return new LocalStorageBackend("factory-method-todos");
  }
}

class TodoStore {
  static #instance;

  static getInstance() {
    if (!TodoStore.#instance) {
      TodoStore.#instance = new TodoStore();
    }
    return TodoStore.#instance;
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
      new LocalStorageBackend("factory-method-todos")
    );
    this.saveStrategy = createSaveStrategy("immediate");

    this.state = [];
    this.ready = false;

    this.reload();
  }

  // ===== PERSYSTENCJA STANU =====

  async reload() {
    try {
      const { ok, data, error } = await this.bridge.load();
      const migratedTasks = migrateLoadedTasks(ok ? data : []);
      this.state = migratedTasks;
      if (!ok) {
        this.errorEmitter.emit(error);
      }
      this.ready = true;
      this.emitter.emit(this.state);
    } catch (loadError) {
      this.errorEmitter.emit(loadError);
    }
  }

  async #persistCurrentState() {
    const result = await this.saveStrategy.save(this.state, this.bridge);
    if (!result?.ok) {
      this.errorEmitter.emit(result?.error);
    }
    return Boolean(result?.ok);
  }

  #updateState(taskList) {
    this.state = Array.isArray(taskList) ? taskList : [];
  }

  #notifyStateChanged() {
    this.emitter.emit(this.state);
  }

  async #applyStateChange(taskList) {
    this.#updateState(taskList);
    await this.#persistCurrentState();
    this.#notifyStateChanged();
  }

  // ===== CRUD =====

  async add(task) {
    const updatedTasks = [task, ...this.state];
    await this.#applyStateChange(updatedTasks);
  }

  async remove(taskId) {
    const updatedTasks = this.state.filter((task) => task.id !== taskId);
    await this.#applyStateChange(updatedTasks);
  }

  async toggle(taskId) {
    const updatedTasks = this.state.map((task) =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    );
    await this.#applyStateChange(updatedTasks);
  }

  async update(taskId, patchOrWhole) {
    const updatedTasks = this.state.map((task) => {
      if (task.id !== taskId) {
        return task;
      }
      if (patchOrWhole && patchOrWhole.id) {
        return { ...patchOrWhole };
      }
      const patch =
        typeof patchOrWhole === "function"
          ? patchOrWhole(task)
          : patchOrWhole || {};
      return {
        ...task,
        ...patch,
        meta: { ...task.meta, ...(patch.meta || {}) },
      };
    });

    await this.#applyStateChange(updatedTasks);
  }

  // ===== Kanban helpers =====

  getNextOrder(status) {
    const statusTasks = this.state.filter(
      (task) => task.status === status
    );
    const maxOrder = statusTasks.reduce(
      (max, task) => Math.max(max, task.order ?? 0),
      0
    );
    return maxOrder + 1;
  }

  async createIn(status, task) {
    const targetStatus = status ?? task.status ?? "todo";
    const withStatusAndOrder = {
      ...task,
      status: targetStatus,
      order: this.getNextOrder(targetStatus),
    };
    await this.add(withStatusAndOrder);
  }

  async moveCard(taskId, targetStatus, targetIndex) {
    const allTasks = [...this.state];
    const taskToMove = allTasks.find((task) => task.id === taskId);
    if (!taskToMove) return;

    const sourceStatus = taskToMove.status;
    const sourceColumn = this.#buildColumnWithoutTask(
      allTasks,
      sourceStatus,
      taskId
    );
    const normalizedSourceColumn =
      this.#normalizeColumnOrder(sourceColumn);

    const targetColumn = this.#buildColumnWithoutTask(
      allTasks,
      targetStatus,
      taskId
    );
    const normalizedTargetColumn = this.#insertTaskIntoColumn(
      targetColumn,
      taskToMove,
      targetStatus,
      targetIndex
    );

    const updatedTasks = this.#mergeColumnsIntoTasks(
      allTasks,
      normalizedSourceColumn,
      normalizedTargetColumn
    );

    await this.#applyStateChange(updatedTasks);
  }

  #buildColumnWithoutTask(taskList, status, excludedTaskId) {
    return taskList
      .filter(
        (task) =>
          task.status === status && task.id !== excludedTaskId
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  #normalizeColumnOrder(columnTasks) {
    columnTasks.forEach((task, index) => {
      task.order = index + 1;
    });
    return columnTasks;
  }

  #insertTaskIntoColumn(columnTasks, task, status, index) {
    const sortedColumn = [...columnTasks].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    const safeIndex = Math.min(
      Math.max(0, index),
      sortedColumn.length
    );
    const cardWithStatus = { ...task, status };
    sortedColumn.splice(safeIndex, 0, cardWithStatus);
    return this.#normalizeColumnOrder(sortedColumn);
  }

  #mergeColumnsIntoTasks(
    allTasks,
    sourceColumnTasks,
    targetColumnTasks
  ) {
    const updatedTasksById = new Map();
    [...sourceColumnTasks, ...targetColumnTasks].forEach(
      (task) => {
        updatedTasksById.set(task.id, task);
      }
    );

    return allTasks.map((task) =>
      updatedTasksById.has(task.id)
        ? updatedTasksById.get(task.id)
        : task
    );
  }

  // ===== Bridge (backend) =====

  backendName() {
    return this.bridge.name();
  }

  async setBackend(kind) {
    const backendInstance = buildBackendInstance(kind);
    this.bridge.setBackend(backendInstance);
    this.backendEmitter.emit(this.backendName());
    await this.reload();
  }

  // ===== Strategy(save) — przełączanie =====

  saveStrategyName() {
    return this.saveStrategy?.name?.() ?? "unknown";
  }

  async setSaveStrategy(kind) {
    if (this.saveStrategy?.dispose) {
      await this.saveStrategy.dispose();
    }
    this.saveStrategy = createSaveStrategy(kind);
    this.settingsEmitter.emit({
      saveStrategy: this.saveStrategyName(),
    });
  }

  // ===== MEMENTO API =====

  createSnapshot() {
    return {
      data: cloneTasksForSnapshot(this.state),
    };
  }

  async restoreSnapshot(memento) {
    const candidate = memento?.data ?? memento;
    const nextTasks = Array.isArray(candidate) ? candidate : [];
    this.#updateState(nextTasks);
    this.#notifyStateChanged();
    await this.bridge.save(this.state);
  }
}

export const todoStore = TodoStore.getInstance();
