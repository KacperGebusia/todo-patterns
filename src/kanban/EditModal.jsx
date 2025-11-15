// src/kanban/EditModal.jsx

import { useEffect, useState } from "react";
import { X, Save, Star, CalendarDays } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { setTags } from "../decorators";
import { uiBus } from "../mediator/UIBus";

const STATUSES = [
  { value: "todo",        label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked",     label: "Blocked" },
  { value: "done",        label: "Done" },
];

// =====================
// GŁÓWNY KOMPONENT
// =====================

export default function EditModal() {
  const { todoStore } = useStore();
  const controller = useEditModalController(todoStore);

  if (!controller.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-4">
        <Header onClose={controller.close} />

        <FormFields
          title={controller.title}
          setTitle={controller.setTitle}
          type={controller.type}
          setType={controller.setType}
          status={controller.status}
          setStatus={controller.setStatus}
          priority={controller.priority}
          setPriority={controller.setPriority}
          due={controller.due}
          setDue={controller.setDue}
          tags={controller.tags}
          setTags={controller.setTags}
        />

        <Footer
          onSave={controller.save}
          onCancel={controller.close}
        />
      </div>
    </div>
  );
}

// =====================
// PODKOMPONENTY UI (TEN SAM POZIOM)
// =====================

function Header({ onClose }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">
        Edytuj kartę
      </h2>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-xl hover:bg-slate-100 inline-flex items-center justify-center"
        title="Zamknij"
      >
        <X />
      </button>
    </div>
  );
}

function FormFields({
  title,
  setTitle,
  type,
  setType,
  status,
  setStatus,
  priority,
  setPriority,
  due,
  setDue,
  tags,
  setTags,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="text-xs text-slate-500">
          Tytuł
        </label>
        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Tytuł karty"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500">
          Typ
        </label>
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
          className="w-full border rounded-xl px-3 py-2"
        >
          <option value="simple">Simple</option>
          <option value="priority">Priority</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-slate-500">
          Status
        </label>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="w-full border rounded-xl px-3 py-2"
        >
          {STATUSES.map((statusOption) => (
            <option
              key={statusOption.value}
              value={statusOption.value}
            >
              {statusOption.label}
            </option>
          ))}
        </select>
      </div>

      {type === "priority" && (
        <PriorityField
          priority={priority}
          setPriority={setPriority}
        />
      )}

      {type === "deadline" && (
        <DeadlineField
          due={due}
          setDue={setDue}
        />
      )}

      <TagsField
        tags={tags}
        setTags={setTags}
      />
    </div>
  );
}

function PriorityField({ priority, setPriority }) {
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
          setPriority(event.target.value)
        }
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  );
}

function DeadlineField({ due, setDue }) {
  return (
    <div>
      <label className="text-xs text-slate-500 inline-flex items-center gap-1">
        <CalendarDays size={14} /> Termin
      </label>
      <input
        type="datetime-local"
        value={due}
        onChange={(event) =>
          setDue(event.target.value)
        }
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  );
}

function TagsField({ tags, setTags }) {
  return (
    <div className="md:col-span-2">
      <label className="text-xs text-slate-500">
        Tagi (CSV)
      </label>
      <input
        value={tags}
        onChange={(event) =>
          setTags(event.target.value)
        }
        className="w-full border rounded-xl px-3 py-2"
        placeholder="tag1, tag2, tag3"
      />
    </div>
  );
}

function Footer({ onSave, onCancel }) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        onClick={onSave}
        className="rounded-xl bg-slate-900 text-white px-4 py-2 inline-flex items-center gap-2"
      >
        <Save size={16} /> Zapisz
      </button>
      <button
        onClick={onCancel}
        className="rounded-xl bg-slate-100 px-4 py-2"
      >
        Anuluj
      </button>
    </div>
  );
}

// =====================
// HOOK KONTROLUJĄCY MODAL
// =====================

function useEditModalController(todoStore) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("simple");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState("");
  const [tags, setTagsCsv] = useState("");

  useEffect(() => {
    const handleOpen = ({ task }) => {
      if (!task) return;
      const initialState =
        createInitialFormState(task);

      setTask(task);
      setTitle(initialState.title);
      setType(initialState.type);
      setStatus(initialState.status);
      setPriority(initialState.priority);
      setDue(initialState.due);
      setTagsCsv(initialState.tagsCsv);
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const offOpen = uiBus.on(
      "OPEN_EDIT",
      handleOpen
    );
    const offClose = uiBus.on(
      "CLOSE_EDIT",
      handleClose
    );

    return () => {
      offOpen();
      offClose();
    };
  }, []);

  const save = async () => {
    if (!task) return;

    const formState = {
      title,
      type,
      status,
      priority,
      due,
      tags,
    };

    const patched = buildUpdatedTask(
      task,
      formState
    );

    await todoStore.update(task.id, patched);

    uiBus.emit("TOAST", {
      type: "success",
      message: "Zapisano zmiany",
    });

    setOpen(false);
  };

  const close = () => {
    setOpen(false);
  };

  return {
    open,
    title,
    setTitle,
    type,
    setType,
    status,
    setStatus,
    priority,
    setPriority,
    due,
    setDue,
    tags,
    setTags: setTagsCsv,
    save,
    close,
  };
}

// =====================
// LOGIKA BIZNESOWA / UTILS
// =====================

function createInitialFormState(task) {
  const safeTask = task || {};
  const safeMeta = safeTask.meta || {};

  const title = safeTask.title || "";
  const type = safeTask.type || "simple";
  const status = safeTask.status || "todo";
  const priority =
    safeMeta.priority ?? 2;

  const dueInput = getInitialDueInputValue(
    safeMeta.due
  );
  const tagsCsv = (safeMeta.tags || []).join(
    ", "
  );

  return {
    title,
    type,
    status,
    priority,
    due: dueInput,
    tagsCsv,
  };
}

function getInitialDueInputValue(rawDue) {
  const baseDate = rawDue
    ? new Date(rawDue)
    : new Date();
  return baseDate.toISOString().slice(0, 16);
}

function parseTagsCsvToArray(csv) {
  if (!csv) return [];
  return csv
    .split(",")
    .map((piece) => piece.trim())
    .filter(Boolean);
}

function buildUpdatedTask(task, formState) {
  const {
    title,
    type,
    status,
    priority,
    due,
    tags,
  } = formState;

  const tagsArray = parseTagsCsvToArray(tags);

  let patched = {
    ...task,
    title: title.trim() || task.title,
    type,
    status,
    meta: {
      ...(task.meta || {}),
    },
  };

  if (type === "priority") {
    patched.meta.priority = Number(priority);
  }

  if (type === "deadline") {
    patched.meta.due = new Date(due).toISOString();
  }

  patched = setTags(patched, tagsArray);

  if (!patched.meta.icon && task.meta?.icon) {
    patched.meta.icon = task.meta.icon;
  }

  return patched;
}
