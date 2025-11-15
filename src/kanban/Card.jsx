// src/kanban/Card.jsx

import {
  CalendarDays,
  Star,
  GripVertical,
} from "lucide-react";
import {
  STATE_LABEL,
  STATE_BADGE,
} from "../state/config";

// =====================
// GŁÓWNY KOMPONENT
// =====================

export default function Card({
  task,
  onEdit,
  onDuplicate,
  onDelete,
  onChangeState,
  draggableProps,
}) {
  const badgeClassName =
    STATE_BADGE[task.status] ||
    "bg-slate-100 text-slate-700";

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value;
    onChangeState?.(task, nextStatus);
  };

  const handleEdit = () => onEdit(task);
  const handleDuplicate = () => onDuplicate(task);
  const handleDelete = () => onDelete(task);

  return (
    <div
      className="bg-white rounded-xl shadow p-3 border hover:shadow-md cursor-grab"
      {...draggableProps}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="opacity-40 shrink-0" />
        <div className="flex-1">
          <div className="font-medium">
            {task.title}
          </div>

          <div className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <CardTypeBadge task={task} />

            <StatusBadge
              status={task.status}
              badgeClassName={badgeClassName}
            />

            <StatusSelect
              value={task.status}
              onChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2 text-xs">
        <button
          onClick={handleEdit}
          className="px-2 py-1 rounded bg-slate-100"
        >
          Edytuj
        </button>
        <button
          onClick={handleDuplicate}
          className="px-2 py-1 rounded bg-slate-100"
        >
          Duplikuj
        </button>
        <button
          onClick={handleDelete}
          className="px-2 py-1 rounded bg-red-50 text-red-600"
        >
          Usuń
        </button>
      </div>
    </div>
  );
}

// =====================
// PODKOMPONENTY (TEN SAM POZIOM)
// =====================

function CardTypeBadge({ task }) {
  return (
    <>
      <span className="px-2 py-0.5 rounded-full bg-slate-100">
        {task.type}
      </span>

      {task.type === "priority" && (
        <span className="inline-flex items-center gap-1">
          <Star size={14} />
          P{task.meta?.priority}
        </span>
      )}

      {task.type === "deadline" && (
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={14} />
          {formatDeadline(task.meta?.due)}
        </span>
      )}

      {task.meta?.tags?.length ? (
        <span>
          #{task.meta.tags.join(", #")}
        </span>
      ) : null}
    </>
  );
}

function StatusBadge({ status, badgeClassName }) {
  const label =
    STATE_LABEL[status] || status;

  return (
    <span
      className={`px-2 py-0.5 rounded-full ${badgeClassName}`}
    >
      {label}
    </span>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      className="ml-2 border rounded-lg px-2 py-0.5 bg-white"
      value={value}
      onChange={onChange}
      title="Zmień status"
    >
      <option value="todo">To Do</option>
      <option value="in_progress">
        In Progress
      </option>
      <option value="blocked">
        Blocked
      </option>
      <option value="done">Done</option>
    </select>
  );
}

// =====================
// UTILS
// =====================

function formatDeadline(rawDate) {
  if (!rawDate) return "";
  const date = new Date(rawDate);
  return date.toLocaleString();
}
