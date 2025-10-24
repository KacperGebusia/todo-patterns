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

import { canTo, transitionTo } from "../state/TaskStateMachine"; // <- FSM

const PAGE_SIZE = 12;

export default function Board(){
  const { tasks, todoStore } = useStore();
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // ---------- Interpreter ----------
  const predicate = useMemo(() => {
    try { return evaluate(parse(lex(query))); } catch { return () => true; }
  }, [query]);

  const sortDefault = (a, b) => {
    const pa = Number(Boolean(b?.meta?.pinned)) - Number(Boolean(a?.meta?.pinned));
    if (pa !== 0) return pa;
    return (b.createdAt || 0) - (a.createdAt || 0);
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return [...tasks].filter(predicate).sort(sortDefault);
  }, [tasks, query, predicate]);

  const iterator = useMemo(() => new TaskIterator(results, { pageSize: PAGE_SIZE }), [results]);
  const pageData = useMemo(() => iterator.getPage(page), [iterator, page]);

  // ---------- Kanban ----------
  const byStatus = (s) => tasks
    .filter(t => (t.status ?? (t.completed ? "done" : "todo")) === s)
    .sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));

  async function onDropCard(id, status, toIndex){
    await todoStore.moveCard(id, status, toIndex);
    // moveCard nie dotyka "completed" — dopnijmy to tutaj:
    await todoStore.update(id, (t) => ({ completed: (status === "done") }));
  }

  async function onDuplicate(task){
    const copy = TaskFactory.fromJSON(cloneTask(task));
    await todoStore.createIn(task.status ?? "todo", copy);
  }

  async function onDelete(task){ await todoStore.remove(task.id); }
  function onEdit(task){ setEditing(task); }

  // ---------- FSM: zmiana stanu z dropdownu ----------
  async function onChangeState(task, toState){
    if (!canTo(task.status, toState)) return;       // strażnik FSM
    const patched = transitionTo(task, toState);    // tworzy nowy obiekt z poprawnym stanem + completed
    // przesuń kartę do docelowej kolumny (na koniec)
    await todoStore.moveCard(task.id, patched.status, Number.MAX_SAFE_INTEGER);
    // ustaw completed zgodnie z FSM
    await todoStore.update(task.id, { completed: patched.completed });
  }

  function handleQuery(newQ){ setQuery(newQ); setPage(1); }

  return (
    <div className="space-y-6">
      <Composer />
      <SearchBar initial={query} onQuery={handleQuery} />

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Column title="To Do"        status="todo"        tasks={byStatus("todo")}        onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onChangeState={onChangeState}/>
          <Column title="In Progress"  status="in_progress" tasks={byStatus("in_progress")} onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onChangeState={onChangeState}/>
          <Column title="Blocked"      status="blocked"     tasks={byStatus("blocked")}     onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onChangeState={onChangeState}/>
          <Column title="Done"         status="done"        tasks={byStatus("done")}        onDropCard={onDropCard} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onChangeState={onChangeState}/>
        </div>
      )}

      <EditModal task={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
