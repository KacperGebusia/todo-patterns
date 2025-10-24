// src/kanban/Board.jsx
// Wzorce: Interpreter • Iterator • State(FSM) • Command+Memento • Prototype • Factory • Strategy(sort) • Mediator

import { useEffect, useMemo, useState } from "react";
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

import { canTo, transitionTo } from "../state/TaskStateMachine";
import { getComparator } from "../strategy/sort";

import {
  commandBus,
  CreateInCommand,
  RemoveTaskCommand,
  MoveCardCommand,
  UpdateTaskCommand,
} from "../command";
import { uiBus } from "../mediator/UIBus";

const PAGE_SIZE = 12;

export default function Board({ sortKey = "kanbanOrder" }) {
  const { tasks } = useStore();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Mediator: słuchaj zmian zapytania z SearchBar (SET_QUERY)
  useEffect(() => {
    const off = uiBus.on("SET_QUERY", ({ query }) => {
      setQuery(query ?? "");
      setPage(1);
    });
    return off;
  }, []);

  const comparator = useMemo(() => getComparator(sortKey), [sortKey]);

  // === Interpreter ===
  const predicate = useMemo(() => {
    try { return evaluate(parse(lex(query))); } catch { return () => true; }
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return [...safeTasks].filter(predicate).sort(comparator);
  }, [safeTasks, query, predicate, comparator]);

  // === Iterator ===
  const iterator = useMemo(() => new TaskIterator(results, { pageSize: PAGE_SIZE }), [results]);
  const pageData = useMemo(() => iterator.getPage(page), [iterator, page]);

  // === Kanban (widok) ===
  const byStatus = (s) =>
    safeTasks
      .filter((t) => (t.status ?? (t.completed ? "done" : "todo")) === s)
      .sort(comparator);

  // === Command + Memento + FSM ===
  async function onDropCard(id, status, toIndex) {
    await commandBus.execute(new MoveCardCommand(id, status, toIndex));
    await commandBus.execute(new UpdateTaskCommand(id, () => ({ completed: status === "done" })));
  }

  async function onDuplicate(task) {
    const copy = TaskFactory.fromJSON(cloneTask(task));
    await commandBus.execute(new CreateInCommand(task.status ?? "todo", copy));
    uiBus.emit("TOAST", { type: "success", message: "Zduplikowano kartę" });
  }

  async function onDelete(task) {
    await commandBus.execute(new RemoveTaskCommand(task.id));
    uiBus.emit("TOAST", { type: "info", message: "Usunięto kartę" });
  }

  function onEdit(task) {
    uiBus.emit("OPEN_EDIT", { task }); // zamiast lokalnego state
  }

  async function onChangeState(task, toState) {
    if (!canTo(task.status, toState)) return;
    const patched = transitionTo(task, toState);
    await commandBus.execute(new MoveCardCommand(task.id, patched.status, Number.MAX_SAFE_INTEGER));
    await commandBus.execute(new UpdateTaskCommand(task.id, { completed: patched.completed }));
  }

  return (
    <div className="space-y-6">
      <Composer />
      <SearchBar />

      {query.trim() ? (
        <ResultsList
          items={pageData.items}
          page={pageData.page}
          pageCount={pageData.pageCount}
          total={pageData.total}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pageData.pageCount, p + 1))}
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

      {/* EditModal nie dostaje propsów – słucha Mediatora */}
      <EditModal />
    </div>
  );
}
