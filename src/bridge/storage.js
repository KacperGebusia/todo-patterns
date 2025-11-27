// src/bridge/storage.js
// [PATTERN: Bridge] — abstrakcja Storage + różne backendy persystencji

// ===== ABSTRAKCJA =====

export class Storage {
  save(_tasks) {
    throw new Error("Storage.save not implemented");
  }

  load() {
    throw new Error("Storage.load not implemented");
  }

  name() {
    return "abstract";
  }
}

// ===== BACKEND: localStorage =====

function safeStringify(value) {
  return JSON.stringify(value);
}

function safeParse(json) {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export class LocalStorageBackend extends Storage {
  constructor(key = "factory-method-todos") {
    super();
    this.storageKey = key;
  }

  save(tasks) {
    const data = safeStringify(tasks);
    localStorage.setItem(this.storageKey, data);
    return { ok: true };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const data = safeParse(raw);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }

  name() {
    return "localStorage";
  }
}

// ===== BACKEND: pamięć RAM =====

export class MemoryBackend extends Storage {
  constructor(seed = []) {
    super();
    this.memory = Array.isArray(seed) ? seed : [];
  }

  save(tasks) {
    this.memory = Array.isArray(tasks) ? tasks : [];
    return { ok: true };
  }

  load() {
    return { ok: true, data: this.memory };
  }

  name() {
    return "memory";
  }
}

// ===== BACKEND: mock API (asynchroniczny) =====

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockApiBackend extends Storage {
  constructor({ delay: delayMs = 250 } = {}) {
    super();
    this.delayMs = delayMs;
    this.database = [];
  }

  async save(tasks) {
    await delay(this.delayMs);
    this.database = deepClone(tasks);
    return { ok: true };
  }

  async load() {
    await delay(this.delayMs);
    return { ok: true, data: deepClone(this.database) };
  }

  name() {
    return "mockApi";
  }
}

// ===== BRIDGE =====

export class StorageBridge {
  constructor(backend) {
    this.backend = backend;
  }

  setBackend(backend) {
    this.backend = backend;
  }

  async save(tasks) {
    return this.backend.save(tasks);
  }

  async load() {
    return this.backend.load();
  }

  name() {
    return this.backend?.name?.() ?? "unknown";
  }
}
