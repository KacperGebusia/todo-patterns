import { StorageBridge, LocalStorageBackend, MemoryBackend, MockApiBackend } from "./bridge/storage";

class Emitter {
  constructor(){ this.listeners = new Set(); }
  on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(payload){ for (const fn of this.listeners) fn(payload); }
}

class TodoStore {
  static #instance;

  static getInstance(){
    if (!TodoStore.#instance) TodoStore.#instance = new TodoStore();
    return TodoStore.#instance;
  }

  constructor(){
    if (TodoStore.#instance) return TodoStore.#instance;

    this.emitter = new Emitter();       
    this.errorEmitter = new Emitter();  
    this.backendEmitter = new Emitter();

    this.bridge = new StorageBridge(new LocalStorageBackend("factory-method-todos"));
    this.state = [];
    this.ready = false;

    this.reload();
  }

  async reload() {
    try {
      const { ok, data, error } = await this.bridge.load();
      this.state = ok ? data : [];
      if (!ok) this.#notifyError(error);
      this.ready = true;
      this.emitter.emit(this.state);
    } catch (e) {
      this.#notifyError(e);
    }
  }

  async #save() {
    const res = await this.bridge.save(this.state);
    if (!res.ok) this.#notifyError(res.error);
    return res.ok;
  }

  async #set(next){
    this.state = next;
    await this.#save();
    this.emitter.emit(this.state);
  }

  #notifyError(error) {
    console.error("[TodoStore error]", error);
    this.errorEmitter.emit(error);
  }

  async add(task){ await this.#set([task, ...this.state]); }
  async remove(id){ await this.#set(this.state.filter(t => t.id !== id)); }
  async toggle(id){
    await this.#set(this.state.map(t => t.id === id ? ({ ...t, completed: !t.completed }) : t));
  }
  async update(id, patchOrWhole){
    const next = this.state.map(t => {
      if (t.id !== id) return t;
      if (patchOrWhole && patchOrWhole.id) return { ...patchOrWhole };
      const patch = typeof patchOrWhole === "function" ? patchOrWhole(t) : (patchOrWhole || {});
      return { ...t, ...patch, meta: { ...t.meta, ...(patch.meta || {}) } };
    });
    await this.#set(next);
  }

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

  backendName(){
    return this.bridge.name();
  }
}

export const todoStore = TodoStore.getInstance();
