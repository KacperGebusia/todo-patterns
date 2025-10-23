// Widok Kanban (kompozycja)
// [PATTERN: Prototype] — UŻYCIE (duplikacja)
// [PATTERN: Singleton/Observer] — UŻYCIE (useStore)

import { useState } from "react";
import Column from "./Column";
import Composer from "./Composer";
import EditModal from "./EditModal";
import { useStore } from "../store/StoreContext";
import { TaskFactory } from "../domain/factory";
import { cloneTask } from "../prototype";

export default function Board(){
  const { tasks, todoStore } = useStore();
  const [editing, setEditing] = useState(null);

  const byStatus = (s) => tasks
    .filter(t => (t.status ?? (t.completed ? "done" : "todo")) === s)
    .sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));

  async function onDropCard(id, status, toIndex){ await todoStore.moveCard(id, status, toIndex); }
  async function onDuplicate(task){ const copy = TaskFactory.fromJSON(cloneTask(task)); await todoStore.createIn(task.status ?? "todo", copy); }
  async function onDelete(task){ await todoStore.remove(task.id); }
  function onEdit(task){ setEditing(task); }

  return (
    <div className="space-y-6">
      <Composer />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Column title="To Do"        status="todo"        tasks={byStatus("todo")}        onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
        <Column title="In Progress"  status="in_progress" tasks={byStatus("in_progress")} onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
        <Column title="Blocked"      status="blocked"     tasks={byStatus("blocked")}     onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
        <Column title="Done"         status="done"        tasks={byStatus("done")}        onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
      </div>
      <EditModal task={editing} onClose={() => setEditing(null)} />
    </div>
  );
}