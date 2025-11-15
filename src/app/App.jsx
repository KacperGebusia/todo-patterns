// src/app/App.jsx
// Wzorce: Factory • Singleton • Builder • Prototype • Facade • Decorator • Bridge
// Command • Memento • Interpreter • Iterator • State • Strategy • Mediator • DIP • ISP

import { useEffect, useState } from "react";
import { Database, RotateCcw, RotateCw, SortAsc } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { commandBus } from "../command";
import Board from "../kanban/Board";
import { SORT_STRATEGIES } from "../strategy/sort";
import { SAVE_STRATEGY_OPTIONS } from "../strategy/save";
import { uiBus } from "../mediator/UIBus";

// DIP: wstrzykiwanie repozytorium, notyfikatora i eksportera
import { dipContainer } from "../dip/wiring";
// ISP: wąskie interfejsy i segregacja
import { closeAllInStatus, exportDoneAs } from "../isp/wiring";

// ===== magic number → stała =====
const TOAST_LIFETIME_MS = 2600;

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const off = uiBus.on("TOAST", ({ type = "info", message }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, message }]);

      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, TOAST_LIFETIME_MS);
    });

    return off;
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

export default function App() {
  const { backend, lastError, ready, todoStore } = useStore();
  const [view] = useState("board");
  const [can, setCan] = useState({ canUndo: false, canRedo: false });
  const [sortKey, setSortKey] = useState("kanbanOrder");
  const [saveKey, setSaveKey] = useState("immediate");

  useEffect(() => {
    const off = commandBus.onChange(setCan);

    const onKey = (event) => {
      const ctrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (ctrl && key === "z") {
        event.preventDefault();
        commandBus.undo();
      }
      if (ctrl && key === "y") {
        event.preventDefault();
        commandBus.redo();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      off();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  async function handleSaveStrategyChange(value) {
    setSaveKey(value);
    await todoStore.setSaveStrategy(value);

    const label =
      SAVE_STRATEGY_OPTIONS.find((option) => option.key === value)?.label ||
      value;

    uiBus.emit("TOAST", {
      type: "info",
      message: `Zapis: ${label}`,
    });
  }

  // DIP actions
  async function closeInProgress() {
    await dipContainer.usecases.completeAllInStatus("in_progress");
  }

  async function exportDoneCsv() {
    const file = await dipContainer.usecases.exportDone();
    const blob = new Blob([file.data], { type: file.mime });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = file.filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  // ISP actions
  async function closeBlockedIsp() {
    await closeAllInStatus("blocked");
  }

  async function exportDoneJsonIsp() {
    const file = await exportDoneAs("json");
    const blob = new Blob([file.data], { type: file.mime });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = file.filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-white">
        {/* Backend (Bridge) */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Database size={16} />
          <span>Backend:</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={backend}
            onChange={(event) => todoStore.setBackend(event.target.value)}
          >
            <option value="localStorage">localStorage</option>
            <option value="memory">memory</option>
            <option value="mockApi">mockApi</option>
          </select>
          {!ready && (
            <span className="text-slate-400">(ładowanie...)</span>
          )}
        </div>

        {/* Sort (Strategy) */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <SortAsc size={16} />
          <span>Sortuj:</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            {SORT_STRATEGIES.map((strategy) => (
              <option key={strategy.key} value={strategy.key}>
                {strategy.label}
              </option>
            ))}
          </select>
        </div>

        {/* Save Strategy */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span>Zapis:</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={saveKey}
            onChange={(event) => handleSaveStrategyChange(event.target.value)}
          >
            {SAVE_STRATEGY_OPTIONS.map((strategy) => (
              <option key={strategy.key} value={strategy.key}>
                {strategy.label}
              </option>
            ))}
          </select>
        </div>

        {/* DIP buttons */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <button
            onClick={closeInProgress}
            className="px-2 py-1 rounded-lg border bg-white text-sm"
            title="Zamknij wszystkie karty w kolumnie In Progress"
          >
            Zamknij In Progress
          </button>
          <button
            onClick={exportDoneCsv}
            className="px-2 py-1 rounded-lg border bg-white text-sm"
            title="Eksportuj ukończone karty do CSV"
          >
            Eksport DONE (CSV)
          </button>
        </div>

        {/* ISP buttons */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <button
            onClick={closeBlockedIsp}
            className="px-2 py-1 rounded-lg border bg-white text-sm"
            title="Zamknij wszystkie karty w kolumnie Blocked (ISP)"
          >
            Zamknij Blocked (ISP)
          </button>
          <button
            onClick={exportDoneJsonIsp}
            className="px-2 py-1 rounded-lg border bg-white text-sm"
            title="Eksportuj ukończone karty w JSON (ISP)"
          >
            Eksport DONE JSON (ISP)
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="ml-auto flex items-center gap-2">
          <button
            disabled={!can.canUndo}
            onClick={() => commandBus.undo()}
            className="px-2 py-1 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-1 text-sm"
            title="Cofnij (Ctrl/Cmd+Z)"
          >
            <RotateCcw size={16} /> Cofnij
          </button>
          <button
            disabled={!can.canRedo}
            onClick={() => commandBus.redo()}
            className="px-2 py-1 rounded-lg border bg-white disabled:opacity-50 inline-flex items-center gap-1 text-sm"
            title="Ponów (Ctrl/Cmd+Y)"
          >
            <RotateCw size={16} /> Ponów
          </button>
        </div>

        {lastError && (
          <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200">
            Błąd persystencji: {String(lastError.message || lastError)}
          </div>
        )}
      </div>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Kanban – Wzorce projektowe
        </h1>
        <p className="text-slate-500">
          Factory • Singleton • Builder • Prototype • Facade • Decorator •
          Bridge • Interpreter • Iterator • State • Command • Memento •
          Strategy • Mediator • DIP • ISP
        </p>
        <div className="mt-6">
          {view === "board" && <Board sortKey={sortKey} />}
        </div>
      </main>

      <ToastHost />
    </div>
  );
}
