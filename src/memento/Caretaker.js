// [PATTERN: Memento] — Caretaker

import { Memento } from "./Memento";

export class Caretaker {
  constructor(limit = 100) {
    this.undoStack = [];
    this.redoStack = [];
    this.limit = limit;
    this.listeners = new Set();
  }

  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const payload = {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  createUndoMemento(state, meta) {
    return new Memento(state, meta);
  }

  addToUndoStack(state, meta) {
    const memento = this.createUndoMemento(state, meta);
    this.undoStack.push(memento);
  }

  trimUndoStackToLimit() {
    while (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
  }

  clearRedoStack() {
    this.redoStack = [];
  }

  pushUndo(state, meta) {
    this.addToUndoStack(state, meta);
    this.trimUndoStackToLimit();
    this.clearRedoStack();
    this.notifyListeners();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  addToRedoStack(state, meta) {
    const memento = new Memento(state, meta);
    this.redoStack.push(memento);
  }

  popFromUndoStack() {
    return this.undoStack.pop() || null;
  }

  popFromRedoStack() {
    return this.redoStack.pop() || null;
  }

  undo(currentState) {
    if (!this.canUndo()) {
      return null;
    }

    this.addToRedoStack(currentState);
    const previousMemento = this.popFromUndoStack();

    this.notifyListeners();
    return previousMemento ? previousMemento.getState() : null;
  }

  redo(currentState) {
    if (!this.canRedo()) {
      return null;
    }

    this.addToUndoStack(currentState);
    const nextMemento = this.popFromRedoStack();

    this.notifyListeners();
    return nextMemento ? nextMemento.getState() : null;
  }
}

// Prosty Memento: przechowuje migawkę stanu aplikacji

function deepCloneState(state) {
  if (typeof structuredClone === "function") {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
}

export function createMemento(state) {
  const data = deepCloneState(state);
  return { data, createdAt: Date.now() };
}
