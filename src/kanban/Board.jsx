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

// ===== POMOCNICZE HOOKI / FUNKCJE =====

function useSafeTasksFromStore() {
  const { tasks } = useStore();
  return Array.isArray(tasks) ? tasks : [];
}

function useQueryFromMediator() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsubscribe = uiBus.on("SET_QUERY", ({ query }) => {
      setQuery(query ?? "");
      setPage(1);
    });
    return unsubscribe;
  }, []);

  return { query, page, setPage };
}

function useTaskSearchResults(safeTasks, query, sortKey) {
  const comparator = useMemo(
    () => getComparator(sortKey),
    [sortKey]
  );

  const predicate = useMemo(() => {
    try {
      const tokens = lex(query);
      const ast = parse(tokens);
      return evaluate(ast);
    } catch {
      return () => true;
    }
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return [...safeTasks].filter(predicate).sort(comparator);
  }, [safeTasks, query, predicate, comparator]);

  return { comparator, searchResults };
}

function usePaginatedResults(results, page, pageSize) {
  const iterator = useMemo(
    () => new TaskIterator(results, { pageSize }),
    [results, pageSize]
  );

  const pageData = useMemo(
    () => iterator.getPage(page),
    [iterator, page]
  );

  return pageData;
}

function getTasksByStatus(safeTasks, status, comparator) {
  return safeTasks
    .filter((task) => {
      const rawStatus =
        task.status ?? (task.completed ? "done" : "todo");
      return rawStatus === status;
    })
    .sort(comparator);
}

// ===== KOMPONENT GŁÓWNY =====

export default function Board({ sortKey = "kanbanOrder" }) {
  const safeTasks = useSafeTasksFromStore();
  const { query, page, setPage } = useQueryFromMediator();
  const { comparator, searchResults } = useTaskSearchResults(
    safeTasks,
    query,
    sortKey
  );
  const pageData = usePaginatedResults(
    searchResults,
    page,
    PAGE_SIZE
  );

  async function handleDropCard(taskId, status, targetIndex) {
    await commandBus.execute(
      new MoveCardCommand(taskId, status, targetIndex)
    );
    await commandBus.execute(
      new UpdateTaskCommand(taskId, () => ({
        completed: status === "done",
      }))
    );
  }

  async function handleDuplicate(task) {
    const clonedTask = TaskFactory.fromJSON(cloneTask(task));
    const targetStatus = task.status ?? "todo";
    await commandBus.execute(
      new CreateInCommand(targetStatus, clonedTask)
    );
    uiBus.emit("TOAST", {
      type: "success",
      message: "Zduplikowano kartę",
    });
  }

  async function handleDelete(task) {
    await commandBus.execute(
      new RemoveTaskCommand(task.id)
    );
    uiBus.emit("TOAST", {
      type: "info",
      message: "Usunięto kartę",
    });
  }

  function handleEdit(task) {
    uiBus.emit("OPEN_EDIT", { task });
  }

  async function handleChangeState(task, targetState) {
    if (!canTo(task.status, targetState)) return;

    const patchedTask = transitionTo(task, targetState);

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

  function handlePrevPage() {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }

  function handleNextPage(pageCount) {
    setPage((currentPage) =>
      Math.min(pageCount, currentPage + 1)
    );
  }

  const showSearchResults = Boolean(query.trim());

  return (
    <div className="space-y-6">
      <Composer />
      <SearchBar />

      {showSearchResults ? (
        <ResultsList
          items={pageData.items}
          page={pageData.page}
          pageCount={pageData.pageCount}
          total={pageData.total}
          onPrev={handlePrevPage}
          onNext={() => handleNextPage(pageData.pageCount)}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Column
            title="To Do"
            status="todo"
            tasks={getTasksByStatus(
              safeTasks,
              "todo",
              comparator
            )}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
          <Column
            title="In Progress"
            status="in_progress"
            tasks={getTasksByStatus(
              safeTasks,
              "in_progress",
              comparator
            )}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
          <Column
            title="Blocked"
            status="blocked"
            tasks={getTasksByStatus(
              safeTasks,
              "blocked",
              comparator
            )}
            onDropCard={handleDropCard}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onChangeState={handleChangeState}
          />
          <Column
            title="Done"
            status="done"
            tasks={getTasksByStatus(
              safeTasks,
              "done",
              comparator
            )}
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
