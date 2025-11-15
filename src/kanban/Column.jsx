// src/kanban/Column.jsx

import Card from "./Card";

function preventDefaultDragOver(event) {
  event.preventDefault();
}

function parseDragPayload(payload) {
  const safePayload = payload || "";
  const [taskId, indexString] = safePayload.split("|");
  const index = Number(indexString);
  return { taskId, index };
}

function getDropIndex(tasks, parsedIndex) {
  if (Number.isFinite(parsedIndex)) {
    return parsedIndex;
  }
  return tasks.length;
}

export default function Column({
  title,
  status,
  tasks,
  onDropCard,
  onEdit,
  onDuplicate,
  onDelete,
  onChangeState,
}) {
  function handleDrop(event) {
    const payload = event.dataTransfer.getData("text/plain");
    const { taskId, index } = parseDragPayload(payload);
    const dropIndex = getDropIndex(tasks, index);
    onDropCard(taskId, status, dropIndex);
  }

  return (
    <div
      className="bg-slate-50 rounded-2xl p-3 border w-full min-h-[200px]"
      onDragOver={preventDefaultDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-slate-500">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <Card
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onChangeState={onChangeState}
            draggableProps={{
              draggable: true,
              onDragStart: (event) =>
                event.dataTransfer.setData(
                  "text/plain",
                  `${task.id}|${index}`
                ),
            }}
          />
        ))}
      </div>
    </div>
  );
}
