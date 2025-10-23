// src/kanban/Card.jsx
import { CalendarDays, Star, GripVertical } from "lucide-react";
import { STATE_LABEL, STATE_BADGE } from "../state/config";

export default function Card({ task, onEdit, onDuplicate, onDelete, onChangeState, draggableProps }) {
  const badge = STATE_BADGE[task.status] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-xl shadow p-3 border hover:shadow-md cursor-grab" {...draggableProps}>
      <div className="flex items-start gap-2">
        <GripVertical className="opacity-40 shrink-0" />
        <div className="flex-1">
          <div className="font-medium">{task.title}</div>

          <div className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-2">
            {/* Typ/atrybuty */}
            <span className="px-2 py-0.5 rounded-full bg-slate-100">{task.type}</span>
            {task.type === "priority" && (<span className="inline-flex items-center gap-1"><Star size={14}/>P{task.meta?.priority}</span>)}
            {task.type === "deadline" && (<span className="inline-flex items-center gap-1"><CalendarDays size={14}/>{new Date(task.meta?.due).toLocaleString()}</span>)}
            {task.meta?.tags?.length ? (<span>#{task.meta.tags.join(", #")}</span>) : null}

            {/* Status (State) */}
            <span className={`px-2 py-0.5 rounded-full ${badge}`}>{STATE_LABEL[task.status] || task.status}</span>

            {/* Zmiana stanu */}
            <select
              className="ml-2 border rounded-lg px-2 py-0.5 bg-white"
              value={task.status}
              onChange={(e) => onChangeState?.(task, e.target.value)}
              title="Zmień status"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2 text-xs">
        <button onClick={() => onEdit(task)} className="px-2 py-1 rounded bg-slate-100">Edytuj</button>
        <button onClick={() => onDuplicate(task)} className="px-2 py-1 rounded bg-slate-100">Duplikuj</button>
        <button onClick={() => onDelete(task)} className="px-2 py-1 rounded bg-red-50 text-red-600">Usuń</button>
      </div>
    </div>
  );
}
