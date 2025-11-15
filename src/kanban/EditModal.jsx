// src/kanban/EditModal.jsx
import { useEffect, useState } from "react";
import { X, Save, Star, CalendarDays } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { setTags } from "../decorators";
import { uiBus } from "../mediator/UIBus";

const STATUSES = [
  { value: "todo", valueLabel: "To Do" },
  { value: "in_progress", valueLabel: "In Progress" },
  { value: "blocked", valueLabel: "Blocked" },
  { value: "done", valueLabel: "Done" },
];

function toIsoLocalOrNow(dateValue) {
  const baseDate = dateValue
    ? new Date(dateValue)
    : new Date();
  return baseDate.toISOString().slice(0, 16);
}

function parseTagsCsv(tagsCsv) {
  return tagsCsv
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildPatchedTask(task, formState) {
  const {
    title,
    type,
    status,
    priority,
    due,
    tagsArray,
  } = formState;

  const baseMeta = { ...(task.meta || {}) };
  const patchedTask = {
    ...task,
    title: title.trim() || task.title,
    type,
    status,
    meta: baseMeta,
  };

  if (type === "priority") {
    patchedTask.meta.priority = Number(priority);
  }

  if (type === "deadline") {
    patchedTask.meta.due = new Date(due).toISOString();
  }

  let patchedWithTags = setTags(patchedTask, tagsArray);

  if (!patchedWithTags.meta.icon && task.meta?.icon) {
    patchedWithTags.meta.icon = task.meta.icon;
  }

  return patchedWithTags;
}

function showSaveSuccessToast() {
  uiBus.emit("TOAST", {
    type: "success",
    message: "Zapisano zmiany",
  });
}

function StatusSelect({ status, onChange }) {
  return (
    <select
      value={status}
      onChange={(event) => onChange(event.target.value)}
      className="w-full border rounded-xl px-3 py-2"
    >
      {STATUSES.map((statusOption) => (
        <option
          key={statusOption.value}
          value={statusOption.value}
        >
          {statusOption.valueLabel}
        </option>
      ))}
    </select>
  );
}

function TypeSelect({ type, onChange }) {
  return (
    <select
      value={type}
      onChange={(event) => onChange(event.target.value)}
      className="w-full border rounded-xl px-3 py-2"
    >
      <option value="simple">Simple</option>
      <option value="priority">Priority</option>
      <option value="deadline">Deadline</option>
    </select>
  );
}

function PriorityField({ priority, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-500 inline-flex items-center gap-1">
        <Star size={14} /> Priorytet (1–5)
      </label>
      <input
        type="number"
        min={1}
        max={5}
        value={priority}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  );
}

function DeadlineField({ due, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-500 inline-flex items-center gap-1">
        <CalendarDays size={14} /> Termin
      </label>
      <input
        type="datetime-local"
        value={due}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  );
}

function TagsField({ tags, onChange }) {
  return (
    <div className="md:col-span-2">
      <label className="text-xs text-slate-500">
        Tagi (CSV)
      </label>
      <input
        value={tags}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border rounded-xl px-3 py-2"
        placeholder="tag1, tag2, tag3"
      />
    </div>
  );
}

function TitleField({ title, onChange }) {
  return (
    <div className="md:col-span-2">
      <label className="text-xs text-slate-500">
        Tytuł
      </label>
      <input
        value={title}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border rounded-xl px-3 py-2"
        placeholder="Tytuł karty"
      />
    </div>
  );
}

export default function EditModal() {
  const { todoStore } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("simple");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState("");
  const [tagsCsv, setTagsCsvState] = useState("");

  useEffect(() => {
    function handleOpenEdit({ task }) {
      if (!task) return;
      setTask(task);
      setTitle(task.title);
      setType(task.type);
      setStatus(task.status ?? "todo");
      setPriority(task.meta?.priority ?? 2);
      setDue(
        toIsoLocalOrNow(task.meta?.due)
      );
      setTagsCsvState(
        (task.meta?.tags || []).join(", ")
      );
      setIsOpen(true);
    }

    function handleCloseEdit() {
      setIsOpen(false);
    }

    const unsubscribeOpen = uiBus.on(
      "OPEN_EDIT",
      handleOpenEdit
    );
    const unsubscribeClose = uiBus.on(
      "CLOSE_EDIT",
      handleCloseEdit
    );

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, []);

  async function handleSave() {
    if (!task) return;

    const tagsArray = parseTagsCsv(tagsCsv);

    const patchedTask = buildPatchedTask(task, {
      title,
      type,
      status,
      priority,
      due,
      tagsArray,
    });

    await todoStore.update(task.id, patchedTask);
    showSaveSuccessToast();
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Edytuj kartę
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 inline-flex items-center justify-center"
            title="Zamknij"
          >
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TitleField
            title={title}
            onChange={setTitle}
          />

          <div>
            <label className="text-xs text-slate-500">
              Typ
            </label>
            <TypeSelect
              type={type}
              onChange={setType}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500">
              Status
            </label>
            <StatusSelect
              status={status}
              onChange={setStatus}
            />
          </div>

          {type === "priority" && (
            <PriorityField
              priority={priority}
              onChange={setPriority}
            />
          )}

          {type === "deadline" && (
            <DeadlineField
              due={due}
              onChange={setDue}
            />
          )}

          <TagsField
            tags={tagsCsv}
            onChange={setTagsCsvState}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 inline-flex items-center gap-2"
          >
            <Save size={16} /> Zapisz
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl bg-slate-100 px-4 py-2"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
