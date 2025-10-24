// Modal edycji
// [PATTERN: Decorator] • [Command]
import { useEffect, useState } from "react";
import { X, Save, Star, CalendarDays } from "lucide-react";
import { setTags } from "../decorators";
import { commandBus } from "../command";
import { UpdateTaskCommand } from "../command/commands/UpdateTaskCommand";
const STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];
export default function EditModal({ task, onClose }) {
  const open = Boolean(task);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("simple");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState("");
  const [tags, setTagsCsv] = useState("");
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setType(task.type);
    setStatus(task.status ?? "todo");
    setPriority(task.meta?.priority ?? 2);
    const iso = task.meta?.due
      ? new Date(task.meta.due).toISOString()
      : new Date().toISOString();
    setDue(iso.slice(0, 16));
    setTagsCsv((task.meta?.tags || []).join(", "));
  }, [task]);
  async function onSave() {
    if (!task) return;
    const tagsArray = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    let patched = {
      ...task,
      title: title.trim() || task.title,
      type,
      status,
      meta: { ...(task.meta || {}) },
    };
    if (type === "priority") patched.meta.priority = Number(priority);
    if (type === "deadline") patched.meta.due = new Date(due).toISOString();
    patched = setTags(patched, tagsArray);
    if (!patched.meta.icon && task.meta?.icon)
      patched.meta.icon = task.meta.icon;
    await commandBus.execute(new UpdateTaskCommand(task.id, patched));
    onClose?.();
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Edytuj kartę</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 inline-flex items-center justify-center"
            title="Zamknij"
          >
            <X />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500">Tytuł</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Tytuł karty"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Typ</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="simple">Simple</option>
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {type === "priority" && (
            <div>
              <label className="text-xs text-slate-500 inline-flex items-center gap-1">
                <Star size={14} /> Priorytet (1–5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              />
            </div>
          )}
          {type === "deadline" && (
            <div>
              <label className="text-xs text-slate-500 inline-flex items-center gap-1">
                <CalendarDays size={14} /> Termin
              </label>
              <input
                type="datetime-local"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500">Tagi (CSV)</label>
            <input
              value={tags}
              onChange={(e) => setTagsCsv(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onSave}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 inline-flex items-center gap-2"
          >
            Zapisz
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
