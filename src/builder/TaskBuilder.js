// [PATTERN: Builder] — DEKLARACJA
export class TaskBuilder {
  constructor(){ this.reset(); }
  reset(){ this._title=""; this._type="simple"; this._meta={}; this._completed=false; this._status="todo"; return this; }
  title(v){ this._title = String(v ?? "").trim(); return this; }
  type(v){ this._type = v || "simple"; return this; }
  priority(p){ this._meta.priority = Number(p ?? 1); return this; }
  due(dtLocal){ this._meta.due = new Date(dtLocal).toISOString(); return this; }
  status(s){ this._status = s || "todo"; return this; }
  completed(flag){ this._completed = Boolean(flag); return this; }
  build(){
    if (!this._title) throw new Error("Brak tytułu zadania.");
    return { title: this._title, completed: this._completed, type: this._type, status: this._status, meta: { ...this._meta } };
  }
}
