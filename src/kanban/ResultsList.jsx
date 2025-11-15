// src/kanban/ResultsList.jsx
// Płaska lista wyników (poza tablicą Kanban), z paginacją przez Iterator

import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Star,
  Trash2,
  Copy,
  Pencil,
} from "lucide-react";

function renderPriorityMeta(task) {
  if (task.type !== "priority") return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Star size={14} />
      P{task.meta?.priority}
    </span>
  );
}

function renderDeadlineMeta(task) {
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

function renderTagsMeta(task) {
  const tags = task.meta?.tags || [];
  if (!tags.length) return null;
  return <span>#{tags.join(", #")}</span>;
}

function ResultRow({ task, onEdit, onDuplicate, onDelete }) {
  return (
    <li className="bg-white rounded-xl border p-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="font-medium">{task.title}</div>
        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-100">
            {task.type}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100">
            {task.status}
          </span>
          {renderPriorityMeta(task)}
          {renderDeadlineMeta(task)}
          {renderTagsMeta(task)}
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onDuplicate(task)}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center"
        >
          <Copy />
        </button>
        <button
          onClick={() => onEdit(task)}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center"
        >
          <Pencil />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-red-600 inline-flex items-center justify-center"
        >
          <Trash2 />
        </button>
      </div>
    </li>
  );
}

export default function ResultsList({
  page,
  pageCount,
  total,
  items,
  onPrev,
  onNext,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const paginationState = useMemo(
    () => ({
      canPrev: page > 1,
      canNext: page < pageCount,
    }),
    [page, pageCount]
  );

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-500">
        Wyniki: {total} • Strona {page}/{pageCount}
      </div>

      <ul className="space-y-2">
        {items.map((task) => (
          <ResultRow
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <button
          disabled={!paginationState.canPrev}
          onClick={onPrev}
          className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Wstecz
        </button>
        <button
          disabled={!paginationState.canNext}
          onClick={onNext}
          className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-2"
        >
          Dalej <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
