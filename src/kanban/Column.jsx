// Kolumna Kanban (minimalny DnD)
import Card from "./Card";
export default function Column({ title, status, tasks, onDropCard, onEdit, onDuplicate, onDelete }) {
  function onDragOver(e){ e.preventDefault(); }
  function onDrop(e){
    const payload = e.dataTransfer.getData("text/plain"); // "id|index"
    const [id, indexStr] = (payload||"").split("|");
    const toIndex = Number(indexStr);
    onDropCard(id, status, Number.isFinite(toIndex) ? toIndex : tasks.length);
  }
  return (
    <div className="bg-slate-50 rounded-2xl p-3 border w-full min-h-[200px]" onDragOver={onDragOver} onDrop={onDrop}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-slate-500">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((t, i) => (
          <Card key={t.id} task={t} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}
            draggableProps={{ draggable: true, onDragStart: (e) => e.dataTransfer.setData("text/plain", `${t.id}|${i}`) }}
          />
        ))}
      </div>
    </div>
  );
}
