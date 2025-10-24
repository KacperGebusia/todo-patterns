// src/command/CommandBus.js
// [PATTERN: Command + Memento]
// Globalny CommandBus — kolejkuje komendy, obsługuje undo/redo przez snapshoty (Memento).

import { createMemento } from "../memento/Memento";

export class CommandBus {
  constructor(store) {
    this.store = store;       // odniesienie do Singletona (TodoStore)
    this.undoStack = [];      // historia snapshotów (Memento)
    this.redoStack = [];
    this.listeners = new Set(); // subskrybenci zmian (np. App -> setCan)
  }

  // === Subskrypcja zmian stanu undo/redo (dla UI) ===
  onChange(fn) {
    this.listeners.add(fn);
    // natychmiastowe powiadomienie o stanie
    fn({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    return () => this.listeners.delete(fn);
  }

  #emit() {
    const payload = { canUndo: this.canUndo(), canRedo: this.canRedo() };
    for (const fn of this.listeners) fn(payload);
  }

  // === Informacje o stanie stosów ===
  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }

  // === Wykonanie komendy ===
  async execute(cmd) {
    if (!cmd || typeof cmd.do !== "function") {
      throw new Error("Nieprawidłowa komenda — brak metody do()");
    }

    // zapisujemy snapshot PRZED wykonaniem komendy
    this.undoStack.push(createMemento(this.store.state));
    this.redoStack = [];

    // wykonaj komendę
    await cmd.do(this.store);

    // powiadom UI
    this.#emit();
  }

  // === Cofnięcie (Undo) ===
  async undo() {
    if (!this.canUndo()) return;
    const current = createMemento(this.store.state); // zapisz aktualny stan
    const m = this.undoStack.pop();                  // weź poprzedni snapshot
    this.redoStack.push(current);                    // zapisz w redo
    await this.store.restoreSnapshot(m);             // przywróć memento
    this.#emit();
  }

  // === Ponowienie (Redo) ===
  async redo() {
    if (!this.canRedo()) return;
    const current = createMemento(this.store.state);
    const m = this.redoStack.pop();
    this.undoStack.push(current);
    await this.store.restoreSnapshot(m);
    this.#emit();
  }
}
