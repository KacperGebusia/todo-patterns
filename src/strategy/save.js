// src/strategy/save.js
// [PATTERN: Strategy] — strategie zapisu do persystencji

// --- Funkcje pomocnicze ---

function cloneStateDeep(state) {
  if (typeof structuredClone === "function") {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
}

// --- Strategia: zapis natychmiastowy ---

class ImmediateSaveStrategy {
  getName() {
    return "immediate";
  }

  async save(state, persistenceBridge) {
    return persistenceBridge.save(state);
  }

  async dispose() {
    // brak zasobów do zwolnienia
  }
}

// --- Strategia: zapis z debounce ---

class DebouncedSaveStrategy {
  constructor(debounceDelayMs = 500) {
    this.debounceDelayMs = debounceDelayMs;
    this.debounceTimerId = null;
    this.pendingSave = null; // { state, bridge }
  }

  getName() {
    return "debounce500";
  }

  rememberPendingSave(state, persistenceBridge) {
    this.pendingSave = {
      state: cloneStateDeep(state),
      bridge: persistenceBridge,
    };
  }

  clearDebounceTimer() {
    if (this.debounceTimerId) {
      clearTimeout(this.debounceTimerId);
      this.debounceTimerId = null;
    }
  }

  scheduleDebouncedSave(resolve) {
    this.debounceTimerId = setTimeout(async () => {
      const latestPendingSave = this.pendingSave;
      this.pendingSave = null;
      if (latestPendingSave) {
        await latestPendingSave.bridge.save(latestPendingSave.state);
      }
      resolve({ ok: true });
    }, this.debounceDelayMs);
  }

  async save(state, persistenceBridge) {
    this.rememberPendingSave(state, persistenceBridge);
    this.clearDebounceTimer();

    return new Promise((resolve) => {
      this.scheduleDebouncedSave(resolve);
    });
  }

  async flushPendingSave() {
    if (!this.pendingSave) return;

    const latestPendingSave = this.pendingSave;
    this.pendingSave = null;
    await latestPendingSave.bridge.save(latestPendingSave.state);
  }

  async dispose() {
    this.clearDebounceTimer();
    await this.flushPendingSave();
  }
}

// --- Strategia: zapis wsadowy (np. co 5 zmian lub po czasie) ---

class BatchSaveStrategy {
  constructor(batchSize = 5, batchTimeoutMs = 1500) {
    this.batchSize = batchSize;
    this.batchTimeoutMs = batchTimeoutMs;
    this.saveCounter = 0;
    this.batchTimerId = null;
    this.pendingSave = null; // { state, bridge }
  }

  getName() {
    return "batch5";
  }

  rememberPendingSave(state, persistenceBridge) {
    this.pendingSave = {
      state: cloneStateDeep(state),
      bridge: persistenceBridge,
    };
  }

  resetBatchCounter() {
    this.saveCounter = 0;
  }

  clearBatchTimer() {
    if (this.batchTimerId) {
      clearTimeout(this.batchTimerId);
      this.batchTimerId = null;
    }
  }

  async flushBatchNow() {
    if (!this.pendingSave) return;

    const latestPendingSave = this.pendingSave;
    this.pendingSave = null;
    await latestPendingSave.bridge.save(latestPendingSave.state);
  }

  scheduleBatchFlush() {
    this.clearBatchTimer();
    this.batchTimerId = setTimeout(async () => {
      this.resetBatchCounter();
      await this.flushBatchNow();
    }, this.batchTimeoutMs);
  }

  async save(state, persistenceBridge) {
    this.saveCounter += 1;
    this.rememberPendingSave(state, persistenceBridge);

    // przekroczenie progu zapisów — flush natychmiast
    if (this.saveCounter >= this.batchSize) {
      this.resetBatchCounter();
      this.clearBatchTimer();
      await this.flushBatchNow();
      return { ok: true };
    }

    // nie przekroczyliśmy progu – ustawiamy timer
    this.scheduleBatchFlush();
    return { ok: true };
  }

  async dispose() {
    this.clearBatchTimer();
    await this.flushBatchNow();
    this.resetBatchCounter();
  }
}

// --- Fabryka strategii zapisu ---

export function createSaveStrategy(strategyKey) {
  switch (strategyKey) {
    case "debounce500":
      return new DebouncedSaveStrategy(500);
    case "batch5":
      return new BatchSaveStrategy(5, 1500);
    case "immediate":
    default:
      return new ImmediateSaveStrategy();
  }
}

// Dostępne opcje (np. dla selecta w UI)
export const SAVE_STRATEGY_OPTIONS = [
  { key: "immediate",   label: "Natychmiastowy" },
  { key: "debounce500", label: "Debounce 500ms" },
  { key: "batch5",      label: "Wsadowy (5 zmian)" },
];
