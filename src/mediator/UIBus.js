// src/mediator/UIBus.js
// [PATTERN: Mediator] — centralny bus UI, koordynuje akcje między panelami
// Zdarzenia (przykład):
// - OPEN_EDIT
// - CLOSE_EDIT
// - SET_QUERY
// - FOCUS_COMPOSER
// - TOAST

class UIBus {
  constructor() {
    this.listeners = new Map(); // event -> Set<handler>
  }

  on(eventName, handler) {
    const eventListeners =
      this.ensureListenerSet(eventName);
    eventListeners.add(handler);
    return () =>
      this.off(eventName, handler);
  }

  off(eventName, handler) {
    const eventListeners =
      this.listeners.get(eventName);
    if (!eventListeners) return;
    eventListeners.delete(handler);
  }

  emit(eventName, payload) {
    const eventListeners =
      this.listeners.get(eventName);
    if (!eventListeners) return;

    for (const handler of eventListeners) {
      this.safeInvokeHandler(handler, payload);
    }
  }

  // =====================
  // UTILS
  // =====================

  ensureListenerSet(eventName) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    return this.listeners.get(eventName);
  }

  safeInvokeHandler(handler, payload) {
    try {
      handler(payload);
    } catch (error) {
      // W UI nie chcemy wywalać całej aplikacji
      // z powodu błędu w jednym handlerze.
      console.error(
        "[UIBus] handler error",
        error
      );
    }
  }
}

export const uiBus = new UIBus();
