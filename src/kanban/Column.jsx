// src/kanban/Column.jsx

// Zad 7 jeden poziom abstrakcji (top to bottom)
// handledrop - tylko przechwytuje event i deleguje na małe funkcje


import Card from "./Card";

// =====================
// GŁÓWNY KOMPONENT
// =====================

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
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const payload =
      event.dataTransfer.getData("text/plain");
    const { id, index } =
      parseDragPayload(payload);

    const targetIndex = Number.isFinite(index)
      ? index
      : tasks.length;

    onDropCard(id, status, targetIndex);
  };

  return (
    <div
      className="bg-slate-50 rounded-2xl p-3 border w-full min-h-[200px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Header title={title} count={tasks.length} />
      <CardsList
        tasks={tasks}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onChangeState={onChangeState}
      />
    </div>
  );
}

// =====================
// PODKOMPONENTY
// =====================

function Header({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold">{title}</h3>
      <span className="text-xs text-slate-500">
        {count}
      </span>
    </div>
  );
}

function CardsList({
  tasks,
  onEdit,
  onDuplicate,
  onDelete,
  onChangeState,
}) {
  return (
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
              handleDragStart(event, task.id, index),
          }}
        />
      ))}
    </div>
  );
}

// =====================
// UTILS
// =====================

function handleDragStart(event, id, index) {
  event.dataTransfer.setData(
    "text/plain",
    `${id}|${index}`
  );
}

function parseDragPayload(payload) {
  const [id, indexString] = String(
    payload || ""
  ).split("|");

  const indexValue = Number(indexString);
  return {
    id,
    index: Number.isFinite(indexValue)
      ? indexValue
      : NaN,
  };
}
