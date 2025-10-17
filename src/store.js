
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
    this.key = "factory-method-todos";
    this.state = this.#load();
  }

  #load(){
    try { return JSON.parse(localStorage.getItem(this.key)) ?? []; } catch { return []; }
  }
  #save(){ localStorage.setItem(this.key, JSON.stringify(this.state)); }

  #set(next){
    this.state = next;
    this.#save();
    this.emitter.emit(this.state);
  }

  add(task){ this.#set([task, ...this.state]); }
  remove(id){ this.#set(this.state.filter(t => t.id !== id)); }
  toggle(id){
    this.#set(this.state.map(t => t.id === id ? ({ ...t, completed: !t.completed }) : t));
  }
  replaceAll(tasks){ this.#set(tasks); } // opcjonalne
}

export const todoStore = TodoStore.getInstance();
