// src/mediator/UIBus.js
// [PATTERN: Mediator] — centralny bus UI, koordynuje akcje między panelami
// Zdarzenia (przykłady):
// - OPEN_EDIT      : { task }
// - CLOSE_EDIT     : {}
// - SET_QUERY      : { query }
// - FOCUS_COMPOSER : {}
// - TOAST          : { type: 'success'|'error'|'info', message: string }

class UIBus {
  constructor() {
    // Map<string, Set<Function>>
    this.listenersByEvent = new Map();
  }

  getListenerSet(eventName) {
    if (!this.listenersByEvent.has(eventName)) {
      this.listenersByEvent.set(eventName, new Set());
    }
    return this.listenersByEvent.get(eventName);
  }

  on(eventName, listener) {
    const listenerSet = this.getListenerSet(eventName);
    listenerSet.add(listener);

    return () => this.off(eventName, listener);
  }

  off(eventName, listener) {
    const listenerSet = this.listenersByEvent.get(eventName);
    if (!listenerSet) return;
    listenerSet.delete(listener);
  }

  emit(eventName, payload) {
    const listenerSet = this.listenersByEvent.get(eventName);
    if (!listenerSet) return;

    for (const listener of listenerSet) {
      try {
        listener(payload);
      } catch (error) {
        console.error("[UIBus] handler error", error);
      }
    }
  }
}

export const uiBus = new UIBus();
