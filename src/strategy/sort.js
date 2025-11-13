// src/strategy/sort.js
// [PATTERN: Strategy] — strategie sortowania zadań

// --- Funkcje pomocnicze — pojedyncza odpowiedzialność ---

function taskIsPinned(task) {
  return Boolean(task?.meta?.pinned);
}

function comparePinnedFirst(taskA, taskB) {
  return Number(taskIsPinned(taskB)) - Number(taskIsPinned(taskA));
}

function compareCreatedAtDesc(taskA, taskB) {
  const createdA = taskA?.createdAt || 0;
  const createdB = taskB?.createdAt || 0;
  return createdB - createdA;
}

function getTaskTitle(task) {
  return String(task?.title || "");
}

function getTaskPriority(task) {
  return Number(task?.meta?.priority ?? 0);
}

function getTaskDueTimestamp(task) {
  const rawDate = task?.meta?.due;
  if (!rawDate) {
    // brak terminu -> sortuj na końcu
    return Number.POSITIVE_INFINITY;
  }
  const timestamp = new Date(rawDate).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
}

function getTaskOrderIndex(task) {
  const orderIndex = task?.order;
  return Number.isFinite(orderIndex) ? orderIndex : 0;
}

// --- Strategia sortowania: mapowanie klucza na komparator ---

const TASK_COMPARATORS = {
  // Standardowy widok Kanban: pinned -> kolejność 'order' -> najnowsze
  kanbanOrder(taskA, taskB) {
    const pinnedCompare = comparePinnedFirst(taskA, taskB);
    if (pinnedCompare) return pinnedCompare;

    const orderCompare =
      getTaskOrderIndex(taskA) - getTaskOrderIndex(taskB);
    if (orderCompare) return orderCompare;

    return compareCreatedAtDesc(taskA, taskB);
  },

  // Pinned → najnowsze (bez order)
  pinnedCreatedDesc(taskA, taskB) {
    const pinnedCompare = comparePinnedFirst(taskA, taskB);
    if (pinnedCompare) return pinnedCompare;

    return compareCreatedAtDesc(taskA, taskB);
  },

  // Termin najbliższy pierwszy, brak terminu na końcu
  dueAsc(taskA, taskB) {
    const pinnedCompare = comparePinnedFirst(taskA, taskB);
    if (pinnedCompare) return pinnedCompare;

    const dueCompare =
      getTaskDueTimestamp(taskA) - getTaskDueTimestamp(taskB);
    if (dueCompare) return dueCompare;

    return compareCreatedAtDesc(taskA, taskB);
  },

  // Priorytet malejąco (5..1)
  priorityDesc(taskA, taskB) {
    const pinnedCompare = comparePinnedFirst(taskA, taskB);
    if (pinnedCompare) return pinnedCompare;

    const priorityCompare =
      getTaskPriority(taskB) - getTaskPriority(taskA);
    if (priorityCompare) return priorityCompare;

    return compareCreatedAtDesc(taskA, taskB);
  },

  // Alfabetycznie po tytule
  titleAsc(taskA, taskB) {
    const pinnedCompare = comparePinnedFirst(taskA, taskB);
    if (pinnedCompare) return pinnedCompare;

    return getTaskTitle(taskA).localeCompare(
      getTaskTitle(taskB),
      undefined,
      { sensitivity: "base" }
    );
  },
};

// Publiczna lista strategii (wykorzystywana w UI)
export const SORT_STRATEGIES = [
  { key: "kanbanOrder",       label: "Kanban (order)" },
  { key: "pinnedCreatedDesc", label: "Pinned → Najnowsze" },
  { key: "dueAsc",            label: "Termin ↑" },
  { key: "priorityDesc",      label: "Priorytet ↓" },
  { key: "titleAsc",          label: "Tytuł A→Z" },
];

// Zwraca komparator na podstawie klucza strategii
export function getComparator(sortKey) {
  return TASK_COMPARATORS[sortKey] || TASK_COMPARATORS.kanbanOrder;
}
