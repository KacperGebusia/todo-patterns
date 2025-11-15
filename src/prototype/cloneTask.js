// [PATTERN: Prototype] — deklaracja i narzędzia do klonowania zadań

// --- POMOCNICZE FUNKCJE (jedna odpowiedzialność każda) ---

function deepCloneObject(obj) {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

function assignNewTaskId(task) {
  task.id = crypto.randomUUID();
  return task;
}

function assignNewCreationTimestamp(task) {
  task.createdAt = Date.now();
  return task;
}

function applyDefaultCopyTitle(task, overrides) {
  const overrideHasTitle = Object.prototype.hasOwnProperty.call(overrides, "title");
  if (overrideHasTitle) {
    return task; // tytuł zostanie ustawiony później przez overrides
  }
  const baseTitle = task.title || "Untitled";
  task.title = `${baseTitle} (copy)`;
  return task;
}

function applyOverrides(task, overrides) {
  return Object.assign(task, overrides);
}


// --- PUBLICZNA FUNKCJA PROTOTYPE (jedna odpowiedzialność: orkiestracja) ---

/**
 * Tworzy kopię zadania na podstawie istniejącego egzemplarza (Prototype).
 * Resetuje ID, timestamp, tytuł i stosuje overrides.
 */
export function cloneTask(originalTask, overrides = {}) {
  const clone = deepCloneObject(originalTask);

  assignNewTaskId(clone);
  assignNewCreationTimestamp(clone);
  applyDefaultCopyTitle(clone, overrides);

  return applyOverrides(clone, overrides);
}
