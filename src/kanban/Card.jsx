// src/kanban/Card.jsx

import { CalendarDays, Star, GripVertical } from "lucide-react";
import { STATE_LABEL, STATE_BADGE } from "../state/config";

function getStatusBadgeClass(taskStatus) {
  return (
    STATE_BADGE[taskStatus] || "bg-slate-100 text-slate-700"
  );
}

function renderPriority(task) {
  if (task.type !== "priority") return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Star size={14} />
      P{task.meta?.priority}
    </span>
  );
}

function renderDeadline(task) {
  if (task.type !== "deadline") return null;
  const rawDate = task.meta?.due;
  if (!rawDate) return null;
  const formatted = new Date(rawDate).toLocaleString();
  return (
    <span className="inline-flex items-center gap-1">
      <CalendarDays size={14} />
      {formatted}
    </span>
  );
}

function renderTags(task) {
  const tags = task.meta?.tags || [];
  if (!tags.length) return null;
  return <span>#{tags.join(", #")}</span>;
}

function StatusSelect({ task, onChangeState }) {
  const label = STATE_LABEL[task.status] || task.status;
  const badgeClass = getStatusBadgeClass(task.status);

  return (
    <>
      <span
        className={`px-2 py-0.5 rounded-full ${badgeClass}`}
      >
        {label}
      </span>
      <select
        className="ml-2 border rounded-lg px-2 py-0.5 bg-white"
        value={task.status}
        onChange={(event) =>
          onChangeState?.(task, event.target.value)
        }
        title="Zmień status"
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="blocked">Blocked</option>
        <option value="done">Done</option>
      </select>
    </>
  );
}

function CardActions({ task, onEdit, onDuplicate, onDelete }) {
  return (
    <div className="mt-2 flex gap-2 text-xs">
      <button
        onClick={() => onEdit(task)}
        className="px-2 py-1 rounded bg-slate-100"
      >
        Edytuj
      </button>
      <button
        onClick={() => onDuplicate(task)}
        className="px-2 py-1 rounded bg-slate-100"
      >
        Duplikuj
      </button>
      <button
        onClick={() => onDelete(task)}
        className="px-2 py-1 rounded bg-red-50 text-red-600"
      >
        Usuń
      </button>
    </div>
  );
}

function CardMeta({ task, onChangeState }) {
  return (
    <div className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-2">
      <span className="px-2 py-0.5 rounded-full bg-slate-100">
        {task.type}
      </span>
      {renderPriority(task)}
      {renderDeadline(task)}
      {renderTags(task)}
      <StatusSelect task={task} onChangeState={onChangeState} />
    </div>
  );
}

export default function Card({
  task,
  onEdit,
  onDuplicate,
  onDelete,
  onChangeState,
  draggableProps,
}) {
  return (
    <div
      className="bg-white rounded-xl shadow p-3 border hover:shadow-md cursor-grab"
      {...draggableProps}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="opacity-40 shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{task.title}</div>
          <CardMeta task={task} onChangeState={onChangeState} />
        </div>
      </div>

      <CardActions
        task={task}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  );
}
