// src/kanban/Board.jsx
// Wzorce: Interpreter • Iterator • State(FSM) • Command+Memento
// Prototype • Factory • Strategy(sort) • Mediator

// Zad 1
// + Functional Interfaces (TaskPredicate) użyte z wyrażeniem lambda

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

// Funkcyjne interfejsy – użycie TaskPredicate z wyrażeniem lambda
import { filterTasks } from "../fn/TaskFunctions";

const PAGE_SIZE = 12;

// =====================
// GŁÓWNY KOMPONENT (wysoki poziom)
// =====================

export default function Board({ sortKey = "kanbanOrder" }) {
  const { tasks } = useStore();
  const safeTasks = useSafeTasks(tasks);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useSyncQueryWithMediator(setQuery, setPage);

  const comparator = useMemo(
    () => getComparator(sortKey),
    [sortKey]
  );

  const predicate = useSearchPredicate(query);
  const searchResults = useSearchResults(
    safeTasks,
    query,
    predicate,
    comparator
  );
  const pageData = usePagedResults(searchResults, page);

  const getColumnTasks = (status) =>
    filterTasksByStatus(
      safeTasks,
      status,
      comparator
    );

  const handleDropCard = async (id, status, toIndex) => {
    await moveCardAndUpdateCompletion(
      id,
      status,
      toIndex
    );
  };

  const handleDuplicate = async (task) => {
    await duplicateTask(task);
  };

  const handleDelete = async (task) => {
    await deleteTask(task);
  };

  const handleEdit = (task) => {
    openEditModal(task);
  };

  const handleChangeState = async (task, toState) => {
    await changeTaskState(task, toState);
  };

  const handlePrevPage = () =>
    setPage((prev) => Math.max(1, prev - 1));

  const handleNextPage = () =>
    setPage((prev) =>
      Math.min(pageData.pageCount, prev + 1)
    );

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
          onPrev={handlePrevPage}
          onNext={handleNextPage}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Column
            title="To Do"
            status="todo"
            tasks={getColumnTasks("todo")}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
          <Column
            title="In Progress"
            status="in_progress"
            tasks={getColumnTasks("in_progress")}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
          <Column
            title="Blocked"
            status="blocked"
            tasks={getColumnTasks("blocked")}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
          <Column
            title="Done"
            status="done"
            tasks={getColumnTasks("done")}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
        </div>
      )}

      {/* EditModal nie dostaje propsów – słucha Mediatora */}
      <EditModal />
    </div>
  );
}

// =====================
// HOOKI / POZIOM ŚREDNI
// =====================

function useSafeTasks(tasks) {
  return Array.isArray(tasks) ? tasks : [];
}

function useSyncQueryWithMediator(setQuery, setPage) {
  useEffect(() => {
    const unsubscribe = uiBus.on(
      "SET_QUERY",
      ({ query }) => {
        setQuery(query ?? "");
        setPage(1);
      }
    );
    return unsubscribe;
  }, [setQuery, setPage]);
}

function useSearchPredicate(query) {
  return useMemo(() => {
    try {
      return evaluate(parse(lex(query)));
    } catch {
      return () => true;
    }
  }, [query]);
}

function useSearchResults(
  tasks,
  query,
  predicate,
  comparator
) {
  return useMemo(() => {
    if (!query.trim()) return [];
    const sorted = [...tasks].filter(predicate);
    sorted.sort(comparator);
    return sorted;
  }, [tasks, query, predicate, comparator]);
}

function usePagedResults(results, page) {
  return useMemo(() => {
    const iterator = new TaskIterator(results, {
      pageSize: PAGE_SIZE,
    });
    return iterator.getPage(page);
  }, [results, page]);
}

// =====================
// OPERACJE NA TASK / COMMAND + STATE (średni poziom)
// =====================

async function moveCardAndUpdateCompletion(
  taskId,
  status,
  toIndex
) {
  await commandBus.execute(
    new MoveCardCommand(taskId, status, toIndex)
  );
  await commandBus.execute(
    new UpdateTaskCommand(taskId, () => ({
      completed: status === "done",
    }))
  );
}

async function duplicateTask(task) {
  const cloned = cloneTask(task);
  const instance = TaskFactory.fromJSON(cloned);
  const targetStatus = task.status ?? "todo";

  await commandBus.execute(
    new CreateInCommand(targetStatus, instance)
  );

  uiBus.emit("TOAST", {
    type: "success",
    message: "Zduplikowano kartę",
  });
}

async function deleteTask(task) {
  await commandBus.execute(
    new RemoveTaskCommand(task.id)
  );
  uiBus.emit("TOAST", {
    type: "info",
    message: "Usunięto kartę",
  });
}

function openEditModal(task) {
  uiBus.emit("OPEN_EDIT", { task });
}

async function changeTaskState(task, toState) {
  if (!canTo(task.status, toState)) return;

  const patchedTask = transitionTo(task, toState);

  await commandBus.execute(
    new MoveCardCommand(
      task.id,
      patchedTask.status,
      Number.MAX_SAFE_INTEGER
    )
  );

  await commandBus.execute(
    new UpdateTaskCommand(task.id, {
      completed: patchedTask.completed,
    })
  );
}

// =====================
// UTILS (najniższy poziom)
// =====================

function filterTasksByStatus(
  tasks,
  status,
  comparator
) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Funkcyjny interfejs TaskPredicate + wyrażenie lambda:
  // (task) => task.status === status
  const normalized = safeTasks.map((task) =>
    normalizeTaskStatus(task)
  );

  const filtered = filterTasks(
    normalized,
    (task) => task.status === status
  );

  return filtered.sort(comparator);
}

function normalizeTaskStatus(task) {
  const status =
    task.status ||
    (task.completed ? "done" : "todo");
  return { ...task, status };
}
