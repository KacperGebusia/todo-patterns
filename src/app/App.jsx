// src/app/App.jsx
// Wzorce: Factory • Singleton • Builder • Prototype • Facade • Decorator • Bridge
// Command • Memento • Interpreter • Iterator • State • Strategy • Mediator • DIP • ISP

import { useEffect, useState } from "react";
import {
  Database,
  RotateCcw,
  RotateCw,
  SortAsc,
} from "lucide-react";

import { useStore } from "../store/StoreContext";
import { commandBus } from "../command";
import Board from "../kanban/Board";
import { SORT_STRATEGIES } from "../strategy/sort";
import { SAVE_STRATEGY_OPTIONS } from "../strategy/save";
import { uiBus } from "../mediator/UIBus";

// DIP
import { dipContainer } from "../dip/wiring";
// ISP
import {
  closeAllInStatus,
  exportDoneAs,
} from "../isp/wiring";

// =====================
// Helpers
// =====================

function downloadFile(fileDescriptor) {
  if (!fileDescriptor) return;
  const blob = new Blob(
    [fileDescriptor.data],
    { type: fileDescriptor.mime }
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileDescriptor.filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function getSaveStrategyLabel(key) {
  const option = SAVE_STRATEGY_OPTIONS.find(
    (strategy) => strategy.key === key
  );
  return option?.label || key;
}

// =====================
// Toasts (Mediator)
// =====================

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast({ type = "info", message }) {
      const id = crypto.randomUUID();
      setToasts((current) => [
        ...current,
        { id, type, message },
      ]);
      setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id)
        );
      }, 2600);
    }

    const unsubscribe = uiBus.on("TOAST", handleToast);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-3 py-2 rounded-xl shadow border bg-white text-sm"
        >
          <span
            className={
              toast.type === "error"
                ? "text-red-600"
                : toast.type === "success"
                ? "text-green-600"
                : "text-slate-700"
            }
          >
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}

// =====================
// Toolbar sub-komponenty
// =====================

function BackendSelector({ backend, ready, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <Database size={16} />
      <span>Backend:</span>
      <select
        className="border rounded-lg px-2 py-1 text-sm"
        value={backend}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="localStorage">localStorage</option>
        <option value="memory">memory</option>
        <option value="mockApi">mockApi</option>
      </select>
      {!ready && (
        <span className="text-slate-400">
          (ładowanie...)
        </span>
      )}
    </div>
  );
}

