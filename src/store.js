import { PersistenceFacade } from "./persistence/facade";

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

    this.persistence = new PersistenceFacade();

    this.emitter = new Emitter();      
    this.errorEmitter = new Emitter();  

    const { ok, data, error } = this.persistence.load();
    this.state = ok ? data : [];
    if (!ok) this.#notifyError(error);
  }

 
  #save() {
    const res = this.persistence.save(this.state);
    if (!res.ok) this.#notifyError(res.error);
    return res.ok;
  }
  #set(next){
    this.state = next;
    this.#save();
    this.emitter.emit(this.state);
  }
  #notifyError(error) {
    console.error("[TodoStore persistence error]", error);
    this.errorEmitter.emit(error);
  }

  add(task){ this.#set([task, ...this.state]); }
  remove(id){ this.#set(this.state.filter(t => t.id !== id)); }
  toggle(id){
    this.#set(this.state.map(t => t.id === id ? ({ ...t, completed: !t.completed }) : t));
  }
  update(id, patchOrFn){
    const next = this.state.map(t => {
      if (t.id !== id) return t;
      const patch = typeof patchOrFn === "function" ? patchOrFn(t) : patchOrFn;
      return { ...t, ...patch, meta: { ...t.meta, ...(patch?.meta || {}) } };
    });
    this.#set(next);
  }

  setPersistenceFacade(facade){
    this.persistence = facade;
    const { ok, data, error } = this.persistence.load();
    if (ok) {
      this.state = data;
      this.emitter.emit(this.state);
    } else {
      this.#notifyError(error);
    }
  }
}

export const todoStore = TodoStore.getInstance();
