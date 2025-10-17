export class TaskBuilder {
  constructor(){
    this.reset();
  }
  reset(){
    this._title = "";
    this._type = "simple";
    this._meta = {};     // priority / due
    this._completed = false;
    return this;
  }
  title(v){
    this._title = String(v ?? "").trim();
    return this;
  }
  type(v){
    this._type = v || "simple";
    return this;
  }
  priority(p){
    this._meta.priority = Number(p ?? 1);
    return this;
  }
  due(dateTimeLocal){
    const iso = new Date(dateTimeLocal).toISOString();
    this._meta.due = iso;
    return this;
  }
  completed(flag){
    this._completed = Boolean(flag);
    return this;
  }
  build(){
    // Walidacje
    if (!this._title) throw new Error("Brak tytułu zadania.");
    if (this._type === "priority" && (!this._meta.priority || Number.isNaN(this._meta.priority))) {
      throw new Error("Nieprawidłowy priorytet (1–5).");
    }
    if (this._type === "deadline" && !this._meta.due) {
      throw new Error("Brak terminu dla zadania z deadlinem.");
    }

    const props = {
      title: this._title,
      completed: this._completed,
      type: this._type,
      meta: { ...this._meta }
    };
    return props;
  }
}
