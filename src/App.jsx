import { useMemo, useState } from "react";
import { PlusCircle, Star, CalendarDays, Trash2, CheckCircle2, Circle, ArrowUpDown, AlertCircle } from "lucide-react";
import { useStore } from "./StoreContext";
import { TaskBuilder } from "./taskBuilder";

class Task {
  constructor(p) {
    this.id = p.id ?? crypto.randomUUID();
    this.title = p.title ?? "Untitled";
    this.completed = Boolean(p.completed);
    this.meta = p.meta || {};
    this.type = p.type || "simple";
    this.createdAt = p.createdAt ?? Date.now();
  }
  toggle() { this.completed = !this.completed; }
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      type: this.type,
      meta: this.meta,
    };
  }
}
class SimpleTask extends Task {
  constructor(p) { super({ ...p, type: "simple", meta: { icon: "circle", ...(p.meta||{}) } }); }
}
class PriorityTask extends Task {
  constructor(p) { super({ ...p, type: "priority", meta: { icon: "star", priority: p.meta?.priority ?? p.priority ?? 1 } }); }
}
class DeadlineTask extends Task {
  constructor(p) { super({ ...p, type: "deadline", meta: { icon: "calendar", due: p.meta?.due ?? p.due ?? new Date().toISOString() } }); }
}
class TaskFactory {
  static create(kind, props = {}) {
    switch (kind) {
      case "priority": return new PriorityTask(props);
      case "deadline": return new DeadlineTask(props);
      default: return new SimpleTask(props);
    }
  }
  static fromJSON(json) { return TaskFactory.create(json.type, json); }
}

function TypeBadge({ type }) {
  const map = {
    simple: { label: "Simple", icon: Circle },
    priority: { label: "Priority", icon: Star },
    deadline: { label: "Deadline", icon: CalendarDays },
  };
  const Cmp = map[type]?.icon || Circle;
  const label = map[type]?.label || type;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100">
      <Cmp size={14} /> {label}
    </span>
  );
}
function IconByName({ name, size = 18 }) {
  const icons = { circle: Circle, star: Star, calendar: CalendarDays };
  const Cmp = icons[name] || Circle;
  return <Cmp size={size} />;
}

export default function App() {
  const { tasks, todoStore } = useStore();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("simple");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [sortBy, setSortBy] = useState("createdAt");
  const [error, setError] = useState("");

  const sorted = useMemo(() => {
    const arr = [...tasks];
    if (sortBy === "createdAt") arr.sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "type") arr.sort((a, b) => a.type.localeCompare(b.type));
    if (sortBy === "priority") arr.sort((a, b) => (b.meta?.priority ?? 0) - (a.meta?.priority ?? 0));
    if (sortBy === "due") arr.sort((a, b) => new Date(a.meta?.due ?? 0) - new Date(b.meta?.due ?? 0));
    return arr;
  }, [tasks, sortBy]);

  function addTask(e) {
    e?.preventDefault?.();
    setError("");
    try {
      const builder = new TaskBuilder()
        .title(title)
        .type(kind);

      if (kind === "priority") builder.priority(priority);
      if (kind === "deadline") builder.due(due);

      const props = builder.build(); 
      const task = TaskFactory.create(kind, props);
      todoStore.add(task);
      setTitle("");
    } catch (err) {
      setError(err.message || "Nie udało się dodać zadania.");
    }
  }

  function toggleTask(id) { todoStore.toggle(id); }
  function removeTask(id) { todoStore.remove(id); }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Todo – Builder</h1>
        <p className="text-slate-500 mt-1">Tworzenie zadań krokami (Builder) + Singleton Store + Factory Method.</p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* Composer */}
        <form onSubmit={addTask} className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 border rounded-xl px-3">
            <PlusCircle />
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Dodaj zadanie..."
              className="w-full py-2 outline-none"
            />
          </div>

          <select value={kind} onChange={e => setKind(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="simple">Simple</option>
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
          </select>

          {kind === "priority" && (
            <input
              type="number"
              min={1}
              max={5}
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="border rounded-xl px-3 py-2"
              placeholder="Priorytet 1-5"
            />
          )}

          {kind === "deadline" && (
            <input
              type="datetime-local"
              value={due}
              onChange={e => setDue(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          )}

          <button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2">Dodaj</button>
        </form>

        {error && (
          <div className="mt-3 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-500">{tasks.length} zadań</div>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border rounded-xl px-2 py-1 text-sm"
            >
              <option value="createdAt">Najnowsze</option>
              <option value="title">Tytuł</option>
              <option value="type">Typ</option>
              <option value="priority">Priorytet</option>
              <option value="due">Termin</option>
            </select>
          </div>
        </div>

        {/* List */}
        <ul className="mt-4 space-y-3">
          {sorted.map(t => (
            <li key={t.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
              <button
                onClick={() => toggleTask(t.id)}
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full border"
              >
                {t.completed ? <CheckCircle2 /> : <Circle />}
              </button>
              <div className="flex-1">
                <div className={`font-medium ${t.completed ? "line-through text-slate-400" : ""}`}>{t.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <TypeBadge type={t.type} />
                  {t.type === "priority" && (
                    <span className="inline-flex items-center gap-1"><Star size={14} />P{t.meta?.priority}</span>
                  )}
                  {t.type === "deadline" && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={14} />
                      {new Date(t.meta?.due).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 opacity-70">
                <IconByName name={t.meta?.icon} />
              </div>
              <button
                onClick={() => removeTask(t.id)}
                className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
              >
                <Trash2 />
              </button>
            </li>
          ))}
        </ul>

        {sorted.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            Lista jest pusta. Dodaj pierwsze zadanie powyżej.
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-10">
        Wzorzec: Builder + Singleton Store + Factory Method
      </footer>
    </div>
  );
}
