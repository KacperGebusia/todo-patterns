// Tworzy funkcję predykatu: (task) => boolean
// Obsługuje: tag, status, type, pinned, before, after + frazy tekstowe

function parseDateLoose(s) {
  // YYYY-MM-DD / YYYY-MM-DDTHH:mm (lokalnie -> Date UTC)
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00");
  // zostaw Date interpretacji przeglądarki dla reszty
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function getComparableDate(task) {
  if (task?.meta?.due) return new Date(task.meta.due);
  return new Date(task.createdAt || 0);
}

function includesCI(hay, needle) {
  return String(hay || "").toLowerCase().includes(String(needle || "").toLowerCase());
}

export function evaluate(ast) {
  if (!ast || ast.length === 0) {
    return () => true;
  }

  const checks = [];

  for (const node of ast) {
    if (node.kind === "kv") {
      const k = node.key;
      const v = node.value;

      if (k === "tag") {
        checks.push(task => (task?.meta?.tags || []).some(t => includesCI(t, v)));
      } else if (k === "status") {
        const val = String(v).toLowerCase();
        checks.push(task => String(task?.status || (task?.completed ? "done" : "todo")).toLowerCase() === val);
      } else if (k === "type") {
        const val = String(v).toLowerCase();
        checks.push(task => String(task?.type).toLowerCase() === val);
      } else if (k === "pinned") {
        const want = /^(true|1|yes|tak)$/i.test(String(v));
        checks.push(task => Boolean(task?.meta?.pinned) === want);
      } else if (k === "before" || k === "after") {
        const d = parseDateLoose(v);
        if (d) {
          if (k === "before") checks.push(task => getComparableDate(task) < d);
          if (k === "after")  checks.push(task => getComparableDate(task) > d);
        }
      } else {
        // nieznany klucz: traktuj jako tekst
        checks.push(task => includesCI(task?.title, `${k}:${v}`));
      }
    } else if (node.kind === "text") {
      const phrase = node.value;
      checks.push(task => includesCI(task?.title, phrase));
    }
  }

  // AND wszystkich warunków
  return (task) => checks.every(fn => fn(task));
}
