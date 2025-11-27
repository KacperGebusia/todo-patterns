// [PATTERN: Facade] — uproszczony dostęp do systemów persystencji

// --- Backendy persystencji (jedna odpowiedzialność każdy) ---

class LocalStorageDriver {
  constructor(storageKey = "factory-method-todos") {
    this.storageKey = storageKey;
  }

  loadData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return { ok: true, data: parsed };
    } catch (error) {
      return { ok: false, error };
    }
  }

  saveData(data) {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.storageKey, json);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}

class MemoryDriver {
  constructor() {
    this.memoryStore = [];
  }

  loadData() {
    return { ok: true, data: this.memoryStore };
  }

  saveData(data) {
    this.memoryStore = data;
    return { ok: true };
  }
}


// --- FACADE: ujednolicone API dla aplikacji ---

export class PersistenceFacade {
  constructor({ driver } = {}) {
    this.backendDriver = driver ?? new LocalStorageDriver();
  }

  setDriver(driver) {
    this.backendDriver = driver;
  }

  load() {
    return this.backendDriver.loadData();
  }

  save(data) {
    return this.backendDriver.saveData(data);
  }
}

export { LocalStorageDriver, MemoryDriver };
