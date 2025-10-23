// src/kanban/Board.jsx
import { useMemo, useState } from "react";
import Column from "./Column";
import Composer from "./Composer";
import EditModal from "./EditModal";
import SearchBar from "./SearchBar";
import ResultsList from "./ResultsList";

import { useStore } from "../store/StoreContext";
import { TaskFactory } from "../domain/factory";
import { cloneTask } from "../prototype";

import { lex } from "../interpreter/lexer";
import { parse } from "../interpreter/parser";
import { evaluate } from "../interpreter/evaluator";
import { TaskIterator } from "../iterator/TaskIterator";

const PAGE_SIZE = 12; // ile wyników na stronę

export default function Board(){
  const { tasks, todoStore } = useStore();
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // =============== WYSZUKIWARKA (Interpreter) ===============
  const predicate = useMemo(() => {
    try {
      const tokens = lex(query);
      const ast = parse(tokens);
      return evaluate(ast); // (task)=>boolean
    } catch {
      return () => true;
    }
  }, [query]);

  // sort: pinned zawsze na górze, potem najnowsze
  const sortDefault = (a, b) => {
    const pa = Number(Boolean(b?.meta?.pinned)) - Number(Boolean(a?.meta?.pinned));
    if (pa !== 0) return pa;
    return (b.createdAt || 0) - (a.createdAt || 0);
  };

  // ====== widok wyników (gdy query != "") ======
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return [...tasks].filter(predicate).sort(sortDefault);
  }, [tasks, query, predicate]);

  const iterator = useMemo(() => new TaskIterator(results, { pageSize: PAGE_SIZE }), [results]);
  const pageData = useMemo(() => iterator.getPage(page), [iterator, page]);

  // ====== widok kanban (gdy query == "") ======
  const byStatus = (s) => tasks
    .filter(t => (t.status ?? (t.completed ? "done" : "todo")) === s)
    .sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));

  // ============================================

  async function onDropCard(id, status, toIndex){
    await todoStore.moveCard(id, status, toIndex);
  }

  async function onDuplicate(task){
    const copy = TaskFactory.fromJSON(cloneTask(task));
    await todoStore.createIn(task.status ?? "todo", copy);
  }

  async function onDelete(task){ await todoStore.remove(task.id); }
  function onEdit(task){ setEditing(task); }

  // reset strony po zmianie zapytania
  function handleQuery(newQ){
    setQuery(newQ);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Dodawanie kart (zawsze dostępne) */}
      <Composer />

      {/* Pasek wyszukiwania */}
      <SearchBar initial={query} onQuery={handleQuery} />

      {/* Gdy jest zapytanie — pokazuj listę wyników z paginacją */}
      {query.trim() ? (
        <ResultsList
          items={pageData.items}
          page={pageData.page}
          pageCount={pageData.pageCount}
          total={pageData.total}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(pageData.pageCount, p + 1))}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ) : (
        // W przeciwnym razie standardowy Kanban:
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Column title="To Do"        status="todo"        tasks={byStatus("todo")}        onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
          <Column title="In Progress"  status="in_progress" tasks={byStatus("in_progress")} onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
          <Column title="Blocked"      status="blocked"     tasks={byStatus("blocked")}     onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
          <Column title="Done"         status="done"        tasks={byStatus("done")}        onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}/>
        </div>
      )}

      {/* Modal edycji */}
      <EditModal task={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
