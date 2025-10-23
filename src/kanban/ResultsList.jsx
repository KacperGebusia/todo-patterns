// Płaska lista wyników (poza tablicą Kanban), z paginacją przez Iterator
import { useMemo } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Star, Trash2, Copy, Pencil } from "lucide-react";

function Row({ t, onEdit, onDuplicate, onDelete }) {
  return (
    <li className="bg-white rounded-xl border p-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="font-medium">{t.title}</div>
        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-100">{t.type}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100">{t.status}</span>
          {t.type === "priority" && (
            <span className="inline-flex items-center gap-1"><Star size={14}/>P{t.meta?.priority}</span>
          )}
          {t.type === "deadline" && (
            <span className="inline-flex items-center gap-1"><CalendarDays size={14}/>{new Date(t.meta?.due).toLocaleString()}</span>
          )}
          {t.meta?.tags?.length ? <span>#{t.meta.tags.join(", #")}</span> : null}
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={()=> onDuplicate(t)} className="w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center"><Copy/></button>
        <button onClick={()=> onEdit(t)} className="w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center"><Pencil/></button>
        <button onClick={()=> onDelete(t)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-red-600 inline-flex items-center justify-center"><Trash2/></button>
      </div>
    </li>
  );
}

export default function ResultsList({ page, pageCount, total, items, onPrev, onNext, onEdit, onDuplicate, onDelete }) {
  const pager = useMemo(() => ({
    canPrev: page > 1,
    canNext: page < pageCount
  }), [page, pageCount]);

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-500">
        Wyniki: {total} • Strona {page}/{pageCount}
      </div>
      <ul className="space-y-2">
        {items.map(t => (
          <Row key={t.id} t={t} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
        ))}
      </ul>
      <div className="flex justify-end gap-2">
        <button disabled={!pager.canPrev} onClick={onPrev} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-2">
          <ArrowLeft size={16}/> Wstecz
        </button>
        <button disabled={!pager.canNext} onClick={onNext} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-2">
          Dalej <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}
