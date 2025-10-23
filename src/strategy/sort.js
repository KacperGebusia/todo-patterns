// src/strategy/sort.js
// [PATTERN: Strategy] — strategie sortowania

function isPinned(t){ return Boolean(t?.meta?.pinned); }
function cmpPinned(a,b){ return Number(isPinned(b)) - Number(isPinned(a)); }
function byCreatedDesc(a,b){ return (b.createdAt || 0) - (a.createdAt || 0); }
function safeTitle(t){ return String(t?.title || ""); }
function getPriority(t){ return Number(t?.meta?.priority ?? 0); }
function getDue(tsk){
  const d = tsk?.meta?.due ? new Date(tsk.meta.due).getTime() : NaN;
  return Number.isFinite(d) ? d : Number.POSITIVE_INFINITY; // brak terminu -> na koniec
}
function getOrder(t){ return Number.isFinite(t?.order) ? t.order : 0; }

const comparators = {
  // Standardowy widok Kanban: utrzymuj kolejność 'order' w obrębie kolumny
  kanbanOrder(a,b){
    const pin = cmpPinned(a,b); if (pin) return pin;
    const o = getOrder(a) - getOrder(b); if (o) return o;
    return byCreatedDesc(a,b);
  },
  // Używany wcześniej w wynikach: pinned -> najnowsze
  pinnedCreatedDesc(a,b){
    const pin = cmpPinned(a,b); if (pin) return pin;
    return byCreatedDesc(a,b);
  },
  // Termin najbliższy pierwszy, brak terminu na końcu
  dueAsc(a,b){
    const pin = cmpPinned(a,b); if (pin) return pin;
    const d = getDue(a) - getDue(b); if (d) return d;
    return byCreatedDesc(a,b);
  },
  // Priorytet malejąco (5..1)
  priorityDesc(a,b){
    const pin = cmpPinned(a,b); if (pin) return pin;
    const p = getPriority(b) - getPriority(a); if (p) return p;
    return byCreatedDesc(a,b);
  },
  // Alfabetycznie po tytule
  titleAsc(a,b){
    const pin = cmpPinned(a,b); if (pin) return pin;
    return safeTitle(a).localeCompare(safeTitle(b), undefined, { sensitivity: "base" });
  },
};

export const SORT_STRATEGIES = [
  { key: "kanbanOrder",       label: "Kanban (order)" },
  { key: "pinnedCreatedDesc", label: "Pinned → Najnowsze" },
  { key: "dueAsc",            label: "Termin ↑" },
  { key: "priorityDesc",      label: "Priorytet ↓" },
  { key: "titleAsc",          label: "Tytuł A→Z" },
];

export function getComparator(key){
  return comparators[key] || comparators.kanbanOrder;
}
