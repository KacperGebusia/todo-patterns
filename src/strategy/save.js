// src/strategy/save.js
// [PATTERN: Strategy] — strategie zapisu do persystencji

function deepCopy(x){
  return (typeof structuredClone === "function")
    ? structuredClone(x)
    : JSON.parse(JSON.stringify(x));
}

class ImmediateSaveStrategy {
  name(){ return "immediate"; }
  async save(state, bridge){
    return await bridge.save(state);
  }
  async dispose() {}
}

class DebouncedSaveStrategy {
  constructor(ms=500){
    this.ms = ms;
    this._timer = null;
    this._pending = null; // { state, bridge }
  }
  name(){ return "debounce500"; }
  async save(state, bridge){
    // zapamiętaj ostatni stan; zapisz po bezczynności ms
    this._pending = { state: deepCopy(state), bridge };
    clearTimeout(this._timer);
    return await new Promise(resolve => {
      this._timer = setTimeout(async () => {
        const p = this._pending;
        this._pending = null;
        if (p) await p.bridge.save(p.state);
        resolve({ ok: true });
      }, this.ms);
    });
  }
  async dispose(){
    if (this._timer){
      clearTimeout(this._timer);
      this._timer = null;
      if (this._pending){
        const p = this._pending;
        this._pending = null;
        await p.bridge.save(p.state); // flush
      }
    }
  }
}

class BatchSaveStrategy {
  constructor(n=5, timeout=1500){
    this.n = n;
    this.timeout = timeout;
    this._counter = 0;
    this._timer = null;
    this._last = null; // { state, bridge }
  }
  name(){ return "batch5"; }
  async save(state, bridge){
    this._counter++;
    this._last = { state: deepCopy(state), bridge };

    // próg „n” — zapis natychmiast
    if (this._counter >= this.n){
      this._counter = 0;
      clearTimeout(this._timer); this._timer = null;
      return await bridge.save(this._last.state);
    }

    // inaczej — arm timer
    clearTimeout(this._timer);
    this._timer = setTimeout(async () => {
      this._counter = 0;
      if (this._last) await this._last.bridge.save(this._last.state);
    }, this.timeout);

    return { ok: true };
  }
  async dispose(){
    clearTimeout(this._timer); this._timer = null;
    if (this._last){ await this._last.bridge.save(this._last.state); }
    this._counter = 0;
  }
}

export function createSaveStrategy(kind){
  switch (kind) {
    case "debounce500": return new DebouncedSaveStrategy(500);
    case "batch5":      return new BatchSaveStrategy(5, 1500);
    case "immediate":
    default:            return new ImmediateSaveStrategy();
  }
}

export const SAVE_STRATEGY_OPTIONS = [
  { key: "immediate",   label: "Natychmiastowy" },
  { key: "debounce500", label: "Debounce 500ms" },
  { key: "batch5",      label: "Wsadowy (5 zmian)" },
];
