// [PATTERN: Facade] — DEKLARACJA (opcjonalna)
class LocalStorageDriver {
  constructor(key = "factory-method-todos"){ this.key = key; }
  load(){ try { const raw = localStorage.getItem(this.key); return { ok:true, data: raw?JSON.parse(raw):[] }; } catch(e){ return { ok:false, error:e }; } }
  save(data){ try { localStorage.setItem(this.key, JSON.stringify(data)); return { ok:true }; } catch(e){ return { ok:false, error:e }; } }
}
class MemoryDriver { constructor(){ this.mem = []; } load(){ return { ok:true, data:this.mem }; } save(d){ this.mem = d; return { ok:true }; } }
export class PersistenceFacade {
  constructor({ driver } = {}){ this.driver = driver ?? new LocalStorageDriver(); }
  setDriver(d){ this.driver = d; }
  load(){ return this.driver.load(); }
  save(d){ return this.driver.save(d); }
}
export { LocalStorageDriver, MemoryDriver };