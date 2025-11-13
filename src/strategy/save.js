// src/strategy/save.js
// [PATTERN: Strategy] — strategie zapisu do persystencji

// ===== magic numbers → stałe =====
const DEFAULT_DEBOUNCE_MS = 500;
const DEFAULT_BATCH_COUNT = 5;
const DEFAULT_BATCH_TIMEOUT_MS = 1500;

function deepCopy(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

class ImmediateSaveStrategy {
  name() {
    return "immediate";
  }

  async save(state, bridge) {
    return await bridge.save(state);
  }

  async dispose() {
    // brak stanu do czyszczenia
  }
}

class DebouncedSaveStrategy {
  constructor(delayMs = DEFAULT_DEBOUNCE_MS) {
    this.delayMs = delayMs;
    this.timerId = null;
    this.pendingSnapshot = null; // { state, bridge }
  }

  name() {
    return "debounce500";
  }

  async save(state, bridge) {
    this.pendingSnapshot = {
      state: deepCopy(state),
      bridge,
    };

    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    return await new Promise((resolve) => {
      this.timerId = setTimeout(async () => {
        const snapshot = this.pendingSnapshot;
        this.pendingSnapshot = null;
        this.timerId = null;

        if (snapshot) {
          const result = await snapshot.bridge.save(snapshot.state);
          resolve(result);
        } else {
          resolve({ ok: true });
        }
      }, this.delayMs);
    });
  }

  async dispose() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.pendingSnapshot) {
      const snapshot = this.pendingSnapshot;
      this.pendingSnapshot = null;
      await snapshot.bridge.save(snapshot.state);
    }
  }
}

class BatchSaveStrategy {
  constructor(batchSize = DEFAULT_BATCH_COUNT, timeoutMs = DEFAULT_BATCH_TIMEOUT_MS) {
    this.batchSize = batchSize;
    this.timeoutMs = timeoutMs;
    this.changeCounter = 0;
    this.timerId = null;
    this.lastSnapshot = null; // { state, bridge }
  }

  name() {
    return "batch5";
  }

  async save(state, bridge) {
    this.changeCounter += 1;
    this.lastSnapshot = {
      state: deepCopy(state),
      bridge,
    };

    if (this.changeCounter >= this.batchSize) {
      // natychmiastowy zapis po osiągnięciu progu
      this.resetTimer();
      this.changeCounter = 0;
      return await bridge.save(this.lastSnapshot.state);
    }

    this.armTimer();
    return { ok: true };
  }

  async dispose() {
    this.resetTimer();

    if (this.lastSnapshot) {
      const snapshot = this.lastSnapshot;
      this.lastSnapshot = null;
      this.changeCounter = 0;
      await snapshot.bridge.save(snapshot.state);
    }
  }

  armTimer() {
    this.resetTimer();

    this.timerId = setTimeout(async () => {
      this.changeCounter = 0;

      if (this.lastSnapshot) {
        const snapshot = this.lastSnapshot;
        this.lastSnapshot = null;
        await snapshot.bridge.save(snapshot.state);
      }
    }, this.timeoutMs);
  }

  resetTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

export function createSaveStrategy(kind) {
  switch (kind) {
    case "debounce500":
      return new DebouncedSaveStrategy(DEFAULT_DEBOUNCE_MS);
    case "batch5":
      return new BatchSaveStrategy(
        DEFAULT_BATCH_COUNT,
        DEFAULT_BATCH_TIMEOUT_MS
      );
    case "immediate":
    default:
      return new ImmediateSaveStrategy();
  }
}

export const SAVE_STRATEGY_OPTIONS = [
  { key: "immediate",   label: "Natychmiastowy" },
  { key: "debounce500", label: "Debounce 500ms" },
  { key: "batch5",      label: "Wsadowy (5 zmian)" },
];
