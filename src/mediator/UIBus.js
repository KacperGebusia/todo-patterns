// src/mediator/UIBus.js
// [PATTERN: Mediator] — centralny bus UI, koordynuje akcje między panelami
// Zdarzenia (propozycja):
// - OPEN_EDIT   : { task }
// - CLOSE_EDIT  : {}
// - SET_QUERY   : { query }
// - FOCUS_COMPOSER : {}
// - TOAST       : { type: 'success'|'error'|'info', message: string }

class UIBus {
  constructor(){
    this.listeners = new Map(); // event -> Set<fn>
  }
  on(event, fn){
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn){
    const set = this.listeners.get(event);
    if (set) set.delete(fn);
  }
  emit(event, payload){
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(payload); } catch (e) { console.error("[UIBus] handler error", e); }
    }
  }
}

export const uiBus = new UIBus();
