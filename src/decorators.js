// Decorator - deklaracja

function normalizeTags(arr) {
  const a = (arr ?? [])
    .map(x => String(x || "").trim())
    .filter(Boolean);
  return Array.from(new Set(a));
}

export function togglePinned(task) {
  const pinned = !Boolean(task?.meta?.pinned);
  return {
    ...task,
    meta: { ...(task.meta || {}), pinned, icon: task?.meta?.icon ?? "circle" },
  };
}

export function addTags(task, tags) {
  const current = normalizeTags(task?.meta?.tags);
  const next = normalizeTags([...(current || []), ...[].concat(tags || [])]);
  return {
    ...task,
    meta: { ...(task.meta || {}), tags: next, icon: task?.meta?.icon ?? "circle" },
  };
}

export function removeTag(task, tagToRemove) {
  const next = normalizeTags(task?.meta?.tags).filter(t => t !== tagToRemove);
  return {
    ...task,
    meta: { ...(task.meta || {}), tags: next, icon: task?.meta?.icon ?? "circle" },
  };
}

export function setTags(task, tagsArray) {
  return {
    ...task,
    meta: { ...(task.meta || {}), tags: normalizeTags(tagsArray), icon: task?.meta?.icon ?? "circle" },
  };
}
