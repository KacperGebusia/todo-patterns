// [PATTERN: Command] — invoker + [Memento]
import { Caretaker } from "../memento/Caretaker";
class Emitter { constructor(){ this.listeners = new Set(); } on(fn){ this.listeners.add(fn); return ()=>this.listeners.delete(fn); } emit(v){ for(const fn of this.listeners) fn(v); } }
export class CommandBus {
  constructor(store){ this.store = store; this.caretaker = new Caretaker(200); this.changed = new Emitter(); this.caretaker.onChange(s => this.changed.emit(s)); }
  onChange(fn){ return this.changed.on(fn); }
  async execute(cmd){ this.caretaker.pushUndo(this.store.getSnapshot(), cmd.meta?.()); await cmd.do(this.store); this.changed.emit({canUndo:this.canUndo(), canRedo:this.canRedo()}); }
  canUndo(){ return this.caretaker.canUndo(); }
  canRedo(){ return this.caretaker.canRedo(); }
  async undo(){ const snap = this.caretaker.undo(this.store.getSnapshot()); if (snap) await this.store.restoreSnapshot(snap); this.changed.emit({canUndo:this.canUndo(), canRedo:this.canRedo()}); }
  async redo(){ const snap = this.caretaker.redo(this.store.getSnapshot()); if (snap) await this.store.restoreSnapshot(snap); this.changed.emit({canUndo:this.canUndo(), canRedo:this.canRedo()}); }
}
import { todoStore } from "../store";
export const commandBus = new CommandBus(todoStore);
