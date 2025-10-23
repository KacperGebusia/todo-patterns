// [PATTERN: Memento] — Caretaker
import { Memento } from "./Memento";
export class Caretaker {
  constructor(limit = 100) { this.undoStack = []; this.redoStack = []; this.limit = limit; this.listeners = new Set(); }
  onChange(fn){ this.listeners.add(fn); return ()=>this.listeners.delete(fn); }
  emit(){ for(const fn of this.listeners) fn({canUndo:this.canUndo(), canRedo:this.canRedo()}); }
  pushUndo(state, meta) { this.undoStack.push(new Memento(state, meta)); if (this.undoStack.length > this.limit) this.undoStack.shift(); this.redoStack = []; this.emit(); }
  canUndo(){ return this.undoStack.length > 0; }
  canRedo(){ return this.redoStack.length > 0; }
  undo(currentState) { if (!this.canUndo()) return null; this.redoStack.push(new Memento(currentState)); const m = this.undoStack.pop(); this.emit(); return m.getState(); }
  redo(currentState) { if (!this.canRedo()) return null; this.undoStack.push(new Memento(currentState)); const m = this.redoStack.pop(); this.emit(); return m.getState(); }
}
