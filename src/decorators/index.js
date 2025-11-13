// =======================================================================
//  [PATTERN: DECORATOR]
//  Dekoratory operujące na obiektach Task – wszystkie zwracają nową kopię
//  taska (nie mutują oryginału).
// =======================================================================

// =======================================================================
//  Normatyzacja tagów (pomocnicza – SRP: czyści i deduplikuje listę tagów)
// =======================================================================
function normalizeTags(arr) {
  const safe = Array.isArray(arr) ? arr : [];

  // SRP: konwersja do tekstu + trim
  const cleaned = safe
    .map(t => String(t || "").trim())
    .filter(Boolean);

  // SRP: deduplikacja
  return Array.from(new Set(cleaned));
}

// =======================================================================
//  Helper: zawsze ustaw ikonę jeśli jej brak (SRP: pojedyncza odpowiedzialność)
// =======================================================================
function ensureIcon(task) {
  return task?.meta?.icon ?? "circle";
}

// =======================================================================
//  Dekorator 1: togglePinned
//  SRP: tylko przełącza flagę pinned i zachowuje ikonę
// =======================================================================
export function togglePinned(task) {
  const pinned = !Boolean(task?.meta?.pinned);

  return {
    ...task,
    meta: {
      ...(task.meta || {}),
      pinned,
      icon: ensureIcon(task)
    }
  };
}

// =======================================================================
//  Dekorator 2: addTags
//  SRP: tylko dodaje tagi (bez duplikatów i brudnych wartości)
// =======================================================================
export function addTags(task, tags) {
  const current = normalizeTags(task?.meta?.tags);
  const toAdd = normalizeTags(tags);

  const nextTags = normalizeTags([...current, ...toAdd]);

  return {
    ...task,
    meta: {
      ...(task.meta || {}),
      tags: nextTags,
      icon: ensureIcon(task)
    }
  };
}

// =======================================================================
//  Dekorator 3: removeTag
//  SRP: tylko usuwa jeden tag
// =======================================================================
export function removeTag(task, tag) {
  const current = normalizeTags(task?.meta?.tags);
  const next = current.filter(t => t !== tag);

  return {
    ...task,
    meta: {
      ...(task.meta || {}),
      tags: next,
      icon: ensureIcon(task)
    }
  };
}

// =======================================================================
//  Dekorator 4: setTags
//  SRP: całkowicie nadpisuje listę tagów (bez łączenia z poprzednimi)
// =======================================================================
export function setTags(task, tagsArray) {
  const next = normalizeTags(tagsArray);

  return {
    ...task,
    meta: {
      ...(task.meta || {}),
      tags: next,
      icon: ensureIcon(task)
    }
  };
}
