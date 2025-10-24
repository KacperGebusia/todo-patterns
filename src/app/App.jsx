// src/app/App.jsx
// Wzorce: Bridge • Strategy(sort/save) • Command + Memento • Observer (Context)

import { useEffect, useState } from "react";
import { Database, RotateCcw, RotateCw, SortAsc } from "lucide-react";
import { useStore } from "../store/StoreContext";
import { commandBus } from "../command";
import Board from "../kanban/Board";
import { SORT_STRATEGIES } from "../strategy/sort";
import { SAVE_STRATEGY_OPTIONS } from "../strategy/save";

export default function App() {
  const { backend, lastError, ready, todoStore } = useStore();
  const [view] = useState("board");
  const [can, setCan] = useState({ canUndo: false, canRedo: false });

  // Strategy(sort): wybrane klucze
  const [sortKey, setSortKey] = useState("kanbanOrder");
  // Strategy(save): nie trzymamy w stanie nazwy z store, wystarczy lokalny select
  const [saveKey, setSaveKey] = useState("immediate");

  useEffect(() => {
    const off = commandBus.onChange(setCan);
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "z") { e.preventDefault(); commandBus.undo(); }
      if (ctrl && e.key.toLowerCase() === "y") { e.preventDefault(); commandBus.redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { off(); window.removeEventListener("keydown", onKey); };
  }, []);

  async function handleSaveStrategyChange(val){
    setSaveKey(val);
    await todoStore.setSaveStrategy(val);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* === Toolbar === */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b bg-white">
        {/* Backend (Bridge) */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Database size={16} />
          <span>Backend:</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={backend}
            onChange={(e) => todoStore.setBackend(e.target.value)}
          >
            <option value="localStorage">localStorage</option>
            <option value="memory">memory</option>
            <option value="mockApi">mockApi</option>
          </select>
          {!ready && <span className="text-slate-400">(ładowanie...)</span>}
        </div>

        {/* Sort (Strategy) */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <SortAsc size={16} />
          <span>Sortuj:</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            {SORT_STRATEGIES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Save Strategy */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span>Zapis:</span>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={saveKey}
            onChange={(e) => handleSaveStrategyChange(e.target.value)}
          >
            {SAVE_STRATEGY_OPTIONS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Undo/Redo */}
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

      {/* === Główna zawartość === */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Kanban – Wzorce projektowe</h1>
        <p className="text-slate-500">
          Factory • Singleton • Builder • Prototype • Facade • Decorator • Bridge •
          Interpreter • Iterator • State • Command • Memento • Strategy
        </p>

        <div className="mt-6">
          {view === "board" && <Board sortKey={sortKey} />}
        </div>
      </main>
    </div>
  );
}
