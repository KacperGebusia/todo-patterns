import { useMemo, useState } from "react";
import {
  PlusCircle, Star, CalendarDays, Trash2, CheckCircle2, Circle, ArrowUpDown,
  Copy, AlertCircle, Pencil, Save, X, Pin, PinOff, Database
} from "lucide-react";
import { useStore } from "./StoreContext";
import { cloneTask } from "./prototype";
import { togglePinned, addTags, removeTag, setTags } from "./decorators";

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
function Tag({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs">
      #{children}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 -mr-1 px-1 rounded hover:bg-slate-200">×</button>
      )}
    </span>
  );
}

export default function App() {
  const { tasks, todoStore, lastError, backend, ready } = useStore();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("simple");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));

  const [sortBy, setSortBy] = useState("createdAt");

  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState(2);
  const [editDue, setEditDue] = useState("");
  const [editTags, setEditTags] = useState("");

  const sorted = useMemo(() => {
    const arr = [...tasks];
    if (sortBy === "createdAt") arr.sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "type") arr.sort((a, b) => a.type.localeCompare(b.type));
    if (sortBy === "priority") arr.sort((a, b) => (b.meta?.priority ?? 0) - (a.meta?.priority ?? 0));
    if (sortBy === "due") arr.sort((a, b) => new Date(a.meta?.due ?? 0) - new Date(b.meta?.due ?? 0));
    const pinned = arr.filter(t => t.meta?.pinned);
    const rest = arr.filter(t => !t.meta?.pinned);
    return [...pinned, ...rest];
  }, [tasks, sortBy]);

  async function addTask(e) {
    e?.preventDefault?.();
    setError("");

    try {
      const baseProps = { title: title.trim() };
      if (!baseProps.title) throw new Error("Brak tytułu zadania.");
      if (kind === "priority") baseProps.priority = Number(priority);
      if (kind === "deadline") baseProps.due = new Date(due).toISOString();
      const task = TaskFactory.create(kind, baseProps);
      await todoStore.add(task);
      setTitle("");
    } catch (err) {
      setError(err.message || "Nie udało się dodać zadania.");
    }
  }

  const toggleTask = async (id) => { await todoStore.toggle(id); };
  const removeTask = async (id) => { await todoStore.remove(id); };

  const duplicateTask = async (id) => {
    const orig = tasks.find(t => t.id === id);
    if (!orig) return;
    const copy = cloneTask(orig);
    const instanceCopy = TaskFactory.fromJSON(copy);
    await todoStore.add(instanceCopy);
  };

  const togglePin = async (id) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const patched = { ...t, meta: { ...(t.meta || {}), pinned: !Boolean(t.meta?.pinned) } };
    await todoStore.update(id, patched);
  };

  const addTagQuick = async (id, tag) => {
    const t = tasks.find(x => x.id === id);
    if (!t || !tag.trim()) return;
    const next = addTags(t, [tag.trim()]);
    await todoStore.update(id, next);
  };
  const removeTagQuick = async (id, tag) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const next = removeTag(t, tag);
    await todoStore.update(id, next);
  };

  function startEdit(t) {
    setEditId(t.id);
    setEditTitle(t.title);
    setEditPriority(t.meta?.priority ?? 2);
    const iso = t.meta?.due ? new Date(t.meta.due).toISOString() : new Date().toISOString();
    setEditDue(iso.slice(0, 16));
    setEditTags((t.meta?.tags || []).join(", "));
  }
  function cancelEdit() {
    setEditId(null); setEditTitle(""); setEditPriority(2); setEditDue(""); setEditTags("");
  }
  const saveEdit = async (t) => {
    if (!editTitle.trim()) return;
    let patched = { ...t, title: editTitle.trim() };
    if (t.type === "priority") patched = { ...patched, meta: { ...(patched.meta || {}), priority: Number(editPriority) } };
    if (t.type === "deadline") patched = { ...patched, meta: { ...(patched.meta || {}), due: new Date(editDue).toISOString() } };
    patched = setTags(patched, editTags.split(",").map(s => s.trim()).filter(Boolean));
    if (!patched.meta.icon && t.meta?.icon) patched.meta.icon = t.meta.icon;
    await todoStore.update(t.id, patched);
    cancelEdit();
  };

  const changeBackend = async (e) => {
    await todoStore.setBackend(e.target.value);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Pasek statusu backendu + błędy */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-white">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Database size={16} />
          <span>Backend:</span>
          <select className="border rounded-lg px-2 py-1 text-sm" value={backend} onChange={changeBackend}>
            <option value="localStorage">localStorage</option>
            <option value="memory">memory</option>
            <option value="mockApi">mockApi</option>
          </select>
          {!ready && <span className="text-slate-400">(ładowanie...)</span>}
        </div>
        {lastError && (
          <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200">
            Błąd persystencji: {String(lastError.message || lastError)}
          </div>
        )}
      </div>

      <header className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Todo – Bridge</h1>
        <p className="text-slate-500 mt-1">
          Oddzielenie abstrakcji Storage od implementacji backendów (localStorage / memory / mockApi).
        </p>
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

        {/* Lista */}
        <ul className="mt-4 space-y-3">
          {sorted.map(t => {
            const isEditing = editId === t.id;
            const tags = t.meta?.tags || [];
            const isPinned = Boolean(t.meta?.pinned);

            return (
              <li key={t.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full border"
                  title={t.completed ? "Oznacz jako nieukończone" : "Oznacz jako ukończone"}
                >
                  {t.completed ? <CheckCircle2 /> : <Circle />}
                </button>

                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <div className={`font-medium ${t.completed ? "line-through text-slate-400" : ""}`}>
                        {t.title}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                        {isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            <Pin size={14} /> pinned
                          </span>
                        )}
                        {tags.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="md:col-span-2 border rounded-xl px-3 py-2"
                        placeholder="Tytuł zadania"
                      />
                      {t.type === "priority" && (
                        <input
                          type="number" min={1} max={5}
                          value={editPriority}
                          onChange={e => setEditPriority(e.target.value)}
                          className="border rounded-xl px-3 py-2"
                          placeholder="Priorytet 1-5"
                        />
                      )}
                      {t.type === "deadline" && (
                        <input
                          type="datetime-local"
                          value={editDue}
                          onChange={e => setEditDue(e.target.value)}
                          className="border rounded-xl px-3 py-2"
                        />
                      )}
                      <input
                        value={editTags}
                        onChange={e => setEditTags(e.target.value)}
                        className="md:col-span-2 border rounded-xl px-3 py-2"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  )}
                </div>

                {/* Pin toggle */}
                <button
                  onClick={() => togglePin(t.id)}
                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
                  title={isPinned ? "Odepnij" : "Przypnij"}
                >
                  {isPinned ? <Pin /> : <PinOff />}
                </button>

                {!isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        const tag = prompt("Dodaj tag (np. 'school'):");
                        if (tag) addTagQuick(t.id, tag);
                      }}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
                      title="Dodaj tag"
                    >
                      #
                    </button>

                    <button
                      onClick={() => duplicateTask(t.id)}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
                      title="Duplikuj"
                    >
                      <Copy />
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
                      title="Edytuj"
                    >
                      <Pencil />
                    </button>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
                      title="Usuń"
                    >
                      <Trash2 />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => saveEdit(t)}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-green-50"
                      title="Zapisz"
                    >
                      <Save />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100"
                      title="Anuluj"
                    >
                      <X />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {sorted.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            Lista jest pusta. Dodaj pierwsze zadanie powyżej.
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-10">
        Wzorzec: Bridge + Decorator + Prototype + Singleton + Factory + Edycja
      </footer>
    </div>
  );
}