function SortSelector({ sortKey, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <SortAsc size={16} />
      <span>Sortuj:</span>
      <select
        className="border rounded-lg px-2 py-1 text-sm"
        value={sortKey}
        onChange={(event) => onChange(event.target.value)}
      >
        {SORT_STRATEGIES.map((strategy) => (
          <option
            key={strategy.key}
            value={strategy.key}
          >
            {strategy.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SaveStrategySelector({
  saveKey,
  onChange,
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span>Zapis:</span>
      <select
        className="border rounded-lg px-2 py-1 text-sm"
        value={saveKey}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {SAVE_STRATEGY_OPTIONS.map((strategy) => (
          <option
            key={strategy.key}
            value={strategy.key}
          >
            {strategy.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DipActions({
  onCloseInProgress,
  onExportDoneCsv,
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <button
        onClick={onCloseInProgress}
        className="px-2 py-1 rounded-lg border bg-white text-sm"
        title="Zamknij wszystkie karty w kolumnie In Progress"
      >
        Zamknij In Progress
      </button>
      <button
        onClick={onExportDoneCsv}
        className="px-2 py-1 rounded-lg border bg-white text-sm"
        title="Eksportuj ukończone karty do CSV"
      >
        Eksport DONE (CSV)
      </button>
    </div>
  );
}

function IspActions({
  onCloseBlocked,
  onExportDoneJson,
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <button
        onClick={onCloseBlocked}
        className="px-2 py-1 rounded-lg border bg-white text-sm"
        title="Zamknij wszystkie karty w kolumnie Blocked (ISP)"
      >
        Zamknij Blocked (ISP)
      </button>
      <button
        onClick={onExportDoneJson}
        className="px-2 py-1 rounded-lg border bg-white text-sm"
        title="Eksportuj ukończone karty w JSON (ISP)"
      >
        Eksport DONE JSON (ISP)
      </button>
    </div>
  );
}

function UndoRedoControls({ canUndo, canRedo }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        disabled={!canUndo}
        onClick={() => commandBus.undo()}
        className="px-2 py-1 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-1 text-sm"
        title="Cofnij (Ctrl/Cmd+Z)"
      >
        <RotateCcw size={16} /> Cofnij
      </button>
      <button
        disabled={!canRedo}
        onClick={() => commandBus.redo()}
        className="px-2 py-1 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-1 text-sm"
        title="Ponów (Ctrl/Cmd+Y)"
      >
        <RotateCw size={16} /> Ponów
      </button>
    </div>
  );
}

function ErrorBanner({ lastError }) {
  if (!lastError) return null;

  const message =
    lastError?.message || String(lastError);

  return (
    <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200">
      Błąd persystencji: {message}
    </div>
  );
}

// =====================
// Hook: skróty klawiaturowe
// =====================

function useUndoRedoShortcuts() {
  useEffect(() => {
    function handleKeyDown(event) {
      const hasModifier =
        event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (!hasModifier) return;

      if (key === "z") {
        event.preventDefault();
        commandBus.undo();
      }

      if (key === "y") {
        event.preventDefault();
        commandBus.redo();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );
    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);
}

// =====================
// Główny komponent App
// =====================

export default function App() {
  const { backend, lastError, ready, todoStore } =
    useStore();

  const [historyState, setHistoryState] = useState({
    canUndo: false,
    canRedo: false,
  });

  const [sortKey, setSortKey] =
    useState("kanbanOrder");
  const [saveKey, setSaveKey] =
    useState("immediate");

  const [view] = useState("board");

  useUndoRedoShortcuts();

  useEffect(() => {
    const unsubscribe =
      commandBus.onChange(setHistoryState);
    return unsubscribe;
  }, []);

  async function handleSaveStrategyChange(key) {
    setSaveKey(key);
    await todoStore.setSaveStrategy(key);

    const label = getSaveStrategyLabel(key);
    uiBus.emit("TOAST", {
      type: "info",
      message: `Zapis: ${label}`,
    });
  }

  // ===== DIP actions =====

  async function handleCloseInProgress() {
    await dipContainer.usecases.completeAllInStatus(
      "in_progress"
    );
  }

  async function handleExportDoneCsv() {
    const file =
      await dipContainer.usecases.exportDone();
    downloadFile(file);
  }

  // ===== ISP actions =====

  async function handleCloseBlockedIsp() {
    await closeAllInStatus("blocked");
  }

  async function handleExportDoneJsonIsp() {
    const file = await exportDoneAs("json");
    downloadFile(file);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-white">
        <BackendSelector
          backend={backend}
          ready={ready}
          onChange={(value) =>
            todoStore.setBackend(value)
          }
        />

        <SortSelector
          sortKey={sortKey}
          onChange={setSortKey}
        />

        <SaveStrategySelector
          saveKey={saveKey}
          onChange={handleSaveStrategyChange}
        />

        <DipActions
          onCloseInProgress={
            handleCloseInProgress
          }
          onExportDoneCsv={
            handleExportDoneCsv
          }
        />

        <IspActions
          onCloseBlocked={
            handleCloseBlockedIsp
          }
          onExportDoneJson={
            handleExportDoneJsonIsp
          }
        />

        <UndoRedoControls
          canUndo={historyState.canUndo}
          canRedo={historyState.canRedo}
        />

        <ErrorBanner lastError={lastError} />
      </div>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Kanban – Wzorce projektowe
        </h1>
        <p className="text-slate-500">
          Factory • Singleton • Builder • Prototype •
          Facade • Decorator • Bridge • Interpreter •
          Iterator • State • Command • Memento •
          Strategy • Mediator • DIP • ISP
        </p>
        <div className="mt-6">
          {view === "board" && (
            <Board sortKey={sortKey} />
          )}
        </div>
      </main>

      <ToastHost />
    </div>
  );
}
