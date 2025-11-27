// src/kanban/Composer.jsx

import { useEffect, useRef, useState } from "react";
import { PlusCircle } from "lucide-react";
import { TaskFactory } from "../domain/factory";
import { TaskBuilder } from "../builder/TaskBuilder";
import { useStore } from "../store/StoreContext";
import { commandBus, CreateInCommand } from "../command";
import { uiBus } from "../mediator/UIBus";

const STATUSES = [
  { value: "todo",        label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked",     label: "Blocked" },
  { value: "done",        label: "Done" },
];

// magic numbers → stałe
const DEFAULT_PRIORITY = 2;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 5;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// =====================
// GŁÓWNY KOMPONENT
// =====================

export default function Composer() {
  const { todoStore } = useStore(); // zostawione dla spójności API

  const [title, setTitle] = useState("");
  const [type, setType] = useState("simple");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [due, setDue] = useState(getDefaultDueDateInputValue);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  useComposerFocus(inputRef);

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    setError("");

    try {
      const taskProps = buildTaskProps({
        title,
        type,
        status,
        priority,
        due,
      });

      const task = TaskFactory.create(type, taskProps);
      await saveNewTask(status, task);
      handleSubmitSuccess(setTitle);
    } catch (submitError) {
      handleSubmitError(submitError, setError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
    >
      <div className="md:col-span-2 flex items-center gap-2 border rounded-xl px-3">
        <PlusCircle />
        <input
          ref={inputRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Dodaj kartę..."
          className="w-full py-2 outline-none"
        />
      </div>

      <select
        value={type}
        onChange={(event) => setType(event.target.value)}
        className="border rounded-xl px-3 py-2"
      >
        <option value="simple">Simple</option>
        <option value="priority">Priority</option>
        <option value="deadline">Deadline</option>
      </select>

      {type === "priority" && (
        <input
          type="number"
          min={MIN_PRIORITY}
          max={MAX_PRIORITY}
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="border rounded-xl px-3 py-2"
          placeholder="Priorytet 1-5"
        />
      )}

      {type === "deadline" && (
        <input
          type="datetime-local"
          value={due}
          onChange={(event) => setDue(event.target.value)}
          className="border rounded-xl px-3 py-2"
        />
      )}

      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="border rounded-xl px-3 py-2"
      >
        {STATUSES.map((statusOption) => (
          <option key={statusOption.value} value={statusOption.value}>
            {statusOption.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-xl bg-slate-900 text-white px-4 py-2"
      >
        Dodaj
      </button>

      {error && (
        <div className="md:col-span-6 text-sm text-red-600">{error}</div>
      )}
    </form>
  );
}

// =====================
// HOOKI / POZIOM ŚREDNI
// =====================

function useComposerFocus(inputRef) {
  useEffect(() => {
    const handleFocusComposer = () => {
      inputRef.current?.focus();
    };

    const unsubscribe = uiBus.on("FOCUS_COMPOSER", handleFocusComposer);
    return unsubscribe;
  }, [inputRef]);
}

// =====================
// LOGIKA BIZNESOWA (BUILDER + COMMAND)
// =====================

function buildTaskProps(task) {
  const { title, type, status, priority, due } = task;

  const builder = new TaskBuilder()
    .title(title)
    .type(type)
    .status(status);

  if (type === "priority") {
    builder.priority(priority);
  }

  if (type === "deadline") {
    builder.due(due);
  }

  return builder.build();
}

async function saveNewTask(status, task) {
  await commandBus.execute(new CreateInCommand(status, task));
}

function handleSubmitSuccess(setTitle) {
  setTitle("");
  uiBus.emit("TOAST", {
    type: "success",
    message: "Dodano kartę",
  });
}

function handleSubmitError(error, setError) {
  const message = error?.message || "Nie udało się dodać zadania.";
  setError(message);

  uiBus.emit("TOAST", {
    type: "error",
    message: "Błąd dodawania",
  });
}

// =====================
// UTILS (NAJNIŻSZY POZIOM)
// =====================

function getDefaultDueDateInputValue() {
  const tomorrow = Date.now() + ONE_DAY_MS;
  return new Date(tomorrow).toISOString().slice(0, 16);
}
