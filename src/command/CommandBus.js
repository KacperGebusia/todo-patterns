// src/command/CommandBus.js
// [PATTERN: Command + Memento]
// Globalny CommandBus — kolejkuje komendy, obsługuje undo/redo przez snapshoty (Memento).

import { createMemento } from "../memento/Memento";

export class CommandBus {
  constructor(store) {
    this.store = store;
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
  }

  // =====================
  // API dla UI (wysoki poziom)
  // =====================

  onChange(listener) {
    this.listeners.add(listener);
    listener(this.createChangePayload());
    return () => this.listeners.delete(listener);
  }

  async execute(command) {
    if (!this.isValidCommand(command)) {
      throw new Error("Nieprawidłowa komenda — brak metody do()");
    }

    this.pushUndoSnapshot(this.createCurrentMemento());
    this.clearRedoStack();

    await command.do(this.store);

    this.notifyListeners();
  }

  async undo() {
    if (!this.canUndo()) return;

    const currentSnapshot = this.createCurrentMemento();
    const previousSnapshot = this.popUndoSnapshot();

    this.pushRedoSnapshot(currentSnapshot);
    await this.restoreFromMemento(previousSnapshot);

    this.notifyListeners();
  }

  async redo() {
    if (!this.canRedo()) return;

    const currentSnapshot = this.createCurrentMemento();
    const nextSnapshot = this.popRedoSnapshot();

    this.pushUndoSnapshot(currentSnapshot);
    await this.restoreFromMemento(nextSnapshot);

    this.notifyListeners();
  }

  // =====================
  // Informacje o stanie (średni poziom)
  // =====================

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  createChangePayload() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  notifyListeners() {
    const payload = this.createChangePayload();
    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  isValidCommand(command) {
    return Boolean(
      command && typeof command.do === "function"
    );
  }

  // =====================
  // Snapshoty / Memento (niski poziom)
  // =====================

  createCurrentMemento() {
    return createMemento(this.store.state);
  }

  pushUndoSnapshot(memento) {
    this.undoStack.push(memento);
  }

  pushRedoSnapshot(memento) {
    this.redoStack.push(memento);
  }

  clearRedoStack() {
    this.redoStack = [];
  }

  popUndoSnapshot() {
    return this.undoStack.pop() || null;
  }

  popRedoSnapshot() {
    return this.redoStack.pop() || null;
  }

  async restoreFromMemento(memento) {
    if (!memento) return;
    await this.store.restoreSnapshot(memento);
  }
}
