// src/store/index.js
// Wzorce: Singleton • Observer • Bridge • Strategy(save) • (Memento API)

import { StorageBridge, LocalStorageBackend, MemoryBackend, MockApiBackend } from "../bridge/storage";
import { createSaveStrategy } from "../strategy/save";

class Emitter {
  constructor(){ this.listeners = new Set(); }
  on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(v){ for (const fn of this.listeners) fn(v); }
}

class TodoStore {
  static #instance;
  static getInstance(){ return this.#instance ?? (this.#instance = new TodoStore()); }

  constructor(){
    if (TodoStore.#instance) return TodoStore.#instance;
    this.emitter = new Emitter();
    this.errorEmitter = new Emitter();
    this.backendEmitter = new Emitter();
    this.settingsEmitter = new Emitter(); // zmiany strategii zapisu
    this.bridge = new StorageBridge(new LocalStorageBackend("factory-method-todos"));
    this.saveStrategy = createSaveStrategy("immediate"); // [Strategy(save)] domyślnie natychmiast
    this.state = [];
    this.ready = false;
    this.reload();
  }

  async reload(){
    try {
      const { ok, data, error } = await this.bridge.load();
      const migrated = (ok ? data : []).map(t => ({
        ...t,
        status: t.status || (t.completed ? "done" : "todo"),
        order: typeof t.order === "number" ? t.order : 0,
      }));
      this.state = migrated;
      if (!ok) this.errorEmitter.emit(error);
      this.ready = true;
      this.emitter.emit(this.state);
    } catch (e) { this.errorEmitter.emit(e); }
  }

  async #save(){
    // [Strategy(save)] — delegacja do wybranej strategii
    const r = await this.saveStrategy.save(this.state, this.bridge);
    if(!r?.ok) this.errorEmitter.emit(r?.error);
    return Boolean(r?.ok);
  }
  async #set(next){
    this.state = next;
    await this.#save();
    this.emitter.emit(this.state);
  }

  // ===== CRUD =====
  async add(task){ await this.#set([task, ...this.state]); }
  async remove(id){ await this.#set(this.state.filter(t => t.id !== id)); }
  async toggle(id){ await this.#set(this.state.map(t => t.id === id ? ({ ...t, completed: !t.completed }) : t)); }
  async update(id, patchOrWhole){
    const next = this.state.map(t => {
      if (t.id !== id) return t;
      if (patchOrWhole && patchOrWhole.id) return { ...patchOrWhole };
      const patch = typeof patchOrWhole === "function" ? patchOrWhole(t) : (patchOrWhole || {});
      return { ...t, ...patch, meta: { ...t.meta, ...(patch.meta || {}) } };
    });
    await this.#set(next);
  }

  // ===== Kanban helpers =====
  getNextOrder(status){
    const max = this.state.filter(t=>t.status===status).reduce((m,t)=>Math.max(m, t.order ?? 0), 0);
    return max + 1;
  }
  async createIn(status, task){
    const withStatus = { ...task, status: status ?? task.status ?? "todo", order: this.getNextOrder(status ?? "todo") };
    await this.add(withStatus);
  }
  async moveCard(id, toStatus, toIndex){
    const tasks = [...this.state];
    const card = tasks.find(t=>t.id===id);
    if (!card) return;

    const fromCol = tasks.filter(t=>t.status===card.status && t.id!==id).sort((a,b)=>a.order-b.order);
    fromCol.forEach((t,i)=> t.order = i+1);

    const col = tasks.filter(t=>t.status===toStatus && t.id!==id).sort((a,b)=>a.order-b.order);
    col.splice(Math.min(Math.max(0,toIndex), col.length), 0, { ...card, status: toStatus });
    col.forEach((t,i)=> t.order = i+1);

    const ids = new Set([...fromCol, ...col].map(t=>t.id));
    const next = tasks.map(t => ids.has(t.id) ? (col.find(x=>x.id===t.id) || fromCol.find(x=>x.id===t.id) || t) : t);

    this.state = next;
    this.emitter.emit(this.state);
    await this.#save();
  }

  // ===== Bridge (backend) =====
  backendName(){ return this.bridge.name(); }
  async setBackend(kind){
    let backend;
    switch (kind) {
      case "memory": backend = new MemoryBackend([]); break;
      case "mockApi": backend = new MockApiBackend({ delay: 250 }); break;
      case "localStorage":
      default: backend = new LocalStorageBackend("factory-method-todos");
    }
    this.bridge.setBackend(backend);
    this.backendEmitter.emit(this.backendName());
    await this.reload();
  }

  // ===== Strategy(save) — przełączanie =====
  saveStrategyName(){ return this.saveStrategy?.name?.() ?? "unknown"; }
  async setSaveStrategy(kind){
    // flush i zamiana strategii
    if (this.saveStrategy?.dispose) await this.saveStrategy.dispose();
    this.saveStrategy = createSaveStrategy(kind);
    this.settingsEmitter.emit({ saveStrategy: this.saveStrategyName() });
    // po zmianie strategii nic nie zapisujemy od razu
  }

  // ===== MEMENTO API =====
  createSnapshot(){
    return {
      data: (typeof structuredClone === "function")
        ? structuredClone(this.state)
        : JSON.parse(JSON.stringify(this.state))
    };
  }
  async restoreSnapshot(memento){
    const next = Array.isArray(memento?.data)
      ? memento.data
      : (Array.isArray(memento) ? memento : []);
    this.state = Array.isArray(next) ? next : [];
    this.emitter.emit(this.state);
    await this.bridge.save(this.state);
  }
}

export const todoStore = TodoStore.getInstance();
