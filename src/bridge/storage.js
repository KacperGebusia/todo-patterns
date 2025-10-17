export class Storage {
  // interfejs
  save(_tasks) { throw new Error("Not implemented"); }
  load() { throw new Error("Not implemented"); }
  name() { return "abstract"; }
}

export class LocalStorageBackend extends Storage {
  constructor(key = "factory-method-todos") {
    super();
    this.key = key;
  }
  save(tasks) {
    localStorage.setItem(this.key, JSON.stringify(tasks));
    return { ok: true };
  }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return { ok: true, data: raw ? JSON.parse(raw) : [] };
    } catch (e) {
      return { ok: false, error: e };
    }
  }
  name() { return "localStorage"; }
}

export class MemoryBackend extends Storage {
  constructor(seed = []) {
    super();
    this.mem = Array.isArray(seed) ? seed : [];
  }
  save(tasks) { this.mem = tasks; return { ok: true }; }
  load() { return { ok: true, data: this.mem }; }
  name() { return "memory"; }
}

export class MockApiBackend extends Storage {
  constructor({ delay = 250 } = {}) {
    super();
    this.delay = delay;
    this._db = []; 
  }
  async save(tasks) {
    await new Promise(r => setTimeout(r, this.delay));
    this._db = JSON.parse(JSON.stringify(tasks));
    return { ok: true };
  }
  async load() {
    await new Promise(r => setTimeout(r, this.delay));
    return { ok: true, data: JSON.parse(JSON.stringify(this._db)) };
  }
  name() { return "mockApi"; }
}

export class StorageBridge {
  constructor(backend) {
    this.backend = backend;
  }
  setBackend(backend) {
    this.backend = backend;
  }
  async save(tasks) {
    return await this.backend.save(tasks);
  }
  async load() {
    return await this.backend.load();
  }
  name() {
    return this.backend?.name?.() ?? "unknown";
  }
}
