// src/interpreter/evaluator.js
// Tworzy funkcję predykatu: (task) => boolean
// Obsługuje: tag, status, type, pinned, before, after + frazy tekstowe

// =====================
// API (poziom najwyższy)
// =====================

export function evaluate(ast) {
  if (!ast || ast.length === 0) {
    return () => true;
  }

  const predicates = buildPredicatesFromAst(ast);

  return (task) =>
    predicates.every((predicate) => predicate(task));
}

// =====================
// Poziom średni: AST → lista predykatów
// =====================

function buildPredicatesFromAst(ast) {
  return ast
    .map(createPredicateFromNode)
    .filter((predicate) => typeof predicate === "function");
}

function createPredicateFromNode(node) {
  if (node.kind === "kv") {
    return createPredicateFromKeyValueNode(node);
  }
  if (node.kind === "text") {
    return createTextPredicate(node.value);
  }
  return null;
}

function createPredicateFromKeyValueNode(node) {
  const { key, value } = node;

  if (key === "tag") {
    return createTagPredicate(value);
  }
  if (key === "status") {
    return createStatusPredicate(value);
  }
  if (key === "type") {
    return createTypePredicate(value);
  }
  if (key === "pinned") {
    return createPinnedPredicate(value);
  }
  if (key === "before" || key === "after") {
    return createBoundaryDatePredicate(key, value);
  }

  return createUnknownKeyPredicate(key, value);
}

// =====================
// Poziom niski: konkretne predykaty
// =====================

function createTagPredicate(tagValue) {
  return (task) => {
    const tags = task?.meta?.tags || [];
    return tags.some((tag) =>
      includesCaseInsensitive(tag, tagValue)
    );
  };
}

function createStatusPredicate(statusValue) {
  const normalizedStatus = String(statusValue).toLowerCase();

  return (task) => {
    const rawStatus =
      task?.status || (task?.completed ? "done" : "todo");
    return (
      String(rawStatus).toLowerCase() === normalizedStatus
    );
  };
}

function createTypePredicate(typeValue) {
  const normalizedType = String(typeValue).toLowerCase();

  return (task) =>
    String(task?.type || "").toLowerCase() === normalizedType;
}

function createPinnedPredicate(rawValue) {
  const shouldBePinned = /^(true|1|yes|tak)$/i.test(
    String(rawValue)
  );

  return (task) =>
    Boolean(task?.meta?.pinned) === shouldBePinned;
}

function createBoundaryDatePredicate(kind, rawValue) {
  const boundaryDate = parseLooseDateString(rawValue);
  if (!boundaryDate) return null;

  if (kind === "before") {
    return (task) =>
      getTaskComparableDate(task) < boundaryDate;
  }

  if (kind === "after") {
    return (task) =>
      getTaskComparableDate(task) > boundaryDate;
  }

  return null;
}

function createUnknownKeyPredicate(key, value) {
  const phrase = `${key}:${value}`;
  return (task) =>
    includesCaseInsensitive(task?.title, phrase);
}

function createTextPredicate(phrase) {
  return (task) =>
    includesCaseInsensitive(task?.title, phrase);
}

// =====================
// Poziom najniższy: pomocnicze utility
// =====================

function parseLooseDateString(rawText) {
  if (!rawText) return null;

  const isYmdOnly = /^\d{4}-\d{2}-\d{2}$/.test(rawText);
  if (isYmdOnly) {
    return new Date(`${rawText}T00:00:00`);
  }

  const parsedDate = new Date(rawText);
  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function getTaskComparableDate(task) {
  if (task?.meta?.due) {
    return new Date(task.meta.due);
  }
  return new Date(task?.createdAt || 0);
}

function includesCaseInsensitive(haystack, needle) {
  const normalizedHaystack = String(haystack || "").toLowerCase();
  const normalizedNeedle = String(needle || "").toLowerCase();
  return normalizedHaystack.includes(normalizedNeedle);
}
