// src/command/CommandBus.js
// [PATTERN: Command + Memento]
// Globalny CommandBus — kolejkuje komendy, obsługuje undo/redo przez snapshoty (Memento).

import { createMemento } from "../memento/Memento";

export class CommandBus {
  constructor(store) {
    this.store = store;              // odniesienie do Singletona (TodoStore)
    this.undoStack = [];             // historia snapshotów (Memento)
    this.redoStack = [];             // stos snapshotów do redo
    this.listeners = new Set();      // subskrybenci zmian (np. App -> setCanUndo/Redo)
  }

  // ===== OBSŁUGA SUBSKRYPCJI UI =====

  onChange(listener) {
    this.listeners.add(listener);
    listener(this.createChangePayload());
    return () => this.listeners.delete(listener);
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

  // ===== INFORMACJE O STANIE STOSÓW =====

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  // ===== OBSŁUGA SNAPSHOTÓW (MEMENTO) =====

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

  // ===== WYKONANIE KOMENDY =====

  async execute(command) {
    if (!this.isValidCommand(command)) {
      throw new Error("Nieprawidłowa komenda — brak metody do()");
    }

    const beforeMemento = this.createCurrentMemento();
    this.pushUndoSnapshot(beforeMemento);
    this.clearRedoStack();

    await command.do(this.store);

    this.notifyListeners();
  }

  isValidCommand(command) {
    return Boolean(
      command && typeof command.do === "function"
    );
  }

  // ===== COFNIĘCIE (UNDO) =====

  async undo() {
    if (!this.canUndo()) return;

    const currentMemento = this.createCurrentMemento();
    const previousMemento = this.popUndoSnapshot();

    this.pushRedoSnapshot(currentMemento);
    await this.restoreFromMemento(previousMemento);

    this.notifyListeners();
  }

  // ===== PONOWIENIE (REDO) =====

  async redo() {
    if (!this.canRedo()) return;

    const currentMemento = this.createCurrentMemento();
    const nextMemento = this.popRedoSnapshot();

    this.pushUndoSnapshot(currentMemento);
    await this.restoreFromMemento(nextMemento);

    this.notifyListeners();
  }
}
