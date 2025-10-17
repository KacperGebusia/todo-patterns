// Facade - deklaracja

class LocalStorageDriver {
  constructor(key = "todos") {
    this.key = key;
  }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      const data = raw ? JSON.parse(raw) : [];
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}

class MemoryDriver {
  constructor() {
    this.mem = [];
  }
  load() {
    return { ok: true, data: this.mem };
  }
  save(data) {
    this.mem = data;
    return { ok: true };
  }
}

export class PersistenceFacade {
  constructor({ driver } = {}) {
    this.driver = driver ?? new LocalStorageDriver("factory-method-todos");
  }
  setDriver(driver) {
    this.driver = driver;
  }
  load() {
    return this.driver.load();
  }
  save(data) {
    return this.driver.save(data);
  }
}

export { LocalStorageDriver, MemoryDriver };
