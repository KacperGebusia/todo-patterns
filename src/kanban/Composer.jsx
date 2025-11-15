// src/kanban/Composer.jsx
import { useEffect, useRef, useState } from "react";
import { PlusCircle } from "lucide-react";
import { TaskFactory } from "../domain/factory";
import { TaskBuilder } from "../builder/TaskBuilder";
import { commandBus, CreateInCommand } from "../command";
import { uiBus } from "../mediator/UIBus";

const STATUSES = [
  { value: "todo", valueLabel: "To Do" },
  { value: "in_progress", valueLabel: "In Progress" },
  { value: "blocked", valueLabel: "Blocked" },
  { value: "done", valueLabel: "Done" },
];

function createDefaultDueIso() {
  const oneDayMs = 24 * 3600 * 1000;
  return new Date(Date.now() + oneDayMs).toISOString().slice(0, 16);
}

function buildTaskFromForm({ title, type, status, priority, due }) {
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

  const properties = builder.build();
  return TaskFactory.create(type, properties);
}

function showSuccessToast() {
  uiBus.emit("TOAST", {
    type: "success",
    message: "Dodano kartę",
  });
}

function showErrorToast() {
  uiBus.emit("TOAST", {
    type: "error",
    message: "Błąd dodawania",
  });
}

export default function Composer() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("simple");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState(createDefaultDueIso);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = uiBus.on("FOCUS_COMPOSER", () => {
      inputRef.current?.focus();
    });
    return unsubscribe;
  }, []);

  function resetForm() {
    setTitle("");
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();
    setErrorMessage("");

    try {
      const task = buildTaskFromForm({
        title,
        type,
        status,
        priority,
        due,
      });

      await commandBus.execute(
        new CreateInCommand(status, task)
      );

      resetForm();
      showSuccessToast();
    } catch (error) {
      const humanError =
        error?.message || "Nie udało się dodać zadania.";
      setErrorMessage(humanError);
      showErrorToast();
    }
  }

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
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="Dodaj kartę..."
          className="w-full py-2 outline-none"
        />
      </div>

      <select
        value={type}
        onChange={(event) =>
          setType(event.target.value)
        }
        className="border rounded-xl px-3 py-2"
      >
        <option value="simple">Simple</option>
        <option value="priority">Priority</option>
        <option value="deadline">Deadline</option>
      </select>

      {type === "priority" && (
        <input
          type="number"
          min={1}
          max={5}
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value)
          }
          className="border rounded-xl px-3 py-2"
          placeholder="Priorytet 1-5"
        />
      )}

      {type === "deadline" && (
        <input
          type="datetime-local"
          value={due}
          onChange={(event) =>
            setDue(event.target.value)
          }
          className="border rounded-xl px-3 py-2"
        />
      )}

      <select
        value={status}
        onChange={(event) =>
          setStatus(event.target.value)
        }
        className="border rounded-xl px-3 py-2"
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

      <button
        type="submit"
        className="rounded-xl bg-slate-900 text-white px-4 py-2"
      >
        Dodaj
      </button>

      {errorMessage && (
        <div className="md:col-span-6 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
    </form>
  );
}
