// Prototype - deklaracja

export function cloneTask(task, overrides = {}) {
  const copy = (typeof structuredClone === "function")
    ? structuredClone(task)
    : JSON.parse(JSON.stringify(task));

  copy.id = crypto.randomUUID();
  copy.createdAt = Date.now();

  if (!("title" in overrides)) {
    copy.title = (task.title || "Untitled") + " (copy)";
  }

  Object.assign(copy, overrides);
  return copy;
}
