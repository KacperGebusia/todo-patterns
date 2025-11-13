// src/kanban/ResultsList.jsx
// Płaska lista wyników z paginacją (Iterator)

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

// =====================
// GŁÓWNY KOMPONENT
// =====================

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
  const pager = usePager(page, pageCount);

  return (
    <div className="space-y-3">
      <Summary
        total={total}
        page={page}
        pageCount={pageCount}
      />

      <ul className="space-y-2">
        {items.map((task) => (
          <Row
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </ul>

      <PagerControls
        canPrev={pager.canPrev}
        canNext={pager.canNext}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}

// =====================
// PODKOMPONENTY
// =====================

function Summary({ total, page, pageCount }) {
  return (
    <div className="text-sm text-slate-500">
      Wyniki: {total} • Strona {page}/
      {pageCount}
    </div>
  );
}

function Row({ task, onEdit, onDuplicate, onDelete }) {
  const handleEdit = () => onEdit(task);
  const handleDuplicate = () => onDuplicate(task);
  const handleDelete = () => onDelete(task);

  return (
    <li className="bg-white rounded-xl border p-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="font-medium">
          {task.title}
        </div>

        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-100">
            {task.type}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100">
            {task.status}
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
        </div>
      </div>

      <div className="flex gap-1">
        <IconButton onClick={handleDuplicate}>
          <Copy />
        </IconButton>
        <IconButton onClick={handleEdit}>
          <Pencil />
        </IconButton>
        <IconButton
          onClick={handleDelete}
          className="text-red-600"
        >
          <Trash2 />
        </IconButton>
      </div>
    </li>
  );
}

function IconButton({ onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center ${
        className || ""
      }`}
    >
      {children}
    </button>
  );
}

function PagerControls({
  canPrev,
  canNext,
  onPrev,
  onNext,
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        disabled={!canPrev}
        onClick={onPrev}
        className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Wstecz
      </button>
      <button
        disabled={!canNext}
        onClick={onNext}
        className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-2"
      >
        Dalej <ArrowRight size={16} />
      </button>
    </div>
  );
}

// =====================
// HOOKI / UTILS
// =====================

function usePager(page, pageCount) {
  return useMemo(
    () => ({
      canPrev: page > 1,
      canNext: page < pageCount,
    }),
    [page, pageCount]
  );
}

function formatDeadline(rawDate) {
  if (!rawDate) return "";
  const date = new Date(rawDate);
  return date.toLocaleString();
}
