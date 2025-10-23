// [PATTERN: Memento] — DEKLARACJA
export class Memento { constructor(state, meta = {}) { this.state = JSON.parse(JSON.stringify(state)); this.meta = { ...meta, ts: Date.now() }; }
  getState() { return JSON.parse(JSON.stringify(this.state)); } }
